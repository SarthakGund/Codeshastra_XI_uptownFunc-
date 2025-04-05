from flask import Blueprint, request, jsonify
from flask_cors import CORS
from qrnbarcodegen import generate_barcode_base64  
from qrnbarcodegen import generate_qr_code_base64 
from imageconverter import convert_image

ig_bp = Blueprint('image_gen', __name__, url_prefix='/api')    
# CORS(ig_bp)

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

@ig_bp.route('/convert-image', methods=['POST'])
def convert_image_route():
    # Check if file was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided.'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file.'}), 400
    
    # Get target format
    target_format = request.form.get('format', 'PNG')
    valid_formats = ['JPEG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP', 'PDF']
    
    if target_format not in valid_formats:
        return jsonify({'error': f'Invalid format. Supported formats: {", ".join(valid_formats)}'}), 400
    
    try:
        image_data = file.read()
        converted_image = convert_image(image_data, target_format)
        return jsonify({
            'converted_image': converted_image,
            'format': target_format
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400