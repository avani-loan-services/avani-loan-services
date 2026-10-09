// scripts/test-hubspot-webhook.cjs
// ─────────────────────────────────────────────────────────────────
// HubSpot Webhook Receiver Forensic Test Suite (21 Test Cases)
// AVANI LOAN SERVICES — STRICT SYNTHETIC DATA ONLY
// ─────────────────────────────────────────────────────────────────

const http = require('http');
const crypto = require('crypto');

// Set test environment configuration before loading server
process.env.VERCEL = '1';
const TEST_CLIENT_SECRET = 'test_synthetic_hubspot_secret_for_validation_2026';
process.env.HUBSPOT_CLIENT_SECRET = TEST_CLIENT_SECRET;
process.env.HUBSPOT_PORTAL_ID = '244236573';

const app = require('../src/server.cjs');
const { computeHubspotSignatureV3 } = require('../src/utils/hubspotSignature.cjs');

let server;
let baseUrl;
let port;

const testResults = [];

function recordTest(id, name, passed, details = '') {
  testResults.push({ id, name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[Test ${String(id).padStart(2, '0')}] ${mark} — ${name}${details ? ' (' + details + ')' : ''}`);
}

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers }
    };

    if (body !== null && !reqOptions.headers['Content-Length']) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(reqOptions, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(responseData);
        } catch (_) {
          parsed = responseData;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
          rawBody: responseData
        });
      });
    });

    req.on('error', reject);
    if (body !== null) {
      req.write(body);
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('AVANI LOAN SERVICES — HUBSPOT WEBHOOK FORENSIC TEST SUITE');
  console.log('Testing Endpoint: POST /api/crm/hubspot/webhook');
  console.log('Portal ID: 244236573 | Synthetic Data Only');
  console.log('─────────────────────────────────────────────────────────────────\n');

  // Start ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  const webhookPath = '/api/crm/hubspot/webhook';
  const fullTargetUrl = `http://localhost:${port}${webhookPath}`;

  try {
    // ═════════════════════════════════════════════════════════════
    // GROUP 1: AUTHENTICATION TESTS (1 - 7)
    // ═════════════════════════════════════════════════════════════
    console.log('--- Group 1: Authentication Tests (1 - 7) ---');

    // 1. Valid Signature V3 -> accepted
    {
      const payload = JSON.stringify([{
        eventId: 999101,
        subscriptionId: 501,
        portalId: 244236573,
        occurredAt: Date.now(),
        subscriptionType: 'contact.creation',
        objectId: 888001
      }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(1, 'Valid Signature V3 -> accepted', pass, `Status: ${res.status}`);
    }

    // 2. Missing signature -> rejected (401)
    {
      const payload = JSON.stringify([{ eventId: 999102, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'MISSING_SIGNATURE';
      recordTest(2, 'Missing signature -> rejected (401)', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 3. Invalid signature -> rejected (401)
    {
      const payload = JSON.stringify([{ eventId: 999103, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': 'totally_invalid_signature_base64==',
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(3, 'Invalid signature -> rejected (401)', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 4. Modified body -> rejected (401)
    {
      const originalPayload = JSON.stringify([{ eventId: 999104, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const tamperedPayload = JSON.stringify([{ eventId: 999104, subscriptionType: 'contact.creation', portalId: 244236573, tampered: true }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, originalPayload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, tamperedPayload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(4, 'Modified body -> rejected (401)', pass, `Status: ${res.status}`);
    }

    // 5. Modified URI -> rejected (401)
    {
      const payload = JSON.stringify([{ eventId: 999105, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const forgedUri = `http://localhost:${port}/api/crm/hubspot/other_endpoint`;
      const sig = computeHubspotSignatureV3('POST', forgedUri, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(5, 'Modified URI -> rejected (401)', pass, `Status: ${res.status}`);
    }

    // 6. Modified method -> rejected (401)
    {
      const payload = JSON.stringify([{ eventId: 999106, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('GET', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(6, 'Modified method -> rejected (401)', pass, `Status: ${res.status}`);
    }

    // 7. Wrong secret -> rejected (401)
    {
      const payload = JSON.stringify([{ eventId: 999107, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const wrongSecret = 'wrong_adversary_secret_key_12345';
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, wrongSecret);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(7, 'Wrong secret -> rejected (401)', pass, `Status: ${res.status}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 2: TIMESTAMP / REPLAY TESTS (8 - 10)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 2: Timestamp & Replay Tests (8 - 10) ---');

    // 8. Fresh timestamp -> accepted (200)
    {
      const payload = JSON.stringify([{ eventId: 999108, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const ts = (Date.now() - 5000).toString(); // 5 seconds ago
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(8, 'Fresh timestamp -> accepted (200)', pass, `Status: ${res.status}`);
    }

    // 9. Stale timestamp -> rejected (400)
    {
      const payload = JSON.stringify([{ eventId: 999109, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const staleTs = (Date.now() - 10 * 60 * 1000).toString(); // 10 minutes ago
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, staleTs, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': staleTs
      }, payload);

      const pass = res.status === 400 && res.body && res.body.code === 'TIMESTAMP_EXPIRED';
      recordTest(9, 'Stale timestamp -> rejected (400 TIMESTAMP_EXPIRED)', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 10. Invalid timestamp format -> rejected (400)
    {
      const payload = JSON.stringify([{ eventId: 999110, subscriptionType: 'contact.creation', portalId: 244236573 }]);
      const invalidTs = 'not-a-timestamp-123';
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, invalidTs, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': invalidTs
      }, payload);

      const pass = res.status === 400 && res.body && res.body.code === 'INVALID_TIMESTAMP_FORMAT';
      recordTest(10, 'Invalid timestamp format -> rejected (400 INVALID_TIMESTAMP_FORMAT)', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 3: IDEMPOTENCY / REPLAY DEDUPLICATION (11 - 13)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 3: Idempotency & Deduplication Tests (11 - 13) ---');

    const uniqueEventId = 999201;

    // 11. First valid event -> processed
    {
      const payload = JSON.stringify([{
        eventId: uniqueEventId,
        subscriptionId: 601,
        portalId: 244236573,
        occurredAt: Date.now(),
        subscriptionType: 'contact.creation',
        objectId: 888201
      }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.newEvents === 1 && res.body.duplicatesSuppressed === 0;
      recordTest(11, 'First valid event -> processed', pass, `newEvents: ${res.body?.newEvents}, dupes: ${res.body?.duplicatesSuppressed}`);
    }

    // 12. Exact duplicate event -> not processed twice
    {
      const payload = JSON.stringify([{
        eventId: uniqueEventId,
        subscriptionId: 601,
        portalId: 244236573,
        occurredAt: Date.now(),
        subscriptionType: 'contact.creation',
        objectId: 888201
      }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.newEvents === 0 && res.body.duplicatesSuppressed === 1 && res.body.results[0].status === 'DUPLICATE_SUPPRESSED';
      recordTest(12, 'Exact duplicate event -> suppressed (200)', pass, `newEvents: ${res.body?.newEvents}, dupes: ${res.body?.duplicatesSuppressed}`);
    }

    // 13. Different event IDs -> processed independently
    {
      const payload = JSON.stringify([
        { eventId: 999202, subscriptionType: 'contact.creation', portalId: 244236573, objectId: 888202 },
        { eventId: 999203, subscriptionType: 'contact.propertyChange', portalId: 244236573, objectId: 888203, propertyName: 'city', propertyValue: 'Latur' }
      ]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.newEvents === 2 && res.body.duplicatesSuppressed === 0;
      recordTest(13, 'Different event IDs -> processed independently', pass, `newEvents: ${res.body?.newEvents}, dupes: ${res.body?.duplicatesSuppressed}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 4: PAYLOAD STRUCTURE & CONTENT TESTS (14 - 17)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 4: Payload Validation Tests (14 - 17) ---');

    // 14. Valid contact creation event
    {
      const payload = JSON.stringify([{
        eventId: 999301,
        subscriptionId: 701,
        portalId: 244236573,
        occurredAt: Date.now(),
        subscriptionType: 'contact.creation',
        objectId: 888301,
        changeSource: 'CRM',
        changeFlag: 'NEW'
      }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.results[0].status === 'PROCESSED';
      recordTest(14, 'Valid contact creation event', pass, `Status: ${res.status}`);
    }

    // 15. Valid contact property-change event
    {
      const payload = JSON.stringify([{
        eventId: 999302,
        subscriptionId: 702,
        portalId: 244236573,
        occurredAt: Date.now(),
        subscriptionType: 'contact.propertyChange',
        objectId: 888301,
        propertyName: 'loan_amount',
        propertyValue: '2500000',
        changeSource: 'CRM'
      }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.results[0].dispatched.propertyName === 'loan_amount';
      recordTest(15, 'Valid contact property-change event', pass, `Status: ${res.status}, property: ${res.body?.results?.[0]?.dispatched?.propertyName}`);
    }

    // 16. Malformed JSON/body -> rejected (400)
    {
      const badJson = '{"brokenJson": true, ';
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, badJson, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, badJson);

      const pass = res.status === 400 && res.body && (res.body.error === 'Malformed JSON payload' || res.body.code === 'MALFORMED_PAYLOAD');
      recordTest(16, 'Malformed JSON/body -> rejected (400)', pass, `Status: ${res.status}, Error: ${res.body?.error}`);
    }

    // 17. Missing required event metadata -> rejected (400)
    {
      // Missing eventId and subscriptionType
      const invalidEventPayload = JSON.stringify([{ someRandomField: 'value', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, invalidEventPayload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, invalidEventPayload);

      const pass = res.status === 400 && res.body && res.body.code === 'MISSING_EVENT_METADATA';
      recordTest(17, 'Missing required event metadata -> rejected (400 MISSING_EVENT_METADATA)', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 5: REGRESSION TESTS (18 - 21)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 5: Regression Tests (18 - 21) ---');

    // 18. Existing /api/crm/sync still works
    {
      const syncPayload = JSON.stringify({
        name: 'Synthetic Test Customer',
        phone: '9999999999',
        email: 'synthetic@test.invalid',
        loanType: 'Personal / Salary Loan'
      });
      const res = await makeRequest('POST', '/api/crm/sync', {
        'Content-Type': 'application/json'
      }, syncPayload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(18, 'Existing /api/crm/sync still works', pass, `Status: ${res.status}, success: ${res.body?.success}`);
    }

    // 19. Existing /api/auth/hubspot/callback remains unchanged
    {
      const res = await makeRequest('GET', '/api/auth/hubspot/callback');
      // Should respond 400 with 'Missing code parameter' without modifying behavior
      const pass = res.status === 400 && res.rawBody.includes('Missing code parameter');
      recordTest(19, 'Existing /api/auth/hubspot/callback remains unchanged', pass, `Status: ${res.status}, Body: "${res.rawBody.trim()}"`);
    }

    // 20. Existing WhatsApp / Meta / OmniDM routes unaffected
    {
      const resMeta = await makeRequest('GET', '/api/meta/webhook');
      const resWa = await makeRequest('GET', '/api/whatsapp-webhook/webhook');
      // Meta GET without hub.mode returns 400, WA GET without mode returns 403
      const pass = (resMeta.status === 400) && (resWa.status === 403);
      recordTest(20, 'Existing WhatsApp / Meta / OmniDM routes unaffected', pass, `Meta: ${resMeta.status}, WA: ${resWa.status}`);
    }

    // 21. Existing calculators / tests unaffected
    {
      const resVerify = await makeRequest('GET', '/api/calculator-auth/verify');
      const resLoginBad = await makeRequest('POST', '/api/calculator-auth/login', {
        'Content-Type': 'application/json'
      }, JSON.stringify({}));
      // Unauthenticated verify returns 200 with { authenticated: false }, empty login returns 400
      const pass = (resVerify.status === 200 && resVerify.body && resVerify.body.authenticated === false) &&
                   (resLoginBad.status === 400 && resLoginBad.body && resLoginBad.body.success === false);
      recordTest(21, 'Existing calculators / tests unaffected', pass, `Verify auth: ${resVerify.body?.authenticated}, Login empty: ${resLoginBad.status}`);
    }

  } finally {
    if (server) {
      server.close();
    }
  }

  // Final Summary
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('FORENSIC TEST SUITE EXECUTION SUMMARY');
  console.log('─────────────────────────────────────────────────────────────────');
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;

  console.log(`TOTAL TESTS: ${testResults.length}`);
  console.log(`PASSED:      ${passedCount}`);
  console.log(`FAILED:      ${failedCount}`);
  console.log(`SKIPPED:     0`);
  console.log('─────────────────────────────────────────────────────────────────');

  if (failedCount > 0) {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  } else {
    console.log('✅ ALL 21 TEST SCENARIOS PASSED PERFECTLY');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test runner error:', err);
  if (server) server.close();
  process.exit(1);
});
