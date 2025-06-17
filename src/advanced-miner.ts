import * as crypto from 'crypto';
import * as os from 'os';
import { getLatestBlock, addBlockToChain, getUnspentTxOuts } from './blockchain';
import { getCoinbaseTransaction } from './transaction';
import { getPublicFromWallet } from './wallet';

export interface MiningConfig {
    intensity: number; // 0-100 percentage
    threads: number;
    maxThreads: number;
    batchSize: number;
    throttleMs: number;
}

export interface MiningStats {
    hashRate: number;
    blocksFound: number;
    runtime: number;
    efficiency: number;
    cpuUsage: number;
}

export class AdvancedMiner {
    private mining: boolean = false;
    private config: MiningConfig;
    private stats: MiningStats;
    private workers: Worker[] = [];
    private startTime: number = 0;
    private totalHashes: number = 0;
    private intervalId: NodeJS.Timeout | null = null;
    
    constructor() {
        const maxThreads = os.cpus().length;
        this.config = {
            intensity: 50, // Default 50% intensity
            threads: Math.max(1, Math.floor(maxThreads * 0.75)),
            maxThreads: maxThreads,
            batchSize: 10000,
            throttleMs: 0
        };
        
        this.stats = {
            hashRate: 0,
            blocksFound: 0,
            runtime: 0,
            efficiency: 0,
            cpuUsage: 0
        };
    }

    // Set mining intensity as percentage (0-100)
    setIntensity(percentage: number): void {
        this.config.intensity = Math.max(0, Math.min(100, percentage));
        
        // Calculate optimal settings based on intensity
        const maxThreads = this.config.maxThreads;
        const intensityFactor = this.config.intensity / 100;
        
        // Adjust threads based on intensity
        this.config.threads = Math.max(1, Math.floor(maxThreads * intensityFactor));
        
        // Adjust batch size and throttling for CPU management
        this.config.batchSize = Math.floor(1000 + (intensityFactor * 49000)); // 1K to 50K
        this.config.throttleMs = Math.floor((1 - intensityFactor) * 100); // 0-100ms throttle
        
        console.log(`⚡ Mining intensity set to ${this.config.intensity}%`);
        console.log(`📊 Threads: ${this.config.threads}, Batch: ${this.config.batchSize}, Throttle: ${this.config.throttleMs}ms`);
        
        // Restart mining with new settings if currently mining
        if (this.mining) {
            this.stopMining();
            setTimeout(() => this.startMining(), 100);
        }
    }

    async startMining(): Promise<void> {
        if (this.mining) return;
        
        this.mining = true;
        this.startTime = Date.now();
        this.totalHashes = 0;
        this.stats.blocksFound = 0;
        
        console.log(`🚀 Starting mining at ${this.config.intensity}% intensity`);
        console.log(`⚙️  Using ${this.config.threads} threads of ${this.config.maxThreads} available`);
        
        // Start multiple mining threads
        for (let i = 0; i < this.config.threads; i++) {
            this.startMiningThread(i);
        }
        
        // Start stats monitoring
        this.startStatsMonitoring();
    }

    private startMiningThread(threadId: number): void {
        const mineWithThrottle = async () => {
            while (this.mining) {
                try {
                    // Mine a batch of hashes
                    const result = await this.mineBatch(threadId);
                    
                    if (result.blockFound) {
                        await this.handleBlockFound(result.block);
                    }
                    
                    this.totalHashes += result.hashesPerformed;
                    
                    // Apply throttling based on intensity
                    if (this.config.throttleMs > 0) {
                        await this.sleep(this.config.throttleMs);
                    }
                    
                } catch (error) {
                    console.error(`Mining thread ${threadId} error:`, error);
                    await this.sleep(1000); // Error recovery pause
                }
            }
        };
        
        mineWithThrottle();
    }

