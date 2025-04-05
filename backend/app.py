from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from routes.RandomPassNo_route import rpn_bp
from routes.CsvExcelTools_route import cet_bp
from routes.ImageGen_route import ig_bp
from routes.NetworkTools_route import nt_bp
from routes.ApiTools_route import at_bp
from routes.CodeFormatters_route import cfv_bp

app = Flask(__name__)
CORS(app)
load_dotenv()

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.register_blueprint(rpn_bp)
app.register_blueprint(cet_bp)
app.register_blueprint(ig_bp)
app.register_blueprint(nt_bp)
app.register_blueprint(at_bp)
app.register_blueprint(cfv_bp)

@app.route('/api', methods=['GET'])
def api():
    return jsonify({"message": "Welcome to the API!"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5050)


