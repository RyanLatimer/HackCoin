# HackCoin Deployment Guide

## 1. Data Persistence ✅
- **Wallet**: Automatically saved to `node/wallet/private_key`
- **Blockchain**: Now saved to `node/data/blockchain.json`
- **Unspent Outputs**: Saved to `node/data/unspent_txouts.json`
- **Auto-save**: Triggers on every new block and chain updates

## 2. Easy Web Access Options

### Option A: Railway (Recommended - Free Tier Available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Option B: Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-hackcoin-app
heroku config:set NODE_ENV=production
git push heroku main
```

### Option C: DigitalOcean App Platform
1. Connect your GitHub repo
2. Auto-deploys on push
3. $5/month for 512MB RAM

### Option D: Vercel (Static + Serverless)
```bash
npm install -g vercel
vercel --prod
```

## 3. Desktop Applications

### Windows (.exe)
```bash
npm install -g electron-builder
npm run build:windows
```

### macOS (.dmg)
```bash
npm install -g electron-builder
npm run build:mac
```

### Linux (.AppImage)
```bash
npm install -g electron-builder
npm run build:linux
```

## 4. Production Deployment Steps

### Step 1: Prepare for Production
```bash
# Set production environment
cp .env.production .env

# Build everything
npm run build:prod
```

### Step 2: Deploy to Cloud
```bash
# Using Railway (easiest)
railway up

# Or using Docker
docker build -t hackcoin .
docker tag hackcoin your-registry/hackcoin
docker push your-registry/hackcoin
```

### Step 3: Custom Domain (Optional)
- Point your domain to the deployed URL
- Enable HTTPS (automatic on most platforms)

## 5. Sharing Your HackCoin

### For End Users:
1. **Web Access**: `https://your-domain.com`
2. **Desktop App**: Download from releases
3. **Direct Node**: `ws://your-domain.com:6001`

### For Developers:
1. **API**: `https://your-domain.com/api`
2. **Clone & Run**: `git clone && npm install && npm start`

## 6. Scaling & Maintenance

### Monitoring
- Block height: `/api/network/status`
- Health check: `/api/health`
- Connected peers: `/api/network/peers`

### Backup Strategy
```bash
# Backup wallet and blockchain data
tar -czf hackcoin-backup.tar.gz node/
```

### Network Growth
- Add more seed nodes to SEED_NODES
- Distribute your node address: `ws://your-domain.com:6001`
- Others can connect and sync automatically
