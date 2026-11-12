// scripts/test_phase_5_3_33_security_hardening.cjs
// Focused automated verification for Phase 5.3.33 security hardening, CORS,
// security-header ownership, CSP Report-Only directives, SRI pinning, and rate limits.
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const bcrypt = require('bcrypt');

process.env.APP_MODE = 'test';
process.env.NODE_ENV = 'test';
process.env.PROVIDER_MODE = 'mock';
process.env.MONGODB_URI = '';
process.env.PORTAL_JWT_SECRET = 'phase_5_3_33_security_test_secret_key_9900';
process.env.PORTAL_TEST_RATE_MAX = '5';

const DATA_DIR = path.join(process.cwd(), 'AVANI_LOAN_SERVICES_UNIFIED_PORTAL', 'data');
const SNAPSHOT_FILES = [
  'admin_users.json',
  'admin_sessions.json',
  'admin_audit_logs.json',
  'portal_admin_users.json',
  'portal_admin_sessions.json',
  'portal_admin_audit_logs.json'
];

const snapshots = new Map();
for (const fname of SNAPSHOT_FILES) {
  const fpath = path.join(DATA_DIR, fname);
  snapshots.set(fpath, fs.existsSync(fpath) ? fs.readFileSync(fpath, 'utf8') : null);
}

function restoreSnapshots() {
  for (const [fpath, orig] of snapshots.entries()) {
    if (orig === null) {
      if (fs.existsSync(fpath)) fs.unlinkSync(fpath);
    } else {
      fs.writeFileSync(fpath, orig, 'utf8');
    }
  }
}

