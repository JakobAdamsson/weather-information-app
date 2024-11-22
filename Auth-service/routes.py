
from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
import requests 
from db import *
from auth import *
# Using preflight everywhere so that the browser checks if POST is ok. When preflight is 200, the route returns 200 as status and an emtpy body
def init_routes(app):
    @app.route('/add_user', methods=['POST'])
    def add_user():
        if request.method == 'OPTIONS':
            return '', 200 

        data = request.get_json()
        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Not valid email or password"}), 400

        hashed_password = hash_password(data["password"])
        user_email = data["email"]
        username = data["username"]

        result = add_user_to_db(user_email, hashed_password, username)

        if result is True:
            yea = {"message": f"{data['email']} signed up", "data": data}
            return jsonify(yea), 201 
        else:
            return jsonify({"message": result}), 409



    @app.route('/login', methods=['POST'])
    def login_user():
        if request.method == 'OPTIONS':
            return '', 200 

        data = request.get_json()
        
        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password are required"}), 400

        user_email = data.get("email")
        entered_password = data.get("password")

        # Retrieve user from the database by email
        user = verify_user_credentials(user_email, entered_password)
        if user:
            username = user[2]
            u_id = get_user_id_from_email(user_email)
            token = generate_token(u_id)  # Generate token with user email
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            return jsonify({"message": f"Welcome back, {username}!", "token": token, "username": username}), 200
        else:
            return jsonify({"message": "User not found"}), 404

    
    @app.route('/update_data', methods=['POST'])
    @token_required
    def update_user_data(user_id):
        if request.method == 'OPTIONS':
            return '', 200  
        
        data = request.get_json()
        
        # Extract new user data from the request
        new_email = data.get("newEmail")
        new_password = data.get("newPassword")
        new_username = data.get("newUsername")

        # Call the update_user_data function from db.py
        update_result = update_user_data_db(user_id, new_email, new_password, new_username)
        
        if update_result is not None:
            return jsonify({"message": "Profile updated successfully!", "username": new_username}), 200
        else:
            return jsonify({"message": "Failed to update profile. Please check the data or try again."}), 400



