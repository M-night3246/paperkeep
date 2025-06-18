"""
URL configuration for paperkeep project.

Path starts with "/" 
"""

from django.urls import path
from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

router = DefaultRouter()
router.register(r'financial-documents', FinancialDocumentViewSet)
router.register(r'line-items', LineItemViewSet)
router.register(r'system-categories', SystemSpendingCategoryViewSet, basename='system-category')
router.register(r'user-categories', UserSpendingCategoryViewSet, basename='user-category')
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path('init/', init_csrf_view, name='init-csrf'),
]
