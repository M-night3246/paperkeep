"""
URL configuration for paperkeep project.

Path starts with "analytics/" 
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitedPlaceListAPIView, FinancialDocumentSummaryAPIView, DashboardDataAPIView
from . import views

# router = DefaultRouter()
# router.register(r'visited-places', VisitedPlaceViewSet)

urlpatterns = [
    # path('analytics/', include(router.urls)),
    # path('update-heatmap/', views.update_heatmap, name='update_heatmap'),
    # path('view-heatmap/', views.view_heatmap, name='view_heatmap'),
    path('visited-places/', VisitedPlaceListAPIView.as_view(), name='visited-places'),
    path("dashboard/", DashboardDataAPIView.as_view()),
    path("summary/", FinancialDocumentSummaryAPIView.as_view()),
]