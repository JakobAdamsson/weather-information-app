from werkzeug.security import generate_password_hash, check_password_hash
import jwt as pyjwt 
from flask import Flask, request, jsonify
from functools import wraps
from datetime import datetime, timedelta


SECRET_KEY = "TJAAAA"

def hash_password(password: str):
    return generate_password_hash(password)

def check_password_match(password, hashed_password):
    return check_password_hash(hashed_password, password)

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)  # Token expiration after 1 day
    }
    return pyjwt.encode(payload, SECRET_KEY, algorithm='HS256')

# Token verification decorator
def token_required(f):
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"message": "Token is missing!"}), 401, False  # Return False on missing token

        try:
            # Extract token from "Bearer <token>"
            token = token.split(" ")[1]
            decoded_token = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token['user_id']
        except pyjwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401, False  # Return False on expired token
        except pyjwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401, False  # Return False on invalid token

        # If the token is valid, return success and True
        return f(user_id, *args, **kwargs)

    return decorated_function
