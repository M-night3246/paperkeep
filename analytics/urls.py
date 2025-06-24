"""
URL configuration for paperkeep project.

Path starts with "analytics/" 
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitedPlaceListAPIView, FinancialDocumentSummaryAPIView, DashboardDataAPIView

urlpatterns = [
    path('visited-places/', VisitedPlaceListAPIView.as_view(), name='visited-places'),
    path("dashboard/", DashboardDataAPIView.as_view()),
    path("summary/", FinancialDocumentSummaryAPIView.as_view()),
]