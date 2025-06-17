@echo off
REM HackCoin - Global Network Starter
REM One command to join the global HackCoin network from anywhere!

echo.
echo 🌍 HackCoin Global Network Starter
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    echo.
    echo Please install npm (usually comes with Node.js)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found!
    echo.
    echo Please make sure you're in the HackCoin project directory.
    echo If you just downloaded the project, run:
    echo   cd HackCoin
    echo.
    pause
    exit /b 1
)

echo ✅ Found HackCoin project
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing server dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install server dependencies
        pause
        exit /b 1
    )
    echo.
)

if not exist "client\node_modules" (
    echo 📦 Installing client dependencies...
    cd client
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install client dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo.
)

echo ✅ All dependencies installed
echo.

REM Set environment variables for global network
if not defined HOST set HOST=0.0.0.0
if not defined PORT set PORT=3001
if not defined NODE_ENV set NODE_ENV=development

echo 🌐 Starting HackCoin Global Network Node...
echo.
echo 🖥️  Server: http://localhost:%PORT%
echo 🌍 Web UI: http://localhost:3000
echo 📡 P2P Port: %PORT%
echo 🔗 Auto-connecting to global network...
echo.
echo 💡 Tip: Anyone on your network can access at http://YOUR_IP:3000
echo 💡 Get connection instructions at: http://localhost:%PORT%/join
echo.
echo Press Ctrl+C to stop the node
echo.

REM Start the application
call npm run dev

echo.
echo 🔄 HackCoin node stopped
pause
