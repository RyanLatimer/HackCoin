import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Code, Play, Eye, Zap, FileText, Coins } from 'lucide-react';

const SmartContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [exampleContracts, setExampleContracts] = useState({});
  const [selectedContract, setSelectedContract] = useState(null);
  const [activeTab, setActiveTab] = useState('deploy');
  
  // Deploy form state
  const [deployForm, setDeployForm] = useState({
    deployerAddress: '',
    contractCode: '',
    initData: '{}',
    gasLimit: 100000
  });

  // Execute form state
  const [executeForm, setExecuteForm] = useState({
    callerAddress: '',
    contractAddress: '',
    functionName: '',
    parameters: '{}',
    value: 0,
    gasLimit: 50000
  });

  // Call form state
  const [callForm, setCallForm] = useState({
    contractAddress: '',
    functionName: '',
    parameters: '{}'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchContracts();
    fetchExampleContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      
      if (data.success) {
        setContracts(data.contracts);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    }
  };

  const fetchExampleContracts = async () => {
    try {
      const response = await fetch('/api/contracts/examples');
      const data = await response.json();
      
      if (data.success) {
        setExampleContracts(data.examples);
      }
    } catch (error) {
      console.error('Failed to fetch example contracts:', error);
    }
  };

  const deployContract = async () => {
    if (!deployForm.deployerAddress || !deployForm.contractCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let initData = {};
      try {
        initData = JSON.parse(deployForm.initData);
      } catch (e) {
        toast.error('Invalid init data JSON');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/contracts/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployerAddress: deployForm.deployerAddress,
          contractCode: deployForm.contractCode,
          initData: initData,
          gasLimit: deployForm.gasLimit
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Contract deployed at: ${data.contractAddress}`);
        setResult(data);
        fetchContracts();
      } else {
        toast.error(data.error || 'Deployment failed');
        setResult(data);
      }
    } catch (error) {
      toast.error('Failed to deploy contract');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const executeContract = async () => {
    if (!executeForm.callerAddress || !executeForm.contractAddress || !executeForm.functionName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let parameters = {};
      try {
        parameters = JSON.parse(executeForm.parameters);
      } catch (e) {
        toast.error('Invalid parameters JSON');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/contracts/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerAddress: executeForm.callerAddress,
          contractAddress: executeForm.contractAddress,
          functionName: executeForm.functionName,
          parameters: parameters,
          value: executeForm.value,
          gasLimit: executeForm.gasLimit
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Contract executed successfully');
        setResult(data);
      } else {
        toast.error(data.error || 'Execution failed');
        setResult(data);
      }
    } catch (error) {
      toast.error('Failed to execute contract');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const callContract = async () => {
    if (!callForm.contractAddress || !callForm.functionName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let parameters = {};
      try {
        parameters = JSON.parse(callForm.parameters);
      } catch (e) {
        toast.error('Invalid parameters JSON');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/contracts/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: callForm.contractAddress,
          functionName: callForm.functionName,
          parameters: parameters
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast.success('Contract called successfully');
      } else {
        toast.warning(data.error || 'Call failed');
      }
    } catch (error) {
      toast.error('Failed to call contract');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadExampleContract = (exampleKey) => {
    const example = exampleContracts[exampleKey];
    if (example) {
      setDeployForm(prev => ({
        ...prev,
        contractCode: example.code
      }));
      setActiveTab('deploy');
      toast.info(`Loaded ${example.name}`);
    }
  };

  const tabs = [
    { id: 'deploy', label: 'Deploy', icon: Zap },
    { id: 'execute', label: 'Execute', icon: Play },
    { id: 'call', label: 'Call', icon: Eye },
    { id: 'contracts', label: 'Contracts', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Code className="text-blue-400" />
          Smart Contracts
          <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
            Beta
          </span>
        </h1>
        <p className="text-gray-300 mt-2">
          Deploy and interact with smart contracts on the HackCoin blockchain
        </p>
      </div>

      {/* Example Contracts */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">📚 Example Contracts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(exampleContracts).map(([key, example]) => (
            <div
              key={key}
              className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => loadExampleContract(key)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Coins className="text-yellow-400 w-5 h-5" />
                <h3 className="font-semibold text-white">{example.name}</h3>
              </div>
              <p className="text-sm text-gray-300">{example.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="flex border-b border-white/10">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 transition-colors ${
                activeTab === id
                  ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Deploy Tab */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Deploy Contract</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deployer Address *
                </label>
                <input
                  type="text"
                  value={deployForm.deployerAddress}
                  onChange={(e) => setDeployForm(prev => ({ ...prev, deployerAddress: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Code *
                </label>
                <textarea
                  value={deployForm.contractCode}
                  onChange={(e) => setDeployForm(prev => ({ ...prev, contractCode: e.target.value }))}
                  className="w-full h-40 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 font-mono text-sm"
                  placeholder="Enter your contract code here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Init Data (JSON)
                  </label>
                  <textarea
                    value={deployForm.initData}
                    onChange={(e) => setDeployForm(prev => ({ ...prev, initData: e.target.value }))}
                    className="w-full h-20 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 font-mono text-sm"
                    placeholder='{"key": "value"}'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gas Limit
                  </label>
                  <input
                    type="number"
                    value={deployForm.gasLimit}
                    onChange={(e) => setDeployForm(prev => ({ ...prev, gasLimit: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <button
                onClick={deployContract}
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Deploying...' : 'Deploy Contract'}
              </button>
            </div>
          )}

          {/* Execute Tab */}
          {activeTab === 'execute' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Execute Contract Function</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Caller Address *
                  </label>
                  <input
                    type="text"
                    value={executeForm.callerAddress}
                    onChange={(e) => setExecuteForm(prev => ({ ...prev, callerAddress: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract Address *
                  </label>
                  <input
                    type="text"
                    value={executeForm.contractAddress}
                    onChange={(e) => setExecuteForm(prev => ({ ...prev, contractAddress: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Function Name *
                  </label>
                  <input
                    type="text"
                    value={executeForm.functionName}
                    onChange={(e) => setExecuteForm(prev => ({ ...prev, functionName: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="functionName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value (HCK)
                  </label>
                  <input
                    type="number"
                    value={executeForm.value}
                    onChange={(e) => setExecuteForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gas Limit
                  </label>
                  <input
                    type="number"
                    value={executeForm.gasLimit}
                    onChange={(e) => setExecuteForm(prev => ({ ...prev, gasLimit: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parameters (JSON)
                </label>
                <textarea
                  value={executeForm.parameters}
                  onChange={(e) => setExecuteForm(prev => ({ ...prev, parameters: e.target.value }))}
                  className="w-full h-20 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 font-mono text-sm"
                  placeholder='{"param1": "value1", "param2": 123}'
                />
              </div>

              <button
                onClick={executeContract}
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Executing...' : 'Execute Function'}
              </button>
            </div>
          )}

          {/* Call Tab */}
          {activeTab === 'call' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Call Contract Function (Read-Only)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract Address *
                  </label>
                  <input
                    type="text"
                    value={callForm.contractAddress}
                    onChange={(e) => setCallForm(prev => ({ ...prev, contractAddress: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Function Name *
                  </label>
                  <input
                    type="text"
                    value={callForm.functionName}
                    onChange={(e) => setCallForm(prev => ({ ...prev, functionName: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="functionName"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parameters (JSON)
                </label>
                <textarea
                  value={callForm.parameters}
                  onChange={(e) => setCallForm(prev => ({ ...prev, parameters: e.target.value }))}
                  className="w-full h-20 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 font-mono text-sm"
                  placeholder='{"param1": "value1"}'
                />
              </div>

              <button
                onClick={callContract}
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Calling...' : 'Call Function'}
              </button>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Deployed Contracts</h3>
                <button
                  onClick={fetchContracts}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {contracts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No contracts deployed yet. Deploy your first contract!
                </div>
              ) : (
                <div className="space-y-3">
                  {contracts.map((contract, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-sm text-blue-300">
                          {contract.address}
                        </div>
                        <div className="text-sm text-gray-400">
                          Balance: {contract.balance} HCK
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        Owner: <span className="font-mono">{contract.owner}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Created: {new Date(contract.createdAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300">
                        Storage Size: {contract.storageSize} items
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Result</h3>
          <pre className="bg-black/20 rounded-lg p-4 text-sm text-green-300 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SmartContracts;
