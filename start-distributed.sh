#!/bin/bash

echo "🚀 Starting HackCoin Distributed Network"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Set default environment variables
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-"3001"}

# Parse command line arguments
BOOTSTRAP_NODES=""
MINING_ADDRESS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --bootstrap)
            BOOTSTRAP_NODES="$2"
            shift 2
            ;;
        --miner)
            MINING_ADDRESS="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        --help)
            echo "HackCoin Distributed Network Startup"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --bootstrap NODES    Comma-separated list of bootstrap nodes"
            echo "  --miner ADDRESS      Start mining with this address"
            echo "  --port PORT          Server port (default: 3001)"
            echo "  --host HOST          Server host (default: 0.0.0.0)"
            echo "  --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --port 3001"
            echo "  $0 --bootstrap http://192.168.1.100:3001,http://192.168.1.101:3001"
            echo "  $0 --miner 0x1234567890abcdef --bootstrap http://192.168.1.100:3001"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set environment variables
if [ ! -z "$BOOTSTRAP_NODES" ]; then
    export BOOTSTRAP_NODES="$BOOTSTRAP_NODES"
    echo "🌐 Bootstrap nodes: $BOOTSTRAP_NODES"
fi

if [ ! -z "$MINING_ADDRESS" ]; then
    export MINING_ADDRESS="$MINING_ADDRESS"
    echo "⛏️  Mining address: $MINING_ADDRESS"
fi

echo "🖥️  Server will run on: http://$HOST:$PORT"
echo "📡 P2P networking enabled"
echo "🔗 Blockchain synchronization active"
echo ""

# Start the distributed network
echo "🚀 Starting HackCoin Distributed Network..."
npm run dev
