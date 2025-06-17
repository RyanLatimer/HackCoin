@echo off
echo.
echo ==========================================
echo   🚀 HackCoin Blockchain Platform 🚀
echo ==========================================
echo.
echo Starting HackCoin complete system...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

echo ✅ Python and Node.js are available
echo.

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
call npm run install-all
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies installed successfully!
echo.
echo 🎯 Starting HackCoin services...
echo.
echo    1. Blockchain Miner (Python backend)
echo    2. Web GUI (React frontend)
echo.
echo 🌐 Access URLs:
echo    • GUI Interface: http://localhost:3001
echo    • API Endpoint:  http://localhost:5000
echo.
echo 💡 Usage Tips:
echo    • Create a wallet first in the GUI
echo    • Configure mining difficulty in Mining section
echo    • Use Ctrl+C to stop each service
echo.

REM Start the miner in a new window
echo 🔧 Starting HackCoin Miner...
start "HackCoin Miner" cmd /k "python hackcoin_miner.py"

REM Wait a moment for the miner to initialize
timeout /t 3 /nobreak >nul

REM Start the web application
echo 🌐 Starting HackCoin Web GUI...
start "HackCoin Web GUI" cmd /k "npm run dev"

echo.
echo 🎉 HackCoin is starting up!
echo.
echo The miner and web interface are launching in separate windows.
echo Wait a few moments, then visit: http://localhost:3001
echo.
echo Press any key to exit this launcher...
pause >nul
