from flask import Blueprint, request, jsonify
from flask_cors import CORS
from qrnbarcodegen import generate_barcode_base64  
from qrnbarcodegen import generate_qr_code_base64 

ig_bp = Blueprint('image_gen', __name__, url_prefix='/api')    
CORS(ig_bp)

@ig_bp.route('/generate-barcode', methods=['POST'])
def generate_barcode():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text parameter is required.'}), 400

    barcode_b64 = generate_barcode_base64(text)
    return jsonify({'barcode': barcode_b64})

@ig_bp.route('/generate-qrcode', methods=['POST'])
def generate_qrcode():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No JSON data provided.'}), 400
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text parameter is required.'}), 400

    qr_b64 = generate_qr_code_base64(text)
    return jsonify({'qr_code': qr_b64})