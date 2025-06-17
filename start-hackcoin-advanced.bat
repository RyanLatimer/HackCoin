@echo off
echo.
echo ==========================================
echo   🚀 HackCoin Blockchain Platform 🚀
echo ==========================================
echo.
echo Choose startup option:
echo.
echo 1. Start HackCoin (Local Access Only)
echo 2. Start HackCoin (Network Access - All Devices)
echo 3. Install Dependencies Only
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto network
if "%choice%"=="3" goto install
if "%choice%"=="4" goto exit
goto invalid

:local
echo.
echo 🏠 Starting HackCoin for LOCAL ACCESS ONLY...
echo.
set HOST=localhost
set PORT=3001
goto start

:network
echo.
echo 🌐 Starting HackCoin for NETWORK ACCESS...
echo.
echo ⚠️  WARNING: This will make HackCoin accessible to ALL devices on your network!
echo Anyone on your network can access the mining and wallet features.
echo.
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto menu
echo.
set HOST=0.0.0.0
set PORT=3001
goto start

:start
REM Check prerequisites
echo ✅ Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)

if not exist "client\node_modules" (
    echo 📦 Installing client dependencies...
    cd client
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo 🎯 Starting HackCoin services...
echo.
echo 📡 Backend Server: http://%HOST%:%PORT%
echo 🌐 Frontend GUI: http://%HOST%:3000
echo.

REM Start backend server
echo 🔧 Starting HackCoin Backend Server...
start "HackCoin Backend" cmd /k "cd /d "%~dp0" && set HOST=%HOST% && set PORT=%PORT% && node server.js"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend
echo 🌐 Starting HackCoin Frontend...
start "HackCoin Frontend" cmd /k "cd /d "%~dp0\client" && npm start"

echo.
echo 🎉 HackCoin is starting up!
echo.
if "%HOST%"=="0.0.0.0" (
    echo 🌐 NETWORK ACCESS ENABLED
    echo Other devices can access HackCoin at:
    echo   http://YOUR_IP_ADDRESS:3000
    echo.
    echo To find your IP address, run: ipconfig
    echo.
) else (
    echo 🏠 LOCAL ACCESS ONLY
    echo Access HackCoin at: http://localhost:3000
    echo.
)
echo 💡 Usage Tips:
echo   • Create a wallet first in the GUI
echo   • Configure mining settings in the Mining section
echo   • Mining rewards are earned automatically
echo   • Use Ctrl+C in the terminal windows to stop services
echo.
echo Press any key to exit this launcher...
pause >nul
goto exit

:install
echo.
echo 📦 Installing HackCoin dependencies...
echo.
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

cd client
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ All dependencies installed successfully!
echo You can now start HackCoin with option 1 or 2.
echo.
pause
goto menu

:invalid
echo.
echo ❌ Invalid choice. Please enter 1, 2, 3, or 4.
echo.
pause
goto menu

:menu
cls
goto start

:exit
echo.
echo 👋 Thanks for using HackCoin!
echo.
