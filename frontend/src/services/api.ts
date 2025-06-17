// API service to communicate with the HackCoin blockchain backend
const API_BASE_URL = 'http://localhost:3001'; // Assuming backend runs on port 3001

export interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature?: string;
}

export interface WalletInfo {
  address: string;
  balance: number;
}

class ApiService {
  async getBlocks(): Promise<Block[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/blocks`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching blocks:', error);
      return [];
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/balance/${address}`);
      const data = await response.json();
      return data.balance || 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async sendTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      return response.ok;
    } catch (error) {
      console.error('Error sending transaction:', error);
      return false;
    }
  }

  async startMining(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/mine/start`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error starting mining:', error);
      return false;
    }
  }

  async stopMining(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/mine/stop`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error stopping mining:', error);
      return false;
    }
  }

  async getMiningStatus(): Promise<{ status: string; hashRate?: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mine/status`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching mining status:', error);
      return { status: 'unknown' };
    }
  }

  async getWalletInfo(): Promise<WalletInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      return { address: 'unknown', balance: 0 };
    }
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
