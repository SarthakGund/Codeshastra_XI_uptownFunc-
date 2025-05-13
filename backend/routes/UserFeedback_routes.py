from flask import request, jsonify
from user_feedback import save_feedback, get_all_feedback
from flask import Blueprint

feedback_bp = Blueprint('feedback', __name__, url_prefix ='/api')

@feedback_bp.route('/feedback', methods=['POST'])
def post_feedback():
    data = request.get_json()
    if not data or 'feedback' not in data:
        return jsonify({"error": "Missing 'feedback' parameter"}), 400

    feedback_entry = {"feedback": data["feedback"]}
    try:
        saved_entry = save_feedback(feedback_entry)
        return jsonify({"message": "Feedback received", "data": saved_entry}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@feedback_bp.route('/feedback', methods=['GET'])
def fetch_feedback():
    try:
        all_feedback = get_all_feedback()
        return jsonify({"feedback": all_feedback}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500