// tests/integration/test_four_project_ecosystem_e2e.test.cjs
// Cross-Project End-to-End Integration Suite (Projects 1, 2, 3, and 4)
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

test('Cross-project ecosystem E2E: Projects 1-4 registry, identity, duplicate suppression, guardrails, calling bridge, and DLQ recovery', async () => {
  await withServer(async baseUrl => {
    const saSess = await issueSession({ user_id: 'SA_E2E', username: 'sa_e2e', role: 'Super Administrator' }, '127.0.0.1', 'e2e');
    const roSess = await issueSession({ user_id: 'RO_E2E', username: 'ro_e2e', role: 'Read-Only Analyst' }, '127.0.0.1', 'e2e');
    const saTok = saSess.token || saSess;
    const roTok = roSess.token || roSess;

    // 1. Complete ecosystem registry (19 services incl. Projects 1-4 & 8 workflows)
    const regRes = await fetch(`${baseUrl}/api/portal/integrations`, {
      headers: { Authorization: `Bearer ${saTok}` }
    });
    assert.equal(regRes.status, 200);
    const regJson = await regRes.json();
    assert.equal(regJson.providers.length, 19);
    assert.equal(regJson.workflows.length, 8);
    for (const reqId of ['avani_core_api', 'avani_ai_crm', 'avani_loan_agents', 'avavi_calling_agent', 'chatmitra', 'hubspot']) {
      assert.ok(regJson.providers.some(p => p.id === reqId), `Missing service ${reqId}`);
    }

    // 2. Website enquiry -> central customer ID -> CRM sync (Scenarios 1-3)
    const evt1 = await fetch(`${baseUrl}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'enquiry.received',
        correlationId: 'CORR-E2E-1',
        payload: {
          sourceProject: 'Project 1',
          targetProject: 'Project 2',
          phone: '+919876543210',
          email: 'test.lead@example.com',
          externalId: 'EXT-LEAD-001',
          idempotencyKey: 'E2E-ENQ-001'
        }
      })
    });
    assert.equal(evt1.status, 200);
    const evt1Json = await evt1.json();
    assert.equal(evt1Json.duplicateSuppressed, false);
    assert.ok(evt1Json.event.centralCustomerId.startsWith('CUS-AVL-'));

    // Duplicate enquiry suppressed without duplicate customer creation
    const evtDup = await fetch(`${baseUrl}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'enquiry.received',
        payload: { phone: '+919876543210', email: 'test.lead@example.com', idempotencyKey: 'E2E-ENQ-001' }
      })
    });
    assert.equal(evtDup.status, 200);
    const evtDupJson = await evtDup.json();
    assert.equal(evtDupJson.duplicateSuppressed, true);

    // 3. Loan Agents regulatory guardrail blocks autonomous approval/rate claims (Scenarios 4-5)
    const unsafeAgent = await fetch(`${baseUrl}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'lead.qualification.requested',
        payload: { phone: '+919876543210', autonomousApproval: true, idempotencyKey: 'E2E-SAFE-1' }
      })
    });
    assert.equal(unsafeAgent.status, 403);

    // 4. Calling Agent consent gate & PII scrubbing + disposition mapping (Scenarios 6-8, 11)
    const callBlockedPending = await fetch(`${baseUrl}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'call.initiation.requested',
        payload: { phone: '+919876543210', consent_status: 'Pending_Request', idempotencyKey: 'E2E-CALL-PENDING' }
      })
    });
    assert.equal(callBlockedPending.status, 403);

    const callCompleted = await fetch(`${baseUrl}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'call.completed',
        payload: {
          sourceProject: 'Project 4',
          targetProject: 'Project 1',
          phone: '+919876543210',
          externalId: 'CALL-001',
          rawDisposition: 'interested_customer',
          summary: 'Customer PAN ABCDE1234F Aadhaar 1234 5678 9012 interested in Doctor Loan.',
          idempotencyKey: 'E2E-CALL-DONE-1'
        }
      })
    });
    assert.equal(callCompleted.status, 200);
    const callJson = await callCompleted.json();
    assert.equal(callJson.event.disposition, 'QUALIFIED_INTERESTED');
    assert.equal(callJson.event.scrubbedSummary.includes('ABCDE1234F'), false);
    assert.equal(callJson.event.scrubbedSummary.includes('1234 5678 9012'), false);

    // 5. RBAC enforcement on Read-Only Analyst (Scenario 16)
    const roSync = await fetch(`${baseUrl}/api/portal/integrations/cross-project/event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${roTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'enquiry.received', payload: { phone: '+919800000001' } })
    });
    assert.equal(roSync.status, 403);

    // 6. Workflow pause & resume + DLQ recovery (Scenarios 14-15, 18)
    const pauseWf = await fetch(`${baseUrl}/api/portal/integrations/workflows/WF-08/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false })
    });
    assert.equal(pauseWf.status, 200);
    assert.equal((await pauseWf.json()).workflow.enabled, false);

    const resumeWf = await fetch(`${baseUrl}/api/portal/integrations/workflows/WF-08/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true })
    });
    assert.equal(resumeWf.status, 200);
    assert.equal((await resumeWf.json()).workflow.enabled, true);

    const dlqItem = registry.gateway.sendToDLQ('AVANI_AI_CRM', { customerId: evt1Json.event.centralCustomerId }, new Error('503'), 'CORR-E2E-1');
    const replayRes = await fetch(`${baseUrl}/api/portal/integrations/dlq/${dlqItem.dlqId}/replay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${saTok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(replayRes.status, 200);
    assert.equal((await replayRes.json()).success, true);
  });
});
