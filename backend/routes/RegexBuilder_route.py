from flask import Blueprint, request, jsonify
import os
import json
import google.generativeai as genai
import re

regex_bp = Blueprint('regex_builder', __name__, url_prefix='/api')

api_key = os.environ.get('GEMINI_API_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')

@regex_bp.route('/regex-builder/generate', methods=['POST'])
def generate_regex():
    data = request.json
    if not data or 'blocks' not in data:
        return jsonify({'error': 'Missing required blocks parameter'}), 400
    
    blocks = data['blocks']

    pattern_parts = []
    human_description = []
    
    for block in blocks:
        block_type = block.get('type')
        
        if block_type == 'fixed':
            value = block.get('value', '')
            pattern_parts.append(re.escape(value))
            human_description.append(f"the text '{value}'")

        elif block_type == 'variable':
            char_set = block.get('characterSet', 'any')
            length = block.get('length', {})
            
            if char_set == 'custom' and 'customCharacters' in block:
                custom_chars = block.get('customCharacters', '')
                if not custom_chars:
                    # Empty character set, fallback to any
                    char_pattern = '.'
                    char_description = 'any character'
                else:
                    # Escape special characters in the custom character set
                    escaped_chars = []
                    for char in custom_chars:
                        if char in r'\.^$*+?()[]{}|':  # Special regex chars
                            escaped_chars.append('\\' + char)
                        else:
                            escaped_chars.append(char)
                    char_pattern = '[' + ''.join(escaped_chars) + ']'
                    char_description = f"character from set '{custom_chars}'"
            else:
                # Map character sets to regex patterns
                char_patterns = {
                    'digits': '\\d',
                    'letters': '[a-zA-Z]',
                    'lowercase': '[a-z]',
                    'uppercase': '[A-Z]',
                    'alphanumeric': '[a-zA-Z0-9]',
                    'symbols': '[\\W_]',
                    'any': '.'
                }
                
                char_descriptions = {
                    'digits': 'digit',
                    'letters': 'letter',
                    'lowercase': 'lowercase letter',
                    'uppercase': 'uppercase letter',
                    'alphanumeric': 'alphanumeric character',
                    'symbols': 'symbol',
                    'any': 'any character'
                }
                
                char_pattern = char_patterns.get(char_set, '.')
                char_description = char_descriptions.get(char_set, 'character')
            
            # Handle length specifications
            if 'exact' in length:
                pattern_parts.append(f"{char_pattern}{{{length['exact']}}}")
                human_description.append(f"exactly {length['exact']} {char_description} characters")
            elif 'min' in length and 'max' in length:
                pattern_parts.append(f"{char_pattern}{{{length['min']},{length['max']}}}")
                human_description.append(f"between {length['min']} and {length['max']} {char_description} characters")
            elif 'min' in length:
                pattern_parts.append(f"{char_pattern}{{{length['min']},}}")
                human_description.append(f"at least {length['min']} {char_description} characters")
            elif 'max' in length:
                pattern_parts.append(f"{char_pattern}{{0,{length['max']}}}")
                human_description.append(f"up to {length['max']} {char_description} characters")
            else:
                pattern_parts.append(f"{char_pattern}+")
                human_description.append(f"one or more {char_description} characters")

    manual_pattern = ''.join(pattern_parts)
    pattern_description = ' followed by '.join(human_description)
    
    prompt = f"""
    I am building a regex pattern generator tool. Please analyze and optimize this regex pattern.
    
    HUMAN DESCRIPTION:
    {pattern_description}
    
    GENERATED PATTERN:
    {manual_pattern}
    
    YOUR TASKS:
    1. Verify if the pattern is correct for the described requirements
    2. If there are any issues, provide an optimized pattern
    3. Check for common regex mistakes (e.g., improper escaping, greedy quantifiers when unneeded)
    4. Make the pattern more efficient if possible
    5. Provide a clear explanation for non-technical users
    6. Add example strings that would match this pattern

    RESPONSE FORMAT (use exactly this format):
    Pattern: [The final regex pattern]
    Explanation: [Brief explanation in simple language]
    Example Matches: [3-4 examples of strings that would match, comma-separated]
    Non-Matches: [2-3 examples of strings that wouldn't match, comma-separated]
    """
    
    try:
        response = model.generate_content(prompt)
        ai_response = response.text
        
        # Extract sections with more robust patterns
        pattern_match = re.search(r'Pattern:\s*([^\n]+)', ai_response)
        explanation_match = re.search(r'Explanation:\s*([\s\S]+?)(?=Example Matches:|$)', ai_response)
        examples_match = re.search(r'Example Matches:\s*([\s\S]+?)(?=Non-Matches:|$)', ai_response)
        non_matches_match = re.search(r'Non-Matches:\s*([\s\S]+)', ai_response)
        
        # Get the raw pattern from AI response
        raw_pattern = pattern_match.group(1).strip() if pattern_match else manual_pattern
        
        # Remove backticks from the beginning and end of the pattern
        final_pattern = raw_pattern.strip('`')
        
        # Rest of the code remains the same
        explanation = explanation_match.group(1).strip() if explanation_match else f"This pattern matches {pattern_description}."
        example_matches = examples_match.group(1).strip().split(',') if examples_match else []
        non_matches = non_matches_match.group(1).strip().split(',') if non_matches_match else []
        
        # Validate the pattern
        try:
            # Test if the pattern is valid regex
            re.compile(final_pattern)
            pattern_valid = True
        except re.error:
            # If invalid, fall back to the manual pattern
            final_pattern = manual_pattern
            pattern_valid = False
        
        return jsonify({
            'success': True,
            'pattern': final_pattern,
            'explanation': explanation,
            'manual_pattern': manual_pattern,
            'examples': {
                'matches': [s.strip() for s in example_matches],
                'non_matches': [s.strip() for s in non_matches]
            },
            'pattern_source': 'ai' if pattern_valid and final_pattern != manual_pattern else 'manual'
        })
    
    except Exception as e:
        # Fallback to manually generated pattern if Gemini API fails
        return jsonify({
            'success': True,
            'pattern': manual_pattern[1:-1],
            'explanation': f"This pattern matches {pattern_description}.",
            'error': str(e)
        })

