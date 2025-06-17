# 🌍 HackCoin Global Network Deployment Guide

This guide will help you deploy HackCoin nodes that can be accessed by anyone, anywhere in the world, creating a truly decentralized cryptocurrency network.

## 🎯 Overview

HackCoin can now operate as a global, decentralized network with the following capabilities:

- **Global P2P Network**: Nodes automatically connect to each other worldwide
- **Public API Access**: HTTP REST API accessible from anywhere
- **Cross-Platform Compatibility**: Works on Linux, Windows, Mac, and in Docker
- **Auto-Discovery**: Nodes find and connect to peers automatically
- **Production Ready**: Includes monitoring, logging, and security features

## 🚀 Quick Start (5 minutes)

### Option 1: One-Command Cloud Deployment

```bash
# Clone and deploy to cloud server
git clone <your-repo>
cd HackCoin
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Docker Deployment

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use Docker Compose for full stack
docker-compose up -d
```

### Option 3: Manual Deployment

```bash
# Install dependencies
npm install
npm run build

# Start global node
npm run deploy:mainnet
```

## 🌐 Network Types

### LOCAL (Development)
- Single node testing
- No external connections
- Perfect for development

```bash
npm run deploy:local
```

### TESTNET (Testing)
- Multi-node test network
- Safe for experimentation
- Connects to test seed nodes

```bash
npm run deploy:testnet
```

### MAINNET (Production)
- Live cryptocurrency network
- Real value transactions
- Global peer network

```bash
npm run deploy:mainnet
```

## 🏗️ Cloud Provider Setup

### Amazon AWS (EC2)

1. **Launch EC2 Instance**:
   - Instance Type: t3.medium or larger
   - AMI: Ubuntu 20.04 LTS
   - Security Group: Allow ports 22, 3001, 6001

2. **Connect and Deploy**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   git clone <your-repo>
   cd HackCoin
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Configure Domain** (Optional):
   - Point your domain to the EC2 IP
   - Use Route 53 for DNS management

### Google Cloud Platform (GCP)

1. **Create Compute Engine Instance**:
   ```bash
   gcloud compute instances create hackcoin-node \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud \
     --machine-type=e2-medium \
     --tags=hackcoin-node
   ```

2. **Configure Firewall**:
   ```bash
   gcloud compute firewall-rules create hackcoin-http \
     --allow tcp:3001 --target-tags hackcoin-node
   gcloud compute firewall-rules create hackcoin-p2p \
     --allow tcp:6001 --target-tags hackcoin-node
   ```

3. **Deploy**:
   ```bash
   gcloud compute ssh hackcoin-node
   # Then follow the deployment steps
   ```

### Microsoft Azure

1. **Create Virtual Machine**:
   - Size: Standard_B2s or larger
   - Image: Ubuntu 20.04 LTS
   - Networking: Allow ports 22, 3001, 6001

2. **Deploy** (same as other platforms):
   ```bash
   ssh azureuser@your-vm-ip
   # Follow deployment steps
   ```

### DigitalOcean

1. **Create Droplet**:
   - Size: $12/month droplet or larger
   - Image: Ubuntu 20.04
   - Add your SSH key

2. **Deploy**:
   ```bash
   ssh root@your-droplet-ip
   # Follow deployment steps
   ```

## 🔧 Advanced Configuration

### Environment Variables

```bash
export NETWORK_TYPE="MAINNET"        # LOCAL, TESTNET, MAINNET
export HTTP_PORT="3001"              # HTTP API port
export P2P_PORT="6001"               # P2P network port
export NODE_NAME="My-HackCoin-Node"  # Custom node name
export PUBLIC_IP="1.2.3.4"          # Your public IP
export SEED_NODES="ws://seed1.example.com:6001,ws://seed2.example.com:6001"
```

### Custom Seed Nodes

To bootstrap your own network:

```javascript
// In network-config.ts
const CUSTOM_SEEDS = [
  'ws://your-seed1.com:6001',
  'ws://your-seed2.com:6001',
  'ws://your-seed3.com:6001'
];
```

