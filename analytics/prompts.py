import google.generativeai as genai
from django.conf import settings
from decimal import Decimal
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv
import os

load_dotenv()

PROMPT_STYLES = {
    "professional": (
        "You are a financial assistant. Analyze the user's spending data and write a concise summary "
        "in well-structured paragraphs.\n\n"
        "Report period: {date_range_label}\n"
        "Total Spending: RM{total:.2f}\n"
        "Category Breakdown: {category_summary}\n"
        "Line Items:\n{line_items}\n\n"
        "Write a 2–3 paragraph summary including:\n"
        "- Major spending categories and high-cost items\n"
        "- Any unusual or repetitive spending behavior\n"
        "- Practical suggestions to improve future financial decisions\n\n"
        "Do not include greetings or bullet points."
    ),
    "analytical": (
        "You are an analytical financial analyst. Analyze the following data and provide an objective report "
        "with precise numbers and minimal fluff.\n\n"
        "Period: {date_range_label}\n"
        "Total: RM{total:.2f}\n\n"
        "Spending by category:\n{category_summary}\n\n"
        "Line items:\n{line_items}\n\n"
        "Instructions:\n"
        "- Provide a numerical breakdown of the top spending categories (include percentage of total).\n"
        "- Identify any anomalies or outliers (e.g., high single purchases, repetitive items).\n"
        "- Offer data-driven, actionable recommendations to improve spending behavior.\n\n"
        "Avoid casual language. Be concise, accurate, and analytical in tone."
    ),
    "bullet": (
        "You are a financial assistant. Analyze the spending data and return a summary using clear, structured bullet points.\n\n"
        "Report period: {date_range_label}\n"
        "Total Spending: RM{total:.2f}\n\n"
        "Spending by category:\n{category_summary}\n\n"
        "Example line items:\n{line_items}\n\n"
        "Return your answer in 3 sections:\n"
        "- Highest spending\n"
        "- Unusual patterns\n"
        "- Recommendations\n\n"
        "Use bullet points only, no paragraphs or greetings."
    ),
    "friendly": (
        "You're a helpful personal finance buddy. Take the following receipt data and explain to the user what happened "
        "in a friendly and conversational tone.\n\n"
        "Report period: {date_range_label}\n"
        "Total spent: RM{total:.2f}\n\n"
        "Category totals:\n{category_summary}\n\n"
        "Sample purchases:\n{line_items}\n\n"
        "Write 2–3 short paragraphs:\n"
        "- Start with a casual summary (\"Looks like you spent most on...\").\n"
        "- Mention anything odd (like duplicates or large purchases).\n"
        "- Offer tips or reminders (\"Maybe keep an eye on...\").\n\n"
        "No greetings or goodbyes. Use friendly but clear language."
    )
}

genai.configure(api_key=os.getenv("GOOGLE_GENAI_KEY"))

def extract_response_text(response):
    try:
        return response.candidates[0].content.parts[0].text.strip()
    except (AttributeError, IndexError, KeyError):
        return "No response generated."

def generate_spending_summary(financial_docs, mode="analytical", date_range_label="This Month"):
    """
    Generates a summary from a queryset of FinancialDocument instances.
    Mode: 'professional', 'analytical', 'bullet', 'friendly'
    """
    # Aggregate by category
    category_totals = defaultdict(Decimal)
    total = Decimal(0)
    doc_lines = []

    for doc in financial_docs:
        total += doc.total_amount or 0
        for line in doc.line_items.all():
            if line.category and line.price:
                category_name = line.category.name
                category_totals[category_name] += line.price
                doc_lines.append(f"- {line.item or 'Unknown'}: RM{line.price:.2f} ({category_name})")

    # Format summary data
    category_summary = "\n".join(
        f"{cat}: RM{amt:.2f}" for cat, amt in category_totals.items()
    )
    
    line_items = "\n".join(doc_lines[:15]) + ("\n..." if len(doc_lines) > 15 else "")
    prompt = PROMPT_STYLES[mode].format(
        date_range_label=date_range_label,
        total=total,
        category_summary=category_summary or "None",
        line_items=line_items
    )

    model = genai.GenerativeModel("gemini-2.5-flash")
    try:
        response = model.generate_content(prompt)
        return extract_response_text(response)
    except Exception as e:
        print("❌ Exception during GenAI call:", e)
        return "An error occurred while generating summary."




