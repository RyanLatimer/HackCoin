#!/bin/bash

echo "🚀 HackCoin Setup & Deployment Script"
echo "====================================="

# Function to install Railway CLI
install_railway() {
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed!"
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚀 Deploying to Railway..."
    railway login
    railway up
    echo "✅ Deployed! Check your Railway dashboard for the URL"
}

# Function to build desktop apps
build_desktop() {
    echo "💻 Building desktop applications..."
    npm install
    
    echo "Building Windows .exe..."
    npm run build:windows
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Building macOS .dmg..."
        npm run build:mac
    fi
    
    echo "Building Linux AppImage..."
    npm run build:linux
    
    echo "✅ Desktop apps built in ./dist/ folder"
}

# Function to test locally
test_local() {
    echo "🧪 Testing locally..."
    npm install
    npm run compile
    echo "✅ Compiled successfully!"
    echo "🌐 Starting server on http://localhost:3001"
    npm run api-server
}

# Main menu
echo ""
echo "Choose an option:"
echo "1) Deploy to Railway (Free cloud hosting)"
echo "2) Build desktop apps (.exe, .dmg, .AppImage)"
echo "3) Test locally"
echo "4) Install Railway CLI only"
echo "5) Full setup (All of the above)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        build_desktop
        ;;
    3)
        test_local
        ;;
    4)
        install_railway
        ;;
    5)
        echo "🔧 Full setup starting..."
        install_railway
        build_desktop
        deploy_railway
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 What you now have:"
echo "✅ Persistent wallet & blockchain data"
echo "✅ Web-accessible HackCoin node"
echo "✅ Desktop applications"
echo "✅ Global P2P network capability"
echo ""
echo "🔗 Share your node with others:"
echo "   Web: https://your-railway-url.app"
echo "   P2P: ws://your-railway-url.app:6001"
