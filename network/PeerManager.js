/**
 * HackCoin Distributed Peer Management System
 * Bitcoin-style decentralized peer discovery with gossip protocol
 * No bootstrap nodes required - peers discover each other organically
 */

const EventEmitter = require('events');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class PeerManager extends EventEmitter {
    constructor(nodeId, port = 3001) {
        super();
        this.nodeId = nodeId || this.generateNodeId();
        this.port = port;
        this.peers = new Map(); // Map of peerUrl -> peerInfo
        this.peerAddresses = new Map(); // Map of address -> addressInfo (persistent peer database)
        this.connectionAttempts = new Map(); // Track connection attempt history
        this.isConnected = false;
        this.maxPeers = 8;
        this.maxKnownAddresses = 1000; // Maximum addresses to store
        this.heartbeatInterval = 30000; // 30 seconds
        this.discoveryInterval = 45000; // 45 seconds
        this.addressGossipInterval = 120000; // 2 minutes
        this.peerDbFile = path.join(__dirname, '..', 'data', 'peers.json');
        
        // Initialize the peer database
        this.initializePeerDatabase();
        
        this.startHeartbeat();
        this.startPeerDiscovery();
        this.startAddressGossip();
    }    generateNodeId() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Initialize the persistent peer database
     */
    async initializePeerDatabase() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.peerDbFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            // Load existing peer addresses
            await this.loadPeerAddresses();
            
            console.log(`📚 Loaded ${this.peerAddresses.size} known peer addresses`);
        } catch (error) {
            console.log('📚 Initializing empty peer database');
            this.peerAddresses = new Map();
        }
    }

    /**
     * Load peer addresses from persistent storage
     */
    async loadPeerAddresses() {
        try {
            const data = await fs.readFile(this.peerDbFile, 'utf8');
            const addresses = JSON.parse(data);
            
            this.peerAddresses = new Map();
            for (const addr of addresses) {
                this.peerAddresses.set(addr.url, {
                    url: addr.url,
                    firstSeen: addr.firstSeen,
                    lastSeen: addr.lastSeen,
                    successfulConnections: addr.successfulConnections || 0,
                    failedConnections: addr.failedConnections || 0,
                    reputation: addr.reputation || 0
                });
            }
        } catch (error) {
            // File doesn't exist or is corrupted
            this.peerAddresses = new Map();
        }
    }

    /**
     * Save peer addresses to persistent storage
     */
    async savePeerAddresses() {
        try {
            const addresses = Array.from(this.peerAddresses.values());
            await fs.writeFile(this.peerDbFile, JSON.stringify(addresses, null, 2));
        } catch (error) {
            console.log('Failed to save peer addresses:', error.message);
        }
    }

    /**
     * Add a new peer address to the database
     */
    addPeerAddress(url, discoveredFrom = null) {
        // Don't add ourselves
        if (url.includes(`:${this.port}`) && url.includes('localhost')) {
            return;
        }

        const now = Date.now();
        
        if (this.peerAddresses.has(url)) {
            // Update existing address
            const addr = this.peerAddresses.get(url);
            addr.lastSeen = now;
        } else {
            // Add new address
            if (this.peerAddresses.size >= this.maxKnownAddresses) {
                // Remove oldest, least reliable address
                this.pruneOldAddresses();
            }
            
            this.peerAddresses.set(url, {
                url: url,
                firstSeen: now,
                lastSeen: now,
                successfulConnections: 0,
                failedConnections: 0,
                reputation: 0,
                discoveredFrom: discoveredFrom
            });
            
            console.log(`📍 Discovered new peer address: ${url}`);
        }
        
        // Save to disk periodically
        if (Math.random() < 0.1) { // 10% chance to save
            this.savePeerAddresses();
        }
    }

    /**
     * Remove old or unreliable peer addresses
     */
    pruneOldAddresses() {
        const addresses = Array.from(this.peerAddresses.values());
        
        // Sort by reputation (ascending) and lastSeen (ascending)
        addresses.sort((a, b) => {
            if (a.reputation !== b.reputation) {
                return a.reputation - b.reputation;
            }
            return a.lastSeen - b.lastSeen;
        });
        
        // Remove worst 10% of addresses
        const toRemove = Math.floor(addresses.length * 0.1);
        for (let i = 0; i < toRemove; i++) {
            this.peerAddresses.delete(addresses[i].url);
        }
    }

    /**
     * Get random peer addresses for connection attempts
     */
    getRandomPeerAddresses(count = 5) {
        const addresses = Array.from(this.peerAddresses.values());
        
        // Filter out currently connected peers and recently failed attempts
        const available = addresses.filter(addr => {
            if (this.peers.has(addr.url)) return false;
            
            const attempt = this.connectionAttempts.get(addr.url);
            if (attempt && Date.now() - attempt.lastAttempt < 300000) { // 5 minutes cooldown
                return false;
            }
            
            return true;
        });
        
        // Sort by reputation (descending)
        available.sort((a, b) => b.reputation - a.reputation);
        
        // Return top addresses with some randomization
        const result = [];
        const topCount = Math.min(count * 2, available.length);
        
        for (let i = 0; i < count && i < topCount; i++) {
            const randomIndex = Math.floor(Math.random() * Math.min(topCount - i, 3));
            result.push(available[i + randomIndex]);
        }
        
        return result;
    }    /**
     * Connect to a specific peer
     */
    async connectToPeer(peerUrl) {
        try {
            if (this.peers.has(peerUrl)) {
                console.log(`Already connected to peer: ${peerUrl}`);
                return true;
            }

            if (this.peers.size >= this.maxPeers) {
                console.log('Maximum peer connections reached');
                return false;
            }

            // Track connection attempt
            const now = Date.now();
            this.connectionAttempts.set(peerUrl, {
                lastAttempt: now,
                attempts: (this.connectionAttempts.get(peerUrl)?.attempts || 0) + 1
            });

            // Attempt handshake
            const response = await axios.post(`${peerUrl}/api/network/handshake`, {
                nodeId: this.nodeId,
                port: this.port,
                timestamp: now,
                knownPeers: this.getAddressesForGossip() // Share some known addresses
            }, { timeout: 5000 });

            if (response.data.success) {
                const peerInfo = {
                    url: peerUrl,
                    nodeId: response.data.nodeId,
                    lastSeen: now,
                    status: 'connected',
                    blockHeight: response.data.blockHeight || 0,
                    version: response.data.version || '1.0.0'
                };

                this.peers.set(peerUrl, peerInfo);
                
                // Update peer address reputation
                if (this.peerAddresses.has(peerUrl)) {
                    const addr = this.peerAddresses.get(peerUrl);
                    addr.successfulConnections++;
                    addr.reputation = this.calculateReputation(addr);
                }
                
                // Process received peer addresses
                if (response.data.knownPeers) {
                    this.processReceivedAddresses(response.data.knownPeers, peerUrl);
                }
                
                this.emit('peerConnected', peerInfo);
                console.log(`✅ Connected to peer: ${peerUrl} (NodeID: ${response.data.nodeId})`);
                return true;
            }
        } catch (error) {
            console.log(`❌ Failed to connect to peer ${peerUrl}: ${error.message}`);
            
            // Update peer address reputation
            if (this.peerAddresses.has(peerUrl)) {
                const addr = this.peerAddresses.get(peerUrl);
                addr.failedConnections++;
                addr.reputation = this.calculateReputation(addr);
            }
            
            return false;
        }
    }    /**
     * Calculate reputation score for a peer address
     */
    calculateReputation(addressInfo) {
        const successRate = addressInfo.successfulConnections / 
                           (addressInfo.successfulConnections + addressInfo.failedConnections + 1);
        const recencyBonus = Math.max(0, 1 - (Date.now() - addressInfo.lastSeen) / (7 * 24 * 60 * 60 * 1000)); // 7 days
        
        return Math.floor((successRate * 0.7 + recencyBonus * 0.3) * 100);
    }

    /**
     * Get addresses for gossip protocol
     */
    getAddressesForGossip(count = 10) {
        const addresses = Array.from(this.peerAddresses.values());
        
        // Sort by reputation and recency
        addresses.sort((a, b) => {
            if (a.reputation !== b.reputation) {
                return b.reputation - a.reputation;
            }
            return b.lastSeen - a.lastSeen;
        });
        
        return addresses.slice(0, count).map(addr => ({
            url: addr.url,
            lastSeen: addr.lastSeen,
            reputation: addr.reputation
        }));
    }

    /**
     * Process addresses received from other peers
     */
    processReceivedAddresses(addresses, fromPeer) {
        for (const addr of addresses) {
            if (addr.url && addr.url !== `http://localhost:${this.port}`) {
                this.addPeerAddress(addr.url, fromPeer);
            }
        }
        
        console.log(`📨 Received ${addresses.length} peer addresses from ${fromPeer}`);
    }

    /**
     * Start address gossip protocol
     */
    startAddressGossip() {
        setInterval(async () => {
            if (this.peers.size === 0) return;
            
            const addressesToShare = this.getAddressesForGossip(15);
            if (addressesToShare.length === 0) return;
            
            // Send addresses to random connected peers
            const peersToShare = Math.min(3, this.peers.size);
            const peerUrls = Array.from(this.peers.keys());
            
            for (let i = 0; i < peersToShare; i++) {
                const randomPeer = peerUrls[Math.floor(Math.random() * peerUrls.length)];
                
                try {
                    await this.sendToPeer(randomPeer, '/api/network/addr', {
                        addresses: addressesToShare
                    });
                } catch (error) {
                    // Ignore gossip errors
                }
            }
        }, this.addressGossipInterval);
    }    /**
     * Disconnect from a specific peer
     */
    async disconnectFromPeer(peerUrl) {
        if (!this.peers.has(peerUrl)) {
            return;
        }

        try {
            await axios.post(`${peerUrl}/api/network/disconnect`, {
                nodeId: this.nodeId
            }, { timeout: 3000 });
        } catch (error) {
            // Ignore errors during disconnect
        }

        const peerInfo = this.peers.get(peerUrl);
        this.peers.delete(peerUrl);
        this.emit('peerDisconnected', peerInfo);
        
        console.log(`🔌 Disconnected from peer: ${peerUrl}`);
    }

    /**
     * Broadcast a message to all connected peers
     */
    async broadcastToPeers(endpoint, data, excludePeer = null) {
        const promises = [];
        
        for (const [peerUrl, peerInfo] of this.peers) {
            if (peerUrl === excludePeer) continue;
            
            promises.push(this.sendToPeer(peerUrl, endpoint, data));
        }

        const results = await Promise.allSettled(promises);
        return results;
    }

    /**
     * Send a message to a specific peer
     */
    async sendToPeer(peerUrl, endpoint, data) {
        try {
            const response = await axios.post(`${peerUrl}${endpoint}`, {
                ...data,
                fromNodeId: this.nodeId,
                timestamp: Date.now()
            }, { timeout: 10000 });

            // Update peer's last seen time
            if (this.peers.has(peerUrl)) {
                this.peers.get(peerUrl).lastSeen = Date.now();
            }

            return response.data;
        } catch (error) {
            console.log(`Failed to send to peer ${peerUrl}: ${error.message}`);
            
            // Mark peer as problematic
            if (this.peers.has(peerUrl)) {
                this.peers.get(peerUrl).status = 'error';
            }
            
            throw error;
        }
    }    /**
     * Discover new peers from existing connections (Bitcoin-style)
     */
    async discoverPeers() {
        // First, try to get addresses from connected peers
        for (const [peerUrl, peerInfo] of this.peers) {
            try {
                const response = await axios.get(`${peerUrl}/api/network/peers`, {
                    timeout: 5000
                });

                if (response.data.peers) {
                    for (const peer of response.data.peers) {
                        if (peer.url && peer.url !== `http://localhost:${this.port}`) {
                            this.addPeerAddress(peer.url, peerUrl);
                        }
                    }
                }
            } catch (error) {
                // Ignore discovery errors
            }
        }
        
        // Request fresh addresses from peers
        for (const [peerUrl] of this.peers) {
            try {
                await this.sendToPeer(peerUrl, '/api/network/getaddr', {});
            } catch (error) {
                // Ignore request errors
            }
        }
    }

    /**
     * Start peer discovery mechanism (decentralized)
     */
    startPeerDiscovery() {
        setInterval(async () => {
            // Try to maintain connections with good peers
            if (this.peers.size < this.maxPeers) {
                const candidateAddresses = this.getRandomPeerAddresses(5);
                
                // Try to connect to 1-2 new peers at a time
                const connectionsToAttempt = Math.min(2, this.maxPeers - this.peers.size);
                
                for (let i = 0; i < connectionsToAttempt && i < candidateAddresses.length; i++) {
                    const addr = candidateAddresses[i];
                    console.log(`🔍 Attempting connection to discovered peer: ${addr.url}`);
                    await this.connectToPeer(addr.url);
                }
            }

            // Discover new peers from existing connections
            await this.discoverPeers();
            
            // Occasionally save the peer database
            if (Math.random() < 0.2) { // 20% chance
                await this.savePeerAddresses();
            }
        }, this.discoveryInterval);
    }

    /**
     * Start the heartbeat mechanism to maintain connections
     */
    startHeartbeat() {
        setInterval(async () => {
            const now = Date.now();
            const staleThreshold = this.heartbeatInterval * 2;

            // Check for stale connections
            for (const [peerUrl, peerInfo] of this.peers) {
                if (now - peerInfo.lastSeen > staleThreshold) {
                    console.log(`🔄 Peer ${peerUrl} seems stale, checking...`);
                    
                    try {
                        await axios.get(`${peerUrl}/api/network/ping`, { timeout: 5000 });
                        peerInfo.lastSeen = now;
                        peerInfo.status = 'connected';
                    } catch (error) {
                        console.log(`💀 Peer ${peerUrl} is unreachable, removing...`);
                        this.peers.delete(peerUrl);
                        this.emit('peerDisconnected', peerInfo);
                    }
                }
            }            // Emit network status
            this.emit('networkStatus', {
                connectedPeers: this.peers.size,
                knownAddresses: this.peerAddresses.size,
                networkHealth: this.calculateNetworkHealth()
            });
        }, this.heartbeatInterval);
    }    /**
     * Calculate network health score (0-100)
     */
    calculateNetworkHealth() {
        const connectedPeers = this.peers.size;
        const healthyPeers = Array.from(this.peers.values()).filter(
            peer => peer.status === 'connected'
        ).length;

        if (connectedPeers === 0) return 0;
        
        const baseHealth = (healthyPeers / connectedPeers) * 100;
        const connectivityBonus = Math.min(connectedPeers / this.maxPeers, 1) * 20;
        
        return Math.min(baseHealth + connectivityBonus, 100);
    }

    /**
     * Get network statistics
     */
    getNetworkStats() {
        return {
            nodeId: this.nodeId,
            connectedPeers: this.peers.size,
            knownAddresses: this.peerAddresses.size,
            networkHealth: this.calculateNetworkHealth(),
            peers: Array.from(this.peers.entries()).map(([url, info]) => ({
                url,
                nodeId: info.nodeId,
                status: info.status,
                blockHeight: info.blockHeight,
                lastSeen: info.lastSeen
            })),
            peerDatabase: {
                totalAddresses: this.peerAddresses.size,
                topAddresses: Array.from(this.peerAddresses.values())
                    .sort((a, b) => b.reputation - a.reputation)
                    .slice(0, 10)
                    .map(addr => ({
                        url: addr.url,
                        reputation: addr.reputation,
                        successfulConnections: addr.successfulConnections,
                        failedConnections: addr.failedConnections
                    }))
            }
        };
    }

    /**
     * Add a single peer address manually (for initial network seeding)
     */
    seedPeerAddress(peerUrl) {
        this.addPeerAddress(peerUrl, 'manual');
        console.log(`🌱 Seeded peer address: ${peerUrl}`);
    }

    /**
     * Clean shutdown
     */
    async shutdown() {
        console.log('🔄 Shutting down peer manager...');
        
        // Save peer database before shutdown
        await this.savePeerAddresses();
        
        const disconnectPromises = Array.from(this.peers.keys()).map(
            peerUrl => this.disconnectFromPeer(peerUrl)
        );
        
        await Promise.allSettled(disconnectPromises);
        console.log('✅ Peer manager shutdown complete');
    }
}

module.exports = PeerManager;
