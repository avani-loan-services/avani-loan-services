// scripts/test_phase_5_3_23_template_suite.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PHASE 5.3.23 COMPREHENSIVE REGRESSION TEST SUITE
// Covers Groups A–G: Build, Auth, Meta Integration, Templates, Campaign Safety,
// Database Integrity (80 Builders, 24 Schools, 56 Colleges), and UI Contracts.
// ─────────────────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.PROVIDER_MODE = 'mock';

const fs = require('fs');
const path = require('path');
const http = require('http');
const app = require('../src/server.cjs');
const db = require('../src/models/portalDatabase.cjs');
const { parseMetaTemplate } = require('../src/services/metaWhatsAppTemplateService.cjs');

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, group, name, details = '') {
  if (condition) {
    passed++;
    results.push({ group, name, status: 'PASS', details });
    console.log(`  ✅ [PASS] [${group}] ${name}`);
  } else {
    failed++;
    results.push({ group, name, status: 'FAIL', details });
    console.error(`  ❌ [FAIL] [${group}] ${name} — ${details}`);
  }
}

function request(server, method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, json, raw });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runSuite() {
  console.log('=========================================================================');
  console.log('  PHASE 5.3.23 — META WHATSAPP TEMPLATES & ADMIN REGRESSION SUITE');
  console.log('=========================================================================\n');

  // Read active admin credential from local git-ignored secret file
  const secretPath = path.join(__dirname, '../.admin_credential_rotated.secret');
  let adminPassword = '';
  if (fs.existsSync(secretPath)) {
    const lines = fs.readFileSync(secretPath, 'utf8').split('\n');
    const passLine = lines.find(l => l.startsWith('# CREDENTIAL: '));
    if (passLine) adminPassword = passLine.replace('# CREDENTIAL: ', '').trim();
  }

  const server = await new Promise(resolve => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    // ── GROUP A: BUILD & APPLICATION INTEGRITY ──
    console.log('--- GROUP A: Build & Application Integrity ---');
    const distIndex = path.join(__dirname, '../dist/index.html');
    assert(fs.existsSync(distIndex), 'Group A', 'A1. Production build dist/index.html exists');
    const distAssets = path.join(__dirname, '../dist/assets');
    const assetFiles = fs.existsSync(distAssets) ? fs.readdirSync(distAssets) : [];
    assert(assetFiles.some(f => f.endsWith('.js')) && assetFiles.some(f => f.endsWith('.css')), 'Group A', 'A2. Production JS and CSS bundles compiled cleanly');

    const healthRes = await request(server, 'GET', '/health');
    assert(healthRes.status === 200 && healthRes.json?.status === 'ok', 'Group A', 'A3. Server /health endpoint returns HTTP 200 OK');

    // ── GROUP B: AUTHENTICATION & SECURITY ──
    console.log('\n--- GROUP B: Authentication & Security ---');
    const unauthTpl = await request(server, 'GET', '/api/portal/templates');
    assert(unauthTpl.status === 401, 'Group B', 'B1. Unauthenticated GET /api/portal/templates blocked with HTTP 401');

    const unauthMeta = await request(server, 'GET', '/api/portal/templates/meta-status');
    assert(unauthMeta.status === 401, 'Group B', 'B2. Unauthenticated GET /api/portal/templates/meta-status blocked with HTTP 401');

    const unauthSync = await request(server, 'POST', '/api/portal/templates/sync-meta');
    assert(unauthSync.status === 401, 'Group B', 'B3. Unauthenticated POST /api/portal/templates/sync-meta blocked with HTTP 401');

    const unauthCmp = await request(server, 'GET', '/api/portal/campaigns');
    assert(unauthCmp.status === 401, 'Group B', 'B4. Unauthenticated GET /api/portal/campaigns blocked with HTTP 401');

    const missingCreds = await request(server, 'POST', '/api/portal/auth/login', { username: '', password: '' });
    assert(missingCreds.status === 400, 'Group B', 'B5. Empty login credentials rejected with HTTP 400');

    const invalidLogin = await request(server, 'POST', '/api/portal/auth/login', { username: 'admin', password: 'WrongPassword_999!' });
    assert(invalidLogin.status === 401 && invalidLogin.json?.success === false, 'Group B', 'B6. Invalid login password rejected with HTTP 401');

    const validLogin = await request(server, 'POST', '/api/portal/auth/login', { username: 'admin', password: adminPassword });
    assert(validLogin.status === 200 && validLogin.json?.success === true && validLogin.json?.token, 'Group B', 'B7. Valid administrator login succeeds and issues session token');

    const token = validLogin.json.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    const meRes = await request(server, 'GET', '/api/portal/auth/me', null, authHeaders);
    assert(meRes.status === 200 && meRes.json?.user?.username === 'admin', 'Group B', 'B8. Session persistence verified via GET /api/portal/auth/me');

    // ── GROUP C: META INTEGRATION & HONEST VERIFICATION ──
    console.log('\n--- GROUP C: Meta Integration & Honest Verification ---');
    const metaStatusRes = await request(server, 'GET', '/api/portal/templates/meta-status', null, authHeaders);
    assert(
      metaStatusRes.status === 200 &&
      metaStatusRes.json?.data?.waba_id === '1062614709598311' &&
      metaStatusRes.json?.data?.phone_number_id === '1147494668457940',
      'Group C',
      'C1. Meta status reports genuine WABA ID (1062614709598311) & Phone ID (1147494668457940)'
    );

    assert(
      metaStatusRes.json?.data?.status === 'CONFIGURATION_PENDING' &&
      metaStatusRes.json?.data?.token_status === 'MISSING_SYSTEM_USER_TOKEN' &&
      metaStatusRes.json?.data?.templates_summary?.meta_approved === 0,
      'Group C',
      'C2. Missing Meta System User Token reported honestly (0 false Meta-approved claims)'
    );

    const syncRes = await request(server, 'POST', '/api/portal/templates/sync-meta', {}, authHeaders);
    assert(
      syncRes.status === 200 &&
      syncRes.json?.synced === false &&
      syncRes.json?.data?.reason === 'MISSING_META_ACCESS_TOKEN',
      'Group C',
      'C3. POST /api/portal/templates/sync-meta safely handles missing token without faking sync'
    );

    // Test canonical Meta status parser across all Meta states
    const sampleApproved = parseMetaTemplate({
      id: '99001122',
      name: 'avani_home_loan_welcome',
      status: 'APPROVED',
      category: 'UTILITY',
      language: 'en',
      components: [
        { type: 'HEADER', format: 'TEXT', text: 'Welcome to Avani Loan Services' },
        { type: 'BODY', text: 'Hello {{1}}, your inquiry {{2}} is registered.', example: { body_text: [['Sachin', 'HL-101']] } },
        { type: 'FOOTER', text: 'Avani Finserv' },
        { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Track Status' }] }
      ]
    });
    assert(
      sampleApproved.meta_approval_status === 'APPROVED' &&
      sampleApproved.synced_from_meta === true &&
      sampleApproved.variables.length === 2 &&
      sampleApproved.sample_values['1'] === 'Sachin',
      'Group C',
      'C4. Meta Graph API template parser accurately maps APPROVED status, components, and variables'
    );

    const statusesToTest = ['PENDING', 'REJECTED', 'PAUSED', 'DISABLED', 'UNRECOGNIZED_STATE'];
    const mappedStatuses = statusesToTest.map(st => parseMetaTemplate({ id: '1', name: 't', status: st }).meta_approval_status);
    assert(
      mappedStatuses[0] === 'PENDING' &&
      mappedStatuses[1] === 'REJECTED' &&
      mappedStatuses[2] === 'PAUSED' &&
      mappedStatuses[3] === 'DISABLED' &&
      mappedStatuses[4] === 'UNKNOWN',
      'Group C',
      'C5. Meta status classifier accurately maps PENDING, REJECTED, PAUSED, DISABLED, UNKNOWN'
    );

    // ── GROUP D: TEMPLATE FUNCTIONALITY ──
    console.log('\n--- GROUP D: Template Functionality ---');
    const listRes = await request(server, 'GET', '/api/portal/templates', null, authHeaders);
    assert(listRes.status === 200 && Array.isArray(listRes.json?.data) && listRes.json.data.length >= 7, 'Group D', 'D1. GET /api/portal/templates returns all 7 seed blueprints');

    const unverifiedCheck = listRes.json.data.filter(t => t.channel === 'WhatsApp' && !t.synced_from_meta);
    assert(unverifiedCheck.every(t => t.meta_approval_status !== 'APPROVED'), 'Group D', 'D2. Unverified local WhatsApp blueprints are never falsely labelled APPROVED');

    const searchRes = await request(server, 'GET', '/api/portal/templates?search=builder', null, authHeaders);
    assert(searchRes.status === 200 && searchRes.json.data.length >= 2, 'Group D', 'D3. Template search filter (?search=builder) returns matching records');

    const channelRes = await request(server, 'GET', '/api/portal/templates?channel=WhatsApp', null, authHeaders);
    assert(channelRes.status === 200 && channelRes.json.data.every(t => t.channel === 'WhatsApp'), 'Group D', 'D4. Template channel filter (?channel=WhatsApp) isolates WhatsApp templates');

    const catRes = await request(server, 'GET', '/api/portal/templates?category=UTILITY', null, authHeaders);
    assert(catRes.status === 200 && catRes.json.data.every(t => t.category === 'UTILITY'), 'Group D', 'D5. Template category filter (?category=UTILITY) isolates Utility templates');

    const detailRes = await request(server, 'GET', '/api/portal/templates/TPL-WABA-001', null, authHeaders);
    assert(detailRes.status === 200 && detailRes.json?.data?.name === 'als_lead_qualification_v1', 'Group D', 'D6. GET /api/portal/templates/:id returns complete template detail');

    const previewValid = await request(server, 'POST', '/api/portal/templates/preview', {
      template_id: 'TPL-WABA-001',
      sample_values: { '1': 'Rohan Deshmukh', '2': 'Home Loan', '3': '₹65,00,000' }
    }, authHeaders);
    assert(
      previewValid.status === 200 &&
      previewValid.json?.valid === true &&
      previewValid.json?.preview?.renderedBody.includes('Rohan Deshmukh'),
      'Group D',
      'D7. POST /api/portal/templates/preview interpolates variables and validates completeness'
    );

    const previewInvalid = await request(server, 'POST', '/api/portal/templates/preview', {
      template_id: 'TPL-WABA-001',
      sample_values: { '1': 'Rohan Deshmukh', '2': '', '3': '' }
    }, authHeaders);
    assert(
      previewInvalid.status === 200 &&
      previewInvalid.json?.valid === false &&
      previewInvalid.json?.missing_variables?.length === 2,
      'Group D',
      'D8. POST /api/portal/templates/preview detects missing required placeholders'
    );

    // Duplicate as local draft
    const dupRes = await request(server, 'POST', '/api/portal/templates/TPL-WABA-002/duplicate', {}, authHeaders);
    const dupId = dupRes.json?.data?.template_id;
    assert(
      dupRes.status === 201 &&
      dupRes.json?.data?.meta_approval_status === 'LOCAL_DRAFT' &&
      dupRes.json?.data?.synced_from_meta === false,
      'Group D',
      'D9. POST /api/portal/templates/:id/duplicate creates a clearly labelled LOCAL_DRAFT'
    );

    // Clean up duplicated test record after verifying
    if (dupId && db.tables.portal_templates.has(dupId)) {
      db.tables.portal_templates.delete(dupId);
      db.persist('portal_templates');
    }

    // Controlled test send simulation (missing variable rejection + valid mock simulation)
    const testSendFail = await request(server, 'POST', '/api/portal/templates/send-test', {
      template_id: 'TPL-WABA-001',
      recipient_phone: '+919175635165',
      variables: { '1': 'Sachin' }
    }, authHeaders);
    assert(testSendFail.status === 400 && testSendFail.json?.missing_variables?.length > 0, 'Group D', 'D10. Controlled test send blocks dispatch when required variables are missing');

    const testSendOk = await request(server, 'POST', '/api/portal/templates/send-test', {
      template_id: 'TPL-WABA-001',
      recipient_phone: '+919175635165',
      variables: { '1': 'Sachin Patil', '2': 'Home Loan', '3': '₹45,00,000' }
    }, authHeaders);
    assert(
      testSendOk.status === 200 &&
      testSendOk.json?.success === true &&
      testSendOk.json?.simulation?.live_send_executed === false &&
      testSendOk.json?.simulation?.cost_incurred === 0,
      'Group D',
      'D11. Controlled test send simulates message in Mock Mode with 0 live sends and ₹0 cost'
    );

    // ── GROUP E: CAMPAIGN SAFETY & DRY RUN ──
    console.log('\n--- GROUP E: Campaign Safety & Dry Run ---');
    const cmpList = await request(server, 'GET', '/api/portal/campaigns', null, authHeaders);
    assert(cmpList.status === 200 && cmpList.json?.provider_mode === 'mock', 'Group E', 'E1. Campaigns list confirms PROVIDER_MODE=mock active');

    const firstCmpId = cmpList.json?.data?.[0]?.campaign_id || 'CMP-SEED-001';
    const dryRunRes = await request(server, 'POST', `/api/portal/campaigns/${firstCmpId}/dry-run`, {}, authHeaders);
    assert(
      dryRunRes.status === 200 &&
      dryRunRes.json?.summary?.live_messages_dispatched === 0 &&
      dryRunRes.json?.summary?.cost_incurred === 0 &&
      typeof dryRunRes.json?.summary?.sample_rendered_message === 'string',
      'Group E',
      'E2. Campaign dry-run validates audience, renders template preview, and sends 0 live messages'
    );

    // ── GROUP F: DATABASE INTEGRITY ──
    console.log('\n--- GROUP F: Database Integrity ---');
    const { isSchool, isCollege } = require('../src/utils/educationCategoryHelper.cjs');
    const buildersCount = db.getAll('builder_companies').length;
    const allEdu = db.getAll('education_institutions');
    const schoolsCount = allEdu.filter(i => isSchool(i)).length;
    const collegesCount = allEdu.filter(i => isCollege(i)).length;

    assert(buildersCount === 80, 'Group F', `F1. All 80 Maharashtra Builder records preserved (count=${buildersCount})`);
    assert(schoolsCount === 24, 'Group F', `F2. All 24 School Funding records preserved (count=${schoolsCount})`);
    assert(collegesCount === 56, 'Group F', `F3. All 56 College & University records preserved (count=${collegesCount})`);

    // ── GROUP G: LOGOUT & SESSION REVOCATION ──
    console.log('\n--- GROUP G: Logout & Session Revocation ---');
    const logoutRes = await request(server, 'POST', '/api/portal/auth/logout', {}, authHeaders);
    assert(logoutRes.status === 200 && logoutRes.json?.success === true, 'Group G', 'G1. Administrator logout succeeds');

    const afterLogoutRes = await request(server, 'GET', '/api/portal/templates', null, authHeaders);
    assert(afterLogoutRes.status === 401, 'Group G', 'G2. Revoked session token is rejected with HTTP 401 on subsequent template requests');

  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  console.log('\n=========================================================================');
  console.log(`  TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('=========================================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runSuite().catch(err => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
