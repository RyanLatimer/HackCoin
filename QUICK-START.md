# HackCoin Quick Start Guide

## 🚀 Super Easy Setup

### Windows Users
1. Double-click `start-hackcoin-advanced.bat`
2. Choose option 1 (Local) or 2 (Network)
3. Wait for both windows to open
4. Go to http://localhost:3000

### Linux/Mac Users
1. Run `./start-hackcoin.sh`
2. Choose option 1 (Local) or 2 (Network)  
3. Go to http://localhost:3000

## 🎯 First Steps
1. **Create Wallet** → Go to Wallet tab → "Create New Wallet"
2. **Start Mining** → Go to Mining tab → "Start Mining"
3. **Watch Balance** → Mining rewards appear automatically
4. **Send Coins** → Use Wallet tab to send to other addresses

## 🌐 Network Access
- **Local Only**: Only your computer can access
- **Network Access**: Any device on your WiFi can access at `http://YOUR_IP:3000`
- **Find IP**: Run `ipconfig` (Windows) or `ifconfig` (Linux/Mac)

## ⚠️ Important Notes
- This is a **demo blockchain** for learning
- **Does NOT connect** to other HackCoin instances automatically
- Each instance runs its own separate blockchain
- Great for education, testing, and development

## 🛠️ Troubleshooting
- **"Node.js not found"**: Install from https://nodejs.org/
- **Port already in use**: Close other applications using ports 3000/3001
- **Can't access from phone**: Make sure you chose "Network Access" option
- **Mining not working**: Make sure you created a wallet first

## 📁 Key Files
- `start-hackcoin-advanced.bat` - Windows launcher with options
- `start-hackcoin.sh` - Linux/Mac launcher  
- `server.js` - Backend blockchain server
- `client/` - Frontend React application
- `network-config.md` - Detailed networking information
