from flask import Blueprint, request, jsonify
import os
import json
import google.generativeai as genai
import re

sql_bp = Blueprint('sql_converter', __name__, url_prefix='/api')

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')

@sql_bp.route('/sql-convert', methods=['POST'])
def convert_sql():
    try:
        data = request.json
        
        if not data or 'source_sql' not in data or 'target_dialect' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required parameters: source_sql and target_dialect'
            }), 400
            
        source_sql = data['source_sql']
        source_dialect = data.get('source_dialect', 'MySQL')  # Default to MySQL if not specified
        target_dialect = data['target_dialect']
        
        prompt = f"""
        Convert the following {source_dialect} SQL query to {target_dialect} SQL.
        
        Source SQL ({source_dialect}):
        ```sql
        {source_sql}
        ```
        
        Respond with only the converted SQL code without any explanation or markdown.
        """

        response = model.generate_content(prompt)
        converted_sql = response.text
        
        # Add debugging info
        # print(f"Response from Gemini API: {response}")
        
        converted_sql = re.sub(r'```sql\s*|\s*```', '', converted_sql).strip()
        
        return jsonify({
            'success': True,
            'source_dialect': source_dialect,
            'target_dialect': target_dialect,
            'source_sql': source_sql,
            'converted_sql': converted_sql
        })
        
    except Exception as e:
        # Log the detailed error
        import traceback
        print(f"Error in /convert: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sql_bp.route('/sql-generate-mock', methods=['POST'])
def generate_mock_data():
    try:
        data = request.json
        
        if not data or 'table_schema' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: table_schema'
            }), 400
            
        table_schema = data['table_schema']
        num_records = data.get('num_records', 10)

        prompt = f"""
        Generate {num_records} rows of realistic mock data based on the following SQL table schema:
        
        ```sql
        {table_schema}
        ```
        
        Return the result as a JSON array of objects where each object represents a row of data.
        Each object should have keys matching the column names from the schema, and values should be 
        appropriate for the column types. Do not include any explanation, just return valid JSON.
        """

        response = model.generate_content(prompt)
        response_text = response.text

        try:
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response_text)
            if json_match:
                mock_data = json.loads(json_match.group(1))
            else:
                mock_data = json.loads(response_text)
                
            return jsonify({
                'success': True,
                'mock_data': mock_data,
                'count': len(mock_data)
            })
            
        except json.JSONDecodeError:
            return jsonify({
                'success': False,
                'error': 'Failed to parse generated mock data as JSON',
                'raw_response': response_text
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sql_bp.route('/sql-to-schema', methods=['POST'])
def sql_to_schema():
    try:
        data = request.json
        
        if not data or 'create_table_sql' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: create_table_sql'
            }), 400
            
        create_table_sql = data['create_table_sql']
        
        prompt = f"""
        Parse the following SQL CREATE TABLE statement and return a JSON representation of the table schema.
        
        ```sql
        {create_table_sql}
        ```
        
        Return a JSON object with the following structure:
        {{
          "table_name": "name of the table",
          "columns": [
            {{
              "name": "column name",
              "type": "data type",
              "nullable": true/false,
              "primary_key": true/false,
              "default": "default value if any"
            }}
          ]
        }}
        
        Respond with only valid JSON, no explanations.
        """
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        try:
            json_match = re.search(r'```(?:json)?\s*([\s\S]+?)\s*```', response_text)
            if json_match:
                schema = json.loads(json_match.group(1))
            else:
                schema = json.loads(response_text)
                
            return jsonify({
                'success': True,
                'schema': schema
            })
            
        except json.JSONDecodeError:
            return jsonify({
                'success': False,
                'error': 'Failed to parse schema as JSON',
                'raw_response': response_text
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500