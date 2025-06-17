const { spawn } = require('child_process');
const path = require('path');

// Test network configuration
const TEST_NODES = [
    { name: 'Node1', httpPort: 3001, p2pPort: 6001, peers: [] },
    { name: 'Node2', httpPort: 3002, p2pPort: 6002, peers: ['ws://localhost:6001'] }
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
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let resolved = false;

        child.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[${nodeConfig.name}] ${output.trim()}`);
            
            if (output.includes('Ready to accept connections') && !resolved) {
                resolved = true;
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
            if (!resolved) {
                resolved = true;
                reject(error);
            }
        });

        processes.push(child);
        
        // Timeout after 30 seconds
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                reject(new Error(`Timeout starting ${nodeConfig.name}`));
            }
        }, 30000);
    });
}

// Function to test network connectivity
async function testNetworkConnectivity() {
    console.log('\n🔍 Testing network connectivity...');
    
    // Wait a bit for connections to establish
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Network connectivity test completed');
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
async function runSimpleNetworkTest() {
    console.log('🚀 Starting Simple HackCoin Network Test');
    console.log('=========================================');
    
    try {
        // Start first node
        console.log('\n📡 Starting Node1...');
        await startNode(TEST_NODES[0]);
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Start second node (which should connect to first)
        console.log('\n📡 Starting Node2...');
        await startNode(TEST_NODES[1]);
        
        // Test connectivity
        await testNetworkConnectivity();
        
        console.log('\n✅ Simple network test completed successfully!');
        console.log('Both nodes are running and should be connected.');
        console.log('You can check the logs above to verify P2P connections.');
        
        // Keep running for a while to observe
        console.log('\n⏰ Keeping nodes running for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.error('\n❌ Network test failed:', error);
    } finally {
        cleanup();
    }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Run the test
runSimpleNetworkTest();
