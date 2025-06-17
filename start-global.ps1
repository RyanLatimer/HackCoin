# HackCoin - Global Network Starter (PowerShell)
# One command to join the global HackCoin network from anywhere!

Write-Host "🌍 HackCoin Global Network Starter" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Then run this script again."
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install npm (usually comes with Node.js)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure you're in the HackCoin project directory." -ForegroundColor Yellow
    Write-Host "If you just downloaded the project, run:" -ForegroundColor Yellow
    Write-Host "  cd HackCoin" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Found HackCoin project" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

if (!(Test-Path "client\node_modules")) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
    Write-Host ""
}

Write-Host "✅ All dependencies installed" -ForegroundColor Green
Write-Host ""

# Set environment variables for global network
$env:HOST = "0.0.0.0"
if (!$env:PORT) { $env:PORT = "3001" }
if (!$env:NODE_ENV) { $env:NODE_ENV = "development" }

Write-Host "🌐 Starting HackCoin Global Network Node..." -ForegroundColor Blue
Write-Host ""
Write-Host "🖥️  Server: http://localhost:$($env:PORT)" -ForegroundColor Cyan
Write-Host "🌍 Web UI: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📡 P2P Port: $($env:PORT)" -ForegroundColor Cyan
Write-Host "🔗 Auto-connecting to global network..." -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Anyone on your network can access at http://YOUR_IP:3000" -ForegroundColor Yellow
Write-Host ""

# Start the application
npm run dev
