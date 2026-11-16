// src/services/serviceAuthGuard.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI ECOSYSTEM — Service-to-Service (S2S) Security & Auth Guard
// Supports short-lived HS256 JWTs (iss/aud/sub/iat/exp/jti/kid), HMAC-SHA256
// request signatures, timestamp skew protection, JTI replay prevention,
// least-privilege service identities, and per-service rate limiting.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const crypto = require('crypto');

const ALLOWED_SERVICE_IDS = Object.freeze([
  'svc-loan-api',
  'svc-ai-crm',
  'svc-loan-agents',
  'svc-ai-calling'
]);

const DEFAULT_TTL_SECONDS = 300; // 5-minute short-lived S2S token
const MAX_CLOCK_SKEW_SECONDS = 300;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.S2S_RATE_LIMIT_PER_MIN || 300);

const replayCache = new Map();
const rateLimitCounters = new Map();

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(str) {
  const padded = String(str).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(str).length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

function timingSafeHexEqual(a, b) {
  try {
    const ba = Buffer.from(String(a || ''), 'utf8');
    const bb = Buffer.from(String(b || ''), 'utf8');
    if (ba.length !== bb.length || ba.length === 0) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function getKeyRing(overrideSecret = null) {
  const keys = {};
  if (process.env.ECOSYSTEM_SERVICE_SECRETS_JSON) {
    try {
      const parsed = JSON.parse(process.env.ECOSYSTEM_SERVICE_SECRETS_JSON);
      if (parsed && typeof parsed === 'object') {
        Object.assign(keys, parsed);
      }
    } catch {}
  }
  const activeKid = process.env.ECOSYSTEM_KEY_ID || 'v1-2026-11';
  const primary = overrideSecret || process.env.ECOSYSTEM_SERVICE_SECRET || process.env.INTERNAL_WORKER_SECRET || process.env.CALCULATOR_SESSION_SECRET || '';
  if (primary && !keys[activeKid]) {
    keys[activeKid] = primary;
  }
  return { activeKid, keys };
}

function signServiceToken({
  issuer,
  audience,
  subject = issuer,
  scopes = ['ecosystem:sync'],
  ttlSeconds = DEFAULT_TTL_SECONDS,
  secret = null,
  kid = null
} = {}) {
  if (!ALLOWED_SERVICE_IDS.includes(issuer)) {
    throw new Error(`Unauthorized S2S issuer identity: ${issuer}`);
  }
  if (!ALLOWED_SERVICE_IDS.includes(audience)) {
    throw new Error(`Unauthorized S2S audience identity: ${audience}`);
  }
  const ring = getKeyRing(secret);
  const keyId = kid || ring.activeKid;
  const signingKey = secret || ring.keys[keyId];
  if (!signingKey || signingKey.length < 16) {
    throw new Error('ECOSYSTEM_SERVICE_SECRET (min 16 chars) is required for S2S token signing');
  }

  const now = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID();
  const header = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const payload = {
    iss: issuer,
    aud: audience,
    sub: subject,
    iat: now,
    exp: now + Math.min(ttlSeconds, 900),
    jti,
    scopes
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const sig = crypto.createHmac('sha256', signingKey).update(signingInput).digest();
  const token = `${signingInput}.${base64UrlEncode(sig)}`;
  return { token, jti, kid: keyId, exp: payload.exp };
}

function computeRequestHmac(secret, timestamp, bodyString) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${bodyString}`)
    .digest('hex');
}

function buildSignedServiceHeaders({
  issuer,
  audience,
  body = {},
  correlationId = null,
  idempotencyKey = null,
  secret = null
} = {}) {
  const ring = getKeyRing(secret);
  const signingKey = secret || ring.keys[ring.activeKid];
  const { token, jti, kid } = signServiceToken({ issuer, audience, secret: signingKey });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const serializedBody = typeof body === 'string' ? body : JSON.stringify(body || {});
  const signature = computeRequestHmac(signingKey, timestamp, serializedBody);

  return {
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Auth': `Bearer ${token}`,
      'X-Service-Id': issuer,
      'X-Service-Timestamp': timestamp,
      'X-Service-Signature': signature,
      'X-Key-Id': kid,
      'X-Correlation-Id': correlationId || `CORR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {})
    },
    jti,
    serializedBody
  };
}

function checkRateLimit(serviceId) {
  const now = Date.now();
  const rec = rateLimitCounters.get(serviceId) || { windowStart: now, count: 0 };
  if (now - rec.windowStart > RATE_WINDOW_MS) {
    rec.windowStart = now;
    rec.count = 0;
  }
  rec.count += 1;
  rateLimitCounters.set(serviceId, rec);
  return rec.count <= MAX_REQUESTS_PER_WINDOW;
}

function pruneReplayCache(nowSec) {
  for (const [k, exp] of replayCache.entries()) {
    if (exp <= nowSec) replayCache.delete(k);
  }
}

