// src/utils/hubSpot.js
// ─────────────────────────────────────────────────────────────────
// Creates/updates a HubSpot contact using OAuth2 refresh token.
// Falls back gracefully if credentials are missing.
// ─────────────────────────────────────────────────────────────────
const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

let accessToken    = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;

  // Re‑read .env at runtime so token updates without restart
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/HUBSPOT_REFRESH_TOKEN=(.+)/);
    if (match && match[1]) process.env.HUBSPOT_REFRESH_TOKEN = match[1].trim();
  }

  const refreshToken = process.env.HUBSPOT_REFRESH_TOKEN;
  if (!refreshToken || refreshToken === 'na2-99de-b4d2-4640-af6a-1b35de1eec48') {
    throw new Error('HubSpot refresh token is a placeholder. Please complete OAuth.');
  }

  const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
    params: {
      grant_type   : 'refresh_token',
      client_id    : process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      refresh_token: refreshToken
    }
  });

  accessToken    = response.data.access_token;
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 5 * 60 * 1000;
  return accessToken;
}

async function syncToHubSpot(meta) {
  try {
    const token = await getAccessToken();
    const nameParts = (meta.name || '').split(' ');
    const body = {
      properties: {
        email       : meta.email    || '',
        phone       : meta.phone    || '',
        firstname   : nameParts[0]  || '',
        lastname    : nameParts.slice(1).join(' ') || '',
        city        : meta.city     || '',
        loan_type__c: meta.loanType || '',
        loan_amount : meta.amount   || '',
        source      : meta.source   || '',
        hs_lead_status: meta.status || process.env.ADMIN_STATUS_DEFAULT || 'Pending'
      }
    };

    await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('[hubspot] Contact synced successfully.');
  } catch (err) {
    // Non‑fatal – log and continue
    console.error('[hubspot] Sync error (non‑fatal):', err.response?.data || err.message);
  }
}

module.exports = { syncToHubSpot };
