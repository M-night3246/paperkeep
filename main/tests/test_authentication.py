# main/tests/test_authentication.py

# F1_01: Allow users to securely register, log in and log out using Firebase Authentication
# F1_02: Protect API routes from unauthorized access

from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()

class AuthenticationTests(TestCase):
    
    def setUp(self):
        self.client = APIClient()
    
    # F1_01
    # T1_01: Authenticate valid user through Firebase Auth (mocked as Django user)
    @patch("firebase_admin.auth.verify_id_token")
    def test_authenticate_valid_user(self, mock_verify):
        mock_verify.return_value = {
            'uid': 'firebase-user-id',
            'email': 'user@example.com',
        }
        user = User.objects.create_user(email='user@example.com', username='user', password='ValidPass123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid.token.here')
        
        response = self.client.get('/api/receipts/documents/')
        self.assertEqual(response.status_code, 200)

    # T1_02: Reject login with invalid credentials
    @patch("firebase_admin.auth.verify_id_token")
    def test_reject_invalid_credentials(self, mock_verify):
        mock_verify.side_effect = Exception("Invalid token")
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid")
        response = self.client.get('/api/receipts/documents/')
        self.assertIn(response.status_code, [401, 403])
    
    # F1_02
    # T1_03: Reject access to protected routes without authorization
    @patch("firebase_admin.auth.verify_id_token")
    def test_prevent_unauthenticated_access(self, mock_verify):
        mock_verify.side_effect = Exception("Token not valid")
        response = self.client.get('/api/receipts/documents/')
        self.assertIn(response.status_code, [401, 403])   