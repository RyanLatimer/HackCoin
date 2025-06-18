#!/bin/bash
# Production Seed Node Setup Script

echo "🌱 Setting up HackCoin Seed Node"
echo "================================"

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone HackCoin
git clone https://github.com/yourusername/HackCoin.git
cd HackCoin

# Install dependencies
npm install
cd client && npm install && cd ..

# Set environment variables for seed node
export HOST=0.0.0.0
export PORT=3001
export NODE_ENV=production

# Get public IP address
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "YOUR_PUBLIC_IP")

# Start as seed node (no other seed nodes needed)
echo "🚀 Starting seed node..."
echo "=========================================="
echo "📡 Your seed node will be accessible at:"
echo "   http://$PUBLIC_IP:3001"
echo ""
echo "🌐 Web interface will be available at:"
echo "   http://$PUBLIC_IP:3000"
echo ""
echo "🔗 Other users can connect using:"
echo "   SEED_NODES=http://$PUBLIC_IP:3001 npm run global"
echo ""
echo "📋 Add this to global-network.js:"
echo "   'http://$PUBLIC_IP:3001',"
echo "=========================================="

npm run dev
