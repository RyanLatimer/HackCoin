# HackCoin Quick Reference Card

## 🚀 Essential Commands

### Setup & Build
```bash
npm install && cd frontend && npm install && cd ..
npm run compile
npm run build
```

### Start Your Node
```bash
# Basic local node
npm run global-node

# Global node with custom settings
set NETWORK_TYPE=MAINNET
set HTTP_PORT=3001
set P2P_PORT=6001
npm run global-node
```

### Connect to Others
```bash
# Join existing network
set SEED_NODES=ws://FRIEND_IP:6001
npm run global-node
```

## 🌐 Share Your Node

**Your node address to share:**
```
Web: http://YOUR_PUBLIC_IP:3001
P2P: ws://YOUR_PUBLIC_IP:6001
```

## ⛏️ Mining Commands

```bash
# Start mining
curl -X POST http://localhost:3001/api/mine/start

# Stop mining  
curl -X POST http://localhost:3001/api/mine/stop

# Check status
curl http://localhost:3001/api/mine/status
```

## 💸 Transaction Commands

```bash
# Send coins
curl -X POST http://localhost:3001/api/transaction \
  -H "Content-Type: application/json" \
  -d '{"to": "RECIPIENT_ADDRESS", "amount": 10}'

# Check balance
curl http://localhost:3001/api/wallet
```

## 🔍 Network Commands

```bash
# Check network status
curl http://localhost:3001/api/network/status

# List peers
curl http://localhost:3001/api/network/peers

# Health check
curl http://localhost:3001/api/health
```

## 🧪 Multi-Device Test

**Device 1:**
```bash
npm run global-node
# Note your IP (e.g., 192.168.1.100)
```

**Device 2:**
```bash
set SEED_NODES=ws://192.168.1.100:6001
set HTTP_PORT=3002
set P2P_PORT=6002
npm run global-node
```

**Test:**
- Open http://192.168.1.100:3001 (Device 1)
- Open http://192.168.1.101:3002 (Device 2)
- Mine on one, see sync on other
- Send transaction between devices

## 👛 Wallet Backup

**Backup:**
```bash
copy "node/wallet/private_key" "my_wallet_backup.txt"
```

**Restore:**
```bash
mkdir -p node/wallet
copy "my_wallet_backup.txt" "node/wallet/private_key"
```

## 🐳 Docker Quick Start

```bash
docker-compose up -d
# Access: http://localhost:3001
```

## 📱 Web Interface

- **Dashboard**: Network stats, blockchain info
- **Mining**: Start/stop mining, performance
- **Transactions**: Send coins, view history
- **Wallet**: Address, balance, management
- **Explorer**: Browse blocks and transactions

## 🔧 Troubleshooting

**Port conflicts:**
```bash
set HTTP_PORT=3005
set P2P_PORT=6005
```

**Connection issues:**
```bash
# Test peer connection
curl http://PEER_IP:3001/api/health
```

**Firewall (Linux):**
```bash
sudo ufw allow 3001
sudo ufw allow 6001
```

---

## 🎯 Quick Start Checklist

1. [ ] `npm install` (install dependencies)
2. [ ] `npm run compile` (build TypeScript)  
3. [ ] `npm run build` (build frontend)
4. [ ] `npm run global-node` (start node)
5. [ ] Open http://localhost:3001 (web interface)
6. [ ] Share ws://YOUR_IP:6001 (for others to connect)
7. [ ] Start mining or send transactions!

**Need help?** Check the full README.md for detailed instructions.
