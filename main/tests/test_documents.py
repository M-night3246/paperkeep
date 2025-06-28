# main/tests/test_documents.py

# F2_01: Upload images of receipts to extract key information and auto-categorize line items
# F2_03: Auto-map business addresses to locations in interactive map

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils.timezone import now
from rest_framework.test import APIClient
from unittest.mock import patch
import io
import numpy as np
import cv2
from PIL import Image
from receipts.views import llm_extract, ocr_text_tesseract, ocr_text_surya
from main.serializers import FinancialDocumentSerializer

User = get_user_model()

class DocumentProcessingTests(TestCase):
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
        
        self.test_img_cv = np.ones((100, 300), dtype=np.uint8) * 255
        cv2.putText(self.test_img_cv, "Test Receipt", (5, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0), 2, cv2.LINE_AA)
        self.test_img_pil = Image.fromarray(self.test_img_cv)
    
    def tearDown(self):
        self.verify_patcher.stop()
    
    # F2_01
    # T2_01: Upload receipt with mocked OCR and mocked LLM
    @patch("receipts.views.llm_extract")
    @patch("receipts.views.ocr_text_tesseract")
    @patch("receipts.views.upload_image_to_firebase", return_value="https://dummy.firebase.url/image.jpg")
    def test_upload_document_with_mocked_ocr_and_llm(
        self, mock_upload, mock_ocr, mock_llm
    ):        
        mock_ocr.return_value = "dummy OCR text"

        mock_llm.return_value = {
            "business_name": "Mock Store",
            "business_address": "123 Mock St",
            "transaction_datetime": "2024-01-01 12:00:00",
            "subtotal": 100.0,
            "tax": 6.0,
            "total_amount": 106.0,
            "line_items": [
                {
                    "item": "Item A",
                    "price": 100.0,
                    "category": "Food & Groceries",
                }
            ],
        }

        image = Image.new("RGB", (100, 100), color="white")
        image_io = io.BytesIO()
        image.save(image_io, format="JPEG")
        image_io.seek(0)

        image_file = SimpleUploadedFile(
            "test.jpg", image_io.read(), content_type="image/jpeg"
        )

        response = self.client.post(
            "/api/receipts/upload/",
            {"image": image_file},
            format="multipart"
        )
        
        self.assertEqual(response.status_code, 207)
        self.assertIn("status", response.data[0])
        self.assertEqual(response.data[0]["status"], "success")
        self.assertIn(response.status_code, [200, 201, 207])
        
    # T2_02: Return string after Surya OCR
    def test_ocr_text_surya_returns_string(self):
        text = ocr_text_surya(self.test_img_pil)
        self.assertIsInstance(text, str)
        self.assertIn("Test", text)

    # T2_03: Return string after Tesseract OCR
    def test_ocr_text_tesseract_returns_string(self):
        text = ocr_text_tesseract(self.test_img_cv)
        self.assertIsInstance(text, str)
        self.assertIn("Test", text)

    # T2_04: LLM extract function returns expected structure
    def test_llm_extract_returns_json_with_keys(self):
        dummy_text = """
        Business: Fruit Store
        Address: 123 Market Street
        Date: 2024-06-20 15:30:00
        Total: 45.00
        Subtotal: 40.00
        Tax: 5.00
        Items:
        - Apples: 10.00
        - Bananas: 15.00
        - Milk: 20.00
        """

        result = llm_extract(dummy_text)

        self.assertIsInstance(result, dict)
        required_keys = ["business_name", "business_address", "transaction_datetime", "total_amount", "subtotal", "tax", "line_items"]
        for key in required_keys:
            self.assertIn(key, result)
        self.assertIsInstance(result["line_items"], list)

    # F2_03 
    # T2_05: Create map pin and update map pin based on edited document
    def test_map_pin_updates_on_document_change(self):
        serializer = FinancialDocumentSerializer(data={
                "user_id": self.user.id,
                "business_name": "Old Cafe",
                "business_address": "Mid Valley Megamall, Mid Valley City, 59200 Kuala Lumpur",
                "transaction_datetime": now().isoformat(),
                "line_items": [] 
            })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        doc = serializer.save()
        
        self.assertIsNotNone(doc.visited_place)
        original_place = doc.visited_place
        self.assertIn("Mid Valley", original_place.address)
        
        updated_serializer = FinancialDocumentSerializer(
            instance=doc,
            data={
                "business_name": "New Cafe",
                "business_address": "Paradigm Mall, Skudai Hwy, Taman Bukit Mewah, 81200 Johor Bahru, Johor",
                "transaction_datetime": doc.transaction_datetime.isoformat(),
                "line_items": [],
            },
            partial=True
        )
        self.assertTrue(updated_serializer.is_valid(), updated_serializer.errors)
        doc = updated_serializer.save()
        
        doc.refresh_from_db()
        
        self.assertIsNotNone(doc.visited_place)
        self.assertIn("Paradigm Mall", doc.visited_place.address)
        self.assertNotEqual(doc.visited_place.id, original_place.id)
