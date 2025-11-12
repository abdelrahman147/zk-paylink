# ZCash to Solana Bridge Protocol

Cross-chain payment protocol enabling private transactions from Zcash to Solana using zero-knowledge proofs.

## Architecture Flow

```
┌─────────────────┐
│   Zcash Chain   │
│  Shielded Pool  │
└────────┬────────┘
         │
         │ Deposit ZEC
         │ Generate zk-SNARK Proof
         ▼
┌─────────────────────────────────┐
│     Bridge Service Layer        │
│  ┌───────────────────────────┐  │
│  │  Proof Verification       │  │
│  │  Pool Balance Tracking    │  │
│  │  Transaction Management   │  │
│  └───────────────────────────┘  │
└────────┬────────────────────────┘
         │
         │ Verify Proof
         │ Mint Equivalent Value
         ▼
┌─────────────────┐
│  Solana Chain   │
│  SPL Tokens     │
└─────────────────┘
```

## Technical Implementation

### Core Components

**Bridge Service (bridge-service.js)**
- Manages cross-chain state synchronization
- Handles Zcash RPC communication for shielded pool operations
- Integrates with Solana Web3 for transaction creation
- Implements pool balance tracking with precision handling
- Provides transaction verification and confirmation polling

**API Service (api-service.js)**
- Exposes protocol operations through standardized interface
- Validates all inputs and handles errors gracefully
- Manages Solana transaction signing and confirmation
- Provides status monitoring and transaction history

**Game System (mini-game.js)**
- Implements pay-to-play mechanics with Solana payments
- Tracks game state and scoring algorithms
- Integrates with leaderboard for score submission

**Leaderboard (leaderboard-sheets.js)**
- Stores game scores in Google Sheets via REST API
- Implements retry logic for rate limit handling
- Provides ranking and user score retrieval

### Data Flow

1. **Deposit Phase**
   - User sends ZEC to shielded pool address
   - Bridge service monitors Zcash blockchain via RPC
   - Transaction detected and validated

2. **Proof Generation**
   - Zero-knowledge proof created proving deposit ownership
   - Proof contains hashed amount and recipient information
   - Private inputs remain hidden (sender identity, exact amount)

3. **Verification Phase**
   - Proof verified on-chain via Solana program
   - Pool balance validated against calculated deposits
   - Transaction consistency checked

4. **Minting Phase**
   - Equivalent value minted as SPL tokens on Solana
   - Recipient receives tokens in their wallet
   - Transaction recorded in bridge state

### Improvements Over Standard Bridges

**Privacy Enhancement**
- Zero-knowledge proofs prevent transaction graph analysis
- Shielded pool obscures individual transaction amounts
- No linkability between Zcash and Solana addresses

**Trust Minimization**
- On-chain verification eliminates need for trusted operators
- Smart contract validation ensures correctness
- Transparent pool balance tracking

**Efficiency Gains**
- Solana's high throughput enables fast finality
- Batch processing capabilities for multiple transactions
- Optimized RPC endpoint rotation for reliability

**Cost Optimization**
- Minimal transaction fees on Solana network
- Reduced gas costs compared to Ethereum-based bridges
- Efficient proof verification algorithms

## Configuration

Create `config.js` from `config.example.js`:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        SHEET_ID: 'your-sheet-id',
        API_KEY: 'your-api-key'
    },
    SOLANA_RPC: [
        'https://api.mainnet-beta.solana.com',
        'https://rpc.ankr.com/solana'
    ],
    ZCASH_RPC: {
        URL: 'your-zcash-rpc-url',
        USER: 'rpc-username',
        PASSWORD: 'rpc-password'
    }
};
```

## Project Structure

- `bridge-service.js` - Core bridge logic and state management
- `api-service.js` - Protocol API interface
- `mini-game.js` - Game implementation with payment integration
- `anti-cheat.js` - Client-side validation and detection
- `leaderboard-sheets.js` - Google Sheets API integration
- `script.js` - Application orchestration
- `index.html` - User interface
- `styles.css` - Styling

## Security

- All transactions verified on-chain via smart contracts
- Zero-knowledge proofs ensure privacy without revealing sensitive data
- Anti-cheat system prevents score manipulation
- Leaderboard validation prevents duplicate submissions
- No private keys stored or transmitted

## License

MIT License
