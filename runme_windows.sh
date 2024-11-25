#!/bin/bash
sed -i 's/\r$//' runme_windows.sh

set -e

command_exists() {
    command -v "$1" >/dev/null 2>&1
}
if ! command_exists docker || ! command_exists kubectl; then
    echo "Error: Docker and/or Kubernetes CLI (kubectl) not found."
    echo "Please install them before running this script."
    exit 1
fi


IMAGE_NAME_FRONTEND="weather-app-frontend"
IMAGE_NAME_WEATHER_SERVICE="weather-service"
IMAGE_NAME_AUTH_SERVICE="auth-service"
REGISTRY="silverland513"

declare -A IMAGES=(
    [frontend]=$IMAGE_NAME_FRONTEND
    [weather-service]=$IMAGE_NAME_WEATHER_SERVICE
    [auth-service]=$IMAGE_NAME_AUTH_SERVICE
)

# Pull images
for SERVICE in "${!IMAGES[@]}"; do
    IMAGE="${IMAGES[$SERVICE]}"
    echo "Pulling $SERVICE Docker image ($REGISTRY/$IMAGE)..."
    if docker pull "$REGISTRY/$IMAGE"; then
        echo "✔ Successfully pulled $SERVICE image."
    else
        echo "✖ Failed to pull $SERVICE image. Please verify the registry and image name."
        exit 1
    fi
done


KUBERNETES_DIR="kubernetes"

if [ ! -d "$KUBERNETES_DIR" ]; then
    echo "Error: Kubernetes directory '$KUBERNETES_DIR' does not exist."
    exit 1
fi

cd "$KUBERNETES_DIR"


echo "Applying Kubernetes configurations..."
if kubectl apply -f .; then
    echo "✔ Kubernetes configurations applied successfully."
else
    echo "✖ Failed to apply Kubernetes configurations."
    exit 1
fi


echo "Verifying Kubernetes deployments..."
kubectl get deployments || {
    echo "✖ Failed to retrieve deployments."
    exit 1
}

DEPLOYMENTS=("weather-app-frontend" "weather-service" "auth-service")

for DEPLOYMENT in "${DEPLOYMENTS[@]}"; do
    echo "Restarting deployment: $DEPLOYMENT"
    if kubectl rollout restart deployment/"$DEPLOYMENT"; then
        echo "✔ Rollout restart triggered for $DEPLOYMENT."
    else
        echo "⚠ Could not restart $DEPLOYMENT. It might not exist or rollout is not applicable."
    fi
done


echo "Checking the status of pods..."
kubectl get pods || {
    echo "✖ Failed to retrieve pod statuses."
    exit 1
}


echo "Current services running in the cluster:"
kubectl get svc || {
    echo "✖ Failed to retrieve service details."
    exit 1
}

echo "✅ Deployment process complete."
echo "You can access the frontend, weather service, and auth service through the listed services."
