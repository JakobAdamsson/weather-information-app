#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status
set -o pipefail  # Catch errors in pipelines

# Ensure Docker and kubectl are installed
if ! command -v docker >/dev/null 2>&1 || ! command -v kubectl >/dev/null 2>&1; then
    echo "Docker and/or Kubernetes CLI (kubectl) not found. Please install them before running this script."
    exit 1
fi

# Define your Docker image names and container registry
IMAGE_NAME_FRONTEND="weather-app-frontend"
IMAGE_NAME_WEATHER_SERVICE="weather-service"
IMAGE_NAME_AUTH_SERVICE="auth-service"
REGISTRY="silverland513"  # E.g., 'docker.io/username'

# Define your Kubernetes YAML paths (update this to match your setup)

# Pull Docker images from the container registry
echo "Pulling frontend Docker image..."
if docker pull "$REGISTRY/$IMAGE_NAME_FRONTEND"; then
    echo "Frontend image pulled successfully."
else
    echo "Failed to pull frontend image. Please check the registry and image name."
    exit 1
fi

echo "Pulling weather-service Docker image..."
if docker pull "$REGISTRY/$IMAGE_NAME_WEATHER_SERVICE"; then
    echo "Weather service image pulled successfully."
else
    echo "Failed to pull weather service image. Please check the registry and image name."
    exit 1
fi

echo "Pulling auth-service Docker image..."
if docker pull "$REGISTRY/$IMAGE_NAME_AUTH_SERVICE"; then
    echo "Auth service image pulled successfully."
else
    echo "Failed to pull auth service image. Please check the registry and image name."
    exit 1
fi

# Apply Kubernetes YAML files to create deployments
cd kubernetes
kubectl apply -f .
# Check if the deployments were successfully created
echo "Checking Kubernetes deployments..."
kubectl get deployments

# Trigger a rollout restart for frontend, weather-service, and auth-service to ensure the new images are used
echo "Triggering rollout restart for frontend, weather-service, and auth-service..."
kubectl rollout restart deployment/weather-app-frontend || echo "Frontend rollout restart failed or not applicable."
kubectl rollout restart deployment/weather-service || echo "Weather service rollout restart failed or not applicable."
kubectl rollout restart deployment/auth-service || echo "Auth service rollout restart failed or not applicable."

# Optionally, check the status of pods
echo "Checking the status of pods..."
kubectl get pods

# Show the service details to get the IP/port for accessing the services
echo "Here are the services running in your cluster:"
kubectl get svc

echo "Deployment process complete. You should be able to access the frontend, weather service, and auth service through the services."
