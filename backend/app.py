from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from routes.RandomPassNo_route import rpn_bp

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.register_blueprint(rpn_bp)

@app.route('/api', methods=['GET'])
def api():
    return jsonify({"message": "Welcome to the API!"})

if __name__ == '__main__':
    app.run(debug=True, port=5050)


