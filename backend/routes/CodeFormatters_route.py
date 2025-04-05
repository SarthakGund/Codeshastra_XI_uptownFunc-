from flask import Blueprint, request, jsonify
from flask_cors import CORS
import json
import re
import os
import google.generativeai as genai
import yaml

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "your-api-key-here")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')

cfv_bp = Blueprint('code_formatters', __name__, url_prefix='/api')
CORS(cfv_bp)

# Helper functions for formatting and validation using Gemini
def format_with_gemini(code, language, indent_type='spaces', indent_size=4):
    try:
        prompt = f"""
        Format the following {language} code according to best practices.
        Use {indent_size} {indent_type} for indentation.
        Return ONLY the formatted code without any explanations or markdown.
        
        Code to format:
        ```{language}
        {code}
        ```
        """
        
        response = model.generate_content(prompt, generation_config={
            'temperature': 0.1,  
            'top_p': 0.95,
            'max_output_tokens': 4096
        })
        formatted_text = response.text.strip()

        code_block_pattern = r"```[\w]*\n([\s\S]*?)\n```"
        match = re.search(code_block_pattern, formatted_text)
        if match:
            formatted_code = match.group(1).strip()
        else:
            formatted_code = formatted_text
        
        return {"formatted_code": formatted_code, "errors": None}
    except Exception as e:
        return {"formatted_code": code, "errors": str(e)}

def validate_with_gemini(code, language):
    try:
        prompt = f"""
        You are a code validator specialized in {language}. Analyze the following code for issues:

        ```{language}
        {code}
        ```

        Provide your analysis in this EXACT format with NO additional text:

        STATUS: [Write only "VALID" if the code has no issues or "INVALID" if any issues were found]

        ISSUES:
        [If INVALID, provide a structured list of issues separated by category. If VALID, write "None"]

        FORMAT:
        - Each issue should be on a new line starting with a dash
        - Group issues by type: "Syntax Errors:", "Style Issues:", "Best Practices:"
        - Be specific but concise in describing each issue
        - Do not include code snippets, only describe the issues
        - Do not suggest solutions, only identify problems
        
        Examples of correct responses:
        
        Example 1 (Valid code):
        ```
        STATUS: VALID
        
        ISSUES:
        None
        ```
        
        Example 2 (Invalid code):
        ```
        STATUS: INVALID
        
        ISSUES:
        Syntax Errors:
        - Missing semicolon on line 5
        - Unclosed parenthesis on line 8
        
        Style Issues:
        - Inconsistent indentation throughout the code
        - Variable names do not follow {language} conventions
        
        Best Practices:
        - Unused variables: x, temp_value
        - Function is too complex, consider breaking it down
        ```
        """
        
        response = model.generate_content(prompt, generation_config={
            'temperature': 0.05,  #lower temperature for stricter deterministic responses
            'top_p': 0.9,
            'top_k': 20,          # constraining responses
            'max_output_tokens': 1024,
            'response_mime_type': 'text/plain'  # plain text response
        })
        
        result = response.text.strip()
        
        #paarse the response with improveed structure handling
        if "STATUS: VALID" in result:
            return {"valid": True, "errors": None}
        elif "STATUS: INVALID" in result:
            # Extract the issues section from reponse
            try:
                parts = result.split("ISSUES:", 1)
                if len(parts) > 1:
                    error_message = parts[1].strip()
                    # If errors is "None" after ISSUES but the status was INVALID, this is a parsing error
                    if error_message.strip() == "None":
                        return {"valid": False, "errors": "Code has issues but couldn't extract details."}
                    return {"valid": False, "errors": error_message}
                else:
                    return {"valid": False, "errors": "Code has issues but couldn't extract details."}
            except Exception as parsing_error:
                return {"valid": False, "errors": f"Code has issues. Parser error: {str(parsing_error)}"}
        else:
            #we can't determine validity, try to extract useful information
            if "ISSUES:" in result:
                parts = result.split("ISSUES:", 1)
                error_message = parts[1].strip()
                return {"valid": False, "errors": error_message}
            else:
                # As a fallback, return the entire response if we couldn't parse it
                return {"valid": False, "errors": "Couldn't determine validity. Raw output: " + result[:200]}
    except Exception as e:
        return {"valid": False, "errors": str(e)}

def format_python(code):
    return format_with_gemini(code, "python")

def format_javascript(code):
    return format_with_gemini(code, "javascript")

def format_html(code):
    return format_with_gemini(code, "html")

def format_css(code):
    return format_with_gemini(code, "css")

