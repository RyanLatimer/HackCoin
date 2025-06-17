#!/bin/bash

#!/bin/bash

# Start the HackCoin blockchain API server
echo "Starting HackCoin API server..."
npm run dev &
API_PID=$!

# Wait a moment for the API to start
sleep 3

# Start the frontend
echo "Starting HackCoin frontend..."
cd frontend
PORT=3002 npm start &
FRONTEND_PID=$!

echo "HackCoin is running!"
echo "API Server: http://localhost:3001"
echo "Frontend: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
wait $API_PID $FRONTEND_PID
