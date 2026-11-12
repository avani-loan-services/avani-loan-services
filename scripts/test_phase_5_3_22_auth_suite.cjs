// scripts/test_phase_5_3_22_auth_suite.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PHASE 5.3.22 AUTOMATED AUTHENTICATION TEST SUITE
// Tests 10 Crucial Security & Authentication Boundaries
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Set TEST environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'TEST_SECRET_PORTAL_2026_@AVANI';
process.env.CALCULATOR_SESSION_SECRET = 'TEST_SECRET_PORTAL_2026_@AVANI';

const portalAuthRouter = require('../src/routes/portalAuthRoutes.cjs');
const unifiedPortalRouter = require('../src/routes/unifiedPortalRoutes.cjs');
const builderPortalRouter = require('../src/routes/builderPortalRoutes.cjs');
const educationPortalRouter = require('../src/routes/educationPortalRoutes.cjs');
const portalTemplatesRouter = require('../src/routes/portalTemplatesRoutes.cjs');
const portalCampaignsRouter = require('../src/routes/portalCampaignsRoutes.cjs');
const portalLeadsRouter = require('../src/routes/portalLeadsRoutes.cjs');
const db = require('../src/models/portalDatabase.cjs');
const { requirePortalCsrf } = require('../src/middleware/portalAuthMiddleware.cjs');

// Rotate credentials locally for test suite
const bcrypt = require('bcrypt');
const testPassword = 'TestAdmin@Secret2026!';
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(testPassword, salt);

const testUser = {
  user_id: 'USR-TEST-001',
  username: 'testadmin',
  email: 'testadmin@avanifinserv.com',
  full_name: 'Test Administrator',
  password_hash: passwordHash,
  role: 'Super Administrator',
  must_change_password: false,
  failed_login_attempts: 0,
  lockout_until: null,
  is_active: true,
  created_at: new Date().toISOString(),
  last_login: null
};

// Seed test user in db
db.tables.admin_users.set(testUser.user_id, testUser);

// Setup Express Test App
const app = express();
app.use(express.json());
app.use(requirePortalCsrf);

app.use('/api/portal/auth', portalAuthRouter);
app.use('/api/portal/dashboard', unifiedPortalRouter);
app.use('/api/portal/builder', builderPortalRouter);
app.use('/api/portal/education', educationPortalRouter);
app.use('/api/portal/templates', portalTemplatesRouter);
app.use('/api/portal/campaigns', portalCampaignsRouter);
app.use('/api/portal/leads', portalLeadsRouter);

