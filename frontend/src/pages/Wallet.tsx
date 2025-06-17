import React, { useState, useEffect } from 'react';
import { apiService, WalletInfo } from '../services/api';

const Wallet: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ address: '', balance: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadWalletInfo();
    const interval = setInterval(loadWalletInfo, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadWalletInfo = async () => {
    try {
      const info = await apiService.getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error('Error loading wallet info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="wallet-page">
        <h2>Wallet</h2>
        <p>Loading wallet information...</p>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <h2>Your HackCoin Wallet</h2>
      
      <div className="wallet-card">
        <div className="balance-section">
          <h3>Current Balance</h3>
          <div className="balance-amount">
            {walletInfo.balance.toFixed(2)} <span className="currency">HCK</span>
          </div>
        </div>
        
        <div className="address-section">
          <h3>Wallet Address</h3>
          <div className="address-container">
            <div className="address-text">
              {walletInfo.address || 'No address available'}
            </div>
            {walletInfo.address && (
              <button 
                className="copy-button" 
                onClick={copyAddress}
                title="Copy address to clipboard"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
        </div>
        
        <div className="wallet-actions">
          <button onClick={loadWalletInfo} className="refresh-button">
            🔄 Refresh Balance
          </button>
        </div>
      </div>
      
      <div className="wallet-info">
        <h3>About Your Wallet</h3>
        <ul>
          <li>Your wallet address is your unique identifier on the HackCoin network</li>
          <li>Share this address with others to receive HackCoins</li>
          <li>Your balance updates automatically as transactions are processed</li>
          <li>Keep your private key secure - it's stored safely in the backend</li>
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
