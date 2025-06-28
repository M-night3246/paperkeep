# analytics/tests/test_map.py

# F6_01: Visualize visited locations and all-time spendings through an interactive pin map

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch
from analytics.models import VisitedPlace

User = get_user_model()

class VisitedPlaceTests(TestCase):
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
        
        self.place = VisitedPlace.objects.create(
            user=self.user,
            name="Old Cafe",
            address="123 Main Street",
            latitude=3.139,
            longitude=101.6869,
        )
    
    def tearDown(self):
        self.verify_patcher.stop()

    # T6_01_01: Retrieve all VisitedPlace entries
    def test_get_visited_places(self):
        response = self.client.get("/api/analytics/visited-places/")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()), 1)
