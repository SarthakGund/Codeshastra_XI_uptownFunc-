from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from routes.RandomPassNo_route import rpn_bp
from routes.CsvExcelTools_route import cet_bp
from routes.ImageGen_route import ig_bp
from routes.NetworkTools_route import nt_bp
from routes.ApiTools_route import at_bp
from routes.CodeFormatters_route import cfv_bp
from routes.OCR_route import ocr_bp
from routes.RegexBuilder_route import regex_bp
from routes.UnitConverter_route import uc_bp
from routes.UserFeedback_routes import feedback_bp
from routes.SqlConverter_route import sql_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
load_dotenv()

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

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

# Define the path to the Next.js build directory
NEXT_BUILD_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'out')

@app.route('/api', methods=['GET'])
def api():
    return jsonify({"message": "Welcome to the API!"}), 200

# Serve static files from Next.js build
@app.route('/_next/<path:path>')
def next_static(path):
    return send_from_directory(os.path.join(NEXT_BUILD_PATH, '_next'), path)

# Serve public files (images, etc.)
@app.route('/public/<path:path>')
def public_files(path):
    return send_from_directory(os.path.join(NEXT_BUILD_PATH, 'public'), path)

# Catch-all route for Next.js pages
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # First try to serve specific HTML files
    html_path = os.path.join(NEXT_BUILD_PATH, path)
    if os.path.exists(html_path + '.html'):
        return send_from_directory(NEXT_BUILD_PATH, path + '.html')
    elif os.path.exists(html_path) and os.path.isfile(html_path):
        return send_from_directory(NEXT_BUILD_PATH, path)
    elif os.path.exists(os.path.join(html_path, 'index.html')):
        return send_from_directory(os.path.join(NEXT_BUILD_PATH, path), 'index.html')
    else:
        # Default to index.html for SPA routing
        return send_from_directory(NEXT_BUILD_PATH, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5050)


