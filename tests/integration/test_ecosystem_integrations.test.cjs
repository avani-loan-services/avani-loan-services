// tests/integration/test_ecosystem_integrations.test.cjs
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');

const db = require('../../src/models/portalDatabase.cjs');
db.findSessionById = async sid => (
  sid && sid.startsWith('sess_')
    ? { session_id: sid, active: true, expires_at: new Date(Date.now() + 3600000).toISOString() }
    : null
);
db.insertSession = async () => ({ ok: true });
db.appendAuditLog = async () => ({ ok: true });

const { issueSession } = require('../../src/services/portalAuthService.cjs');
const integrationsRouter = require('../../src/routes/portalIntegrationsRoutes.cjs');
const registry = require('../../src/services/ecosystemIntegrationRegistry.cjs');

async function withServer(fn) {
  const app = express();
  app.use(express.json());
  app.use('/api/portal/integrations', integrationsRouter);
  const srv = http.createServer(app);
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise(resolve => srv.close(resolve));
  }
}

test('Ecosystem integrations: auth, RBAC, zero-secret-leak, consent gate, and DLQ replay', async () => {
  await withServer(async baseUrl => {
    const unauth = await fetch(`${baseUrl}/api/portal/integrations`);
    assert.equal(unauth.status, 401);

    const saSess = await issueSession({ user_id: 'SA1', username: 'sa_test', role: 'Super Administrator' }, '127.0.0.1', 'test');
    const roSess = await issueSession({ user_id: 'RO1', username: 'ro_test', role: 'Read-Only Analyst' }, '127.0.0.1', 'test');
    const saTok = saSess.token || saSess;
    const roTok = roSess.token || roSess;

    const listRes = await fetch(`${baseUrl}/api/portal/integrations`, {
      headers: { Authorization: `Bearer ${saTok}` }
    });
    assert.equal(listRes.status, 200);
    const listJson = await listRes.json();
    assert.equal(listJson.success, true);
    assert.ok(listJson.providers.length >= 10);
    assert.ok(listJson.workflows.length >= 6);
    const serialized = JSON.stringify(listJson);
    assert.equal(/mongodb\+srv:\/\/|BEGIN PRIVATE KEY|AIza[0-9A-Za-z\-_]{35}/.test(serialized), false);

    const roToggle = await fetch(`${baseUrl}/api/portal/integrations/hubspot/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${roTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false })
    });
    assert.equal(roToggle.status, 403);

    const testConn = await fetch(`${baseUrl}/api/portal/integrations/chatmitra/test-connection`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(testConn.status, 200);
    const testJson = await testConn.json();
    assert.equal(testJson.success, true);

    const pendingBlocked = registry.executeConsentGatedWorkflow('WF-C-EDUCATION', {
      institution_id: 'EDU-001',
      consent_status: 'Pending_Request'
    });
    assert.equal(pendingBlocked.blocked, true);
    assert.equal(pendingBlocked.status, 403);

    const optedOutBlocked = registry.executeConsentGatedWorkflow('WF-E-COMMUNICATION', {
      lead_id: 'EDU-002',
      consent_status: 'Opted_Out',
      opt_out: true
    });
    assert.equal(optedOutBlocked.blocked, true);

    const approvedAllowed = registry.executeConsentGatedWorkflow('WF-E-COMMUNICATION', {
      lead_id: 'TEST-003',
      consent_status: 'Approved'
    });
    assert.equal(approvedAllowed.success, true);

    const dlqItem = registry.gateway.sendToDLQ('HUBSPOT', { leadId: 'TEST-DLQ-1' }, new Error('timeout'), 'CORR-TEST-1');
    const replayRes = await fetch(`${baseUrl}/api/portal/integrations/dlq/${dlqItem.dlqId}/replay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(replayRes.status, 200);
    const replayJson = await replayRes.json();
    assert.equal(replayJson.success, true);
  });
});
