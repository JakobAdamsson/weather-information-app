from flask import Flask, request, jsonify
import sqlite3
import os

DATABASE_DIR = '/app/databases'

if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)

DATABASE_FILE = os.path.join(DATABASE_DIR, 'weather_database.db')

print(f"Database will be stored at: {DATABASE_FILE}")

def init_weather_db():
    """Initialize the weather database by creating the locations table if it doesn't exist."""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, name TEXT)")
    conn.commit()
    cursor.close()
    conn.close()
    print("Database and locations table initialized.")

def get_db_connection():
    """Get a connection to the SQLite database with a row factory for named access."""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def create_weather_table():
    """Create the weather_data table in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    # Drop the existing table if it exists
    cursor.execute("DROP TABLE IF EXISTS weather_data")
    # Recreate the table with the correct schema
    create_table_query = """
    CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        locations TEXT NOT NULL,
        temp REAL NOT NULL,
        description TEXT NOT NULL
    );
    """
    cursor.execute(create_table_query)
    conn.commit()
    cursor.close()
    conn.close()
    print("weather_data table created/recreated successfully.")


def add_location_to_db(name):
    """Add a new location to the locations table and return the inserted ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO locations (name) VALUES (?)", (name,))
    conn.commit()
    inserted_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return inserted_id

def save_weather_data_to_db(location, temp, description):
    """Save weather data to the weather_data table."""
    try:
        print(f"Saving data: location={location}, temp={temp}, description={description}")
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = """
        INSERT INTO weather_data (locations, temp, description) 
        VALUES (?, ?, ?)
        """
        cursor.execute(insert_query, (location, temp, description))
        conn.commit()
        print("Data saved successfully.")
        cursor.close()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")  
        return f"Database error: {str(e)}"  


