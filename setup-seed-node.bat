@echo off
REM Production Seed Node Setup Script for Windows Server

echo 🌱 Setting up HackCoin Seed Node
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Please install Node.js first from: https://nodejs.org/
    pause
    exit /b 1
)

REM Clone HackCoin (if not already done)
if not exist "HackCoin" (
    git clone https://github.com/yourusername/HackCoin.git
    cd HackCoin
) else (
    cd HackCoin
)

REM Install dependencies
npm install
cd client
npm install
cd ..

REM Set environment variables for seed node
set HOST=0.0.0.0
set PORT=3001
set NODE_ENV=production

echo 🚀 Starting seed node...
echo This node will be accessible at: http://YOUR_PUBLIC_IP:3001

npm run dev

pause
