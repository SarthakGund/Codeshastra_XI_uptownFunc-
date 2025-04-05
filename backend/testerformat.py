import os
import requests
import json

BASE_URL = "http://localhost:5050/api"
INPUT_DIR = './code/input'
OUTPUT_DIR = './code/output'

# Map file extensions to languages
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

def test_format_file(file_path, indent_type='spaces', indent_size=4):
    """Test formatting a file by sending it to the API."""
    _, ext = os.path.splitext(file_path)
    language = EXTENSION_TO_LANGUAGE.get(ext)
    
    if not language:
        print(f"Unsupported file extension: {ext}")
        return None
    
    with open(file_path, 'r') as f:
        code = f.read()

    url = f"{BASE_URL}/format"
    headers = {'Content-Type': 'application/json'}
    payload = {
        'language': language,
        'code': code,
        'indent_type': indent_type,
        'indent_size': indent_size
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        base_name = os.path.basename(file_path)
        output_file_name = f"formatted_{base_name}"
        output_file_path = os.path.join(OUTPUT_DIR, output_file_name)

        with open(output_file_path, 'w') as f:
            f.write(result.get('formatted_code', ''))
        
        return {
            'file': file_path,
            'language': language,
            'success': 'errors' not in result or result['errors'] is None,
            'errors': result.get('errors'),
            'output_file': output_file_path
        }
    
    except requests.RequestException as e:
        print(f"Request error: {e}")
        return {
            'file': file_path,
            'language': language,
            'success': False,
            'errors': str(e),
            'output_file': None
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'file': file_path,
            'language': language,
            'success': False,
            'errors': str(e),
            'output_file': None
        }

def test_all_files():
    """Test formatting for all files in the input directory."""
    results = []
    
    for file_name in os.listdir(INPUT_DIR):
        file_path = os.path.join(INPUT_DIR, file_name)
        if os.path.isfile(file_path):
            print(f"Testing formatting for: {file_name}")
            result = test_format_file(file_path)
            if result:
                results.append(result)
    
    print("\n" + "="*50)
    print("FORMATTING RESULTS SUMMARY")
    print("="*50)
    for result in results:
        status = "SUCCESS" if result['success'] else "FAILED"
        print(f"{os.path.basename(result['file'])} ({result['language']}): {status}")
        if not result['success'] and result['errors']:
            print(f"  Errors: {result['errors']}")
    print("="*50)

if __name__ == "__main__":
    test_all_files()