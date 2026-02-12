#!/bin/bash
# Crypto AI Signal v2.0 Deployment Script

set -e

REPO="https://github.com/themachinehf/crypto-ai-signal.git"
BRANCH="main"
DIR="/home/themachine/.openclaw/workspace/crypto-ai-signal"

echo "🚀 Deploying Crypto AI Signal v2.0..."
echo "📁 Target directory: $DIR"

# Initialize git if needed
if [ ! -d "$DIR/.git" ]; then
    echo "📦 Initializing git repository..."
    cd "$DIR"
    git init
    git remote add origin "$REPO"
else
    cd "$DIR"
    echo "📂 Git repository already exists"
fi

# Stage all files
echo "📝 Staging files..."
git add .

# Commit
COMMIT_MSG="feat: Crypto AI Signal v2.0 - Prediction Engine

- AI-powered price predictions (30m/1h/24h)
- Multi-symbol support (BTC/ETH/SOL)
- Win rate tracking
- THE MACHINE POI style UI
- Vercel Serverless deployment"

echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin $BRANCH

echo "✅ Deployment initiated! Vercel will auto-deploy."
echo "📊 Preview: https://github.com/themachinehf/crypto-ai-signal"
