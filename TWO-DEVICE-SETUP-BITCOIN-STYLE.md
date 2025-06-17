# HackCoin Two-Device Setup Guide
## True Peer-to-Peer Distributed Network (Bitcoin-Style)

This guide shows how to set up HackCoin on two separate devices as independent, equal peers in a fully decentralized network - just like Bitcoin nodes. No central bootstrap server required!

## Key Features
- **True Decentralization**: No privileged bootstrap nodes
- **Gossip Protocol**: Nodes discover each other organically 
- **Peer Persistence**: Known peers survive restarts
- **Reputation System**: Reliable peers are prioritized
- **Equal Peers**: All nodes have identical capabilities

## Prerequisites
- Two separate devices (computers, laptops, etc.)
- Both devices on the same network (WiFi/LAN) OR internet connectivity
- Node.js installed on both devices
- Python 3.x installed on both devices (for mining)

## Network Architecture

```
Device A (Node 1)     ←→     Device B (Node 2)
   ↓                           ↓
[Peer Database]           [Peer Database]
- Stores known peers     - Stores known peers  
- Reputation tracking    - Reputation tracking
- Gossip protocol        - Gossip protocol
```

## Setup Instructions

### Step 1: Prepare Both Devices

1. **Download HackCoin** on both devices
2. **Install dependencies** on both devices:
   ```bash
   # In HackCoin directory
   npm install
   cd client && npm install && npm run build && cd ..
   pip install -r requirements.txt
   ```

### Step 2: Find Device IP Addresses

**On Device A:**
```bash
# Windows
ipconfig
# Linux/Mac  
ip addr show
# or
ifconfig
```

**On Device B:**
```bash
# Windows
ipconfig  
# Linux/Mac
ip addr show
# or
ifconfig
```

Note down the local IP addresses (e.g., 192.168.1.100 and 192.168.1.101)

### Step 3: Start the First Node (Device A)

**Windows:**
```batch
start-device1.bat
```

**Linux/Mac:**
```bash
./start-device1.sh
```

Or manually:
```bash
# On Device A - Start first node
PORT=3001 node server.js
```

The first node will start with an empty peer database and wait for connections.

### Step 4: Start the Second Node (Device B)

**Windows:**
```batch
set SEED_PEER=http://192.168.1.100:3001
start-device2.bat
```

**Linux/Mac:**
```bash
SEED_PEER=http://192.168.1.100:3001 ./start-device2.sh
```

Or manually:
```bash
# On Device B - Connect to first node
PORT=3002 SEED_PEER=http://192.168.1.100:3001 node server.js
```

Replace `192.168.1.100` with Device A's actual IP address.

### Step 5: Verify Connection

1. **Check Device A logs** - you should see:
   ```
   ✅ Connected to peer: http://192.168.1.101:3002
   📨 Received X addresses via gossip
   ```

2. **Check Device B logs** - you should see:
   ```
   🌱 Seeded initial peer: http://192.168.1.100:3001
   ✅ Connected to peer: http://192.168.1.100:3001
   ```

3. **Open web interfaces:**
   - Device A: http://192.168.1.100:3001
   - Device B: http://192.168.1.101:3002

### Step 6: Test the Network

1. **Create transactions** on either device
2. **Start mining** on both devices (optional)
3. **Check network status** in the web interface
4. **Verify blockchain synchronization** between devices

## How It Works (Bitcoin-Style)

### 1. **Initial Connection**
- Only the second node needs to know about the first node initially
- This is just to "bootstrap" into the network (like Bitcoin)
- After connection, both nodes are equal peers

### 2. **Peer Discovery (Gossip Protocol)**
- Nodes share lists of known peers with each other
- Each node maintains a database of peer addresses
- Peers are rated by reliability and connection success
- New peers are discovered organically through the network

### 3. **Persistent Peer Database**
- Each node saves known peers to `data/peers.json`
- Peer information survives restarts
- No need to manually configure peers after initial setup

### 4. **Automatic Network Growth**
- Add more nodes by connecting to ANY existing node
- New nodes automatically discover all other nodes
- Network becomes self-sustaining

## Adding More Nodes

To add a third device (or more):

```bash
# Device C connects to any existing node
PORT=3003 SEED_PEER=http://192.168.1.100:3001 node server.js
```

Device C will automatically discover Device B and all other nodes in the network!

## Network Resilience

- **Node Failures**: Network continues if some nodes go offline
- **Automatic Reconnection**: Nodes automatically try to reconnect to known peers
- **Peer Rating**: Unreliable peers are deprioritized
- **Self-Healing**: Network routes around failed nodes

## Troubleshooting

### "No peers connected"
- Check firewall settings on both devices
- Verify IP addresses are correct
- Ensure both devices are on same network
- Try disabling Windows Firewall temporarily

### "Peer connection timeout"  
- Check if the remote node is actually running
- Verify port numbers (default: 3001, 3002)
- Try connecting manually via web interface

### "Blockchain not syncing"
- Wait a few minutes - sync happens automatically
- Check network status in web interface
- Verify both nodes are connected

### Starting Fresh
To reset the peer database:
```bash
# Remove peer database
rm data/peers.json
# Restart node
```

## Advanced Configuration

### Custom Ports
```bash
PORT=8080 SEED_PEER=http://other-device:3001 node server.js
```

### Internet Connectivity
Replace local IPs with public IPs/domains:
```bash
SEED_PEER=http://friend-computer.example.com:3001 node server.js
```

### Multiple Seed Peers
```bash
SEED_PEER=http://192.168.1.100:3001,http://192.168.1.102:3003 node server.js
```

## Key Differences from Traditional Setup

❌ **Traditional (Centralized)**
- Requires central server/coordinator
- Single point of failure
- Manual peer management
- Not truly peer-to-peer

✅ **HackCoin (Bitcoin-Style)**
- No central authority
- Self-organizing network
- Automatic peer discovery
- True peer-to-peer architecture
- Gossip protocol for resilience

## Success Indicators

Your network is working correctly when you see:

1. **Peer Discovery Messages**: 
   ```
   📍 Discovered new peer address: http://x.x.x.x:xxxx
   ```

2. **Gossip Activity**:
   ```
   📨 Received X addresses via gossip from [nodeId]
   ```

3. **Automatic Connections**:
   ```
   🔍 Attempting connection to discovered peer: http://x.x.x.x:xxxx
   ✅ Connected to peer: http://x.x.x.x:xxxx
   ```

4. **Network Health**: Check the web interface shows "Network Health: >80%"

Your HackCoin network is now operating as a true peer-to-peer system, just like Bitcoin! 🎉
