const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

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

// In-memory storage for demonstration
let blockchain = [];
let miningProcess = null;
let miningStats = {
  isActive: false,
  hashRate: 0,
  difficulty: 4,
  blocksFound: 0
};

// Initialize with genesis block
if (blockchain.length === 0) {
  blockchain.push({
    index: 0,
    timestamp: Date.now(),
    data: JSON.stringify({
      transactions: [],
      message: "Genesis Block"
    }),
    previousHash: "0",
    hash: "0000a12d8b9c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    nonce: 0,
    transactions: []
  });
}

// API Routes
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
    res.json({
      isActive: miningStats.isActive,
      hashRate: miningStats.hashRate,
      difficulty: miningStats.difficulty,
      blocksFound: miningStats.blocksFound
    });
  } catch (error) {
    console.error('Error fetching mining status:', error);
    res.status(500).json({ error: 'Failed to fetch mining status' });
  }
});

app.post('/api/mining/start', (req, res) => {
  try {
    const { minerAddress, difficulty = 4, threads = 1, intensity = 'medium' } = req.body;
    
    if (!minerAddress) {
      return res.status(400).json({ error: 'Miner address is required' });
    }

    if (miningStats.isActive) {
      return res.status(400).json({ error: 'Mining is already active' });
    }

    miningStats.isActive = true;
    miningStats.difficulty = difficulty;
    
    // Simulate mining process
    miningProcess = setInterval(() => {
      miningStats.hashRate = Math.floor(Math.random() * 1000) + 500; // 500-1500 H/s
      
      // Broadcast mining updates
      io.emit('miningUpdate', {
        hashRate: miningStats.hashRate,
        difficulty: miningStats.difficulty,
        estimatedTime: Math.floor(Math.random() * 300) + 60 // 1-5 minutes
      });      // Randomly find a block (simulate mining success)
      if (Math.random() < 0.05) { // 5% chance per interval (increased for testing)
        const miningReward = {
          from: 'system',
          to: minerAddress,
          amount: 1,
          timestamp: Date.now(),
          type: 'mining_reward'
        };
        
        const newBlock = {
          index: blockchain.length,
          timestamp: Date.now(),
          data: JSON.stringify({
            transactions: [miningReward],
            message: `Block mined by ${minerAddress}`
          }),
          previousHash: blockchain[blockchain.length - 1].hash,
          hash: generateHash(),
          nonce: Math.floor(Math.random() * 1000000),
          transactions: [miningReward]
        };
          blockchain.push(newBlock);
        miningStats.blocksFound++;
        
        console.log(`🎉 Block found! Block #${newBlock.index} mined by ${minerAddress}. Reward: 1 HCK`);
        
        io.emit('blockFound', {
          blockNumber: newBlock.index,
          hash: newBlock.hash,
          reward: 1
        });
      }
    }, 2000); // Update every 2 seconds

    res.json({ 
      message: 'Mining started successfully',
      stats: miningStats 
    });
  } catch (error) {
    console.error('Error starting mining:', error);
    res.status(500).json({ error: 'Failed to start mining' });
  }
});

app.post('/api/mining/stop', (req, res) => {
  try {
    if (!miningStats.isActive) {
      return res.status(400).json({ error: 'Mining is not active' });
    }

    miningStats.isActive = false;
    miningStats.hashRate = 0;
    
    if (miningProcess) {
      clearInterval(miningProcess);
      miningProcess = null;
    }

    res.json({ 
      message: 'Mining stopped successfully',
      stats: miningStats 
    });
  } catch (error) {
    console.error('Error stopping mining:', error);
    res.status(500).json({ error: 'Failed to stop mining' });
  }
});

app.post('/api/transaction', (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    // Simple transaction validation (in a real system, you'd check balances, signatures, etc.)
    const transaction = {
      id: generateHash(),
      from,
      to,
      amount: parseFloat(amount),
      timestamp: Date.now(),
      type: 'transfer'
    };

    res.json({ 
      message: 'Transaction submitted successfully',
      transaction 
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
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
  console.log(`🚀 HackCoin Server running on http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
  console.log(`⛏️  Mining API available at http://${HOST}:${PORT}/api/mining/`);
});
