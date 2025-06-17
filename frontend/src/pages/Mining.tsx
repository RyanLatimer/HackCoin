import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Mining: React.FC = () => {
  const [miningStatus, setMiningStatus] = useState<string>('idle');
  const [hashRate, setHashRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadMiningStatus();
    const interval = setInterval(loadMiningStatus, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMiningStatus = async () => {
    try {
      const status = await apiService.getMiningStatus();
      setMiningStatus(status.status);
      setHashRate(status.hashRate || 0);
    } catch (error) {
      console.error('Error loading mining status:', error);
    }
  };

  const handleStartMining = async () => {
    setIsLoading(true);
    try {
      const success = await apiService.startMining();
      if (success) {
        setMiningStatus('mining');
      } else {
        alert('Failed to start mining');
      }
    } catch (error) {
      console.error('Error starting mining:', error);
      alert('Error starting mining');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMining = async () => {
    setIsLoading(true);
    try {
      const success = await apiService.stopMining();
      if (success) {
        setMiningStatus('idle');
        setHashRate(0);
      } else {
        alert('Failed to stop mining');
      }
    } catch (error) {
      console.error('Error stopping mining:', error);
      alert('Error stopping mining');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mining-page">
      <h2>Mining Control</h2>
      
      <div className="mining-status">
        <div className="status-indicator">
          <span className={`status-dot ${miningStatus}`}></span>
          <span>Status: {miningStatus}</span>
        </div>
        
        {hashRate > 0 && (
          <div className="hash-rate">
            Hash Rate: {hashRate.toFixed(2)} H/s
          </div>
        )}
      </div>
      
      <div className="mining-controls">
        <button 
          onClick={handleStartMining} 
          disabled={isLoading || miningStatus === 'mining'}
          className={miningStatus === 'mining' ? 'disabled' : ''}
        >
          {isLoading ? 'Starting...' : 'Start Mining'}
        </button>
        
        <button 
          onClick={handleStopMining} 
          disabled={isLoading || miningStatus === 'idle'}
          className={miningStatus === 'idle' ? 'disabled' : 'stop-button'}
        >
          {isLoading ? 'Stopping...' : 'Stop Mining'}
        </button>
      </div>
      
      <div className="mining-info">
        <h3>About Mining</h3>
        <p>Mining helps secure the HackCoin network by validating transactions and creating new blocks. 
           You'll earn HackCoins as a reward for successfully mining blocks.</p>
        <p>Click "Start Mining" to begin the proof-of-work process. Your computer will solve cryptographic 
           puzzles to find valid block hashes.</p>
      </div>
    </div>
  );
};

export default Mining;
