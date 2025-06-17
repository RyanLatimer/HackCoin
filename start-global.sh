#!/bin/bash

# HackCoin - Global Network Starter
# One command to join the global HackCoin network from anywhere!

echo "🌍 HackCoin Global Network Starter"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    echo ""
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found!${NC}"
    echo ""
    echo "Please make sure you're in the HackCoin project directory."
    echo "If you just downloaded the project, run:"
    echo "  cd HackCoin"
    exit 1
fi

echo -e "${GREEN}✅ Found HackCoin project${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
    npm install
    echo ""
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
    cd client
    npm install
    cd ..
    echo ""
fi

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo ""

# Set environment variables for global network
export HOST=0.0.0.0
export PORT=${PORT:-3001}
export NODE_ENV=${NODE_ENV:-development}

echo -e "${BLUE}🌐 Starting HackCoin Global Network Node...${NC}"
echo ""
echo "🖥️  Server: http://localhost:$PORT"
echo "🌍 Web UI: http://localhost:3000"
echo "📡 P2P Port: $PORT"
echo "🔗 Auto-connecting to global network..."
echo ""
echo -e "${YELLOW}💡 Tip: Anyone on your network can access at http://YOUR_IP:3000${NC}"
echo ""

# Start the application
npm run dev
