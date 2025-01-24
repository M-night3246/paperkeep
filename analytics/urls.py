"""
URL configuration for paperkeep project.

Path starts with "analytics/" 
"""

from django.urls import path
from . import views

urlpatterns = [
    path('update-heatmap/', views.update_heatmap, name='update_heatmap'),
    path('view-heatmap/', views.view_heatmap, name='view_heatmap'),
]