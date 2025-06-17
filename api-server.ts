import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import {
  getBlockchain,
  getUnspentTxOuts,
  sendTransaction,
  generateNextBlock,
  getAccountBalance,
  initBlockchain
} from './src/blockchain';
import { getPublicFromWallet, initWallet } from './src/wallet';
import { getTransactionPool } from './src/transactionPool';
import { initP2PServer, connectToPeers, getSockets } from './src/p2p';

const app = express();

// Get configuration from environment or use defaults
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3001');
const P2P_PORT = parseInt(process.env.P2P_PORT || '6001');
const NETWORK_TYPE = process.env.NETWORK_TYPE || 'LOCAL';

// Enable CORS for global access
app.use(cors({
  origin: '*', // Allow all origins for global access
  credentials: false
}));
app.use(bodyParser.json());

// Initialize wallet and blockchain
initWallet();
initBlockchain();

// Start P2P server for global connectivity
initP2PServer(P2P_PORT);

// Connect to seed nodes if specified
if (process.env.SEED_NODES) {
  const seedNodes = process.env.SEED_NODES.split(',').map(s => s.trim());
  console.log(`Connecting to seed nodes: ${seedNodes.join(', ')}`);
  connectToPeers(seedNodes);
}

// Mining state
let isMining = false;
let miningInterval: any = null;
let hashRate = 0;

// ============ API ROUTES ============

// Get blockchain
app.get('/api/blocks', (req, res) => {
  res.json(getBlockchain());
});

// Get balance for address
app.get('/api/balance/:address', (req, res) => {
  const address = req.params.address;
  const balance = getAccountBalance();
  res.json({ address, balance });
});

// Get wallet info
app.get('/api/wallet', (req, res) => {
  const publicKey = getPublicFromWallet();
  res.json({
    address: publicKey,
    balance: getAccountBalance(),
    network: NETWORK_TYPE
  });
});

// Send transaction
app.post('/api/transaction', (req, res) => {
  try {
    const { to, amount } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ error: 'Missing required fields: to, amount' });
    }

    const result = sendTransaction(to, amount);
    
    if (result) {
      res.json({ success: true, transaction: result });
    } else {
      res.status(400).json({ error: 'Transaction failed - insufficient balance or invalid transaction' });
    }
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction history
app.get('/api/transactions', (req, res) => {
  const transactions: any[] = [];
  const publicKey = getPublicFromWallet();
  
  // Get all transactions from all blocks
  getBlockchain().forEach(block => {
    if (Array.isArray(block.data)) {
      block.data.forEach(tx => {
        // Check if this transaction involves the wallet
        const isIncoming = tx.txOuts.some((out: any) => out.address === publicKey);
        const isOutgoing = tx.txIns.some((input: any) => {
          return true; // Simplified check
        });
        
        if (isIncoming || isOutgoing) {
          transactions.push({
            from: isOutgoing ? publicKey : 'unknown',
            to: isIncoming ? publicKey : 'unknown',
            amount: tx.txOuts.reduce((sum: number, out: any) => sum + out.amount, 0),
            timestamp: Date.now()
          });
        }
      });
    }
  });
  
  res.json(transactions);
});

// Mining endpoints
app.post('/api/mine/start', (req, res) => {
  if (isMining) {
    return res.json({ success: false, message: 'Already mining' });
  }

  isMining = true;
  let hashCount = 0;
  const startTime = Date.now();

  miningInterval = setInterval(async () => {
    try {
      const block = generateNextBlock();
      if (block) {
        hashCount++;
        const elapsed = (Date.now() - startTime) / 1000;
        hashRate = hashCount / elapsed;
        console.log(`Block ${block.index} mined!`);
      }
    } catch (error) {
      console.error('Mining error:', error);
    }
  }, 1000);

  res.json({ success: true, message: 'Mining started' });
});

app.post('/api/mine/stop', (req, res) => {
  if (!isMining) {
    return res.json({ success: false, message: 'Not currently mining' });
  }

  isMining = false;
  if (miningInterval) {
    clearInterval(miningInterval);
    miningInterval = null;
  }
  hashRate = 0;

  res.json({ success: true, message: 'Mining stopped' });
});

app.get('/api/mine/status', (req, res) => {
  res.json({
    status: isMining ? 'mining' : 'idle',
    hashRate: hashRate
  });
});

// Network status
app.get('/api/network/status', (req, res) => {
  const sockets = getSockets();
  res.json({
    network: NETWORK_TYPE,
    httpPort: HTTP_PORT,
    p2pPort: P2P_PORT,
    connectedPeers: sockets.length,
    chainHeight: getBlockchain().length,
    syncStatus: sockets.length > 0 ? 'connected' : 'isolated'
  });
});

// Get connected peers
app.get('/api/network/peers', (req, res) => {
  const sockets = getSockets();
  res.json(sockets.map((socket, index) => ({
    id: `peer-${index}`,
    status: socket.readyState === 1 ? 'connected' : 'disconnected'
  })));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    network: NETWORK_TYPE,
    chainHeight: getBlockchain().length,
    peers: getSockets().length,
    timestamp: Date.now()
  });
});

// Node info for discovery
app.get('/api/node/info', (req, res) => {
  res.json({
    network: NETWORK_TYPE,
    version: '1.0.0',
    httpPort: HTTP_PORT,
    p2pPort: P2P_PORT,
    chainHeight: getBlockchain().length,
    address: getPublicFromWallet(),
    timestamp: Date.now()
  });
});

// Static files for web interface
app.use(express.static('frontend/build'));

// Serve React app for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // Try to serve the React app
    try {
      res.sendFile('index.html', { root: 'frontend/build' });
    } catch (error) {
      res.status(404).send('Web interface not available. Run "npm run build" to enable it.');
    }
  }
});

// Start server
const server = app.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log('\n🚀 HackCoin Global Node Started!');
  console.log('================================');
  console.log(`📡 Network: ${NETWORK_TYPE}`);
  console.log(`🌐 HTTP API: http://0.0.0.0:${HTTP_PORT}`);
  console.log(`🔗 P2P Network: ws://0.0.0.0:${P2P_PORT}`);
  console.log(`💰 Wallet: ${getPublicFromWallet()}`);
  console.log(`💎 Balance: ${getAccountBalance()} HCK`);
  console.log('');
  console.log('🌍 GLOBAL ACCESS ENABLED!');
  console.log('Your node can now be accessed from anywhere in the world.');
  console.log('');
  console.log('📤 Share these URLs with others:');
  console.log(`   Web Interface: http://YOUR_IP:${HTTP_PORT}`);
  console.log(`   API Endpoint:  http://YOUR_IP:${HTTP_PORT}/api`);
  console.log(`   P2P Address:   ws://YOUR_IP:${P2P_PORT}`);
  console.log('');
  console.log('⚡ Ready to accept global connections!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
