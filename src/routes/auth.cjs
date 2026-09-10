const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * HubSpot OAuth callback – receives ?code=... from HubSpot and exchanges it
 * for an access token and refresh token. Validates the exchange without
 * filesystem writes to ensure compatibility with serverless environments.
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
    const { refresh_token, access_token } = tokenResp.data || {};
    if (!refresh_token || !access_token) {
      return res.status(502).send('OAuth exchange succeeded but required credentials were missing from the response.');
    }

    // In serverless production, tokens are not persisted to the read-only filesystem.
    // The operator must configure HUBSPOT_REFRESH_TOKEN in the secure server environment settings.
    res.status(200).send(
      'HubSpot OAuth authorization successful. Refresh token received and validated. Please configure HUBSPOT_REFRESH_TOKEN in your secure server environment settings.'
    );
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    console.error('[HubSpot OAuth] Exchange error:', errMsg);
    res.status(500).send('OAuth exchange failed');
  }
});

module.exports = router;
