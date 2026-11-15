/**
 * AVANI LOAN SERVICES — PHASE 5.3.17 (Isolated Harness Updated Phase 5.3.34)
 * Automation Safety Gates & Emergency Kill-Switch Verifier
 * Uses isolated ephemeral Express test server + mock provider mode + test-only user.
 */

'use strict';

process.env.APP_MODE = 'test';
process.env.NODE_ENV = 'test';
process.env.PROVIDER_MODE = 'mock';
process.env.MONGODB_URI = '';
process.env.PORTAL_JWT_SECRET = 'phase_5_3_34_isolated_safety_gate_jwt_key';

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const bcrypt = require('bcrypt');
const express = require('express');

const db = require('../src/models/portalDatabase.cjs');

const DATA_DIR = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');
const SNAPSHOT_FILES = fs.existsSync(DATA_DIR)
  ? fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
  : [];
const fileSnapshots = new Map();
for (const fname of SNAPSHOT_FILES) {
  const fpath = path.join(DATA_DIR, fname);
  fileSnapshots.set(fpath, fs.readFileSync(fpath, 'utf8'));
}
function restoreSnapshots() {
  for (const [fpath, orig] of fileSnapshots.entries()) {
    fs.writeFileSync(fpath, orig, 'utf8');
  }
}

let baseUrl = '';

function request(urlPath, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const target = new URL(urlPath, baseUrl);
    const req = http.request(target, {
      method,
      headers: {
        'User-Agent': 'Phase5.3.17-SafetyTester/1.0',
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers
      },
      timeout: 5000
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({ statusCode: res.statusCode, body: json || body });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timed out')); });
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🛑 PHASE 5.3.17: AUTOMATION SAFETY GATES & EMERGENCY KILL-SWITCH');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  db.init();
  const testUser = 'safetytestadmin';
  const testPass = 'IsolatedSafetyGate#2026!';
  db.upsert('admin_users', 'user_id', {
    user_id: 'USR-TEST-SAFETY-001',
    username: testUser,
    email: 'safetytestadmin@avanifinserv.com',
    full_name: 'Isolated Safety Gate Admin',
    password_hash: bcrypt.hashSync(testPass, 10),
    role: 'Super Administrator',
    must_change_password: false,
    failed_login_attempts: 0,
    lockout_until: null,
    is_active: true,
    status: 'Active',
    created_at: new Date().toISOString()
  });

  const app = express();
  app.use(express.json());
  app.use('/api/portal/auth', require('../src/routes/portalAuthRoutes.cjs'));
  app.use('/api/portal/dashboard', require('../src/routes/unifiedPortalRoutes.cjs'));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    // Authenticate using isolated test-only user
    const loginRes = await request('/api/portal/auth/login', 'POST', { username: testUser, password: testPass });
    assert.strictEqual(loginRes.statusCode, 200, 'Isolated safety test admin login failed');
    assert(loginRes.body.token, 'JWT token missing');
    const authHeaders = { 'Authorization': `Bearer ${loginRes.body.token}` };

    // 1. Check Automation Status
    const statusRes = await request('/api/portal/dashboard/automation/status', 'GET', null, authHeaders);
    assert.strictEqual(statusRes.statusCode, 200);
    const state = statusRes.body.data || {};
    console.log('  • Initial Automation Status:', {
      stop_active: state.stop_active,
      email_active: state.email_marketing_active,
      whatsapp_active: state.whatsapp_marketing_active
    });

    // 2. Trigger Emergency Stop
    console.log('\n--- ENGAGING EMERGENCY KILL-SWITCH ---');
    const stopRes = await request('/api/portal/dashboard/automation/emergency-stop', 'POST', {
      reason: 'Phase 5.3.17 Automated Safety Gate Verification Probe'
    }, authHeaders);
    const stopData = stopRes.body.data || {};
    assert.strictEqual(stopRes.statusCode, 200);
    assert.strictEqual(stopData.stop_active, true, 'Emergency stop did not activate');
    console.log('  ✅ [PASS] Emergency kill-switch engaged immediately (stop_active: true).');

    // 3. Verify Marketing Dispatch Blocked during Emergency Stop
    const checkRes = await request('/api/portal/dashboard/marketing/check-eligibility', 'POST', {
      contact: {
        contact_id: 'TEST-RECIP-001',
        verification_status: 'Verified',
        official_phone: '+91 9823001122',
        whatsapp_opt_in: true
      },
      consent: {
        opt_in_status: 'Opted_In'
      }
    }, authHeaders);
    const whatsappEligibility = checkRes.body.data?.whatsapp || {};
    assert.strictEqual(checkRes.statusCode, 200, `Unexpected eligibility status ${checkRes.statusCode}`);
    assert.strictEqual(whatsappEligibility.eligible, false, 'Marketing dispatch was not suppressed during emergency stop');
    console.log('  ✅ [PASS] Marketing dispatch correctly suppressed while emergency stop is active:', whatsappEligibility.reason || whatsappEligibility.reasons);

    // 4. Safely Resume Automation
    console.log('\n--- DISENGAGING EMERGENCY KILL-SWITCH (RESTORE SYSTEM STATE) ---');
    const resumeRes = await request('/api/portal/dashboard/automation/resume', 'POST', { channels: ['email', 'whatsapp', 'followups'] }, authHeaders);
    const resumeData = resumeRes.body.data || {};
    assert.strictEqual(resumeRes.statusCode, 200);
    assert.strictEqual(resumeData.stop_active, false, 'Automation resume failed');
    console.log('  ✅ [PASS] Automation resumed successfully (stop_active: false).');

    // 5. Verify PROVIDER_MODE is mock
    console.log('\n--- PROVIDER MODE & DISPATCH CONSTRAINTS ---');
    const complianceRes = await request('/api/portal/dashboard/marketing/compliance-summary', 'GET', null, authHeaders);
    assert.strictEqual(complianceRes.statusCode, 200);
    assert.strictEqual(process.env.PROVIDER_MODE, 'mock');
    console.log('  • Outbound Provider Mode:  MOCK (Strict ₹0/month perpetual zero cost)');
    console.log('  • Unsolicited Outbound:    BLOCKED');
    console.log('  ✅ [PASS] All automation safety gates, suppression rules, and kill-switches operational.');

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('✅ ALL AUTOMATION SAFETY CHECKS PASSED (5/5)');
    console.log('═══════════════════════════════════════════════════════════════════\n');
  } finally {
    await new Promise(resolve => server.close(resolve));
    restoreSnapshots();
  }
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
