/**
 * Isolated Synthetic Website-to-CRM Contract Test (Phase 3 / Phase 11)
 * Verifies api/save-lead.js against an in-process mock CRM /api/public/enquiry server.
 * Zero real customer data, zero production network calls, zero WhatsApp/call side effects.
 */
import http from 'node:http';
import assert from 'node:assert/strict';

let capturedRequests = [];
const mockCrm = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', () => {
    const body = raw ? JSON.parse(raw) : {};
    capturedRequests.push({ method: req.method, url: req.url, body });
    if (req.url === '/api/public/enquiry' && req.method === 'POST') {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        leadId: 'AVL-20261116-999001',
        message: 'Thank you. Your loan enquiry has been registered safely.'
      }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Not found' }));
  });
});

function createMockRes() {
  const headers = {};
  let statusCode = 200;
  let payload = null;
  return {
    setHeader(k, v) { headers[k] = v; },
    status(code) { statusCode = code; return this; },
    json(data) { payload = data; return this; },
    get result() { return { statusCode, headers, payload }; }
  };
}

await new Promise((resolve) => mockCrm.listen(0, '127.0.0.1', resolve));
const port = mockCrm.address().port;
process.env.AVANI_CRM_URL = `http://127.0.0.1:${port}`;
delete process.env.PICKY_ASSIST_URL;
delete process.env.GOOGLE_SHEET_APP_SCRIPT_URL;
delete process.env.GOOGLE_WEB_APP_URL;
delete process.env.PABBLY_CONNECT_URL;
delete process.env.ZAPIER_WEBHOOK_URL;

const { default: handler } = await import('../api/save-lead.js');

try {
  // 1. Reject GET
  const r1 = createMockRes();
  await handler({ method: 'GET', body: {} }, r1);
  assert.equal(r1.result.statusCode, 405);

  // 2. Reject missing mandatory fields
  const r2 = createMockRes();
  await handler({ method: 'POST', body: { name: 'Test User' } }, r2);
  assert.equal(r2.result.statusCode, 400);

  // 3. Reject invalid phone
  const r3 = createMockRes();
  await handler({ method: 'POST', body: { name: 'Synthetic Test', phone: '12345' } }, r3);
  assert.equal(r3.result.statusCode, 400);

  // 4. Reject denied DPDP consent
  const r4 = createMockRes();
  await handler({ method: 'POST', body: { name: 'Synthetic Test', phone: '9876543210', consent: false } }, r4);
  assert.equal(r4.result.statusCode, 403);

  // 5. Valid synthetic submission -> calls /api/public/enquiry and accepts HTTP 201
  const idemKey = `IDEMP-SYNTH-${Date.now()}`;
  const r5 = createMockRes();
  await handler({
    method: 'POST',
    body: {
      name: 'Synthetic Test Applicant',
      phone: '9876543210',
      loanType: 'Doctor / Medical Professional Loan',
      city: 'Pune',
      consent: true,
      idempotencyKey: idemKey
    }
  }, r5);
  assert.equal(r5.result.statusCode, 200);
  assert.equal(r5.result.payload.success, true);
  assert.equal(r5.result.payload.syncResults.crm, true);
  assert.equal(r5.result.payload.leadId, 'AVL-20261116-999001');
  assert.equal(r5.result.payload.productCategory, 'DOCTOR_LOAN');
  assert.equal(capturedRequests.length, 1);
  assert.equal(capturedRequests[0].url, '/api/public/enquiry');
  assert.equal(capturedRequests[0].body.phone, '+919876543210');
  assert.equal(capturedRequests[0].body.consent, true);
  assert.equal(capturedRequests[0].body.consentStatus, 'GRANTED');
  assert.equal(capturedRequests[0].body.idempotencyKey, idemKey);

  // 6. Duplicate submission within 30s window -> absorbed by idempotency cache without re-posting
  const r6 = createMockRes();
  await handler({
    method: 'POST',
    body: {
      name: 'Synthetic Test Applicant',
      phone: '9876543210',
      loanType: 'Doctor / Medical Professional Loan',
      consent: true,
      idempotencyKey: idemKey
    }
  }, r6);
  assert.equal(r6.result.statusCode, 200);
  assert.equal(r6.result.payload.idempotencyHit, true);
  assert.equal(capturedRequests.length, 1);

  console.log('PASS: Website-to-CRM /api/public/enquiry contract tests (6/6 passed)');
} finally {
  mockCrm.close();
}
