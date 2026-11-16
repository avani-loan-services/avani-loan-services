// scripts/verify_four_project_s2s_live.cjs
// Executes authenticated S2S bidirectional integration verification across:
//   Project 1 (svc-loan-api) <-> Project 2 (svc-ai-crm)
//   Project 1 (svc-loan-api) <-> Project 3 (svc-loan-agents)
//   Project 1 (svc-loan-api) <-> Project 4 (svc-ai-calling)
// and records raw sanitised evidence + live remote API probe status.

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const assert = require('assert/strict');

const ROOT_BASE = path.resolve(__dirname, '../..');
const P1_DIR = path.resolve(__dirname, '..');
const P2_ADAPTER = path.join(ROOT_BASE, '3-AVANI AI CRM/src/lib/s2s-node-adapter.cjs');
const P3_ADAPTER = path.join(ROOT_BASE, '4-AVANI LOAN AGENTS/lib/services/s2s-node-adapter.cjs');
const P4_BRIDGE = path.join(ROOT_BASE, '5-AVAVI AI CALLING AGENT/calling-agent-bridge.js');

const EPHEMERAL_TEST_SECRET = crypto.randomBytes(24).toString('hex');
process.env.ECOSYSTEM_SERVICE_SECRET = EPHEMERAL_TEST_SECRET;
process.env.ECOSYSTEM_KEY_ID = 'v1-2026-11';
process.env.NODE_ENV = 'test';

const db = require('../src/models/portalDatabase.cjs');
db.findSessionById = async () => null;
db.appendAuditLog = async () => ({ ok: true });

const integrationsRouter = require('../src/routes/portalIntegrationsRoutes.cjs');
const registry = require('../src/services/ecosystemIntegrationRegistry.cjs');
const { sanitizePayloadForAudit, buildSignedServiceHeaders } = require('../src/services/serviceAuthGuard.cjs');

const crmAdapter = require(P2_ADAPTER);
const agentsAdapter = require(P3_ADAPTER);
const callingBridge = require(P4_BRIDGE);

async function listenJsonServer(handler) {
  const srv = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const rawBody = Buffer.concat(chunks).toString('utf8');
    res.setHeader('Content-Type', 'application/json');
    const out = await handler(req, rawBody);
    res.statusCode = out.status || 200;
    res.end(JSON.stringify(out.body));
  });
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve));
  return { server: srv, url: `http://127.0.0.1:${srv.address().port}` };
}

