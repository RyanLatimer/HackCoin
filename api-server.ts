import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
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
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize wallet
initWallet();

// Mining state
let isMining = false;
let miningInterval: any = null;
let hashRate = 0;

// Routes
app.get('/blocks', (req, res) => {
  res.json(getBlockchain());
});

app.get('/balance/:address', (req, res) => {
  const address = req.params.address;
  const balance = getAccountBalance();
  res.json({ balance });
});

app.get('/wallet', (req, res) => {
  const publicKey = getPublicFromWallet();
  res.json({
    address: publicKey,
    balance: getAccountBalance()
  });
});

app.post('/transaction', (req, res) => {
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

app.get('/transactions', (req, res) => {
  const transactions: any[] = [];
  const publicKey = getPublicFromWallet();
  
  // Get all transactions from all blocks
  getBlockchain().forEach(block => {
    if (Array.isArray(block.data)) {
      block.data.forEach(tx => {
        // Check if this transaction involves the wallet
        const isIncoming = tx.txOuts.some((out: any) => out.address === publicKey);
        const isOutgoing = tx.txIns.some((input: any) => {
          // This is a simplified check - in a real implementation you'd need to 
          // check the referenced transaction outputs
          return true; // For now, include all transactions
        });
        
        if (isIncoming || isOutgoing) {
          transactions.push({
            from: isOutgoing ? publicKey : 'unknown',
            to: isIncoming ? publicKey : 'unknown',
            amount: tx.txOuts.reduce((sum: number, out: any) => sum + out.amount, 0),
            timestamp: Date.now() // Block timestamp would be better
          });
        }
      });
    }
  });
  
  res.json(transactions);
});

app.post('/mine/start', (req, res) => {
  if (isMining) {
    return res.json({ success: false, message: 'Already mining' });
  }

  isMining = true;
  let hashCount = 0;
  const startTime = Date.now();

  miningInterval = setInterval(async () => {
    try {
      const publicKey = getPublicFromWallet();
      const block = generateNextBlock();
      if (block) {
        hashCount++;
        const elapsed = (Date.now() - startTime) / 1000;
        hashRate = hashCount / elapsed;
        console.log('Block mined!', block.index);
      }
    } catch (error) {
      console.error('Mining error:', error);
    }
  }, 1000); // Mine every second

  res.json({ success: true, message: 'Mining started' });
});

app.post('/mine/stop', (req, res) => {
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

app.get('/mine/status', (req, res) => {
  res.json({
    status: isMining ? 'mining' : 'idle',
    hashRate: hashRate
  });
});

// Start server
app.listen(port, () => {
  console.log(`HackCoin API server running on http://localhost:${port}`);
  console.log(`Wallet address: ${getPublicFromWallet()}`);
  console.log(`Initial balance: ${getAccountBalance()}`);
});
