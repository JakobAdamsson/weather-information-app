
$ErrorActionPreference = "Stop"


function CommandExists {
    param (
        [string]$Command
    )
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

if (!(CommandExists "docker") -or !(CommandExists "kubectl")) {
    Write-Error "Error: Docker and/or Kubernetes CLI (kubectl) not found."
    Write-Error "Please install them before running this script."
    exit 1
}


$ImageNameFrontend = "weather-app-frontend"
$ImageNameWeatherService = "weather-service"
$ImageNameAuthService = "auth-service"
$Registry = "pellefra"  


$Images = @{
    "frontend" = $ImageNameFrontend
    "weather-service" = $ImageNameWeatherService
    "auth-service" = $ImageNameAuthService
}

foreach ($Service in $Images.Keys) {
    $Image = $Images[$Service]
    Write-Host "Pulling $Service Docker image ($Registry/$Image)..."
    try {
        docker pull "$Registry/$Image"
        Write-Host "✔ Successfully pulled $Service image."
    } catch {
        Write-Error "✖ Failed to pull $Service image. Please verify the registry and image name."
        exit 1
    }
}

$KubernetesDir = "kubernetes"

if (-Not (Test-Path $KubernetesDir)) {
    Write-Error "Error: Kubernetes directory '$KubernetesDir' does not exist."
    exit 1
}

Set-Location -Path $KubernetesDir


Write-Host "Applying Kubernetes configurations..."
try {
    kubectl apply -f .
    Write-Host "✔ Kubernetes configurations applied successfully."
} catch {
    Write-Error "✖ Failed to apply Kubernetes configurations."
    exit 1
}

Write-Host "Verifying Kubernetes deployments..."
try {
    kubectl get deployments
} catch {
    Write-Error "✖ Failed to retrieve deployments."
    exit 1
}

$Deployments = @("weather-app-frontend", "weather-service", "auth-service")

foreach ($Deployment in $Deployments) {
    Write-Host "Restarting deployment: $Deployment"
    try {
        kubectl rollout restart deployment/$Deployment
        Write-Host "✔ Rollout restart triggered for $Deployment."
    } catch {
        Write-Warning "⚠ Could not restart $Deployment. It might not exist or rollout is not applicable."
    }
}

Write-Host "Checking the status of pods..."
try {
    kubectl get pods
} catch {
    Write-Error "✖ Failed to retrieve pod statuses."
    exit 1
}

Write-Host "Current services running in the cluster:"
try {
    kubectl get svc
} catch {
    Write-Error "✖ Failed to retrieve service details."
    exit 1
}

Write-Host "✅ Deployment process complete."
Write-Host "You can access the frontend, weather service, and auth service through the listed services."