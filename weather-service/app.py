
from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
import requests 
from routes import *
from utils import *
from db import *

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

API_KEY = '840de94484afaa3c33ae25f4c6ca2bbc' 

from routes import init_routes
init_routes(app)

if __name__ == '__main__':
    init_weather_db()
    create_weather_table()
    app.run(host='0.0.0.0', port=5005, debug=True)
