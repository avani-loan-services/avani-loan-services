#!/usr/bin/env node
/**
 * create_hubspot_form.js
 *
 * Small Node script to create a HubSpot form via the Forms API.
 * Usage (private app token):
 *   HUBSPOT_API_KEY=your_private_app_token node scripts/create_hubspot_form.js
 * Or using legacy HAPI key:
 *   HUBSPOT_HAPIKEY=your_hapikey node scripts/create_hubspot_form.js
 *
 * After running the script successfully, copy the printed form id into your
 * project's `.env` as `VITE_HUBSPOT_FORM_ID=<formId>` and restart the dev server.
 */

const https = require('https');
const { URL } = require('url');

const HAPIKEY = process.env.HUBSPOT_HAPIKEY; // legacy
const API_KEY = process.env.HUBSPOT_API_KEY; // private app token (recommended)
const PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || '244236573';

if (!HAPIKEY && !API_KEY) {
  console.error('Missing HubSpot credentials. Set HUBSPOT_API_KEY or HUBSPOT_HAPIKEY.');
  process.exit(1);
}

const urlBase = HAPIKEY ? `https://api.hubapi.com/forms/v2/forms?hapikey=${HAPIKEY}` : 'https://api.hubapi.com/forms/v2/forms';

const payload = {
  name: `Avani Lead Form - ${new Date().toISOString()}`,
  cssClass: 'hs-form stacked',
  submitText: 'Get Free Consultation',
  method: 'POST',
  redirect: '',
  formFieldGroups: [
    {
      fields: [
        { name: 'full_name', label: 'Full Name', type: 'string', fieldType: 'text', required: true },
        { name: 'phone', label: 'Mobile Number', type: 'string', fieldType: 'text', required: true },
        { name: 'email', label: 'Email', type: 'string', fieldType: 'email', required: true },
        {
          name: 'loan_type',
          label: 'Loan Type',
          type: 'string',
          fieldType: 'select',
          required: false,
          options: [
            { label: 'Personal Loan', value: 'personal' },
            { label: 'Business Loan', value: 'business' },
            { label: 'Home Loan', value: 'home' },
            { label: 'Education Loan', value: 'education' },
            { label: 'Mortgage/LAP', value: 'mortgage' },
            { label: 'Doctor Loan', value: 'doctor' }
          ]
        },
        { name: 'loan_amount', label: 'Loan Amount', type: 'string', fieldType: 'text', required: false },
        { name: 'city', label: 'City', type: 'string', fieldType: 'text', required: false }
      ]
    }
  ]
};

function postJson(urlStr, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers)
    };

    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsedBody = null;
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
        resolve({ status: res.statusCode, body: parsedBody });
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('Creating HubSpot form for portal:', PORTAL_ID);
    const headers = {};
    if (API_KEY && !HAPIKEY) headers['Authorization'] = `Bearer ${API_KEY}`;

    const res = await postJson(urlBase, payload, headers);
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.body, null, 2));

    const createdId = res.body && (res.body.guid || res.body.formId || res.body.id);
    if (createdId) {
      console.log('\nForm created successfully.');
      console.log('Copy this id into your project .env as:');
      console.log(`VITE_HUBSPOT_FORM_ID=${createdId}`);
      console.log('\nThen restart `npm run dev` or rebuild the site.');
    } else {
      console.warn('Could not find a form id in the response. Inspect the response above.');
    }
  } catch (err) {
    console.error('Failed to create form:', err);
    process.exit(1);
  }
})();
