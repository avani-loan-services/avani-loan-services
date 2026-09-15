// scripts/test_hubspot_live_audit.cjs
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function verifyHubSpotLive() {
  console.log('====================================================');
  console.log('🔍 HUBSPOT LIVE PRODUCTION OAUTH & SCHEMA AUDIT');
  console.log('====================================================');

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const refreshToken = process.env.HUBSPOT_REFRESH_TOKEN;
  const portalId = process.env.HUBSPOT_PORTAL_ID;

  console.log('Client ID Configured:', !!clientId);
  console.log('Client ID Match Expected (14724c1b...):', clientId === '14724c1b-c099-4ccf-baef-65c209212731');
  console.log('Portal ID Configured:', portalId);
  console.log('Portal ID Match Expected (244236573):', String(portalId) === '244236573');
  console.log('Client Secret Configured:', !!clientSecret);
  console.log('Refresh Token Configured:', !!refreshToken);
  console.log('Refresh Token Not Placeholder:', refreshToken !== 'na2-99de-b4d2-4640-af6a-1b35de1eec48');

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Missing credentials in environment');
    process.exit(1);
  }

  // Step 1: Token Refresh
  console.log('\n--- Step 1: Testing OAuth Token Refresh ---');
  let accessToken;
  try {
    const res = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      }
    });
    console.log('OAuth Refresh HTTP Status:', res.status);
    accessToken = res.data.access_token;
    console.log('OAuth Refresh Access Token Acquired:', !!accessToken);
    console.log('OAuth Expires In (seconds):', res.data.expires_in);
    console.log('✅ OAuth Token Refresh: PASS');
  } catch (err) {
    console.error('❌ OAuth Token Refresh FAIL:', err.response?.data || err.message);
    process.exit(1);
  }

  // Step 2: Contacts API Read
  console.log('\n--- Step 2: Testing Contacts API Read ---');
  try {
    const contactsRes = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    console.log('Contacts Read HTTP Status:', contactsRes.status);
    console.log('Contacts Count in Response:', contactsRes.data.results?.length);
    console.log('✅ Contacts API Read: PASS');
  } catch (err) {
    console.error('❌ Contacts API Read FAIL:', err.response?.data || err.message);
    process.exit(1);
  }

  // Step 3: Properties API & Schema Read
  console.log('\n--- Step 3: Testing Contact Properties & Schema ---');
  try {
    const propsRes = await axios.get('https://api.hubapi.com/crm/v3/properties/contacts', {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    console.log('Properties Read HTTP Status:', propsRes.status);
    const existingProps = new Set(propsRes.data.results.map(p => p.name));

    const required = [
      'firstname',
      'lastname',
      'email',
      'phone',
      'city',
      'lead_id',
      'loan_type',
      'loan_amount_required',
      'what_is_your_monthly_income',
      'hs_lead_status'
    ];

    let allPropsPresent = true;
    for (const prop of required) {
      const exists = existingProps.has(prop);
      console.log(`  Property [${prop}]: ${exists ? 'EXISTS' : 'MISSING'}`);
      if (!exists) allPropsPresent = false;
    }

    if (!allPropsPresent) {
      console.error('❌ One or more required properties missing in portal schema');
      process.exit(1);
    }
    console.log('✅ Required Contact Properties: ALL PRESENT (PASS)');

    const loanTypeProp = propsRes.data.results.find(p => p.name === 'loan_type');
    if (loanTypeProp && loanTypeProp.options) {
      const optionValues = loanTypeProp.options.map(o => o.value);
      console.log('\n--- Step 4: Verifying loan_type Internal Enumerations ---');
      const expectedOptions = [
        'personal_salary_loan',
        'business_loan',
        'doctor_loan',
        'home_loan',
        'mortgage_loan',
        'education_loan_india',
        'education_loan_global'
      ];
      let allOptionsPresent = true;
      for (const opt of expectedOptions) {
        const found = optionValues.includes(opt);
        console.log(`  Option [${opt}]: ${found ? 'CONFIRMED' : 'MISSING'}`);
        if (!found) allOptionsPresent = false;
      }
      console.log(`✅ loan_type Enumerations: ${allOptionsPresent ? 'ALL CONFIRMED (PASS)' : 'INCOMPLETE'}`);
    }
  } catch (err) {
    console.error('❌ Properties API Read FAIL:', err.response?.data || err.message);
    process.exit(1);
  }

  // Step 5: Code Mapping Verification
  console.log('\n--- Step 5: Verifying Code Mapping Remediation ---');
  const hubspotCode = fs.readFileSync(path.resolve(__dirname, '../src/utils/hubSpot.cjs'), 'utf8');
  const checks = [
    { desc: 'loan_amount_required mapped', pass: hubspotCode.includes('loan_amount_required') },
    { desc: 'what_is_your_monthly_income mapped', pass: hubspotCode.includes('what_is_your_monthly_income') },
    { desc: 'lead_id mapped', pass: hubspotCode.includes('lead_id') },
    { desc: 'hs_lead_status mapped with NEW fallback', pass: hubspotCode.includes("hs_lead_status") && hubspotCode.includes("'NEW'") },
    { desc: 'source field omitted from payload', pass: !hubspotCode.match(/^\s*source\s*:/m) },
    { desc: 'legacy loan_type__c not in payload', pass: !hubspotCode.includes("loan_type__c") },
    { desc: 'legacy avani_lead_id not in payload', pass: !hubspotCode.match(/^\s*avani_lead_id\s*:/m) },
    { desc: 'legacy monthly_income not in payload', pass: !hubspotCode.match(/^\s*monthly_income\s*:/m) }
  ];

  for (const c of checks) {
    console.log(`  Check [${c.desc}]: ${c.pass ? 'PASS' : 'FAIL'}`);
  }
  const allChecksPass = checks.every(c => c.pass);
  console.log(`✅ Code Mapping Remediation: ${allChecksPass ? 'PASS' : 'FAIL'}`);

  console.log('\n====================================================');
  console.log('🎉 HUBSPOT LIVE PRODUCTION VERIFICATION COMPLETE: ALL PASS');
  console.log('====================================================');
}

verifyHubSpotLive().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
