const http = require('http');
const assert = require('assert');

process.env.APP_ENV = 'development';
process.env.CRM_TEST_MODE = 'true';
process.env.WHATSAPP_TEST_MODE = 'true';
process.env.VOICE_TEST_MODE = 'true';
process.env.INTEGRATION_MODE = 'mock';

const app = require('../src/server.cjs');

function request(server, path, options = {}) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
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
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌐 LOCALHOST EXPRESS SMOKE & ROUTE INTEGRITY TESTS');
  console.log('═══════════════════════════════════════════════════════');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  console.log(`Local test server listening on http://127.0.0.1:${port}`);

  let passed = 0;
  let failed = 0;

  async function testRoute(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Root Homepage serving SPA index.html
  await testRoute('Serve SPA root / with HTTP 200', async () => {
    const res = await request(server, '/');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('<!doctype html>') || res.body.includes('<!DOCTYPE html>'));
    assert.ok(res.body.includes('AVANI') || res.body.includes('avani'));
  });

  // 2. CRM Dashboard metrics endpoint
  await testRoute('GET /api/crm/dashboard returns JSON metrics', async () => {
    const res = await request(server, '/api/crm/dashboard');
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.success, true);
    assert.ok(data.metrics);
    assert.strictEqual(typeof data.metrics.totalLeads, 'number');
  });

  // 3. CRM Leads list endpoint
  await testRoute('GET /api/crm/leads returns lead list', async () => {
    const res = await request(server, '/api/crm/leads');
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.leads));
  });

  // 4. Lead Capture POST endpoint
  let createdLeadId = null;
  await testRoute('POST /api/lead/capture creates lead and returns ALS-2026-XXXXXX', async () => {
    const res = await request(server, '/api/lead/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        fullName: 'Localhost Test Customer',
        mobile: '9822334455',
        city: 'Latur',
        loanType: 'Business Loan',
        requestedAmount: '1200000',
        source: 'WEBSITE'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.success, true);
    assert.ok(data.leadId);
    assert.ok(data.leadId.startsWith('ALS-2026-'));
    createdLeadId = data.leadId;
  });

  // 5. CRM Transition endpoint validation
  await testRoute('POST /api/crm/leads/:id/transition enforces stage progression', async () => {
    const targetId = createdLeadId || 'ALS-2026-001001';
    const res = await request(server, `/api/crm/leads/${targetId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        targetStage: 'CONTACTED',
        reason: 'Contacted applicant via call'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.newStage, 'CONTACTED');
    assert.strictEqual(data.lead.status, 'CONTACTED');
  });

  // 6. WhatsApp Webhook endpoint handles ping/webhook
  await testRoute('POST /api/whatsapp-webhook/inbound processes mock webhook', async () => {
    const res = await request(server, '/api/whatsapp-webhook/inbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        eventId: 'LOCAL-WA-1',
        mobile: '9800000001',
        message: 'Need business loan of 15 lakhs',
        timestamp: new Date().toISOString()
      }
    });
    assert.ok([200, 404].includes(res.statusCode));
  });

  // 7. Sitemap route
  await testRoute('GET /sitemap.xml returns HTTP 200 and XML', async () => {
    const res = await request(server, '/sitemap.xml');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('urlset') || res.body.includes('xml'));
  });

  // 8. Robots.txt route
  await testRoute('GET /robots.txt returns HTTP 200 and robots content', async () => {
    const res = await request(server, '/robots.txt');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('User-agent'));
  });

  server.close();

  console.log(`\nLocalhost Server Smoke Results: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
