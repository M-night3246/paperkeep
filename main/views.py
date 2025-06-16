from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from django.conf import settings
from rest_framework import viewsets
from .serializers import FinancialDocumentSerializer, LineItemSerializer, SpendingCategorySerializer, BudgetSerializer
from rest_framework import permissions

import json
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def init_csrf_view(request):
    return JsonResponse({"message": "CSRF cookie set."})

class FinancialDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = FinancialDocument.objects.all()
    serializer_class = FinancialDocumentSerializer

class LineItemViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = LineItem.objects.all()
    serializer_class = LineItemSerializer

class SpendingCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = SpendingCategory.objects.all()
    serializer_class = SpendingCategorySerializer

class BudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer