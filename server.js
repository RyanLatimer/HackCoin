const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import distributed blockchain components
const PeerManager = require('./network/PeerManager');
const BlockchainSync = require('./network/BlockchainSync');
const ConsensusManager = require('./network/ConsensusManager');

// Import global network configuration
const { getSeedNodes, getRandomSeedNodes, getNetworkInfo } = require('./global-network');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Store connected clients for real-time updates
let connectedClients = [];

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.push(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients = connectedClients.filter(client => client.id !== socket.id);
  });
});

// Initialize distributed blockchain
let blockchain = [];
let peerManager;
let blockchainSync;
let consensusManager;

// Legacy mining stats for backwards compatibility
let miningStats = {
  isActive: false,
  hashRate: 0,
  difficulty: 4,
  blocksFound: 0
};

// Initialize with genesis block and distributed components
async function initializeBlockchain() {
  if (blockchain.length === 0) {
    blockchain.push({
      index: 0,
      timestamp: Date.now(),
      data: JSON.stringify({
        transactions: [],
        message: "HackCoin Genesis Block - Decentralized P2P Network"
      }),
      previousHash: "0",
      hash: "0000a12d8b9c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
      nonce: 0,
      transactions: []
    });
  }
  
  // Initialize distributed components
  const port = process.env.PORT || 3001;
  peerManager = new PeerManager(null, port);
  blockchainSync = new BlockchainSync(blockchain, peerManager);
  consensusManager = new ConsensusManager(blockchain, peerManager, blockchainSync);
  // Setup event handlers
  setupDistributedEventHandlers();

  // Auto-connect to global network
  await connectToGlobalNetwork();

  console.log('🚀 Decentralized P2P blockchain initialized');
  console.log(`📡 Node ID: ${peerManager.nodeId.substring(0, 8)}...`);
  
  // Display network info
  const networkInfo = getNetworkInfo();
  console.log(`🌐 Network: ${networkInfo.networkName}`);
  console.log(`🔗 Environment: ${networkInfo.environment}`);
}

/**
 * Automatically connect to the global HackCoin network
 */
