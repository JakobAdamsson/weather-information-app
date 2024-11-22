#!/bin/bash

# Docker Hub username
DOCKER_USER="pellefra"

# Services and their respective paths
declare -A services=(
    ["auth-service"]="Auth-service"
    ["weather-service"]="weather-service"
    ["weather-app-frontend"]="weather-app-frontend"
)

# Function to build and push Docker images
build_and_push() {
    local service_name=$1
    local service_path=$2

    echo "Building Docker image for $service_name..."
    docker build -t "$DOCKER_USER/$service_name" "$service_path"

    if [ $? -ne 0 ]; then
        echo "Failed to build image for $service_name. Exiting."
        exit 1
    fi

    echo "Pushing Docker image for $service_name..."
    docker push "$DOCKER_USER/$service_name"

    if [ $? -ne 0 ]; then
        echo "Failed to push image for $service_name. Exiting."
        exit 1
    fi

    echo "Successfully built and pushed $DOCKER_USER/$service_name!"
}

# Loop through services and process each one
for service in "${!services[@]}"; do
    build_and_push "$service" "${services[$service]}"
done

echo "All images have been built and pushed successfully!"
