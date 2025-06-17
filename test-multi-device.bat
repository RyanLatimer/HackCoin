@echo off
echo ============================================
echo   HackCoin Multi-Device Communication Test
echo ============================================
echo.

echo This script will test multi-device communication by:
echo 1. Starting Node1 (Host) on ports 3001/6001
echo 2. Starting Node2 (Client) on ports 3002/6002
echo 3. Connecting Node2 to Node1 automatically
echo 4. Demonstrating peer-to-peer communication
echo.

echo 🔧 Building project first...
call npm run compile
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 📡 Starting Multi-Node Test...
echo.

echo ==========================================
echo Starting Node1 (Host Node)
echo ==========================================
echo HTTP: http://localhost:3001
echo P2P:  ws://localhost:6001
echo ==========================================

start "HackCoin Node1" cmd /c "set NETWORK_TYPE=LOCAL && set HTTP_PORT=3001 && set P2P_PORT=6001 && set NODE_NAME=TestNode1 && node global-node.js"

echo Waiting 5 seconds for Node1 to start...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo Starting Node2 (Client Node)
echo ==========================================
echo HTTP: http://localhost:3002
echo P2P:  ws://localhost:6002
echo Connects to: ws://localhost:6001
echo ==========================================

start "HackCoin Node2" cmd /c "set NETWORK_TYPE=LOCAL && set HTTP_PORT=3002 && set P2P_PORT=6002 && set NODE_NAME=TestNode2 && set SEED_NODES=ws://localhost:6001 && node global-node.js"

echo.
echo ✅ Both nodes are starting!
echo.
echo 🌐 Web Interfaces:
echo   Node1: http://localhost:3001
echo   Node2: http://localhost:3002
echo.
echo 🧪 Testing Instructions:
echo.
echo 1. Open both URLs in different browser tabs
echo 2. Go to "Network" tab in both interfaces
echo 3. Verify both show 1 connected peer
echo 4. Start mining on Node1 (Mining tab)
echo 5. Watch blocks appear on both nodes
echo 6. Send transaction from Node1 to Node2
echo 7. Verify transaction appears on both nodes
echo.
echo 📊 API Testing Commands:
echo   curl http://localhost:3001/api/network/status
echo   curl http://localhost:3002/api/network/status
echo   curl -X POST http://localhost:3001/api/mine/start
echo   curl http://localhost:3001/api/mine/status
echo.
echo 🔍 Expected Results:
echo   - Both nodes show "connectedPeers": 1
echo   - Mining on Node1 creates blocks on both nodes
echo   - Transactions broadcast between nodes
echo   - Blockchain stays synchronized
echo.
echo Press any key to open both web interfaces...
pause >nul

start "" "http://localhost:3001"
start "" "http://localhost:3002"

echo.
echo 🎯 Multi-device test is running!
echo.
echo To stop the test:
echo 1. Close both node command windows
echo 2. Or press Ctrl+C in each window
echo.
echo Press any key to exit this script (nodes will continue running)...
pause >nul
