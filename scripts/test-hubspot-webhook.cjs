// scripts/test-hubspot-webhook.cjs
// ─────────────────────────────────────────────────────────────────
// HubSpot Webhook Receiver Forensic Test Suite (32 Test Cases)
// AVANI LOAN SERVICES — AUTHORITATIVE PRODUCTION REPOSITORY
// Strictly Synthetic Test Data Only
// ─────────────────────────────────────────────────────────────────

// Set test environment flags before loading server
process.env.VERCEL = '1';
const TEST_CLIENT_SECRET = 'test_authoritative_hubspot_secret_for_validation_2026';
process.env.HUBSPOT_CLIENT_SECRET = TEST_CLIENT_SECRET;
process.env.HUBSPOT_PORTAL_ID = '244236573';

const http = require('http');
const app = require('../src/server.cjs');
const { computeHubspotSignatureV3 } = require('../src/utils/hubspotSignature.cjs');
const webhookInboxModule = require('../src/models/WebhookInbox.cjs');

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
  console.log('AVANI LOAN SERVICES — AUTHORITATIVE HUBSPOT WEBHOOK TEST SUITE');
  console.log('Repository: avani-loan-services (Branch: main)');
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
      recordTest(1, 'Valid Signature V3 accepted', pass, `Status: ${res.status}`);
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
      recordTest(2, 'Missing signature rejected', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
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
      recordTest(3, 'Invalid signature rejected', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
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
      recordTest(4, 'Modified body rejected', pass, `Status: ${res.status}`);
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
      recordTest(5, 'Modified URI rejected', pass, `Status: ${res.status}`);
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
      recordTest(6, 'Modified method rejected', pass, `Status: ${res.status}`);
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
      recordTest(7, 'Wrong secret rejected', pass, `Status: ${res.status}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 2: TIMESTAMP / REPLAY TESTS (8 - 10)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 2: Timestamp & Replay Tests (8 - 10) ---');

    // 8. Fresh timestamp accepted
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
      recordTest(8, 'Fresh timestamp accepted', pass, `Status: ${res.status}`);
    }

    // 9. Stale timestamp rejected
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
      recordTest(9, 'Stale timestamp rejected', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 10. Invalid timestamp rejected
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
      recordTest(10, 'Invalid timestamp rejected', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 3: IDEMPOTENCY / REPLAY DEDUPLICATION (11 - 13)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 3: Idempotency & Deduplication Tests (11 - 13) ---');

    const uniqueEventId = 999201;

    // 11. First event accepted
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
      recordTest(11, 'First event accepted', pass, `newEvents: ${res.body?.newEvents}, dupes: ${res.body?.duplicatesSuppressed}`);
    }

    // 12. Duplicate suppressed
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
      recordTest(12, 'Duplicate suppressed', pass, `newEvents: ${res.body?.newEvents}, dupes: ${res.body?.duplicatesSuppressed}`);
    }

    // 13. Different event IDs independent
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
      recordTest(13, 'Different event IDs independent', pass, `newEvents: ${res.body?.newEvents}, dupes: ${res.body?.duplicatesSuppressed}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 4: PAYLOAD STRUCTURE & CONTENT TESTS (14 - 17)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 4: Payload Validation Tests (14 - 17) ---');

    // 14. Contact creation accepted
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
      recordTest(14, 'Contact creation accepted', pass, `Status: ${res.status}`);
    }

    // 15. Contact property change accepted
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
      recordTest(15, 'Contact property change accepted', pass, `Status: ${res.status}, property: ${res.body?.results?.[0]?.dispatched?.propertyName}`);
    }

    // 16. Malformed JSON rejected
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
      recordTest(16, 'Malformed JSON rejected', pass, `Status: ${res.status}, Error: ${res.body?.error}`);
    }

    // 17. Missing metadata rejected
    {
      const invalidEventPayload = JSON.stringify([{ someRandomField: 'value', portalId: 244236573 }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, invalidEventPayload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, invalidEventPayload);

      const pass = res.status === 400 && res.body && res.body.code === 'MISSING_EVENT_METADATA';
      recordTest(17, 'Missing metadata rejected', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 5: PORTAL ISOLATION & PERSISTENCE SAFETY (18 - 19)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 5: Portal Isolation & Persistence Safety (18 - 19) ---');

    // 18. Unexpected portal rejected
    {
      const foreignPortalPayload = JSON.stringify([{
        eventId: 999401,
        subscriptionType: 'contact.creation',
        portalId: 999888777, // foreign/unexpected portal
        objectId: 888401
      }]);
      const ts = Date.now().toString();
      const sig = computeHubspotSignatureV3('POST', fullTargetUrl, foreignPortalPayload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, foreignPortalPayload);

      const pass = res.status === 403 && res.body && res.body.code === 'UNAUTHORIZED_PORTAL';
      recordTest(18, 'Unexpected portal rejected', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 19. Persistence failure does not falsely acknowledge processing
    {
      const originalRegister = webhookInboxModule.registerWebhookEvent;
      // Temporarily mock persistence failure
      webhookInboxModule.registerWebhookEvent = async function(eventId, source, payload) {
        if (eventId === 'hs_evt_999501') {
          throw new Error('SIMULATED_DATABASE_IO_FAILURE');
        }
        return originalRegister.apply(this, arguments);
      };

      try {
        const failPayload = JSON.stringify([{
          eventId: 999501,
          subscriptionType: 'contact.creation',
          portalId: 244236573,
          objectId: 888501
        }]);
        const ts = Date.now().toString();
        const sig = computeHubspotSignatureV3('POST', fullTargetUrl, failPayload, ts, TEST_CLIENT_SECRET);
        const res = await makeRequest('POST', webhookPath, {
          'Content-Type': 'application/json',
          'X-HubSpot-Signature-v3': sig,
          'X-HubSpot-Request-Timestamp': ts
        }, failPayload);

        const pass = res.status === 500 && res.body && res.body.code === 'INTERNAL_PERSISTENCE_FAILURE';
        recordTest(19, 'Persistence failure does not falsely acknowledge processing', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
      } finally {
        webhookInboxModule.registerWebhookEvent = originalRegister;
      }
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 6: REGRESSION TESTS (20 - 26)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 6: Authoritative Route Regression Tests (20 - 26) ---');

    // 20. Existing /api/crm/sync unaffected
    {
      const syncPayload = JSON.stringify({
        name: 'Authoritative Synthetic Customer',
        phone: '9999999999',
        email: 'authoritative@test.invalid',
        loanType: 'Personal / Salary Loan'
      });
      const res = await makeRequest('POST', '/api/crm/sync', {
        'Content-Type': 'application/json'
      }, syncPayload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(20, 'Existing /api/crm/sync unaffected', pass, `Status: ${res.status}, success: ${res.body?.success}`);
    }

    // 21. CRM dashboard/leads endpoints unaffected
    {
      const resDash = await makeRequest('GET', '/api/crm/dashboard');
      const resLeads = await makeRequest('GET', '/api/crm/leads');

      const pass = (resDash.status === 200 && resDash.body && resDash.body.success === true) &&
                   (resLeads.status === 200 && resLeads.body && resLeads.body.success === true);
      recordTest(21, 'CRM dashboard/leads endpoints unaffected', pass, `Dashboard: ${resDash.status}, Leads: ${resLeads.status}`);
    }

    // 22. OAuth callback unaffected
    {
      const res = await makeRequest('GET', '/api/auth/hubspot/callback');
      // Should respond 400 with 'Missing code parameter'
      const pass = res.status === 400 && res.rawBody.includes('Missing code parameter');
      recordTest(22, 'OAuth callback unaffected', pass, `Status: ${res.status}, Body: "${res.rawBody.trim()}"`);
    }

    // 23. Meta webhook routes unaffected
    {
      const resMeta = await makeRequest('GET', '/api/meta/webhook');
      const pass = resMeta.status === 400;
      recordTest(23, 'Meta webhook routes unaffected', pass, `Meta: ${resMeta.status}`);
    }

    // 24. WhatsApp webhook routes unaffected
    {
      const resWa = await makeRequest('GET', '/api/whatsapp-webhook/webhook');
      const pass = resWa.status === 403;
      recordTest(24, 'WhatsApp webhook routes unaffected', pass, `WA: ${resWa.status}`);
    }

    // 25. OmniDM routes unaffected
    {
      const resOmni = await makeRequest('GET', '/api/omnidm/webhook');
      const pass = resOmni.status === 400;
      recordTest(25, 'OmniDM routes unaffected', pass, `OmniDM: ${resOmni.status}`);
    }

    // 26. Calculator authentication unaffected
    {
      const resVerify = await makeRequest('GET', '/api/calculator-auth/verify');
      const resLoginBad = await makeRequest('POST', '/api/calculator-auth/login', {
        'Content-Type': 'application/json'
      }, JSON.stringify({}));

      const pass = (resVerify.status === 200 && resVerify.body && resVerify.body.authenticated === false) &&
                   (resLoginBad.status === 400 && resLoginBad.body && resLoginBad.body.success === false);
      recordTest(26, 'Calculator authentication unaffected', pass, `Verify auth: ${resVerify.body?.authenticated}, Login empty: ${resLoginBad.status}`);
    }

    // ═════════════════════════════════════════════════════════════
    // GROUP 7: STRICT HOST & URI HARDENING SECURITY TESTS (27 - 32)
    // ═════════════════════════════════════════════════════════════
    console.log('\n--- Group 7: Host Allowlist & Deterministic URI Security Tests (27 - 32) ---');

    // 27. Approved production host accepted via x-forwarded-host
    {
      const payload = JSON.stringify([{
        eventId: 999601,
        subscriptionType: 'contact.creation',
        portalId: 244236573,
        objectId: 888601
      }]);
      const ts = Date.now().toString();
      const prodUri = 'https://www.avanifinserv.com/api/crm/hubspot/webhook';
      const sig = computeHubspotSignatureV3('POST', prodUri, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts,
        'X-Forwarded-Host': 'www.avanifinserv.com',
        'X-Forwarded-Proto': 'https'
      }, payload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(27, 'Approved production host accepted', pass, `Status: ${res.status}`);
    }

    // 28. Approved 127.0.0.1 host accepted for local tests
    {
      const payload = JSON.stringify([{
        eventId: 999602,
        subscriptionType: 'contact.creation',
        portalId: 244236573,
        objectId: 888602
      }]);
      const ts = Date.now().toString();
      const loopbackUri = `http://127.0.0.1:${port}/api/crm/hubspot/webhook`;
      const sig = computeHubspotSignatureV3('POST', loopbackUri, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts,
        'Host': `127.0.0.1:${port}`
      }, payload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(28, 'Approved 127.0.0.1 host accepted for local tests', pass, `Status: ${res.status}`);
    }

    // 29. Arbitrary attacker host cannot become the verification URI
    {
      const payload = JSON.stringify([{
        eventId: 999603,
        subscriptionType: 'contact.creation',
        portalId: 244236573,
        objectId: 888603
      }]);
      const ts = Date.now().toString();
      const attackerUri = `http://attacker.evil.com/api/crm/hubspot/webhook`;
      const sig = computeHubspotSignatureV3('POST', attackerUri, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts,
        'Host': 'attacker.evil.com'
      }, payload);

      // Server rejects because host attacker.evil.com is not approved and resolves to canonical www.avanifinserv.com
      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(29, 'Arbitrary attacker host cannot become the verification URI', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 30. Arbitrary x-forwarded-host cannot bypass the host restriction
    {
      const payload = JSON.stringify([{
        eventId: 999604,
        subscriptionType: 'contact.creation',
        portalId: 244236573,
        objectId: 888604
      }]);
      const ts = Date.now().toString();
      const attackerForwardedUri = `https://spoofed-proxy.attacker.org/api/crm/hubspot/webhook`;
      const sig = computeHubspotSignatureV3('POST', attackerForwardedUri, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts,
        'X-Forwarded-Host': 'spoofed-proxy.attacker.org',
        'X-Forwarded-Proto': 'https'
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(30, 'Arbitrary x-forwarded-host cannot bypass host restriction', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 31. Arbitrary x-hubspot-request-url cannot bypass the host restriction
    {
      const payload = JSON.stringify([{
        eventId: 999605,
        subscriptionType: 'contact.creation',
        portalId: 244236573,
        objectId: 888605
      }]);
      const ts = Date.now().toString();
      const attackerRequestUrl = `https://unauthorized-domain.com/api/crm/hubspot/webhook`;
      const sig = computeHubspotSignatureV3('POST', attackerRequestUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', webhookPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts,
        'X-HubSpot-Request-Url': attackerRequestUrl
      }, payload);

      const pass = res.status === 401 && res.body && res.body.code === 'INVALID_SIGNATURE';
      recordTest(31, 'Arbitrary x-hubspot-request-url cannot bypass host restriction', pass, `Status: ${res.status}, Code: ${res.body?.code}`);
    }

    // 32. Query parameters remain deterministic
    {
      const payload = JSON.stringify([{
        eventId: 999606,
        subscriptionType: 'contact.creation',
        portalId: 244236573,
        objectId: 888606
      }]);
      const ts = Date.now().toString();
      const queryPath = `${webhookPath}?source=crm&campaign=spring2026`;
      const queryTargetUrl = `http://localhost:${port}${queryPath}`;
      const sig = computeHubspotSignatureV3('POST', queryTargetUrl, payload, ts, TEST_CLIENT_SECRET);
      const res = await makeRequest('POST', queryPath, {
        'Content-Type': 'application/json',
        'X-HubSpot-Signature-v3': sig,
        'X-HubSpot-Request-Timestamp': ts
      }, payload);

      const pass = res.status === 200 && res.body && res.body.success === true;
      recordTest(32, 'Query parameters remain deterministic', pass, `Status: ${res.status}`);
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
    console.log('✅ ALL TEST SCENARIOS PASSED PERFECTLY');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test runner error:', err);
  if (server) server.close();
  process.exit(1);
});
