from django.db import models
from rest_framework import serializers
from .models import VisitedPlace

class VisitedPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitedPlace
        fields = '__all__'
        
class VisitedPlaceWithTotalSerializer(serializers.ModelSerializer):
    purchase_total = serializers.SerializerMethodField()

    class Meta:
        model = VisitedPlace
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'last_visited', 'purchase_total']

    def get_purchase_total(self, obj):
        total = obj.documents.aggregate(total=models.Sum('total_amount'))['total'] or 0
        return round(total, 2)