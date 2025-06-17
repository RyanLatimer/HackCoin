# HackCoin Network Configuration

## Current Architecture: Fully Distributed Blockchain Network

HackCoin is now a **fully distributed blockchain network** with peer-to-peer networking, consensus mechanisms, and smart contract support. Multiple nodes can connect to form a decentralized network with automatic blockchain synchronization.

## Network Features

### ✅ What HackCoin Now Supports:
- **Peer-to-peer networking** between multiple nodes across networks
- **Automatic peer discovery** and connection management
- **Blockchain synchronization** with consensus-based fork resolution
- **Distributed mining** with network-wide difficulty adjustment
- **Smart contract deployment** and execution across the network
- **Real-time transaction broadcasting** to all connected peers
- **Network health monitoring** and peer status tracking

### 🌐 Distributed Network Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Node A     │◄──►│  Node B     │◄──►│  Node C     │
│ (Bootstrap) │    │  (Mining)   │    │  (Peer)     │
│ Port: 3001  │    │ Port: 3002  │    │ Port: 3003  │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                  ▲                  ▲
       │      Blockchain Sync & Consensus    │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              Shared Blockchain                      │
│  Genesis ──► Block 1 ──► Block 2 ──► Block 3 ──►   │
└─────────────────────────────────────────────────────┘
```

## Network Setup Methods

### Method 1: Using Startup Scripts (Recommended)

#### Windows:
```cmd
# Start bootstrap node
start-distributed.bat --port 3001

# Start mining node
start-distributed.bat --port 3002 --bootstrap http://localhost:3001 --miner 0x1234567890abcdef

# Start additional peer
start-distributed.bat --port 3003 --bootstrap http://localhost:3001
```

#### Linux/Mac:
```bash
# Start bootstrap node
./start-distributed.sh --port 3001

# Start mining node
./start-distributed.sh --port 3002 --bootstrap http://localhost:3001 --miner 0x1234567890abcdef

# Start additional peer
./start-distributed.sh --port 3003 --bootstrap http://localhost:3001
```

### Method 2: Environment Variables

```bash
# Terminal 1 - Bootstrap Node
HOST=0.0.0.0 PORT=3001 npm run dev

# Terminal 2 - Mining Node
HOST=0.0.0.0 PORT=3002 BOOTSTRAP_NODES=http://localhost:3001 MINING_ADDRESS=0x1234567890abcdef npm run dev

# Terminal 3 - Additional Peer
HOST=0.0.0.0 PORT=3003 BOOTSTRAP_NODES=http://localhost:3001 npm run dev
```

### Method 3: Docker Compose (Advanced)

```yaml
version: '3.8'
services:
  hackcoin-bootstrap:
    build: .
    ports:
      - "3001:3001"
    environment:
      - HOST=0.0.0.0
      - PORT=3001
    networks:
      - hackcoin-network

  hackcoin-miner:
    build: .
    ports:
      - "3002:3002"
    environment:
      - HOST=0.0.0.0
      - PORT=3002
      - BOOTSTRAP_NODES=http://hackcoin-bootstrap:3001
      - MINING_ADDRESS=0x1234567890abcdef
    depends_on:
      - hackcoin-bootstrap
    networks:
      - hackcoin-network

networks:
  hackcoin-network:
    driver: bridge
```

## Cross-Network Deployment

### Local Network Setup

1. **Find your machine's IP address:**
   ```bash
   # Windows
   ipconfig | findstr IPv4
   
   # Linux/Mac
   ifconfig | grep inet
   ```

2. **Start bootstrap node with network access:**
   ```bash
   HOST=0.0.0.0 PORT=3001 ./start-distributed.sh
   ```

3. **Connect from other machines:**
   ```bash
   BOOTSTRAP_NODES=http://192.168.1.100:3001 ./start-distributed.sh --port 3002
   ```

### Internet Deployment

1. **Deploy to cloud providers:**
   - AWS EC2, Google Cloud, DigitalOcean
   - Configure security groups for ports 3001-3010
   - Set up load balancers for high availability

2. **Configure DNS and SSL:**
   ```bash
   # Use domain names instead of IP addresses
   BOOTSTRAP_NODES=https://node1.hackcoin.network,https://node2.hackcoin.network
   ```

## Network Configuration Parameters

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HOST` | Server bind address | `0.0.0.0` |
| `PORT` | Server port | `3001` |
| `BOOTSTRAP_NODES` | Bootstrap node URLs | `http://node1:3001,http://node2:3002` |
| `MINING_ADDRESS` | Mining reward address | `0x1234567890abcdef` |
| `MAX_PEERS` | Maximum peer connections | `8` |
| `DIFFICULTY_ADJUSTMENT_INTERVAL` | Blocks between difficulty adjustments | `10` |
| `TARGET_BLOCK_TIME` | Target time between blocks (ms) | `60000` |

