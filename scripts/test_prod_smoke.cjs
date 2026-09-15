// scripts/test_prod_smoke.cjs
const axios = require('axios');

async function smokeTest() {
  console.log('====================================================');
  console.log('🚀 RUNNING PRODUCTION SMOKE TEST ON https://www.avanifinserv.com');
  console.log('====================================================\n');

  const tests = [
    {
      name: 'Homepage',
      url: 'https://www.avanifinserv.com/',
      method: 'get',
      expectedStatus: 200
    },
    {
      name: 'API Health Endpoint',
      url: 'https://www.avanifinserv.com/api/eligibility/health',
      method: 'get',
      expectedStatus: 200
    },
    {
      name: 'HubSpot OAuth Callback (no code)',
      url: 'https://www.avanifinserv.com/api/auth/hubspot/callback',
      method: 'get',
      expectedStatus: 400
    },
    {
      name: 'Meta Webhook GET Challenge',
      url: 'https://www.avanifinserv.com/api/meta/webhook?hub.mode=subscribe&hub.verify_token=AVANI_META_VERIFY_TOKEN_2026&hub.challenge=PROD_SMOKE_META_99',
      method: 'get',
      expectedStatus: 200,
      expectedBody: 'PROD_SMOKE_META_99'
    },
    {
      name: 'WhatsApp Webhook GET Challenge',
      url: 'https://www.avanifinserv.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=avani_loan_verify_token_1356&hub.challenge=PROD_SMOKE_WA_88',
      method: 'get',
      expectedStatus: 200,
      expectedBody: 'PROD_SMOKE_WA_88'
    },
    {
      name: 'Services Page',
      url: 'https://www.avanifinserv.com/services',
      method: 'get',
      expectedStatus: 200
    },
    {
      name: 'Calculators Page',
      url: 'https://www.avanifinserv.com/calculators',
      method: 'get',
      expectedStatus: 200
    },
    {
      name: 'Sitemap XML',
      url: 'https://www.avanifinserv.com/sitemap.xml',
      method: 'get',
      expectedStatus: 200
    }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await axios[t.method](t.url, { validateStatus: () => true });
      const statusMatch = res.status === t.expectedStatus;
      const bodyMatch = t.expectedBody ? String(res.data) === t.expectedBody : true;
      const pass = statusMatch && bodyMatch;
      console.log(`[${t.name}] HTTP ${res.status} ${pass ? '✅ PASS' : '❌ FAIL'}`);
      if (pass) passed++;
    } catch (err) {
      console.log(`[${t.name}] Error: ${err.message} ❌ FAIL`);
    }
  }

  console.log('\n====================================================');
  console.log(`SMOKE TEST SUMMARY: ${passed}/${tests.length} PASSED`);
  console.log('====================================================');
  if (passed !== tests.length) process.exit(1);
}

smokeTest();
