#!/bin/bash

echo "==============================================="
echo "   HackCoin Device 1 - First P2P Peer"
echo "==============================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
fi

# Get local IP address
echo "🔍 Finding your IP address..."
if command -v ip &> /dev/null; then
    # Linux
    IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+')
elif command -v ifconfig &> /dev/null; then
    # Mac/Linux
    IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
else
    IP="Unknown"
fi

echo
echo "✅ Your IP address appears to be: $IP"
echo
echo "📝 Share this address with Device 2:"
echo "   SEED_PEER=http://$IP:3001"
echo

# Start the first P2P node
echo "🚀 Starting HackCoin P2P Node (First Peer)..."
echo "   • True decentralized networking (Bitcoin-style)"
echo "   • No central server required"
echo "   • Peer database: data/peers.json"
echo
echo "   Access at: http://localhost:3001"
echo "   Network access: http://$IP:3001"
echo
echo "Press Ctrl+C to stop the node"
echo

export HOST=0.0.0.0
export PORT=3001
node server.js
