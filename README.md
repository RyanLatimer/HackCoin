# HackCoin Global Network - Complete User Guide

![HackCoin Logo](https://img.shields.io/badge/HackCoin-Global%20Network-blue?style=for-the-badge)

## 🌍 What is HackCoin?

HackCoin is a fully decentralized cryptocurrency with a professional web interface that allows anyone to:
- **Host nodes** and become part of the global network
- **Mine coins** using proof-of-work consensus
- **Send and receive transactions** globally
- **Join existing networks** by connecting to other nodes
- **Access via web browser** from anywhere in the world

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Hosting Your Own Node](#-hosting-your-own-node)
3. [Sharing Your Node IP](#-sharing-your-node-ip)
4. [Joining the Network](#-joining-the-network)
5. [Wallet Management](#-wallet-management)
6. [Mining Coins](#-mining-coins)
7. [Sending Transactions](#-sending-transactions)
8. [Multi-Device Testing](#-multi-device-testing)
9. [Global Network Communication](#-global-network-communication)
10. [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Git
- Internet connection
- Open ports 3001 (HTTP) and 6001 (P2P)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd HackCoin

# Install dependencies
npm install
cd frontend
npm install
cd ..

# Build the project
npm run compile
npm run build
```

## 🏠 Hosting Your Own Node
### Method 1: Global Host Node (Recommended)
```bash
# Set environment variables for global access
set NETWORK_TYPE=MAINNET
set HTTP_PORT=3001
set P2P_PORT=6001
set NODE_NAME=MyHackCoinNode

# Start the global node
npm run global-node
```

### Method 2: Docker Deployment (Production)
```bash
# Using Docker Compose (easiest)
docker-compose up -d

# Or build and run manually
docker build -t hackcoin .
docker run -p 3001:3001 -p 6001:6001 hackcoin
```

### Method 3: Cloud Deployment

#### AWS EC2
```bash
# Launch Ubuntu EC2 instance, then:
sudo apt update && sudo apt install -y nodejs npm git
git clone <your-repo>
cd HackCoin
npm install && cd frontend && npm install && cd ..
npm run compile && npm run build

# Set your public IP
export PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
export NETWORK_TYPE=MAINNET
npm run global-node
```

#### DigitalOcean Droplet
```bash
# Create Ubuntu droplet, then same as AWS
# Make sure to open ports 3001 and 6001 in firewall
```

#### Google Cloud Platform
```bash
# Create Compute Engine instance, then:
# Same installation steps as AWS
# Configure firewall rules for ports 3001, 6001
```

## 🌐 Sharing Your Node IP

### Finding Your Public IP
```bash
# The node automatically discovers your public IP
# You'll see it in the startup logs:
# "Public IP discovered: 123.456.789.101"

# Or check manually:
curl http://checkip.amazonaws.com  # Linux/Mac
# Windows: Visit https://whatismyipaddress.com/
```

### Sharing Your Node Information

Once your node is running, share these details with others:

**Your Node Information:**
```
🌍 Web Interface: http://YOUR_PUBLIC_IP:3001
🔗 P2P Address: ws://YOUR_PUBLIC_IP:6001
📊 API Base: http://YOUR_PUBLIC_IP:3001/api
🏥 Health Check: http://YOUR_PUBLIC_IP:3001/api/health
```

**Example:**
```
🌍 Web Interface: http://203.0.113.45:3001
🔗 P2P Address: ws://203.0.113.45:6001
📊 Node Status: http://203.0.113.45:3001/api/network/status
```

### Router Configuration (If Hosting at Home)

If hosting from home, configure port forwarding:
1. Access your router admin panel (usually 192.168.1.1)
2. Forward these ports to your computer:
   - Port 3001 → Your Computer IP:3001 (HTTP)
   - Port 6001 → Your Computer IP:6001 (P2P)

## 🤝 Joining the Network

### Connecting to Existing Nodes

#### Method 1: Environment Variables
```bash
# Connect to specific seed nodes
set SEED_NODES=ws://203.0.113.45:6001,ws://198.51.100.30:6001
npm run global-node
```

#### Method 2: Via API (After Starting)
```bash
# Add peers through API
curl -X POST http://localhost:3001/api/network/peers \
  -H "Content-Type: application/json" \
  -d '{"address": "ws://203.0.113.45:6001"}'
```

#### Method 3: Web Interface
1. Open http://localhost:3001
2. Go to "Network" tab
3. Click "Add Peer"
4. Enter peer address: `ws://PEER_IP:6001`

### Finding Other Nodes

**Community Nodes** (Share your node here!):
```
# Example nodes (replace with real community nodes)
ws://hackcoin-node1.example.com:6001
ws://hackcoin-node2.example.com:6001
ws://203.0.113.45:6001
```

**Testing with Friends:**
1. One person hosts a node and shares their IP
2. Others connect using the shared IP as seed node
3. All nodes automatically discover each other

## 👛 Wallet Management

### Understanding Your Wallet

Your wallet is automatically created on first run and stored in:
```
HackCoin/node/wallet/private_key
```

### Wallet Address
Your wallet address (public key) is displayed when the node starts:
```bash
💰 Wallet: 04d3fdc3a38d8e1991b42e02179f8335659f8d3157191c2e...
```

### Persistent Wallet Access

#### Same Device
Your wallet persists automatically. Just restart the node:
```bash
npm run global-node
# Your wallet and balance are restored automatically
```

#### New Device/Backup
1. **Backup your wallet:**
   ```bash
   # Copy this file to safe location
   copy "node/wallet/private_key" "my_wallet_backup.txt"
   ```

2. **Restore on new device:**
   ```bash
   # After installing HackCoin on new device
   mkdir -p node/wallet
   copy "my_wallet_backup.txt" "node/wallet/private_key"
   npm run global-node
   ```

#### Multiple Wallets
```bash
# Create different wallet for different environments
set WALLET_FILE=wallet_mainnet.key
npm run global-node

# Or use different directories
mkdir node/wallet_testnet
copy "existing_wallet" "node/wallet_testnet/private_key"
```

## ⛏️ Mining Coins

### Start Mining

#### Via Web Interface
1. Open http://localhost:3001
2. Go to "Mining" tab
3. Click "Start Mining"
4. Monitor hash rate and blocks found

#### Via API
```bash
# Start mining
curl -X POST http://localhost:3001/api/mine/start

# Check mining status
curl http://localhost:3001/api/mine/status

# Stop mining
curl -X POST http://localhost:3001/api/mine/stop
```

#### Via Command Line
```bash
# Start mining automatically when node starts
set AUTO_MINE=true
npm run global-node
```

### Mining Information

- **Block Reward**: 50 HCK per block
- **Block Time**: ~10 seconds (adjustable difficulty)
- **Mining Algorithm**: SHA-256 Proof of Work
- **Difficulty**: Adjusts based on network hash rate

### Mining Tips

1. **Solo Mining**: Mine on your own node
2. **Network Mining**: Join a network with other miners
3. **Performance**: Mining speed depends on CPU power
4. **Rewards**: First to solve block gets the reward
5. **Persistence**: Mining continues until manually stopped

## 💸 Sending Transactions

### Via Web Interface
1. Open http://localhost:3001
2. Go to "Transactions" tab
3. Enter recipient address and amount
4. Click "Send Transaction"
5. Transaction is broadcast to network

### Via API
```bash
# Send transaction
curl -X POST http://localhost:3001/api/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "to": "04d3fdc3a38d8e1991b42e02179f8335659f8d3157191c2e...",
    "amount": 10
  }'
```

### Transaction Process
1. **Create Transaction**: Specify recipient and amount
2. **Digital Signature**: Transaction signed with your private key
3. **Broadcast**: Sent to all connected peers
4. **Mining**: Included in next mined block
5. **Confirmation**: Block added to blockchain

### Checking Balances
```bash
# Your balance
curl http://localhost:3001/api/wallet

# Specific address balance
curl http://localhost:3001/api/balance/ADDRESS
```

## 🔧 Multi-Device Testing

### Setup 1: Same Network (Local Testing)

**Device 1 (Host Node):**
```bash
# Find your local IP
ipconfig  # Windows
ifconfig  # Linux/Mac
# Example: 192.168.1.100

# Start node
set NETWORK_TYPE=LOCAL
npm run global-node
```

**Device 2 (Client Node):**
```bash
# Connect to Device 1
set SEED_NODES=ws://192.168.1.100:6001
set HTTP_PORT=3002
set P2P_PORT=6002
npm run global-node
```

**Testing:**
- Open http://192.168.1.100:3001 (Device 1 interface)
- Open http://192.168.1.101:3002 (Device 2 interface)
- Mine on Device 1, see blocks sync to Device 2
- Send transaction from Device 1 to Device 2

### Setup 2: Internet Testing (Global)

**Device 1 (Public Node):**
```bash
# Deploy on cloud or open home router ports
set NETWORK_TYPE=MAINNET
npm run global-node
# Note your public IP: e.g., 203.0.113.45
```

**Device 2 (Mobile/Remote):**
```bash
# Connect from anywhere in the world
set SEED_NODES=ws://203.0.113.45:6001
set HTTP_PORT=3001
set P2P_PORT=6001
npm run global-node
```

**Testing:**
- Access via browser: http://203.0.113.45:3001
- Test from phone, tablet, different locations
- Verify peer connections in Network tab

### Setup 3: Multi-Node Network

Create a 3-node network for comprehensive testing:

**Node 1 (Seed Node):**
```bash
set HTTP_PORT=3001
set P2P_PORT=6001
npm run global-node
```

**Node 2:**
```bash
set HTTP_PORT=3002
set P2P_PORT=6002
set SEED_NODES=ws://NODE1_IP:6001
npm run global-node
```

**Node 3:**
```bash
set HTTP_PORT=3003
set P2P_PORT=6003
set SEED_NODES=ws://NODE1_IP:6001,ws://NODE2_IP:6002
npm run global-node
```

### Automated Testing Script

Use the provided test script:
```bash
# Test multi-node locally
node simple-test.js

# This automatically:
# 1. Starts Node1 on ports 3001/6001
# 2. Starts Node2 on ports 3002/6002 
# 3. Connects Node2 to Node1
# 4. Verifies P2P communication
# 5. Tests blockchain synchronization
```

## 🌐 Global Network Communication

### Network Discovery

**Broadcasting Your Node:**
1. Share your P2P address: `ws://YOUR_IP:6001`
2. Others add you as seed node
3. Network automatically discovers peers
4. Creates mesh network topology

**Joining Existing Networks:**
```bash
# Connect to multiple seed nodes for redundancy
set SEED_NODES=ws://node1.hackcoin.com:6001,ws://node2.hackcoin.com:6001,ws://203.0.113.45:6001
```

### Network Health Monitoring

```bash
# Check network status
curl http://localhost:3001/api/network/status

# Response:
{
  "connectedPeers": 5,
  "networkHash": "abc123...",
  "syncStatus": "synced",
  "network": "MAINNET",
  "nodeAddress": "203.0.113.45"
}

# List all peers
curl http://localhost:3001/api/network/peers
```

### Global Communication Features

1. **Transaction Broadcasting**: Transactions sent to all peers
2. **Block Propagation**: New blocks instantly shared
3. **Peer Discovery**: Nodes share peer lists
4. **Blockchain Sync**: Automatic synchronization
5. **Network Consensus**: All nodes agree on blockchain state

### Real-World Usage Examples

**Scenario 1: Global Payment**
1. Alice (USA) sends 50 HCK to Bob (Japan)
2. Transaction broadcasts to global network
3. Miner in Germany includes in block
4. Block propagates to all global nodes
5. Bob's wallet in Japan shows balance update

**Scenario 2: Distributed Mining**
1. Miners worldwide compete to solve blocks
2. First to solve broadcasts solution
3. All nodes validate and accept block
4. Network difficulty adjusts globally
5. Next block competition begins

## 📊 Monitoring and Management

### Web Interface Features

**Dashboard:**
- Real-time network statistics
- Blockchain height and hash
- Connected peers count
- Node health status

**Mining Page:**
- Start/stop mining controls
- Hash rate monitoring
- Blocks mined counter
- Mining difficulty display

**Transactions Page:**
- Send transaction form
- Transaction history
- Balance tracking
- Transaction pool status

**Wallet Page:**
- Your wallet address
- Current balance
- Generate new addresses
- Export/import wallet

**Explorer Page:**
- Browse blockchain blocks
- View transaction details
- Search by hash or address
- Network statistics

### API Monitoring

```bash
# Health check (use for uptime monitoring)
curl http://localhost:3001/api/health

# Network statistics
curl http://localhost:3001/api/network/status

# Blockchain info
curl http://localhost:3001/api/blocks

# Mining status
curl http://localhost:3001/api/mine/status
```

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Change ports
set HTTP_PORT=3005
set P2P_PORT=6005
npm run global-node
```

**Cannot Connect to Peers:**
```bash
# Check if peer is online
curl http://PEER_IP:3001/api/health

# Try different seed nodes
set SEED_NODES=ws://alternative-node:6001
```

**Firewall Issues:**
```bash
# Windows: Allow ports through Windows Firewall
# Linux: sudo ufw allow 3001 && sudo ufw allow 6001
# Router: Forward ports 3001 and 6001
```

**Wallet Not Persisted:**
```bash
# Ensure wallet directory exists
mkdir -p node/wallet

# Check wallet file permissions
ls -la node/wallet/
```

### Network Debugging

```bash
# Verbose logging
set DEBUG=true
npm run global-node

# Check peer connections
curl http://localhost:3001/api/network/peers

# Verify blockchain sync
curl http://localhost:3001/api/blocks | jq length
```

### Performance Optimization

```bash
# Limit peer connections
set MAX_PEERS=5

# Increase mining interval for better performance
set MINING_INTERVAL=2000

# Use production build for better performance
npm run build
NODE_ENV=production npm run global-node
```

## 🚀 Advanced Deployment

### Production Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Configure proper firewall rules
- [ ] Set up monitoring and alerts
- [ ] Backup wallet files securely
- [ ] Use environment variables for secrets
- [ ] Set up log rotation
- [ ] Configure reverse proxy (nginx)
- [ ] Set up auto-restart on failure

### SSL/HTTPS Setup

```bash
# Generate SSL certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Configure HTTPS
set SSL_CERT=cert.pem
set SSL_KEY=key.pem
set HTTPS_PORT=443
npm run global-node
```

### Systemd Service (Linux)

```bash
# Create service file
sudo nano /etc/systemd/system/hackcoin.service

[Unit]
Description=HackCoin Node
After=network.target

[Service]
Type=simple
User=hackcoin
WorkingDirectory=/home/hackcoin/HackCoin
Environment=NODE_ENV=production
Environment=NETWORK_TYPE=MAINNET
ExecStart=/usr/bin/node global-node.js
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable hackcoin
sudo systemctl start hackcoin
```

## 🎯 Quick Reference

### Essential Commands

```bash
# Start node
npm run global-node

# Build project
npm run compile && npm run build

# Test network
node simple-test.js

# Docker deployment
docker-compose up -d

# Check status
curl http://localhost:3001/api/health
```

### Essential URLs

```bash
# Web interface
http://localhost:3001

# API health
http://localhost:3001/api/health

# Network status
http://localhost:3001/api/network/status

# Start mining
curl -X POST http://localhost:3001/api/mine/start
```

### Environment Variables

```bash
NETWORK_TYPE=LOCAL|TESTNET|MAINNET
HTTP_PORT=3001
P2P_PORT=6001
NODE_NAME=MyNode
SEED_NODES=ws://node1:6001,ws://node2:6001
PUBLIC_IP=203.0.113.45
MAX_PEERS=10
AUTO_MINE=true
```

---

## 🎉 Ready to Join the HackCoin Network!

You now have everything needed to:
- ✅ Host your own HackCoin node
- ✅ Share your IP for others to connect
- ✅ Join existing networks worldwide  
- ✅ Manage your wallet persistently
- ✅ Mine HackCoin cryptocurrency
- ✅ Send/receive global transactions
- ✅ Test multi-device communication
- ✅ Build a global decentralized network

**Start your journey:** `npm run global-node`

**Join the community:** Share your node IP and connect to others!

---

*HackCoin - Decentralized cryptocurrency for everyone, everywhere! 🌍💰*
