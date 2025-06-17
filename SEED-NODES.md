# HackCoin Public Seed Nodes

This file contains a list of public seed nodes that anyone can use to connect to the HackCoin network.

## Current Seed Nodes

### Official Seed Nodes (Demo)
```
https://seed1.hackcoin.network:3001
https://seed2.hackcoin.network:3001
https://seed3.hackcoin.network:3001
```

### Community Seed Nodes
```
# Add your public seed node here!
# Format: http://your-ip-or-domain:port
# Example: http://123.456.789.012:3001
```

## How to Add Your Seed Node

1. Make sure your node is publicly accessible
2. Test connectivity: `curl http://your-node:3001/api/network/info`
3. Add your node to the list above
4. Submit a pull request

## How to Use Custom Seed Nodes

### Method 1: Environment Variable
```bash
SEED_NODES=http://your-seed:3001,http://another-seed:3001 npm run global
```

### Method 2: Modify global-network.js
Add your seed nodes to the `GLOBAL_SEED_NODES` array.

## Seed Node Requirements

- **Uptime**: Should be online 24/7
- **Ports**: Port 3001 should be open and accessible
- **Version**: Running latest HackCoin version
- **Resources**: Minimum 1GB RAM, 10GB storage

## Testing Your Seed Node

```bash
# Check if your node is accessible
curl http://your-node:3001/api/network/info

# Check peer connections
curl http://your-node:3001/api/peers

# Check blockchain height
curl http://your-node:3001/api/blocks | jq length
```

## For Developers

### Local Testing Network
```bash
# Terminal 1 - Seed Node
PORT=3001 npm run dev

# Terminal 2 - Peer Node
SEED_NODES=http://localhost:3001 PORT=3002 npm run dev

# Terminal 3 - Another Peer
SEED_NODES=http://localhost:3001 PORT=3003 npm run dev
```

### Docker Network
```yaml
version: '3'
services:
  seed-node:
    build: .
    ports:
      - "3001:3001"
    environment:
      - HOST=0.0.0.0
      - PORT=3001
  
  peer-node:
    build: .
    ports:
      - "3002:3001"
    environment:
      - HOST=0.0.0.0
      - PORT=3001
      - SEED_NODES=http://seed-node:3001
```

---

**Note**: This is a demo blockchain for educational purposes. Do not use for real financial transactions.
