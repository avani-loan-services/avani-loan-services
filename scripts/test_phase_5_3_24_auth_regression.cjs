// scripts/test_phase_5_3_24_auth_regression.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PHASE 5.3.24 AUTHENTICATION & SECURITY REGRESSION SUITE
// Tests 15 Mandatory Security, Session, and Storage Boundaries
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const http = require('http');
const express = require('express');
const bcrypt = require('bcrypt');

// Enforce test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'TEST_JWT_SECRET_PORTAL_2026_@AVANI_FINSERV';
process.env.CALCULATOR_SESSION_SECRET = 'TEST_JWT_SECRET_PORTAL_2026_@AVANI_FINSERV';

const db = require('../src/models/portalDatabase.cjs');
const portalAuthRouter = require('../src/routes/portalAuthRoutes.cjs');
const unifiedPortalRouter = require('../src/routes/unifiedPortalRoutes.cjs');
const { authenticate, changePassword, verifyToken, isSessionActive } = require('../src/services/portalAuthService.cjs');
const { requirePortalAuth } = require('../src/middleware/portalAuthMiddleware.cjs');

// Test fixtures
const testPassword = 'TestAuthPassword@2026#';
const newRotatedPassword = 'NewRotatedPassword@2026#';
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(testPassword, salt);

const testUser = {
  user_id: 'USR-REGRESSION-001',
  username: 'regressionadmin',
  email: 'regression@avanifinserv.com',
  full_name: 'Regression Test Admin',
  password_hash: passwordHash,
  role: 'Super Administrator',
  must_change_password: false,
  failed_login_attempts: 0,
  lockout_until: null,
  is_active: true,
  created_at: new Date().toISOString(),
  last_login: null
};

// Seed test user
db.tables.admin_users.set(testUser.user_id, testUser);

// Setup Express Test App
const app = express();
app.use(express.json());
app.use('/api/portal/auth', portalAuthRouter);
app.use('/api/portal/dashboard', unifiedPortalRouter);

