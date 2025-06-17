#!/bin/bash

echo "==============================================="
echo "     HackCoin Device 2 - P2P Peer Node"
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

# Get Device 1 IP address from user
echo "🔗 Connect to First P2P Peer (Device 1)"
echo
echo "This is a one-time setup. After connection, both nodes"
echo "will discover each other automatically via gossip protocol."
echo
read -p "Enter Device 1 IP address (e.g., 192.168.1.100): " DEVICE1_IP

if [ -z "$DEVICE1_IP" ]; then
    echo "❌ IP address is required!"
    exit 1
fi

# Basic IP validation
if [[ ! $DEVICE1_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "⚠️  Warning: IP address format may be incorrect"
fi

echo
echo "� Seeding initial peer: $DEVICE1_IP:3001"
echo

# Start the peer node
echo "🚀 Starting HackCoin P2P Node (Second Peer)..."
echo "   • True decentralized networking (Bitcoin-style)"
echo "   • Automatic peer discovery via gossip protocol"
echo "   • Peer database: data/peers.json"
echo
echo "   Access at: http://localhost:3002"
echo "   Initial seed: http://$DEVICE1_IP:3001"
echo
echo "Press Ctrl+C to stop the node"
echo

export HOST=0.0.0.0
export PORT=3002
export SEED_PEER=http://$DEVICE1_IP:3001
node server.js
