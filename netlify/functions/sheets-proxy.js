/**
 * Netlify Function to proxy Google Sheets API requests using Service Account
 * This keeps the service account credentials secure on the server
 */

exports.handler = async function(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Service account credentials from environment variables
    const serviceAccount = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix newlines
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CERT_URL
    };

    // Validate environment variables
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Service account not configured. Please set GOOGLE_* environment variables in Netlify.' 
            })
        };
    }

    try {
        // Get access token
        const accessToken = await getAccessToken(serviceAccount);

        const path = event.path.replace('/.netlify/functions/sheets-proxy', '');
        const sheetId = event.queryStringParameters?.sheetId || '1apjUM4vb-6TUx4cweIThML5TIKBg8E7HjLlaZyiw1e8';

        // Handle different operations
        if (event.httpMethod === 'GET' && path === '/scores') {
            // Read scores
            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:H1000`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return {
                    statusCode: response.status,
                    headers,
                    body: JSON.stringify({ success: false, error: `Sheets API error: ${error}` })
                };
            }

            const data = await response.json();
            const scores = (data.values || []).map(row => ({
                timestamp: row[0],
                wallet: row[1],
                score: parseInt(row[2]),
                time: parseInt(row[3]),
                scorePerSecond: parseFloat(row[4]),
                difficulty: parseInt(row[5]),
                signature: row[6],
                hash: row[7]
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, scores })
            };
        } 
        else if (event.httpMethod === 'POST' && path === '/submit') {
            // Submit score
            const body = JSON.parse(event.body);
            const { wallet, score, time, signature, difficulty = 1 } = body;

            if (!wallet || score === undefined || !time) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Missing required fields' })
                };
            }

            const timestamp = new Date().toISOString();
            const scorePerSecond = time > 0 ? (score / (time / 1000)).toFixed(2) : 0;
            
            // Generate hash (using built-in crypto)
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256')
                .update(`${wallet}${score}${time}${signature}`)
                .digest('hex').substring(0, 16);

            const values = [[
                timestamp,
                wallet,
                score.toString(),
                time.toString(),
                scorePerSecond,
                difficulty.toString(),
                signature || 'game-' + Date.now(),
                hash
            ]];

            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:H:append?valueInputOption=RAW`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ values })
                }
            );

            if (!response.ok) {
                const error = await response.text();
                return {
                    statusCode: response.status,
                    headers,
                    body: JSON.stringify({ success: false, error: `Sheets API error: ${error}` })
                };
            }

            const result = await response.json();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, result })
            };
        } 
        else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Not found' })
            };
        }
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

/**
 * Generate JWT and exchange for access token
 */
async function getAccessToken(serviceAccount) {
    const crypto = require('crypto');

    // Create JWT header
    const jwtHeader = Buffer.from(JSON.stringify({
        alg: 'RS256',
        typ: 'JWT'
    })).toString('base64url');

    // Create JWT claim set
    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: serviceAccount.token_uri,
        exp: now + 3600,
        iat: now
    };

    const jwtClaimSetEncoded = Buffer.from(JSON.stringify(jwtClaimSet)).toString('base64url');
    const signatureInput = `${jwtHeader}.${jwtClaimSetEncoded}`;

    // Sign with private key
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(serviceAccount.private_key).toString('base64url');

    const jwt = `${signatureInput}.${signature}`;

    // Exchange JWT for access token
    const response = await fetch(serviceAccount.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
}

