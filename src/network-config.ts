// Network configuration for HackCoin global deployment
export interface NetworkConfig {
  // Node identification
  nodeId: string;
  nodeName: string;
  
  // Network ports
  p2pPort: number;
  httpPort: number;
  
  // Seed nodes for initial connection
  seedNodes: string[];
  
  // Network settings
  maxPeers: number;
  connectionTimeout: number;
  heartbeatInterval: number;
  
  // Public access settings
  publicIP?: string;
  enableUPnP: boolean;
  
  // Security settings
  enableSSL: boolean;
  allowedOrigins: string[];
}

// Default network configurations for different environments
export const NETWORK_CONFIGS = {
  // Local development
  LOCAL: {
    nodeId: generateNodeId(),
    nodeName: 'HackCoin-Local',
    p2pPort: 6001,
    httpPort: 3001,
    seedNodes: [],
    maxPeers: 10,
    connectionTimeout: 5000,
    heartbeatInterval: 30000,
    enableUPnP: false,
    enableSSL: false,
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3002']
  } as NetworkConfig,
  
  // Testnet configuration
  TESTNET: {
    nodeId: generateNodeId(),
    nodeName: 'HackCoin-Testnet',
    p2pPort: 6001,
    httpPort: 3001,
    seedNodes: [
      'ws://testnet-seed1.hackcoin.network:6001',
      'ws://testnet-seed2.hackcoin.network:6001',
      'ws://testnet-seed3.hackcoin.network:6001'
    ],
    maxPeers: 50,
    connectionTimeout: 10000,
    heartbeatInterval: 30000,
    enableUPnP: true,
    enableSSL: true,
    allowedOrigins: ['*']
  } as NetworkConfig,
  
  // Mainnet configuration
  MAINNET: {
    nodeId: generateNodeId(),
    nodeName: 'HackCoin-Mainnet',
    p2pPort: 6001,
    httpPort: 3001,
    seedNodes: [
      'wss://seed1.hackcoin.network:6001',
      'wss://seed2.hackcoin.network:6001',
      'wss://seed3.hackcoin.network:6001',
      'wss://seed4.hackcoin.network:6001',
      'wss://seed5.hackcoin.network:6001'
    ],
    maxPeers: 100,
    connectionTimeout: 15000,
    heartbeatInterval: 30000,
    enableUPnP: true,
    enableSSL: true,
    allowedOrigins: ['*']
  } as NetworkConfig
};

// Generate a unique node ID
function generateNodeId(): string {
  return 'node-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// Get network config based on environment
export function getNetworkConfig(network: 'LOCAL' | 'TESTNET' | 'MAINNET' = 'LOCAL'): NetworkConfig {
  const config = NETWORK_CONFIGS[network];
  
  // Override with environment variables if available
  if (process.env.P2P_PORT) config.p2pPort = parseInt(process.env.P2P_PORT);
  if (process.env.HTTP_PORT) config.httpPort = parseInt(process.env.HTTP_PORT);
  if (process.env.PUBLIC_IP) config.publicIP = process.env.PUBLIC_IP;
  if (process.env.NODE_NAME) config.nodeName = process.env.NODE_NAME;
  if (process.env.SEED_NODES) {
    config.seedNodes = process.env.SEED_NODES.split(',').map(s => s.trim());
  }
  
  return config;
}

// Discover public IP address
export async function discoverPublicIP(): Promise<string | null> {
  try {
    // Try multiple IP discovery services
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipinfo.io/json',
      'https://httpbin.org/ip'
    ];
    
    for (const service of services) {
      try {
        const fetch = require('node-fetch');
        const response = await fetch(service, { timeout: 5000 });
        const data = await response.json();
        
        // Handle different response formats
        const ip = data.ip || data.origin || null;
        if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
          return ip;
        }
      } catch (err) {
        continue; // Try next service
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to discover public IP:', error);
    return null;
  }
}
