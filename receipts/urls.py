"""
URL configuration for paperkeep project.

Path starts with "receipts/" 
"""

from django.urls import path
from . import views

from .views import (
    UploadFinancialDocumentAPIView,
    FinancialDocumentDetailAPIView,
    FinancialDocumentListAPIView,
    FinancialDocumentDownloadAPIView,
)

urlpatterns = [
    # Upload new financial document (POST)
    path('upload/', UploadFinancialDocumentAPIView.as_view(), name='upload-financial-document'),
    
    # List all financial documents for the authenticated user (GET)
    path('documents/', FinancialDocumentListAPIView.as_view(), name='financial-document-list'),
    
    # Detail, update, or delete a specific financial document by doc_id
    path('documents/<int:doc_id>/', FinancialDocumentDetailAPIView.as_view(), name='financial-document-detail'),
    
    # Download single or batch of documents
    path("documents/<int:doc_id>/download/", FinancialDocumentDownloadAPIView.as_view(), name="financial-document-download"),]
