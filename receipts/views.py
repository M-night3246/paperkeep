from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from main.utils import *
from .utils import *
from main.models import FinancialDocument, LineItem, SystemSpendingCategory, UserSpendingCategory
from django.core.files.storage import FileSystemStorage
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from main.serializers import FinancialDocumentSerializer
from .utils import ocr_text_surya, llm_extract
from main.utils import to_python_from_html_datetime

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
            except Exception as e:
                result_entry['status'] = 'failed'
                result_entry['error'] = 'Invalid image file'
                results.append(result_entry)
                continue
            
            # OCR and LLM extraction
            text = ocr_text_surya(image)
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
                    user_cats = UserSpendingCategory.objects.filter(user=request.user, system_category=system_cat)
                    # TODO: Change the user spending category to nothing
                    if user_cats.exists():
                        user_cat = user_cats.first()  # Or handle the ambiguity as needed
                    else:
                        user_cat = UserSpendingCategory.objects.create(
                            user=request.user,
                            system_category=system_cat,
                            name=system_cat.default_name
                        )

                    # Build line item payload
                    processed_line_items.append({
                        'item': item.get('item', '') or '',
                        'price': item.get('price', 0) or 0,
                        'category_id': user_cat.id,
                    })
                except SystemSpendingCategory.DoesNotExist:
                    continue  

            # Prepare data for serializer
            image_file.seek(0)
            data = {
                'user_id': request.user.id,
                'image': image_file,
                'business_name': extracted_data.get('business_name', '') or '',
                'business_address': extracted_data.get('business_address', '') or '',
                'transaction_datetime': extracted_data.get('transaction_datetime', ''),
                'total_amount': extracted_data.get('total_amount', 0),
                'line_items': processed_line_items,
            }

            serializer = FinancialDocumentSerializer(data=data)
            if serializer.is_valid():
                doc = serializer.save()
                result_entry['status'] = 'success'
                result_entry['document'] = FinancialDocumentSerializer(doc).data
            else:
                result_entry['status'] = 'failed'
                result_entry['error'] = {
                    'type': 'serializer_error',
                    'details': serializer.errors
                }
                
            results.append(result_entry)
            
        return Response(results, status=status.HTTP_207_MULTI_STATUS)
    
# class UploadFinancialDocumentAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         # The image file should be in request.FILES['image']
#         image_file = request.FILES.get('image')
#         if not image_file:
#             return Response({'error': 'Image file is required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             image = Image.open(image_file)
#         except Exception as e:
#             return Response({'error': 'Invalid image file'}, status=400)
        
#         # Save the uploaded image temporarily (if needed by OCR)
#         # fs = FileSystemStorage()
#         # image_path = fs.save(image.name, image)

#         # OCR and LLM extraction
#         text = ocr_text_surya(image)
#         extracted_data = llm_extract(text)
        
#         if 'error' in extracted_data:
#             return Response({'error': extracted_data['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         # === Match LLM categories to system & user categories ===
#         processed_line_items = []
#         for item in extracted_data.get('line_items', []):
#             category_name = item.get('category')
#             try:
#                 # Find system category
#                 system_cat = SystemSpendingCategory.objects.get(default_name__iexact=category_name.strip())

#                 # Get or create a user-specific category mapping
#                 user_cats = UserSpendingCategory.objects.filter(user=request.user, system_category=system_cat)
#                 if user_cats.exists():
#                     user_cat = user_cats.first()  # Or handle the ambiguity as needed
#                 else:
#                     user_cat = UserSpendingCategory.objects.create(
#                         user=request.user,
#                         system_category=system_cat,
#                         name=system_cat.default_name
#                     )

#                 # Build line item payload
#                 processed_line_items.append({
#                     'item': item.get('item', ''),
#                     'price': item.get('price', 0),
#                     'category_id': user_cat.id,
#                 })
#             except SystemSpendingCategory.DoesNotExist:
#                 continue  # skip unrecognized categories

#         # Prepare data for serializer
#         image_file.seek(0)
#         data = {
#             'user_id': request.user.id,
#             'image': image_file,
#             'business_name': extracted_data.get('business_name', ''),
#             'business_address': extracted_data.get('business_address', ''),
#             'transaction_datetime': extracted_data.get('transaction_datetime', ''),
#             'total_amount': extracted_data.get('total_amount', 0),
#             'line_items': processed_line_items,
#         }

#         serializer = FinancialDocumentSerializer(data=data)
#         if serializer.is_valid():
#             financial_document = serializer.save()
#             return Response(FinancialDocumentSerializer(financial_document).data, status=status.HTTP_201_CREATED)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FinancialDocumentDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, doc_id):
        financial_document = get_object_or_404(FinancialDocument, pk=doc_id, user=request.user)
        serializer = FinancialDocumentSerializer(financial_document)
        return Response(serializer.data)

    def put(self, request, doc_id):
        financial_document = get_object_or_404(FinancialDocument, pk=doc_id, user=request.user)
        serializer = FinancialDocumentSerializer(financial_document, data=request.data)
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

