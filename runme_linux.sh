#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e
# Exit if any command in a pipeline fails
set -o pipefail

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Ensure Docker and kubectl are installed
if ! command_exists docker || ! command_exists kubectl; then
    echo "Error: Docker and/or Kubernetes CLI (kubectl) not found."
    echo "Please install them before running this script."
    exit 1
fi

# Define Docker image names and container registry
IMAGE_NAME_FRONTEND="weather-app-frontend"
IMAGE_NAME_WEATHER_SERVICE="weather-service"
IMAGE_NAME_AUTH_SERVICE="auth-service"
REGISTRY="pellefra"  # Example: 'docker.io/username'

# Optional: Docker login to the registry if not already logged in
# Uncomment the lines below if your registry requires authentication
# echo "Logging into Docker registry..."
# docker login "$REGISTRY" || { echo "Docker login failed. Please check your credentials."; exit 1; }

# Associative array to manage Docker images
declare -A IMAGES=(
    ["frontend"]="$IMAGE_NAME_FRONTEND"
    ["weather-service"]="$IMAGE_NAME_WEATHER_SERVICE"
    ["auth-service"]="$IMAGE_NAME_AUTH_SERVICE"
)

# Pull Docker images from the container registry
for service in "${!IMAGES[@]}"; do
    image="${IMAGES[$service]}"
    echo "Pulling $service Docker image ($REGISTRY/$image)..."
    if docker pull "$REGISTRY/$image"; then
        echo "✔ Successfully pulled $service image."
    else
        echo "✖ Failed to pull $service image. Please verify the registry and image name."
        exit 1
    fi
done

# Define Kubernetes YAML directory
KUBERNETES_DIR="kubernetes"

# Check if the Kubernetes directory exists
if [ ! -d "$KUBERNETES_DIR" ]; then
    echo "Error: Kubernetes directory '$KUBERNETES_DIR' does not exist."
    exit 1
fi

# Navigate to the Kubernetes directory
cd "$KUBERNETES_DIR"

# Apply Kubernetes YAML configurations
echo "Applying Kubernetes configurations..."
if kubectl apply -f .; then
    echo "✔ Kubernetes configurations applied successfully."
else
    echo "✖ Failed to apply Kubernetes configurations."
    exit 1
fi

# Verify deployments
echo "Verifying Kubernetes deployments..."
kubectl get deployments || { echo "✖ Failed to retrieve deployments."; exit 1; }

# Array of deployments to restart
DEPLOYMENTS=("weather-app-frontend" "weather-service" "auth-service")

# Trigger rollout restarts for each deployment
for deployment in "${DEPLOYMENTS[@]}"; do
    echo "Restarting deployment: $deployment"
    if kubectl rollout restart deployment/"$deployment"; then
        echo "✔ Rollout restart triggered for $deployment."
    else
        echo "⚠ Could not restart $deployment. It might not exist or rollout is not applicable."
    fi
done

# Optionally, check the status of pods
echo "Checking the status of pods..."
kubectl get pods || { echo "✖ Failed to retrieve pod statuses."; exit 1; }

# Display service details to access the applications
echo "Current services running in the cluster:"
kubectl get svc || { echo "✖ Failed to retrieve service details."; exit 1; }

echo "✅ Deployment process complete."
echo "You can access the frontend, weather service, and auth service through the listed services."
