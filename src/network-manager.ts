import WebSocket, { Server } from 'ws';
import { NetworkConfig, getNetworkConfig, discoverPublicIP } from './network-config';
import {
    addBlockToChain, Block, getBlockchain, getLatestBlock, handleReceivedTransaction,
    isValidBlockStructure, replaceChain
} from './blockchain';
import { Transaction } from './transaction';
import { getTransactionPool } from './transactionPool';

interface Peer {
    id: string;
    socket: WebSocket;
    address: string;
    lastSeen: number;
    isConnected: boolean;
}

interface NetworkStats {
    connectedPeers: number;
    totalConnections: number;
    networkHash: string;
    syncStatus: 'synced' | 'syncing' | 'disconnected';
}

export class NetworkManager {
    private peers: Map<string, Peer> = new Map();
    private server: Server | null = null;
    private config: NetworkConfig;
    private heartbeatInterval: NodeJS.Timer | null = null;
    private reconnectInterval: NodeJS.Timer | null = null;
    private stats: NetworkStats = {
        connectedPeers: 0,
        totalConnections: 0,
        networkHash: '',
        syncStatus: 'disconnected'
    };

    constructor(networkType: 'LOCAL' | 'TESTNET' | 'MAINNET' = 'LOCAL') {
        this.config = getNetworkConfig(networkType);
    }

    // Start the network node
    async start(): Promise<void> {
        try {
            console.log(`Starting HackCoin node: ${this.config.nodeName}`);
            console.log(`Network: ${this.config.p2pPort} (P2P), ${this.config.httpPort} (HTTP)`);            // Discover public IP if not set
            if (!this.config.publicIP) {
                const discoveredIP = await discoverPublicIP();
                if (discoveredIP) {
                    this.config.publicIP = discoveredIP;
                    console.log(`Public IP discovered: ${this.config.publicIP}`);
                }
            }

            // Start P2P server
            await this.startP2PServer();

            // Connect to seed nodes
            await this.connectToSeedNodes();

            // Start heartbeat
            this.startHeartbeat();

            // Start reconnection manager
            this.startReconnectionManager();

            console.log(`Node ${this.config.nodeId} started successfully`);
            console.log(`P2P server listening on port ${this.config.p2pPort}`);
            
        } catch (error) {
            console.error('Failed to start network node:', error);
            throw error;
        }
    }

    // Start P2P WebSocket server
    private startP2PServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = new Server({ 
                    port: this.config.p2pPort,
                    perMessageDeflate: false // Disable compression for better performance
                });

                this.server.on('connection', (socket: WebSocket, request) => {
                    const address = request.socket.remoteAddress || 'unknown';
                    console.log(`New P2P connection from ${address}`);
                    this.handleIncomingConnection(socket, address);
                });

                this.server.on('listening', () => {
                    resolve();
                });

                this.server.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    // Connect to seed nodes
    private async connectToSeedNodes(): Promise<void> {
        console.log(`Connecting to ${this.config.seedNodes.length} seed nodes...`);
        
        const connectionPromises = this.config.seedNodes.map(async (seedNode) => {
            try {
                await this.connectToPeer(seedNode);
                console.log(`Connected to seed node: ${seedNode}`);
            } catch (error) {
                console.log(`Failed to connect to seed node ${seedNode}:`, error.message);
            }
        });

        await Promise.all(connectionPromises.map(p => p.catch(e => e)));
        console.log(`Connected to ${this.peers.size} peer(s)`);
    }

    // Connect to a specific peer
    async connectToPeer(address: string): Promise<void> {
        if (this.peers.size >= this.config.maxPeers) {
            throw new Error('Maximum peers reached');
        }

        return new Promise((resolve, reject) => {
            const socket = new WebSocket(address);
            let peerId: string;

            socket.on('open', () => {
                peerId = this.generatePeerId(address);
                console.log(`Connected to peer: ${address} (${peerId})`);
                
                const peer: Peer = {
                    id: peerId,
                    socket: socket,
                    address: address,
                    lastSeen: Date.now(),
                    isConnected: true
                };

                this.peers.set(peerId, peer);
                this.setupPeerHandlers(peer);
                this.sendHandshake(peer);
                this.updateStats();
                
                resolve();
            });

            socket.on('error', (error) => {
                console.log(`Connection failed to ${address}:`, error.message);
                reject(error);
            });

            // Connection timeout
            setTimeout(() => {
                if (socket.readyState === WebSocket.CONNECTING) {
                    socket.terminate();
                    reject(new Error('Connection timeout'));
                }
            }, this.config.connectionTimeout);
        });
    }

