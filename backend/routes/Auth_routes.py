from flask import Blueprint, request, jsonify, g, current_app
import firebase_admin
from firebase_admin import firestore
import os
import jwt
from functools import wraps
import datetime
import uuid
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def initialize_firebase_db():
    return current_app.db

# Authentication middleware with access control
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1]
            # Verify the token
            decoded_token = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            # Set the user in flask g object
            g.user_id = decoded_token['uid']
            g.email = decoded_token.get('email')
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'message': f'Invalid token: {str(e)}'}), 401
            
        return f(*args, **kwargs)
    return decorated_function

# Service access middleware - checks if user can access premium features
def service_access_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First verify the token
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1]
            # Verify the token
            decoded_token = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            # Set the user in flask g object
            user_id = decoded_token['uid']
            email = decoded_token.get('email')
            
            # Check user's plan and uses_remaining
            db = initialize_firebase_db()
            user_doc = db.collection('users').document(user_id).get()
            
            if not user_doc.exists:
                return jsonify({'message': 'User not found'}), 404
                
            user_data = user_doc.to_dict()
            plan = user_data.get('plan', 'free')
            
            # Pro users have unlimited access
            if plan == 'pro':
                g.user_id = user_id
                g.email = email
                g.plan = plan
                return f(*args, **kwargs)
                
            # Free users need to have uses remaining
            uses_remaining = user_data.get('uses_remaining', 0)
            if uses_remaining <= 0:
                return jsonify({
                    'message': 'No uses remaining. Please upgrade to Pro.',
                    'status': 'limit_reached'
                }), 403
                
            # Decrement uses remaining
            db.collection('users').document(user_id).update({
                'uses_remaining': firestore.Increment(-1)
            })
            
            g.user_id = user_id
            g.email = email
            g.plan = plan
            g.uses_remaining = uses_remaining - 1
            
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'message': f'Invalid token: {str(e)}'}), 401
            
    return decorated_function

def generate_jwt_token(user_data):
    """Generate a JWT token for authentication"""
    payload = {
        'uid': user_data['uid'],
        'email': user_data['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),  # 24 hour expiration
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

# Check access eligibility - returns response if ineligible, None if eligible
def check_access_eligibility(user_id):
    try:
        db = initialize_firebase_db()
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return jsonify({'message': 'User not found'}), 404
            
        user_data = user_doc.to_dict()
        plan = user_data.get('plan', 'free')
        
        # Pro users have unlimited access
        if plan == 'pro':
            return None
            
        # Free users need to have uses remaining
        uses_remaining = user_data.get('uses_remaining', 0)
        if uses_remaining <= 0:
            return jsonify({
                'message': 'No uses remaining. Please upgrade to Pro.',
                'status': 'limit_reached'
            }), 403
            
        # Update uses remaining
        db.collection('users').document(user_id).update({
            'uses_remaining': firestore.Increment(-1)
        })
        
        # User is eligible, no error response needed
        return None
    except Exception as e:
        return jsonify({'message': f'Error checking access: {str(e)}'}), 500

# Add signin endpoint
@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400

    try:
        # Find user by email in Firestore
        db = initialize_firebase_db()
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', data['email']).limit(1)
        results = query.get()
        
        user = None
        for doc in results:
            user = doc.to_dict()
            user['uid'] = doc.id
            break
            
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        # Verify password
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash']):
            return jsonify({'message': 'Invalid password'}), 401
            
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return jsonify({
            'uid': user['uid'],
            'email': user['email'],
            'token': token,
            'plan': user.get('plan', 'free'),
            'uses_remaining': user.get('uses_remaining')
        })
    
    except Exception as e:
        return jsonify({'message': f'Error signing in: {str(e)}'}), 500

# Add signup endpoint
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400

    try:
        db = initialize_firebase_db()
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', data['email']).limit(1)
        results = query.get()
        
        if len(list(results)):
            return jsonify({'message': 'Email already in use'}), 400
            
        # Create user ID
        user_id = str(uuid.uuid4())
        
        # Hash the password
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create user in Firestore with uses_remaining
        user_ref = users_ref.document(user_id)
        user_data = {
            'email': data['email'],
            'password_hash': password_hash,
            'plan': 'free',
            'uses_remaining': 30,  # Updated: 30 uses for free users
            'created_at': firestore.SERVER_TIMESTAMP
        }
        user_ref.set(user_data)
        
        user = {
            'uid': user_id,
            'email': data['email']
        }
        
        token = generate_jwt_token(user)
        
        return jsonify({
            'uid': user_id,
            'email': data['email'],
            'token': token,
            'plan': 'free',
            'uses_remaining': 30,  # Updated: Also return 30 here
            'message': 'User created successfully'
        }), 201
    
    except Exception as e:
        return jsonify({'message': f'Error creating user: {str(e)}'}), 500

@auth_bp.route('/signout', methods=['POST'])
def signout():
    # JWT is stateless, so we don't need to do anything on the server for sign out
    # Don't require token validation for signout to avoid errors
    auth_header = request.headers.get('Authorization')
    
    if auth_header:
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1]
            # Verify the token
            decoded_token = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            # Could log the user signout event here
            user_id = decoded_token['uid']
            # Log signout to database if needed
        except:
            # Ignore token validation errors for signout
            pass
    
    return jsonify({'message': 'Successfully signed out'})

@auth_bp.route('/user-profile', methods=['GET'])
@token_required
def get_user_profile():
    try:
        # Get user ID from the middleware
        user_id = g.user_id
        
        # Get user from Firestore
        user_ref = initialize_firebase_db().collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return jsonify({
                'uid': user_id,
                'email': g.email,
                'plan': user_data.get('plan', 'free'),
                'uses_remaining': user_data.get('uses_remaining')
            }), 200
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'message': f'Error retrieving user profile: {str(e)}'}), 500

