import json
import os
from datetime import datetime

FEEDBACK_FILE = os.path.join(os.getcwd(), "feedback.json")

def save_feedback(feedback_data):
    """
    Save feedback data to a JSON file.
    If the file exists, load current feedback, append new entry, and rewrite.
    """
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r') as f:
            try:
                all_feedback = json.load(f)
            except json.JSONDecodeError:
                all_feedback = []
    else:
        all_feedback = []

    # Enrich feedback with a timestamp.
    feedback_data["timestamp"] = datetime.utcnow().isoformat()
    all_feedback.append(feedback_data)

    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(all_feedback, f)

    return feedback_data

def get_all_feedback():
    """
    Retrieve all feedback entries from the JSON file.
    """
    if not os.path.exists(FEEDBACK_FILE):
        return []
    with open(FEEDBACK_FILE, 'r') as f:
        try:
            all_feedback = json.load(f)
        except json.JSONDecodeError:
            all_feedback = []
    return all_feedback