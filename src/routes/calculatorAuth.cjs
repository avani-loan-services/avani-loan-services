// src/routes/calculatorAuth.cjs
// ─────────────────────────────────────────────────────────────────
// Server-Side Authentication & Session Controller for Financial Tools Suite
// Isolated & Password Protected via Environment Configuration
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.FINANCIAL_TOOLS_SESSION_SECRET || process.env.CALCULATOR_SESSION_SECRET || 'avani_default_calc_sec_key_2026_983742';
const COOKIE_NAME = 'avani_calc_session';
const SESSION_DURATION_HOURS = 8;

// Rate limiting: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * In-memory audit log buffer for security events (sanitized, zero passwords)
 */
const auditLogs = [];

function recordSecurityAudit(event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ip: details.ip || 'internal',
    status: details.status || 'SUCCESS',
    userScope: 'calculator_suite'
  };
  auditLogs.push(entry);
  if (auditLogs.length > 500) auditLogs.shift();
  console.log(`[FinancialToolsAudit] ${entry.event} - Status: ${entry.status}`);
}

/**
 * Helper to extract a cookie from req.headers.cookie
 */
function getCookie(req, name) {
  const cookieHeader = req.headers && req.headers.cookie;
  if (!cookieHeader) return null;
  const matches = cookieHeader.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Helper to verify JWT token from cookie or Authorization header
 */
function verifySessionToken(req) {
  let token = getCookie(req, COOKIE_NAME);
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && (decoded.scope === 'calculator_suite' || decoded.scope === 'financial_tools')) {
      return decoded;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * POST /api/calculator-auth/login
 * Validates password server-side and issues HttpOnly session cookie
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body || {};
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const expectedPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.FINANCIAL_TOOLS_PASSWORD || process.env.CALCULATOR_ACCESS_PASSWORD || 'Samarth@1356';
  const passwordHash = process.env.FINANCIAL_TOOLS_PASSWORD_HASH;

  if (!password || typeof password !== 'string') {
    recordSecurityAudit('LOGIN_FAILED_EMPTY_INPUT', { ip: clientIp, status: 'REJECTED' });
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  let isValid = false;
  try {
    if (passwordHash && passwordHash.startsWith('$2')) {
      isValid = await bcrypt.compare(password, passwordHash);
    } else {
      isValid = (password === expectedPassword);
    }
  } catch {
    isValid = (password === expectedPassword);
  }

  if (!isValid) {
    recordSecurityAudit('LOGIN_FAILED_INVALID_CREDENTIAL', { ip: clientIp, status: 'UNAUTHORIZED' });
    return res.status(401).json({ success: false, message: 'Invalid access password.' });
  }

  const token = jwt.sign(
    {
      scope: 'calculator_suite',
      issuedAt: Date.now()
    },
    JWT_SECRET,
    { expiresIn: `${SESSION_DURATION_HOURS}h` }
  );

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const cookieOptions = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_DURATION_HOURS * 3600}`
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  recordSecurityAudit('LOGIN_SUCCESS', { ip: clientIp, status: 'GRANTED' });
  res.setHeader('Set-Cookie', cookieOptions.join('; '));
  return res.json({
    success: true,
    message: 'Access authorized'
  });
});

/**
 * GET /api/calculator-auth/verify
 * Checks if current request has an active, valid server session
 */
router.get('/verify', (req, res) => {
  const session = verifySessionToken(req);
  if (session) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

/**
 * GET /api/calculator-auth/audit
 * Returns recent sanitized security events (for authenticated admin view)
 */
router.get('/audit', (req, res) => {
  const session = verifySessionToken(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  return res.json({ success: true, logs: auditLogs.slice(-50) });
});

/**
 * POST /api/calculator-auth/logout
 * Clears HttpOnly session cookie
 */
router.post('/logout', (req, res) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const cookieOptions = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  recordSecurityAudit('LOGOUT', { ip: clientIp, status: 'REVOKED' });
  res.setHeader('Set-Cookie', cookieOptions.join('; '));
  return res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
module.exports.router = router;
module.exports.verifySessionToken = verifySessionToken;
