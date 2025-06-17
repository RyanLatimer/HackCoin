import React, { useState, useEffect } from 'react';
import { apiService, WalletInfo } from '../services/api';

const Dashboard: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ address: '', balance: 0 });
  const [miningStatus, setMiningStatus] = useState<string>('unknown');
  const [blockCount, setBlockCount] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [wallet, mining, blocks] = await Promise.all([
        apiService.getWalletInfo(),
        apiService.getMiningStatus(),
        apiService.getBlocks()
      ]);
      
      setWalletInfo(wallet);
      setMiningStatus(mining.status);
      setBlockCount(blocks.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2>HackCoin Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Wallet Balance</h3>
          <p className="stat-value">{walletInfo.balance} HCK</p>
        </div>
        
        <div className="stat-card">
          <h3>Mining Status</h3>
          <p className="stat-value">{miningStatus}</p>
        </div>
        
        <div className="stat-card">
          <h3>Blockchain Height</h3>
          <p className="stat-value">{blockCount} blocks</p>
        </div>
        
        <div className="stat-card">
          <h3>Your Address</h3>
          <p className="stat-address">{walletInfo.address || 'Loading...'}</p>
        </div>
      </div>
      
      <div className="welcome-text">
        <p>Welcome to HackCoin! Use the navigation above to mine coins, send transactions, and explore the blockchain.</p>
      </div>
    </div>
  );
};

export default Dashboard;
