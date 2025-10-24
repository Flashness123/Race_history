#!/bin/bash

# Railway deployment script for Downhill Race History Backend

echo "🚀 Deploying to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Deploy to Railway
echo "📦 Deploying application..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Your API will be available at: https://your-app-name.railway.app"
echo "📋 Don't forget to set environment variables in Railway dashboard:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - CORS_ORIGINS"
