# HackCoin Configuration Guide

## First Time Setup

### 1. Install Dependencies
Run either:
- **Windows Batch**: `start-hackcoin.bat`
- **PowerShell**: `start-hackcoin.ps1`
- **Manual**: See commands below

### 2. Manual Installation Commands

#### Python Dependencies:
```bash
pip install -r requirements.txt
```

#### Node.js Dependencies:
```bash
npm run install-all
```

### 3. Configure Your Miner

Edit `simpleCoin/miner_config.py`:

```python
# Your wallet address (generate one first in the GUI)
MINER_ADDRESS = "your-wallet-address-here"

# Node URL (keep default for local development)
MINER_NODE_URL = "http://localhost:5000"

# Add peer nodes here (for network mining)
PEER_NODES = [
    # "http://peer1.example.com:5000",
    # "http://peer2.example.com:5000"
]
```

## Running HackCoin

### Option 1: Use Startup Scripts (Recommended)
- **Windows**: Double-click `start-hackcoin.bat`
- **PowerShell**: Right-click `start-hackcoin.ps1` → "Run with PowerShell"

### Option 2: Manual Startup

#### Terminal 1 - Start the Enhanced Miner:
```bash
python hackcoin_miner.py
```

#### Terminal 2 - Start the Web GUI:
```bash
npm run dev
```

#### Access Points:
- **GUI Interface**: http://localhost:3001
- **API Endpoint**: http://localhost:5000
- **Info Server**: http://localhost:3000

## Mining Configuration

### Difficulty Levels:
- **Easy**: 1,000 (Testing/Low-power devices)
- **Medium**: 7,919 (Default/Balanced)
- **Hard**: 50,000 (Increased security)
- **Extreme**: 100,000+ (Maximum security)
- **Custom**: Any value you specify

### Thread Configuration:
- **Single Thread**: Good for background mining
- **Multiple Threads**: Use 50-75% of your CPU cores
- **Maximum**: Use all available cores (high power usage)

### Intensity Modes:
- **Low**: Battery-friendly, minimal CPU usage
- **Medium**: Balanced performance and power usage
- **High**: Maximum performance, high power usage

## Wallet Security

### Important Security Tips:
1. **Backup Private Key**: Store it securely offline
2. **Never Share**: Don't share your private key with anyone
3. **Use Strong Passwords**: When backing up wallet files
4. **Verify Addresses**: Double-check recipient addresses
5. **Test Transactions**: Send small amounts first

### Wallet Operations:
- **Create**: Generate new wallet with secure keys
- **Import**: Restore wallet from private key
- **Export**: Backup wallet to file
- **Send**: Transfer HCK to other addresses
- **Balance**: View current HCK balance

## Troubleshooting

### Common Issues:

#### "Connection refused" error:
- Make sure the miner is running first
- Check if port 5000 is available
- Verify firewall settings

#### GUI won't load:
- Ensure Node.js dependencies are installed
- Check if port 3001 is available
- Try `npm run client` directly

#### Mining not starting:
- Verify wallet address in miner config
- Check Python dependencies
- Ensure sufficient system resources

#### Low hash rate:
- Increase thread count
- Set intensity to "High"
- Close other resource-intensive applications

### Performance Tips:
1. **Optimize Threads**: Use 1 less than total CPU cores
2. **Adjust Difficulty**: Lower for faster blocks, higher for security
3. **Monitor Resources**: Keep CPU usage below 90%
4. **Network**: Ensure stable internet for peer connections

## API Endpoints

### Blockchain:
- `GET /blocks` - Get all blocks
- `GET /blocks?update=<address>` - Update blockchain

### Transactions:
- `POST /txion` - Submit transaction
- `GET /txion?update=<address>` - Get pending transactions

### Mining:
- `POST /mining/start` - Start mining with config
- `POST /mining/stop` - Stop mining
- `GET /mining/stats` - Get mining statistics
- `POST /mining/config` - Update mining settings

## Network Setup

### Running Multiple Nodes:
1. **Configure Different Ports**: Each node needs unique ports
2. **Add Peer Connections**: Update PEER_NODES in config
3. **Sync Wallets**: Each node should have different wallet address
4. **Monitor Consensus**: Nodes will sync to longest chain

### Production Deployment:
1. **Use HTTPS**: Secure all communications
2. **Firewall Rules**: Open only necessary ports
3. **Monitoring**: Set up health checks
4. **Backup Strategy**: Regular blockchain and wallet backups

---

## Quick Reference

### Development URLs:
- GUI: http://localhost:3001
- API: http://localhost:5000
- Info: http://localhost:3000

### Key Files:
- `hackcoin_miner.py` - Enhanced miner
- `simpleCoin/miner_config.py` - Miner configuration
- `client/src/` - React frontend source
- `requirements.txt` - Python dependencies
- `package.json` - Node.js configuration

### Support:
- Check README.md for detailed information
- Review code comments for implementation details
- Create GitHub issues for bugs or features

**🚀 Happy Mining with HackCoin! 🚀**
