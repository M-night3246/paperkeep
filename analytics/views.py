from main.models import FinancialDocument, LineItem, Budget, UserSpendingCategory
from .prompts import generate_spending_summary
from .models import VisitedPlace
from .serializers import VisitedPlaceWithTotalSerializer
from rest_framework import permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncMonth, ExtractDay, ExtractMonth
from django.shortcuts import render, redirect
from django.utils.timezone import now
from datetime import date
import calendar
from collections import defaultdict

# from .utils import update_heatmap_with_new_address

class VisitedPlaceListAPIView(generics.ListAPIView):
    serializer_class = VisitedPlaceWithTotalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VisitedPlace.objects.filter(user=self.request.user)

class DashboardDataAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        month = request.GET.get('month')
        year = request.GET.get('year')
        current_date = now()
        month = int(month) if month and month.isdigit() else current_date.month
        year = int(year) if year and year.isdigit() else current_date.year
        
        # 4. Budget Data (BudgetExpenseCard):
        # for expense card, and also utilized for donut 
        budget_data = []
        user_budgets = Budget.objects.select_related('category').filter(user=user)
        for b in user_budgets:
            spent = (
                LineItem.objects
                .filter(
                    financial_document__user=user, 
                    category=b.category, 
                    financial_document__transaction_datetime__month=month,
                    financial_document__transaction_datetime__year=year,
                )
                .aggregate(total=Sum('price'))['total'] or 0
            )
            budget_data.append({
                'name': b.category.name,
                'budget': b.amount,
                'spent': spent,
                'color': '#cccccc'  # Replace with actual color if stored
            })

        # 1. Budget Summary (Budget Summary Card):
        # total spent and total budget
        total_budget = sum(b['budget'] for b in budget_data)
        total_spent = sum(b['spent'] for b in budget_data)
        budget_summary = {
            'total_budget': total_budget,
            'total_spent': total_spent,
        }
        
        # 2. Budget Summary For Previous Month (Budget Summary Card):
        budget_data_prev_month = []
        user_budgets_prev_month = Budget.objects.select_related('category').filter(user=user)
        if month == 1:
            prev_month = 12
            prev_year = year - 1
        else:
            prev_month = month - 1
            prev_year = year
        for b in user_budgets_prev_month:
            spent = (
                LineItem.objects
                .filter(
                    financial_document__user=user, 
                    category=b.category, 
                    financial_document__transaction_datetime__month=prev_month,
                    financial_document__transaction_datetime__year=prev_year,
                )
                .aggregate(total=Sum('price'))['total'] or 0
            )
            budget_data_prev_month.append({
                'name': b.category.name,
                'budget': b.amount,
                'spent': spent,
                'color': '#cccccc'  # Replace with actual color if stored
            })
            
        total_budget = sum(b['budget'] for b in budget_data_prev_month)
        total_spent = sum(b['spent'] for b in budget_data_prev_month)
        budget_summary_prev_month = {
            'total_budget': total_budget,
            'total_spent': total_spent,
        }
        
        # 3. Category Spending (CategoryExpensePieChart):
        # for Pie chart
        category_spending = (
            LineItem.objects
            .filter(
                financial_document__user=user,
                financial_document__transaction_datetime__month=month,
                financial_document__transaction_datetime__year=year,
            )
            .values('category__id', 'category__name')
            .annotate(total_spent=Sum('price'))
            .order_by('-total_spent')
        )
        
        # 5. Daily Spending & Monthly Spending (SpendingLineChart)
        # daily
        daily_spending = (
            FinancialDocument.objects
            .filter(
                user=user,
                transaction_datetime__month=month,
                transaction_datetime__year=year,
            )
            .annotate(day=TruncDate('transaction_datetime'))
            .values('day')
            .annotate(total_spent=Sum('total_amount'))
            .order_by('day')
        )
        
        _, last_day = calendar.monthrange(year, month)
        full_days = [date(year, month, day) for day in range(1, last_day + 1)]

        daily_dict = {entry['day']: entry['total_spent'] for entry in daily_spending}

        day_spending = [
            {"day": d.day, "total_spent": float(daily_dict.get(d, 0))}
            for d in full_days
        ]

        # monthly
        monthly_spending = (
            FinancialDocument.objects
            .filter(
                user=user,
                transaction_datetime__year=year,
            )
            .annotate(month=TruncMonth('transaction_datetime'))
            .values('month')
            .annotate(total_spent=Sum('total_amount'))
            .order_by('month')
        )

        month_labels = []
        month_lookup = {}
        for m in range(1, 13):
            dt = date(year, m, 1)
            label = dt.strftime('%b')
            month_labels.append(label)
            month_lookup[(dt.month)] = label

        monthly_dict = {
            (entry['month'].year, entry['month'].month): entry['total_spent']
            for entry in monthly_spending
        }

        month_spending = [
            {
                "month": month_lookup[(m)],
                "total_spent": float(monthly_dict.get((year, m), 0))
            }
            for m in range(1, 13)
        ]
        
        # 6. (CategoryExpenseLineChart)
        # daily and monthly values per category
        daily_data = (
            LineItem.objects
            .filter(
                financial_document__user=user,
                financial_document__transaction_datetime__month=month,
                financial_document__transaction_datetime__year=year,
            )
            .annotate(day=ExtractDay('financial_document__transaction_datetime'))
            .values('category__id', 'day')
            .annotate(total=Sum('price'))
        )
        
        monthly_data = (
            LineItem.objects
            .filter(
                financial_document__user=user,
                financial_document__transaction_datetime__year=year,
            )
            .annotate(month=ExtractMonth('financial_document__transaction_datetime'))
            .values('category__id', 'month')
            .annotate(total=Sum('price'))
        )

        category_expense_lines = defaultdict(
            lambda: {'daily': [0] * 31, 'monthly': [0] * 12}
        )

        for entry in daily_data:
            cat_id = str(entry['category__id'])
            day = entry['day']
            if 1 <= day <= 30:
                category_expense_lines[cat_id]['daily'][day - 1] = float(entry['total'])

        for entry in monthly_data:
            cat_id = str(entry['category__id'])
            month_temp = entry['month']
            if 1 <= month_temp <= 12:
                category_expense_lines[cat_id]['monthly'][month_temp - 1] = float(entry['total'])

        user_categories_qs = UserSpendingCategory.objects.filter(user=user).values('id', 'name')

        categories = [
            {
                'id': str(entry['id']),
                'name': entry['name']
            }
            for entry in user_categories_qs
        ]

        # 7. Top Items (TopItemsList)
        top_items = (
            LineItem.objects
            .filter(
                financial_document__user=user,
                financial_document__transaction_datetime__month=month,
                financial_document__transaction_datetime__year=year,
            )
            .values('item')
            .annotate(
                total_spent=Sum('price'),
                times_bought=Count('id')
            )
            .order_by('-total_spent')[:10]
        )
        
        # 8. Top Merchants (TopMerchantsList)
        top_merchants = (
            FinancialDocument.objects
            .filter(
                user=user,
                transaction_datetime__month=month,
                transaction_datetime__year=year,
            )
            .values('business_name')
            .annotate(total_spent=Sum('total_amount'))
            .order_by('-total_spent')[:10]
        )

        return Response({
            'budget_summary': budget_summary,
            'budget_summary_prev_month': budget_summary_prev_month,
            'budget_data': budget_data,
            'category_spending': list(category_spending),
            'category_expense_lines': category_expense_lines,
            'category_expense_categories': categories,
            'daily_spending': day_spending,
            'monthly_spending': month_spending,
            'top_items': list(top_items),
            'top_merchants': list(top_merchants),
        })

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

# class VisitedPlacesAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         visited_places = (
#             FinancialDocument.objects
#             .filter(user=request.user)
#             .values('business_name')
#             .annotate(
#                 total_spent=Sum('line_items__price'),
#                 last_visited=Max('transaction_datetime'),
#                 lat=Max('business_lat'),
#                 lng=Max('business_lng')
#             )
#             .order_by('-last_visited')
#         )
#         return Response(visited_places)

# def update_heatmap(request):
#     # Update heatmap with the address
#     address = request.session.get('business_address')
#     update_heatmap_with_new_address(address)

#     # Return the heatmap file to the user
#     return redirect("view_heatmap")

# def view_heatmap(request):
#     return render(request, 'heatmap.html')