# analytics/tests/test_dashboard.py

# F4_01: Visualize data and analytics of spending through charts and graphs of a selected month

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from main.models import FinancialDocument, LineItem, SystemSpendingCategory, UserSpendingCategory, Budget
from rest_framework.test import APIClient
from unittest.mock import patch

User = get_user_model()

class DashboardAnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.verify_patcher = patch("firebase_admin.auth.verify_id_token")
        self.mock_verify = self.verify_patcher.start()

        self.mock_verify.return_value = {
            "uid": "firebase-user-id",
            "email": "test@example.com"
        }
        self.user = User.objects.create_user(username="firebase-user-id", email="test@example.com")
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid.token.here')
        
        self.syscat = SystemSpendingCategory.objects.create(default_name='Food & Groceries', key='food-groceries')
        self.category = UserSpendingCategory.objects.create(
            user=self.user, name="Snacks", system_category_id=self.syscat.id, is_main=True
        )
        
        Budget.objects.create(user=self.user, category=self.category, amount=500)
        
        self.expected_keys = [
            "budget_summary",
            "budget_summary_prev_month",
            "budget_data",
            "category_spending",
            "category_expense_lines",
            "category_expense_categories",
            "daily_spending",
            "monthly_spending",
            "top_items",
            "top_merchants"
        ]

    def tearDown(self):
        self.verify_patcher.stop()
        
    # T4_01: Return correct dashboard data for selected month
    def test_monthly_spending_summary(self):
        doc = FinancialDocument.objects.create(user=self.user, transaction_datetime=now(), total_amount=50)
        LineItem.objects.create(financial_document=doc, item="Food", price=50, category=self.category)

        response = self.client.get(f"/api/analytics/dashboard/?month={doc.transaction_datetime.month}&year={doc.transaction_datetime.year}")
        
        self.assertEqual(response.status_code, 200)
        for key in self.expected_keys:
            self.assertIn(key, response.json())
            
