from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FinancialDocument, LineItem, SpendingCategory, Budget

class SpendingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SpendingCategory
        fields = ['id', 'name']

class LineItemSerializer(serializers.ModelSerializer):
    category = SpendingCategorySerializer(read_only=True)
    # category_id = serializers.PrimaryKeyRelatedField(
    #     queryset=SpendingCategory.objects.all(),
    #     source='category',
    #     write_only=True
    # )

    id = serializers.IntegerField(required=False)  # For updates
    
    class Meta:
        model = LineItem
        fields = ['id', 'item', 'price', 'category']

class FinancialDocumentSerializer(serializers.ModelSerializer):
    line_items = LineItemSerializer(many=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    upload_datetime = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = FinancialDocument
        fields = [
            'id',
            'user_id',
            'image',
            'business_name',
            'business_address',
            'transaction_datetime',
            'total_amount',
            'line_items',
            'upload_datetime',
        ]

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        financial_doc = FinancialDocument.objects.create(**validated_data)
        for item_data in line_items_data:
            LineItem.objects.create(financial_document=financial_doc, **item_data)
        return financial_doc

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items')
        
        # Update FinancialDocument fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle line items
        existing_ids = [item.id for item in instance.line_items.all()]
        sent_ids = [item.get('id') for item in line_items_data if item.get('id')]

        # Delete line items not included in request
        for line_item_id in existing_ids:
            if line_item_id not in sent_ids:
                LineItem.objects.filter(id=line_item_id).delete()

        # Update or create line items
        for item_data in line_items_data:
            item_id = item_data.get('id', None)
            if item_id:
                # Update existing line item
                line_item = LineItem.objects.get(id=item_id, financial_document=instance)
                for attr, value in item_data.items():
                    setattr(line_item, attr, value)
                line_item.save()
            else:
                # Create new line item
                LineItem.objects.create(financial_document=instance, **item_data)

        return instance

class BudgetSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    category = SpendingCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=SpendingCategory.objects.all(),
        source='category',
        write_only=True
    )
    
    class Meta:
        model = Budget
        fields = ['id', 'user_id', 'category', 'category_id', 'amount']