### Network Ports

| Service | Default Port | Purpose |
|---------|--------------|---------|
| HTTP Server | 3001 | Web interface and API |
| WebSocket | 3001 | Real-time updates |
| P2P Communication | 3001 | Peer-to-peer networking |

## Consensus Mechanism

### Proof of Work
- **Mining Algorithm**: SHA-256 based proof of work
- **Block Time**: 1 minute target (adjustable)
- **Difficulty Adjustment**: Every 10 blocks
- **Reward**: 1 HCK per block

### Network Consensus Rules
- **Longest Chain Rule**: Chain with most cumulative work wins
- **Fork Resolution**: Automatic resolution via consensus
- **Transaction Validation**: Full validation across all nodes
- **Block Validation**: Cryptographic verification of all blocks

## Smart Contract Network

### Deployment Across Network
- Smart contracts deployed on one node are automatically synchronized
- Contract state is maintained consistently across all nodes
- Gas fees are distributed network-wide

### Contract Execution
- Execution results are validated by network consensus
- State changes are synchronized across all nodes
- Failed executions are rejected network-wide

## Network Monitoring

### Health Metrics
- **Network Health**: Percentage of healthy peer connections
- **Sync Status**: Blockchain synchronization state
- **Hash Rate**: Network-wide mining hash rate
- **Peer Count**: Number of connected peers

### Monitoring Tools
- **Web Interface**: Real-time network monitoring dashboard
- **API Endpoints**: Programmatic access to network status
- **Logs**: Comprehensive logging for debugging

## Security Considerations

### Network Security
- **Peer Authentication**: Cryptographic handshakes
- **DDoS Protection**: Rate limiting and connection limits
- **Sybil Attack Prevention**: Proof of work requirements
- **Eclipse Attack Prevention**: Diverse peer connections

### Firewall Configuration
```bash
# Allow HackCoin ports
sudo ufw allow 3001:3010/tcp
sudo ufw allow 3001:3010/udp

# For specific IP ranges
sudo ufw allow from 192.168.1.0/24 to any port 3001
```

## Troubleshooting

### Common Network Issues

**Peers Not Connecting:**
- Check firewall settings
- Verify bootstrap node is running
- Ensure correct IP addresses and ports
- Check network connectivity

**Blockchain Not Syncing:**
- Verify peer connections
- Check for network partitions
- Ensure sufficient peers are online
- Monitor sync status in web interface

**Mining Not Working:**
- Verify mining address is set
- Check peer connections
- Ensure sufficient balance for gas
- Monitor difficulty adjustments

### Debug Commands

```bash
# Check network status
curl http://localhost:3001/api/network/status

# Check peer connections
curl http://localhost:3001/api/network/peers

# Check blockchain sync
curl http://localhost:3001/api/blockchain/sync

# Check mining status
curl http://localhost:3001/api/mining/status
```

## Performance Optimization

### Node Performance
- **Hardware**: Minimum 2GB RAM, 10GB storage
- **Network**: Stable internet connection
- **CPU**: Multi-core processor recommended for mining

### Network Performance
- **Bandwidth**: 1 Mbps minimum per node
- **Latency**: <100ms between peers optimal
- **Connections**: 4-8 peer connections recommended

## Future Enhancements

### Planned Features
- **Sharding**: Horizontal scaling for large networks
- **Light Clients**: Lightweight nodes for mobile devices
- **Bridge Protocols**: Cross-chain compatibility
- **Layer 2 Solutions**: Payment channels and sidechains

### Network Upgrades
- **Consensus Upgrades**: Proof of Stake transition
- **Protocol Improvements**: Enhanced efficiency
- **Security Enhancements**: Advanced cryptographic features

---

For technical support and network issues, please visit our [GitHub repository](https://github.com/yourusername/HackCoin) or contact the development team.
PORT=3003 node server.js
```

Each instance will have its own blockchain and operate independently.

## Contributing to Network Features

If you're interested in implementing true peer-to-peer networking features, consider:

1. **Studying existing blockchain protocols** (Bitcoin, Ethereum)
2. **Implementing WebSocket-based peer communication**
3. **Adding blockchain synchronization logic**
4. **Contributing to the HackCoin project** with network PRs

---

**Current Status**: HackCoin is a single-node educational blockchain platform.
**Network Support**: Limited to local network access, no P2P distribution.
