from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os

# Add the backend directory to the path so we can import modules from there
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.routes.RandomPassNo_route import rpn_bp
from backend.routes.CsvExcelTools_route import cet_bp
from backend.routes.ImageGen_route import ig_bp
from backend.routes.NetworkTools_route import nt_bp
from backend.routes.ApiTools_route import at_bp
from backend.routes.CodeFormatters_route import cfv_bp
from backend.routes.OCR_route import ocr_bp
from backend.routes.RegexBuilder_route import regex_bp
from backend.routes.UnitConverter_route import uc_bp
from backend.routes.UserFeedback_routes import feedback_bp
from backend.routes.SqlConverter_route import sql_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Register API blueprints
app.register_blueprint(rpn_bp)
app.register_blueprint(cet_bp)
app.register_blueprint(ig_bp)
app.register_blueprint(nt_bp)
app.register_blueprint(at_bp)
app.register_blueprint(cfv_bp)
app.register_blueprint(ocr_bp)
app.register_blueprint(regex_bp)
app.register_blueprint(uc_bp)
app.register_blueprint(feedback_bp)
app.register_blueprint(sql_bp)

@app.route('/api', methods=['GET'])
def api():
    return jsonify({"message": "Welcome to the API!"}), 200

# Vercel uses this to handle serverless functions
app.debug = False

# For compatibility with Vercel serverless functions
from http.server import BaseHTTPRequestHandler

def handler(event, context):
    return app(event, context)
