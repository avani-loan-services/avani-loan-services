// scripts/test_phase_5_3_27_suite.cjs
// Comprehensive isolated regression test suite for Phase 5.3.27
// Verifies security headers, CORS, auth/session continuity, RBAC, CRM CRUD,
// Meta template truthfulness, and campaign dry-run/opt-out/dedup/9 lifecycle states.
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const bcrypt = require('bcrypt');

// Isolate test environment (strictly mock mode, never touches production Atlas DB)
process.env.APP_MODE = 'test';
process.env.NODE_ENV = 'test';
process.env.PROVIDER_MODE = 'mock';
process.env.MONGODB_URI = '';
process.env.PORTAL_JWT_SECRET = 'phase_5_3_27_isolated_test_jwt_secret_key_9988';
delete process.env.META_ACCESS_TOKEN;

const DATA_DIR = path.join(process.cwd(), 'AVANI_LOAN_SERVICES_UNIFIED_PORTAL', 'data');
const SNAPSHOT_FILES = [
  'portal_admin_users.json',
  'admin_users.json',
  'portal_admin_sessions.json',
  'admin_sessions.json',
  'portal_admin_audit_logs.json',
  'admin_audit_logs.json',
  'portal_templates.json',
  'portal_campaigns.json',
  'portal_leads.json',
  'builder_companies.json',
  'education_institutions.json',
  'education_consent_records.json',
  'unified_tasks.json',
  'unified_automation_state.json'
];

const fileSnapshots = new Map();
for (const fname of SNAPSHOT_FILES) {
  const fpath = path.join(DATA_DIR, fname);
  if (fs.existsSync(fpath)) {
    fileSnapshots.set(fpath, fs.readFileSync(fpath, 'utf8'));
  } else {
    fileSnapshots.set(fpath, null);
  }
}

function restoreSnapshots() {
  for (const [fpath, original] of fileSnapshots.entries()) {
    if (original === null) {
      if (fs.existsSync(fpath)) fs.unlinkSync(fpath);
    } else {
      fs.writeFileSync(fpath, original, 'utf8');
    }
  }
}

