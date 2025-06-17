# HackCoin Startup Script for PowerShell
# Run this script to start the complete HackCoin system

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   🚀 HackCoin Blockchain Platform 🚀" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting HackCoin complete system..." -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if Python is installed
if (-not (Test-Command "python")) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed  
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 16+ and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Python and Node.js are available" -ForegroundColor Green
Write-Host ""

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Blue
try {
    & python -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "pip install failed" }
    Write-Host "✅ Python dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Blue
try {
    & npm run install-all
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Host "✅ Node.js dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Starting HackCoin services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Blockchain Miner (Python backend)" -ForegroundColor White
Write-Host "   2. Web GUI (React frontend)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   • GUI Interface: http://localhost:3001" -ForegroundColor White
Write-Host "   • API Endpoint:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Usage Tips:" -ForegroundColor Yellow
Write-Host "   • Create a wallet first in the GUI" -ForegroundColor White
Write-Host "   • Configure mining difficulty in Mining section" -ForegroundColor White
Write-Host "   • Use Ctrl+C to stop each service" -ForegroundColor White
Write-Host ""

# Start the miner in a new PowerShell window
Write-Host "🔧 Starting HackCoin Miner..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python hackcoin_miner.py" -WindowStyle Normal

# Wait for miner to initialize
Start-Sleep -Seconds 3

# Start the web application in a new PowerShell window
Write-Host "🌐 Starting HackCoin Web GUI..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 HackCoin is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "The miner and web interface are launching in separate windows." -ForegroundColor White
Write-Host "Wait a few moments, then visit: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
