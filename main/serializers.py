from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FinancialDocument, LineItem, UserSpendingCategory, SystemSpendingCategory, Budget
from collections import defaultdict
from analytics.models import VisitedPlace
from analytics.serializers import VisitedPlaceSerializer
from django.utils.timezone import localtime, make_aware, is_naive
from analytics.utils import geocode_address

class SystemSpendingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSpendingCategory
        fields = ['id', 'key', 'default_name']

class UserSpendingCategorySerializer(serializers.ModelSerializer):
    system_category = SystemSpendingCategorySerializer(read_only=True)
    system_category_id = serializers.PrimaryKeyRelatedField(
        queryset=SystemSpendingCategory.objects.all(),
        source='system_category',
        write_only=True
    )

    class Meta:
        model = UserSpendingCategory
        fields = ['id', 'name', 'system_category', 'system_category_id']

class LineItemSerializer(serializers.ModelSerializer):
    category = UserSpendingCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=UserSpendingCategory.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    id = serializers.IntegerField(required=False)
    item = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    
    class Meta:
        model = LineItem
        fields = ['id', 'item', 'price', 'category', 'category_id']

class FinancialDocumentSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.URLField(required=False, allow_blank=True)
    business_name = serializers.CharField(required=False, allow_blank=True)
    business_address = serializers.CharField(required=False, allow_blank=True)
    visited_place = VisitedPlaceSerializer(read_only=True)
    visited_place_id = serializers.PrimaryKeyRelatedField(
        queryset=VisitedPlace.objects.all(),
        source='visited_place',
        write_only=True,
        required=False,
        allow_null=True
    )
    transaction_datetime = serializers.DateTimeField(required=False, allow_null=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    line_items = LineItemSerializer(many=True)
    upload_datetime = serializers.DateTimeField(read_only=True)
    category_totals = serializers.SerializerMethodField()
    note = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = FinancialDocument
        fields = [
            'id',
            'user_id',
            'image',
            'image_url',
            'business_name',
            'business_address',
            'visited_place',
            'visited_place_id',
            'transaction_datetime',
            'subtotal',
            'tax',
            'total_amount',
            'line_items',
            'upload_datetime',
            'category_totals',
            'note',
        ]
        
    def _auto_match_or_create_place(self, document):
        if document.business_name and document.business_address and document.transaction_datetime:
            visit_date = localtime(document.transaction_datetime)

            lat, lon = geocode_address(document.business_address)
            place = VisitedPlace.objects.filter(
                user=document.user,
                latitude=lat,
                longitude=lon
            ).first()
            
            if place:
                if not place.last_visited or visit_date > place.last_visited:
                    place.last_visited = visit_date
                    place.save()

            if not place:
                place = VisitedPlace.objects.create(
                    user=document.user,
                    name=document.business_name.strip(),
                    address=document.business_address.strip(),
                    last_visited=visit_date,
                    latitude=lat,
                    longitude=lon
                )
                
            # place, _ = VisitedPlace.objects.get_or_create(
            #     user=document.user,
            #     name=document.business_name.strip(),
            #     address=document.business_address.strip(),
            #     visit_date=visit_date,
            #     latitude=lat,
            #     longitude=lon
            #     # defaults={
            #     #     "visit_date": visit_date
            #     #     # optionally set lat/lng later if you geocode
            #     # }
            # )
            
            document.visited_place = place
            document.save()    
    
    def get_category_totals(self, obj):
        category_data = defaultdict(lambda: 0)
        for item in obj.line_items.select_related('category__system_category').all():
            if item.category and item.category.system_category:
                key = item.category.system_category.default_name
                category_data[key] += item.price or 0
        return {cat_key: str(total) for cat_key, total in category_data.items()}

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        financial_doc = FinancialDocument.objects.create(**validated_data)
        for item_data in line_items_data:
            LineItem.objects.create(financial_document=financial_doc, **item_data)
        
        # visited_place = validated_data.get('visited_place')
        # transaction_datetime = validated_data.get('transaction_datetime')
        
        # if visited_place and transaction_datetime:
        #     visited_place.last_visited = max(
        #         visited_place.last_visited or transaction_datetime,
        #         transaction_datetime
        #     )
        # visited_place.save(update_fields=["last_visited"])
        
        self._auto_match_or_create_place(financial_doc)
        return financial_doc

    def update(self, instance, validated_data):
        
        line_items_data = validated_data.pop('line_items')
        transaction_datetime = validated_data.get('transaction_datetime', instance.transaction_datetime)
        visited_place = validated_data.get('visited_place', instance.visited_place)
        
        instance = super().update(instance, validated_data)

        existing_ids = []
        

        if visited_place and transaction_datetime:
            if is_naive(transaction_datetime):
                transaction_datetime = make_aware(transaction_datetime)

            visited_place.last_visited = max(
                visited_place.last_visited or transaction_datetime,
                transaction_datetime
            )
            visited_place.save(update_fields=["last_visited"])
        
        # Handle line items
        for item_data in line_items_data:
            item_id = item_data.get('id', None)
            if item_id:
                try:
                    line_item = LineItem.objects.get(id=item_id, financial_document=instance)
                    for attr, value in item_data.items():
                        setattr(line_item, attr, value)
                    line_item.save()
                    existing_ids.append(item_id)
                except LineItem.DoesNotExist:
                    continue  # or raise an error
            else:
                LineItem.objects.create(financial_document=instance, **item_data)

        # Optionally delete line items not included in update
        # LineItem.objects.filter(financial_document=instance).exclude(id__in=existing_ids).delete()
        
        self._auto_match_or_create_place(instance)
        return instance

class BudgetSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    category = UserSpendingCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=UserSpendingCategory.objects.all(),
        source='category',
        write_only=True
    )
    
    class Meta:
        model = Budget
        fields = ['id', 'user_id', 'category', 'category_id', 'amount']
