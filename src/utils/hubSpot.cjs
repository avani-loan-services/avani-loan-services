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

  // If no refresh token in process.env, try to read from .env if present
  if (!process.env.HUBSPOT_REFRESH_TOKEN) {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/HUBSPOT_REFRESH_TOKEN=(.+)/);
      if (match && match[1]) process.env.HUBSPOT_REFRESH_TOKEN = match[1].trim();
    }
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

/**
 * Maps AVANI loan product display labels to authoritative HubSpot internal enumeration values.
 * Portal 244236573 allowed options:
 * - personal_salary_loan
 * - business_loan
 * - doctor_loan
 * - home_loan
 * - mortgage_loan
 * - education_loan_india
 * - education_loan_global
 */
function mapLoanTypeToHubSpot(loanType) {
  if (!loanType || typeof loanType !== 'string') return '';
  const norm = loanType.trim().toLowerCase();

  if (norm.includes('global') || norm.includes('abroad') || norm.includes('overseas')) {
    return 'education_loan_global';
  }
  if (norm.includes('edu') || norm.includes('student')) {
    return 'education_loan_india';
  }
  if (norm.includes('doctor') || norm.includes('medical') || norm.includes('dr')) {
    return 'doctor_loan';
  }
  if (norm.includes('home') || norm.includes('housing')) {
    return 'home_loan';
  }
  if (norm.includes('mortgage') || norm.includes('lap') || norm.includes('property')) {
    return 'mortgage_loan';
  }
  if (norm.includes('busin') || norm.includes('commercial') || norm.includes('msme') || norm.includes('sme')) {
    return 'business_loan';
  }
  if (norm.includes('person') || norm.includes('salary') || norm.includes('salaried')) {
    return 'personal_salary_loan';
  }

  // Exact option value pass-through if already internal key
  const validEnums = [
    'personal_salary_loan',
    'business_loan',
    'doctor_loan',
    'home_loan',
    'mortgage_loan',
    'education_loan_india',
    'education_loan_global'
  ];
  if (validEnums.includes(norm)) {
    return norm;
  }

  return '';
}

/**
 * Safely parses loan amount into a numeric value as required by HubSpot's number field type.
 */
function parseLoanAmount(amount) {
  if (typeof amount === 'number') {
    return Number.isFinite(amount) ? amount : null;
  }
  if (!amount || typeof amount !== 'string') return null;
  const cleaned = amount.replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Normalizes lead status to HubSpot internal uppercase enumeration.
 * Initial lead status is strictly 'NEW'.
 */
function mapLeadStatus(status) {
  if (!status || typeof status !== 'string') return 'NEW';
  const norm = status.trim().toUpperCase();
  const validStatuses = [
    'NEW',
    'OPEN',
    'IN_PROGRESS',
    'OPEN_DEAL',
    'UNQUALIFIED',
    'ATTEMPTED_TO_CONTACT',
    'CONNECTED',
    'BAD_TIMING'
  ];
  if (validStatuses.includes(norm)) {
    return norm;
  }
  return 'NEW';
}

async function syncToHubSpot(meta) {
  try {
    const token = await getAccessToken();
    const nameParts = (meta.name || '').split(' ');
    const properties = {
      email                      : meta.email || '',
      phone                      : meta.phone || '',
      firstname                  : nameParts[0] || '',
      lastname                   : nameParts.slice(1).join(' ') || '',
      city                       : meta.city || '',
      loan_type                  : mapLoanTypeToHubSpot(meta.loanType || meta.loanProduct),
      what_is_your_monthly_income: meta.monthlyIncomeRange || meta.monthlyIncome || '',
      lead_id                    : meta.leadId || meta.avaniLeadId || '',
      hs_lead_status             : mapLeadStatus(meta.status || 'NEW')
    };

    const numAmount = parseLoanAmount(meta.amount);
    if (numAmount !== null) {
      properties.loan_amount_required = numAmount;
    }

    const body = { properties };

    const hubRes = await axios.post(
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
    return hubRes.data;
  } catch (err) {
    // Non‑fatal – log and continue
    console.error('[hubspot] Sync error (non‑fatal):', err.response?.data || err.message);
    return { error: true, data: err.response?.data || err.message };
  }
}

module.exports = {
  syncToHubSpot,
  mapLoanTypeToHubSpot,
  parseLoanAmount,
  mapLeadStatus
};