function verifyServiceTokenAndRequest({
  authHeader,
  serviceIdHeader,
  timestampHeader,
  signatureHeader,
  rawBody = '',
  expectedAudience,
  secret = null,
  enforceReplay = true
}) {
  const rawToken = String(authHeader || '').replace(/^Bearer\s+/i, '').trim();
  if (!rawToken) {
    return { ok: false, status: 401, code: 'MISSING_S2S_TOKEN', error: 'Missing X-Service-Auth Bearer token' };
  }

  const parts = rawToken.split('.');
  if (parts.length !== 3) {
    return { ok: false, status: 401, code: 'MALFORMED_S2S_TOKEN', error: 'Malformed S2S JWT' };
  }

  let header;
  let claims;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]).toString('utf8'));
    claims = JSON.parse(base64UrlDecode(parts[1]).toString('utf8'));
  } catch {
    return { ok: false, status: 401, code: 'INVALID_S2S_TOKEN', error: 'Unable to parse S2S JWT' };
  }

  if (header.alg !== 'HS256') {
    return { ok: false, status: 401, code: 'UNSUPPORTED_ALG', error: 'Only HS256 S2S tokens are permitted' };
  }

  const ring = getKeyRing(secret);
  const signingKey = secret || (header.kid && ring.keys[header.kid]) || ring.keys[ring.activeKid];
  if (!signingKey) {
    return { ok: false, status: 401, code: 'UNKNOWN_KEY_ID', error: 'Signing key not configured for key ID' };
  }

  const expectedSig = base64UrlEncode(
    crypto.createHmac('sha256', signingKey).update(`${parts[0]}.${parts[1]}`).digest()
  );
  if (!timingSafeHexEqual(parts[2], expectedSig)) {
    return { ok: false, status: 401, code: 'INVALID_S2S_SIGNATURE', error: 'S2S JWT signature verification failed' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!claims.exp || claims.exp < nowSec) {
    return { ok: false, status: 401, code: 'EXPIRED_S2S_TOKEN', error: 'S2S JWT has expired' };
  }
  if (!ALLOWED_SERVICE_IDS.includes(claims.iss)) {
    return { ok: false, status: 403, code: 'FORBIDDEN_ISSUER', error: `Issuer ${claims.iss} is not allowed` };
  }
  if (serviceIdHeader && serviceIdHeader !== claims.iss) {
    return { ok: false, status: 403, code: 'SERVICE_ID_MISMATCH', error: 'X-Service-Id does not match JWT issuer' };
  }
  if (expectedAudience && claims.aud !== expectedAudience) {
    return { ok: false, status: 403, code: 'INVALID_AUDIENCE', error: `Expected audience ${expectedAudience}, received ${claims.aud}` };
  }

  // Verify timestamp skew & body HMAC signature when signature header is sent (required for POST/PUT/PATCH)
  if (!timestampHeader || !signatureHeader) {
    return { ok: false, status: 401, code: 'MISSING_HMAC_SIGNATURE', error: 'X-Service-Timestamp and X-Service-Signature are required' };
  }
  const tsNum = Number(timestampHeader);
  if (!Number.isFinite(tsNum) || Math.abs(nowSec - tsNum) > MAX_CLOCK_SKEW_SECONDS) {
    return { ok: false, status: 409, code: 'STALE_TIMESTAMP', error: 'Request timestamp outside allowed skew window' };
  }

  const expectedBodyHmac = computeRequestHmac(signingKey, String(timestampHeader), rawBody);
  if (!timingSafeHexEqual(String(signatureHeader).toLowerCase(), expectedBodyHmac.toLowerCase())) {
    return { ok: false, status: 401, code: 'BODY_HMAC_MISMATCH', error: 'Request HMAC signature mismatch' };
  }

  if (enforceReplay) {
    pruneReplayCache(nowSec);
    if (!claims.jti || replayCache.has(claims.jti)) {
      return { ok: false, status: 409, code: 'REPLAY_DETECTED', error: 'S2S JWT jti replay rejected' };
    }
    replayCache.set(claims.jti, claims.exp);
  }

  if (!checkRateLimit(claims.iss)) {
    return { ok: false, status: 429, code: 'S2S_RATE_LIMIT', error: 'Service request rate limit exceeded' };
  }

  return {
    ok: true,
    claims,
    serviceId: claims.iss,
    keyId: header.kid
  };
}

function sanitizePayloadForAudit(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = JSON.parse(JSON.stringify(payload));
  const redactKeys = ['password', 'token', 'secret', 'apikey', 'api_key', 'pan', 'aadhaar', 'otp'];
  const walk = obj => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      if (redactKeys.some(rk => k.toLowerCase().includes(rk))) {
        obj[k] = '[REDACTED]';
      } else if (k.toLowerCase().includes('phone') && typeof obj[k] === 'string' && obj[k].length >= 6) {
        const s = obj[k];
        obj[k] = `${s.slice(0, 4)}****${s.slice(-2)}`;
      } else if (typeof obj[k] === 'object') {
        walk(obj[k]);
      }
    }
  };
  walk(clone);
  return clone;
}

module.exports = {
  ALLOWED_SERVICE_IDS,
  signServiceToken,
  buildSignedServiceHeaders,
  verifyServiceTokenAndRequest,
  computeRequestHmac,
  sanitizePayloadForAudit
};
