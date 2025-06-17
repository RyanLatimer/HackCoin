import React, { useState, useEffect } from 'react';
import { 
  Database as BlocksIcon, 
  Search, 
  Clock, 
  Hash, 
  Users, 
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Shield,
  Database
} from 'lucide-react';
import { toast } from 'react-toastify';

const Blockchain = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [chainStats, setChainStats] = useState({
    totalBlocks: 0,
    totalTransactions: 0,
    totalVolume: 0,
    averageBlockTime: 0
  });

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    calculateChainStats();
  }, [blocks, searchTerm, sortOrder]);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('/api/blocks');
      const blocksData = await response.json();
      
      if (blocksData && Array.isArray(blocksData)) {
        setBlocks(blocksData);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      toast.error('Failed to fetch blockchain data');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...blocks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(block => 
        block.index.toString().includes(searchTerm) ||
        block.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (block.data && JSON.stringify(block.data).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp));
        break;
      case 'oldest':
        filtered.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp));
        break;
    }

    setFilteredBlocks(filtered);
  };

  const calculateChainStats = () => {
    if (blocks.length === 0) return;

    let totalTransactions = 0;
    let totalVolume = 0;
    const blockTimes = [];    blocks.forEach((block, index) => {
      try {
        const blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
        
        if (blockData.transactions && Array.isArray(blockData.transactions)) {
          totalTransactions += blockData.transactions.length;
          blockData.transactions.forEach(tx => {
            if (tx.amount && !isNaN(parseFloat(tx.amount))) {
              totalVolume += parseFloat(tx.amount);
            }
          });
        }
      } catch (parseError) {
        console.warn('Failed to parse block data:', parseError);
      }

      // Calculate block time differences
      if (index > 0) {
        const currentTime = parseFloat(block.timestamp);
        const previousTime = parseFloat(blocks[index - 1].timestamp);
        blockTimes.push(currentTime - previousTime);
      }
    });

    const averageBlockTime = blockTimes.length > 0 
      ? blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length
      : 0;

    setChainStats({
      totalBlocks: blocks.length,
      totalTransactions,
      totalVolume,
      averageBlockTime: Math.round(averageBlockTime)
    });
  };

  const toggleBlockExpansion = (blockIndex) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockIndex)) {
      newExpanded.delete(blockIndex);
    } else {
      newExpanded.add(blockIndex);
    }
    setExpandedBlocks(newExpanded);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(parseFloat(timestamp) * 1000).toLocaleString();
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const blockTime = parseFloat(timestamp) * 1000;
    const diffInSeconds = Math.floor((now - blockTime) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const BlockCard = ({ block }) => {
    const isExpanded = expandedBlocks.has(block.index);
    const blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
    const transactionCount = blockData.transactions ? blockData.transactions.length : 0;
    const proofOfWork = blockData['proof-of-work'] || 'N/A';

    return (
      <div className="glassmorphism rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
        {/* Block Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 font-bold">#{block.index}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Block {block.index}</h3>
              <p className="text-gray-400 text-sm">{formatTimeAgo(block.timestamp)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-semibold">{transactionCount} TX</p>
              <p className="text-gray-400 text-sm">Transactions</p>
            </div>
            <button
              onClick={() => toggleBlockExpansion(block.index)}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Block Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Block Hash</p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 font-mono text-xs">
                {block.hash.substring(0, 16)}...
              </span>
              <button
                onClick={() => copyToClipboard(block.hash, 'Block hash')}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Timestamp</p>
            <p className="text-gray-300">{formatTimestamp(block.timestamp)}</p>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Proof of Work</p>
            <p className="text-gray-300">{proofOfWork.toLocaleString()}</p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
            {/* Full Hash */}
            <div>
              <p className="text-gray-400 mb-2">Full Block Hash</p>
              <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-gray-300 break-all">
                {block.hash}
              </div>
            </div>

            {/* Block Data */}
            <div>
              <p className="text-gray-400 mb-2">Block Data</p>
              <div className="bg-black/30 rounded-lg p-3">
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(blockData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Transactions */}
            {blockData.transactions && blockData.transactions.length > 0 && (
              <div>
                <p className="text-gray-400 mb-2">Transactions ({blockData.transactions.length})</p>
                <div className="space-y-2">
                  {blockData.transactions.map((tx, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">From: </span>
                          <span className="text-gray-300 font-mono">
                            {tx.from === 'network' ? 'Network Reward' : 
                             tx.from ? `${tx.from.substring(0, 8)}...` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">To: </span>
                          <span className="text-gray-300 font-mono">
                            {tx.to ? `${tx.to.substring(0, 8)}...` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Amount: </span>
                          <span className="text-green-400 font-semibold">
                            {tx.amount} HCK
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">HackCoin Blockchain Explorer</h1>
        <p className="text-gray-400">Explore blocks, transactions, and network statistics</p>
      </div>

      {/* Chain Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glassmorphism rounded-xl p-6 text-center">
          <Database className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-1">{chainStats.totalBlocks}</h3>
          <p className="text-gray-400">Total Blocks</p>
        </div>
        
        <div className="glassmorphism rounded-xl p-6 text-center">
          <Users className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-1">{chainStats.totalTransactions}</h3>
          <p className="text-gray-400">Transactions</p>
        </div>
        
        <div className="glassmorphism rounded-xl p-6 text-center">
          <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-1">{chainStats.totalVolume.toFixed(2)}</h3>
          <p className="text-gray-400">Total Volume (HCK)</p>
        </div>
        
        <div className="glassmorphism rounded-xl p-6 text-center">
          <Clock className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-1">{chainStats.averageBlockTime}s</h3>
          <p className="text-gray-400">Avg Block Time</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search blocks by index, hash, or transaction data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {filteredBlocks.length > 0 ? (
          filteredBlocks.map((block) => (
            <BlockCard key={block.index} block={block} />
          ))
        ) : (
          <div className="glassmorphism rounded-xl p-12 text-center">
            <BlocksIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Blocks Found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search query'
                : 'The blockchain is empty or loading'
              }
            </p>
          </div>
        )}
      </div>

      {/* Load More / Pagination could be added here */}
      {filteredBlocks.length > 0 && (
        <div className="text-center">
          <p className="text-gray-400">
            Showing {filteredBlocks.length} of {blocks.length} blocks
          </p>
        </div>
      )}
    </div>
  );
};

export default Blockchain;
