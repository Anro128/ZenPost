#!/bin/bash
# One-Command VPS Deployment Script with Custom Port Support

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

# Stop existing containers & rebuild
docker compose down
docker compose up -d --build

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Access your app at: http://$(curl -s ifconfig.me):$PORT"
