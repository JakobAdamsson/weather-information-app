
from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
import requests 
DATABASE_FILE = 'database.db'
