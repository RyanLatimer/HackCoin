# Two-Device HackCoin Setup Guide

This guide will help you connect two separate devices to form a HackCoin network.

## Device Setup

### Device 1 (Bootstrap Node) - Computer A

1. **Find your IP address:**
   
   **Windows:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

   **Mac/Linux:**
   ```bash
   ifconfig | grep inet
   ```

2. **Start the bootstrap node:**
   ```bash
   # Navigate to HackCoin directory
   cd HackCoin
   
   # Install dependencies if needed
   npm run install-all
   
   # Start the bootstrap node
   HOST=0.0.0.0 PORT=3001 npm run dev
   ```

3. **Verify it's running:**
   - Open browser to `http://localhost:3001`
   - Should see HackCoin interface

4. **Make note of your IP address for Device 2**
   - Example: `192.168.1.100`

### Device 2 (Peer Node) - Computer B

1. **Start the peer node:**
   ```bash
   # Navigate to HackCoin directory
   cd HackCoin
   
   # Install dependencies if needed
   npm run install-all
   
   # Connect to Device 1 (replace IP with Device 1's IP)
   HOST=0.0.0.0 PORT=3002 BOOTSTRAP_NODES=http://192.168.1.100:3001 npm run dev
   ```

2. **Verify connection:**
   - Open browser to `http://localhost:3002`
   - Go to Network tab
   - Should see Device 1 listed as connected peer

## Quick Test Commands

### Start Device 1 (Bootstrap):
```bash
HOST=0.0.0.0 PORT=3001 npm run dev
```

### Start Device 2 (Peer):
```bash
HOST=0.0.0.0 PORT=3002 BOOTSTRAP_NODES=http://DEVICE1_IP:3001 npm run dev
```

Replace `DEVICE1_IP` with the actual IP address of Device 1.

## Verification Steps

1. **On Device 1:**
   - Go to `http://localhost:3001`
   - Navigate to "Network" tab
   - Should show 1 connected peer

2. **On Device 2:**
   - Go to `http://localhost:3002`
   - Navigate to "Network" tab  
   - Should show 1 connected peer

3. **Test mining:**
   - On either device, go to "Mining" tab
   - Enter a wallet address (e.g., `0x1234567890abcdef`)
   - Start mining
   - Both devices should see new blocks appear

4. **Test transactions:**
   - Create a transaction on one device
   - Should appear on both devices

## Troubleshooting

### Devices not connecting:
- Check firewall settings on both devices
- Ensure both devices are on the same network
- Verify IP addresses are correct
- Make sure port 3001 is accessible

### "EADDRINUSE" error:
- Port is already in use
- Try different ports:
  ```bash
  PORT=3003 BOOTSTRAP_NODES=http://DEVICE1_IP:3001 npm run dev
  ```

### No peers showing:
- Wait 30-60 seconds for connection
- Check network connectivity between devices
- Verify bootstrap node IP address is correct

## Example Network Configuration

```
Device 1 (192.168.1.100)     Device 2 (192.168.1.101)
┌─────────────────────┐      ┌─────────────────────┐
│   Bootstrap Node    │◄────►│    Peer Node        │
│   Port: 3001        │      │    Port: 3002       │
│                     │      │    Bootstrap:       │
│                     │      │    192.168.1.100    │
└─────────────────────┘      └─────────────────────┘
```

## Advanced Setup

### Add Mining to Device 2:
```bash
HOST=0.0.0.0 PORT=3002 BOOTSTRAP_NODES=http://192.168.1.100:3001 MINING_ADDRESS=0x1234567890abcdef npm run dev
```

### Connect more devices:
Each additional device can connect to any existing node:
```bash
HOST=0.0.0.0 PORT=3003 BOOTSTRAP_NODES=http://192.168.1.100:3001 npm run dev
```

## Security Notes

- This setup exposes HackCoin on your local network
- Only use on trusted networks
- Consider setting up firewall rules if needed
- Do not expose to the internet without proper security measures
