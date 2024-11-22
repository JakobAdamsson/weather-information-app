from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
import requests 
from db import *


def init_routes(app):
    print("Registered routes:", app.url_map)
    @app.route('/add_locations', methods=['POST', 'OPTIONS'])
    def add_location():
        if request.method == 'OPTIONS':
            return '', 200  # Respond to preflight with a 200 OK
        
        data = request.get_json()

        # Insert the location using the database function
        name = data.get("name")
        inserted_id = add_location_to_db(name)
        
        # Return the inserted location with its generated ID
        return jsonify({"id": inserted_id, "name": name}), 200

    @app.route('/get_locations', methods=['GET'])
    def get_locations():
        """Retrieve all saved locations from the database."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM locations")
        locations = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convert fetched data to a list of dictionaries
        locations_list = [{"id": loc["id"], "name": loc["name"]} for loc in locations]
        return jsonify(locations_list), 200

    @app.route('/weather/<location_name>', methods=['GET'])
    def get_weather(location_name):
        API_KEY = 'c168ea61637cd66bb72af64b4632b896'
        url = f'http://api.openweathermap.org/data/2.5/weather?q={location_name}&appid={API_KEY}&units=metric'
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            print(f"Error: {response.status_code}, {response.text}")  
            return jsonify({'error': 'Could not fetch weather data'}), 400

    @app.route('/get_weather_history', methods=['GET'])
    def get_weather_history():
        """Retrieve weather history from the database."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT locations, temp, description FROM weather_data")
        weather_data = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convert fetched data to a list of dictionaries
        weather_history = [
            {"locations": data["locations"], "temp": data["temp"], "description": data["description"]}
            for data in weather_data
        ]
        return jsonify(weather_history), 200

    @app.route('/save_weather', methods=['POST'])
    def save_weather():
        data = request.get_json()
        
        # Extract the weather data
        country = data['country']
        location = country.get('location')
        temp = country.get('temp')
        description = country.get('description')

        # Check if location is None or empty, and handle accordingly
        if not location:
            return jsonify({"error": "Location is required"}), 400

        # Insert into the database using the database function
        result = save_weather_data_to_db(location, temp, description)
        
        if result is True:
            return jsonify({"message": "Weather data saved successfully"}), 201
        else:
            return jsonify({"error": result}), 500