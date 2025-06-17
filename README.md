# HackCoin - Advanced Blockchain Cryptocurrency Platform

🚀 **The Future of Decentralized Currency** 🚀

<a href="https://www.buymeacoffee.com/cosme12" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

HackCoin is a modern, feature-rich blockchain cryptocurrency platform that combines the security of traditional blockchain technology with cutting-edge user experience design. Built with Python (Flask) backend and React frontend, HackCoin offers a complete ecosystem for mining, wallet management, and transaction processing.

## ✨ Key Features

### 🎯 **Advanced Mining System**
- **Variable Hash Difficulty**: Customize mining difficulty from 1,000 to 100,000+
- **Multi-threaded Processing**: Utilize up to 8 CPU threads for optimal performance
- **Real-time Hash Rate Monitoring**: Live performance metrics and statistics
- **Smart Intensity Control**: Low, Medium, High mining modes
- **Mining Rewards**: Earn 1 HCK per successfully mined block

### 💎 **Professional Wallet Management**
- **Secure Key Generation**: ECDSA-based cryptographic security
- **Wallet Import/Export**: Backup and restore wallet functionality
- **Real-time Balance Updates**: Live balance tracking across the network
- **Transaction History**: Complete transaction record with filtering
- **Copy-to-Clipboard**: Easy address and key management

### 🌐 **Modern Web Interface**
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Real-time Updates**: Live blockchain and mining status via WebSocket
- **Dark Theme**: Professional glassmorphism design
- **Interactive Charts**: Visual representation of network statistics
- **Search & Filter**: Advanced blockchain explorer with search capabilities

### 🔗 **Blockchain Explorer**
- **Block Details**: Complete block information with transaction history
- **Network Statistics**: Total blocks, transactions, and volume metrics
- **Transaction Tracking**: Search and filter transactions by address
- **Hash Verification**: Copy and verify block hashes
- **Performance Metrics**: Average block time and network health

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HackCoin.git
   cd HackCoin
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm run install-all
   ```

4. **Configure your miner** (Edit `simpleCoin/miner_config.py`)
   ```python
   # Set your wallet address for mining rewards
   MINER_ADDRESS = "your-wallet-address-here"
   MINER_NODE_URL = "http://localhost:5000"
   PEER_NODES = []  # Add peer nodes here
   ```

### Running HackCoin

1. **Start the Enhanced Miner** (Terminal 1)
   ```bash
   python hackcoin_miner.py
   ```

2. **Start the GUI Application** (Terminal 2)
   ```bash
   npm run dev
   ```

3. **Access the Interface**
   - **GUI**: http://localhost:3001
   - **API**: http://localhost:5000

## 💡 How to Use

### 1. Create Your Wallet
- Navigate to the Wallet section
- Click "Create New Wallet" to generate a secure key pair
- **IMPORTANT**: Backup your private key securely!

### 2. Start Mining
- Go to the Mining section
- Configure your mining settings:
  - **Difficulty**: Choose from Easy (1,000) to Extreme (100,000+)
  - **Threads**: Select 1-8 CPU threads
  - **Intensity**: Low/Medium/High performance modes
- Click "Start Mining" to begin earning HCK

### 3. Send Transactions
- Use the Wallet interface to send HCK to other addresses
- All transactions are secured with ECDSA signatures
- Monitor transaction status in the Transactions section

### 4. Explore the Blockchain
- View all blocks and transactions in the Blockchain Explorer
- Search by block hash, address, or transaction data
- Monitor network statistics and performance

## 🔧 Advanced Configuration

### Mining Difficulty Presets
- **Easy (1,000)**: Perfect for testing and low-power devices
- **Medium (7,919)**: Balanced performance (default)
- **Hard (50,000)**: Increased security and mining time
- **Extreme (100,000+)**: Maximum security for production networks
- **Custom**: Set any difficulty value manually

### Network Configuration
Edit `simpleCoin/miner_config.py` to configure:
- Miner reward address
- Node URL and port
- Peer node connections
- Network parameters

### API Endpoints
- `GET /blocks` - Retrieve blockchain data
- `POST /txion` - Submit transactions
- `POST /mining/start` - Start mining with parameters
- `POST /mining/stop` - Stop mining
- `GET /mining/stats` - Get mining statistics

## 📊 Technical Architecture

### Backend (Python/Flask)
- **Blockchain Core**: Enhanced block structure with difficulty support
- **Mining Engine**: Multi-threaded proof-of-work algorithm
- **Transaction Pool**: Pending transaction management
- **Consensus Algorithm**: Longest chain rule implementation
- **API Layer**: RESTful endpoints for frontend communication

### Frontend (React/TypeScript)
- **Component Architecture**: Modular, reusable UI components
- **State Management**: Context-based wallet and socket management
- **Real-time Updates**: WebSocket integration for live data
- **Responsive Design**: Tailwind CSS with glassmorphism effects
- **User Experience**: Toast notifications and loading states

### Security Features
- **ECDSA Signatures**: Cryptographic transaction signing
- **Hash Verification**: SHA-256 block hashing
- **Input Validation**: Comprehensive data sanitization
- **Secure Storage**: Local wallet encryption options

## 🛡️ Security Considerations

⚠️ **Important Security Notes**:
1. **Private Key Security**: Never share your private key with anyone
2. **Wallet Backup**: Always backup your wallet files securely
3. **Network Security**: Use HTTPS in production environments
4. **Peer Validation**: Verify peer nodes before adding to network
5. **Regular Updates**: Keep HackCoin updated to latest version

## 🤝 Contributing

We welcome contributions to HackCoin! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests
- Security vulnerability reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original SimpleCoin concept for blockchain foundation
- React and Flask communities for excellent frameworks
- Cryptocurrency pioneers for inspiration and innovation
- Open source contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/HackCoin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/HackCoin/discussions)
- **Email**: hackcoin@example.com

---

**🚀 Welcome to the Future of Cryptocurrency with HackCoin! 🚀**

*Remember: This is educational software. For production cryptocurrency, please use established, audited blockchain platforms.*

2. The second process runs the flask server where peer nodes and users can connect to ask for the entire blockchain or submit new transactions.

> Parallel processes don't run in python IDLE, so make sure you are running it from the console.

![miner](https://k60.kn3.net/3/B/3/F/E/C/013.png)

The following flowchart provides a simple , high-level understanding of what the miner does
![MinerFlowchart](images/flowchart.png)

### Wallet.py

This file is for those who don't want to be nodes but simple users. Running this file allows you to generate a new address, send coins and check your transaction history (keep in mind that if you are running this in a local server, you will need a "miner" to process your transaction).
When creating a wallet address, a new file will be generated with all your security credentials. You are supposed to keep it safe.

![wallet](https://k60.kn3.net/6/F/E/3/8/2/887.png)


## Contribution

Anybody is welcome to collaborate in this project. Feel free to push any pull request (even if you are new to coding). See ```CONTRIBUTING.md``` to learn how to contribute.

Note: the idea of this project is to build a **really simple** blockchain system, so make sure all your code is easy to read (avoid too much code in 1 line) and don't introduce complex updates if they are not critical. In other words, keep it simple.


## Disclaimer

By no means this project should be used for real purposes, it lacks security and may contain several bugs.
