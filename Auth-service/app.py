
from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
import requests 
import routes
from utils import *
import auth
from db import *

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

from routes import *
init_routes(app)

if __name__ == '__main__':
    init_user_db()
    create_user_table()
    app.run(host='0.0.0.0', port=5000, debug=True)
