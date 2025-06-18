# Utility functions
import os
import json
from pathlib import Path
from paperkeep.settings import MEDIA_ROOT

import cv2
import pytesseract
import google.generativeai as genai

from PIL import Image
from surya.recognition import RecognitionPredictor
from surya.detection import DetectionPredictor

# def ocr_text_surya(image_path):

#     # Load image
#     try:
#         file_name = Path(image_path).stem
#         image_path_full = os.path.join(MEDIA_ROOT, image_path.lstrip('/'))
        
#         if not os.path.exists(image_path_full):
#             raise FileNotFoundError(f"Image not found: {image_path_full}")
        
#         image = Image.open(image_path_full)

#         if image is None:
#             raise ValueError(f"Failed to load image: {image_path_full}")
        
#     # Log the error and return a response or raise an exception
#     except (FileNotFoundError, ValueError) as e:
#         print(f"Error loading image: {e}")
#         return {"error": f"Error loading image: {e}"}
    
#     recognition_predictor = RecognitionPredictor()
#     detection_predictor = DetectionPredictor()

#     results = recognition_predictor([image], det_predictor=detection_predictor)

#     # Extract just the text
#     only_text = []
#     for page in results:
#         for line in page.text_lines:
#             only_text.append(line.text)

#     print('\n'.join(only_text))
    
#     return '\n'.join(only_text)


def ocr_text_surya(image):

    # Load image
    # try:
    if image is None:
        raise ValueError(f"Failed to load image")
        
    # Log the error and return a response or raise an exception
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

def ocr_text_tesseract(image_path):    
    # Load image
    try:
        file_name = Path(image_path).stem
        image_path_full = os.path.join(MEDIA_ROOT, image_path.lstrip('/'))
        
        if not os.path.exists(image_path_full):
            raise FileNotFoundError(f"Image not found: {image_path_full}")
        
        image = cv2.imread(image_path_full)

        if image is None:
            raise ValueError(f"Failed to load image: {image_path_full}")
        
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
        genai.configure(api_key="AIzaSyB163P0QEj5RJPdmDG4NKy8z2kS1ZIcKw4")
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"{text} Based on the text, extract the line items and prices for each line item in a structured json format. Datetime should be in YYYY-MM-DD HH:MM:SS. "
            "with the structure: business_name, business_address, transaction_datetime, total_amount, line_items -> item, price, category. "
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

