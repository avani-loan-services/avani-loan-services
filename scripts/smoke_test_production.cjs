/**
 * Production Smoke Test Script for AVANI LOAN SERVICES
 * Verifies live deployment on https://www.avanifinserv.com
 */
const https = require('https');

const BASE_URL = 'https://www.avanifinserv.com';

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AVANI-SMOKE-PROBE/3.0',
        ...(options.headers || {})
      },
      timeout: 15000
    };

    const req = https.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout requesting ${path}`));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSmokeTests() {
  console.log('===============================================================');
  console.log(`🚀 RUNNING PRODUCTION SMOKE TESTS ON: ${BASE_URL}`);
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const pagesToTest = [
    { path: '/', name: 'Homepage' },
    { path: '/loan-products', name: 'Loan Products (11 products)' },
    { path: '/catalog', name: 'Catalog Route (Alias)' },
    { path: '/assets', name: 'Asset Library' },
    { path: '/asset-library', name: 'Asset Library (Alias)' },
    { path: '/campaigns', name: 'Campaign Builder' },
    { path: '/publishing-queue', name: 'Publishing Queue' },
    { path: '/templates', name: 'Templates Studio' }
  ];

  console.log('--- 1. Frontend Route Availability & Content Checks ---');
  for (const p of pagesToTest) {
    try {
      const res = await fetchUrl(p.path);
      assert(res.statusCode === 200, `${p.name} [${p.path}] returned HTTP 200`);
      assert(!res.body.toLowerCase().includes('agro foods') && !res.body.toLowerCase().includes('moringa'), `${p.name} zero foreign agro contamination`);
      assert(res.body.includes('AVANI') || res.body.includes('Avani') || res.body.includes('avanifinserv.com'), `${p.name} contains Avani branding`);
    } catch (err) {
      assert(false, `${p.name} [${p.path}] error: ${err.message}`);
    }
  }

  console.log('\n--- 2. Production API Endpoints ---');

  // Stats
  try {
    const res = await fetchUrl('/api/templates/stats');
    assert(res.statusCode === 200, 'GET /api/templates/stats returned HTTP 200');
    const json = JSON.parse(res.body);
    const bizId = json.businessId || (json.stats && json.stats.businessId);
    assert(bizId === 'avani-loan-services', 'Tenant ID is avani-loan-services');
    assert(json.success === true, 'Stats returned success: true');
  } catch (err) {
    assert(false, `GET /api/templates/stats failed: ${err.message}`);
  }

  // Products
  try {
    const res = await fetchUrl('/api/templates/products');
    assert(res.statusCode === 200, 'GET /api/templates/products returned HTTP 200');
    const json = JSON.parse(res.body);
    assert(json.success === true && json.count === 10, `GET /api/templates/products returns exactly 10 base products (got ${json.count})`);
  } catch (err) {
    assert(false, `GET /api/templates/products failed: ${err.message}`);
  }

  // Assets
  try {
    const res = await fetchUrl('/api/templates/assets');
    assert(res.statusCode === 200, 'GET /api/templates/assets returned HTTP 200');
    const json = JSON.parse(res.body);
    assert(json.success === true, 'GET /api/templates/assets returned success: true');
    assert(json.businessId === 'avani-loan-services', 'Media assets scoped to avani-loan-services');
  } catch (err) {
    assert(false, `GET /api/templates/assets failed: ${err.message}`);
  }

  // Campaigns
  try {
    const res = await fetchUrl('/api/templates/campaigns');
    assert(res.statusCode === 200, 'GET /api/templates/campaigns returned HTTP 200');
    const json = JSON.parse(res.body);
    assert(json.success === true, 'GET /api/templates/campaigns returned success: true');
  } catch (err) {
    assert(false, `GET /api/templates/campaigns failed: ${err.message}`);
  }

  // Publishing Queue
  try {
    const res = await fetchUrl('/api/templates/publishing-queue');
    assert(res.statusCode === 200, 'GET /api/templates/publishing-queue returned HTTP 200');
    const json = JSON.parse(res.body);
    assert(json.success === true, 'GET /api/templates/publishing-queue returned success: true');
  } catch (err) {
    assert(false, `GET /api/templates/publishing-queue failed: ${err.message}`);
  }

  // Tenant Security & Firewall check
  try {
    const res = await fetchUrl('/api/templates/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        businessId: 'avani-agro-foods',
        content: 'Test content with moringa'
      }
    });
    assert(res.statusCode === 403, 'POST foreign businessId blocked with HTTP 403 Forbidden');
  } catch (err) {
    assert(false, `Tenant firewall check failed: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(`📊 PRODUCTION SMOKE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests();
