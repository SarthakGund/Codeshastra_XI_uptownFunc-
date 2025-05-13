from flask import Blueprint, request, jsonify

tf_bp = Blueprint('text_formatter', __name__, url_prefix='/api')

@tf_bp.route('/csv-formatter', methods=['POST'])
def csv_formatter():
    data = request.get_json()
    csv_data = data.get('csv_data', '')
    
    # Process the CSV data here
    # For demonstration, we'll just return the received data
    return jsonify({"formatted_csv": csv_data})