async function run() {
  const p1App = express();
  p1App.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
  p1App.use('/api/portal/integrations', integrationsRouter);
  const p1Srv = http.createServer(p1App);
  await new Promise(resolve => p1Srv.listen(0, '127.0.0.1', resolve));
  const p1Url = `http://127.0.0.1:${p1Srv.address().port}`;

  const p2Node = await listenJsonServer((req, rawBody) => {
    if (req.method === 'POST' && req.url === '/api/ecosystem/s2s') {
      return crmAdapter.handleS2SRequest(req.headers, rawBody, EPHEMERAL_TEST_SECRET);
    }
    return { status: 404, body: { success: false } };
  });

  const p3Node = await listenJsonServer((req, rawBody) => {
    if (req.method === 'POST' && req.url === '/api/ecosystem/s2s') {
      return agentsAdapter.handleAgentsS2SRequest(req.headers, rawBody, EPHEMERAL_TEST_SECRET);
    }
    return { status: 404, body: { success: false } };
  });

  const p4Srv = callingBridge.createCallingAgentServer({ secret: EPHEMERAL_TEST_SECRET, mode: 'test_mode' });
  await new Promise(resolve => p4Srv.listen(0, '127.0.0.1', resolve));
  const p4Url = `http://127.0.0.1:${p4Srv.address().port}`;

  const traces = [];
  const recordTrace = (dir, method, route, correlationId, authResult, httpStatus, reqPayload, resPayload, notes) => {
    traces.push({
      timestampUtc: new Date().toISOString(),
      direction: dir,
      method,
      route,
      correlationId,
      authenticationResult: authResult,
      httpStatus,
      sanitizedRequestPayload: sanitizePayloadForAudit(reqPayload),
      sanitizedResponsePayload: sanitizePayloadForAudit(resPayload),
      notes
    });
  };

  try {
    // 1. P1 -> P2 (Lead / Customer sync via S2S dispatch)
    const c1 = 'CORR-S2S-P1P2-001';
    const r1 = await registry.dispatchToConnectedService({
      targetProjectId: 'avani_ai_crm',
      eventType: 'enquiry.received',
      correlationId: c1,
      idempotencyKey: 'S2S-IDEMP-001',
      targetUrl: p2Node.url,
      s2sSecret: EPHEMERAL_TEST_SECRET,
      payload: { phone: '+919876543210', email: 's2s.test@example.com', loanType: 'Doctor Loan', consent_status: 'Approved', externalId: 'CRM-EXT-1' }
    });
    assert.equal(r1.success, true);
    assert.equal(r1.status, 200);
    recordTrace('Project 1 -> Project 2', 'POST', `${p2Node.url}/api/ecosystem/s2s`, c1, 'PASS (HS256 JWT + HMAC)', r1.status, { phone: '+919876543210', loanType: 'Doctor Loan' }, r1.downstreamResponse, 'Local HTTP S2S dispatch processed by Project 2 CRM adapter');

    // 2. P2 -> P1 (CRM status / profile update to Project 1 S2S endpoint)
    const c2 = 'CORR-S2S-P2P1-002';
    const r2 = await crmAdapter.sendToCentralLoanApi({
      centralUrl: p1Url,
      eventType: 'lead.status.updated',
      correlationId: c2,
      secret: EPHEMERAL_TEST_SECRET,
      payload: { phone: '+919876543210', email: 's2s.test@example.com', externalId: 'CRM-EXT-1', stage: 'QUALIFIED', idempotencyKey: 'S2S-P2P1-002' }
    });
    assert.equal(r2.status, 200);
    assert.equal(r2.body.success, true);
    recordTrace('Project 2 -> Project 1', 'POST', `${p1Url}/api/portal/integrations/cross-project/event`, c2, 'PASS (svc-ai-crm -> svc-loan-api)', r2.status, { externalId: 'CRM-EXT-1', stage: 'QUALIFIED' }, r2.body, 'Project 1 authenticated svc-ai-crm JWT+HMAC and recorded event');

    // 3. P1 -> P3 (Loan qualification request to Project 3 Loan Agents)
    const c3 = 'CORR-S2S-P1P3-003';
    const r3 = await registry.dispatchToConnectedService({
      targetProjectId: 'avani_loan_agents',
      eventType: 'lead.qualification.requested',
      correlationId: c3,
      idempotencyKey: 'S2S-P1P3-003',
      targetUrl: p3Node.url,
      s2sSecret: EPHEMERAL_TEST_SECRET,
      payload: { phone: '+919876543210', loanType: 'Doctor Loan', requestedAmount: 1500000, monthlyIncome: 120000, preferredLanguage: 'Marathi' }
    });
    assert.equal(r3.success, true);
    assert.equal(r3.downstreamResponse.advisoryOnly, true);
    recordTrace('Project 1 -> Project 3', 'POST', `${p3Node.url}/api/ecosystem/s2s`, c3, 'PASS (svc-loan-api -> svc-loan-agents)', r3.status, { loanType: 'Doctor Loan', requestedAmount: 1500000 }, r3.downstreamResponse, 'Advisory evaluation completed without autonomous sanction claim');

    // 4. P3 -> P1 (Loan Agents advisory outcome synced back to Project 1)
    const c4 = 'CORR-S2S-P3P1-004';
    const r4 = await agentsAdapter.sendAdvisoryToCentralLoanApi({
      centralUrl: p1Url,
      eventType: 'lead.qualification.completed',
      correlationId: c4,
      secret: EPHEMERAL_TEST_SECRET,
      payload: { phone: '+919876543210', advisoryStatus: 'Qualified', checklistReady: true, idempotencyKey: 'S2S-P3P1-004' }
    });
    assert.equal(r4.status, 200);
    assert.equal(r4.body.success, true);
    recordTrace('Project 3 -> Project 1', 'POST', `${p1Url}/api/portal/integrations/cross-project/event`, c4, 'PASS (svc-loan-agents -> svc-loan-api)', r4.status, { advisoryStatus: 'Qualified' }, r4.body, 'Project 1 accepted signed outcome from svc-loan-agents');

    // 5. P1 -> P4 (AI Calling initiation with explicit consent)
    const c5 = 'CORR-S2S-P1P4-005';
    const r5 = await registry.dispatchToConnectedService({
      targetProjectId: 'avavi_calling_agent',
      eventType: 'call.initiation.requested',
      correlationId: c5,
      idempotencyKey: 'S2S-P1P4-005',
      targetUrl: p4Url,
      s2sSecret: EPHEMERAL_TEST_SECRET,
      payload: { name: 'Dr. Sachin Test', phone: '+919876543210', loanType: 'DOCTOR_LOAN', preferredLanguage: 'Marathi', consent_status: 'Approved' }
    });
    assert.equal(r5.success, true);
    assert.equal(r5.status, 200);
    recordTrace('Project 1 -> Project 4', 'POST', `${p4Url}/api/ecosystem/s2s`, c5, 'PASS (svc-loan-api -> svc-ai-calling)', r5.status, { loanType: 'DOCTOR_LOAN', consent_status: 'Approved' }, r5.downstreamResponse, 'Calling agent initiated test_mode call under Approved consent gate');

    // 6. P4 -> P1 (Call disposition + PII scrubbed summary callback)
    const c6 = 'CORR-S2S-P4P1-006';
    const r6 = await callingBridge.sendCallOutcomeToCentralApi({
      centralUrl: p1Url,
      eventType: 'call.completed',
      correlationId: c6,
      secret: EPHEMERAL_TEST_SECRET,
      payload: {
        phone: '+919876543210',
        externalId: 'CALL-S2S-006',
        rawDisposition: 'interested_customer',
        summary: 'PAN ABCDE1234F Aadhaar 1234 5678 9012 interested in clinic loan',
        idempotencyKey: 'S2S-P4P1-006'
      }
    });
    assert.equal(r6.status, 200);
    assert.equal(r6.body.event.disposition, 'QUALIFIED_INTERESTED');
    assert.equal(r6.body.event.scrubbedSummary.includes('ABCDE1234F'), false);
    recordTrace('Project 4 -> Project 1', 'POST', `${p1Url}/api/portal/integrations/cross-project/event`, c6, 'PASS (svc-ai-calling -> svc-loan-api)', r6.status, { rawDisposition: 'interested_customer', summary: '[CONTAINED_TEST_PAN_AADHAAR]' }, r6.body, 'Calling outcome scrubbed PII and synchronized to central bus');

    // 7. Security Negative Tests: Unauthenticated (401), Replay (409), Duplicate suppression, Downstream DLQ
    const unauthRes = await fetch(`${p1Url}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'enquiry.received', payload: {} })
    });
    assert.equal(unauthRes.status, 401);

    const replayBody = JSON.stringify({ eventType: 'enquiry.received', payload: { phone: '+919876543210', idempotencyKey: 'REPLAY-TEST-KEY' } });
    const replaySigned = buildSignedServiceHeaders({
      issuer: 'svc-ai-crm',
      audience: 'svc-loan-api',
      body: replayBody,
      secret: EPHEMERAL_TEST_SECRET
    });
    const firstSend = await fetch(`${p1Url}/api/portal/integrations/cross-project/event`, { method: 'POST', headers: replaySigned.headers, body: replayBody });
    assert.equal(firstSend.status, 200);
    const replaySend = await fetch(`${p1Url}/api/portal/integrations/cross-project/event`, { method: 'POST', headers: replaySigned.headers, body: replayBody });
    assert.equal(replaySend.status, 409);

    const dlqDispatch = await registry.dispatchToConnectedService({
      targetProjectId: 'avani_ai_crm',
      eventType: 'enquiry.received',
      correlationId: 'CORR-DLQ-TEST',
      idempotencyKey: 'DLQ-UNIQUE-001',
      targetUrl: 'http://127.0.0.1:59999',
      s2sSecret: EPHEMERAL_TEST_SECRET,
      payload: { phone: '+919811111111' }
    });
    assert.equal(dlqDispatch.success, false);
    assert.ok(dlqDispatch.dlqId);

    // 8. Live remote API probe against production api.avanifinserv.com
    let liveRemoteProbe = null;
    try {
      const remoteRes = await fetch('https://api.avanifinserv.com/api/portal/integrations/cross-project/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'probe' }),
        signal: AbortSignal.timeout(8000)
      });
      const ct = remoteRes.headers.get('content-type') || '';
      const txt = await remoteRes.text();
      liveRemoteProbe = {
        url: 'https://api.avanifinserv.com/api/portal/integrations/cross-project/event',
        status: remoteRes.status,
        contentType: ct,
        bodyPreview: txt.slice(0, 100).replace(/\s+/g, ' '),
        assessment: ct.includes('text/html') ? 'FAIL_VERIFIED: Remote API VM still running pre-update code / SPA fallback (BLK-003)' : 'REACHABLE_JSON'
      };
    } catch (e) {
      liveRemoteProbe = { error: e.message };
    }

    const outObj = {
      executedAtUtc: new Date().toISOString(),
      executionScope: 'Local authenticated HTTP S2S servers across Projects 1-4 + Live remote API VM probe',
      directionsVerifiedLocally: 6,
      securityNegativeChecks: {
        unauthenticatedRejectedStatus: unauthRes.status,
        jwtReplayRejectedStatus: replaySend.status,
        downstreamFailureDlqEnqueuedId: dlqDispatch.dlqId
      },
      traces,
      liveRemoteApiProbe: liveRemoteProbe
    };

    const outPath = path.join(P1_DIR, 'PRODUCTION_READINESS_REMEDIATION/01_FOUR_PROJECT_INTEGRATION/s2s_bidirectional_evidence.json');
    fs.writeFileSync(outPath, JSON.stringify(outObj, null, 2));
    console.log('S2S_BIDIRECTIONAL_LOCAL_6_DIRECTIONS: PASS');
    console.log('SECURITY_NEGATIVE_401_409_DLQ: PASS', unauthRes.status, replaySend.status, dlqDispatch.dlqId);
    console.log('LIVE_REMOTE_API_PROBE:', JSON.stringify(liveRemoteProbe));
  } finally {
    p1Srv.close();
    p2Node.server.close();
    p3Node.server.close();
    p4Srv.close();
  }
}

run().catch(err => {
  console.error('S2S_VERIFICATION_FAILED:', err);
  process.exit(1);
});
