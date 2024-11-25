from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
import requests 
from auth import *
import os


DATABASE_DIR = '/app/databases'

if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)

DATABASE_FILE = os.path.join(DATABASE_DIR, 'user_database.db')

print(f"Database will be stored at: {DATABASE_FILE}")

def init_user_db():
    if not os.path.exists(DATABASE_FILE):
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                username TEXT NOT NULL
            )
        ''')

        conn.commit()
        cursor.close()
        print("Database and table created.")
    else:
        print("Database already exists.")

def create_user_table():
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()

    # SQL query to create the table
    create_table_query = '''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                username TEXT NOT NULL
            )
        '''

    # Execute the query
    cursor.execute(create_table_query)

    # Commit the changes and close the connection
    conn.commit()
    cursor.close()
    conn.close()


def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def add_user_to_db(email, password, username):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            username TEXT NOT NULL
        )
    ''')

    try:
        cursor.execute('''
            INSERT INTO users (email, password, username) VALUES (?, ?, ?)
        ''', (email, password, username))
        conn.commit()
        conn.close()
        return True  
    except sqlite3.IntegrityError:
        conn.close()
        return "User already exists"  



def verify_user_credentials(email, password):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Query the database for the user by email
    cursor.execute('''SELECT email, password, username FROM users WHERE email = ?''', (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        stored_hashed_password = user[1]  
        
        if check_password_match(password, stored_hashed_password):
            return user 
        else:
            return None 
    else:
        return None  


def update_user_data_db(user_id, email=None, password=None, username=None) -> bool:
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Prepare the update query and parameters
    query = "UPDATE users SET "
    params = []

    if email:
        query += "email = ?, "
        params.append(email)

    if password:
        hashed_password = hash_password(password)
        query += "password = ?, "
        params.append(hashed_password)

    if username:
        query += "username = ?, "
        params.append(username)

    # Remove the trailing comma and space
    query = query.rstrip(", ")

    # Add the condition to update the user based on user_id
    query += " WHERE id = ?"
    params.append(user_id)

    try:
        cursor.execute(query, tuple(params))
        conn.commit()

        if cursor.rowcount == 0:
            conn.close()
            return None

        conn.close()
        return ""

    except sqlite3.Error as e:
        conn.close()
        return None

def get_user_id_from_email(email):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    # Query the database for the user by email
    cursor.execute('''SELECT id FROM users WHERE email = ?''', (email,))
    user = cursor.fetchone()
    conn.close()
    # User[0] = userid
    if user:
        return user[0]
    else:
        return None 
