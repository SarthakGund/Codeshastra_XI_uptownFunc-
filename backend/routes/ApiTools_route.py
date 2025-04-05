from flask import Blueprint, request, jsonify
from flask_cors import CORS
import requests
import time
import json
import xml.dom.minidom
import uuid


at_bp = Blueprint('api_tools', __name__, url_prefix='/api')
# CORS(at_bp)

@at_bp.route('/request', methods=['POST'])
def make_request():
    data = request.json
    if not data:
        return jsonify({"error": "No request data provided"}), 400
    
    method = data.get('method', 'GET').upper()
    url = data.get('url')
    headers = data.get('headers', {})
    body = data.get('body')
    params = data.get('params', {})
    timeout = data.get('timeout', 30)
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        if body and isinstance(body, str):
            try:
                body = json.loads(body)
            except:
                pass
        
        start_time = time.time()
        
        if method == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=timeout)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=body, params=params, timeout=timeout)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=body, params=params, timeout=timeout)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, json=body, params=params, timeout=timeout)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=body, params=params, timeout=timeout)
        else:
            return jsonify({"error": f"Unsupported HTTP method: {method}"}), 400
        
        elapsed_time = time.time() - start_time

        content_type = response.headers.get('Content-Type', '')
        response_body = None
        
        if 'application/json' in content_type:
            try:
                response_body = response.json()
            except:
                response_body = response.text
        elif 'application/xml' in content_type or 'text/xml' in content_type:
            try:
                dom = xml.dom.minidom.parseString(response.text)
                response_body = dom.toprettyxml()
            except:
                response_body = response.text
        else:
            response_body = response.text
        
        request_id = str(uuid.uuid4())
        
        result = {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "body": response_body,
            "elapsed_ms": round(elapsed_time * 1000, 2),
            "request_id": request_id
        }
        
        return jsonify(result), 200
    
    except requests.exceptions.Timeout:
        return jsonify({"error": f"Request timed out after {timeout} seconds"}), 408
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Failed to establish connection to the server"}), 502
    except requests.exceptions.TooManyRedirects:
        return jsonify({"error": "Too many redirects"}), 400
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Request error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 500