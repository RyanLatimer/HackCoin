# 🚀 HackCoin Quick Start Guide

## ✅ Data Persistence (SOLVED!)
Your wallet and blockchain data is now automatically saved:
- **Wallet**: `node/wallet/private_key` (automatically created)
- **Blockchain**: `node/data/blockchain.json` (saves every new block)
- **Transactions**: `node/data/unspent_txouts.json` (saves transaction state)

## 🌐 Easy Web Access Options

### Option 1: Railway (FREE & EASIEST)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Deploy (they'll give you a URL like https://your-app.railway.app)
railway login
railway up

# 3. Share the URL with users - they can access instantly!
```

### Option 2: Heroku (FREE tier available)
```bash
# 1. Install Heroku CLI
# 2. Create app
heroku create your-hackcoin-name
git push heroku main

# 3. Your URL: https://your-hackcoin-name.herokuapp.com
```

### Option 3: Vercel (FREE)
```bash
npm install -g vercel
vercel --prod
# Gets you: https://your-project.vercel.app
```

## 💻 Desktop Apps (.exe/.dmg)

### Build Windows .exe
```bash
npm install  # Install electron dependencies
npm run build:windows
# Creates: dist/HackCoin Setup.exe
```

### Build Mac .dmg
```bash
npm run build:mac
# Creates: dist/HackCoin.dmg
```

### Build Linux AppImage
```bash
npm run build:linux
# Creates: dist/HackCoin.AppImage
```

## 🔧 Test Everything Locally First

### 1. Test with Persistence
```bash
# Compile and start
npm run api-server

# Your data is saved to:
# - node/wallet/private_key
# - node/data/blockchain.json
# - node/data/unspent_txouts.json

# Stop and restart - your data persists!
```

### 2. Test Desktop App
```bash
npm install
npm run electron
# Opens desktop app with built-in server
```

## 📱 Sharing with Users

### For Non-Technical Users:
1. **Web Link**: "Go to https://your-app.railway.app"
2. **Desktop App**: "Download and install HackCoin.exe"
3. **Mobile**: Web link works on phones too!

### For Developers:
1. **Clone & Run**: `git clone [repo] && npm install && npm run api-server`
2. **Docker**: `docker run -p 3001:3001 -p 6001:6001 hackcoin`
3. **Connect Node**: `ws://your-domain.com:6001`

## 🛠 Production Deployment

### Before deploying:
```bash
# Set production environment
cp .env.production .env

# Build everything
npm run build:prod
```

### Railway Deployment:
```bash
railway up
# Sets environment variables automatically
# Provides HTTPS domain
# Auto-restarts on crashes
```

## 🎯 Next Steps

1. **Deploy to Railway** (5 minutes, free)
2. **Share the URL** with friends
3. **Build desktop apps** for offline use
4. **Set up custom domain** (optional)

Your HackCoin network can now:
- ✅ Persist all data
- ✅ Run in the cloud
- ✅ Work as desktop apps
- ✅ Connect to other nodes
- ✅ Scale globally

**The wallet address and blockchain will persist across restarts!** 🎉
