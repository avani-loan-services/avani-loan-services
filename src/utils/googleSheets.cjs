// src/utils/googleSheets.cjs
// ─────────────────────────────────────────────────────────────────
// Strategy 1: Service Account via googleapis (preferred).
// Strategy 2: Apps Script Web App endpoint (fallback / always dual-write).
// ─────────────────────────────────────────────────────────────────
const axios = require('axios');

// Apps Script endpoint (confirmed 200 OK)
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyoAmAabpO9PUDH-AXatZm5Td7pO9n5W00Eoh6TNIkPtjbQZiYrhAv27XgyMtJdBxchEg/exec';

/**
 * Send row data to the confirmed Apps Script endpoint.
 * Always succeeds even if the service‑account key is not yet set.
 */
async function appendViaAppsScript(row) {
  const payload = {
    timestamp : row.timestamp  || '',
    name      : row.name       || '',
    phone     : row.phone      || '',
    email     : row.email      || '',
    loanType  : row.loanType   || '',
    amount    : row.amount     || '',
    city      : row.city       || '',
    source    : row.source     || '',
    status    : row.status     || '',
    aiCallId  : row.aiCallId   || ''
  };
  try {
    const res = await axios.post(APPS_SCRIPT_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('[googleSheets] Apps Script response:', res.status, res.data);
  } catch (err) {
    console.error('[googleSheets] Apps Script error:', err.message);
  }
}

/**
 * Try googleapis service‑account path, fall back to Apps Script.
 */
async function appendRowToGoogleSheet(row) {
  // Always send to Apps Script (guaranteed endpoint)
  await appendViaAppsScript(row);

  // Also try the service‑account Sheets API if the credentials are set
  const rawKeyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 'config/google-service-account.json';
  const path = require('path');
  const fs = require('fs');
  const os = require('os');
  let keyFilePath;
  // If the env var looks like a JSON object, write it to a temporary file.
  if (rawKeyFile.trim().startsWith('{')) {
    const tmpPath = path.join(os.tmpdir(), `gservice-${Date.now()}.json`);
    try {
      fs.writeFileSync(tmpPath, rawKeyFile);
      keyFilePath = tmpPath;
    } catch (e) {
      console.error('[googleSheets] Failed to write temp service‑account file:', e);
    }
  } else {
    // Assume it is a path to a file relative to the project root.
    keyFilePath = path.isAbsolute(rawKeyFile) ? rawKeyFile : path.resolve(process.cwd(), rawKeyFile);
  }
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || '1rtLbnT1jTv2U_nEbbNu8C9tn1kyKnEMfp1bY8noib2E';

  if (!keyFilePath || !fs.existsSync(keyFilePath) || !spreadsheetId) {
    console.warn('[googleSheets] Service account key file missing or invalid; skipping googleapis write.');
    return;
  }

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const values = [[
      row.timestamp || '',
      row.name      || '',
      row.phone     || '',
      row.email     || '',
      row.loanType  || '',
      row.amount    || '',
      row.city      || '',
      row.source    || '',
      row.status    || '',
      row.aiCallId  || ''
    ]];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    console.log('[googleSheets] googleapis append successful.');
  } catch (err) {
    console.error('[googleSheets] googleapis error (non‑fatal):', err.message);
  }
}

module.exports = { appendRowToGoogleSheet };
