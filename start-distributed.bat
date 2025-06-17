@echo off
echo 🚀 Starting HackCoin Distributed Network
echo ========================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing server dependencies...
    npm install
)

if not exist "client\node_modules" (
    echo 📦 Installing client dependencies...
    cd client
    npm install
    cd ..
)

:: Set default environment variables
if not defined HOST set HOST=0.0.0.0
if not defined PORT set PORT=3001

:: Parse command line arguments
set BOOTSTRAP_NODES=
set MINING_ADDRESS=

:parse_args
if "%1"=="--bootstrap" (
    set BOOTSTRAP_NODES=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--miner" (
    set MINING_ADDRESS=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--port" (
    set PORT=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--host" (
    set HOST=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--help" (
    echo HackCoin Distributed Network Startup
    echo.
    echo Usage: %0 [OPTIONS]
    echo.
    echo Options:
    echo   --bootstrap NODES    Comma-separated list of bootstrap nodes
    echo   --miner ADDRESS      Start mining with this address
    echo   --port PORT          Server port ^(default: 3001^)
    echo   --host HOST          Server host ^(default: 0.0.0.0^)
    echo   --help               Show this help message
    echo.
    echo Examples:
    echo   %0 --port 3001
    echo   %0 --bootstrap http://192.168.1.100:3001,http://192.168.1.101:3001
    echo   %0 --miner 0x1234567890abcdef --bootstrap http://192.168.1.100:3001
    pause
    exit /b 0
)
if "%1" neq "" (
    echo Unknown option: %1
    echo Use --help for usage information
    pause
    exit /b 1
)

:: Display configuration
if defined BOOTSTRAP_NODES (
    echo 🌐 Bootstrap nodes: %BOOTSTRAP_NODES%
)
if defined MINING_ADDRESS (
    echo ⛏️  Mining address: %MINING_ADDRESS%
)

echo 🖥️  Server will run on: http://%HOST%:%PORT%
echo 📡 P2P networking enabled
echo 🔗 Blockchain synchronization active
echo.

:: Start the distributed network
echo 🚀 Starting HackCoin Distributed Network...
npm run dev

pause