@auth_bp.route('/upgrade-plan', methods=['POST'])
@token_required
def upgrade_plan():
    try:
        # Get user ID from the middleware
        user_id = g.user_id
        
        # Get user from Firestore
        db = initialize_firebase_db()
        user_ref = db.collection('users').document(user_id)
        
        # Update user plan to 'pro'
        user_ref.update({
            'plan': 'pro',
            'upgraded_at': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            'message': 'Plan upgraded to Pro successfully',
            'plan': 'pro'
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error upgrading plan: {str(e)}'}), 500

@auth_bp.route('/check-access', methods=['GET'])
@token_required
def check_access():
    try:
        # Get user ID from the middleware
        user_id = g.user_id
        
        # Get user from Firestore
        db = initialize_firebase_db()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'message': 'User not found'}), 404
            
        user_data = user_doc.to_dict()
        plan = user_data.get('plan', 'free')
        
        if plan == 'pro':
            return jsonify({
                'access': 'granted',
                'plan': 'pro',
                'message': 'Pro user has unlimited access'
            }), 200
            
        uses_remaining = user_data.get('uses_remaining', 0)
        
        if uses_remaining > 0:
            return jsonify({
                'access': 'granted',
                'plan': 'free',
                'uses_remaining': uses_remaining,
                'message': f'Free user has {uses_remaining} uses remaining'
            }), 200
        else:
            return jsonify({
                'access': 'denied',
                'plan': 'free',
                'uses_remaining': 0,
                'message': 'No uses remaining. Please upgrade to Pro.'
            }), 403
            
    except Exception as e:
        return jsonify({'message': f'Error checking access: {str(e)}'}), 500

@auth_bp.route('/get-user-plan', methods=['GET'])
@token_required
def get_user_plan():
    try:
        # Get user ID from the middleware
        user_id = g.user_id
        
        # Get user from Firestore
        db = initialize_firebase_db()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'message': 'User not found'}), 404
            
        user_data = user_doc.to_dict()
        plan = user_data.get('plan', 'free')
        
        response = {
            'uid': user_id,
            'email': g.email,
            'plan': plan
        }
        
        # Only include uses_remaining for free users
        if plan == 'free':
            response['uses_remaining'] = user_data.get('uses_remaining', 0)
            
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving user plan: {str(e)}'}), 500

@auth_bp.route('/check-tool-access', methods=['GET'])
@token_required
def check_tool_access():
    try:
        # Get user ID from the middleware
        user_id = g.user_id
        
        # Get user from Firestore
        db = initialize_firebase_db()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'message': 'User not found'}), 404
            
        user_data = user_doc.to_dict()
        plan = user_data.get('plan', 'free')
        
        if plan == 'pro':
            return jsonify({
                'canUse': True,
                'plan': 'pro',
                'remainingUses': None,  # No limit for pro users
                'message': 'Pro user has unlimited access'
            }), 200
            
        # Free user logic
        uses_remaining = user_data.get('uses_remaining', 0)
        can_use = uses_remaining > 0
        
        return jsonify({
            'canUse': can_use,
            'plan': 'free',
            'remainingUses': uses_remaining,
            'message': f'Free user has {uses_remaining} uses remaining' if can_use 
                       else 'No uses remaining. Please upgrade to Pro.'
        }), 200
            
    except Exception as e:
        return jsonify({'message': f'Error checking tool access: {str(e)}'}), 500

@auth_bp.route('/record-tool-usage', methods=['POST'])
@token_required
def record_tool_usage():
    try:
        # Get user ID from the middleware
        user_id = g.user_id
        data = request.json
        tool_name = data.get('toolName', 'unknown')
        
        # Get user from Firestore
        db = initialize_firebase_db()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'message': 'User not found'}), 404
            
        user_data = user_doc.to_dict()
        plan = user_data.get('plan', 'free')
        
        # Only record usage for free users
        if plan == 'free':
            uses_remaining = user_data.get('uses_remaining', 0)
            
            # Check if user has uses remaining
            if uses_remaining <= 0:
                return jsonify({
                    'success': False,
                    'message': 'No uses remaining. Please upgrade to Pro.',
                    'remainingUses': 0
                }), 403
                
            # Record usage in usage history collection
            db.collection('usage_history').add({
                'user_id': user_id,
                'tool': tool_name,
                'timestamp': firestore.SERVER_TIMESTAMP
            })
                
            # Decrement uses_remaining
            new_uses_remaining = max(0, uses_remaining - 1)
            user_ref.update({
                'uses_remaining': new_uses_remaining
            })
            
            return jsonify({
                'success': True, 
                'remainingUses': new_uses_remaining,
                'plan': 'free'
            }), 200
        else:
            # Pro users - just record usage for analytics but don't decrement anything
            db.collection('usage_history').add({
                'user_id': user_id,
                'tool': tool_name,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'plan': 'pro'
            })
            
            return jsonify({
                'success': True,
                'plan': 'pro'
            }), 200
            
    except Exception as e:
        return jsonify({'message': f'Error recording tool usage: {str(e)}'}), 500
