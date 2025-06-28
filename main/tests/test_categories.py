# main/tests/test_categories.py

# F3_01: Create new custom user category linked to system category
# F3_02: Delete user categories
# F3_03: Set and edit the system category and budget amount for the user category

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from main.models import SystemSpendingCategory, UserSpendingCategory, Budget
from unittest.mock import patch

User = get_user_model()

class CategoryBudgetTests(TestCase):
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
    
    def tearDown(self):
        self.verify_patcher.stop()

    # F3_01 
    # T3_01: Create custom user category linked to system category
    def test_create_custom_user_category(self):
        response = self.client.post('/api/main/user-categories/', {
            "name": "Snacks",
            "system_category_id": self.syscat.id
        })
        self.assertEqual(response.status_code, 201)

    # T3_02: Enforce max one main category per system category
    def test_prevent_multiple_main_categories(self):
        UserSpendingCategory.objects.create(user=self.user, system_category=self.syscat, name="Main1", is_main=True)
        response1 = self.client.post('/api/main/user-categories/', {
            "name": "Main2",
            "system_category_id": self.syscat.id
        })
        self.assertEqual(response1.status_code, 201)
        
        categories = UserSpendingCategory.objects.filter(user=self.user, system_category=self.syscat).order_by("id")
    
        self.assertEqual(len(categories), 2)
        self.assertTrue(categories[0].is_main)
        self.assertFalse(categories[1].is_main)

    # F3_02
    # T3_03: Allow user to delete custom category
    def test_delete_custom_category(self):
        user_cat = UserSpendingCategory.objects.create(user=self.user, name='Snacks', system_category=self.syscat)
        response = self.client.delete(f'/api/main/user-categories/{user_cat.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(UserSpendingCategory.objects.filter(id=user_cat.id).exists())
    
    # T3_04: Prevent deletion of custom category if is_main is True
    def test_prevent_delete_main_category(self):
        user_cat = UserSpendingCategory.objects.create(user=self.user, name='Main', system_category=self.syscat, is_main=True)
        response = self.client.delete(f'/api/main/user-categories/{user_cat.id}/')
        self.assertIn(response.status_code, [400, 403])
        self.assertTrue(UserSpendingCategory.objects.filter(id=user_cat.id).exists())
    
    # F3_03
    # T3_05: Set and update budget for user-defined category
    def test_create_update_budget(self):
        user_cat = UserSpendingCategory.objects.create(user=self.user, name='Snacks', system_category=self.syscat)
        budget = Budget.objects.create(user=self.user, category=user_cat, amount=300.0)
        self.assertEqual(budget.amount, 300.0)
        response = self.client.patch(f'/api/main/budgets/{budget.id}/', {
            "amount": "700",
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Budget.objects.get(id=budget.id).amount, 700.0)
    