# Use a compatible Python version
FROM python:3.11.9

# Set working directory
WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Set the entry point to run the Flask app
CMD ["python", "app.py"]
