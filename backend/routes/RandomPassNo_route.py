from flask import Blueprint, request, jsonify
from randomno import *
from randompassword import generate_secure_password, password_entropy

rpn_bp = Blueprint('random_pass_no', __name__, url_prefix='/api')

@rpn_bp.route('/random-no', methods=['POST'])
def random_no():
    data = request.json
    start = data.get('start', 0)
    end = data.get('end', 20)
    uuid0 = generate_random_number(start, end)
    uuid1 = generate_uuid1()
    uuid2 = generate_uuid4()
    return jsonify({"random_number": uuid0, "uuid1": uuid1, "uuid2": uuid2}), 200

@rpn_bp.route('/random-pass', methods=['GET','POST'])
def random_pass():
    data = request.json
    length = data.get('length', 12)
    use_symbols = data.get('symbols', True)
    use_numbers = data.get('numbers', True)
    
    try:
        password = generate_secure_password(length, use_symbols, use_numbers)
        entropy = password_entropy(password)
        
        strength = "Weak"
        if entropy >= 60:
            strength = "Strong"
        elif entropy >= 40:
            strength = "Moderate"
            
        return jsonify({
            "password": password,
            "entropy": entropy,
            "strength": strength
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400