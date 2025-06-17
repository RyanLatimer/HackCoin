// HackCoin - Main Entry Point
// This file serves as the main entry point for the HackCoin application

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>HackCoin - Blockchain Platform</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        max-width: 800px; 
                        margin: 50px auto; 
                        padding: 20px;
                        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                        color: white;
                        text-align: center;
                    }
                    .logo { font-size: 48px; margin-bottom: 20px; }
                    .subtitle { font-size: 18px; margin-bottom: 30px; color: #94a3b8; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        margin: 10px;
                        background: #3b82f6; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 8px;
                        font-weight: bold;
                    }
                    .button:hover { background: #2563eb; }
                    .info { 
                        background: rgba(255,255,255,0.1); 
                        padding: 20px; 
                        border-radius: 10px; 
                        margin: 20px 0;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <div class="logo">🚀 HackCoin</div>
                <div class="subtitle">Advanced Blockchain Cryptocurrency Platform</div>
                
                <div class="info">
                    <h3>🎯 Quick Start:</h3>
                    <ol>
                        <li><strong>Start the Enhanced Miner:</strong><br>
                            <code>python hackcoin_miner.py</code></li>
                        <li><strong>Launch the Web GUI:</strong><br>
                            <code>npm run dev</code></li>
                        <li><strong>Access the Interface:</strong><br>
                            <a href="http://localhost:3001" class="button">Open GUI (Port 3001)</a></li>
                    </ol>
                </div>
                
                <div class="info">
                    <h3>✨ Features:</h3>
                    <ul>
                        <li>🎯 Variable Hash Difficulty Mining</li>
                        <li>💎 Professional Wallet Management</li>
                        <li>🌐 Real-time Web Interface</li>
                        <li>🔗 Advanced Blockchain Explorer</li>
                        <li>⚡ Multi-threaded Processing</li>
                    </ul>
                </div>
                
                <div>
                    <a href="http://localhost:3001" class="button">Launch HackCoin GUI</a>
                    <a href="http://localhost:5000/blocks" class="button">View Blockchain API</a>
                </div>
                
                <p style="margin-top: 40px; color: #64748b;">
                    For full functionality, use the startup scripts or run the commands above.
                </p>
            </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║               🚀 HACKCOIN INFO SERVER 🚀                   ║
    ║                                                              ║
    ║  Server running on: http://localhost:${PORT}                        ║
    ║                                                              ║
    ║  For full HackCoin experience:                               ║
    ║  1. Run: python hackcoin_miner.py                           ║
    ║  2. Run: npm run dev                                         ║
    ║  3. Visit: http://localhost:3001                             ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    `);
});