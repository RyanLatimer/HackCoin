# HackCoin Wallet Management Guide

## Overview

HackCoin now supports **changing your wallet address/private key even when logged in**, with full persistence across sessions. This allows you to:

- Switch between multiple wallets seamlessly
- Generate new wallets on-demand
- Import existing private keys
- Maintain persistent wallet state

## New Features Added

### 🔄 **Change Wallet Functionality**
- **Change Wallet Button**: Purple "Change Wallet" button in the main wallet interface
- **Generate New Wallet**: Create a fresh wallet with new private key
- **Import Private Key**: Switch to any existing wallet using its private key
- **Persistent Storage**: All wallet changes are automatically saved to localStorage

### 🎯 **How It Works**

1. **Current Wallet**: Your active wallet is always displayed with address and balance
2. **Change Anytime**: Click "Change Wallet" to switch to a different wallet
3. **Two Options**:
   - **Generate New**: Creates a completely new wallet with random private key
   - **Import Existing**: Switch to a wallet you already have the private key for
4. **Auto-Save**: Changes are immediately saved and persist across browser sessions

## Usage Instructions

### **Changing Your Wallet**

#### **Step 1: Access Change Wallet**
1. Open the Wallet section in HackCoin
2. Look for the purple **"Change Wallet"** button (with key icon)
3. Click to open the change wallet modal

#### **Step 2: Choose Your Method**

**Option A: Generate New Wallet**
1. Click the **"Generate New"** button
2. A new private key will be automatically generated and filled in
3. Review the private key (64 hexadecimal characters)
4. Click **"Change Wallet"** to confirm

**Option B: Import Existing Wallet**
1. Paste your existing 64-character private key in the text area
2. Ensure it's exactly 64 hexadecimal characters
3. Click **"Change Wallet"** to switch

#### **Step 3: Confirmation**
- Your wallet address will immediately update
- Balance will refresh for the new wallet
- All changes are automatically saved
- You'll see a success notification

### **Important Security Notes**

⚠️ **Backup Warning**: Before changing wallets, make sure you have backed up your current wallet if you want to access it again later.

🔐 **Private Key Security**: 
- Never share your private keys with anyone
- Store backups securely offline
- Each private key controls access to that wallet's funds

## Technical Implementation

### **Persistence**
- Wallet data is stored in browser's `localStorage`
- Key: `hackcoin_wallet`
- Data: `{ privateKey: "...", address: "..." }`
- Survives browser restarts and page refreshes

### **Wallet Context Changes**
- Added `changeWallet(privateKey)` function
- Validates private key format (64 hex characters)
- Updates address, private key, and balance
- Triggers balance refresh automatically

### **UI Components Added**
- **Change Wallet Button**: Purple button with key icon
- **Change Wallet Modal**: Full-featured modal with:
  - Generate new wallet option
  - Private key input field
  - Validation and error handling
  - Warning messages
  - Clear/Cancel options

## Use Cases

### **Multiple Wallets**
```javascript
// Wallet 1 (Main): 0x1234...abcd (100 HCK)
// Wallet 2 (Secondary): 0x5678...efgh (50 HCK)
// Wallet 3 (Trading): 0x9abc...1234 (25 HCK)
```

Switch between them anytime using the Change Wallet feature!

### **Team/Family Sharing**
- Each family member can have their own private key
- Switch wallets based on who's using the computer
- Keep separate balances and transaction histories

### **Development/Testing**
- Create test wallets for development
- Switch between mainnet and testnet wallets
- Test different scenarios with different addresses

## API Functions

### **WalletContext Functions**

```javascript
// Change to a different wallet
const changeWallet = async (privateKey) => {
  // Validates and switches wallet
  // Updates localStorage
  // Refreshes balance
  // Returns { privateKey, address }
}

// Generate new wallet (existing function)
const createWallet = async () => {
  // Creates new wallet with random keys
  // Does NOT automatically switch (use changeWallet for that)
}

// Import wallet (existing function)  
const importWallet = async (privateKey) => {
  // Similar to changeWallet but with different error handling
}
```

### **Component State**

```javascript
// New state variables added
const [showChangeWalletForm, setShowChangeWalletForm] = useState(false);
const [changeWalletKey, setChangeWalletKey] = useState('');
```

## Error Handling

### **Validation Errors**
- **Empty Private Key**: "Private key is required"
- **Invalid Format**: "Invalid private key format (must be 64 characters)"
- **Non-hex Characters**: Automatic validation prevents invalid characters

### **Success Messages**
- **Wallet Changed**: "🔄 Wallet changed successfully!"
- **New Wallet Generated**: "🎲 New wallet generated! Review and confirm below."

## Security Considerations

### **Best Practices**
1. **Backup First**: Always backup current wallet before changing
2. **Secure Storage**: Store private keys in secure, offline locations
3. **Verify Keys**: Double-check private keys before importing
4. **Test Small**: Test with small amounts first

### **Privacy**
- Private keys are only stored locally (localStorage)
- No private keys are sent to servers
- Each wallet operates independently

## Troubleshooting

### **"Invalid private key format"**
- Ensure private key is exactly 64 characters
- Only use hexadecimal characters (0-9, a-f)
- Remove any spaces or special characters

### **"Wallet not persisting"**
- Check if browser allows localStorage
- Ensure you're not in incognito/private mode
- Clear browser cache if issues persist

### **"Balance not updating"**
- Wait a few seconds after changing wallets
- Click the "Refresh" button manually
- Check network connection

## Migration from Old Version

If you're upgrading from a previous version:

1. **Existing Wallets**: Your current wallet will continue to work
2. **New Features**: The "Change Wallet" button will appear automatically
3. **No Data Loss**: All existing wallet data is preserved
4. **Backward Compatible**: All existing functionality remains unchanged

## Future Enhancements

Potential future features:
- **Wallet Manager**: UI to manage multiple saved wallets
- **Wallet Names**: Custom names for different wallets
- **Quick Switch**: Dropdown to quickly switch between recent wallets
- **Encrypted Storage**: Additional encryption layer for stored keys

---

**🎉 Your HackCoin wallet system is now fully flexible with persistent wallet switching capabilities!**
