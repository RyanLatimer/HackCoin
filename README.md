# HackCoin - Bitcoin-Style P2P Blockchain Cryptocurrency

🚀 **True Decentralized Peer-to-Peer Network** 🚀

<a href="https://www.buymeacoffee.com/cosme12" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

HackCoin is a modern, fully-decentralized blockchain cryptocurrency that works exactly like the Bitcoin network. No central servers, no bootstrap dependencies - just pure peer-to-peer networking with gossip protocol for automatic peer discovery. Built with Node.js (Express) backend and React frontend, HackCoin offers a complete ecosystem for true P2P networking, mining, and wallet management.

## ✨ Key Features

### � **Distributed Network**
- **Peer-to-Peer Networking**: Automatic peer discovery and connection management
- **Blockchain Synchronization**: Real-time blockchain sync across all network nodes
- **Network Health Monitoring**: Live network status and peer monitoring
- **Fork Resolution**: Automatic consensus mechanism for resolving blockchain forks
- **Bootstrap Node Support**: Easy network joining via bootstrap nodes

### 🎯 **Advanced Mining System**
- **Distributed Consensus**: Proof-of-Work mining across the entire network
- **Dynamic Difficulty Adjustment**: Automatic difficulty adjustment based on network performance
- **Network Hash Rate Monitoring**: Real-time network hash rate calculation
- **Mining Pool Support**: Connect to mining pools or mine solo
- **Smart Intensity Control**: Configurable mining intensity and gas limits

### 💎 **Professional Wallet Management**
- **Secure Key Generation**: ECDSA-based cryptographic security
- **Multi-Address Support**: Manage multiple wallet addresses
- **Real-time Balance Tracking**: Live balance updates across the network
- **Transaction History**: Complete transaction record with network confirmations
- **Smart Contract Interaction**: Direct interaction with deployed smart contracts

### 📜 **Smart Contract Engine**
- **JavaScript-based Contracts**: Deploy and execute smart contracts in JavaScript
- **Secure Sandbox Execution**: Safe contract execution environment
- **Gas Metering**: Configurable gas limits and pricing
- **Contract Storage**: Persistent state storage for smart contracts
- **Example Contracts**: Pre-built token, voting, auction, and multi-sig contracts

### 🌐 **Modern Web Interface**
- **Network Monitor**: Real-time network status and peer management
- **Smart Contract IDE**: Deploy and interact with smart contracts
- **Blockchain Explorer**: Advanced blockchain exploration with search
- **Real-time Updates**: Live updates via WebSocket connections
- **Responsive Design**: Mobile-friendly interface with dark theme

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git (optional, for cloning)

### Single Node Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HackCoin.git
   cd HackCoin
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the node**
   ```bash
   npm run dev
   ```

4. **Access the interface**
   - Open http://localhost:3001 in your browser
   - The mining interface will be available immediately

### Distributed Network Setup

#### Method 1: Using Startup Scripts

**Windows:**
```cmd
# Start first node (bootstrap node)
start-distributed.bat --port 3001

# Start second node connecting to first
start-distributed.bat --port 3002 --bootstrap http://localhost:3001

# Start mining node
start-distributed.bat --port 3003 --bootstrap http://localhost:3001 --miner 0x1234567890abcdef
```

**Linux/Mac:**
```bash
# Start first node (bootstrap node)
./start-distributed.sh --port 3001

# Start second node connecting to first
./start-distributed.sh --port 3002 --bootstrap http://localhost:3001

# Start mining node
./start-distributed.sh --port 3003 --bootstrap http://localhost:3001 --miner 0x1234567890abcdef
```

#### Method 2: Manual Environment Variables

```bash
# Terminal 1 - Bootstrap Node
PORT=3001 HOST=0.0.0.0 npm run dev

# Terminal 2 - Peer Node
PORT=3002 HOST=0.0.0.0 BOOTSTRAP_NODES=http://localhost:3001 npm run dev

# Terminal 3 - Mining Node
PORT=3003 HOST=0.0.0.0 BOOTSTRAP_NODES=http://localhost:3001 MINING_ADDRESS=0x1234567890abcdef npm run dev
```

### Network Access Setup

To make your HackCoin node accessible across your local network:

1. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. **Start with network access:**
   ```bash
   HOST=0.0.0.0 PORT=3001 npm run dev
   ```