    // Handle incoming P2P connections
    private handleIncomingConnection(socket: WebSocket, address: string): void {
        if (this.peers.size >= this.config.maxPeers) {
            console.log(`Rejecting connection from ${address}: Max peers reached`);
            socket.close(1000, 'Max peers reached');
            return;
        }

        const peerId = this.generatePeerId(address);
        const peer: Peer = {
            id: peerId,
            socket: socket,
            address: address,
            lastSeen: Date.now(),
            isConnected: true
        };

        this.peers.set(peerId, peer);
        this.setupPeerHandlers(peer);
        this.sendHandshake(peer);
        this.updateStats();
    }

    // Setup message handlers for a peer
    private setupPeerHandlers(peer: Peer): void {
        peer.socket.on('message', (data: string) => {
            try {
                peer.lastSeen = Date.now();
                const message = JSON.parse(data);
                this.handleMessage(peer, message);
            } catch (error) {
                console.error(`Invalid message from peer ${peer.id}:`, error);
            }
        });

        peer.socket.on('close', () => {
            console.log(`Peer disconnected: ${peer.id}`);
            peer.isConnected = false;
            this.peers.delete(peer.id);
            this.updateStats();
        });

        peer.socket.on('error', (error) => {
            console.error(`Peer error ${peer.id}:`, error);
            this.removePeer(peer.id);
        });

        peer.socket.on('pong', () => {
            peer.lastSeen = Date.now();
        });
    }

    // Send handshake to establish connection
    private sendHandshake(peer: Peer): void {
        const handshake = {
            type: 'handshake',
            nodeId: this.config.nodeId,
            nodeName: this.config.nodeName,
            version: '1.0.0',
            chainLength: getBlockchain().length,
            timestamp: Date.now()
        };

        this.sendToPeer(peer, handshake);
        
        // Request latest block after handshake
        setTimeout(() => {
            this.sendToPeer(peer, { type: 'query_latest' });
        }, 1000);
    }

    // Handle incoming messages
    private handleMessage(peer: Peer, message: any): void {
        switch (message.type) {
            case 'handshake':
                console.log(`Handshake from ${peer.id}: ${message.nodeName}`);
                break;
                
            case 'query_latest':
                this.sendToPeer(peer, {
                    type: 'response_blockchain',
                    data: [getLatestBlock()]
                });
                break;
                
            case 'query_all':
                this.sendToPeer(peer, {
                    type: 'response_blockchain',
                    data: getBlockchain()
                });
                break;
                
            case 'response_blockchain':
                if (Array.isArray(message.data)) {
                    this.handleBlockchainResponse(message.data);
                }
                break;
                
            case 'query_transaction_pool':
                this.sendToPeer(peer, {
                    type: 'response_transaction_pool',
                    data: getTransactionPool()
                });
                break;
                
            case 'response_transaction_pool':
                if (Array.isArray(message.data)) {
                    message.data.forEach((tx: Transaction) => {
                        try {
                            handleReceivedTransaction(tx);
                        } catch (error) {
                            console.error('Invalid transaction received:', error.message);
                        }
                    });
                }
                break;
                
            case 'ping':
                this.sendToPeer(peer, { type: 'pong', timestamp: Date.now() });
                break;
                
            default:
                console.log(`Unknown message type from ${peer.id}: ${message.type}`);
        }
    }

