/**
 * HackCoin Blockchain Synchronization Manager
 * Handles blockchain synchronization between network nodes
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class BlockchainSync extends EventEmitter {
    constructor(blockchain, peerManager) {
        super();
        this.blockchain = blockchain;
        this.peerManager = peerManager;
        this.isSyncing = false;
        this.syncTimeout = 30000; // 30 seconds
        this.lastSyncTime = 0;
        this.syncInterval = 60000; // 1 minute
        
        this.startPeriodicSync();
        this.setupPeerEvents();
    }

    setupPeerEvents() {
        this.peerManager.on('peerConnected', (peerInfo) => {
            this.requestBlockchainSync(peerInfo.url);
        });
    }

    /**
     * Start periodic blockchain synchronization
     */
    startPeriodicSync() {
        setInterval(() => {
            if (!this.isSyncing && this.peerManager.peers.size > 0) {
                this.syncWithNetwork();
            }
        }, this.syncInterval);
    }

    /**
     * Synchronize blockchain with the network
     */
    async syncWithNetwork() {
        if (this.isSyncing) {
            console.log('🔄 Sync already in progress...');
            return;
        }

        this.isSyncing = true;
        this.lastSyncTime = Date.now();
        
        console.log('🔄 Starting blockchain synchronization...');
        this.emit('syncStarted');

        try {
            const peerBlockchains = await this.collectPeerBlockchains();
            const consensusChain = this.determineConsensusChain(peerBlockchains);
            
            if (consensusChain && this.shouldReplaceChain(consensusChain)) {
                await this.replaceBlockchain(consensusChain);
                console.log('✅ Blockchain synchronized successfully');
                this.emit('syncCompleted', { updated: true, blockCount: consensusChain.length });
            } else {
                console.log('✅ Blockchain is already up to date');
                this.emit('syncCompleted', { updated: false, blockCount: this.blockchain.length });
            }
        } catch (error) {
            console.error('❌ Blockchain sync failed:', error.message);
            this.emit('syncFailed', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Request blockchain sync from a specific peer
     */
    async requestBlockchainSync(peerUrl) {
        try {
            console.log(`🔄 Requesting blockchain from peer: ${peerUrl}`);
            
            const response = await this.peerManager.sendToPeer(peerUrl, '/api/blockchain/sync', {
                currentHeight: this.blockchain.length - 1,
                lastBlockHash: this.getLastBlockHash()
            });

            if (response.blockchain && response.blockchain.length > this.blockchain.length) {
                if (this.validateBlockchain(response.blockchain)) {
                    await this.replaceBlockchain(response.blockchain);
                    console.log(`✅ Synced ${response.blockchain.length} blocks from ${peerUrl}`);
                    return true;
                }
            }
        } catch (error) {
            console.log(`❌ Failed to sync from peer ${peerUrl}: ${error.message}`);
        }
        
        return false;
    }

    /**
     * Collect blockchains from all connected peers
     */
    async collectPeerBlockchains() {
        const blockchains = [];
        const promises = [];

        for (const [peerUrl, peerInfo] of this.peerManager.peers) {
            promises.push(this.getPeerBlockchain(peerUrl));
        }

        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                blockchains.push(result.value);
            }
        });

        return blockchains;
    }

    /**
     * Get blockchain from a specific peer
     */
    async getPeerBlockchain(peerUrl) {
        try {
            const response = await this.peerManager.sendToPeer(peerUrl, '/api/blockchain/full', {});
            
            if (response.blockchain && this.validateBlockchain(response.blockchain)) {
                return {
                    peerUrl,
                    blockchain: response.blockchain,
                    height: response.blockchain.length
                };
            }
        } catch (error) {
            console.log(`Failed to get blockchain from ${peerUrl}: ${error.message}`);
        }
        
        return null;
    }

    /**
     * Determine the consensus chain from multiple peer blockchains
     */
    determineConsensusChain(peerBlockchains) {
        if (peerBlockchains.length === 0) {
            return null;
        }

        // Find the longest valid chain
        let longestChain = null;
        let maxHeight = this.blockchain.length;

        for (const peerData of peerBlockchains) {
            if (peerData.height > maxHeight) {
                maxHeight = peerData.height;
                longestChain = peerData.blockchain;
            }
        }

        // Verify consensus - at least 51% of peers should have the same chain
        if (longestChain && peerBlockchains.length > 1) {
            const consensusCount = peerBlockchains.filter(
                peerData => this.chainsAreEqual(peerData.blockchain, longestChain)
            ).length;

            if (consensusCount / peerBlockchains.length < 0.51) {
                console.log('⚠️ No consensus reached, keeping current chain');
                return null;
            }
        }

        return longestChain;
    }

    /**
     * Check if current blockchain should be replaced
     */
    shouldReplaceChain(newChain) {
        return newChain.length > this.blockchain.length && 
               this.validateBlockchain(newChain);
    }

    /**
     * Replace current blockchain with new chain
     */
    async replaceBlockchain(newChain) {
        const oldLength = this.blockchain.length;
        
        // Clear current blockchain and replace
        this.blockchain.length = 0;
        this.blockchain.push(...newChain);
        
        console.log(`🔄 Blockchain replaced: ${oldLength} -> ${newChain.length} blocks`);
        this.emit('blockchainReplaced', {
            oldLength,
            newLength: newChain.length,
            blockchain: this.blockchain
        });
    }

    /**
     * Validate an entire blockchain
     */
    validateBlockchain(blockchain) {
        if (!blockchain || blockchain.length === 0) {
            return false;
        }

        // Validate genesis block
        if (!this.validateGenesisBlock(blockchain[0])) {
            console.log('❌ Invalid genesis block');
            return false;
        }

        // Validate all subsequent blocks
        for (let i = 1; i < blockchain.length; i++) {
            if (!this.validateBlock(blockchain[i], blockchain[i - 1])) {
                console.log(`❌ Invalid block at index ${i}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Validate genesis block
     */
    validateGenesisBlock(block) {
        // Check if it matches our expected genesis block structure
        return block.index === 0 && 
               block.previousHash === "0" &&
               block.hash &&
               block.timestamp;
    }

    /**
     * Validate a single block against its predecessor
     */
    validateBlock(block, previousBlock) {
        // Check block structure
        if (!block.hash || !block.previousHash || typeof block.index !== 'number') {
            return false;
        }

        // Check if block points to previous block
        if (block.previousHash !== previousBlock.hash) {
            return false;
        }

        // Check if block index is correct
        if (block.index !== previousBlock.index + 1) {
            return false;
        }

        // Validate block hash
        if (!this.validateBlockHash(block)) {
            return false;
        }

        return true;
    }

    /**
     * Validate block hash
     */
    validateBlockHash(block) {
        const blockString = `${block.index}${block.timestamp}${block.data}${block.previousHash}${block.nonce}`;
        const hash = crypto.createHash('sha256').update(blockString).digest('hex');
        return hash === block.hash;
    }

    /**
     * Check if two chains are equal
     */
    chainsAreEqual(chain1, chain2) {
        if (chain1.length !== chain2.length) {
            return false;
        }

        for (let i = 0; i < chain1.length; i++) {
            if (chain1[i].hash !== chain2[i].hash) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the hash of the last block
     */
    getLastBlockHash() {
        if (this.blockchain.length === 0) {
            return "0";
        }
        return this.blockchain[this.blockchain.length - 1].hash;
    }

    /**
     * Broadcast new block to network
     */
    async broadcastNewBlock(block) {
        console.log(`📡 Broadcasting new block #${block.index} to network...`);
        
        try {
            const results = await this.peerManager.broadcastToPeers('/api/blockchain/new-block', {
                block: block
            });

            const successCount = results.filter(r => r.status === 'fulfilled').length;
            console.log(`✅ Block broadcasted to ${successCount}/${results.length} peers`);
            
            return successCount;
        } catch (error) {
            console.error('❌ Failed to broadcast block:', error.message);
            return 0;
        }
    }

    /**
     * Handle new block received from network
     */
    async handleNewBlockFromPeer(block, fromPeer) {
        console.log(`📥 Received new block #${block.index} from ${fromPeer}`);

        // Validate the new block
        if (this.blockchain.length === 0) {
            console.log('❌ Cannot validate block - empty blockchain');
            return false;
        }

        const lastBlock = this.blockchain[this.blockchain.length - 1];
        
        if (this.validateBlock(block, lastBlock)) {
            this.blockchain.push(block);
            console.log(`✅ Added new block #${block.index} to blockchain`);
            
            this.emit('newBlockAdded', {
                block: block,
                fromPeer: fromPeer,
                blockchainLength: this.blockchain.length
            });
            
            return true;
        } else {
            console.log(`❌ Invalid block received from ${fromPeer}`);
            // Trigger sync to resolve potential fork
            setTimeout(() => this.syncWithNetwork(), 1000);
            return false;
        }
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            blockchainHeight: this.blockchain.length,
            connectedPeers: this.peerManager.peers.size
        };
    }
}

module.exports = BlockchainSync;