3. **Connect from other machines:**
   ```bash
   BOOTSTRAP_NODES=http://YOUR_IP_ADDRESS:3001 npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host address | `localhost` |
| `PORT` | Server port number | `3001` |
| `BOOTSTRAP_NODES` | Comma-separated bootstrap node URLs | None |
| `MINING_ADDRESS` | Address for mining rewards | None |

### Network Configuration

Edit `network-config.md` to configure:
- Bootstrap node addresses
- Network parameters
- Mining settings
- Smart contract settings

## 📚 Smart Contracts

### Deploying Contracts

1. **Access the Smart Contracts interface**
   - Navigate to the "Contracts" tab in the web interface

2. **Choose an example contract or write your own**
   - Token Contract: ERC20-like token functionality
   - Voting Contract: Decentralized voting system
   - Auction Contract: Simple auction mechanism
   - Multi-Sig Wallet: Multi-signature wallet

3. **Deploy the contract**
   ```javascript
   // Example: Deploy a token contract
   {
     "deployerAddress": "0x1234567890abcdef",
     "contractCode": "...", // Contract JavaScript code
     "initData": {
       "totalSupply": 1000000,
       "name": "MyToken"
     }
   }
   ```

### Interacting with Contracts

```javascript
// Execute a contract function (state-changing)
{
  "callerAddress": "0x1234567890abcdef",
  "contractAddress": "0xabcdef1234567890",
  "functionName": "transfer",
  "parameters": {
    "to": "0xfedcba0987654321",
    "amount": 100
  },
  "value": 0,
  "gasLimit": 50000
}

// Call a contract function (read-only)
{
  "contractAddress": "0xabcdef1234567890",
  "functionName": "balanceOf",
  "parameters": {
    "address": "0x1234567890abcdef"
  }
}
```

## 🌐 Network Architecture

### Peer-to-Peer Network

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Node A   │◄──►│    Node B   │◄──►│    Node C   │
│  (Mining)   │    │ (Bootstrap) │    │   (Peer)    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                  ▲                  ▲
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│           Distributed Blockchain                    │
│     ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│     │Block│─│Block│─│Block│─│Block│─│Block│  ...  │
│     │  0  │ │  1  │ │  2  │ │  3  │ │  4  │       │
│     └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────────────────────────┘
```

### Consensus Mechanism

1. **Proof of Work**: Miners compete to solve cryptographic puzzles
2. **Difficulty Adjustment**: Network adjusts difficulty every 10 blocks
3. **Fork Resolution**: Longest valid chain wins
4. **Transaction Pool**: Shared transaction pool across all nodes

### Smart Contract Execution

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Deploy TX     │    │   Execute TX    │    │   Contract      │
│                 │    │                 │    │   Storage       │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Contract    │ │───►│ │ Function    │ │───►│ │ State       │ │
│ │ Code        │ │    │ │ Call        │ │    │ │ Updates     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Development

### Project Structure

```
HackCoin/
├── contracts/                 # Smart contract engine
│   ├── SmartContractEngine.js
│   └── ExampleContracts.js
├── network/                   # Distributed networking
│   ├── PeerManager.js
│   ├── BlockchainSync.js
│   └── ConsensusManager.js
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── NetworkMonitor.js
│   │   │   ├── SmartContracts.js
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── server.js                  # Main server
├── package.json
└── README.md
```

### API Endpoints

#### Blockchain API
- `GET /api/blocks` - Get blockchain
- `GET /api/blockchain/full` - Get full blockchain
- `POST /api/blockchain/sync` - Sync blockchain

#### Network API
- `GET /api/network/status` - Get network status
- `POST /api/network/connect` - Connect to peer
- `GET /api/network/peers` - Get connected peers

#### Mining API
- `GET /api/mining/status` - Get mining status
- `POST /api/mining/start` - Start mining
- `POST /api/mining/stop` - Stop mining

#### Smart Contract API
- `POST /api/contracts/deploy` - Deploy contract
- `POST /api/contracts/execute` - Execute contract
- `POST /api/contracts/call` - Call contract (read-only)
- `GET /api/contracts` - Get all contracts

### Building and Running

```bash
# Install dependencies
npm run install-all

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔒 Security Features

- **Cryptographic Security**: ECDSA signatures for all transactions
- **Secure Smart Contracts**: Sandboxed execution environment
- **Network Security**: Peer authentication and validation
- **Input Validation**: Comprehensive input validation on all endpoints
- **Gas Metering**: Prevents infinite loops and resource exhaustion

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📈 Roadmap

### Phase 1: Core Network ✅
- ✅ Peer discovery and connection
- ✅ Blockchain synchronization
- ✅ Distributed consensus
- ✅ Network monitoring

### Phase 2: Smart Contracts ✅
- ✅ Smart contract engine
- ✅ Example contracts
- ✅ Contract deployment UI
- ✅ Gas metering system

### Phase 3: Advanced Features (Planned)
- [ ] Advanced wallet features (HD wallets, multi-sig)
- [ ] Lightning Network integration
- [ ] Advanced smart contract features
- [ ] Mobile app development
- [ ] Cross-chain compatibility

## 🐛 Troubleshooting

### Common Issues

**Peer Connection Failed**
- Check firewall settings
- Verify the bootstrap node is running
- Ensure correct IP addresses and ports

**Mining Not Working**
- Verify mining address is set
- Check that peers are connected
- Ensure sufficient balance for gas fees

**Smart Contract Deployment Failed**
- Check contract code syntax
- Verify deployer has sufficient balance
- Ensure gas limit is adequate

### Debug Mode

Enable debug logging:
```bash
DEBUG=hackcoin:* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Node.js, Express, and React
- Inspired by Bitcoin and Ethereum
- Community contributions and feedback

