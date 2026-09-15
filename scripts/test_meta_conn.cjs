// scripts/test_meta_conn.cjs
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read from both potential .env locations
function loadEnv() {
  const envObj = {};
  const paths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../1-AVANI LOAN SERVICE FY 26-27/.env')
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      content.split('\n').forEach(l => {
        const parts = l.split('=');
        const k = parts[0]?.trim();
        const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (k && !envObj[k]) envObj[k] = v;
      });
    }
  }
  return envObj;
}

const env = loadEnv();
const wabaId = env.META_WABA_ID || env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1062614709598311';
const token = env['META_ACCESS_TOKEN(WHATSAPP_ACCESS_TOKEN'] || env.META_ACCESS_TOKEN || env.WHATSAPP_ACCESS_TOKEN;
const phoneId = env.WHATSAPP_PHONE_NUMBER_ID || '1147494668457940';

console.log('--- META WABA LIVE CONNECTION TEST ---');
console.log('WABA ID:', wabaId);
console.log('Phone ID:', phoneId);
console.log('Token Prefix:', token ? token.substring(0, 15) + '...' : 'MISSING');

async function checkMeta() {
  if (!token) {
    console.log('No Meta token found.');
    return;
  }
  try {
    const res = await axios.get(`https://graph.facebook.com/v20.0/${wabaId}/message_templates?limit=15`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Meta API Call SUCCESS! Status:', res.status);
    console.log('Total Templates Found in WABA:', res.data.data ? res.data.data.length : 0);
    if (res.data.data) {
      res.data.data.forEach((t, i) => {
        console.log(`${i + 1}. [${t.status}] ${t.name} (Category: ${t.category}, Lang: ${t.language}, ID: ${t.id})`);
      });
    }
  } catch (err) {
    console.error('Meta API Error:', err.response?.status, err.response?.data || err.message);
  }
}

checkMeta();
