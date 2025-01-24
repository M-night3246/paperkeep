"""
URL configuration for paperkeep project.

Path starts with "receipts/" 
"""

from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_financial_document, name='upload_financial_document'),
    path('edit/<int:doc_id>/', views.edit_financial_document, name='edit_financial_document'),
    path('view-all-documents/', views.view_all_documents, name='view_all_documents'),
]
