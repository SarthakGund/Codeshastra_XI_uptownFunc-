from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
from io import BytesIO
import os
import mimetypes

cet_bp = Blueprint('cet', __name__, url_prefix='/api')
# CORS(cet_bp)

@cet_bp.route('/csv-to-excel', methods=['POST'])
def csv_to_excel():
    max_size = 10 * 1024 * 1024 
    if request.content_length > max_size:
        return jsonify({"error": "File too large, max size is 10MB"}), 413
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file format. Please upload a CSV file"}), 400
    
    mime_type = file.content_type
    if not mime_type or 'csv' not in mime_type.lower() and 'text/plain' not in mime_type.lower():
        return jsonify({"error": "Invalid file type. Expected CSV content"}), 400
    
    try:
        file_data = file.read()
        file_stream = BytesIO(file_data)
        
        try:
            df = pd.read_csv(file_stream)
        except UnicodeDecodeError:
            file_stream.seek(0)
            df = pd.read_csv(file_stream, encoding='latin1')
        except pd.errors.ParserError:
            return jsonify({"error": "CSV parsing error. The file appears to be malformed"}), 400
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl', mode='w') as writer:
            writer.book.security.lockStructure = True
            
            df.to_excel(writer, index=False)
            
        output.seek(0)
        
        return send_file(
            output,
            as_attachment=True,
            download_name=os.path.splitext(file.filename)[0] + '.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@cet_bp.route('/excel-to-csv', methods=['POST'])
def excel_to_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        try:
            df = pd.read_excel(BytesIO(file.read()))
            
            output = BytesIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return send_file(
                output,
                as_attachment=True,
                download_name=os.path.splitext(file.filename)[0] + '.csv',
                mimetype='text/csv'
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid file format. Please upload an Excel file (.xlsx or .xls)"}), 400