let server;
const PORT = 3899;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers
    };
    if (body && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const results = [];

function assert(description, condition, details = '') {
  const pass = Boolean(condition);
  results.push({ description, pass, details });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${description} ${details ? '(' + details + ')' : ''}`);
}

async function runTests() {
  console.log('=== PHASE 5.3.22 LOCALHOST AUTHENTICATION TEST HARNESS ===\n');

  server = app.listen(PORT);
  await new Promise(r => setTimeout(r, 200));

  let activeToken = null;
  let activeCookie = null;

  try {
    // 1. Direct Unauthenticated Access Blocked
    console.log('--- Test 1: Direct Unauthenticated Access Blocked ---');
    const unauthMe = await makeRequest('GET', '/api/portal/auth/me');
    assert('Unauthenticated /me returns 401', unauthMe.status === 401 && unauthMe.data.authenticated === false);

    const unauthOverview = await makeRequest('GET', '/api/portal/dashboard/overview');
    assert('Unauthenticated /overview returns 401', unauthOverview.status === 401);

    const unauthBuilders = await makeRequest('GET', '/api/portal/builder/companies');
    assert('Unauthenticated /builder/companies returns 401', unauthBuilders.status === 401);

    const unauthSchools = await makeRequest('GET', '/api/portal/education/institutions?category=School');
    assert('Unauthenticated /education/institutions returns 401', unauthSchools.status === 401);

    // 2. Invalid Credentials Handling
    console.log('\n--- Test 2: Invalid Credentials Handling ---');
    const badLogin = await makeRequest('POST', '/api/portal/auth/login', {
      username: 'testadmin',
      password: 'WrongPassword123!'
    });
    assert('Invalid password returns 401', badLogin.status === 401 && badLogin.data.success === false);
    assert('Bad login omits remaining attempt count (non-enumerating)', badLogin.data.message === 'Invalid credentials or account unavailable.' && !badLogin.data.message.includes('remaining'));

    // 3. Unknown User Handling
    console.log('\n--- Test 3: Unknown User Handling ---');
    const unknownUser = await makeRequest('POST', '/api/portal/auth/login', {
      username: 'Admin Operations Dashboard',
      password: 'AnyPassword123!'
    });
    assert('Unknown username returns 401', unknownUser.status === 401 && unknownUser.data.success === false && unknownUser.data.message === badLogin.data.message);

    // 4. Valid Login Succeeded
    console.log('\n--- Test 4: Valid Login Succeeded ---');
    // Reset failed attempts for clean test
    testUser.failed_login_attempts = 0;
    testUser.lockout_until = null;
    db.tables.admin_users.set(testUser.user_id, testUser);

    const goodLogin = await makeRequest('POST', '/api/portal/auth/login', {
      username: 'testadmin',
      password: testPassword
    });
    assert('Valid credentials returns 200', goodLogin.status === 200 && goodLogin.data.success === true);
    assert('Returns valid JWT token', Boolean(goodLogin.data.token));
    assert('Sets HttpOnly cookie', Boolean(goodLogin.headers['set-cookie']));

    activeToken = goodLogin.data.token;
    const cookieHeader = goodLogin.headers['set-cookie'];
    if (cookieHeader && cookieHeader.length > 0) {
      activeCookie = cookieHeader[0].split(';')[0];
    }

    // 5. Authenticated /me via Cookie
    console.log('\n--- Test 5: Authenticated /me via Cookie ---');
    const meCookie = await makeRequest('GET', '/api/portal/auth/me', null, {
      'Cookie': activeCookie
    });
    assert('/me succeeds with HttpOnly cookie', meCookie.status === 200 && meCookie.data.authenticated === true);
    assert('/me returns user role Super Administrator', meCookie.data.user.role === 'Super Administrator');

    // 6. Authenticated /me via Bearer Token
    console.log('\n--- Test 6: Authenticated /me via Bearer Token ---');
    const meBearer = await makeRequest('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert('/me succeeds with Bearer token', meBearer.status === 200 && meBearer.data.authenticated === true);

    // 7. Protected Data Access Across Modules
    console.log('\n--- Test 7: Protected Data Access Across Modules ---');
    const authHeaders = { 'Authorization': `Bearer ${activeToken}`, 'Cookie': activeCookie };

    const overviewRes = await makeRequest('GET', '/api/portal/dashboard/overview', null, authHeaders);
    assert('Authenticated /overview returns 200', overviewRes.status === 200 && overviewRes.data.success === true);

    const builderRes = await makeRequest('GET', '/api/portal/builder/companies', null, authHeaders);
    assert('Authenticated /builder/companies returns 200', builderRes.status === 200 && Array.isArray(builderRes.data.data));

    const eduRes = await makeRequest('GET', '/api/portal/education/institutions', null, authHeaders);
    assert('Authenticated /education/institutions returns 200', eduRes.status === 200 && Array.isArray(eduRes.data.data));

    const tplRes = await makeRequest('GET', '/api/portal/templates', null, authHeaders);
    assert('Authenticated /templates returns 200', tplRes.status === 200 && Array.isArray(tplRes.data.data));

    const cmpRes = await makeRequest('GET', '/api/portal/campaigns', null, authHeaders);
    assert('Authenticated /campaigns returns 200', cmpRes.status === 200 && Array.isArray(cmpRes.data.data));

    // 8. Account Lockout After 5 Failures
    console.log('\n--- Test 8: Account Lockout After 5 Failures ---');
    testUser.failed_login_attempts = 4;
    db.tables.admin_users.set(testUser.user_id, testUser);

    const lockTrigger = await makeRequest('POST', '/api/portal/auth/login', {
      username: 'testadmin',
      password: 'WrongPasswordAgain!'
    });
    assert('5th failed attempt locks account', (lockTrigger.status === 423 || lockTrigger.status === 429) && lockTrigger.data.message.includes('locked'));

    // Attempting login while locked returns 429
    const lockedAttempt = await makeRequest('POST', '/api/portal/auth/login', {
      username: 'testadmin',
      password: testPassword // Even with correct password, locked!
    });
    assert('Locked account returns 429 even with correct password', lockedAttempt.status === 429);

    // Reset lockout for next test
    testUser.failed_login_attempts = 0;
    testUser.lockout_until = null;
    db.tables.admin_users.set(testUser.user_id, testUser);

    // 9. Logout Invalidation & Server-Side Session Revocation
    console.log('\n--- Test 9: Logout Invalidation & Server-Side Session Revocation ---');
    // Login again to obtain a fresh session
    const freshLogin = await makeRequest('POST', '/api/portal/auth/login', {
      username: 'testadmin',
      password: testPassword
    });
    const freshToken = freshLogin.data.token;
    const freshCookie = freshLogin.headers['set-cookie'][0].split(';')[0];

    // Verify fresh session works
    const preLogoutMe = await makeRequest('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${freshToken}`
    });
    assert('Pre-logout /me succeeds', preLogoutMe.status === 200);

    // Execute logout
    const logoutRes = await makeRequest('POST', '/api/portal/auth/logout', {}, {
      'Authorization': `Bearer ${freshToken}`,
      'Cookie': freshCookie,
      'Content-Type': 'application/json'
    });
    assert('Logout returns 200', logoutRes.status === 200 && logoutRes.data.success === true);

    // Attempt to reuse revoked token -> MUST FAIL (401)
    const postLogoutMe = await makeRequest('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${freshToken}`
    });
    assert('Post-logout token rejected by server with 401 (Session Revoked)', postLogoutMe.status === 401);

    // 10. Forged / Expired JWT Token Rejection
    console.log('\n--- Test 10: Forged / Expired JWT Token Rejection ---');
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmb3JnZWQiLCJyb2xlIjoiU3VwZXIgQWRtaW5pc3RyYXRvciJ9.fake_signature_abc123';
    const forgedRes = await makeRequest('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${forgedToken}`
    });
    assert('Forged token rejected with 401', forgedRes.status === 401);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    console.log('\n=== TEST SUITE COMPLETE ===');
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    console.log(`Summary: ${passed}/${total} assertions PASSED (${Math.round((passed/total)*100)}%)`);

    if (passed === total) {
      console.log('✅ ALL 10 AUTHENTICATION & SECURITY BOUNDARIES VERIFIED SUCCESSFULLY.');
    } else {
      console.error('❌ SOME TESTS FAILED.');
      process.exit(1);
    }
  }
}

runTests();
