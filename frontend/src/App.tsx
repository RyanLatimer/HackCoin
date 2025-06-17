import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Mining from './pages/Mining';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Explorer from './pages/Explorer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1>HackCoin Wallet</h1>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/mining">Mining</Link></li>
            <li><Link to="/transactions">Transactions</Link></li>
            <li><Link to="/wallet">Wallet</Link></li>
            <li><Link to="/explorer">Explorer</Link></li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mining" element={<Mining />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/explorer" element={<Explorer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
