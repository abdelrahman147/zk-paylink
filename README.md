# ZCash to Solana Bridge Protocol

Cross-chain payment protocol enabling private transactions from Zcash to Solana using zero-knowledge proofs.

## Features

- Private cross-chain transactions using zk-SNARKs
- Solana integration with SPL token support
- Trustless bridge architecture
- Mini game with leaderboard
- Anti-cheat protection
- Google Sheets leaderboard integration

## Setup

### Prerequisites

- Node.js 16+ (for backend API)
- Modern web browser with Phantom wallet extension
- Zcash node (optional, for local testing)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Google Sheets API (see Leaderboard Setup)
4. Open `index.html` in a web browser

## Configuration

### Google Sheets Leaderboard Setup

1. Create a new Google Sheet
2. Add headers in row 1: Timestamp, Wallet, Score, Time, ScorePerSecond, Difficulty, Signature, Hash
3. Enable Google Sheets API in Google Cloud Console
4. Create an API key with Sheets API access
5. Update `script.js` with your Sheet ID and API key:

```javascript
const SHEET_ID = 'your-sheet-id';
const API_KEY = 'your-api-key';
```

### Solana RPC Configuration

Default public RPC endpoints are used. For production, configure your own RPC endpoints in `script.js`:

```javascript
const solanaRpcUrls = [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
    'https://solana.public-rpc.com'
];
```

### Zcash RPC Configuration

Configure Zcash RPC in `script.js`:

```javascript
zcashRpcUrl: 'http://localhost:8232',
zcashRpcUser: 'your-rpc-user',
zcashRpcPassword: 'your-rpc-password'
```

## Usage

### Bridge ZEC to Solana

1. Connect your Solana wallet (Phantom)
2. Enter ZEC amount and recipient address
3. Click "Bridge ZEC → SOL"
4. Confirm transaction in wallet

### Mini Game

1. Connect Solana wallet
2. Click "Pay 0.01 SOL & Start Game"
3. Click targets to score points
4. Avoid clicking background (loses 1 life)
5. Scores are automatically submitted to leaderboard

### API

The protocol exposes a JavaScript API:

```javascript
const api = new ProtocolAPI();
api.init(bridge);

const status = await api.getStatus();
const result = await api.bridgeZecToSolana(1.0, 'recipient-address');
```

## Project Structure

- `bridge-service.js` - Core bridge logic
- `api-service.js` - Protocol API
- `mini-game.js` - Game implementation
- `anti-cheat.js` - Anti-cheat detection
- `leaderboard-sheets.js` - Google Sheets integration
- `script.js` - Main application logic
- `index.html` - User interface
- `styles.css` - Styling

## Security

- All transactions verified on-chain
- Zero-knowledge proofs for privacy
- Anti-cheat system prevents manipulation
- Server-side leaderboard validation
- No private keys stored

## License

MIT License

## Support

For issues and questions, open an issue on GitHub.
