# HackCoin Network Configuration

## Current Architecture: Single-Node Demo System

HackCoin is currently designed as a **single-node demonstration system** for educational and development purposes. It does not automatically form a distributed network with other instances.

## Network Limitations

### ❌ What HackCoin Currently Does NOT Support:
- **Peer-to-peer networking** between different devices/instances
- **Automatic node discovery** across networks
- **Blockchain synchronization** between multiple nodes
- **Distributed consensus** mechanisms
- **Network-wide transaction broadcasting**

### ✅ What HackCoin Currently Supports:
- **Local blockchain storage** and management
- **Local mining** with real-time updates
- **Local wallet** creation and management
- **Web-based interface** accessible on local network
- **RESTful API** for blockchain operations

## Making HackCoin Accessible on Your Network

You can make your HackCoin instance accessible to other devices on your local network:

### Option 1: Environment Variables
```bash
# Set environment variables before starting
set HOST=0.0.0.0
set PORT=3001
node server.js
```

### Option 2: Network Access Setup
1. **Start HackCoin with network access:**
   ```bash
   # Backend (accessible on all network interfaces)
   HOST=0.0.0.0 PORT=3001 node server.js
   
   # Frontend (in another terminal)
   cd client
   REACT_APP_API_URL=http://YOUR_IP_ADDRESS:3001 npm start
   ```

2. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Look for "IPv4 Address" under your active network adapter
   # Example: 192.168.1.100
   ```

3. **Access from other devices:**
   - Backend API: `http://YOUR_IP_ADDRESS:3001`
   - Frontend GUI: `http://YOUR_IP_ADDRESS:3000`

### Security Considerations

⚠️ **Important Security Notes:**
- Opening HackCoin to your network exposes the mining and wallet APIs
- Anyone on your network can potentially start/stop mining
- Wallet operations could be accessed by others
- Consider firewall rules and network security

## Future Network Features (Roadmap)

To make HackCoin a true distributed blockchain, these features would need to be implemented:

### Phase 1: Basic Networking
- [ ] Peer discovery mechanism
- [ ] Node-to-node communication protocol
- [ ] Blockchain synchronization between nodes
- [ ] Network health monitoring

### Phase 2: Distributed Consensus
- [ ] Proof-of-Work consensus across network
- [ ] Fork resolution mechanisms
- [ ] Network difficulty adjustment
- [ ] Transaction pool synchronization

### Phase 3: Advanced Features
- [ ] Smart contract support
- [ ] Advanced wallet features
- [ ] Network governance mechanisms
- [ ] Performance optimizations

## Alternative: Running Multiple Local Instances

You can simulate a network by running multiple HackCoin instances on different ports:

```bash
# Instance 1
PORT=3001 node server.js

# Instance 2 (in another terminal)
PORT=3002 node server.js

# Instance 3 (in another terminal)  
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
