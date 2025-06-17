import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Wallet, 
  Hammer, 
  ArrowRightLeft, 
  Database, 
  Coins,
  Zap
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/mining', label: 'Mining', icon: Hammer },
    { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
    { path: '/blockchain', label: 'Blockchain', icon: Database },
  ];

  return (
    <header className="glassmorphism border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Coins className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <Zap className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">HackCoin</h1>
              <p className="text-xs text-gray-400">Blockchain Network</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${location.pathname === path
                    ? 'bg-blue-500/20 text-blue-300 hack-glow'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${location.pathname === path
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