    // Handle blockchain response
    private handleBlockchainResponse(receivedBlocks: Block[]): void {
        if (receivedBlocks.length === 0) {
            console.log('Received empty blockchain');
            return;
        }

        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = getLatestBlock();

        if (latestBlockReceived.index > latestBlockHeld.index) {
            console.log('Blockchain possibly behind. We got: ' + latestBlockHeld.index + 
                       ' Peer got: ' + latestBlockReceived.index);
            
            if (receivedBlocks.length === 1) {
                console.log('We have to query the chain from our peer');
                this.broadcast({ type: 'query_all' });
            } else {
                console.log('Received blockchain is longer than current blockchain');
                replaceChain(receivedBlocks);
            }
        } else {
            console.log('Received blockchain is not longer than received blockchain. Do nothing');
        }
    }

    // Send message to specific peer
    sendToPeer(peer: Peer, message: any): void {
        try {
            if (peer.socket.readyState === WebSocket.OPEN) {
                peer.socket.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error(`Failed to send message to peer ${peer.id}:`, error);
            this.removePeer(peer.id);
        }
    }

    // Broadcast message to all connected peers
    broadcast(message: any): void {
        const messageStr = JSON.stringify(message);
        let sent = 0;
        
        this.peers.forEach((peer) => {
            if (peer.isConnected && peer.socket.readyState === WebSocket.OPEN) {
                try {
                    peer.socket.send(messageStr);
                    sent++;
                } catch (error) {
                    console.error(`Failed to broadcast to peer ${peer.id}:`, error);
                    this.removePeer(peer.id);
                }
            }
        });
        
        console.log(`Broadcasted message to ${sent} peers`);
    }

    // Remove peer
    private removePeer(peerId: string): void {
        const peer = this.peers.get(peerId);
        if (peer) {
            if (peer.socket.readyState === WebSocket.OPEN) {
                peer.socket.close();
            }
            this.peers.delete(peerId);
            this.updateStats();
        }
    }

    // Start heartbeat to maintain connections
    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            const staleTimeout = this.config.heartbeatInterval * 2;
            
            // Check for stale connections
            this.peers.forEach((peer, peerId) => {
                if (now - peer.lastSeen > staleTimeout) {
                    console.log(`Removing stale peer: ${peerId}`);
                    this.removePeer(peerId);
                } else if (peer.socket.readyState === WebSocket.OPEN) {
                    // Send ping
                    peer.socket.ping();
                }
            });
            
            this.updateStats();
        }, this.config.heartbeatInterval);
    }

    // Start reconnection manager
    private startReconnectionManager(): void {
        this.reconnectInterval = setInterval(async () => {
            if (this.peers.size < this.config.maxPeers / 2) {
                console.log('Low peer count, attempting to reconnect to seed nodes...');
                await this.connectToSeedNodes();
            }
        }, 60000); // Check every minute
    }

    // Generate peer ID
    private generatePeerId(address: string): string {
        return `peer-${address.replace(/[^\w]/g, '_')}-${Date.now()}`;
    }

    // Update network statistics
    private updateStats(): void {
        this.stats.connectedPeers = Array.from(this.peers.values())
            .filter(peer => peer.isConnected).length;
        this.stats.totalConnections = this.peers.size;
        this.stats.syncStatus = this.peers.size > 0 ? 'synced' : 'disconnected';
        this.stats.networkHash = getLatestBlock().hash;
    }

    // Get network statistics
    getStats(): NetworkStats {
        return { ...this.stats };
    }

    // Get connected peers info
    getPeers(): Array<{id: string, address: string, lastSeen: number}> {
        return Array.from(this.peers.values())
            .filter(peer => peer.isConnected)
            .map(peer => ({
                id: peer.id,
                address: peer.address,
                lastSeen: peer.lastSeen
            }));
    }

    // Stop the network manager
    stop(): void {
        console.log('Stopping network manager...');
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }
        
        // Close all peer connections
        this.peers.forEach((peer) => {
            if (peer.socket.readyState === WebSocket.OPEN) {
                peer.socket.close();
            }
        });
        
        // Close server
        if (this.server) {
            this.server.close();
        }
        
        this.peers.clear();
        console.log('Network manager stopped');
    }
}

// Export singleton instance
export const networkManager = new NetworkManager();