async function connectToGlobalNetwork() {
  console.log('🌍 Connecting to global HackCoin network...');
  
  // Get custom bootstrap nodes from environment variables
  const customBootstrap = process.env.BOOTSTRAP_NODES || process.env.SEED_PEER;
  const seedNodes = [];
  
  if (customBootstrap) {
    // Use custom bootstrap nodes if provided
    const customNodes = customBootstrap.split(',').map(node => node.trim());
    seedNodes.push(...customNodes);
    console.log(`🔗 Using custom bootstrap nodes: ${customNodes.join(', ')}`);
  } else {
    // Use global seed nodes
    const globalSeeds = getRandomSeedNodes(3);
    seedNodes.push(...globalSeeds);
    console.log(`🌱 Using global seed nodes: ${globalSeeds.join(', ')}`);
  }
  
  // Attempt to connect to seed nodes
  let connectedToAny = false;
  for (const seedNode of seedNodes) {
    try {
      // Skip if it's our own node
      const currentPort = process.env.PORT || 3001;
      if (seedNode.includes(`:${currentPort}`) && 
          (seedNode.includes('localhost') || seedNode.includes('127.0.0.1'))) {
        continue;
      }
      
      console.log(`🔌 Attempting to connect to seed node: ${seedNode}`);
      peerManager.seedPeerAddress(seedNode);
      connectedToAny = true;
      
      // Give some time between connections
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Failed to connect to seed node ${seedNode}: ${error.message}`);
    }
  }
  
  if (!connectedToAny) {
    console.log('⚠️  No seed nodes available. Running as standalone node.');
    console.log('� Other nodes can connect to this node to join the network.');
  } else {
    console.log('✅ Connected to global network! Peer discovery will begin automatically.');
  }

  // Seed initial peer if provided (legacy support)
  const legacySeedPeer = process.env.SEED_PEER;
  if (legacySeedPeer && !customBootstrap) {
    console.log(`🌱 Seeding legacy peer: ${legacySeedPeer}`);
    peerManager.seedPeerAddress(legacySeedPeer);
  }
}

function setupDistributedEventHandlers() {
  // Peer manager events
  peerManager.on('peerConnected', (peerInfo) => {
    io.emit('peerConnected', peerInfo);
    console.log(`🌐 Peer connected: ${peerInfo.url}`);
  });

  peerManager.on('peerDisconnected', (peerInfo) => {
    io.emit('peerDisconnected', peerInfo);
    console.log(`🔌 Peer disconnected: ${peerInfo.url}`);
  });

  peerManager.on('networkStatus', (status) => {
    io.emit('networkStatus', status);
  });

  // Blockchain sync events
  blockchainSync.on('syncStarted', () => {
    io.emit('syncStarted');
  });

  blockchainSync.on('syncCompleted', (data) => {
    io.emit('syncCompleted', data);
    io.emit('blockchainUpdate', blockchain);
  });

  blockchainSync.on('newBlockAdded', (data) => {
    io.emit('newBlock', data.block);
    io.emit('blockchainUpdate', blockchain);
  });

  // Consensus manager events
  consensusManager.on('blockMined', (data) => {
    miningStats.blocksFound++;
    io.emit('blockFound', {
      blockNumber: data.block.index,
      hash: data.block.hash,
      reward: data.reward,
      transactions: data.transactions.length
    });
    io.emit('blockchainUpdate', blockchain);
  });

  consensusManager.on('miningProgress', (data) => {
    miningStats.hashRate = Math.floor(data.hashRate);
    io.emit('miningUpdate', {
      hashRate: miningStats.hashRate,
      difficulty: data.difficulty,
      nonce: data.nonce
    });
  });

  consensusManager.on('transactionAdded', (transaction) => {
    io.emit('newTransaction', transaction);
  });

  consensusManager.on('difficultyAdjusted', (data) => {
    io.emit('difficultyAdjusted', data);
  });
}

// Initialize blockchain on startup
initializeBlockchain().catch(error => {
  console.error('❌ Failed to initialize blockchain:', error);
  process.exit(1);
});

// API Routes - Enhanced for Distributed Blockchain
app.get('/api/blocks', (req, res) => {
  try {
    res.json(blockchain);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

app.get('/api/mining/status', (req, res) => {
  try {
    const consensusStats = consensusManager.getConsensusStats();
    res.json({
      isActive: consensusStats.isMining,
      hashRate: miningStats.hashRate,
      difficulty: consensusStats.currentDifficulty,
      blocksFound: miningStats.blocksFound,
      transactionPoolSize: consensusStats.transactionPoolSize,
      networkHashRate: consensusStats.networkHashRate,
      averageBlockTime: consensusStats.averageBlockTime
    });
  } catch (error) {
    console.error('Error fetching mining status:', error);
    res.status(500).json({ error: 'Failed to fetch mining status' });
  }
});

app.post('/api/mining/start', async (req, res) => {
  try {
    const { minerAddress, difficulty = 4, threads = 1, intensity = 'medium' } = req.body;
    
    if (!minerAddress) {
      return res.status(400).json({ error: 'Miner address is required' });
    }

    if (consensusManager.isMining) {
      return res.status(400).json({ error: 'Mining is already active' });
    }

    await consensusManager.startMining(minerAddress);
    miningStats.isActive = true;
    
    res.json({ 
      message: 'Distributed mining started successfully',
      stats: consensusManager.getConsensusStats()
    });
  } catch (error) {
    console.error('Error starting mining:', error);
    res.status(500).json({ error: 'Failed to start mining' });
  }
});

app.post('/api/mining/stop', async (req, res) => {
  try {
    if (!consensusManager.isMining) {
      return res.status(400).json({ error: 'Mining is not active' });
    }

    consensusManager.stopMining();
    miningStats.isActive = false;
    miningStats.hashRate = 0;

    res.json({ 
      message: 'Mining stopped successfully',
      stats: consensusManager.getConsensusStats()
    });
  } catch (error) {
    console.error('Error stopping mining:', error);
    res.status(500).json({ error: 'Failed to stop mining' });
  }
});

app.post('/api/transaction', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const transaction = {
      id: consensusManager.generateTransactionId(),
      from,
      to,
      amount: parseFloat(amount),
      timestamp: Date.now(),
      type: 'transfer'
    };

    await consensusManager.addTransaction(transaction);

    res.json({ 
      message: 'Transaction submitted to network successfully',
      transaction 
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: error.message || 'Failed to process transaction' });
  }
});

// Network API Routes
app.post('/api/network/handshake', (req, res) => {
  try {
    const { nodeId, port, timestamp, knownPeers } = req.body;
    
    // Process received peer addresses
    if (knownPeers && Array.isArray(knownPeers)) {
      const remoteAddr = req.ip === '::1' ? 'localhost' : req.ip;
      for (const peer of knownPeers) {
        if (peer.url && peer.url !== `http://localhost:${process.env.PORT || 3001}`) {
          peerManager.addPeerAddress(peer.url, `http://${remoteAddr}:${port}`);
        }
      }
    }
    
    res.json({
      success: true,
      nodeId: peerManager.nodeId,
      blockHeight: blockchain.length,
      version: '2.0.0',
      timestamp: Date.now(),
      knownPeers: peerManager.getAddressesForGossip(10) // Share our known peers
    });
  } catch (error) {
    res.status(500).json({ error: 'Handshake failed' });
  }
});

