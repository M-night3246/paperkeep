from django.shortcuts import render, redirect, get_object_or_404
from .utils import *
from paperkeep.models import FinancialDocument, LineItem, SpendingCategory
from django.core.files.storage import FileSystemStorage
from django.contrib.auth.models import User

def upload_financial_document(request):
    # ONLY FOR TESTING REMOVE LATER
    if not request.user.is_authenticated:
        dummy_user, created = User.objects.get_or_create(
            username='dummyuser',
            defaults={'password': 'dummypassword', 'email': 'dummyuser@example.com'}
        )
        request.user = dummy_user
        
    if request.method == 'POST' and request.FILES['image']:
        image = request.FILES['image']
        
        # Save the uploaded file
        fs = FileSystemStorage()
        image_path = fs.save(image.name, image)
        
        # Process the image and extract data
        json_data = process_image_and_extract_data(image_path)
        
        # Create the FinancialDocument instance
        financial_document = FinancialDocument.objects.create(
            document_number=json_data.get('document_number'),
            user=request.user,
            business_name=json_data.get('business_name'),
            business_address=json_data.get('business_address'),
            transaction_datetime=json_data.get('transaction_datetime'),
            total_amount=json_data.get('total_amount')
        )

        # Create the LineItem instances
        for line_item_data in json_data.get('line_items', []):
            category, created = SpendingCategory.objects.get_or_create(name=line_item_data['category'])
            LineItem.objects.create(
                financial_document=financial_document,
                item=line_item_data['item'],
                price=line_item_data['price'],
                category=category
            )

        # Redirect to the editable page (using financial_document.id to pass the document to the editable page)
        return redirect('edit_financial_document', doc_id=financial_document.id)

    return render(request, 'upload.html')

def edit_financial_document(request, doc_id):
    financial_document = get_object_or_404(FinancialDocument, pk=doc_id)
    formatted_datetime = to_html_from_python_datetime(financial_document.transaction_datetime)

    if request.method == 'POST':    
        if "save_button" in request.POST:
            
            # Handle the update of the financial document
            financial_document.business_name = request.POST['business_name']
            financial_document.business_address = request.POST['business_address']
            financial_document.transaction_datetime = to_python_from_html_datetime(request.POST['transaction_datetime'])
            financial_document.total_amount = request.POST['total_amount']
            financial_document.save()

            # Update line items
            for line_item in financial_document.line_items.all():
                line_item.item = request.POST.get(f'item_{line_item.id}')
                line_item.price = request.POST.get(f'price_{line_item.id}')
                # Find or create category
                category_name = request.POST.get(f'category_{line_item.id}')
                category, created = SpendingCategory.objects.get_or_create(name=category_name)
                line_item.category = category
                line_item.save()

            # Add new line items
            if 'new_item' in request.POST and request.POST.get('new_item') != '':
                new_item = request.POST.get('new_item')
                new_price = request.POST.get('new_price')
                new_category_name = request.POST.get('new_category')
                category, created = SpendingCategory.objects.get_or_create(name=new_category_name)

                LineItem.objects.create(
                    financial_document=financial_document,
                    item=new_item,
                    price=new_price,
                    category=category
                )
            
            request.session['business_address'] = financial_document.business_address
            return redirect('update_heatmap')

        # Handle line item removal
        elif 'remove_item' in request.POST:
            item_id_to_remove = request.POST.get('remove_item')
            line_item_to_remove = get_object_or_404(LineItem, pk=item_id_to_remove)
            line_item_to_remove.delete()

        return redirect('edit_financial_document', doc_id=financial_document.id)

    # Render the editable document page
    return render(request, 'edit.html', {
        'financial_document': financial_document,
        'formatted_datetime': formatted_datetime,
    })
    
def view_all_documents(request):
    # ONLY FOR TESTING REMOVE LATER
    if not request.user.is_authenticated:
        dummy_user, created = User.objects.get_or_create(
            username='dummyuser',
            defaults={'password': 'dummypassword', 'email': 'dummyuser@example.com'}
        )
        request.user = dummy_user
        
    all_documents = FinancialDocument.objects.filter(owner=request.user)
    
    
    
    
    