---

**Made with ❤️ by the HackCoin Team**

For support, please visit our [GitHub Issues](https://github.com/yourusername/HackCoin/issues) page.

2. **Run the automatic setup**
   ```bash
   # Option 1: Simple startup (local access only)
   start-hackcoin.bat
   
   # Option 2: Advanced startup with network options
   start-hackcoin-advanced.bat
   ```

The setup script will:
- Check for Node.js installation
- Install all dependencies automatically  
- Start both backend and frontend servers
- Provide options for local or network access

### Easy Installation (Linux/Mac)

1. **Download or clone the repository**
   ```bash
   git clone https://github.com/yourusername/HackCoin.git
   cd HackCoin
   ```

2. **Run the startup script**
   ```bash
   chmod +x start-hackcoin.sh
   ./start-hackcoin.sh
   ```

### Manual Installation

If you prefer manual setup:

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the backend server**
   ```bash
   node server.js
   ```

4. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```

5. **Access HackCoin**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
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

## 🌐 Network Configuration & Multi-Device Access

### Current Architecture
HackCoin is designed as a **single-node demonstration system** for educational purposes. It operates locally and does not automatically connect to other HackCoin instances.

### Access HackCoin from Other Devices on Your Network

1. **Start with network access:**
   ```bash
   # Set environment variables for network access
   set HOST=0.0.0.0
   set PORT=3001
   node server.js
   ```

2. **Find your computer's IP address:**
   ```bash
   # Windows Command Prompt
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

3. **Access from other devices:**
   - **HackCoin GUI**: `http://YOUR_IP:3000`
   - **API Endpoints**: `http://YOUR_IP:3001/api/`

### Important Networking Limitations

❌ **HackCoin does NOT currently support:**
- Peer-to-peer blockchain synchronization
- Automatic network discovery
- Multi-node consensus mechanisms
- Cross-network transaction validation

✅ **HackCoin DOES support:**
- Local network access to web interface
- API access from network devices
- Individual blockchain instances
- Local mining and wallet operations

> 📋 **See `network-config.md` for detailed networking information and security considerations.**

## 🔧 Advanced Configuration

### Mining Difficulty Presets
- **Easy (1,000)**: Perfect for testing and demonstrations
- **Medium (7,919)**: Balanced performance (default)
- **Hard (50,000)**: Increased difficulty for longer mining times
- **Extreme (100,000+)**: Maximum difficulty
- **Custom**: Set any difficulty value manually

### Environment Variables
```bash
# Backend configuration
HOST=0.0.0.0          # Network interface (localhost or 0.0.0.0)
PORT=3001             # Backend server port

# Frontend configuration  
REACT_APP_API_URL=http://localhost:3001  # Backend API URL
```

### API Endpoints
- `GET /api/blocks` - Retrieve blockchain data
- `GET /api/mining/status` - Get current mining status
- `POST /api/mining/start` - Start mining with parameters
- `POST /api/mining/stop` - Stop mining process
- `POST /api/transaction` - Submit new transactions

## 📊 Technical Architecture

### Backend (Node.js/Express)
- **Blockchain Core**: In-memory blockchain with JSON data structure
- **Mining Engine**: Simulated proof-of-work with configurable difficulty
- **WebSocket Server**: Real-time updates via Socket.IO
- **RESTful API**: Express-based endpoints for all operations
- **Transaction Management**: JSON-based transaction processing

### Frontend (React/JavaScript)
- **Component Architecture**: Modular, reusable UI components
- **State Management**: Context-based wallet and socket management
- **Real-time Updates**: WebSocket integration for live mining data
- **Responsive Design**: Tailwind CSS with modern glassmorphism effects
- **User Experience**: Toast notifications and intuitive navigation

### Security Features
- **ECDSA Key Generation**: Cryptographic wallet creation
- **Transaction Signing**: Mock ECDSA signature verification
- **Input Validation**: Comprehensive data sanitization
- **Local Storage**: Browser-based wallet persistence

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