    private async mineBatch(threadId: number): Promise<{blockFound: boolean, block?: any, hashesPerformed: number}> {
        const latestBlock = getLatestBlock();
        const unspentTxOuts = getUnspentTxOuts();
        const minerAddress = getPublicFromWallet();
        
        // Create coinbase transaction
        const coinbaseTransaction = getCoinbaseTransaction(minerAddress, latestBlock.index + 1);
        const blockData = [coinbaseTransaction];
        
        // Create new block template
        const newBlock = {
            index: latestBlock.index + 1,
            previousHash: latestBlock.hash,
            timestamp: new Date().getTime(),
            data: blockData,
            difficulty: this.calculateDifficulty(latestBlock),
            nonce: Math.floor(Math.random() * 1000000) + (threadId * 1000000), // Thread-specific nonce range
            hash: ''
        };
        
        const target = '0'.repeat(newBlock.difficulty);
        const batchSize = this.config.batchSize;
        let hashesPerformed = 0;
        
        // Mine batch
        for (let i = 0; i < batchSize && this.mining; i++) {
            newBlock.nonce++;
            const hash = this.calculateBlockHash(newBlock);
            hashesPerformed++;
            
            if (hash.startsWith(target)) {
                newBlock.hash = hash;
                console.log(`⛏️  Block found by thread ${threadId}! Nonce: ${newBlock.nonce}`);
                return { blockFound: true, block: newBlock, hashesPerformed };
            }
        }
        
        return { blockFound: false, hashesPerformed };
    }

    private calculateBlockHash(block: any): string {
        const blockString = `${block.index}${block.previousHash}${block.timestamp}${JSON.stringify(block.data)}${block.nonce}`;
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    private calculateDifficulty(latestBlock: any): number {
        // Dynamic difficulty based on mining intensity
        const baseDifficulty = 2;
        const intensityFactor = this.config.intensity / 100;
        
        // Higher intensity can handle higher difficulty
        return Math.max(1, Math.floor(baseDifficulty + (intensityFactor * 2)));
    }

    private async handleBlockFound(block: any): Promise<void> {
        try {
            const success = addBlockToChain(block);
            if (success) {
                this.stats.blocksFound++;
                console.log(`🎉 Block ${block.index} successfully added to blockchain!`);
                console.log(`💎 Total blocks mined: ${this.stats.blocksFound}`);
            }
        } catch (error) {
            console.log('Block validation failed, continuing mining...');
        }
    }

    private startStatsMonitoring(): void {
        this.intervalId = setInterval(() => {
            this.updateStats();
        }, 2000); // Update every 2 seconds
    }

    private updateStats(): void {
        const now = Date.now();
        this.stats.runtime = Math.floor((now - this.startTime) / 1000);
        
        if (this.stats.runtime > 0) {
            this.stats.hashRate = Math.floor(this.totalHashes / this.stats.runtime);
            this.stats.efficiency = this.stats.blocksFound / (this.stats.runtime / 60); // blocks per minute
        }
        
        // Estimate CPU usage based on intensity and actual performance
        this.stats.cpuUsage = Math.min(100, this.config.intensity * (this.stats.hashRate / 10000));
    }

    stopMining(): void {
        this.mining = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('⏹️  Mining stopped');
        console.log(`📊 Final Stats: ${this.stats.hashRate} H/s, ${this.stats.blocksFound} blocks, ${this.stats.runtime}s runtime`);
    }

    getConfig(): MiningConfig {
        return { ...this.config };
    }

    getStats(): MiningStats {
        return { ...this.stats };
    }

    isMining(): boolean {
        return this.mining;
    }

    // Get system capabilities for UI display
    getSystemCapabilities(): {maxThreads: number, recommendedIntensity: number, cpuModel: string} {
        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || 'Unknown CPU';
        const maxThreads = cpus.length;
        
        // Recommend 75% intensity for optimal balance
        const recommendedIntensity = 75;
        
        return {
            maxThreads,
            recommendedIntensity,
            cpuModel
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const advancedMiner = new AdvancedMiner();
