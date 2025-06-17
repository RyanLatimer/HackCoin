import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  ExternalLink,
  Copy,
  Coins,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useWallet } from '../context/WalletContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, sent, received, pending
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount

  const { address } = useWallet();

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [transactions, searchTerm, filter, sortBy, address]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/blocks');
      const blocks = await response.json();
      
      if (blocks && Array.isArray(blocks)) {
        const allTransactions = [];        blocks.forEach(block => {
          try {
            const blockData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
            if (blockData.transactions && Array.isArray(blockData.transactions)) {
              blockData.transactions.forEach(tx => {
                if (tx.from && tx.to) { // Filter out mining rewards without proper from/to
                  allTransactions.push({
                    ...tx,
                    blockIndex: block.index,
                    blockHash: block.hash,
                    timestamp: block.timestamp,
                    status: 'confirmed'
                  });
                }
              });
            }
          } catch (parseError) {
            console.warn('Failed to parse block data:', parseError);
          }
        });
        
        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.blockHash.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filter !== 'all' && address) {
      switch (filter) {
        case 'sent':
          filtered = filtered.filter(tx => tx.from === address);
          break;
        case 'received':
          filtered = filtered.filter(tx => tx.to === address);
          break;
        case 'pending':
          filtered = filtered.filter(tx => tx.status === 'pending');
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp));
        break;
      case 'oldest':
        filtered.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp));
        break;
      case 'amount':
        filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        break;
    }

    setFilteredTransactions(filtered);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const getTransactionType = (tx) => {
    if (!address) return 'unknown';
    if (tx.from === address) return 'sent';
    if (tx.to === address) return 'received';
    return 'other';
  };

  const formatAddress = (addr) => {
    if (!addr || addr === 'network') return addr;
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(parseFloat(timestamp) * 1000).toLocaleString();
  };

  const TransactionCard = ({ transaction }) => {
    const type = getTransactionType(transaction);
    const isReward = transaction.from === 'network';
    
    return (
      <div className="glassmorphism rounded-lg p-4 hover:bg-white/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isReward ? 'bg-yellow-500/20' :
              type === 'sent' ? 'bg-red-500/20' :
              type === 'received' ? 'bg-green-500/20' :
              'bg-blue-500/20'
            }`}>
              {isReward ? (
                <Coins className={`h-5 w-5 text-yellow-400`} />
              ) : (
                <ArrowRightLeft className={`h-5 w-5 ${
                  type === 'sent' ? 'text-red-400' :
                  type === 'received' ? 'text-green-400' :
                  'text-blue-400'
                }`} />
              )}
            </div>
            <div>
              <h4 className="text-white font-semibold">
                {isReward ? 'Mining Reward' :
                 type === 'sent' ? 'Sent' :
                 type === 'received' ? 'Received' :
                 'Transaction'}
              </h4>
              <p className="text-gray-400 text-sm">
                Block #{transaction.blockIndex}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-lg font-bold ${
              isReward || type === 'received' ? 'text-green-400' : 'text-white'
            }`}>
              {(isReward || type === 'received') ? '+' : '-'}{transaction.amount} HCK
            </p>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">From</p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 font-mono">
                {transaction.from === 'network' ? 'Network Reward' : formatAddress(transaction.from)}
              </span>
              {transaction.from !== 'network' && (
                <button
                  onClick={() => copyToClipboard(transaction.from, 'Address')}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">To</p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 font-mono">
                {formatAddress(transaction.to)}
              </span>
              <button
                onClick={() => copyToClipboard(transaction.to, 'Address')}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatTimestamp(transaction.timestamp)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Block Hash:</span>
                <span className="font-mono">{transaction.blockHash.substring(0, 12)}...</span>
                <button
                  onClick={() => copyToClipboard(transaction.blockHash, 'Block hash')}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-gray-400">View all HackCoin network transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassmorphism rounded-xl p-6 text-center">
          <ArrowRightLeft className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-1">{transactions.length}</h3>
          <p className="text-gray-400">Total Transactions</p>
        </div>
        
        {address && (
          <>
            <div className="glassmorphism rounded-xl p-6 text-center">
              <User className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">
                {transactions.filter(tx => tx.to === address).length}
              </h3>
              <p className="text-gray-400">Received</p>
            </div>
            
            <div className="glassmorphism rounded-xl p-6 text-center">
              <User className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-1">
                {transactions.filter(tx => tx.from === address).length}
              </h3>
              <p className="text-gray-400">Sent</p>
            </div>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address or block hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Transactions</option>
              {address && (
                <>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                </>
              )}
              <option value="pending">Pending</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, index) => (
            <TransactionCard key={`${tx.blockHash}-${index}`} transaction={tx} />
          ))
        ) : (
          <div className="glassmorphism rounded-xl p-12 text-center">
            <ArrowRightLeft className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter settings'
                : 'No transactions have been processed yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
