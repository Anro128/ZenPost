#!/bin/bash
# One-Command VPS Deployment Script with Sudo Fallback & Custom Port Support

echo "🚀 Deploying AI Content Generator to VPS..."

# Create .env if missing
if [ ! -f .env ]; then
  echo "APP_PASSWORD=admin123" > .env
  echo "FRONTEND_PORT=3000" >> .env
  echo "BACKEND_PORT=8000" >> .env
  echo "GEMINI_API_KEY=" >> .env
  echo "Created default .env file with FRONTEND_PORT=3000"
fi

# Read FRONTEND_PORT from .env or default to 3000
PORT=$(grep "^FRONTEND_PORT=" .env | cut -d'=' -f2)
PORT=${PORT:-3000}

# Check docker permission
DOCKER_CMD="docker"
if ! docker info > /dev/null 2>&1; then
  echo "⚠️ Docker requires sudo privileges. Running with sudo..."
  DOCKER_CMD="sudo docker"
fi

# Stop existing containers & rebuild
$DOCKER_CMD compose down
$DOCKER_CMD compose up -d --build

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Access your app at: http://$(curl -s ifconfig.me):$PORT"
