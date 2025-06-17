@echo off
title HackCoin Device 2 (P2P Peer Node)
echo ===============================================
echo      HackCoin Device 2 - P2P Peer Node
echo ===============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm run install-all
)

:: Get Device 1 IP address from user
echo 🔗 Connect to First P2P Peer (Device 1)
echo.
echo This is a one-time setup. After connection, both nodes
echo will discover each other automatically via gossip protocol.
echo.
set /p DEVICE1_IP="Enter Device 1 IP address (e.g., 192.168.1.100): "

if "%DEVICE1_IP%"=="" (
    echo ❌ IP address is required!
    pause
    exit /b 1
)

:: Validate IP format (basic check)
echo %DEVICE1_IP% | findstr /R "^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*$" >nul
if %errorlevel% neq 0 (
    echo ⚠️  Warning: IP address format may be incorrect
)

echo.
echo � Seeding initial peer: %DEVICE1_IP%:3001
echo.

:: Start the peer node
echo 🚀 Starting HackCoin P2P Node (Second Peer)...
echo    • True decentralized networking (Bitcoin-style)
echo    • Automatic peer discovery via gossip protocol
echo    • Peer database: data/peers.json
echo.
echo    Access at: http://localhost:3002
echo    Initial seed: http://%DEVICE1_IP%:3001
echo.
echo Press Ctrl+C to stop the node
echo.

set HOST=0.0.0.0
set PORT=3002
set SEED_PEER=http://%DEVICE1_IP%:3001
node server.js

pause
