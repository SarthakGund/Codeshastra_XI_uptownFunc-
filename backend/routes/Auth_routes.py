from flask import Blueprint, request, jsonify, g, current_app
import firebase_admin
from firebase_admin import firestore
import os
import jwt
from functools import wraps
import datetime
import uuid
import bcrypt
import re
import random
from flask_mail import Mail, Message

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def initialize_firebase_db():
    return current_app.db

def initialize_mail():
    return current_app.mail

# Helper function to validate email format
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

# Helper function to generate OTP
def generate_otp():
    return random.randint(100000, 999999)

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

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    db = initialize_firebase_db()
    user_ref = db.collection('users').where('email', '==', email).limit(1).get()

    if not user_ref:
        return jsonify({'message': 'User not found'}), 404

    user_data = user_ref[0].to_dict()

    if not bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = generate_jwt_token({'uid': user_ref[0].id, 'email': email})
    return jsonify({'token': token}), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email format'}), 400

    db = initialize_firebase_db()
    pending_ref = db.collection('pending_signups').where('email', '==', email).limit(1).get()

    if pending_ref:
        return jsonify({'message': 'A pending sign-up already exists for this email. Please verify your OTP.'}), 400

    users_ref = db.collection('users').where('email', '==', email).limit(1).get()

    if users_ref:
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    otp = generate_otp()
    timestamp = datetime.datetime.utcnow()

    db.collection('pending_signups').add({
        'email': email,
        'password': hashed_password,
        'otp': otp,
        'created_at': timestamp
    })

    mail = initialize_mail()
    msg = Message('Your OTP Code', sender='noreply@example.com', recipients=[email])
    msg.body = f'Your OTP code is {otp}'
    mail.send(msg)

    return jsonify({'message': 'Sign-up initiated. Please verify OTP sent to your email.'}), 201

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    type = data.get('type', 'signup')  # Add type parameter to distinguish between signup and reset_password
    
    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400

    db = initialize_firebase_db()
    
    if type == 'signup':
        pending_ref = db.collection('pending_signups').where('email', '==', email).limit(1).get()

        if not pending_ref:
            return jsonify({'message': 'No pending sign-up found for this email'}), 404

        pending_data = pending_ref[0].to_dict()

        if pending_data['otp'] != int(otp):
            return jsonify({'message': 'Invalid OTP'}), 400

        # Create the user in the main users collection
        new_user_ref = db.collection('users').add({
            'email': pending_data['email'],
            'password': pending_data['password'],
            'created_at': datetime.datetime.utcnow(),
            'plan': 'free',
            'uses_remaining': 5  # Default free tier uses
        })

        # Fix: Correctly extract document ID from the DocumentReference
        new_user_id = new_user_ref[1].id

        # Delete from pending signups
        db.collection('pending_signups').document(pending_ref[0].id).delete()

        # Generate JWT token for automatic sign-in
        token = generate_jwt_token({'uid': new_user_id, 'email': email})

        return jsonify({
            'message': 'OTP verified successfully. Account created.',
            'token': token
        }), 200
    else:
        # Existing password reset logic
        user_ref = db.collection('users').where('email', '==', email).limit(1).get()
        
        if not user_ref:
            return jsonify({'message': 'User not found'}), 404
            
        user_data = user_ref[0].to_dict()
        
        if user_data.get('otp') != int(otp):
            return jsonify({'message': 'Invalid OTP'}), 400
            
        # Process password reset if new_password is provided
        new_password = data.get('new_password')
        if new_password:
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            db.collection('users').document(user_ref[0].id).update({'password': hashed_password, 'otp': None})
        
        return jsonify({'message': 'OTP verified successfully'}), 200

@auth_bp.route('/signout', methods=['POST'])
@token_required
def signout():
    # Invalidate token logic (if implemented, e.g., token blacklist)
    return jsonify({'message': 'Signed out successfully'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    db = initialize_firebase_db()
    user_ref = db.collection('users').where('email', '==', email).limit(1).get()

    if not user_ref:
        return jsonify({'message': 'User not found'}), 404

    otp = generate_otp()
    db.collection('users').document(user_ref[0].id).update({'otp': otp})

    mail = initialize_mail()
    msg = Message('Password Reset OTP', sender='noreply@example.com', recipients=[email])
    msg.body = f'Your password reset OTP is {otp}'
    mail.send(msg)

    return jsonify({'message': 'OTP sent to your email for password reset'}), 200

@auth_bp.route('/verify-reset-otp', methods=['POST'])
def verify_reset_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    if not email or not otp or not new_password:
        return jsonify({'message': 'Email, OTP, and new password are required'}), 400

    db = initialize_firebase_db()
    user_ref = db.collection('users').where('email', '==', email).limit(1).get()

    if not user_ref:
        return jsonify({'message': 'User not found'}), 404

    user_data = user_ref[0].to_dict()

    if user_data['otp'] != int(otp):
        return jsonify({'message': 'Invalid OTP'}), 400

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.collection('users').document(user_ref[0].id).update({'password': hashed_password, 'otp': None})

    return jsonify({'message': 'Password reset successfully'}), 200

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
