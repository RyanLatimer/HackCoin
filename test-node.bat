@echo off
echo ========================================
echo   HackCoin Network - Quick Test Script
echo ========================================
echo.

echo 🚀 Building project...
call npm run compile
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 🌐 Starting HackCoin Node...
echo.
echo Configuration:
echo   Network: LOCAL
echo   HTTP Port: 3001 (Web Interface)
echo   P2P Port: 6001 (Blockchain Network)
echo.
echo 📱 Web Interface: http://localhost:3001
echo 🔗 API Status: http://localhost:3001/api/health
echo 💰 Mining: http://localhost:3001/api/mine/start (POST)
echo.

set NETWORK_TYPE=LOCAL
set HTTP_PORT=3001
set P2P_PORT=6001
set NODE_NAME=TestNode

echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

node global-node.js