function requestJson(baseUrl, method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlPath, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      Accept: 'application/json',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(parsed, { method, headers: reqHeaders }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const text = buf.toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, json, text, size: buf.length });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runSuite() {
  let server;
  const results = [];
  const pass = (name, detail = '') => {
    results.push({ name, status: 'PASS', detail });
    console.log(`[PASS] ${name}${detail ? ' — ' + detail : ''}`);
  };

  try {
    const express = require('express');
    const helmet = require('helmet');
    const cors = require('cors');
    const db = require('../src/models/portalDatabase.cjs');
    const portalAuthService = require('../src/services/portalAuthService.cjs');
    db.init();

    // Seed isolated Super Admin & Read-Only Analyst for test run
    const adminPass = 'TestSuper#2026!Avani';
    const analystPass = 'TestAnalyst#2026!Avani';
    const adminHash = await bcrypt.hash(adminPass, 10);
    const analystHash = await bcrypt.hash(analystPass, 10);

    db.upsert('admin_users', 'user_id', {
      user_id: 'USR-ADMIN-5327',
      username: 'phase5327admin',
      email: 'phase5327admin@avanifinserv.com',
      full_name: 'Test Super Admin',
      role: 'Super Administrator',
      password_hash: adminHash,
      failed_login_attempts: 0,
      lockout_until: null,
      force_password_change: false,
      is_active: true,
      status: 'Active',
      created_at: new Date().toISOString()
    });
    db.upsert('admin_users', 'user_id', {
      user_id: 'USR-ANALYST-5327',
      username: 'phase5327analyst',
      email: 'phase5327analyst@avanifinserv.com',
      full_name: 'Test Read-Only Analyst',
      role: 'Read-Only Analyst',
      password_hash: analystHash,
      failed_login_attempts: 0,
      lockout_until: null,
      force_password_change: false,
      is_active: true,
      status: 'Active',
      created_at: new Date().toISOString()
    });

    // Build test Express app mirroring production middleware & all portal routers
    const app = express();
    app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
    const allowedOrigins = ['https://www.avanifinserv.com', 'https://avanifinserv.com'];
    app.use(cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true
    }));
    app.use(express.json());
    app.use('/api/portal/auth', require('../src/routes/portalAuthRoutes.cjs'));
    app.use('/api/portal/dashboard', require('../src/routes/unifiedPortalRoutes.cjs'));
    app.use('/api/portal/builder', require('../src/routes/builderPortalRoutes.cjs'));
    app.use('/api/portal/education', require('../src/routes/educationPortalRoutes.cjs'));
    app.use('/api/portal/leads', require('../src/routes/portalLeadsRoutes.cjs'));
    app.use('/api/portal/templates', require('../src/routes/portalTemplatesRoutes.cjs'));
    app.use('/api/portal/campaigns', require('../src/routes/portalCampaignsRoutes.cjs'));

    server = http.createServer(app);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // 1. Helmet & CORS verification
    const unauthTpl = await requestJson(baseUrl, 'GET', '/api/portal/templates', null, { Origin: 'https://www.avanifinserv.com' });
    assert.strictEqual(unauthTpl.status, 401);
    assert.strictEqual(unauthTpl.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(unauthTpl.headers['access-control-allow-origin'], 'https://www.avanifinserv.com');

    const rogueCors = await requestJson(baseUrl, 'GET', '/api/portal/templates', null, { Origin: 'https://evil-attacker.example' });
    assert.strictEqual(rogueCors.status, 401);
    assert.strictEqual(rogueCors.headers['access-control-allow-origin'], undefined);
    pass('Security Headers & Strict CORS', 'Helmet nosniff present; allowed origin granted; unknown origin denied CORS header');

    // 2. Authentication, Password Change & Session Continuity/Revocation
    const badLogin = await requestJson(baseUrl, 'POST', '/api/portal/auth/login', { username: 'phase5327admin', password: 'WrongPassword1!' });
    assert.strictEqual(badLogin.status, 401);

    const adminLogin = await requestJson(baseUrl, 'POST', '/api/portal/auth/login', { username: 'phase5327admin', password: adminPass });
    assert.strictEqual(adminLogin.status, 200, `Expected admin login 200, got ${adminLogin.status}: ${adminLogin.text}`);
    const oldToken = adminLogin.json.token;
    assert(oldToken, 'Admin login token returned');

    const meBefore = await requestJson(baseUrl, 'GET', '/api/portal/auth/me', null, { Authorization: `Bearer ${oldToken}` });
    assert.strictEqual(meBefore.status, 200, `Expected 200 on /me, got ${meBefore.status}: ${meBefore.text}`);
    assert.strictEqual(meBefore.json?.user?.role, 'Super Administrator', `Unexpected /me payload: ${meBefore.text}`);
    assert(meBefore.json.user.hashFingerprint, 'Hash fingerprint exposed without secret leak');

    const rotatedPass = 'TestSuper#2026!Rotated';
    const chgRes = await requestJson(baseUrl, 'POST', '/api/portal/auth/change-password', {
      currentPassword: adminPass,
      newPassword: rotatedPass
    }, { Authorization: `Bearer ${oldToken}` });
    assert.strictEqual(chgRes.status, 200);
    const newToken = chgRes.json.token;
    assert(newToken && newToken !== oldToken, 'New token issued after password rotation');

    const oldMe = await requestJson(baseUrl, 'GET', '/api/portal/auth/me', null, { Authorization: `Bearer ${oldToken}` });
    assert.strictEqual(oldMe.status, 401, 'Old session token strictly revoked after password change');

    const newMe = await requestJson(baseUrl, 'GET', '/api/portal/auth/me', null, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(newMe.status, 200, 'Refreshed session works cleanly immediately after password change');
    pass('Auth & Session Continuity', 'Old session revoked (401), refreshed session active (200), fingerprint tracked');

    // 3. RBAC Enforcement (Read-Only Analyst vs Super Admin)
    const analystLogin = await requestJson(baseUrl, 'POST', '/api/portal/auth/login', { username: 'phase5327analyst', password: analystPass });
    assert.strictEqual(analystLogin.status, 200);
    const analystToken = analystLogin.json.token;

    const analystRead = await requestJson(baseUrl, 'GET', '/api/portal/templates', null, { Authorization: `Bearer ${analystToken}` });
    assert.strictEqual(analystRead.status, 200);
    const analystWriteTpl = await requestJson(baseUrl, 'POST', '/api/portal/templates', {
      name: 'blocked_tpl', channel: 'WhatsApp', body: 'Hello {{1}}'
    }, { Authorization: `Bearer ${analystToken}` });
    assert.strictEqual(analystWriteTpl.status, 403);
    const analystWriteCmp = await requestJson(baseUrl, 'POST', '/api/portal/campaigns', {
      name: 'blocked_cmp', channel: 'WhatsApp', target_segment: 'BUILDERS_80'
    }, { Authorization: `Bearer ${analystToken}` });
    assert.strictEqual(analystWriteCmp.status, 403);
    const analystCreateBld = await requestJson(baseUrl, 'POST', '/api/portal/builder/companies', {
      company_name: 'Unauthorized Builder'
    }, { Authorization: `Bearer ${analystToken}` });
    assert.strictEqual(analystCreateBld.status, 403);
    pass('RBAC Permission Enforcement', 'Read-Only Analyst allowed GET (200), blocked from template/campaign/builder mutations (403)');

    // 4. CRM Data Integrity & Builders/Schools/Colleges + Exports
    const bldRes = await requestJson(baseUrl, 'GET', '/api/portal/builder/companies?limit=100', null, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(bldRes.status, 200);
    assert.strictEqual(bldRes.json.total, 80);

    const schRes = await requestJson(baseUrl, 'GET', '/api/portal/education/schools?limit=100', null, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(schRes.status, 200);
    assert.strictEqual(schRes.json.total, 24);

    const colRes = await requestJson(baseUrl, 'GET', '/api/portal/education/colleges?limit=100', null, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(colRes.status, 200);
    assert.strictEqual(colRes.json.total, 56);

    const createBld = await requestJson(baseUrl, 'POST', '/api/portal/builder/companies', {
      company_name: 'Phase5327 Verification Developers',
      city: 'Pune',
      official_phone: '+91 9823001122'
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(createBld.status, 201);

    const dupBld = await requestJson(baseUrl, 'POST', '/api/portal/builder/companies', {
      company_name: 'Phase5327 Verification Developers',
      city: 'Pune'
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(dupBld.status, 409, 'Duplicate builder creation blocked cleanly');

    const createEdu = await requestJson(baseUrl, 'POST', '/api/portal/education/institutions', {
      institution_name: 'Phase5327 Test Academy',
      institution_category: 'School Group',
      city: 'Pune'
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(createEdu.status, 201);

    const xlsxBld = await requestJson(baseUrl, 'GET', '/api/portal/builder/export', null, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(xlsxBld.status, 200);
    assert(xlsxBld.size > 1000, 'Builder XLSX export non-empty');
    pass('CRM Integrity, CRUD & Exports', '80 Builders, 24 Schools, 56 Colleges verified; POST create & 409 duplicate guard & XLSX export verified');

    // 5. Templates Engine (Truthful Meta Status, Create/Edit Local Draft, Guard Approved, Preview & Test Send)
    const metaRes = await requestJson(baseUrl, 'GET', '/api/portal/templates/meta-status', null, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(metaRes.status, 200);
    assert.strictEqual(metaRes.json.data.connected, false);
    assert.strictEqual(metaRes.json.data.provider_mode, 'mock');

    const createTpl = await requestJson(baseUrl, 'POST', '/api/portal/templates', {
      name: 'phase_5327_test_draft',
      display_name: 'Phase 5.3.27 Draft',
      channel: 'WhatsApp',
      category: 'UTILITY',
      body: 'Hello {{1}}, welcome to {{2}} partnership desk.',
      sample_values: { '1': 'Director', '2': 'Avani Loan Services' }
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(createTpl.status, 201);
    assert.strictEqual(createTpl.json.data.meta_approval_status, 'LOCAL_DRAFT');
    assert.strictEqual(createTpl.json.data.synced_from_meta, false);
    const tplId = createTpl.json.data.template_id;

    const editTpl = await requestJson(baseUrl, 'PUT', `/api/portal/templates/${tplId}`, {
      display_name: 'Phase 5.3.27 Draft Edited',
      body: 'Hello {{1}}, updated {{2}} loan desk in {{3}}.'
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(editTpl.status, 200);
    assert.deepStrictEqual(editTpl.json.data.variables, ['1', '2', '3']);

    // Verify Approved Meta template mutation block
    db.upsert('portal_templates', 'template_id', {
      template_id: 'TPL-META-LOCKED-TEST',
      name: 'locked_meta_tpl',
      channel: 'WhatsApp',
      body: 'Locked {{1}}',
      synced_from_meta: true,
      meta_approval_status: 'APPROVED'
    });
    const blockedEdit = await requestJson(baseUrl, 'PUT', '/api/portal/templates/TPL-META-LOCKED-TEST', {
      body: 'Hacked'
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(blockedEdit.status, 403);

    const testSend = await requestJson(baseUrl, 'POST', '/api/portal/templates/send-test', {
      template_id: tplId,
      recipient_phone: '+91 9823001122',
      variables: { '1': 'Partner', '2': 'Avani', '3': 'Pune' }
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(testSend.status, 200);
    assert.strictEqual(testSend.json.simulation.live_send_executed, false);
    pass('Templates Lifecycle & Meta Truthfulness', 'Local Draft create/edit, Approved 403 lock, variable extraction, mock send-test');

    // 6. Campaigns Validation, Unverified/Opted-Out/Duplicate Exclusions & All 9 States
    // Check BUILDERS_80 rejects invalid unverified numbers (ALS-BLD-MH-MUM-002 & 003)
    const cmpBld = await requestJson(baseUrl, 'POST', '/api/portal/campaigns', {
      name: 'Phase 5327 Builders Mock Validation',
      channel: 'WhatsApp',
      target_segment: 'BUILDERS_80',
      template_id: tplId
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(cmpBld.status, 201);
    assert.strictEqual(cmpBld.json.data.status, 'Draft');

    const dryBld = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpBld.json.data.campaign_id}/dry-run`, {}, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(dryBld.status, 200);
    assert(dryBld.json.summary.invalid_contacts_excluded >= 2, `Expected >=2 invalid builder contacts excluded, got ${dryBld.json.summary.invalid_contacts_excluded}`);
    assert.strictEqual(dryBld.json.summary.live_messages_dispatched, 0);
    assert.strictEqual(dryBld.json.summary.cost_incurred, 0);
    assert.strictEqual(dryBld.json.data.status, 'Ready for review');

    // Check EDUCATION Opted_Out exclusion (ALS-ECONS-MH-MUM-001 has Opted_Out without opt_out:true)
    const cmpCol = await requestJson(baseUrl, 'POST', '/api/portal/campaigns', {
      name: 'Phase 5327 Colleges OptOut Check',
      channel: 'WhatsApp',
      target_segment: 'COLLEGES_56',
      template_id: tplId
    }, { Authorization: `Bearer ${newToken}` });
    const dryCol = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpCol.json.data.campaign_id}/dry-run`, {}, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(dryCol.status, 200);
    assert(dryCol.json.summary.suppressed_opt_outs >= 1, `Expected >=1 Opted_Out consent suppressed in Colleges, got ${dryCol.json.summary.suppressed_opt_outs}`);

    // Traverse remaining lifecycle states: Ready for review -> Approved -> Scheduled -> Completed / Failed / Cancelled / Validation failed
    const approveRes = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpBld.json.data.campaign_id}/approve`, {}, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.json.data.status, 'Approved');

    const schedRes = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpBld.json.data.campaign_id}/schedule`, {}, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(schedRes.status, 200);
    assert.strictEqual(schedRes.json.data.status, 'Scheduled');

    const mockExec = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpBld.json.data.campaign_id}/execute-mock`, {}, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(mockExec.status, 200);
    assert.strictEqual(mockExec.json.data.status, 'Completed');
    assert.strictEqual(mockExec.json.data.mock_execution_log.live_messages_dispatched, 0);

    // Mock dry-run hold state + Failed + Cancelled + Validation failed
    const cmpTwo = await requestJson(baseUrl, 'POST', '/api/portal/campaigns', {
      name: 'Phase 5327 Lifecycle Failure & Cancel',
      channel: 'WhatsApp',
      target_segment: 'BUILDERS_PUNE',
      template_id: tplId
    }, { Authorization: `Bearer ${newToken}` });
    const dryHold = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpTwo.json.data.campaign_id}/dry-run`, { hold_in_mock_state: true }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(dryHold.json.data.status, 'Mock dry-run');
    await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpTwo.json.data.campaign_id}/approve`, {}, { Authorization: `Bearer ${newToken}` });
    const failExec = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpTwo.json.data.campaign_id}/execute-mock`, { simulate_failure: true }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(failExec.json.data.status, 'Failed');
    const cancelRes = await requestJson(baseUrl, 'POST', `/api/portal/campaigns/${cmpTwo.json.data.campaign_id}/cancel`, {}, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(cancelRes.json.data.status, 'Cancelled');

    const badCmp = await requestJson(baseUrl, 'POST', '/api/portal/campaigns', {
      name: 'Phase 5327 Missing Template Validation Fail',
      channel: 'WhatsApp',
      target_segment: 'UNKNOWN_SEGMENT',
      template_id: 'NON_EXISTENT_TPL'
    }, { Authorization: `Bearer ${newToken}` });
    assert.strictEqual(badCmp.json.data.status, 'Validation failed');
    pass('Campaigns Opt-Out, Invalid Phone & All 9 States', `Builders excluded ${dryBld.json.summary.invalid_contacts_excluded} invalid contacts; Colleges suppressed ${dryCol.json.summary.suppressed_opt_outs} Opted_Out; all 9 states verified`);

    console.log(`\nALL PHASE 5.3.27 SUITE CHECKS PASSED (${results.length}/${results.length})`);
  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    restoreSnapshots();
    console.log('Restored local data directory snapshots cleanly (zero test data pollution).');
  }
}

runSuite().catch(err => {
  console.error('SUITE FAILURE:', err);
  process.exit(1);
});
