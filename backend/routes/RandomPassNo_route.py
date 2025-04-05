from flask import Blueprint, request, jsonify
from flask_cors import CORS
from randomno import *

rpn_bp = Blueprint('random_pass_no', __name__, url_prefix='/api')
CORS(rpn_bp)

@rpn_bp.route('/random-pass', methods=['POST'])
def random_pass():
    data = request.json
    start = data.get('start', 0)
    end = data.get('end', 20)
    uuid0 = generate_random_number(start, end)
    uuid1 = generate_uuid1()
    uuid2 = generate_uuid4()
    return jsonify({"random_number": uuid0, "uuid1": uuid1, "uuid2": uuid2})
