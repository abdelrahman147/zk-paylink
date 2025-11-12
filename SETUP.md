# Setup Guide

## Google Sheets Leaderboard Setup

### Step 1: Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it "Game Leaderboard"
4. In row 1, add these headers (one per column):
   - Timestamp
   - Wallet
   - Score
   - Time
   - ScorePerSecond
   - Difficulty
   - Signature
   - Hash

### Step 2: Enable Google Sheets API

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Google Sheets API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key
6. (Optional) Restrict API key to Sheets API only

### Step 3: Configure Sheet Permissions

1. Open your Google Sheet
2. Click "Share" button
3. Set to "Anyone with the link can view"
4. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

### Step 4: Update config.js

Open `config.js` and update:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        SHEET_ID: 'your-sheet-id-here',
        API_KEY: 'your-api-key-here'
    },
    ...
};
```

### Step 5: Test

1. Open the game in your browser
2. Play a game
3. Check your Google Sheet - scores should appear automatically

## Notes

- Scores are always saved even if Google Sheets is unavailable
- Leaderboard updates in real-time
- No server required - works entirely client-side
- Google Sheets API has free tier limits (100 requests per 100 seconds per user)

