from django.shortcuts import render, redirect
from django.http import HttpResponse
import json
from main.models import FinancialDocument
from django.contrib.auth.models import User
from .utils import update_heatmap_with_new_address
from rest_framework import permissions

def update_heatmap(request):
    # Update heatmap with the address
    address = request.session.get('business_address')
    update_heatmap_with_new_address(address)

    # Return the heatmap file to the user
    return redirect("view_heatmap")

def view_heatmap(request):
    return render(request, 'heatmap.html')