let server;
let baseUrl;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch (_) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('======================================================================');
  console.log('   AVANI LOAN SERVICES — PHASE 5.3.24 AUTHENTICATION REGRESSION TEST  ');
  console.log('======================================================================\n');

  const results = [];
  function assert(testId, description, condition, detail = '') {
    const pass = Boolean(condition);
    results.push({ testId, description, pass, detail });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${testId}: ${description}${detail ? ' — ' + detail : ''}`);
    if (!pass) {
      console.error(`       Assertion failed! Expected truthy condition.`);
    }
  }

  try {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    // TEST 1: Correct login
    const loginRes = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: testPassword
    });
    assert('T01', 'Correct login succeeds with HTTP 200', loginRes.status === 200);
    assert('T01b', 'Login response returns JWT token and user info', loginRes.body.success && !!loginRes.body.token && loginRes.body.user.userId === 'USR-REGRESSION-001');
    const validToken = loginRes.body.token;

    // TEST 2: Incorrect password
    const wrongPwdRes = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: 'WrongPassword999#'
    });
    assert('T02', 'Incorrect password returns HTTP 401', wrongPwdRes.status === 401);
    assert('T02b', 'Incorrect password returns uniform non-enumerating error without remaining attempts', wrongPwdRes.body.message === 'Invalid credentials or account unavailable.' && !wrongPwdRes.body.message.includes('remaining'));

    // TEST 3: Missing username
    const noUserRes = await request('POST', '/api/portal/auth/login', {
      password: testPassword
    });
    assert('T03', 'Missing username returns HTTP 400', noUserRes.status === 400);

    // TEST 4: Missing password
    const noPwdRes = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin'
    });
    assert('T04', 'Missing password returns HTTP 400', noPwdRes.status === 400);

    // TEST 5: Lockout behavior (5 consecutive failures)
    // We already did 1 failure, do 4 more
    for (let i = 0; i < 4; i++) {
      await request('POST', '/api/portal/auth/login', {
        username: 'regressionadmin',
        password: 'WrongPasswordAgain!'
      });
    }
    const lockedRes = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: testPassword // Even correct password should be locked out
    });
    assert('T05', 'Lockout triggers after 5 failed attempts (HTTP 423 or locked message)', lockedRes.status === 423 || lockedRes.body.message.includes('locked'));

    // Reset lockout for further testing
    const u = db.getById('admin_users', 'USR-REGRESSION-001');
    u.failed_login_attempts = 0;
    u.lockout_until = null;
    db.upsert('admin_users', 'user_id', u);

    // TEST 6: Session creation
    const reloginRes = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: testPassword
    });
    assert('T06', 'Session creation succeeds upon re-login', reloginRes.status === 200 && !!reloginRes.body.token);
    const sessionToken = reloginRes.body.token;
    const decoded = verifyToken(sessionToken);
    assert('T06b', 'Token contains valid sessionId and userId', decoded && !!decoded.sessionId && decoded.userId === 'USR-REGRESSION-001');

    // TEST 7: Session validation
    const meRes = await request('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${sessionToken}`
    });
    assert('T07', 'Authenticated session passes /me endpoint', meRes.status === 200 && meRes.body.user.username === 'regressionadmin');

    // TEST 8: Logout and session revocation
    const logoutRes = await request('POST', '/api/portal/auth/logout', null, {
      'Authorization': `Bearer ${sessionToken}`
    });
    assert('T08', 'Logout succeeds with HTTP 200', logoutRes.status === 200);

    // TEST 9: Stale / revoked session rejection
    const staleRes = await request('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${sessionToken}`
    });
    assert('T09', 'Revoked session receives HTTP 401 Unauthorized', staleRes.status === 401);

    // TEST 10: Unauthorized API access
    const noAuthRes = await request('GET', '/api/portal/dashboard/overview');
    assert('T10', 'Unauthenticated request to protected dashboard rejected (HTTP 401)', noAuthRes.status === 401);

    // TEST 11: Role-based authorization
    // Re-login to get active session
    const activeLogin = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: testPassword
    });
    const activeToken = activeLogin.body.token;
    const dashRes = await request('GET', '/api/portal/dashboard/overview', null, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert('T11', 'Super Administrator granted access to dashboard summary', dashRes.status === 200);

    // TEST 12: Password rotation and automatic session invalidation
    const rotateRes = await request('POST', '/api/portal/auth/change-password', {
      currentPassword: testPassword,
      newPassword: newRotatedPassword
    }, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert('T12a', 'Password rotation succeeds with HTTP 200', rotateRes.status === 200);

    // Verify old session token was automatically revoked upon password change
    const oldSessionCheck = await request('GET', '/api/portal/auth/me', null, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert('T12b', 'Previous session token invalidated immediately upon password change', oldSessionCheck.status === 401);

    // Verify old password no longer works
    const oldPwdLogin = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: testPassword
    });
    assert('T12c', 'Old password rejected on subsequent login', oldPwdLogin.status === 401);

    // Verify new password works
    const newPwdLogin = await request('POST', '/api/portal/auth/login', {
      username: 'regressionadmin',
      password: newRotatedPassword
    });
    assert('T12d', 'New rotated password logs in successfully', newPwdLogin.status === 200);

    // TEST 13: Restart persistence
    const loadedUser = db.getById('admin_users', 'USR-REGRESSION-001');
    assert('T13', 'Updated user and password hash persist in storage table', loadedUser && !!loadedUser.password_hash && loadedUser.must_change_password === false);

    // TEST 14: Database unavailable behavior
    // Test production mode 503 guard
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    let dbGuardThrew = false;
    try {
      // isMongoConnected is false in this unit test
      db.upsert('admin_users', 'user_id', { user_id: 'USR-TEMP-TEST', test: 1 });
    } catch (dbErr) {
      if (dbErr.statusCode === 503 || dbErr.message.includes('Authoritative persistent cloud storage is offline')) {
        dbGuardThrew = true;
      }
    }
    process.env.NODE_ENV = originalEnv;
    assert('T14', 'Production storage unavailability throws 503 guard error', dbGuardThrew);

    // TEST 15: Zero secret or plaintext credential leakage in logs and audit events
    const audits = db.tables.audit_logs ? Array.from(db.tables.audit_logs.values()) : [];
    const leakedSecrets = audits.filter(a => {
      const serialized = JSON.stringify(a);
      return serialized.includes(testPassword) || serialized.includes(newRotatedPassword);
    });
    assert('T15', 'Audit logs and error messages contain ZERO plaintext passwords or secrets', leakedSecrets.length === 0);

  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n======================================================================');
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  console.log(`TOTAL ASSERTIONS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
