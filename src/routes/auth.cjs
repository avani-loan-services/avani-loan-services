const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * HubSpot OAuth callback – receives ?code=... from HubSpot and exchanges it
 * for an access token and refresh token. The refresh token is stored in the
 * .env file so the server can obtain fresh access tokens in the future.
 */
router.get('/hubspot/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing code parameter');
  }
  try {
    const tokenResp = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.HUBSPOT_CLIENT_ID,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET,
        redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
        code,
      },
    });
    const { refresh_token } = tokenResp.data;
    // Persist refresh token to .env (append if not already present)
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('HUBSPOT_REFRESH_TOKEN')) {
      envContent += `\nHUBSPOT_REFRESH_TOKEN=${refresh_token}`;
    } else {
      envContent = envContent.replace(/HUBSPOT_REFRESH_TOKEN=.*/, `HUBSPOT_REFRESH_TOKEN=${refresh_token}`);
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    res.send('HubSpot OAuth successful – refresh token saved. You may close this window.');
  } catch (err) {
    console.error('HubSpot OAuth error', err.response?.data || err.message);
    res.status(500).send('OAuth exchange failed');
  }
});

module.exports = router;
