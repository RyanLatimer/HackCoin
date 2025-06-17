@echo off
echo Starting HackCoin API server...
start cmd /k "npm run dev"

echo Waiting for API server to start...
timeout /t 3 /nobreak > nul

echo Starting HackCoin frontend...
start cmd /k "cd frontend && set PORT=3002 && npm start"

echo.
echo HackCoin is running!
echo API Server: http://localhost:3001
echo Frontend: http://localhost:3002
echo.
echo Press any key to continue...
pause > nul
