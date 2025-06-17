const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import distributed blockchain components
const PeerManager = require('./network/PeerManager');
const BlockchainSync = require('./network/BlockchainSync');
const ConsensusManager = require('./network/ConsensusManager');

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
function initializeBlockchain() {
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

  // Seed initial peer if provided (for first node on network)
  const seedPeer = process.env.SEED_PEER;
  if (seedPeer) {
    console.log(`🌱 Seeding initial peer: ${seedPeer}`);
    peerManager.seedPeerAddress(seedPeer);
  }

  console.log('🚀 Decentralized P2P blockchain initialized');
  console.log(`📡 Node ID: ${peerManager.nodeId.substring(0, 8)}...`);
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
initializeBlockchain();

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

server.listen(PORT, HOST, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║            🚀 HACKCOIN DISTRIBUTED NETWORK 🚀              ║
  ║                                                              ║
  ║  Server running on: http://${HOST}:${PORT.toString().padEnd(30)}║
  ║  Node ID: ${peerManager.nodeId.substring(0, 16)}...            ║
  ║                                                              ║
  ║  📡 WebSocket server ready for real-time updates            ║
  ║  ⛏️  Distributed mining API available                       ║
  ║  🌐 P2P networking enabled                                   ║
  ║  🔗 Blockchain synchronization active                        ║
  ║                                                              ║
  ║  To connect peers, set BOOTSTRAP_NODES environment variable ║
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
