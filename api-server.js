"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bodyParser = __importStar(require("body-parser"));
const blockchain_1 = require("./src/blockchain");
const wallet_1 = require("./src/wallet");
const p2p_1 = require("./src/p2p");
const app = (0, express_1.default)();
// Get configuration from environment or use defaults
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3001');
const P2P_PORT = parseInt(process.env.P2P_PORT || '6001');
const NETWORK_TYPE = process.env.NETWORK_TYPE || 'LOCAL';
// Enable CORS for global access
app.use((0, cors_1.default)({
    origin: '*',
    credentials: false
}));
app.use(bodyParser.json());
// Initialize wallet and P2P
(0, wallet_1.initWallet)();
// Start P2P server for global connectivity
(0, p2p_1.initP2PServer)(P2P_PORT);
// Connect to seed nodes if specified
if (process.env.SEED_NODES) {
    const seedNodes = process.env.SEED_NODES.split(',').map(s => s.trim());
    console.log(`Connecting to seed nodes: ${seedNodes.join(', ')}`);
    (0, p2p_1.connectToPeers)(seedNodes);
}
// Mining state
let isMining = false;
let miningInterval = null;
let hashRate = 0;
// ============ API ROUTES ============
// Get blockchain
app.get('/api/blocks', (req, res) => {
    res.json((0, blockchain_1.getBlockchain)());
});
// Get balance for address
app.get('/api/balance/:address', (req, res) => {
    const address = req.params.address;
    const balance = (0, blockchain_1.getAccountBalance)();
    res.json({ address, balance });
});
// Get wallet info
app.get('/api/wallet', (req, res) => {
    const publicKey = (0, wallet_1.getPublicFromWallet)();
    res.json({
        address: publicKey,
        balance: (0, blockchain_1.getAccountBalance)(),
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
        const result = (0, blockchain_1.sendTransaction)(to, amount);
        if (result) {
            res.json({ success: true, transaction: result });
        }
        else {
            res.status(400).json({ error: 'Transaction failed - insufficient balance or invalid transaction' });
        }
    }
    catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});
// Get transaction history
app.get('/api/transactions', (req, res) => {
    const transactions = [];
    const publicKey = (0, wallet_1.getPublicFromWallet)();
    // Get all transactions from all blocks
    (0, blockchain_1.getBlockchain)().forEach(block => {
        if (Array.isArray(block.data)) {
            block.data.forEach(tx => {
                // Check if this transaction involves the wallet
                const isIncoming = tx.txOuts.some((out) => out.address === publicKey);
                const isOutgoing = tx.txIns.some((input) => {
                    return true; // Simplified check
                });
                if (isIncoming || isOutgoing) {
                    transactions.push({
                        from: isOutgoing ? publicKey : 'unknown',
                        to: isIncoming ? publicKey : 'unknown',
                        amount: tx.txOuts.reduce((sum, out) => sum + out.amount, 0),
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
            const block = (0, blockchain_1.generateNextBlock)();
            if (block) {
                hashCount++;
                const elapsed = (Date.now() - startTime) / 1000;
                hashRate = hashCount / elapsed;
                console.log(`Block ${block.index} mined!`);
            }
        }
        catch (error) {
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
    const sockets = (0, p2p_1.getSockets)();
    res.json({
        network: NETWORK_TYPE,
        httpPort: HTTP_PORT,
        p2pPort: P2P_PORT,
        connectedPeers: sockets.length,
        chainHeight: (0, blockchain_1.getBlockchain)().length,
        syncStatus: sockets.length > 0 ? 'connected' : 'isolated'
    });
});
// Get connected peers
app.get('/api/network/peers', (req, res) => {
    const sockets = (0, p2p_1.getSockets)();
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
        chainHeight: (0, blockchain_1.getBlockchain)().length,
        peers: (0, p2p_1.getSockets)().length,
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
        chainHeight: (0, blockchain_1.getBlockchain)().length,
        address: (0, wallet_1.getPublicFromWallet)(),
        timestamp: Date.now()
    });
});
// Static files for web interface
app.use(express_1.default.static('frontend/build'));
// Serve React app for non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
    }
    else {
        // Try to serve the React app
        try {
            res.sendFile('index.html', { root: 'frontend/build' });
        }
        catch (error) {
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
    console.log(`💰 Wallet: ${(0, wallet_1.getPublicFromWallet)()}`);
    console.log(`💎 Balance: ${(0, blockchain_1.getAccountBalance)()} HCK`);
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
//# sourceMappingURL=api-server.js.map