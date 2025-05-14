from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from firebase_admin import credentials, initialize_app, firestore
from dotenv import load_dotenv
from flask_mail import Mail
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
from routes.Auth_routes import auth_bp

app = Flask(__name__, static_folder='../out', static_url_path='/')
load_dotenv()

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
app.config['MAIL_PORT'] = os.environ.get('MAIL_PORT')
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS')
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_AUTHENTICATE'] = os.environ.get('MAIL_AUTHENTICATE')

cred = credentials.Certificate(os.environ.get('FIREBASE_SERVICE_ACCOUNT'))
firebase_app = initialize_app(cred)
app.db = firestore.client()

app.mail = Mail(app)

CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

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
app.register_blueprint(auth_bp)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_next_build(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(405)
def method_not_allowed(e):
    return {"error": "Method not allowed", "message": str(e)}, 405

if __name__ == "__main__":
    app.run(debug=True, port=5000)