app.post('/api/network/disconnect', (req, res) => {
  try {
    const { nodeId } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Disconnect failed' });
  }
});

app.get('/api/network/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    nodeId: peerManager.nodeId
  });
});

app.get('/api/network/peers', (req, res) => {
  try {
    const networkStats = peerManager.getNetworkStats();
    res.json({
      peers: networkStats.peers,
      nodeId: peerManager.nodeId,
      connectedPeers: networkStats.connectedPeers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get peers' });
  }
});

app.get('/api/network/status', (req, res) => {
  try {
    const networkStats = peerManager.getNetworkStats();
    const syncStatus = blockchainSync.getSyncStatus();
    const consensusStats = consensusManager.getConsensusStats();
    
    res.json({
      network: networkStats,
      sync: syncStatus,
      consensus: consensusStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get network status' });
  }
});

app.post('/api/network/connect', async (req, res) => {
  try {
    const { peerUrl } = req.body;
    
    if (!peerUrl) {
      return res.status(400).json({ error: 'Peer URL required' });
    }

    const success = await peerManager.connectToPeer(peerUrl);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Connected to peer: ${peerUrl}` 
      });
    } else {
      res.json({ 
        success: false, 
        error: 'Failed to connect to peer' 
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Connection failed' });
  }
});

// Bitcoin-style gossip protocol endpoints
app.post('/api/network/addr', (req, res) => {
  try {
    const { addresses, fromNodeId } = req.body;
    
    if (addresses && Array.isArray(addresses)) {
      const remoteAddr = req.ip === '::1' ? 'localhost' : req.ip;
      for (const addr of addresses) {
        if (addr.url && addr.url !== `http://localhost:${process.env.PORT || 3001}`) {
          peerManager.addPeerAddress(addr.url, `${remoteAddr}:gossip`);
        }
      }
      console.log(`📨 Received ${addresses.length} addresses via gossip from ${fromNodeId}`);
    }
    
    res.json({ success: true, processed: addresses?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process addresses' });
  }
});

app.post('/api/network/getaddr', (req, res) => {
  try {
    const addresses = peerManager.getAddressesForGossip(20);
    res.json({ 
      success: true, 
      addresses: addresses,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get addresses' });
  }
});

// Blockchain API Routes
app.get('/api/blockchain/full', (req, res) => {
  try {
    res.json({
      blockchain: blockchain,
      height: blockchain.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get blockchain' });
  }
});

app.post('/api/blockchain/sync', (req, res) => {
  try {
    const { currentHeight, lastBlockHash } = req.body;
    
    // Return blockchain if peer needs it
    if (currentHeight < blockchain.length - 1) {
      res.json({
        blockchain: blockchain,
        height: blockchain.length
      });
    } else {
      res.json({
        message: 'Blockchain is up to date',
        height: blockchain.length
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.post('/api/blockchain/new-block', async (req, res) => {
  try {
    const { block, fromNodeId } = req.body;
    
    if (!block) {
      return res.status(400).json({ error: 'Block data required' });
    }

    const success = await blockchainSync.handleNewBlockFromPeer(block, fromNodeId);
    
    res.json({ 
      success: success,
      message: success ? 'Block accepted' : 'Block rejected'
    });
  } catch (error) {
    console.error('Error handling new block:', error);
    res.status(500).json({ error: 'Failed to process new block' });
  }
});

// Consensus API Routes
app.post('/api/consensus/transaction', async (req, res) => {
  try {
    const { transaction, fromNodeId } = req.body;
    
    if (!transaction) {
      return res.status(400).json({ error: 'Transaction data required' });
    }

    const success = await consensusManager.handleNetworkTransaction(transaction, fromNodeId);
    
    res.json({ 
      success: success,
      message: success ? 'Transaction accepted' : 'Transaction rejected'
    });
  } catch (error) {
    console.error('Error handling network transaction:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

app.get('/api/consensus/pool', (req, res) => {
  try {
    const pool = consensusManager.getTransactionPool();
    res.json({
      transactions: pool,
      size: pool.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transaction pool' });
  }
});

// Wallet API Routes
app.get('/api/wallet/balance/:address', (req, res) => {
  try {
    const { address } = req.params;
    const balance = consensusManager.calculateBalance(address);
    
    res.json({
      address: address,
      balance: balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Helper function to generate a simple hash
function generateHash() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║            🌍 HACKCOIN GLOBAL NETWORK 🌍                   ║
  ║                                                              ║
  ║  🖥️  Server: http://${HOST}:${PORT.toString().padEnd(32)}║
  ║  🌐 Web UI: http://localhost:3000                            ║
  ║  📡 Node ID: ${peerManager.nodeId.substring(0, 16)}...          ║
  ║                                                              ║  
  ║  ✅ Connected to global HackCoin network                     ║
  ║  ⛏️  Mining API ready                                        ║
  ║  💰 Wallet features available                                ║
  ║  🔗 Blockchain sync active                                   ║
  ║                                                              ║
  ║  💡 Access from other devices: http://YOUR_IP:3000          ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down HackCoin server...');
    await peerManager.shutdown();
    server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', async () => {
    console.log('🔄 Shutting down HackCoin server...');
    await peerManager.shutdown();
    server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  });
});

// Network information endpoint
app.get('/api/network/info', (req, res) => {
  try {
    const networkInfo = getNetworkInfo();
    const peerInfo = peerManager ? {
      nodeId: peerManager.nodeId,
      connectedPeers: peerManager.peers.size,
      knownAddresses: peerManager.peerAddresses.size,
      maxPeers: peerManager.maxPeers
    } : null;
    
    res.json({
      ...networkInfo,
      node: peerInfo,
      blockchain: {
        height: blockchain.length,
        latestBlock: blockchain[blockchain.length - 1]
      }
    });
  } catch (error) {
    console.error('Error fetching network info:', error);
    res.status(500).json({ error: 'Failed to fetch network info' });
  }
});

// Global network connection instructions page
app.get('/join', (req, res) => {
  const networkInfo = getNetworkInfo();
  const host = req.get('host');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Join HackCoin Global Network</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
        h1 { text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        .step { background: rgba(255,255,255,0.2); padding: 20px; margin: 15px 0; border-radius: 10px; }
        .step h3 { margin-top: 0; color: #FFD700; }
        code { background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; display: block; margin: 10px 0; font-family: 'Courier New', monospace; }
        .highlight { color: #FFD700; font-weight: bold; }
        .network-info { background: rgba(0,255,0,0.2); padding: 15px; border-radius: 10px; margin: 20px 0; }
        .center { text-align: center; }
        a { color: #FFD700; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Join HackCoin Global Network</h1>
        
        <div class="network-info center">
            <h2>This Node</h2>
            <p><strong>Address:</strong> http://${host}</p>
            <p><strong>Network:</strong> ${networkInfo.networkName}</p>
            <p><strong>Status:</strong> <span class="highlight">🟢 Online</span></p>
        </div>
        
        <div class="step">
            <h3>📥 Step 1: Download HackCoin</h3>
            <p>Get the HackCoin source code from GitHub:</p>
            <code>git clone https://github.com/yourusername/HackCoin.git
cd HackCoin</code>
        </div>
        
        <div class="step">
            <h3>🚀 Step 2: Join Global Network (One Command!)</h3>
            <p><strong>Windows:</strong></p>
            <code>start-global.bat</code>
            <p><strong>Linux/Mac:</strong></p>
            <code>./start-global.sh</code>
            <p><strong>Universal:</strong></p>
            <code>npm run global</code>
        </div>
        
        <div class="step">
            <h3>🔗 Step 3: Connect to This Node (Optional)</h3>
            <p>To specifically connect to this node:</p>
            <code>SEED_NODES=http://${host} npm run global</code>
        </div>
        
        <div class="step">
            <h3>🌐 Step 4: Access Your Node</h3>
            <p>Once started, access your node at:</p>
            <ul>
                <li><strong>Web Interface:</strong> http://localhost:3000</li>
                <li><strong>API Server:</strong> http://localhost:3001</li>
                <li><strong>Network Info:</strong> <a href="/api/network/info" target="_blank">http://localhost:3001/api/network/info</a></li>
            </ul>
        </div>
        
        <div class="step">
            <h3>💰 Step 5: Start Using HackCoin</h3>
            <ol>
                <li><strong>Create Wallet:</strong> Go to Wallet tab → "Create New Wallet"</li>
                <li><strong>Start Mining:</strong> Go to Mining tab → Enter wallet address → "Start Mining"</li>
                <li><strong>Send Transactions:</strong> Use Wallet tab to send coins</li>
                <li><strong>Monitor Network:</strong> Check Network tab for peers and stats</li>
            </ol>
        </div>
        
        <div class="center" style="margin-top: 30px;">
            <p><a href="/">🏠 Back to HackCoin Node</a></p>
            <p><a href="/api/network/info" target="_blank">📊 View Network Info</a></p>
            <p><em>Happy Mining! ⛏️💎</em></p>
        </div>
    </div>
</body>
</html>`;
  
  res.send(html);
});
