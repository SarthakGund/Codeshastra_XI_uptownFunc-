import os
import requests
import json

BASE_URL = "http://localhost:5050/api"
INPUT_DIR = './code/input'
OUTPUT_DIR = './code/output'

EXTENSION_TO_LANGUAGE = {
    '.py': 'python',
    '.js': 'javascript',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.xml': 'xml',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.c': 'c'
}

def test_validate_file(file_path):
    """Test validating a file by sending it to the API."""
    _, ext = os.path.splitext(file_path)
    language = EXTENSION_TO_LANGUAGE.get(ext)
    
    if not language:
        print(f"Unsupported file extension: {ext}")
        return None
    
    with open(file_path, 'r') as f:
        code = f.read()
    
    url = f"{BASE_URL}/validate"
    headers = {'Content-Type': 'application/json'}
    payload = {
        'language': language,
        'code': code
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        result = response.json()
        
        base_name = os.path.basename(file_path)
        output_file_name = f"validation_{base_name}.json"
        output_file_path = os.path.join(OUTPUT_DIR, output_file_name)
        
        with open(output_file_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        return {
            'file': file_path,
            'language': language,
            'valid': result.get('valid', False),
            'errors': result.get('errors'),
            'output_file': output_file_path
        }
    
    except requests.RequestException as e:
        print(f"Request error: {e}")
        return {
            'file': file_path,
            'language': language,
            'valid': False,
            'errors': str(e),
            'output_file': None
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'file': file_path,
            'language': language,
            'valid': False,
            'errors': str(e),
            'output_file': None
        }

def test_all_files():
    """Test validation for all files in the input directory."""
    results = []
    
    for file_name in os.listdir(INPUT_DIR):
        file_path = os.path.join(INPUT_DIR, file_name)
        if os.path.isfile(file_path):
            print(f"Testing validation for: {file_name}")
            result = test_validate_file(file_path)
            if result:
                results.append(result)
    
    print("\n" + "="*50)
    print("VALIDATION RESULTS SUMMARY")
    print("="*50)
    for result in results:
        status = "VALID" if result['valid'] else "INVALID"
        print(f"{os.path.basename(result['file'])} ({result['language']}): {status}")
        if not result['valid'] and result['errors']:
            print(f"  Issues: {result['errors']}")
    print("="*50)

if __name__ == "__main__":
    test_all_files()