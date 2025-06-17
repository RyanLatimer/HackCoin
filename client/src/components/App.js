import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './Header';
import Dashboard from './Dashboard';
import Wallet from './Wallet';
import Mining from './Mining';
import Transactions from './Transactions';
import Blockchain from './Blockchain';
import NetworkMonitor from './NetworkMonitor';
import { SocketProvider } from '../context/SocketContext';
import { WalletProvider } from '../context/WalletContext';

function App() {
  return (
    <SocketProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <Header />
            <main className="container mx-auto px-4 py-8">              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/mining" element={<Mining />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/blockchain" element={<Blockchain />} />
                <Route path="/network" element={<NetworkMonitor />} />
              </Routes>
            </main>
            
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </div>
        </Router>
      </WalletProvider>
    </SocketProvider>
  );
}

export default App;
