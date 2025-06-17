import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { toast } from 'react-toastify';

const NetworkMonitor = () => {
  const socket = useContext(SocketContext);
  const [networkStats, setNetworkStats] = useState({
    connectedPeers: 0,
    knownNodes: 0,
    networkHealth: 0,
    peers: []
  });
  
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    lastSyncTime: 0,
    blockchainHeight: 0
  });

  const [consensusStats, setConsensusStats] = useState({
    currentDifficulty: 0,
    transactionPoolSize: 0,
    networkHashRate: 0,
    averageBlockTime: 0
  });

  const [bootstrapNode, setBootstrapNode] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Fetch initial network status
    fetchNetworkStatus();

    // Socket event listeners
    socket.on('peerConnected', (peerInfo) => {
      toast.success(`🌐 Peer connected: ${peerInfo.url}`);
      fetchNetworkStatus();
    });

    socket.on('peerDisconnected', (peerInfo) => {
      toast.warning(`🔌 Peer disconnected: ${peerInfo.url}`);
      fetchNetworkStatus();
    });

    socket.on('networkStatus', (status) => {
      setNetworkStats(status);
    });

    socket.on('syncStarted', () => {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      toast.info('🔄 Blockchain synchronization started');
    });

    socket.on('syncCompleted', (data) => {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSyncTime: Date.now(),
        blockchainHeight: data.blockCount
      }));
      
      if (data.updated) {
        toast.success(`✅ Blockchain synchronized: ${data.blockCount} blocks`);
      }
    });

    socket.on('difficultyAdjusted', (data) => {
      toast.info(`🎯 Difficulty adjusted: ${data.oldDifficulty} → ${data.newDifficulty}`);
      setConsensusStats(prev => ({ ...prev, currentDifficulty: data.newDifficulty }));
    });

    // Cleanup
    return () => {
      socket.off('peerConnected');
      socket.off('peerDisconnected');
      socket.off('networkStatus');
      socket.off('syncStarted');
      socket.off('syncCompleted');
      socket.off('difficultyAdjusted');
    };
  }, [socket]);

  const fetchNetworkStatus = async () => {
    try {
      const response = await fetch('/api/network/status');
      const data = await response.json();
      
      setNetworkStats(data.network);
      setSyncStatus(data.sync);
      setConsensusStats(data.consensus);
    } catch (error) {
      console.error('Failed to fetch network status:', error);
    }
  };

  const connectToPeer = async () => {
    if (!bootstrapNode.trim()) {
      toast.error('Please enter a valid peer URL');
      return;
    }

    try {
      const response = await fetch('/api/network/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerUrl: bootstrapNode })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Connected to peer: ${bootstrapNode}`);
        setBootstrapNode('');
        fetchNetworkStatus();
      } else {
        toast.error(data.error || 'Failed to connect to peer');
      }
    } catch (error) {
      toast.error('Failed to connect to peer');
    }
  };

  const triggerSync = async () => {
    try {
      const response = await fetch('/api/blockchain/sync', { method: 'POST' });
      const data = await response.json();
      
      toast.info('🔄 Manual sync triggered');
    } catch (error) {
      toast.error('Failed to trigger sync');
    }
  };

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    if (health >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBackground = (health) => {
    if (health >= 80) return 'bg-green-400';
    if (health >= 60) return 'bg-yellow-400';
    if (health >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatHashRate = (hashRate) => {
    if (hashRate >= 1000000) return (hashRate / 1000000).toFixed(2) + ' MH/s';
    if (hashRate >= 1000) return (hashRate / 1000).toFixed(2) + ' KH/s';
    return hashRate.toFixed(2) + ' H/s';
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white flex items-center mb-4">
          🌐 Network Monitor
          <span className={`ml-3 h-3 w-3 rounded-full ${networkStats.connectedPeers > 0 ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{networkStats.connectedPeers}</div>
            <div className="text-sm text-gray-300">Connected Peers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{networkStats.knownNodes}</div>
            <div className="text-sm text-gray-300">Known Nodes</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getHealthColor(networkStats.networkHealth)}`}>
              {networkStats.networkHealth}%
            </div>
            <div className="text-sm text-gray-300">Network Health</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{syncStatus.blockchainHeight}</div>
            <div className="text-sm text-gray-300">Blockchain Height</div>
          </div>
        </div>

        {/* Network Health Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Network Health</span>
            <span>{networkStats.networkHealth}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getHealthBackground(networkStats.networkHealth)}`}
              style={{ width: `${networkStats.networkHealth}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Consensus Statistics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🎯 Consensus Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-300">Current Difficulty</div>
            <div className="text-lg font-bold text-yellow-400">{consensusStats.currentDifficulty}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-300">Transaction Pool</div>
            <div className="text-lg font-bold text-blue-400">{consensusStats.transactionPoolSize}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-300">Network Hash Rate</div>
            <div className="text-lg font-bold text-green-400">
              {formatHashRate(consensusStats.networkHashRate)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-300">Avg Block Time</div>
            <div className="text-lg font-bold text-purple-400">
              {Math.round(consensusStats.averageBlockTime / 1000)}s
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔄 Synchronization Status</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Status</div>
            <div className={`text-lg font-bold ${syncStatus.isSyncing ? 'text-yellow-400' : 'text-green-400'}`}>
              {syncStatus.isSyncing ? 'Syncing...' : 'Synchronized'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-300">Last Sync</div>
            <div className="text-lg font-bold text-blue-400">
              {formatTime(syncStatus.lastSyncTime)}
            </div>
          </div>
          <button
            onClick={triggerSync}
            disabled={syncStatus.isSyncing}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {syncStatus.isSyncing ? 'Syncing...' : 'Manual Sync'}
          </button>
        </div>
      </div>

      {/* Connected Peers */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔗 Connected Peers</h3>
        
        {networkStats.peers && networkStats.peers.length > 0 ? (
          <div className="space-y-3">
            {networkStats.peers.map((peer, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{peer.url}</div>
                  <div className="text-sm text-gray-300">
                    Node ID: {peer.nodeId?.substring(0, 16)}...
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${peer.status === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                    {peer.status}
                  </div>
                  <div className="text-xs text-gray-400">
                    Height: {peer.blockHeight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No peers connected. Add bootstrap nodes to join the network.
          </div>
        )}
      </div>

      {/* Connect to Peer */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔌 Connect to Peer</h3>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={bootstrapNode}
            onChange={(e) => setBootstrapNode(e.target.value)}
            placeholder="http://peer-ip:port"
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={connectToPeer}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Connect
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-400">
          Enter the URL of a HackCoin node to connect to the network
        </div>
      </div>
    </div>
  );
};

export default NetworkMonitor;