### SSL/HTTPS Setup

1. **Get SSL Certificate** (Let's Encrypt):
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Configure Nginx** (included in docker-compose):
   ```bash
   # SSL certificates will be auto-configured
   docker-compose up -d
   ```

## 📡 Network Architecture

```
Internet
    │
    ├── Node A (USA) ──────┐
    │                      │
    ├── Node B (Europe) ───┼── P2P Network
    │                      │   (Port 6001)
    ├── Node C (Asia) ─────┘
    │
    └── Users ──────────── HTTP API
                          (Port 3001)
```

### P2P Network Features:
- **Auto-Discovery**: Nodes find each other automatically
- **Redundancy**: Multiple connection paths
- **Global Sync**: Blockchain stays synchronized worldwide
- **Fault Tolerance**: Network continues if nodes go offline

### API Features:
- **REST Endpoints**: Standard HTTP API
- **Real-time Updates**: WebSocket support
- **Cross-Origin**: CORS enabled for web apps
- **Rate Limiting**: Protection against abuse

## 🔒 Security Considerations

### Network Security
- **Private Keys**: Never expose private keys
- **Firewall**: Only open necessary ports
- **SSL**: Use HTTPS in production
- **Updates**: Keep dependencies updated

### Operational Security
- **Monitoring**: Use health checks and monitoring
- **Backups**: Backup wallet files regularly
- **Logging**: Monitor for suspicious activity
- **Access Control**: Limit server access

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check node health
curl http://your-node:3001/api/health

# Check network status
curl http://your-node:3001/api/network/status

# View connected peers
curl http://your-node:3001/api/network/peers
```

### Logs
```bash
# Systemd logs
sudo journalctl -f -u hackcoin

# Docker logs
docker logs -f hackcoin-mainnet
```

### Metrics
- **Connected Peers**: Number of network connections
- **Sync Status**: Blockchain synchronization state
- **Mining Hash Rate**: If mining is enabled
- **Transaction Pool**: Pending transactions

## 🌐 Public Access URLs

Once deployed, your node will be accessible at:

- **Web Interface**: `http://YOUR_IP:3001`
- **API Endpoint**: `http://YOUR_IP:3001/api`
- **P2P Address**: `ws://YOUR_IP:6001`

### API Endpoints:
- `GET /api/health` - Node health status
- `GET /api/blocks` - Get blockchain
- `GET /api/wallet` - Get wallet info
- `POST /api/transaction` - Send transaction
- `GET /api/network/status` - Network status
- `POST /api/mine/start` - Start mining

## 🤝 Connecting to the Network

### For Users:
1. Open `http://any-node-ip:3001` in browser
2. Use the web interface to send transactions
3. View the global blockchain

### For Other Nodes:
1. Add seed nodes: `ws://your-node-ip:6001`
2. Nodes will automatically synchronize
3. Transactions propagate across the network

### For Developers:
1. Use the HTTP API: `http://node-ip:3001/api`
2. Build applications on top of HackCoin
3. Create custom wallets and interfaces

## 🆘 Troubleshooting

### Common Issues:

**Port Already in Use**:
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3001
sudo kill -9 <PID>
```

**Can't Connect to Peers**:
```bash
# Check firewall
sudo ufw status
sudo ufw allow 6001

# Check if port is accessible
telnet your-ip 6001
```

**Node Not Syncing**:
```bash
# Check logs for errors
sudo journalctl -u hackcoin | grep ERROR

# Restart the node
sudo systemctl restart hackcoin
```

**Out of Memory**:
```bash
# Check memory usage
free -h

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🎉 You're Live!

Congratulations! Your HackCoin node is now part of the global cryptocurrency network. Anyone in the world can:

- Connect their nodes to yours
- Send/receive transactions through your node
- Access the blockchain via your API
- Mine HackCoins on the network

Your node helps make HackCoin truly decentralized and censorship-resistant! 🚀

---

**Need Help?** 
- Check the logs for errors
- Review the API documentation
- Join the HackCoin community
- Report issues on GitHub
