@echo off
title HackCoin Device 1 (P2P Peer Node)
echo ===============================================
echo    HackCoin Device 1 - First P2P Peer
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

:: Get local IP address
echo 🔍 Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "ip=%%a"
    goto :found_ip
)
:found_ip
set ip=%ip: =%
echo.
echo ✅ Your IP address appears to be: %ip%
echo.
echo 📝 Share this address with Device 2:
echo    SEED_PEER=http://%ip%:3001
echo.

:: Start the first P2P node
echo 🚀 Starting HackCoin P2P Node (First Peer)...
echo    • True decentralized networking (Bitcoin-style)
echo    • No central server required
echo    • Peer database: data/peers.json
echo.
echo    Access at: http://localhost:3001
echo    Network access: http://%ip%:3001
echo.
echo Press Ctrl+C to stop the node
echo.

set HOST=0.0.0.0
set PORT=3001
node server.js

pause
