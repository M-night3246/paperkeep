from django.shortcuts import render, redirect, get_object_or_404
from .models import FinancialDocument
from django.conf import settings

import json
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

def home(request):
    return HttpResponse("This is the homepage")
