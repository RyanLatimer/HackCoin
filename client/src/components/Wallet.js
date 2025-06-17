import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, 
  Plus, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Copy, 
  Send,
  RefreshCw,
  Key,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useWallet } from '../context/WalletContext';

const Wallet = () => {
  const {
    address,
    balance,
    privateKey,
    createWallet,
    importWallet,
    getBalance,
    sendTransaction
  } = useWallet();

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: ''
  });

  useEffect(() => {
    if (address) {
      getBalance();
      const interval = setInterval(getBalance, 10000); // Update balance every 10 seconds
      return () => clearInterval(interval);
    }
  }, [address, getBalance]);

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      await createWallet();
      toast.success('🎉 New wallet created successfully!');
    } catch (error) {
      toast.error('Failed to create wallet: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importKey.trim()) {
      toast.error('Please enter a private key');
      return;
    }
    
    try {
      await importWallet(importKey.trim());
      setShowImportForm(false);
      setImportKey('');
      toast.success('✅ Wallet imported successfully!');
    } catch (error) {
      toast.error('Failed to import wallet: ' + error.message);
    }
  };

  const handleSendTransaction = async () => {
    if (!sendForm.recipient.trim() || !sendForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(sendForm.amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await sendTransaction(sendForm.recipient, parseFloat(sendForm.amount));
      setSendForm({ recipient: '', amount: '' });
      setShowSendForm(false);
      toast.success('💸 Transaction sent successfully!');
    } catch (error) {
      toast.error('Failed to send transaction: ' + error.message);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const downloadWallet = () => {
    if (!address || !privateKey) return;
    
    const walletData = {
      address,
      privateKey,
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hackcoin-wallet-${address.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📄 Wallet backup downloaded!');
  };

  // No wallet connected
  if (!address) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <WalletIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">HackCoin Wallet</h1>
          <p className="text-gray-400">Create a new wallet or import an existing one to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Wallet */}
          <div className="glassmorphism rounded-xl p-8 text-center">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Create New Wallet</h3>
            <p className="text-gray-400 mb-6">
              Generate a brand new HackCoin wallet with a secure private key
            </p>
            <button
              onClick={handleCreateWallet}
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Wallet
                </>
              )}
            </button>
          </div>

          {/* Import Existing Wallet */}
          <div className="glassmorphism rounded-xl p-8 text-center">
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Import Wallet</h3>
            <p className="text-gray-400 mb-6">
              Import an existing wallet using your private key
            </p>
            <button
              onClick={() => setShowImportForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Wallet
            </button>
          </div>
        </div>

        {/* Import Form Modal */}
        {showImportForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glassmorphism rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Import Wallet</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Private Key
                  </label>
                  <textarea
                    value={importKey}
                    onChange={(e) => setImportKey(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your private key here..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Never share your private key with anyone!</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleImportWallet}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => {
                      setShowImportForm(false);
                      setImportKey('');
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Wallet connected
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wallet Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Your HackCoin Wallet</h1>
        <p className="text-gray-400">Manage your HackCoin transactions and balance</p>
      </div>

      {/* Balance Card */}
      <div className="glassmorphism rounded-xl p-8 text-center">
        <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <WalletIcon className="h-10 w-10 text-blue-400" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">{balance} HCK</h2>
        <p className="text-gray-400 mb-6">Current Balance</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setShowSendForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </button>
          <button
            onClick={getBalance}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={downloadWallet}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </button>
        </div>
      </div>

      {/* Wallet Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Address */}
        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Wallet Address
            </h3>
            <button
              onClick={() => copyToClipboard(address, 'Address')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-gray-300 font-mono text-sm break-all bg-white/5 p-3 rounded-lg">
            {address}
          </p>
        </div>

        {/* Private Key */}
        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Private Key
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {showPrivateKey && (
                <button
                  onClick={() => copyToClipboard(privateKey, 'Private key')}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="text-gray-300 font-mono text-sm break-all bg-white/5 p-3 rounded-lg">
            {showPrivateKey ? privateKey : '•'.repeat(64)}
          </div>
          {!showPrivateKey && (
            <div className="flex items-center space-x-2 text-yellow-400 text-xs mt-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Click the eye icon to reveal private key</span>
            </div>
          )}
        </div>
      </div>

      {/* Send Transaction Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Send HackCoin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={sendForm.recipient}
                  onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter recipient address..."
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount (HCK)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  max={balance}
                />
                <p className="text-gray-400 text-sm mt-1">
                  Available: {balance} HCK
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSendTransaction}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setShowSendForm(false);
                    setSendForm({ recipient: '', amount: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
