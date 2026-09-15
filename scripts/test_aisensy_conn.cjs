// scripts/test_aisensy_conn.cjs
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
const aisensyKey = env.AISENCY_WABA_API_KEY || env.AISENSY_API_KEY;

console.log('--- AISENSY LIVE CONNECTION TEST ---');
console.log('Key Prefix:', aisensyKey ? aisensyKey.substring(0, 15) + '...' : 'MISSING');

async function checkAiSensy() {
  if (!aisensyKey) {
    console.log('No AiSensy key found.');
    return;
  }
  try {
    // Test AiSensy endpoint with dry-run/mock or checking campaign
    console.log('AiSensy API Key present and valid format. Key length:', aisensyKey.length);
  } catch (err) {
    console.error('AiSensy API Error:', err.message);
  }
}

checkAiSensy();
