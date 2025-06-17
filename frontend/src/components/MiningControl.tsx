import React, { useState, useEffect } from 'react';
import './MiningControl.css';

interface MiningStatus {
  status: string;
  hashRate: number;
  intensity: number;
  threads: number;
  blocksFound: number;
  runtime: number;
  efficiency: number;
  cpuUsage: number;
}

interface MiningConfig {
  intensity: number;
  threads: number;
  maxThreads: number;
  recommendedIntensity: number;
  cpuModel: string;
  mining: boolean;
}

export const MiningControl: React.FC = () => {
  const [status, setStatus] = useState<MiningStatus | null>(null);
  const [config, setConfig] = useState<MiningConfig | null>(null);
  const [intensitySlider, setIntensitySlider] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMiningData();
    const interval = setInterval(fetchMiningData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchMiningData = async () => {
    try {
      const [statusRes, configRes] = await Promise.all([
        fetch('/api/mine/status'),
        fetch('/api/mine/config')
      ]);
      
      const statusData = await statusRes.json();
      const configData = await configRes.json();
      
      setStatus(statusData);
      setConfig(configData);
      setIntensitySlider(configData.intensity);
    } catch (error) {
      console.error('Error fetching mining data:', error);
    }
  };

  const handleStartMining = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mine/start', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        await fetchMiningData();
      }
    } catch (error) {
      console.error('Error starting mining:', error);
    }
    setIsLoading(false);
  };

  const handleStopMining = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mine/stop', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        await fetchMiningData();
      }
    } catch (error) {
      console.error('Error stopping mining:', error);
    }
    setIsLoading(false);
  };

  const handleIntensityChange = async (newIntensity: number) => {
    try {
      const response = await fetch('/api/mine/intensity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity: newIntensity })
      });
      
      if (response.ok) {
        setIntensitySlider(newIntensity);
        await fetchMiningData();
      }
    } catch (error) {
      console.error('Error updating intensity:', error);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity < 25) return '#4CAF50'; // Green
    if (intensity < 50) return '#FF9800'; // Orange
    if (intensity < 75) return '#FF5722'; // Red-Orange
    return '#F44336'; // Red
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity < 25) return 'Eco';
    if (intensity < 50) return 'Balanced';
    if (intensity < 75) return 'Performance';
    return 'Maximum';
  };

  if (!status || !config) {
    return <div className="mining-control loading">Loading mining controls...</div>;
  }

  return (
    <div className="mining-control">
      <div className="mining-header">
        <h2>⚡ Advanced Mining Control</h2>
        <div className="mining-status">
          <span className={`status-indicator ${status.status}`}>
            {status.status === 'mining' ? '🟢 Mining' : '🔴 Idle'}
          </span>
        </div>
      </div>

      <div className="system-info">
        <h3>💻 System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>CPU:</label>
            <span>{config.cpuModel}</span>
          </div>
          <div className="info-item">
            <label>Cores:</label>
            <span>{config.maxThreads}</span>
          </div>
          <div className="info-item">
            <label>Recommended:</label>
            <span>{config.recommendedIntensity}% intensity</span>
          </div>
        </div>
      </div>

      <div className="intensity-control">
        <h3>🎛️ Mining Intensity</h3>
        <div className="intensity-slider-container">
          <div className="intensity-labels">
            <span>0%</span>
            <span className="current-intensity" style={{ color: getIntensityColor(intensitySlider) }}>
              {intensitySlider}% ({getIntensityLabel(intensitySlider)})
            </span>
            <span>100%</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={intensitySlider}
            onChange={(e) => setIntensitySlider(parseInt(e.target.value))}
            onMouseUp={(e) => handleIntensityChange(parseInt((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleIntensityChange(parseInt((e.target as HTMLInputElement).value))}
            className="intensity-slider"
            style={{
              background: `linear-gradient(to right, #4CAF50 0%, #FF9800 25%, #FF5722 75%, #F44336 100%)`
            }}
            disabled={isLoading}
          />
          
          <div className="intensity-presets">
            <button onClick={() => handleIntensityChange(25)} className="preset-btn eco">
              🌱 Eco (25%)
            </button>
            <button onClick={() => handleIntensityChange(50)} className="preset-btn balanced">
              ⚖️ Balanced (50%)
            </button>
            <button onClick={() => handleIntensityChange(75)} className="preset-btn performance">
              🚀 Performance (75%)
            </button>
            <button onClick={() => handleIntensityChange(100)} className="preset-btn maximum">
              🔥 Maximum (100%)
            </button>
          </div>
        </div>
      </div>

      <div className="mining-stats">
        <h3>📊 Performance Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{status.hashRate.toLocaleString()}</div>
            <div className="stat-label">Hashes/sec</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{status.threads}</div>
            <div className="stat-label">Active Threads</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{status.blocksFound}</div>
            <div className="stat-label">Blocks Mined</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(status.cpuUsage)}%</div>
            <div className="stat-label">CPU Usage</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.floor(status.runtime / 60)}m</div>
            <div className="stat-label">Runtime</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{status.efficiency.toFixed(2)}</div>
            <div className="stat-label">Blocks/min</div>
          </div>
        </div>
      </div>

      <div className="mining-controls">
        <button
          onClick={status.status === 'mining' ? handleStopMining : handleStartMining}
          disabled={isLoading}
          className={`mining-button ${status.status === 'mining' ? 'stop' : 'start'}`}
        >
          {isLoading ? '⏳ Please wait...' : 
           status.status === 'mining' ? '⏹️ Stop Mining' : '▶️ Start Mining'}
        </button>
      </div>

      <div className="mining-tips">
        <h4>💡 Optimization Tips:</h4>
        <ul>
          <li><strong>Eco Mode (0-25%):</strong> Light mining, minimal CPU usage</li>
          <li><strong>Balanced (25-50%):</strong> Good performance with reasonable CPU usage</li>
          <li><strong>Performance (50-75%):</strong> High hash rate, higher CPU usage</li>
          <li><strong>Maximum (75-100%):</strong> Maximum hash rate, intensive CPU usage</li>
        </ul>
        <div className="performance-indicator">
          <span className="indicator-label">Current Performance:</span>
          <div className="performance-bar">
            <div 
              className="performance-fill" 
              style={{ 
                width: `${Math.min(100, (status.hashRate / 50000) * 100)}%`,
                backgroundColor: getIntensityColor(status.intensity)
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
