from django.shortcuts import render, redirect
from rest_framework.views import APIView
from main.models import FinancialDocument, LineItem
from .utils import update_heatmap_with_new_address
from .prompts import generate_spending_summary
from rest_framework import permissions, generics
from rest_framework.response import Response
from django.db.models import Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import TruncDate
from django.db.models.functions import TruncMonth
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Max
from rest_framework import viewsets
from .models import VisitedPlace
from .serializers import VisitedPlaceSerializer, VisitedPlaceWithTotalSerializer

class VisitedPlaceListAPIView(generics.ListAPIView):
    serializer_class = VisitedPlaceWithTotalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VisitedPlace.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user = request.user

    # 1. Category Spending
    category_spending = (
        LineItem.objects
        .filter(financial_document__user=user)
        .values('category__name')
        .annotate(total_spent=Sum('price'))
        .order_by('-total_spent')
    )

    # 2. Daily Spending
    daily_spending = (
        FinancialDocument.objects
        .filter(user=user)
        .annotate(day=TruncDate('transaction_datetime'))
        .values('day')
        .annotate(total_spent=Sum('total_amount'))
        .order_by('day')
    )

    # 3. Monthly Spending
    monthly_spending = (
        FinancialDocument.objects
        .filter(user=user)
        .annotate(month=TruncMonth('transaction_datetime'))
        .values('month')
        .annotate(total_spent=Sum('total_amount'))
        .order_by('month')
    )

    # 4. Top Items
    top_items = (
        LineItem.objects
        .filter(financial_document__user=user)
        .values('item')
        .annotate(
            total_spent=Sum('price'),
            times_bought=Count('id')
        )
        .order_by('-total_spent')[:10]
    )

    return Response({
        'category_spending': list(category_spending),
        'daily_spending': list(daily_spending),
        'monthly_spending': list(monthly_spending),
        'top_items': list(top_items),
    })

class VisitedPlacesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        visited_places = (
            FinancialDocument.objects
            .filter(user=request.user)  # If you associate documents to users
            .values('business_name')
            .annotate(
                total_spent=Sum('line_items__price'),
                last_visited=Max('transaction_datetime'),
                lat=Max('business_lat'),
                lng=Max('business_lng')
            )
            .order_by('-last_visited')
        )
        return Response(visited_places)

class FinancialDocumentSummaryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        mode = request.query_params.get("mode", "analytical")
        date_from = request.query_params.get("from")
        date_to = request.query_params.get("to")

        try:
            docs = FinancialDocument.objects.filter(
                user=request.user,
                transaction_datetime__date__gte=date_from,
                transaction_datetime__date__lte=date_to
            ).prefetch_related("line_items__category")
        except Exception:
            return Response({"error": "Invalid date range."}, status=400)
    
        summary_text = generate_spending_summary(docs, mode=mode, date_range_label=f"{date_from} to {date_to}")
        return Response({"summary": summary_text})


def update_heatmap(request):
    # Update heatmap with the address
    address = request.session.get('business_address')
    update_heatmap_with_new_address(address)

    # Return the heatmap file to the user
    return redirect("view_heatmap")

def view_heatmap(request):
    return render(request, 'heatmap.html')