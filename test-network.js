const { spawn } = require('child_process');
const path = require('path');

// Test network configuration
const TEST_NODES = [
    { name: 'Node1', httpPort: 3001, p2pPort: 6001, peers: [] },
    { name: 'Node2', httpPort: 3002, p2pPort: 6002, peers: ['ws://localhost:6001'] },
    { name: 'Node3', httpPort: 3003, p2pPort: 6003, peers: ['ws://localhost:6001', 'ws://localhost:6002'] }
];

const processes = [];

// Function to start a node
function startNode(nodeConfig) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Starting ${nodeConfig.name}...`);
        
        const env = {
            ...process.env,
            NETWORK_TYPE: 'LOCAL',
            HTTP_PORT: nodeConfig.httpPort.toString(),
            P2P_PORT: nodeConfig.p2pPort.toString(),
            NODE_NAME: nodeConfig.name,
            SEED_NODES: nodeConfig.peers.join(',')
        };

        const child = spawn('node', ['global-node.js'], {
            cwd: path.join(__dirname),
            env: env,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        child.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[${nodeConfig.name}] ${output.trim()}`);
            
            if (output.includes('Ready to accept connections')) {
                resolve(child);
            }
        });

        child.stderr.on('data', (data) => {
            console.error(`[${nodeConfig.name}] ERROR: ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            console.log(`[${nodeConfig.name}] Process exited with code ${code}`);
        });

        child.on('error', (error) => {
            console.error(`[${nodeConfig.name}] Failed to start:`, error);
            reject(error);
        });

        processes.push(child);
    });
}

// Function to test network connectivity
async function testNetworkConnectivity() {
    console.log('\n🔍 Testing network connectivity...');
    
    // Wait a bit for connections to establish
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test API calls to verify network status
    for (const node of TEST_NODES) {
        try {
            const response = await fetch(`http://localhost:${node.httpPort}/api/network/status`);
            const status = await response.json();
            console.log(`✅ ${node.name} status:`, {
                peers: status.connectedPeers,
                syncStatus: status.syncStatus,
                httpPort: status.httpPort,
                p2pPort: status.p2pPort
            });
        } catch (error) {
            console.error(`❌ Failed to get status from ${node.name}:`, error.message);
        }
    }
}

// Function to test mining across network
async function testMining() {
    console.log('\n⛏️  Testing mining...');
    
    try {
        // Start mining on Node1
        const response = await fetch(`http://localhost:${TEST_NODES[0].httpPort}/api/mine/start`, {
            method: 'POST'
        });
        const result = await response.json();
        console.log('Mining started on Node1:', result);
        
        // Wait for a few blocks
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Check blockchain on all nodes
        for (const node of TEST_NODES) {
            try {
                const response = await fetch(`http://localhost:${node.httpPort}/api/blocks`);
                const blockchain = await response.json();
                console.log(`📦 ${node.name} blockchain length: ${blockchain.length}`);
            } catch (error) {
                console.error(`❌ Failed to get blockchain from ${node.name}:`, error.message);
            }
        }
        
        // Stop mining
        await fetch(`http://localhost:${TEST_NODES[0].httpPort}/api/mine/stop`, {
            method: 'POST'
        });
        console.log('Mining stopped on Node1');
        
    } catch (error) {
        console.error('Mining test failed:', error);
    }
}

// Function to clean up processes
function cleanup() {
    console.log('\n🧹 Cleaning up processes...');
    processes.forEach(child => {
        if (!child.killed) {
            child.kill('SIGTERM');
        }
    });
    
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

// Main test function
async function runNetworkTest() {
    console.log('🚀 Starting HackCoin Network Test');
    console.log('===================================');
    
    try {
        // Start all nodes
        console.log('\n📡 Starting test nodes...');
        for (const nodeConfig of TEST_NODES) {
            await startNode(nodeConfig);
            // Wait between node starts
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Test connectivity
        await testNetworkConnectivity();
        
        // Test mining
        await testMining();
        
        console.log('\n✅ Network test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Network test failed:', error);
    } finally {
        cleanup();
    }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Add fetch polyfill for Node.js if needed
if (!global.fetch) {
    const { default: fetch } = require('node-fetch');
    global.fetch = fetch;
}

// Run the test
runNetworkTest();