@regex_bp.route('/regex-builder/test', methods=['POST'])
def test_regex():
    data = request.json
    if not data or 'pattern' not in data or 'testString' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    pattern = data['pattern']
    test_string = data['testString']
    match_type = data.get('matchType', 'fullmatch')  # Options: fullmatch, search, findall
    
    try:
        # Compile the regex pattern
        regex = re.compile(pattern)
        result = {
            'success': True,
            'pattern': pattern,
            'input': test_string,
            'matchType': match_type
        }
        
        # Test the pattern based on match type
        if match_type == 'fullmatch':
            match = regex.search(test_string)
            if match:
                result.update({
                    'isMatch': True,
                    'matchData': {
                        'span': match.span(),
                        'start': match.start(),
                        'end': match.end(),
                        'groups': list(match.groups() or []),
                        'groupdict': match.groupdict(),
                        'matched': match.group(0)
                    }
                })
            else:
                result['isMatch'] = False
                
        elif match_type == 'search':
            match = regex.search(test_string)
            if match:
                result.update({
                    'isMatch': True,
                    'matchData': {
                        'span': match.span(),
                        'start': match.start(),
                        'end': match.end(),
                        'groups': list(match.groups() or []),
                        'groupdict': match.groupdict(),
                        'matched': match.group(0)
                    }
                })
            else:
                result['isMatch'] = False
                
        elif match_type == 'findall':
            matches = regex.findall(test_string)
            if matches:
                result.update({
                    'isMatch': True,
                    'matchCount': len(matches),
                    'matches': matches
                })
            else:
                result['isMatch'] = False
                result['matches'] = []
        
        # Add pattern analysis
        pattern_analysis = analyze_pattern(pattern)
        result['patternAnalysis'] = pattern_analysis
        
        return jsonify(result)
    
    except re.error as e:
        return jsonify({
            'success': False, 
            'error': f"Invalid regex pattern: {str(e)}",
            'errorPosition': e.pos if hasattr(e, 'pos') else None,
            'pattern': pattern
        }), 400

def analyze_pattern(pattern):
    """Analyze regex pattern and provide insights"""
    analysis = {
        'length': len(pattern),
        'features': []
    }
    
    # Detect common regex features
    if '\\d' in pattern:
        analysis['features'].append('digits')
    if '\\w' in pattern:
        analysis['features'].append('word_chars')
    if '\\s' in pattern:
        analysis['features'].append('whitespace')
    if '[' in pattern and ']' in pattern:
        analysis['features'].append('character_class')
    if '(' in pattern and ')' in pattern:
        analysis['features'].append('groups')
    if '|' in pattern:
        analysis['features'].append('alternation')
    if '+' in pattern:
        analysis['features'].append('one_or_more')
    if '*' in pattern:
        analysis['features'].append('zero_or_more')
    if '?' in pattern:
        analysis['features'].append('optional')
    if '{' in pattern and '}' in pattern:
        analysis['features'].append('repetition')
    if '^' in pattern:
        analysis['features'].append('start_anchor')
    if '$' in pattern:
        analysis['features'].append('end_anchor')
        
    return analysis