def format_c(code):
    return format_with_gemini(code, "c")

def format_json(code, indent_type='spaces', indent_size=4):
    try:
        #native JSON parsing for validation if possible
        parsed = json.loads(code)
        
        # Calculates indentation string
        indent_str = ' ' * indent_size if indent_type == 'spaces' else '\t'
        
        # Use Gemini for formatting
        gemini_result = format_with_gemini(code, "json", indent_type, indent_size)
        
        # As a fallback, use Python's json.dumps if Gemini fails
        if gemini_result["errors"]:
            formatted_code = json.dumps(parsed, indent=indent_str)
            return {"formatted_code": formatted_code, "errors": None}
        return gemini_result
    except json.JSONDecodeError as e:
        return {"formatted_code": code, "errors": str(e)}
    except Exception as e:
        return {"formatted_code": code, "errors": str(e)}

def format_xml(code, indent_type='spaces', indent_size=4):
    try:
        # attempt to parse XML to validate it
        import xml.dom.minidom as minidom
        parsed = minidom.parseString(code)
        
        # Use Gemini for formatting
        return format_with_gemini(code, "xml", indent_type, indent_size)
    except Exception as e:
        return {"formatted_code": code, "errors": str(e)}

def format_yaml(code, indent_type='spaces', indent_size=4):
    try:
        # First try native YAML parsing for validation
        parsed = yaml.safe_load(code)
        
        # Use Gemini for formatting
        return format_with_gemini(code, "yaml", indent_type, indent_size)
    except Exception as e:
        return {"formatted_code": code, "errors": str(e)}

def validate_python(code):
    return validate_with_gemini(code, "python")

def validate_javascript(code):
    return validate_with_gemini(code, "javascript")

def validate_html(code):
    return validate_with_gemini(code, "html")

def validate_css(code):
    return validate_with_gemini(code, "css")

def validate_c(code):
    return validate_with_gemini(code, "c")

@cfv_bp.route('/format', methods=['POST'])
def format_code():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    code = data.get('code')
    language = data.get('language', '').lower()
    
    #(default: 4 spaces)
    indent_type = data.get('indent_type', 'spaces')
    indent_size = data.get('indent_size', 4)
    
    if not code:
        return jsonify({"error": "No code provided"}), 400
    
    if not language:
        return jsonify({"error": "No language specified"}), 400
    
    formatters = {
        'python': lambda c: format_with_gemini(c, 'python', indent_type, indent_size),
        'javascript': lambda c: format_with_gemini(c, 'javascript', indent_type, indent_size),
        'js': lambda c: format_with_gemini(c, 'javascript', indent_type, indent_size),
        'html': lambda c: format_with_gemini(c, 'html', indent_type, indent_size),
        'css': lambda c: format_with_gemini(c, 'css', indent_type, indent_size),
        'json': lambda c: format_json(c, indent_type, indent_size),
        'xml': lambda c: format_xml(c, indent_type, indent_size),
        'yaml': lambda c: format_yaml(c, indent_type, indent_size),
        'yml': lambda c: format_yaml(c, indent_type, indent_size),
        'c': lambda c: format_with_gemini(c, 'c', indent_type, indent_size)
    }
    
    formatter = formatters.get(language)
    if not formatter:
        return jsonify({"error": f"Formatting not supported for language: {language}"}), 400
    
    result = formatter(code)
    return jsonify(result), 200

@cfv_bp.route('/validate', methods=['POST'])
def validate_code():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    code = data.get('code')
    language = data.get('language', '').lower()
    
    if not code:
        return jsonify({"error": "No code provided"}), 400
    
    if not language:
        return jsonify({"error": "No language specified"}), 400
    
    validators = {
        'python': validate_python,
        'javascript': validate_javascript,
        'js': validate_javascript,
        'html': validate_html,
        'css': validate_css,
        'c': validate_c,
        'json': lambda c: {"valid": format_json(c)["errors"] is None, "errors": format_json(c)["errors"]},
        'xml': lambda c: {"valid": format_xml(c)["errors"] is None, "errors": format_xml(c)["errors"]},
        'yaml': lambda c: {"valid": format_yaml(c)["errors"] is None, "errors": format_yaml(c)["errors"]},
        'yml': lambda c: {"valid": format_yaml(c)["errors"] is None, "errors": format_yaml(c)["errors"]}
    }
    
    validator = validators.get(language)
    if not validator:
        return jsonify({"error": f"Validation not supported for language: {language}"}), 400
    
    result = validator(code)
    return jsonify(result), 200