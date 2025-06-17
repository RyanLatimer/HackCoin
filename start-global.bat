@echo off
echo Starting HackCoin Global Network Node...
echo.
echo This will make your HackCoin node accessible worldwide!
echo.
set /p network="Enter network type (LOCAL/TESTNET/MAINNET) [LOCAL]: "
if "%network%"=="" set network=LOCAL

set /p port="Enter HTTP port [3001]: "
if "%port%"=="" set port=3001

set /p p2pport="Enter P2P port [6001]: "
if "%p2pport%"=="" set p2pport=6001

echo.
echo Configuration:
echo - Network: %network%
echo - HTTP Port: %port%
echo - P2P Port: %p2pport%
echo.
echo Starting node...

set NETWORK_TYPE=%network%
set HTTP_PORT=%port%
set P2P_PORT=%p2pport%

npm run compile
if errorlevel 1 (
    echo.
    echo Compilation failed. Starting with ts-node instead...
    ts-node global-node.ts
) else (
    node global-node.js
)

echo.
echo Node stopped. Press any key to exit...
pause > nul
