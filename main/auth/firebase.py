# main/auth/firebase.py
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User  # or your custom model

# Only initialize once
if not firebase_admin._apps:
    cred = credentials.Certificate('main/auth/firebase-admin-sdk.json')
    firebase_admin.initialize_app(cred)

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            decoded_token = firebase_auth.verify_id_token(token)
            email = decoded_token.get('email')
            uid = decoded_token.get('uid')

            if not email:
                raise AuthenticationFailed("Invalid Firebase token")

            # Match or create a Django user
            user, _ = User.objects.get_or_create(username=uid, defaults={'email': email})
            return (user, None)

        except Exception:
            raise AuthenticationFailed("Firebase token is invalid or expired")
