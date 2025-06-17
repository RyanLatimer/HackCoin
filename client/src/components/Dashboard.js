import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Activity,
  Zap,
  Shield,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useWallet } from '../context/WalletContext';

const Dashboard = () => {
  const [networkStats, setNetworkStats] = useState({
    totalBlocks: 0,
    totalTransactions: 0,
    hashRate: '0 H/s',
    difficulty: 7919,
    networkNodes: 1
  });
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();
  const { balance, address } = useWallet();

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNetworkData = async () => {
    try {
      const response = await fetch('/api/blocks');
      const blocks = await response.json();
      
      if (blocks && Array.isArray(blocks)) {        setNetworkStats(prev => ({
          ...prev,
          totalBlocks: blocks.length,
          totalTransactions: blocks.reduce((acc, block) => {
            try {
              const blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
              return acc + (blockData.transactions ? blockData.transactions.length : 0);
            } catch (parseError) {
              console.warn('Failed to parse block data:', parseError);
              return acc + (block.transactions ? block.transactions.length : 0);
            }
          }, 0)
        }));
        
        setRecentBlocks(blocks.slice(-5).reverse());
      }
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <div className="glassmorphism rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
        {trend && (
          <div className="flex items-center text-green-400 text-sm">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );
  const BlockCard = ({ block, index }) => {
    let blockData, transactionCount;
    try {
      blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
      transactionCount = blockData.transactions ? blockData.transactions.length : 0;
    } catch (parseError) {
      console.warn('Failed to parse block data:', parseError);
      blockData = { transactions: [] };
      transactionCount = block.transactions ? block.transactions.length : 0;
    }
    const timeAgo = new Date(parseInt(block.timestamp) * 1000).toLocaleString();

    return (
      <div className="glassmorphism rounded-lg p-4 hover:bg-white/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">#{block.index}</span>
            </div>
            <div>
              <h4 className="text-white font-semibold">Block {block.index}</h4>
              <p className="text-gray-400 text-xs">{timeAgo}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-semibold">{transactionCount} TX</p>
            <p className="text-gray-400 text-xs">Transactions</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-3">
          <p className="text-gray-400 text-xs font-mono">
            Hash: {block.hash.substring(0, 20)}...
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading HackCoin Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
          Welcome to HackCoin
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          A modern blockchain cryptocurrency platform with advanced mining capabilities and secure wallet management.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-semibold">Secure</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full">
            <Zap className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Fast</span>
          </div>
          <div className="flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full">
            <Activity className="h-5 w-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Decentralized</span>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Blocks"
          value={networkStats.totalBlocks.toLocaleString()}
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="Total Transactions"
          value={networkStats.totalTransactions.toLocaleString()}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Network Nodes"
          value={networkStats.networkNodes}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Mining Difficulty"
          value={networkStats.difficulty.toLocaleString()}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Wallet Balance (if wallet connected) */}
      {address && (
        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Wallet</h2>
            <div className="flex items-center space-x-2 text-green-400">
              <Coins className="h-5 w-5" />
              <span className="font-bold">{balance} HCK</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm font-mono">
            Address: {address.substring(0, 20)}...
          </p>
        </div>
      )}

      {/* Recent Blocks */}
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Blocks
          </h2>
          <span className="text-gray-400 text-sm">Live Updates</span>
        </div>
        <div className="space-y-4">
          {recentBlocks.length > 0 ? (
            recentBlocks.map((block, index) => (
              <BlockCard key={block.index} block={block} index={index} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No recent blocks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
