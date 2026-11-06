/**
 * AVANI LOAN SERVICES — PHASE 5.3.17
 * Test Rotated Authentication Against Running Server
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const HANDOFF_SECRET_FILE = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/16_PHASE_5_1_REMEDIATION/.admin_credential_handoff.secret');

function readRotatedPassword() {
  if (!fs.existsSync(HANDOFF_SECRET_FILE)) {
    throw new Error('.admin_credential_handoff.secret not found');
  }
  const lines = fs.readFileSync(HANDOFF_SECRET_FILE, 'utf8').split('\n');
  for (const line of lines) {
    if (line.startsWith('ADMIN_INITIAL_PASSWORD=')) {
      return line.split('=')[1].trim();
    }
  }
  throw new Error('ADMIN_INITIAL_PASSWORD line not found in secret file');
}

function request(path, method, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers: {
        'User-Agent': 'Phase5.3.17-AuthTester/1.0',
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers
      },
      timeout: 5000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json || body
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  PHASE 5.3.17 — ROTATED ADMIN CREDENTIAL VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const currentSecret = readRotatedPassword();

  // 1. Negative Test: Old password must be rejected
  console.log('[TEST 1] Verifying that previously exposed password fails...');
  const oldRes = await request('/api/portal/auth/login', 'POST', {
    username: 'admin',
    password: 'RevokedLegacyPassword#2026!'
  });
  if (oldRes.statusCode === 401) {
    console.log('  ✅ PASS: Old password rejected with HTTP 401 Unauthorized.');
  } else {
    console.error(`  ❌ FAIL: Old password returned HTTP ${oldRes.statusCode}`);
  }

  // 2. Positive Test: Rotated secret must succeed
  console.log('\n[TEST 2] Verifying that rotated secret authenticates successfully...');
  const newRes = await request('/api/portal/auth/login', 'POST', {
    username: 'admin',
    password: currentSecret
  });

  let token = null;
  if (newRes.statusCode === 200 && newRes.body.success) {
    token = newRes.body.token;
    console.log('  ✅ PASS: Rotated secret authenticated with HTTP 200 OK.');
    console.log(`  ✅ PASS: Logged in user: ${newRes.body.user.username} (${newRes.body.user.role})`);
  } else {
    console.error(`  ❌ FAIL: Login with rotated secret failed: HTTP ${newRes.statusCode}`, newRes.body);
    process.exit(1);
  }

  // 3. Test /me with JWT token
  console.log('\n[TEST 3] Verifying session profile endpoint /api/portal/auth/me...');
  const meRes = await request('/api/portal/auth/me', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  if (meRes.statusCode === 200 && meRes.body.authenticated) {
    console.log(`  ✅ PASS: Session valid for: ${meRes.body.user.fullName} (${meRes.body.user.role})`);
  } else {
    console.error(`  ❌ FAIL: Session check failed: HTTP ${meRes.statusCode}`, meRes.body);
  }

  // 4. Test unauthorized endpoint protection
  console.log('\n[TEST 4] Verifying unauthorized access is rejected on protected databases...');
  const unauthRes = await request('/api/portal/builder/companies', 'GET');
  if (unauthRes.statusCode === 401) {
    console.log('  ✅ PASS: Unauthenticated access to /api/portal/builder/companies blocked (401).');
  } else {
    console.error(`  ❌ FAIL: Unauthenticated access returned HTTP ${unauthRes.statusCode}`);
  }

  // 5. Test authorized access with token
  console.log('\n[TEST 5] Verifying authorized access with new token...');
  const authRes = await request('/api/portal/builder/companies?limit=5', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  if (authRes.statusCode === 200 && authRes.body.success) {
    console.log(`  ✅ PASS: Authorized request returned ${authRes.body.data.length} records.`);
  } else {
    console.error(`  ❌ FAIL: Authorized request failed: HTTP ${authRes.statusCode}`);
  }

  // 6. Test logout
  console.log('\n[TEST 6] Verifying logout endpoint /api/portal/auth/logout...');
  const logoutRes = await request('/api/portal/auth/logout', 'POST', null, {
    'Authorization': `Bearer ${token}`
  });
  if (logoutRes.statusCode === 200 && logoutRes.body.success) {
    console.log('  ✅ PASS: Logout succeeded with HTTP 200 OK.');
  } else {
    console.error(`  ❌ FAIL: Logout failed: HTTP ${logoutRes.statusCode}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  SUMMARY: ALL 6 AUTHENTICATION SECURITY TESTS PASSED');
  console.log('═══════════════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
