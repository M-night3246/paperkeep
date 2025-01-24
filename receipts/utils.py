# Utility functions
import os
import json
from pathlib import Path
from paperkeep.settings import MEDIA_ROOT

from datetime import datetime
import cv2
import pytesseract
import google.generativeai as genai

def to_python_from_json_datetime(dt):
    return datetime.strptime(dt, "%d/%m/%Y %H:%M:%S")

def to_python_from_html_datetime(dt):
    return datetime.strptime(dt, "%Y-%m-%dT%H:%M")

def to_html_from_python_datetime(dt):
    return datetime.strftime(dt, '%Y-%m-%dT%H:%M')

def process_image_and_extract_data(image_path):    
    # Load image
    file_name = Path(image_path).stem
    image_path_full = os.path.join(MEDIA_ROOT, image_path.lstrip('/'))
    image = cv2.imread(image_path_full)

    # PERFORM OCR
    text = pytesseract.image_to_string(image, lang='eng+msa')

    # Perform key information extraction and line item extraction using GenAI
    genai.configure(api_key="AIzaSyB163P0QEj5RJPdmDG4NKy8z2kS1ZIcKw4")
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = (
        f"{text} Based on the text, extract the line items and prices for each line item in a structured json format. Datetime should be in YYYY-MM-DD HH:MM:SS. "
        "with the structure: business_name, business_address, transaction_datetime, document_number, total_amount, line_items -> item, price, category. "
        "And for each item, classify it into one of the following categories: Living Expenses, Food & Groceries, Health & Wellness, Personal & Family Care, Entertainment & Leisure, Miscellaneous. "
        "Do not add any explanation text."
    )

    response = model.generate_content(prompt)
    
    # Parse the response to extract the line items
    lines = response.text.splitlines()
    lines = lines[1:-1]
    json_content = "\n".join(lines)

    json_data = json.loads(json_content)
    return json_data

