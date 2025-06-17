#!/bin/bash

echo ""
echo "=========================================="
echo "  🚀 HackCoin Blockchain Platform 🚀"
echo "=========================================="
echo ""
echo "Choose startup option:"
echo ""
echo "1. Start HackCoin (Local Access Only)"
echo "2. Start HackCoin (Network Access - All Devices)"
echo "3. Install Dependencies Only"
echo "4. Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🏠 Starting HackCoin for LOCAL ACCESS ONLY..."
        echo ""
        export HOST=localhost
        export PORT=3001
        ;;
    2)
        echo ""
        echo "🌐 Starting HackCoin for NETWORK ACCESS..."
        echo ""
        echo "⚠️  WARNING: This will make HackCoin accessible to ALL devices on your network!"
        echo "Anyone on your network can access the mining and wallet features."
        echo ""
        read -p "Are you sure? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            echo "Cancelled by user."
            exit 0
        fi
        export HOST=0.0.0.0
        export PORT=3001
        ;;
    3)
        echo ""
        echo "📦 Installing HackCoin dependencies..."
        echo ""
        
        # Check Node.js
        if ! command -v node &> /dev/null; then
            echo "❌ Node.js is not installed"
            echo "Please install Node.js 16+ from https://nodejs.org/"
            exit 1
        fi
        
        # Install dependencies
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ Failed to install backend dependencies"
            exit 1
        fi
        
        cd client
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ Failed to install frontend dependencies"
            exit 1
        fi
        cd ..
        
        echo ""
        echo "✅ All dependencies installed successfully!"
        echo "You can now start HackCoin with option 1 or 2."
        echo ""
        exit 0
        ;;
    4)
        echo ""
        echo "👋 Thanks for using HackCoin!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please enter 1, 2, 3, or 4."
        exit 1
        ;;
esac

# Check prerequisites
echo "✅ Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
fi

echo ""
echo "🎯 Starting HackCoin services..."
echo ""
echo "📡 Backend Server: http://$HOST:$PORT"
echo "🌐 Frontend GUI: http://$HOST:3000"
echo ""

# Start backend server in background
echo "🔧 Starting HackCoin Backend Server..."
HOST=$HOST PORT=$PORT node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🌐 Starting HackCoin Frontend..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 HackCoin is starting up!"
echo ""

if [ "$HOST" = "0.0.0.0" ]; then
    echo "🌐 NETWORK ACCESS ENABLED"
    echo "Other devices can access HackCoin at:"
    echo "  http://YOUR_IP_ADDRESS:3000"
    echo ""
    echo "To find your IP address, run: ifconfig or ip addr"
    echo ""
else
    echo "🏠 LOCAL ACCESS ONLY"
    echo "Access HackCoin at: http://localhost:3000"
    echo ""
fi

echo "💡 Usage Tips:"
echo "  • Create a wallet first in the GUI"
echo "  • Configure mining settings in the Mining section"
echo "  • Mining rewards are earned automatically"
echo "  • Press Ctrl+C to stop services"
echo ""

# Wait for user to stop
echo "Press Ctrl+C to stop HackCoin..."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '👋 HackCoin stopped!'; exit 0" SIGINT

# Keep script running
while true; do
    sleep 1
done
