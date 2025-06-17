#!/bin/bash

# HackCoin Global Deployment Script
# This script helps deploy HackCoin nodes on various cloud providers

set -e

echo "🚀 HackCoin Global Deployment Script"
echo "===================================="

# Configuration
NETWORK_TYPE=${NETWORK_TYPE:-"MAINNET"}
NODE_NAME=${NODE_NAME:-"HackCoin-Global-Node"}
HTTP_PORT=${HTTP_PORT:-"3001"}
P2P_PORT=${P2P_PORT:-"6001"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check requirements
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install --production
    
    print_status "Building TypeScript..."
    npm run compile
    
    print_status "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    print_success "Dependencies installed and built"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow $HTTP_PORT/tcp
        sudo ufw allow $P2P_PORT/tcp
        print_success "UFW firewall configured"
    elif command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-port=$HTTP_PORT/tcp
        sudo firewall-cmd --permanent --add-port=$P2P_PORT/tcp
        sudo firewall-cmd --reload
        print_success "FirewallD configured"
    else
        print_warning "No firewall tool found. Please manually open ports $HTTP_PORT and $P2P_PORT"
    fi
}

# Get public IP
get_public_ip() {
    print_status "Detecting public IP..."
    PUBLIC_IP=$(curl -s https://api.ipify.org || curl -s https://ipinfo.io/ip || echo "unknown")
    if [ "$PUBLIC_IP" != "unknown" ]; then
        print_success "Public IP detected: $PUBLIC_IP"
        export PUBLIC_IP
    else
        print_warning "Could not detect public IP automatically"
    fi
}

# Create systemd service
create_service() {
    print_status "Creating systemd service..."
    
    cat > /tmp/hackcoin.service << EOF
[Unit]
Description=HackCoin Global Node
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=NETWORK_TYPE=$NETWORK_TYPE
Environment=HTTP_PORT=$HTTP_PORT
Environment=P2P_PORT=$P2P_PORT
Environment=NODE_NAME=$NODE_NAME
Environment=PUBLIC_IP=$PUBLIC_IP
ExecStart=$(which node) global-node.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    sudo mv /tmp/hackcoin.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable hackcoin
    
    print_success "Systemd service created"
}

# Start the node
start_node() {
    print_status "Starting HackCoin node..."
    
    if [ -f /etc/systemd/system/hackcoin.service ]; then
        sudo systemctl start hackcoin
        print_success "Node started as systemd service"
        print_status "Use 'sudo systemctl status hackcoin' to check status"
        print_status "Use 'sudo journalctl -f -u hackcoin' to view logs"
    else
        print_status "Starting node directly..."
        export NETWORK_TYPE=$NETWORK_TYPE
        export HTTP_PORT=$HTTP_PORT
        export P2P_PORT=$P2P_PORT
        export NODE_NAME=$NODE_NAME
        export PUBLIC_IP=$PUBLIC_IP
        node global-node.js &
        NODE_PID=$!
        echo $NODE_PID > hackcoin.pid
        print_success "Node started with PID $NODE_PID"
    fi
}

# Show connection info
show_info() {
    echo ""
    echo "🎉 HackCoin Node Deployment Complete!"
    echo "======================================"
    echo ""
    echo "📡 Node Information:"
    echo "   Network: $NETWORK_TYPE"
    echo "   Node Name: $NODE_NAME"
    echo "   HTTP Port: $HTTP_PORT"
    echo "   P2P Port: $P2P_PORT"
    
    if [ "$PUBLIC_IP" != "unknown" ]; then
        echo ""
        echo "🌍 Public Access URLs:"
        echo "   Web Interface: http://$PUBLIC_IP:$HTTP_PORT"
        echo "   API Endpoint:  http://$PUBLIC_IP:$HTTP_PORT/api"
        echo "   P2P Address:   ws://$PUBLIC_IP:$P2P_PORT"
        echo ""
        echo "📤 Share this P2P address with others to connect:"
        echo "   ws://$PUBLIC_IP:$P2P_PORT"
    else
        echo ""
        echo "🌍 Local Access URLs:"
        echo "   Web Interface: http://localhost:$HTTP_PORT"
        echo "   API Endpoint:  http://localhost:$HTTP_PORT/api"
        echo "   P2P Address:   ws://localhost:$P2P_PORT"
    fi
    
    echo ""
    echo "🔗 To connect other nodes to this one, they should add:"
    echo "   ws://$PUBLIC_IP:$P2P_PORT"
    echo "   to their seed nodes configuration"
    echo ""
    echo "⚡ Your node is now part of the global HackCoin network!"
}

# Main deployment flow
main() {
    echo "Network Type: $NETWORK_TYPE"
    echo "HTTP Port: $HTTP_PORT"
    echo "P2P Port: $P2P_PORT"
    echo ""
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    check_requirements
    install_dependencies
    get_public_ip
    configure_firewall
    
    # Ask about systemd service
    if command -v systemctl &> /dev/null; then
        read -p "Create systemd service for auto-start? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            create_service
        fi
    fi
    
    start_node
    show_info
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "start")
        start_node
        ;;
    "stop")
        if [ -f hackcoin.pid ]; then
            kill $(cat hackcoin.pid)
            rm hackcoin.pid
            print_success "Node stopped"
        elif command -v systemctl &> /dev/null; then
            sudo systemctl stop hackcoin
            print_success "Systemd service stopped"
        else
            print_error "No running node found"
        fi
        ;;
    "status")
        if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/hackcoin.service ]; then
            sudo systemctl status hackcoin
        elif [ -f hackcoin.pid ]; then
            PID=$(cat hackcoin.pid)
            if ps -p $PID > /dev/null; then
                echo "Node is running (PID: $PID)"
            else
                echo "Node is not running (stale PID file)"
            fi
        else
            echo "Node status unknown"
        fi
        ;;
    "logs")
        if command -v systemctl &> /dev/null && [ -f /etc/systemd/system/hackcoin.service ]; then
            sudo journalctl -f -u hackcoin
        else
            echo "Logs not available (use systemd service for log management)"
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|status|logs}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment setup"
        echo "  start   - Start the node"
        echo "  stop    - Stop the node"
        echo "  status  - Check node status"
        echo "  logs    - View node logs"
        exit 1
        ;;
esac
