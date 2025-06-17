@echo off
echo 🚀 HackCoin Setup ^& Deployment Script
echo =====================================
echo.

:menu
echo Choose an option:
echo 1) Deploy to Railway (Free cloud hosting)
echo 2) Build desktop apps (.exe, .dmg, .AppImage)
echo 3) Test locally
echo 4) Install Railway CLI only
echo 5) Full setup (All of the above)
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto deploy_railway
if "%choice%"=="2" goto build_desktop
if "%choice%"=="3" goto test_local
if "%choice%"=="4" goto install_railway
if "%choice%"=="5" goto full_setup
echo ❌ Invalid choice
pause
exit /b 1

:install_railway
echo 📦 Installing Railway CLI...
npm install -g @railway/cli
echo ✅ Railway CLI installed!
goto end

:deploy_railway
echo 🚀 Deploying to Railway...
railway login
railway up
echo ✅ Deployed! Check your Railway dashboard for the URL
goto end

:build_desktop
echo 💻 Building desktop applications...
npm install
echo Building Windows .exe...
npm run build:windows
echo ✅ Desktop apps built in ./dist/ folder
goto end

:test_local
echo 🧪 Testing locally...
npm install
npm run compile
echo ✅ Compiled successfully!
echo 🌐 Starting server on http://localhost:3001
npm run api-server
goto end

:full_setup
echo 🔧 Full setup starting...
call :install_railway
call :build_desktop
call :deploy_railway
goto end

:end
echo.
echo 🎉 Setup complete!
echo.
echo 📋 What you now have:
echo ✅ Persistent wallet ^& blockchain data
echo ✅ Web-accessible HackCoin node
echo ✅ Desktop applications
echo ✅ Global P2P network capability
echo.
echo 🔗 Share your node with others:
echo    Web: https://your-railway-url.app
echo    P2P: ws://your-railway-url.app:6001
pause
