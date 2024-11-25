#!/bin/bash

set -e

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists docker || ! command_exists kubectl; then
    echo "Error: Docker and/or Kubernetes CLI (kubectl) not found."
    echo "Please install them before running this script."
    exit 1
fi

declare -A SERVICES=(
    [frontend]="weather-app-frontend"
    [weather-service]="weather-service"
    [auth-service]="auth-service"
)

TARGET_REGISTRY="silverland513"

for SERVICE in "${!SERVICES[@]}"; do
    DIRECTORY="${SERVICES[$SERVICE]}"
    IMAGE_NAME="$TARGET_REGISTRY/$DIRECTORY"

    echo "Building Docker image for $SERVICE from directory '$DIRECTORY'..."
    if docker build -t "$IMAGE_NAME" "$DIRECTORY"; then
        echo "✔ Successfully built $SERVICE image."
        
        echo "Pushing $SERVICE image to DockerHub ($IMAGE_NAME)..."
        if docker push "$IMAGE_NAME"; then
            echo "✔ Successfully pushed $SERVICE image to DockerHub."
        else
            echo "✖ Failed to push $SERVICE image to DockerHub."
            exit 1
        fi
    else
        echo "✖ Failed to build $SERVICE image from $DIRECTORY."
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
