/**
 * HackCoin Distributed Consensus Manager
 * Implements Proof-of-Work consensus across the network with fork resolution
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class ConsensusManager extends EventEmitter {
    constructor(blockchain, peerManager, blockchainSync) {
        super();
        this.blockchain = blockchain;
        this.peerManager = peerManager;
        this.blockchainSync = blockchainSync;
        
        // Consensus parameters
        this.targetBlockTime = 60000; // 1 minute target block time
        this.difficultyAdjustmentInterval = 10; // Adjust every 10 blocks
        this.maxDifficultyChange = 4; // Maximum change factor
        this.minDifficulty = 1000;
        this.maxDifficulty = 100000;
        
        // Mining state
        this.currentDifficulty = 4000;
        this.isMining = false;
        this.miningProcess = null;
        
        // Transaction pool
        this.transactionPool = new Map();
        this.maxPoolSize = 1000;
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Handle new blocks from network
        this.blockchainSync.on('newBlockAdded', (data) => {
            this.handleNewNetworkBlock(data.block, data.fromPeer);
        });

        // Handle blockchain replacement (fork resolution)
        this.blockchainSync.on('blockchainReplaced', (data) => {
            this.handleBlockchainReplacement(data);
        });
    }

    /**
     * Calculate network difficulty based on recent block times
     */
    calculateNetworkDifficulty() {
        if (this.blockchain.length < this.difficultyAdjustmentInterval + 1) {
            return this.currentDifficulty;
        }

        const recentBlocks = this.blockchain.slice(-this.difficultyAdjustmentInterval);
        const timeSpan = recentBlocks[recentBlocks.length - 1].timestamp - recentBlocks[0].timestamp;
        const expectedTime = this.targetBlockTime * (this.difficultyAdjustmentInterval - 1);
        
        let newDifficulty = this.currentDifficulty;
        
        if (timeSpan < expectedTime / 2) {
            // Blocks are being mined too fast, increase difficulty
            newDifficulty = Math.min(this.currentDifficulty * 2, this.maxDifficulty);
        } else if (timeSpan > expectedTime * 2) {
            // Blocks are being mined too slow, decrease difficulty
            newDifficulty = Math.max(this.currentDifficulty / 2, this.minDifficulty);
        }

        if (newDifficulty !== this.currentDifficulty) {
            console.log(`🎯 Difficulty adjusted: ${this.currentDifficulty} -> ${newDifficulty}`);
            this.currentDifficulty = newDifficulty;
            this.emit('difficultyAdjusted', {
                oldDifficulty: this.currentDifficulty,
                newDifficulty: newDifficulty,
                timeSpan: timeSpan,
                expectedTime: expectedTime
            });
        }

        return newDifficulty;
    }

    /**
     * Add transaction to the network pool
     */
    async addTransaction(transaction) {
        // Validate transaction
        if (!this.validateTransaction(transaction)) {
            throw new Error('Invalid transaction');
        }

        // Check if transaction already exists
        if (this.transactionPool.has(transaction.id)) {
            return false;
        }

        // Add to pool
        this.transactionPool.set(transaction.id, {
            ...transaction,
            timestamp: Date.now(),
            addedBy: this.peerManager.nodeId
        });

        // Broadcast to network
        await this.broadcastTransaction(transaction);

        console.log(`📝 Transaction added to pool: ${transaction.id}`);
        this.emit('transactionAdded', transaction);

        return true;
    }

    /**
     * Validate a transaction
     */
    validateTransaction(transaction) {
        // Basic validation
        if (!transaction.id || !transaction.from || !transaction.to || 
            typeof transaction.amount !== 'number' || transaction.amount <= 0) {
            return false;
        }

        // Check if sender has sufficient balance (simplified)
        if (transaction.from !== 'system') {
            const balance = this.calculateBalance(transaction.from);
            if (balance < transaction.amount) {
                console.log(`❌ Insufficient balance for transaction ${transaction.id}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate balance for an address
     */
    calculateBalance(address) {
        let balance = 0;

        // Calculate from blockchain
        for (const block of this.blockchain) {
            if (block.transactions) {
                for (const tx of block.transactions) {
                    if (tx.to === address) {
                        balance += tx.amount;
                    }
                    if (tx.from === address) {
                        balance -= tx.amount;
                    }
                }
            }
        }

        return balance;
    }

    /**
     * Broadcast transaction to network
     */
    async broadcastTransaction(transaction) {
        try {
            const results = await this.peerManager.broadcastToPeers('/api/consensus/transaction', {
                transaction: transaction
            });

            const successCount = results.filter(r => r.status === 'fulfilled').length;
            console.log(`📡 Transaction broadcasted to ${successCount} peers`);
            
            return successCount;
        } catch (error) {
            console.error('❌ Failed to broadcast transaction:', error.message);
            return 0;
        }
    }

    /**
     * Handle transaction received from network
     */
    async handleNetworkTransaction(transaction, fromPeer) {
        try {
            if (!this.transactionPool.has(transaction.id) && this.validateTransaction(transaction)) {
                this.transactionPool.set(transaction.id, {
                    ...transaction,
                    timestamp: Date.now(),
                    receivedFrom: fromPeer
                });

                console.log(`📥 Received transaction ${transaction.id} from ${fromPeer}`);
                this.emit('transactionReceived', { transaction, fromPeer });
                
                return true;
            }
        } catch (error) {
            console.error('❌ Error handling network transaction:', error.message);
        }
        
        return false;
    }

    /**
     * Start mining with network consensus
     */
    async startMining(minerAddress) {
        if (this.isMining) {
            throw new Error('Mining is already active');
        }

        this.isMining = true;
        console.log(`⛏️ Starting network mining with address: ${minerAddress}`);

        // Update difficulty based on network
        this.currentDifficulty = this.calculateNetworkDifficulty();

        // Start mining process
        this.miningProcess = setInterval(async () => {
            await this.attemptMining(minerAddress);
        }, 1000);

        this.emit('miningStarted', { minerAddress, difficulty: this.currentDifficulty });
    }

    /**
     * Stop mining
     */
    stopMining() {
        if (!this.isMining) {
            return;
        }

        this.isMining = false;
        if (this.miningProcess) {
            clearInterval(this.miningProcess);
            this.miningProcess = null;
        }

        console.log('⛏️ Mining stopped');
        this.emit('miningStopped');
    }

    /**
     * Attempt to mine a new block
     */
    async attemptMining(minerAddress) {
        try {
            // Check if we're still on the longest chain
            if (this.blockchainSync.isSyncing) {
                return; // Skip mining during sync
            }

            // Select transactions from pool
            const transactions = this.selectTransactionsForBlock();

            // Add mining reward
            const miningReward = {
                id: this.generateTransactionId(),
                from: 'system',
                to: minerAddress,
                amount: 1,
                timestamp: Date.now(),
                type: 'mining_reward'
            };
            transactions.unshift(miningReward);

            // Create new block
            const previousBlock = this.blockchain[this.blockchain.length - 1];
            const newBlock = {
                index: this.blockchain.length,
                timestamp: Date.now(),
                data: JSON.stringify({
                    transactions: transactions,
                    message: `Block mined by ${minerAddress}`,
                    difficulty: this.currentDifficulty
                }),
                previousHash: previousBlock.hash,
                transactions: transactions,
                difficulty: this.currentDifficulty,
                nonce: 0,
                hash: null
            };

            // Mine the block (Proof of Work)
            const minedBlock = await this.mineBlock(newBlock);

            if (minedBlock) {
                // Add to local blockchain
                this.blockchain.push(minedBlock);

                // Remove mined transactions from pool
                transactions.forEach(tx => {
                    if (tx.type !== 'mining_reward') {
                        this.transactionPool.delete(tx.id);
                    }
                });

                console.log(`🎉 Block #${minedBlock.index} mined successfully!`);
                console.log(`   Hash: ${minedBlock.hash}`);
                console.log(`   Transactions: ${transactions.length}`);
                console.log(`   Difficulty: ${minedBlock.difficulty}`);

                // Broadcast to network
                await this.blockchainSync.broadcastNewBlock(minedBlock);

                this.emit('blockMined', {
                    block: minedBlock,
                    transactions: transactions,
                    reward: miningReward.amount
                });

                // Adjust difficulty for next block
                this.currentDifficulty = this.calculateNetworkDifficulty();
            }
        } catch (error) {
            console.error('❌ Mining error:', error.message);
        }
    }

    /**
     * Select transactions from pool for new block
     */
    selectTransactionsForBlock(maxTransactions = 10) {
        const transactions = Array.from(this.transactionPool.values())
            .sort((a, b) => b.timestamp - a.timestamp) // Newest first
            .slice(0, maxTransactions);

        return transactions;
    }

    /**
     * Mine a block using Proof of Work
     */
    async mineBlock(block) {
        const target = "0".repeat(Math.floor(this.currentDifficulty / 1000));
        let nonce = 0;
        const startTime = Date.now();

        while (true) {
            // Check if mining should stop
            if (!this.isMining) {
                return null;
            }

            block.nonce = nonce;
            block.hash = this.calculateBlockHash(block);

            // Check if hash meets difficulty requirement
            if (block.hash.substring(0, target.length) === target) {
                const miningTime = Date.now() - startTime;
                console.log(`⛏️ Block mined in ${miningTime}ms with nonce ${nonce}`);
                return block;
            }

            nonce++;

            // Yield control periodically to prevent blocking
            if (nonce % 1000 === 0) {
                await new Promise(resolve => setImmediate(resolve));
                
                // Emit mining progress
                this.emit('miningProgress', {
                    nonce: nonce,
                    hashRate: nonce / ((Date.now() - startTime) / 1000),
                    difficulty: this.currentDifficulty
                });
            }

            // Timeout after 30 seconds to allow for network updates
            if (Date.now() - startTime > 30000) {
                console.log('⏰ Mining timeout, restarting with updated blockchain...');
                return null;
            }
        }
    }

    /**
     * Calculate block hash
     */
    calculateBlockHash(block) {
        const blockString = `${block.index}${block.timestamp}${block.data}${block.previousHash}${block.nonce}`;
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    /**
     * Handle new block from network
     */
    handleNewNetworkBlock(block, fromPeer) {
        // Remove transactions that are now in the block
        if (block.transactions) {
            block.transactions.forEach(tx => {
                if (this.transactionPool.has(tx.id)) {
                    this.transactionPool.delete(tx.id);
                    console.log(`🗑️ Removed mined transaction ${tx.id} from pool`);
                }
            });
        }

        // Update difficulty if needed
        this.currentDifficulty = this.calculateNetworkDifficulty();

        this.emit('networkBlockReceived', { block, fromPeer });
    }

    /**
     * Handle blockchain replacement (fork resolution)
     */
    handleBlockchainReplacement(data) {
        console.log('🔄 Blockchain replaced, updating transaction pool...');
        
        // Re-validate all transactions in pool against new blockchain
        const validTransactions = new Map();
        
        for (const [id, tx] of this.transactionPool) {
            if (this.validateTransaction(tx)) {
                validTransactions.set(id, tx);
            }
        }
        
        this.transactionPool = validTransactions;
        
        // Recalculate difficulty
        this.currentDifficulty = this.calculateNetworkDifficulty();
        
        console.log(`🔄 Transaction pool updated: ${this.transactionPool.size} transactions remaining`);
    }

    /**
     * Generate unique transaction ID
     */
    generateTransactionId() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Get consensus statistics
     */
    getConsensusStats() {
        return {
            currentDifficulty: this.currentDifficulty,
            transactionPoolSize: this.transactionPool.size,
            isMining: this.isMining,
            blockchainHeight: this.blockchain.length,
            averageBlockTime: this.calculateAverageBlockTime(),
            networkHashRate: this.estimateNetworkHashRate()
        };
    }

    /**
     * Calculate average block time for recent blocks
     */
    calculateAverageBlockTime() {
        if (this.blockchain.length < 2) return 0;
        
        const recentBlocks = this.blockchain.slice(-10); // Last 10 blocks
        if (recentBlocks.length < 2) return 0;
        
        const timeSpan = recentBlocks[recentBlocks.length - 1].timestamp - recentBlocks[0].timestamp;
        return timeSpan / (recentBlocks.length - 1);
    }

    /**
     * Estimate network hash rate
     */
    estimateNetworkHashRate() {
        const avgBlockTime = this.calculateAverageBlockTime();
        if (avgBlockTime === 0) return 0;
        
        // Simplified estimation based on difficulty and block time
        return this.currentDifficulty / (avgBlockTime / 1000);
    }

    /**
     * Get current transaction pool
     */
    getTransactionPool() {
        return Array.from(this.transactionPool.values());
    }
}

module.exports = ConsensusManager;
