// scripts/verify_non_admin_rbac.cjs
// Workstream 5 (8.4): Live/mounted Express RBAC matrix verification across all 5 non-admin roles + unauth/invalid tokens + live prod unauth probe.

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const express = require('express');

process.env.NODE_ENV = 'test';

const db = require('../src/models/portalDatabase.cjs');
const activeTestSessions = new Map();
db.findSessionById = async sid => activeTestSessions.get(sid) || null;
db.insertSession = async sess => {
  activeTestSessions.set(sess.session_id, { ...sess, active: true, expires_at: new Date(Date.now() + 3600000).toISOString() });
  return { ok: true };
};
db.appendAuditLog = async () => ({ ok: true });

const { issueSession } = require('../src/services/portalAuthService.cjs');
const builderRouter = require('../src/routes/builderPortalRoutes.cjs');
const educationRouter = require('../src/routes/educationPortalRoutes.cjs');
const integrationsRouter = require('../src/routes/portalIntegrationsRoutes.cjs');

async function run() {
  const app = express();
  app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
  app.use('/api/portal/builder', builderRouter);
  app.use('/api/portal/education', educationRouter);
  app.use('/api/portal/integrations', integrationsRouter);

  const srv = http.createServer(app);
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${srv.address().port}`;

  const rolesToTest = [
    { role: 'Administrator', user: 'test_admin_ops', crmRole: 'Administrator' },
    { role: 'Research Manager', user: 'test_research_mgr', crmRole: 'Research Manager' },
    { role: 'Sales Manager', user: 'test_sales_mgr', crmRole: 'Sales Manager (CRM/Sales User)' },
    { role: 'Sales Executive', user: 'test_sales_exec', crmRole: 'Sales Executive (Agent User)' },
    { role: 'Read-Only Analyst', user: 'test_analyst', crmRole: 'Read-Only Analyst (Standard User)' }
  ];

  const tokens = {};
  for (const r of rolesToTest) {
    const sess = await issueSession({ user_id: `USR_${r.user.toUpperCase()}`, username: r.user, role: r.role }, '127.0.0.1', 'rbac-verifier');
    tokens[r.role] = sess.token || sess;
  }

  const cases = [
    // Missing / Invalid token -> 401
    { label: 'Missing Token', role: 'NONE', token: null, method: 'GET', path: '/api/portal/builder/companies', expected: 401 },
    { label: 'Invalid Token', role: 'INVALID', token: 'invalid.jwt.token', method: 'GET', path: '/api/portal/integrations', expected: 401 },
    // Read-Only Analyst (permitted read + denied write & admin toggle)
    { label: 'Read-Only Analyst READ builder', role: 'Read-Only Analyst', token: tokens['Read-Only Analyst'], method: 'GET', path: '/api/portal/builder/companies', expected: 200 },
    { label: 'Read-Only Analyst WRITE cross-project event (FORBIDDEN)', role: 'Read-Only Analyst', token: tokens['Read-Only Analyst'], method: 'POST', path: '/api/portal/integrations/cross-project/event', body: { eventType: 'enquiry.received', payload: { phone: '+919800000099' } }, expected: 403 },
    { label: 'Read-Only Analyst ADMIN toggle workflow (FORBIDDEN)', role: 'Read-Only Analyst', token: tokens['Read-Only Analyst'], method: 'POST', path: '/api/portal/integrations/workflows/WF-08/toggle', body: { enabled: false }, expected: 403 },
    // Sales Executive (permitted CRM sync + denied admin toggle)
    { label: 'Sales Executive READ builder', role: 'Sales Executive', token: tokens['Sales Executive'], method: 'GET', path: '/api/portal/builder/companies', expected: 200 },
    { label: 'Sales Executive WRITE cross-project event (ALLOWED)', role: 'Sales Executive', token: tokens['Sales Executive'], method: 'POST', path: '/api/portal/integrations/cross-project/event', body: { eventType: 'enquiry.received', payload: { phone: '+919800000101', idempotencyKey: 'RBAC-SE-1' } }, expected: 200 },
    { label: 'Sales Executive ADMIN test-connection (FORBIDDEN)', role: 'Sales Executive', token: tokens['Sales Executive'], method: 'POST', path: '/api/portal/integrations/chatmitra/test-connection', body: {}, expected: 403 },
    // Research Manager (permitted builder/education read + denied S2S dispatch & CRM event)
    { label: 'Research Manager READ education', role: 'Research Manager', token: tokens['Research Manager'], method: 'GET', path: '/api/portal/education/institutions', expected: 200 },
    { label: 'Research Manager WRITE S2S dispatch (FORBIDDEN)', role: 'Research Manager', token: tokens['Research Manager'], method: 'POST', path: '/api/portal/integrations/s2s/dispatch', body: { targetProjectId: 'avani_ai_crm', eventType: 'enquiry.received' }, expected: 403 },
    // Sales Manager (permitted CRM event & builder read + denied admin DLQ replay)
    { label: 'Sales Manager WRITE cross-project event (ALLOWED)', role: 'Sales Manager', token: tokens['Sales Manager'], method: 'POST', path: '/api/portal/integrations/cross-project/event', body: { eventType: 'enquiry.received', payload: { phone: '+919800000102', idempotencyKey: 'RBAC-SM-1' } }, expected: 200 },
    { label: 'Sales Manager ADMIN toggle provider (FORBIDDEN)', role: 'Sales Manager', token: tokens['Sales Manager'], method: 'POST', path: '/api/portal/integrations/hubspot/toggle', body: { enabled: true }, expected: 403 },
    // Administrator (non-SuperAdmin permitted admin ops)
    { label: 'Administrator test-connection (ALLOWED)', role: 'Administrator', token: tokens['Administrator'], method: 'POST', path: '/api/portal/integrations/hubspot/test-connection', body: {}, expected: 200 }
  ];

  const results = [];
  try {
    for (const c of cases) {
      const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
      if (c.token) headers.Authorization = `Bearer ${c.token}`;
      const res = await fetch(`${baseUrl}${c.path}`, {
        method: c.method,
        headers,
        ...(c.body ? { body: JSON.stringify(c.body) } : {})
      });
      const json = await res.json().catch(() => null);
      const passed = res.status === c.expected;
      assert.equal(res.status, c.expected, `RBAC failed for ${c.label}: expected ${c.expected}, got ${res.status}`);
      results.push({
        label: c.label,
        sanitisedRole: c.role,
        method: c.method,
        endpoint: c.path,
        expectedStatus: c.expected,
        actualStatus: res.status,
        sanitisedResponse: json && json.message ? { success: json.success, message: json.message } : { success: json?.success ?? null },
        result: passed ? 'PASS' : 'FAIL'
      });
    }

    // Live production unauthenticated / invalid-token probes (never claim live non-admin user accounts exist)
    const liveProbes = [];
    for (const p of ['/api/portal/builder/companies', '/api/portal/education/institutions', '/api/portal/dashboard/overview']) {
      const rMissing = await fetch(`https://api.avanifinserv.com${p}`);
      const rInvalid = await fetch(`https://api.avanifinserv.com${p}`, { headers: { Authorization: 'Bearer invalid.token.probe' } });
      liveProbes.push({ endpoint: p, missingTokenStatus: rMissing.status, invalidTokenStatus: rInvalid.status });
    }

    const outObj = {
      executedAtUtc: new Date().toISOString(),
      mountedExpressRbacCasesPassed: `${results.length}/${results.length}`,
      results,
      liveProductionAuthProbes: liveProbes,
      liveProductionNonAdminUserStatus: 'OPEN_OWNER_APPROVAL (Live production admin_users store holds Super Administrator hashes only; no non-admin production user accounts provisioned for remote login testing)'
    };

    const outPath = path.join(__dirname, '../PRODUCTION_READINESS_REMEDIATION/06_RBAC_TESTS/non_admin_rbac_evidence.json');
    fs.writeFileSync(outPath, JSON.stringify(outObj, null, 2));
    console.log('NON_ADMIN_RBAC_MOUNTED_CASES:', outObj.mountedExpressRbacCasesPassed);
    console.log('LIVE_UNAUTH_PROBES:', JSON.stringify(liveProbes));
  } finally {
    srv.close();
  }
}

run().catch(err => {
  console.error('RBAC_VERIFICATION_FAILED:', err);
  process.exit(1);
});
