# 🌍 HackCoin Global Network - One Command Setup

**Join the global HackCoin network with just ONE command from anywhere in the world!**

## 🚀 Super Quick Start

### Option 1: Windows Users
```cmd
# Just double-click this file:
start-global.bat
```

### Option 2: Linux/Mac Users  
```bash
# Just run this command:
./start-global.sh
```

### Option 3: PowerShell Users
```powershell
# Run this in PowerShell:
.\start-global.ps1
```

### Option 4: Universal Command
```bash
# Works on any platform:
npm run global
```

**That's it! 🎉** 

Your node will automatically:
- ✅ Install all dependencies
- ✅ Connect to the global HackCoin network  
- ✅ Sync with the blockchain
- ✅ Start mining (optional)
- ✅ Open the web interface

## 🌐 Access Your Node

Once started, you can access:
- **Web Interface**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Network Access**: http://YOUR_IP:3000 (from other devices)

## 🔗 How Global Networking Works

HackCoin uses a decentralized P2P network similar to Bitcoin:

1. **Automatic Peer Discovery**: Your node automatically finds other nodes
2. **Blockchain Sync**: Downloads and syncs with the global blockchain
3. **No Central Servers**: Fully decentralized, no single point of failure
4. **Global Consensus**: All nodes agree on the same blockchain

## 🎯 What You Can Do

### 💰 Create a Wallet
1. Go to the **Wallet** tab
2. Click **"Create New Wallet"**
3. Save your wallet address and private key securely

### ⛏️ Start Mining
1. Go to the **Mining** tab  
2. Enter your wallet address
3. Click **"Start Mining"**
4. Watch your balance grow!

### 💸 Send Transactions
1. Go to the **Wallet** tab
2. Enter recipient address and amount
3. Click **"Send"**
4. Transaction broadcasts to the entire network

### 📊 Monitor Network
1. Go to the **Network** tab
2. See connected peers
3. View blockchain statistics
4. Monitor network health

## 🌍 Global Network Architecture

```
    You (Node)
        │
        ├── Peer Discovery
        ├── Blockchain Sync  
        ├── Transaction Pool
        └── Mining (optional)
        
    Connected to:
        ├── Node A (Mining)
        ├── Node B (Wallet)  
        ├── Node C (Full Node)
        └── ... (Many more nodes worldwide)
```

## ⚙️ Advanced Configuration

### Environment Variables
```bash
# Custom port
PORT=3002 npm run global

# Production mode
NODE_ENV=production npm run global

# Custom seed nodes
SEED_NODES=http://custom-node:3001 npm run global
```

### Command Line Options
```bash
# Windows
start-global.bat

# Linux/Mac  
./start-global.sh --port 3002
```

## 🛠️ Troubleshooting

### "Node.js not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt

### "Port already in use"
- Change the port: `PORT=3002 npm run global`
- Or close other applications using port 3001

### "No peers connected"
- Check your internet connection
- Make sure port 3001 isn't blocked by firewall
- Wait a few minutes for peer discovery

### "Can't access from phone/tablet"
- Make sure you used `0.0.0.0` as HOST (scripts do this automatically)
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
- Access from other devices: `http://YOUR_IP:3000`

## 🔒 Security Notes

- **This is a demo blockchain** for learning and development
- **Do not use for real financial transactions**
- **Keep your private keys secure**
- **Only mine with hardware you own**

## 📋 System Requirements

- **Node.js** 16+ and npm
- **RAM**: 512MB minimum, 2GB recommended
- **Storage**: 1GB free space
- **Network**: Internet connection for global networking
- **OS**: Windows, Linux, macOS

## 🤝 Contributing to the Network

### Become a Seed Node
Help other users connect by running a public seed node:
```bash
# Run on a server with public IP
HOST=0.0.0.0 PORT=3001 npm run dev
```

### Add Seed Nodes
Know reliable nodes? Add them to `global-network.js`:
```javascript
const GLOBAL_SEED_NODES = [
    'https://your-node.example.com:3001',
    // ... existing nodes
];
```

## 📚 Learn More

- **Technical Details**: `BITCOIN-STYLE-P2P-IMPLEMENTATION.md`
- **Network Config**: `network-config.md`  
- **Advanced Setup**: `TWO-DEVICE-SETUP.md`
- **API Reference**: Check `/api/network/info`

## 🎉 That's It!

You're now part of the global HackCoin network! Start mining, send transactions, and explore the decentralized world of blockchain technology.

**Happy Mining! ⛏️💎**
