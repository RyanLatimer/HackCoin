import React, { useState, useEffect } from 'react';
import { apiService, Block } from '../services/api';

const Explorer: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  useEffect(() => {
    loadBlocks();
    const interval = setInterval(loadBlocks, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBlocks = async () => {
    try {
      const blocksData = await apiService.getBlocks();
      setBlocks(blocksData.reverse()); // Show newest blocks first
    } catch (error) {
      console.error('Error loading blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHash = (hash: string) => {
    if (!hash) return 'N/A';
    return hash.length > 16 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}` : hash;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="explorer-page">
        <h2>Blockchain Explorer</h2>
        <p>Loading blockchain data...</p>
      </div>
    );
  }

  return (
    <div className="explorer-page">
      <h2>Blockchain Explorer</h2>
      
      <div className="blockchain-stats">
        <div className="stat">
          <span className="stat-label">Total Blocks:</span>
          <span className="stat-value">{blocks.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Latest Block:</span>
          <span className="stat-value">#{blocks[0]?.index || 0}</span>
        </div>
      </div>
      
      {blocks.length === 0 ? (
        <p>No blocks found. Start mining to create the first block!</p>
      ) : (
        <div className="blocks-container">
          <div className="blocks-list">
            <h3>Recent Blocks</h3>
            {blocks.map((block) => (
              <div 
                key={block.index} 
                className={`block-item ${selectedBlock?.index === block.index ? 'selected' : ''}`}
                onClick={() => setSelectedBlock(selectedBlock?.index === block.index ? null : block)}
              >
                <div className="block-header">
                  <span className="block-index">Block #{block.index}</span>
                  <span className="block-time">{formatTimestamp(block.timestamp)}</span>
                </div>
                <div className="block-hash">
                  Hash: {formatHash(block.hash)}
                </div>
                <div className="block-txs">
                  Transactions: {Array.isArray(block.data) ? block.data.length : 0}
                </div>
              </div>
            ))}
          </div>
          
          {selectedBlock && (
            <div className="block-details">
              <h3>Block #{selectedBlock.index} Details</h3>
              <div className="detail-group">
                <label>Index:</label>
                <span>{selectedBlock.index}</span>
              </div>
              <div className="detail-group">
                <label>Timestamp:</label>
                <span>{formatTimestamp(selectedBlock.timestamp)}</span>
              </div>
              <div className="detail-group">
                <label>Hash:</label>
                <span className="hash-value">{selectedBlock.hash}</span>
              </div>
              <div className="detail-group">
                <label>Previous Hash:</label>
                <span className="hash-value">{selectedBlock.previousHash}</span>
              </div>
              <div className="detail-group">
                <label>Nonce:</label>
                <span>{selectedBlock.nonce}</span>
              </div>
              <div className="detail-group">
                <label>Data:</label>
                <pre className="block-data">
                  {JSON.stringify(selectedBlock.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explorer;
