import React, { useState, useEffect, useCallback } from 'react';
import { 
  Hammer, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Zap,
  Cpu,
  Timer,
  Award,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useWallet } from '../context/WalletContext';
import { useSocket } from '../context/SocketContext';

const Mining = () => {
  const [isMining, setIsMining] = useState(false);
  const [miningStats, setMiningStats] = useState({
    hashRate: 0,
    blocksFound: 0,
    totalRewards: 0,
    currentDifficulty: 7919,
    estimatedTime: '∞',
    power: 'Low'
  });
  const [miningConfig, setMiningConfig] = useState({
    difficulty: 7919,
    threads: 1,
    intensity: 'medium',
    customDifficulty: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [miningProcess, setMiningProcess] = useState(null);
  const [logs, setLogs] = useState([]);
  const { address, balance, getBalance } = useWallet();
  const { socket } = useSocket();

  const addLog = useCallback((message, type = 'info') => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  }, []);

  const handleMiningUpdate = useCallback((data) => {
    setMiningStats(prev => ({
      ...prev,
      hashRate: data.hashRate,
      estimatedTime: data.estimatedTime,
      currentDifficulty: data.difficulty
    }));
    
    addLog(`Hash rate: ${data.hashRate} H/s`, 'info');
  }, [addLog]);
  const handleBlockFound = useCallback((data) => {
    setMiningStats(prev => ({
      ...prev,
      blocksFound: prev.blocksFound + 1,
      totalRewards: prev.totalRewards + 1
    }));
    
    addLog(`🎉 Block #${data.blockNumber} found! Reward: 1 HCK`, 'success');
    toast.success(`🎉 Block mined! You earned 1 HCK`);
    
    // Refresh wallet balance to reflect the mining reward
    setTimeout(() => {
      getBalance();
    }, 1000);
  }, [addLog, getBalance]);

  useEffect(() => {
    // Listen for mining updates via WebSocket
    if (socket) {
      socket.on('miningUpdate', handleMiningUpdate);
      socket.on('blockFound', handleBlockFound);
      return () => {
        socket.off('miningUpdate');
        socket.off('blockFound');
      };
    }
  }, [socket, handleMiningUpdate, handleBlockFound]);

  // Check mining status on component mount
  const checkMiningStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/mining/status');
      if (response.ok) {
        const status = await response.json();
        setIsMining(status.isActive);
        setMiningStats(prev => ({
          ...prev,
          hashRate: status.hashRate,
          currentDifficulty: status.difficulty,
          blocksFound: status.blocksFound
        }));
        
        if (status.isActive) {
          addLog('⚡ Mining session restored - mining is active', 'info');
        }
      }
    } catch (error) {
      console.error('Error checking mining status:', error);
    }
  }, [addLog]);

  useEffect(() => {
    checkMiningStatus();
    
    // Periodically sync mining status every 30 seconds
    const syncInterval = setInterval(() => {
      checkMiningStatus();
    }, 30000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [checkMiningStatus]);

  const startMining = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check if mining is already active on backend
    try {
      const statusResponse = await fetch('/api/mining/status');
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        if (status.isActive) {
          setIsMining(true);
          addLog('⚠️ Mining is already active on the server', 'warning');
          toast.warning('Mining is already running!');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking mining status before start:', error);
    }

    try {
      setIsMining(true);
      addLog('Starting mining process...', 'info');
      
      // Start mining via API
      const response = await fetch('/api/mining/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          minerAddress: address,
          difficulty: miningConfig.difficulty,
          threads: miningConfig.threads,
          intensity: miningConfig.intensity
        })
      });

      if (response.ok) {
        addLog('✅ Mining started successfully!', 'success');
        toast.success('🚀 Mining started!');
        
        // Start hash rate simulation (replace with real data in production)
        const interval = setInterval(() => {
          if (isMining) {
            const hashRate = Math.floor(Math.random() * 1000) + 500;
            setMiningStats(prev => ({
              ...prev,
              hashRate,
              estimatedTime: `${Math.floor(Math.random() * 30) + 5} min`
            }));
          }
        }, 2000);
          setMiningProcess(interval);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error && errorData.error.includes('already active')) {
          setIsMining(true);
          addLog('⚠️ Mining is already active on the server', 'warning');
          toast.warning('Mining is already running!');
          return;
        }
        throw new Error(errorData.error || 'Failed to start mining');
      }
    } catch (error) {
      setIsMining(false);
      addLog(`❌ Mining failed: ${error.message}`, 'error');
      toast.error('Failed to start mining: ' + error.message);
    }
  };

  const stopMining = async () => {
    try {
      setIsMining(false);
      addLog('Stopping mining process...', 'info');
      
      if (miningProcess) {
        clearInterval(miningProcess);
        setMiningProcess(null);
      }

      // Stop mining via API
      await fetch('/api/mining/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ minerAddress: address })
      });

      setMiningStats(prev => ({
        ...prev,
        hashRate: 0,
        estimatedTime: '∞'
      }));

      addLog('⏹️ Mining stopped', 'info');
      toast.info('Mining stopped');
    } catch (error) {
      addLog(`❌ Error stopping mining: ${error.message}`, 'error');
      toast.error('Error stopping mining: ' + error.message);
    }
  };

  const applySettings = () => {
    if (isMining) {
      toast.warn('Stop mining first to apply new settings');
      return;
    }

    setShowSettings(false);
    addLog(`⚙️ Settings updated - Difficulty: ${miningConfig.difficulty}, Threads: ${miningConfig.threads}`, 'info');
    toast.success('Mining settings updated!');
  };

  const getDifficultyPreset = (preset) => {
    const presets = {
      easy: 1000,
      medium: 7919,
      hard: 50000,
      extreme: 100000
    };
    return presets[preset] || 7919;
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
        {trend && (
          <div className={`text-${trend > 0 ? 'green' : 'red'}-400 text-sm flex items-center`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">HackCoin Mining</h1>
        <p className="text-gray-400">Mine HackCoin blocks and earn rewards</p>
      </div>

      {/* Wallet Check */}
      {!address && (
        <div className="glassmorphism rounded-xl p-6 border border-yellow-500/20">
          <div className="flex items-center space-x-3 text-yellow-400">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Wallet Required</h3>
              <p className="text-sm text-gray-400">Connect your wallet to start mining and receive rewards</p>
            </div>
          </div>
        </div>
      )}

      {/* Mining Control Panel */}
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">            <div className={`p-4 rounded-full ${isMining ? 'bg-green-500/20 mining-animation' : 'bg-gray-500/20'}`}>
              <Hammer className={`h-8 w-8 ${isMining ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isMining ? 'Mining Active' : 'Mining Idle'}
              </h2>
              <p className="text-gray-400">
                {isMining ? `Hash rate: ${miningStats.hashRate} H/s` : 'Click start to begin mining'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
            
            {isMining ? (
              <button
                onClick={stopMining}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop Mining
              </button>
            ) : (
              <button
                onClick={startMining}
                disabled={!address}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Mining
              </button>
            )}
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Difficulty</p>
            <p className="text-white font-semibold">{miningConfig.difficulty.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Threads</p>
            <p className="text-white font-semibold">{miningConfig.threads}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Intensity</p>
            <p className="text-white font-semibold capitalize">{miningConfig.intensity}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`font-semibold ${isMining ? 'text-green-400' : 'text-gray-400'}`}>
              {isMining ? 'Active' : 'Idle'}
            </p>
          </div>
        </div>
      </div>

      {/* Mining Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Hash Rate"
          value={`${miningStats.hashRate} H/s`}
          icon={Cpu}
          color="blue"
        />
        <StatCard
          title="Blocks Found"
          value={miningStats.blocksFound}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Total Rewards"
          value={`${miningStats.totalRewards} HCK`}
          icon={Zap}
          color="yellow"
        />
        <StatCard
          title="Est. Time"
          value={miningStats.estimatedTime}
          icon={Timer}
          color="purple"
        />
      </div>

      {/* Mining Logs */}
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Mining Logs
          </h3>
          <button
            onClick={() => setLogs([])}
            className="text-gray-400 hover:text-gray-300 transition-colors flex items-center text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Clear
          </button>
        </div>
        <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'error' ? 'text-red-400' :
                  'text-gray-300'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">
              No mining activity yet. Start mining to see logs here.
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Mining Settings</h3>
            
            <div className="space-y-4">
              {/* Difficulty Setting */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mining Difficulty
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {['easy', 'medium', 'hard', 'extreme'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setMiningConfig(prev => ({
                          ...prev,
                          difficulty: getDifficultyPreset(preset),
                          customDifficulty: false
                        }))}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          miningConfig.difficulty === getDifficultyPreset(preset)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        <br />
                        <span className="text-xs opacity-75">
                          {getDifficultyPreset(preset).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customDifficulty"
                      checked={miningConfig.customDifficulty}
                      onChange={(e) => setMiningConfig(prev => ({
                        ...prev,
                        customDifficulty: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <label htmlFor="customDifficulty" className="text-gray-300 text-sm">
                      Custom difficulty
                    </label>
                  </div>
                  
                  {miningConfig.customDifficulty && (
                    <input
                      type="number"
                      value={miningConfig.difficulty}
                      onChange={(e) => setMiningConfig(prev => ({
                        ...prev,
                        difficulty: parseInt(e.target.value) || 1
                      }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom difficulty..."
                      min="1"
                    />
                  )}
                </div>
              </div>

              {/* Thread Count */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Thread Count: {miningConfig.threads}
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={miningConfig.threads}
                  onChange={(e) => setMiningConfig(prev => ({
                    ...prev,
                    threads: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 Thread</span>
                  <span>8 Threads</span>
                </div>
              </div>

              {/* Mining Intensity */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Mining Intensity
                </label>
                <select
                  value={miningConfig.intensity}
                  onChange={(e) => setMiningConfig(prev => ({
                    ...prev,
                    intensity: e.target.value
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low - Battery Friendly</option>
                  <option value="medium">Medium - Balanced</option>
                  <option value="high">High - Maximum Performance</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={applySettings}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Apply Settings
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mining;
