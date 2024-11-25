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
        'exp': datetime.utcnow() + timedelta(days=1) 
    }
    return pyjwt.encode(payload, SECRET_KEY, algorithm='HS256')

# Token verification decorator called before updatE_user
def token_required(f):
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"message": "Token is missing!"}), 401, False 

        try:
            # structure from frontend "Bearer <token>"
            token = token.split(" ")[1]
            print(f"user trying to edit profile, token: {token}", flush=True)
            decoded_token = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            print(f"decoded token: {decoded_token}", flush=True)
            user_id = decoded_token['user_id']
            print(f"Token decoded, user_id: {user_id}", flush=True)
        except pyjwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401, False 
        except pyjwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401, False 

        return f(user_id, *args, **kwargs)

    return decorated_function
