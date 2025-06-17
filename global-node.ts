import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import { NetworkManager } from './src/network-manager';
import {
  getBlockchain,
  getUnspentTxOuts,
  sendTransaction,
  generateNextBlock,
  getAccountBalance
} from './src/blockchain';
import { getPublicFromWallet, initWallet } from './src/wallet';
import { getTransactionPool } from './src/transactionPool';

const app = express();

// Network configuration from environment
const NETWORK_TYPE = (process.env.NETWORK_TYPE as 'LOCAL' | 'TESTNET' | 'MAINNET') || 'LOCAL';
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3001');
const P2P_PORT = parseInt(process.env.P2P_PORT || '6001');

// Initialize network manager
const networkManager = new NetworkManager(NETWORK_TYPE);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
  credentials: true
}));
app.use(bodyParser.json());

// Add security headers for production
if (NETWORK_TYPE !== 'LOCAL') {
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Initialize wallet
initWallet();

// Mining state
let isMining = false;
let miningInterval: any = null;
let hashRate = 0;

// ============ BLOCKCHAIN API ROUTES ============

// Get blockchain
app.get('/api/blocks', (req, res) => {
  res.json(getBlockchain());
});

// Get specific block
app.get('/api/blocks/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const blockchain = getBlockchain();
  const block = blockchain.find(b => b.index === index);
  
  if (block) {
    res.json(block);
  } else {
    res.status(404).json({ error: 'Block not found' });
  }
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
      // Broadcast transaction to network
      networkManager.broadcast({
        type: 'new_transaction',
        data: result
      });
      
      res.json({ success: true, transaction: result });
    } else {
      res.status(400).json({ error: 'Transaction failed - insufficient balance or invalid transaction' });
    }
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction pool
app.get('/api/transaction-pool', (req, res) => {
  res.json(getTransactionPool());
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
            id: tx.id,
            from: isOutgoing ? publicKey : 'unknown',
            to: isIncoming ? publicKey : 'unknown',
            amount: tx.txOuts.reduce((sum: number, out: any) => sum + out.amount, 0),
            timestamp: Date.now(),
            blockIndex: block.index
          });
        }
      });
    }
  });
  
  res.json(transactions);
});

// ============ MINING API ROUTES ============

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
        
        // Broadcast new block to network
        networkManager.broadcast({
          type: 'new_block',
          data: block
        });
        
        console.log(`Block ${block.index} mined! Hash: ${block.hash}`);
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
    hashRate: hashRate,
    difficulty: getBlockchain().length > 0 ? getBlockchain()[getBlockchain().length - 1].difficulty : 0
  });
});

// ============ NETWORK API ROUTES ============

// Get network status
app.get('/api/network/status', (req, res) => {
  const stats = networkManager.getStats();
  res.json({
    ...stats,
    network: NETWORK_TYPE,
    httpPort: HTTP_PORT,
    p2pPort: P2P_PORT,
    nodeAddress: process.env.PUBLIC_IP || 'localhost'
  });
});

// Get connected peers
app.get('/api/network/peers', (req, res) => {
  res.json(networkManager.getPeers());
});

// Connect to a new peer
app.post('/api/network/peers', (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Peer address required' });
  }

  networkManager.connectToPeer(address)
    .then(() => {
      res.json({ success: true, message: `Connected to ${address}` });
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });
});

// Get node info for discovery
app.get('/api/node/info', (req, res) => {
  res.json({
    nodeId: networkManager['config'].nodeId,
    nodeName: networkManager['config'].nodeName,
    network: NETWORK_TYPE,
    version: '1.0.0',
    publicIP: process.env.PUBLIC_IP,
    p2pPort: P2P_PORT,
    httpPort: HTTP_PORT,
    chainHeight: getBlockchain().length,
    lastBlockHash: getBlockchain().length > 0 ? getBlockchain()[getBlockchain().length - 1].hash : null,
    timestamp: Date.now()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const stats = networkManager.getStats();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    network: NETWORK_TYPE,
    peers: stats.connectedPeers,
    syncStatus: stats.syncStatus,
    chainHeight: getBlockchain().length
  });
});

// ============ STATIC FILES (for web interface) ============
app.use(express.static('frontend/build'));

// Catch-all handler for React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile('frontend/build/index.html', { root: process.cwd() });
  }
});

// ============ START THE SERVER ============

async function startServer() {
  try {
    console.log('🚀 Starting HackCoin Global Node...');
    console.log(`Network: ${NETWORK_TYPE}`);
    console.log(`HTTP Port: ${HTTP_PORT}`);
    console.log(`P2P Port: ${P2P_PORT}`);
    
    // Start network manager
    await networkManager.start();
    
    // Start HTTP server
    const server = app.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`\n✅ HackCoin node is running!`);
      console.log(`🌐 HTTP API: http://0.0.0.0:${HTTP_PORT}`);
      console.log(`🔗 P2P Network: ws://0.0.0.0:${P2P_PORT}`);
      console.log(`💰 Wallet: ${getPublicFromWallet()}`);
      console.log(`💎 Balance: ${getAccountBalance()} HCK`);
      
      if (process.env.PUBLIC_IP) {
        console.log(`\n🌍 Public Access:`);
        console.log(`   HTTP: http://${process.env.PUBLIC_IP}:${HTTP_PORT}`);
        console.log(`   P2P:  ws://${process.env.PUBLIC_IP}:${P2P_PORT}`);
      }
      
      console.log('\n📡 Share your node address with others:');
      console.log(`   ws://${process.env.PUBLIC_IP || 'YOUR_IP'}:${P2P_PORT}`);
      console.log('\n⚡ Ready to accept connections from anywhere in the world!');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down gracefully...');
      networkManager.stop();
      server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
