from flask import Blueprint, request, jsonify, send_file
import os
import uuid
import pytesseract
from PIL import Image
import io
from docx import Document
from fpdf import FPDF
import cv2
import numpy as np

ocr_bp = Blueprint('ocr', __name__, url_prefix='/api')

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'outputs')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

TESSERACT_CONFIG = '--oem 3 --psm 6 -l eng'

@ocr_bp.route('/ocr/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    try:
        img = cv2.imread(filepath)
        if img is None:
            return jsonify({'error': 'Could not read image file'}), 400
        
        # 1. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Applying noise reduction
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # 3. Applying thresholding - try both to see which works better
        # Adaptive threshold
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                     cv2.THRESH_BINARY, 11, 2)
                                     
        # 4. Dilation and erosion to enhance text
        kernel = np.ones((1, 1), np.uint8)
        thresh = cv2.dilate(thresh, kernel, iterations=1)
        thresh = cv2.erode(thresh, kernel, iterations=1)
        
        # 5. additional sharpening
        sharpen_kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpen = cv2.filter2D(thresh, -1, sharpen_kernel)
        
        # 6. both processing variants
        processed_images = [
            Image.fromarray(thresh),  # Standard threshold
            Image.fromarray(sharpen),  # Sharpened
            Image.fromarray(gray)      # Just grayscale
        ]
        
        best_text = ""
        best_confidence = 0
        
        for img_variant in processed_images:
            # Getting OCR data including confidence values
            data = pytesseract.image_to_data(img_variant, config=TESSERACT_CONFIG, output_type=pytesseract.Output.DICT)
            
            # Calculating average confidence for this processing method
            confidences = [int(conf) for conf in data['conf'] if conf != '-1']
            if confidences:
                avg_confidence = sum(confidences) / len(confidences)
                
                # Extracting text from this variant
                variant_text = pytesseract.image_to_string(img_variant, config=TESSERACT_CONFIG)
                
                # If this variant has better confidence, use its text
                if avg_confidence > best_confidence and len(variant_text.strip()) > 0:
                    best_confidence = avg_confidence
                    best_text = variant_text
        
        # If no good result was found, fall back to basic OCR
        if not best_text:
            best_text = pytesseract.image_to_string(Image.open(filepath), config=TESSERACT_CONFIG)
        
        file_id = os.path.splitext(filename)[0]
        pdf_path = os.path.join(OUTPUT_FOLDER, f"{file_id}.pdf")
        docx_path = os.path.join(OUTPUT_FOLDER, f"{file_id}.docx")
        
        create_pdf(best_text, pdf_path)
        create_docx(best_text, docx_path)

        return jsonify({
            'success': True,
            'text': best_text,
            'pdf_url': f"/api/ocr/download/pdf/{file_id}",
            'docx_url': f"/api/ocr/download/docx/{file_id}"
        })
    
    except Exception as e:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except:
                pass
        return jsonify({'error': str(e)}), 500

def create_pdf(text, output_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Split text into lines and handle encoding for special characters
    lines = text.split('\n')
    for line in lines:
        encoded_line = line.encode('latin-1', 'replace').decode('latin-1')
        pdf.cell(200, 10, txt=encoded_line, ln=True)
    
    pdf.output(output_path)

def create_docx(text, output_path):
    doc = Document()
    doc.add_paragraph(text)
    doc.save(output_path)

@ocr_bp.route('/ocr/download/pdf/<filename>')
def download_pdf(filename):
    filepath = os.path.join(OUTPUT_FOLDER, f"{filename}.pdf")
    if not os.path.exists(filepath):
        return jsonify({'error': 'PDF file not found'}), 404
    
    return send_file(filepath,
                    mimetype='application/pdf',
                    as_attachment=True,
                    download_name=f"ocr-result.pdf")

@ocr_bp.route('/ocr/download/docx/<filename>')
def download_docx(filename):
    filepath = os.path.join(OUTPUT_FOLDER, f"{filename}.docx")
    if not os.path.exists(filepath):
        return jsonify({'error': 'DOCX file not found'}), 404
    
    return send_file(filepath,
                    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    as_attachment=True,
                    download_name=f"ocr-result.docx")