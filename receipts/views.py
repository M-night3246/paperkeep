
from django.http import JsonResponse, HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import  get_object_or_404
from main.serializers import FinancialDocumentSerializer
from main.models import FinancialDocument, SystemSpendingCategory, UserSpendingCategory
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from main.utils import *
from .utils import *
from datetime import datetime
import pytz
    
class UploadFinancialDocumentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # The image file should be in request.FILES['image']
        image_files = request.FILES.getlist('image')
        if not image_files:
            return Response({'error': 'At least one image file is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        results  = []
        
        for image_file in image_files:            
            result_entry = {'filename': image_file.name}
            
            try:
                image = Image.open(image_file)
                image_file.seek(0)
            except Exception as e:
                result_entry['status'] = 'failed'
                result_entry['error'] = 'Invalid image file'
                results.append(result_entry)
                continue
            
            # OCR and LLM extraction
            text = ocr_text_tesseract(image)
            extracted_data = llm_extract(text)
            
            if 'error' in extracted_data:
                result_entry['status'] = 'failed'
                result_entry['error'] = extracted_data['error']
                results.append(result_entry)
                continue

            # Match LLM categories to system & user categories
            processed_line_items = []
            for item in extracted_data.get('line_items', []):
                category_name = item.get('category')
                try:
                    # Find system category
                    system_cat = SystemSpendingCategory.objects.get(default_name__iexact=category_name.strip())

                    # Get or create a user-specific category mapping
                    user_cat = UserSpendingCategory.objects.get(
                        user=request.user,
                        system_category=system_cat,
                        name=system_cat.default_name,
                        is_main=True
                    )
                    
                    # Build line item payload
                    processed_line_items.append({
                        'item': item.get('item', '') or '',
                        'price': item.get('price', 0) or 0,
                        'category_id': user_cat.id,
                    })
                except SystemSpendingCategory.DoesNotExist:
                    continue
                except UserSpendingCategory.DoesNotExist:
                    result_entry['status'] = 'failed'
                    result_entry['error'] = f"No main category found for: {category_name}"
                    results.append(result_entry)
                    continue

            subtotal = extracted_data.get('subtotal', 0) or 0
            tax = extracted_data.get('tax', 0) or 0
            total_amount = extracted_data.get('total_amount', 0) or 0
            line_items_total = sum((item.get('price') or 0) for item in processed_line_items)

            note = []

            subtotal, total_amount, priority_warnings  = apply_priority_logic(subtotal, tax, total_amount, line_items_total)
            consistency_warnings = generate_consistency_warnings(subtotal, tax, total_amount, line_items_total, processed_line_items)
            note = "\n".join(priority_warnings + consistency_warnings)
            
            # Prepare data for serializer
            try:
                image_file.seek(0)
                image_url = upload_image_to_firebase(image_file)
                image_file.seek(0)
            except Exception as e:
                results.append({
                    "filename": image_file.name,
                    "status": "failed",
                    "error": {"type": "upload_error", "details": str(e)}
                })
                continue
            
            transaction_datetime = extracted_data.get('transaction_datetime', '')
            
            if (transaction_datetime):
                naive_dt = datetime.strptime(transaction_datetime, '%Y-%m-%d %H:%M:%S')
                malaysia_tz = pytz.timezone('Asia/Kuala_Lumpur')
                localized_dt = malaysia_tz.localize(naive_dt)
                utc_dt = localized_dt.astimezone(pytz.UTC)
                            
            data = {
                'user_id': request.user.id,
                'image': image_file,
                "image_url": image_url,
                'business_name': extracted_data.get('business_name', '') or '',
                'business_address': extracted_data.get('business_address', '') or '',
                'transaction_datetime': utc_dt,
                'subtotal': subtotal,
                'tax': tax,
                'total_amount': total_amount,
                'line_items': processed_line_items,
                'note': note,
            }
                
            serializer = FinancialDocumentSerializer(data=data)
            if serializer.is_valid():
                doc = serializer.save()
                result_entry['status'] = 'success'
                result_entry['document'] = FinancialDocumentSerializer(doc).data
                if note:
                    result_entry['note'] = note
            else:
                result_entry['status'] = 'failed'
                result_entry['error'] = {
                    'type': 'serializer_error',
                    'details': serializer.errors
                }
                
            results.append(result_entry)
            
        return Response(results, status=status.HTTP_207_MULTI_STATUS)

class FinancialDocumentDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, doc_id):
        financial_document = get_object_or_404(FinancialDocument, pk=doc_id, user=request.user)
        serializer = FinancialDocumentSerializer(financial_document)
        return Response(serializer.data)

    def put(self, request, doc_id):
        financial_document = get_object_or_404(FinancialDocument, pk=doc_id, user=request.user)
        serializer = FinancialDocumentSerializer(financial_document, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, doc_id):
        financial_document = get_object_or_404(FinancialDocument, pk=doc_id, user=request.user)
        financial_document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class FinancialDocumentListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        financial_documents = FinancialDocument.objects.filter(user=request.user).order_by('-transaction_datetime')
        serializer = FinancialDocumentSerializer(financial_documents, many=True)
        return Response(serializer.data)
    
class FinancialDocumentDownloadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, doc_id):
        financial_document = get_object_or_404(FinancialDocument, pk=doc_id, user=request.user)
        serializer = FinancialDocumentSerializer(financial_document)
        data = json.dumps(serializer.data, indent=2, cls=DjangoJSONEncoder)

        response = HttpResponse(data, content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename=financial-document-{doc_id}.json'
        return response

    