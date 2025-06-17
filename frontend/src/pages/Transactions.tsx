import React, { useState, useEffect } from 'react';
import { apiService, Transaction } from '../services/api';

const Transactions: React.FC = () => {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      const [txHistory, walletInfo] = await Promise.all([
        apiService.getTransactionHistory(),
        apiService.getWalletInfo()
      ]);
      
      setTransactions(txHistory);
      setBalance(walletInfo.balance);
    } catch (error) {
      console.error('Error loading transaction data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      alert('Insufficient balance');
      return;
    }

    setIsLoading(true);
    
    try {
      const transaction: Transaction = {
        from: '', // Will be filled by backend with wallet address
        to: recipient,
        amount: amountNum,
        timestamp: Date.now()
      };

      const success = await apiService.sendTransaction(transaction);
      
      if (success) {
        alert('Transaction sent successfully!');
        setRecipient('');
        setAmount('');
        loadTransactionData(); // Refresh the data
      } else {
        alert('Failed to send transaction');
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Error sending transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transactions-page">
      <h2>Send Transaction</h2>
      
      <div className="balance-display">
        <strong>Available Balance: {balance} HCK</strong>
      </div>
      
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient's wallet address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (HCK):</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max={balance}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Transaction'}
        </button>
      </form>
      
      <div className="transaction-history">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((tx, index) => (
              <div key={index} className="transaction-item">
                <div className="tx-details">
                  <span className="tx-type">
                    {tx.from === 'coinbase' ? '🎁 Mined' : '💸 Sent'}
                  </span>
                  <span className="tx-amount">{tx.amount} HCK</span>
                </div>
                <div className="tx-addresses">
                  <div>From: {tx.from === 'coinbase' ? 'Mining Reward' : tx.from}</div>
                  <div>To: {tx.to}</div>
                </div>
                <div className="tx-time">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