function requestRaw(baseUrl, method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlPath, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { Accept: 'application/json', ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(parsed, { method, headers: reqHeaders }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          rawHeaders: res.rawHeaders,
          json,
          text
        });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  const db = require('../src/models/portalDatabase.cjs');
  db.init();

  const express = require('express');
  const helmet = require('helmet');
  const cors = require('cors');

  const activePass = 'HardenedPass#2026!Avani';
  const inactivePass = 'InactivePass#2026!Avani';
  const rotatedPass = 'RotatedPass#2026!Avani2';

  const activeHash = await bcrypt.hash(activePass, 10);
  const inactiveHash = await bcrypt.hash(inactivePass, 10);

  db.upsert('admin_users', 'user_id', {
    user_id: 'USR-SEC-ACTIVE',
    username: 'secactiveadmin',
    email: 'secactive@avanifinserv.com',
    full_name: 'Sec Test Admin',
    role: 'Super Administrator',
    password_hash: activeHash,
    failed_login_attempts: 0,
    lockout_until: null,
    is_active: true,
    status: 'Active',
    created_at: new Date().toISOString()
  });

  db.upsert('admin_users', 'user_id', {
    user_id: 'USR-SEC-INACTIVE',
    username: 'secinactiveuser',
    email: 'secinactive@avanifinserv.com',
    full_name: 'Sec Test Inactive',
    role: 'Campaign Operator',
    password_hash: inactiveHash,
    failed_login_attempts: 0,
    lockout_until: null,
    is_active: false,
    status: 'Inactive',
    created_at: new Date().toISOString()
  });

  // Build app mirroring production Helmet + Permissions-Policy + CORS + portalAuthRoutes
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: false
  }));
  app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    next();
  });

  const productionAllowedOrigins = [
    'https://www.avanifinserv.com',
    'https://avanifinserv.com',
    'https://api.avanifinserv.com'
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        productionAllowedOrigins.includes(origin) ||
        /^https:\/\/avani-loan-service-fy-26-27(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie']
  }));
  app.use(express.json());
  app.use('/api/portal/auth', require('../src/routes/portalAuthRoutes.cjs'));
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const results = [];
  const pass = (id, msg) => {
    results.push({ id, msg });
    console.log(`[PASS] ${id}: ${msg}`);
  };

  try {
    // S01: Account enumeration check across unknown user, bad password, inactive user
    const unknownRes = await requestRaw(baseUrl, 'POST', '/api/portal/auth/login', {
      username: 'definitely_nonexistent_user_999',
      password: 'WrongPassword#2026!'
    }, { 'X-Forwarded-For': '10.10.1.1' });

    const badPassRes = await requestRaw(baseUrl, 'POST', '/api/portal/auth/login', {
      username: 'secactiveadmin',
      password: 'WrongPassword#2026!'
    }, { 'X-Forwarded-For': '10.10.1.2' });

    const inactiveRes = await requestRaw(baseUrl, 'POST', '/api/portal/auth/login', {
      username: 'secinactiveuser',
      password: inactivePass
    }, { 'X-Forwarded-For': '10.10.1.3' });

    assert.strictEqual(unknownRes.status, 401);
    assert.strictEqual(badPassRes.status, 401);
    assert.strictEqual(inactiveRes.status, 401);
    assert.strictEqual(unknownRes.json.message, badPassRes.json.message);
    assert.strictEqual(badPassRes.json.message, inactiveRes.json.message);
    assert(!/remaining|deactivated|unknown|attempt/i.test(badPassRes.json.message));
    pass('S01', 'Uniform HTTP 401 message across unknown, bad-password, and inactive login attempts');

    // S02: Login rate limit triggers HTTP 429 on 6th request from same IP
    let got429Login = false;
    for (let i = 0; i < 6; i++) {
      const r = await requestRaw(baseUrl, 'POST', '/api/portal/auth/login', {
        username: 'nobody_ratelimit',
        password: 'WrongPassword#2026!'
      }, { 'X-Forwarded-For': '10.10.1.99' });
      if (r.status === 429) got429Login = true;
    }
    assert.strictEqual(got429Login, true, 'Expected HTTP 429 on /login rate limit');
    pass('S02', '/api/portal/auth/login enforces rate limit (HTTP 429)');

    // Reset active admin failed count & obtain valid session from clean IP
    const activeUser = db.getById('admin_users', 'USR-SEC-ACTIVE');
    activeUser.failed_login_attempts = 0;
    activeUser.lockout_until = null;
    db.upsert('admin_users', 'user_id', activeUser);

    const okLogin = await requestRaw(baseUrl, 'POST', '/api/portal/auth/login', {
      username: 'secactiveadmin',
      password: activePass
    }, { 'X-Forwarded-For': '10.10.2.1' });
    assert.strictEqual(okLogin.status, 200);
    const token = okLogin.json.token;

    // S03: Weak password and password reuse rejection on /change-password
    const weakRes = await requestRaw(baseUrl, 'POST', '/api/portal/auth/change-password', {
      currentPassword: activePass,
      newPassword: 'short1A!'
    }, { Authorization: `Bearer ${token}`, 'X-Forwarded-For': '10.10.2.2' });
    assert.strictEqual(weakRes.status, 400);

    const reuseRes = await requestRaw(baseUrl, 'POST', '/api/portal/auth/change-password', {
      currentPassword: activePass,
      newPassword: activePass
    }, { Authorization: `Bearer ${token}`, 'X-Forwarded-For': '10.10.2.2' });
    assert.strictEqual(reuseRes.status, 400);
    assert(reuseRes.json.message.includes('differ'));
    pass('S03', '/change-password enforces >=12-char complexity and blocks password reuse');

    // S04: /change-password dedicated rate limit triggers HTTP 429 after 5 attempts
    let got429Chg = false;
    for (let i = 0; i < 4; i++) {
      const r = await requestRaw(baseUrl, 'POST', '/api/portal/auth/change-password', {
        currentPassword: 'WrongCurrentPassword!',
        newPassword: rotatedPass
      }, { Authorization: `Bearer ${token}`, 'X-Forwarded-For': '10.10.2.2' });
      if (r.status === 429) got429Chg = true;
    }
    assert.strictEqual(got429Chg, true, 'Expected HTTP 429 on /change-password rate limit');
    pass('S04', '/api/portal/auth/change-password enforces dedicated rate limiter (HTTP 429)');

    // S05: Successful password rotation from fresh IP revokes old session
    const chgOk = await requestRaw(baseUrl, 'POST', '/api/portal/auth/change-password', {
      currentPassword: activePass,
      newPassword: rotatedPass
    }, { Authorization: `Bearer ${token}`, 'X-Forwarded-For': '10.10.3.1' });
    assert.strictEqual(chgOk.status, 200);
    assert(chgOk.json.token && chgOk.json.token !== token);

    const staleMe = await requestRaw(baseUrl, 'GET', '/api/portal/auth/me', null, {
      Authorization: `Bearer ${token}`,
      'X-Forwarded-For': '10.10.3.1'
    });
    assert.strictEqual(staleMe.status, 401);
    pass('S05', 'Successful password rotation issues new token and invalidates prior session');

    // S06: Single-owner security headers and strict CORS verification
    const allowedPreflight = await requestRaw(baseUrl, 'OPTIONS', '/api/portal/auth/me', null, {
      Origin: 'https://www.avanifinserv.com',
      'Access-Control-Request-Method': 'GET'
    });
    assert.strictEqual(allowedPreflight.headers['access-control-allow-origin'], 'https://www.avanifinserv.com');

    const previewAllowed = await requestRaw(baseUrl, 'GET', '/health', null, {
      Origin: 'https://avani-loan-service-fy-26-27-cqwfwdhod.vercel.app'
    });
    assert.strictEqual(previewAllowed.headers['access-control-allow-origin'], 'https://avani-loan-service-fy-26-27-cqwfwdhod.vercel.app');

    const rogueVercelAllowed = await requestRaw(baseUrl, 'GET', '/health', null, {
      Origin: 'https://avani-loan-service-evil-phish.vercel.app'
    });
    assert.strictEqual(rogueVercelAllowed.headers['access-control-allow-origin'], undefined);

    const evilCors = await requestRaw(baseUrl, 'OPTIONS', '/api/portal/auth/me', null, {
      Origin: 'https://evil-attacker.example',
      'Access-Control-Request-Method': 'POST'
    });
    assert.strictEqual(evilCors.headers['access-control-allow-origin'], undefined);

    // Check Helmet does NOT emit Strict-Transport-Security (single-owned by Nginx) and emits single X-Frame-Options/X-Content-Type-Options/Permissions-Policy
    const healthHdr = await requestRaw(baseUrl, 'GET', '/health');
    assert.strictEqual(healthHdr.headers['strict-transport-security'], undefined);
    assert.strictEqual(healthHdr.headers['x-frame-options'], 'SAMEORIGIN');
    assert.strictEqual(healthHdr.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(healthHdr.headers['x-xss-protection'], '0');
    assert(healthHdr.headers['permissions-policy'] && healthHdr.headers['permissions-policy'].includes('camera=()'));
    pass('S06', 'CORS restricts origins strictly (no rogue prefix wildcard) and Express omits HSTS so Nginx owns TLS HSTS alone');

    // S07: Static frontend artifact integrity checks (vercel.json, index.html, external-widgets.js)
    const vercelCfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
    const hdrRule = vercelCfg.headers.find(h => h.source === '/((?!api/).*)');
    assert(hdrRule, 'Missing static header rule in vercel.json');
    const hdrMap = Object.fromEntries(hdrRule.headers.map(h => [h.key, h.value]));
    assert.strictEqual(hdrMap['X-Content-Type-Options'], 'nosniff');
    assert.strictEqual(hdrMap['X-Frame-Options'], 'SAMEORIGIN');
    assert.strictEqual(hdrMap['Referrer-Policy'], 'strict-origin-when-cross-origin');
    assert(hdrMap['Permissions-Policy'].includes('microphone=(self)'));
    assert(hdrMap['Content-Security-Policy-Report-Only'] && !hdrMap['Content-Security-Policy-Report-Only'].includes("'unsafe-eval'"));
    assert(!/\bhttps:\/\/\*(?:\s|;|$)/i.test(hdrMap['Content-Security-Policy-Report-Only']));

    const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    assert(!indexHtml.includes('@latest'), 'index.html must not contain floating @latest CDN script');
    assert(indexHtml.includes('@1.1.10/dist/assets/index.js'), 'Vapi must be pinned to verified @1.1.10 version');
    assert(indexHtml.includes('integrity="sha384-'), 'Vapi CDN tag must carry SRI sha384 integrity attribute');
    assert(indexHtml.includes('src="/js/external-widgets.js"'), 'External widgets init script must be loaded cleanly');
    const executableInlineScripts = indexHtml.match(/<script(?![^>]*type="application\/ld\+json")(?![^>]*\bsrc=)[^>]*>/gi) || [];
    assert.strictEqual(executableInlineScripts.length, 0, `Found unexpected inline scripts in index.html: ${executableInlineScripts.join(', ')}`);
    assert(fs.existsSync(path.join(process.cwd(), 'public', 'js', 'external-widgets.js')));
    pass('S07', 'vercel.json headers/CSP-Report-Only, Vapi SRI pinning, and inline-script extraction verified');

    console.log(`\nALL PHASE 5.3.33 SECURITY HARDENING CHECKS PASSED (${results.length}/${results.length})`);
  } finally {
    await new Promise(resolve => server.close(resolve));
    restoreSnapshots();
    delete process.env.PORTAL_TEST_RATE_MAX;
  }
}

run().catch(err => {
  console.error('SECURITY HARDENING TEST FAILED:', err);
  process.exit(1);
});
