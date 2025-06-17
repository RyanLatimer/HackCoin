import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Utility functions for ECDSA operations (simplified for demo)
const generateECDSAKeys = () => {
  // In a real implementation, you'd use a proper crypto library
  // For demo purposes, we'll generate mock keys
  const privateKey = Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  
  const publicKey = btoa(Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(''));
  
  return { privateKey, publicKey };
};

const signMessage = (privateKey, message) => {
  // Mock signing function - in real app, use proper ECDSA
  return btoa(message + privateKey.substring(0, 16));
};

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const createWallet = useCallback(async () => {
    setLoading(true);
    try {
      const { privateKey: newPrivateKey, publicKey } = generateECDSAKeys();
      
      setPrivateKey(newPrivateKey);
      setAddress(publicKey);
      setBalance(0);
      
      // Store in localStorage for persistence
      localStorage.setItem('hackcoin_wallet', JSON.stringify({
        privateKey: newPrivateKey,
        address: publicKey
      }));
      
      return { privateKey: newPrivateKey, address: publicKey };
    } catch (error) {
      throw new Error('Failed to create wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const importWallet = useCallback(async (importedPrivateKey) => {
    setLoading(true);
    try {
      if (!importedPrivateKey || importedPrivateKey.length !== 64) {
        throw new Error('Invalid private key format');
      }
      
      // Generate public key from private key (mock implementation)
      const publicKey = btoa(importedPrivateKey.substring(0, 32) + 
        Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''));
      
      setPrivateKey(importedPrivateKey);
      setAddress(publicKey);
      
      // Store in localStorage
      localStorage.setItem('hackcoin_wallet', JSON.stringify({
        privateKey: importedPrivateKey,
        address: publicKey
      }));
      
      // Get balance
      await getBalance();
      
      return { privateKey: importedPrivateKey, address: publicKey };
    } catch (error) {
      throw new Error('Failed to import wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBalance = useCallback(async () => {
    if (!address) return 0;
    
    try {
      const response = await fetch('/api/blocks');
      const blocks = await response.json();
      
      if (!blocks || !Array.isArray(blocks)) {
        return 0;
      }
        let totalBalance = 0;
      
      blocks.forEach(block => {
        // Check transactions in block.data.transactions (for regular transactions)
        try {
          const blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
          if (blockData.transactions && Array.isArray(blockData.transactions)) {
            blockData.transactions.forEach(tx => {
              if (tx.to === address) {
                totalBalance += parseFloat(tx.amount) || 0;
              }
              if (tx.from === address) {
                totalBalance -= parseFloat(tx.amount) || 0;
              }
            });
          }
        } catch (error) {
          console.error('Error parsing block data:', error);
        }
        
        // Also check transactions in block.transactions (for mining rewards)
        if (block.transactions && Array.isArray(block.transactions)) {
          block.transactions.forEach(tx => {
            if (tx.to === address) {
              totalBalance += parseFloat(tx.amount) || 0;
            }
            if (tx.from === address) {
              totalBalance -= parseFloat(tx.amount) || 0;
            }
          });
        }
      });
      
      setBalance(totalBalance);
      return totalBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }, [address]);

  const sendTransaction = useCallback(async (recipient, amount) => {
    if (!address || !privateKey) {
      throw new Error('No wallet connected');
    }
    
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (amount > balance) {
      throw new Error('Insufficient balance');
    }
    
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const message = timestamp;
      const signature = signMessage(privateKey, message);
      
      const transactionData = {
        from: address,
        to: recipient,
        amount: amount.toString(),
        signature,
        message
      };
      
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Transaction failed');
      }
      
      // Update balance after successful transaction
      setTimeout(() => {
        getBalance();
      }, 1000);
      
      return response.text();
    } catch (error) {
      throw new Error('Failed to send transaction: ' + error.message);
    }
  }, [address, privateKey, balance, getBalance]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setPrivateKey(null);
    setBalance(0);
    localStorage.removeItem('hackcoin_wallet');
  }, []);

  // Load wallet from localStorage on mount
  React.useEffect(() => {
    const savedWallet = localStorage.getItem('hackcoin_wallet');
    if (savedWallet) {
      try {
        const { privateKey: savedPrivateKey, address: savedAddress } = JSON.parse(savedWallet);
        setPrivateKey(savedPrivateKey);
        setAddress(savedAddress);
        // Get balance will be called by useEffect in components
      } catch (error) {
        console.error('Error loading saved wallet:', error);
        localStorage.removeItem('hackcoin_wallet');
      }
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      privateKey,
      balance,
      loading,
      createWallet,
      importWallet,
      getBalance,
      sendTransaction,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};
