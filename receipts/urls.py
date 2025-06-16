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
)

urlpatterns = [
    # Upload new financial document (POST)
    path('upload/', UploadFinancialDocumentAPIView.as_view(), name='upload-financial-document'),
    # List all financial documents for the authenticated user (GET)
    path('documents/', FinancialDocumentListAPIView.as_view(), name='financial-document-list'),
    # Detail, update, or delete a specific financial document by doc_id
    path('documents/<int:doc_id>/', FinancialDocumentDetailAPIView.as_view(), name='financial-document-detail'),
    
    # path('upload/', views.upload_financial_document, name='upload_financial_document'),
    # path('edit/<int:doc_id>/', views.edit_financial_document, name='edit_financial_document'),
    # path('delete/<int:transaction_id>/', views.delete_financial_document, name='delete_financial_document'),
    # path('view-all/', views.view_all_documents, name='view_all_documents'),
]
