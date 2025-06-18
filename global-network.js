/**
 * HackCoin Global Network Configuration
 * 
 * This file contains the configuration for connecting to the global HackCoin network.
 * Anyone can run a single command and automatically join the global network.
 */

// Global seed nodes - these are reliable nodes that help new nodes discover the network
// In a real deployment, these would be hosted on reliable servers
const GLOBAL_SEED_NODES = [
    // Primary seed nodes (replace with real servers)
    'https://seed1.hackcoin.network:3001',
    'https://seed2.hackcoin.network:3001', 
    'https://seed3.hackcoin.network:3001',
    
    // Backup seed nodes
    'https://backup1.hackcoin.network:3001',
    'https://backup2.hackcoin.network:3001',
    
    // Community seed nodes (add your public seed nodes here!)
    // 'http://YOUR_PUBLIC_IP:3001',
    // 'http://your-domain.com:3001',
    
    // Local development nodes (for testing)
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];

// For local development/testing, use these local seed nodes
const LOCAL_SEED_NODES = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
];

// Network configuration
const NETWORK_CONFIG = {
    // Network name
    networkName: 'HackCoin Global Network',
    
    // Network magic bytes (to prevent cross-network communication)
    networkMagic: 0x48434B4E, // 'HCKN' in hex
    
    // Protocol version
    protocolVersion: 1,
    
    // Default ports
    defaultPort: 3001,
    defaultClientPort: 3000,
    
    // P2P networking
    maxPeers: 8,
    minPeers: 2,
    
    // Connection timeouts
    connectionTimeout: 10000, // 10 seconds
    heartbeatInterval: 30000, // 30 seconds
    
    // Blockchain parameters
    blockTime: 600000, // 10 minutes target block time
    difficultyAdjustment: 2016, // Adjust every 2016 blocks
    
    // Mining parameters
    initialDifficulty: 4,
    maxDifficulty: 20,
    
    // Rewards
    blockReward: 50,
    halvingInterval: 210000, // Blocks
};

/**
 * Get seed nodes based on environment
 */
function getSeedNodes() {
    const environment = process.env.NODE_ENV || 'development';
    const customSeeds = process.env.SEED_NODES;
    
    if (customSeeds) {
        return customSeeds.split(',').map(seed => seed.trim());
    }
    
    if (environment === 'production') {
        return GLOBAL_SEED_NODES;
    } else {
        return LOCAL_SEED_NODES;
    }
}

/**
 * Get a random subset of seed nodes for connection attempts
 */
function getRandomSeedNodes(count = 3) {
    const seeds = getSeedNodes();
    const shuffled = [...seeds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, seeds.length));
}

/**
 * Check if a URL is a valid seed node
 */
function isValidSeedNode(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch (error) {
        return false;
    }
}

/**
 * Get network information for display
 */
function getNetworkInfo() {
    return {
        ...NETWORK_CONFIG,
        seedNodes: getSeedNodes(),
        environment: process.env.NODE_ENV || 'development'
    };
}

module.exports = {
    GLOBAL_SEED_NODES,
    LOCAL_SEED_NODES,
    NETWORK_CONFIG,
    getSeedNodes,
    getRandomSeedNodes,
    isValidSeedNode,
    getNetworkInfo
};