# def upload_financial_document(request):
#     # ONLY FOR TESTING REMOVE LATER
#     if not request.user.is_authenticated:
#         dummy_user, created = User.objects.get_or_create(
#             username='dummyuser',
#             defaults={'password': 'dummypassword', 'email': 'dummyuser@example.com'}
#         )
#         request.user = dummy_user
        
#     if request.method == 'POST' and request.FILES['image']:
#         image = request.FILES['image']
        
#         # Save the uploaded file
#         fs = FileSystemStorage()
#         image_path = fs.save(image.name, image)
        
#         # Process the image and extract data
#         text = ocr_text_surya(image_path)
#         json_data = llm_extract(text)
        
#         # Create the FinancialDocument instance
#         financial_document = FinancialDocument.objects.create(
#             user=request.user,
#             business_name=json_data.get('business_name', ''),
#             business_address=json_data.get('business_address', ''),
#             transaction_datetime=json_data.get('transaction_datetime', ''),
#             total_amount=json_data.get('total_amount', '')
#         )

#         # Create the LineItem instances
#         for line_item_data in json_data.get('line_items', []):
#             category, created = SpendingCategory.objects.get_or_create(name=line_item_data['category'])
#             LineItem.objects.create(
#                 financial_document=financial_document,
#                 item=line_item_data['item'] or '',
#                 price=line_item_data['price'] or 0,
#                 category=category or ''
#             )

#         # Redirect to the editable page (using financial_document.id to pass the document to the editable page)
#         return redirect('edit_financial_document', doc_id=financial_document.id)

#     return render(request, 'upload.html')

# def edit_financial_document(request, doc_id):
#     financial_document = get_object_or_404(FinancialDocument, pk=doc_id)
#     formatted_datetime = to_html_from_python_datetime(financial_document.transaction_datetime)

#     if request.method == 'POST':    
#         if "save_button" in request.POST:
            
#             # Handle the update of the financial document
#             financial_document.business_name = request.POST['business_name']
#             financial_document.business_address = request.POST['business_address']
#             financial_document.transaction_datetime = to_python_from_html_datetime(request.POST['transaction_datetime'])
#             financial_document.total_amount = request.POST['total_amount']
#             financial_document.save()

#             # Update line items
#             for line_item in financial_document.line_items.all():
#                 line_item.item = request.POST.get(f'item_{line_item.id}')
#                 line_item.price = request.POST.get(f'price_{line_item.id}')
#                 # Find or create category
#                 category_name = request.POST.get(f'category_{line_item.id}')
#                 category, created = SpendingCategory.objects.get_or_create(name=category_name)
#                 line_item.category = category
#                 line_item.save()

#             # Add new line items
#             if 'new_item' in request.POST and request.POST.get('new_item') != '':
#                 new_item = request.POST.get('new_item')
#                 new_price = request.POST.get('new_price')
#                 new_category_name = request.POST.get('new_category')
#                 category, created = SpendingCategory.objects.get_or_create(name=new_category_name)

#                 LineItem.objects.create(
#                     financial_document=financial_document,
#                     item=new_item,
#                     price=new_price,
#                     category=category
#                 )
            
#             request.session['business_address'] = financial_document.business_address
#             return redirect('update_heatmap')

#         # Handle line item removal
#         elif 'remove_item' in request.POST:
#             item_id_to_remove = request.POST.get('remove_item')
#             line_item_to_remove = get_object_or_404(LineItem, pk=item_id_to_remove)
#             line_item_to_remove.delete()

#         return redirect('edit_financial_document', doc_id=financial_document.id)

#     # Render the editable document page
#     return render(request, 'edit.html', {
#         'financial_document': financial_document,
#         'formatted_datetime': formatted_datetime,
#     })

# def delete_financial_document(request, transaction_id):
#     financial_document = get_object_or_404(FinancialDocument, id=transaction_id)
    
#     # if financial_document.user != request.user:
#     #     return HttpResponseForbidden("You are not authorized to delete this document.")
    
#     financial_document.delete()
    
#     return redirect('view_all_documents')
    
# def view_all_documents(request):
#     # ONLY FOR TESTING REMOVE LATER
#     if not request.user.is_authenticated:
#         dummy_user, created = User.objects.get_or_create(
#             username='dummyuser',
#             defaults={'password': 'dummypassword', 'email': 'dummyuser@example.com'}
#         )
#         request.user = dummy_user
        
#     documents = FinancialDocument.objects.filter(user=request.user)
    
#     context = {
#         'transactions': documents
#     }
    
#     return render(request, 'view_all.html', context)

# def transaction_list(request):
#     # ONLY FOR TESTING REMOVE LATER
#     if not request.user.is_authenticated:
#         dummy_user, created = User.objects.get_or_create(
#             username='dummyuser',
#             defaults={'password': 'dummypassword', 'email': 'dummyuser@example.com'}
#         )
#         request.user = dummy_user
    
#     transactions = FinancialDocument.objects.filter(user=request.user).order_by('-transaction_datetime')
    
#     context = {
#         'transactions': transactions
#     }
#     return render(request, 'transactions/transaction_list.html', context)

    
    
    