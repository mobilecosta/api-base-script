#!/bin/bash

# Vercel Deployment Helper Script
# This script automates the deployment process to Vercel

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Authentication API - Vercel Deployment Helper         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not created"
  exit 1
fi

echo "✅ Build successful"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "📥 Installing Vercel CLI..."
  npm install -g vercel
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   Deployment Options                          ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║ 1. Deploy to preview (staging)                               ║"
echo "║ 2. Deploy to production                                       ║"
echo "║ 3. Just verify build (don't deploy)                          ║"
echo "║ 4. Exit                                                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

read -p "Select option (1-4): " option

case $option in
  1)
    echo "🚀 Deploying to preview environment..."
    vercel
    ;;
  2)
    echo "🚀 Deploying to production..."
    vercel --prod
    ;;
  3)
    echo "✅ Build verified successfully. Ready to deploy manually."
    echo ""
    echo "To deploy, run:"
    echo "  vercel          # Preview"
    echo "  vercel --prod   # Production"
    exit 0
    ;;
  4)
    echo "Cancelled"
    exit 0
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    Deployment Complete!                       ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║                                                               ║"
echo "║ ✅ Next steps:                                               ║"
echo "║ 1. Check deployment URL in output above                      ║"
echo "║ 2. Test API: curl https://[your-domain]/api/auth/health     ║"
echo "║ 3. View Swagger: https://[your-domain]/api-docs             ║"
echo "║ 4. Update frontend config with new API URL                  ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
