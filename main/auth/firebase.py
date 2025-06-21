# main/auth/firebase.py
import firebase_admin
import os
from dotenv import load_dotenv
from firebase_admin import auth as firebase_auth, credentials
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from main.models import SystemSpendingCategory, UserSpendingCategory

load_dotenv()

def create_default_user_categories(user):
    system_categories = SystemSpendingCategory.objects.all()
    UserSpendingCategory.objects.bulk_create([
        UserSpendingCategory(user=user, system_category=cat, name=cat.default_name, is_main=True)
        for cat in system_categories
    ])

# Only initialize once
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIAL_PATH"))
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.getenv("FIREBASE_BUCKET_NAME")
    })

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
            user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
            if created:
                create_default_user_categories(user)
            
            return (user, None)

        except Exception:
            raise AuthenticationFailed("Firebase token is invalid or expired")
