# Utility functions
import os
import json
from pathlib import Path
from paperkeep.settings import MEDIA_ROOT
from dotenv import load_dotenv
from firebase_admin import storage
import uuid

import cv2
import pytesseract
import google.generativeai as genai

from PIL import Image
from surya.recognition import RecognitionPredictor
from surya.detection import DetectionPredictor


load_dotenv()

def ocr_text_surya(image):

    # Load image
    if image is None:
        raise ValueError(f"Failed to load image")
        
    # try:
    #     file_name = Path(image_path).stem
    #     image_path_full = os.path.join(MEDIA_ROOT, image_path.lstrip('/'))
        
    #     if not os.path.exists(image_path_full):
    #         raise FileNotFoundError(f"Image not found: {image_path_full}")
        
    #     image = Image.open(image_path_full)

    #     if image is None:
    #         raise ValueError(f"Failed to load image: {image_path_full}")
        
    # # Log the error and return a response or raise an exception
    # except (FileNotFoundError, ValueError) as e:
    #     print(f"Error loading image: {e}")
    #     return {"error": f"Error loading image: {e}"}
    
    recognition_predictor = RecognitionPredictor()
    detection_predictor = DetectionPredictor()

    results = recognition_predictor([image], det_predictor=detection_predictor)

    # Extract just the text
    only_text = []
    for page in results:
        for line in page.text_lines:
            only_text.append(line.text)

    print('\n'.join(only_text))
    
    return '\n'.join(only_text)

def ocr_text_tesseract(image):    
    # Load image
    try:
        # file_name = Path(image_path).stem
        # image_path_full = os.path.join(MEDIA_ROOT, image_path.lstrip('/'))
        
        # if not os.path.exists(image_path_full):
        #     raise FileNotFoundError(f"Image not found: {image_path_full}")
        
        # image = cv2.imread(image_path_full)

        if image is None:
            raise ValueError(f"Failed to load image: {image}")
        
    # Log the error and return a response or raise an exception
    except (FileNotFoundError, ValueError) as e:
        print(f"Error loading image: {e}")
        return {"error": f"Error loading image: {e}"}
    
    try:
    # PERFORM OCR
        text = pytesseract.image_to_string(image, lang='eng+msa')
        if not text.strip():
            raise ValueError("OCR did not return any text. Image might be unreadable.")
    
    except ValueError as e:
        print(f"OCR Error: {e}")
        return {"error": f"OCR Error: {e}"}
    
    return text

def llm_extract(text):
        # Perform key information extraction and line item extraction using GenAI
    try:
        api_key = os.getenv("GOOGLE_GENAI_KEY")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            f"{text} Based on the text, extract the line items and prices for each line item in a structured json format. Datetime should be in YYYY-MM-DD HH:MM:SS. "
            "with the structure: business_name, business_address, transaction_datetime, total_amount, subtotal, tax, line_items -> item, price, category. "
            "And for each item, classify it into one of the following categories: Living Expenses, Food & Groceries, Health & Wellness, Personal & Family Care, Entertainment & Leisure, Miscellaneous. "
            "Do not add any explanation text."
        )
        response = model.generate_content(prompt)
        print("response\n", response)

        if not response or not hasattr(response, 'text') or not response.text.strip():
            raise ValueError("GenAI did not return a valid response or content is empty.")

    # Log the error and return a response
    except (ValueError, AttributeError) as e:
        print(f"GenAI Error: {e}")
        return {"error": f"GenAI Error: {e}"}
    
    # Parse the response to extract the line items
    try:
        lines = response.text.splitlines()
        if len(lines) < 2:
            # raise ValueError("GenAI returned an invalid response format.")
            raise ValueError("Our AI was unable to parse the info from the image. Please try with a clearer image.")
        
        lines = lines[1:-1]
        json_content = "\n".join(lines)
        file_path = 'genai_response.txt'

        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(json_content)

        json_data = json.loads(json_content)
        print("json_data\n", json_data)

        if not isinstance(json_data, dict):
            raise ValueError("Parsed JSON is not in the expected format.")

    # Log the error and return a response
    except (json.JSONDecodeError, ValueError) as e:
        print(f"JSON Parsing Error: {e}")
        return {"error": f"JSON Parsing Error: {e}"}
    
    return json_data

# Priority logic
def apply_priority_logic(subtotal, tax, total_amount, line_items_total):
    note = []

    # If tax is 0 and line items total != total, override subtotal
    if tax == 0 and total_amount > 0 and line_items_total != total_amount:
        note.append(
            f"Line items total ({line_items_total}) does not match total ({total_amount}) with tax = 0. "
            "Subtotal is overridden with total."
        )
        subtotal = total_amount
        
    # If subtotal > 0 and total is missing or zero, fallback to subtotal as total
    if subtotal > total_amount and (not total_amount or total_amount == 0):
        note.append(
            f"Total ({total_amount}) does not exist."
            "Total is overridden with subtotal."
        )
        total_amount = subtotal
        
    #  If line items exist but both subtotal and total are missing or zero, fallback to line items total
    if line_items_total > 0 and (not total_amount or total_amount == 0) and (not subtotal or subtotal == 0):
        note.append(
            f"Total ({total_amount}) and subtotal ({subtotal}) does not exist."
            "Total and subtotal are overridden with the total of line items."
        )
        total_amount = line_items_total
        subtotal = line_items_total

    return subtotal, total_amount, note

# Additional consistency warnings
def generate_consistency_warnings(subtotal, tax, total_amount, line_items_total, processed_line_items):
    note = []

    if round(line_items_total, 2) != round(subtotal, 2):
        note.append(
            f"Line items total ({line_items_total}) does not match subtotal ({subtotal})."
        )

    if round(line_items_total + tax, 2) != round(total_amount, 2):
        note.append(
            f"Line items total + tax ({round(line_items_total + tax)}) does not match total ({total_amount})."
        )

    if round(subtotal + tax, 2) != round(total_amount, 2):
        note.append(
            f"Subtotal + tax ({round(subtotal + tax)}) does not match total ({total_amount})."
        )

    if any(p < 0 for p in [subtotal, total_amount, line_items_total]):
        note.append("One or more amounts are negative, which may be incorrect.")

    neg_prices = [item for item in processed_line_items if item.get('price', 0) < 0]
    if neg_prices:
        note.append(f"{len(neg_prices)} line item(s) have negative prices, which may indicate a refund or error.")

    if tax > 0 and round(subtotal, 2) == round(total_amount, 2):
        note.append("Subtotal equals total despite tax being non-zero.")

    if subtotal > 0 and tax / subtotal > 0.3:
        note.append(f"Unusually high tax ({tax}) relative to subtotal ({subtotal}).")

    return note

def upload_image_to_firebase(image_file, folder="documents"):
    bucket = storage.bucket()
    extension = image_file.name.split('.')[-1]
    unique_filename = f"{folder}/{uuid.uuid4()}.{extension}"

    blob = bucket.blob(unique_filename)
    blob.upload_from_file(image_file, content_type=image_file.content_type)
    blob.make_public()
    return blob.public_url