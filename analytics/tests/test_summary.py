# analytics/tests/test_summary.py

# F5_01: Generate the report summary based on selected month

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from unittest.mock import patch
from rest_framework.test import APIClient
from datetime import timedelta
from main.models import FinancialDocument

User = get_user_model()

class AISummaryTests(TestCase):
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
        
        self.doc = FinancialDocument.objects.create(
            user=self.user,
            business_name="Grocery Market",
            transaction_datetime=now(),
            total_amount=80,
        )
    
    def tearDown(self):
        self.verify_patcher.stop()

    # T5_01_01: Generate LLM summary from documents
    def test_generate_llm_summary(self):
        mode = 'analytical'
        transaction_date = self.doc.transaction_datetime
        from_date = transaction_date.replace(day=1).date()

        if transaction_date.month == 12:
            next_month = transaction_date.replace(year=transaction_date.year + 1, month=1, day=1)
        else:
            next_month = transaction_date.replace(month=transaction_date.month + 1, day=1)
        to_date = (next_month - timedelta(days=1)).date()
        
        response = self.client.get(f'/api/analytics/summary/?mode={mode}&from={from_date}&to={to_date}')
        self.assertEqual(response.status_code, 200)
