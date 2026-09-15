// scripts/test_phase2_prod_smoke.cjs
const axios = require('axios');

async function testPhase2LiveSmoke() {
  console.log('====================================================');
  console.log('🌐 PRODUCTION LIVE SMOKE TEST — AVANI LOAN SERVICES');
  console.log('Base URL: https://www.avanifinserv.com');
  console.log('====================================================\n');

  const BASE_URL = 'https://www.avanifinserv.com';

  const endpoints = [
    { name: '1. Production Homepage', path: '/', method: 'get', expectedStatus: 200 },
    { name: '2. Templates Dashboard Web Page', path: '/templates', method: 'get', expectedStatus: 200 },
    { name: '3. API 10 Products Catalog', path: '/api/templates/products', method: 'get', expectedStatus: 200, check: (data) => data.success && data.count === 10 },
    { name: '4. API Template Engine Stats', path: '/api/templates/stats', method: 'get', expectedStatus: 200, check: (data) => data.success && data.stats },
    { name: '5. API Templates Listing', path: '/api/templates?limit=5', method: 'get', expectedStatus: 200, check: (data) => data.success && Array.isArray(data.items) },
    { name: '6. API Forensic Audit Log', path: '/api/templates/audit', method: 'get', expectedStatus: 200, check: (data) => data.success },
    { name: '7. API JSON Export', path: '/api/templates/export?format=json', method: 'get', expectedStatus: 200, check: (data) => data.businessId === 'avani-loan-services' },
    { name: '8. API CSV Export', path: '/api/templates/export?format=csv', method: 'get', expectedStatus: 200, check: (data) => typeof data === 'string' && data.includes('templateId') },
    { name: '9. API 100 Image Concepts', path: '/api/templates/images', method: 'get', expectedStatus: 200, check: (data) => data.success && data.count === 100 },
    { name: '10. API 300 Video Concepts', path: '/api/templates/videos', method: 'get', expectedStatus: 200, check: (data) => data.success && data.count === 300 },
    { name: '11. API 30-Day Calendar', path: '/api/templates/calendar', method: 'get', expectedStatus: 200, check: (data) => data.success && data.calendar.length === 30 },
    { name: '12. API Calendar CSV', path: '/api/templates/calendar?format=csv', method: 'get', expectedStatus: 200, check: (data) => typeof data === 'string' && data.includes('calendarId') },
    { name: '13. Meta Sync Endpoint', path: '/api/templates/meta/sync', method: 'get', expectedStatus: 200, check: (data) => data.success !== undefined },
    {
      name: '14. API Validation Post',
      path: '/api/templates/validate',
      method: 'post',
      data: {
        template: {
          businessId: 'avani-loan-services',
          templateName: 'als_live_smoke_01',
          product: 'personal_loan',
          channel: 'WHATSAPP',
          headline: 'Personal Loan in Latur',
          body: 'Transparent advisory from Sachin Shinde at Avani Loan Services.',
          cta: 'Apply Now'
        }
      },
      expectedStatus: 200,
      check: (data) => data.success === true
    }
  ];

  let passed = 0;
  for (const ep of endpoints) {
    try {
      const url = `${BASE_URL}${ep.path}`;
      const config = { validateStatus: () => true, timeout: 12000 };
      const res = ep.method === 'post' 
        ? await axios.post(url, ep.data, config)
        : await axios.get(url, config);

      const statusOk = res.status === ep.expectedStatus;
      const dataOk = ep.check ? ep.check(res.data) : true;
      const ok = statusOk && dataOk;

      console.log(`[${ep.name}] HTTP ${res.status} ${ok ? '✅ PASS' : '❌ FAIL'}`);
      if (!ok && !statusOk) console.log(`   Expected ${ep.expectedStatus}, got ${res.status}`);
      if (!ok && !dataOk) console.log(`   Custom validation check failed for payload`);
      if (ok) passed++;
    } catch (err) {
      console.log(`[${ep.name}] Error: ${err.message} ❌ FAIL`);
    }
  }

  console.log('\n====================================================');
  console.log(`LIVE SMOKE SUMMARY: ${passed}/${endpoints.length} PASSED`);
  console.log('====================================================\n');

  if (passed !== endpoints.length) {
    process.exit(1);
  }
}

testPhase2LiveSmoke().catch(err => {
  console.error('Fatal in live smoke test:', err);
  process.exit(1);
});
