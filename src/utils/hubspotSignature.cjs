// src/utils/hubspotSignature.cjs
// ─────────────────────────────────────────────────────────────────
// HubSpot Webhook Signature Version 3 Verifier & Replay Protector
// AVANI LOAN SERVICES — PRODUCTION CRM ARCHITECTURE
// ─────────────────────────────────────────────────────────────────
// Specification:
// source_string = HTTP_METHOD + REQUEST_URI + REQUEST_BODY + TIMESTAMP
// algorithm: HMAC-SHA256 with HUBSPOT_CLIENT_SECRET, Base64-encoded
// comparison: crypto.timingSafeEqual (constant time)
// timestamp: X-HubSpot-Request-Timestamp within 5-minute replay window
// ─────────────────────────────────────────────────────────────────

const crypto = require('crypto');

// 5 minutes permitted replay window (300,000 milliseconds)
const HUBSPOT_MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

/**
 * Computes HubSpot Signature Version 3 for a given source string
 * source = method + uri + rawBody + timestamp
 * HMAC-SHA256 with clientSecret, Base64 encoded
 *
 * @param {string} method - Uppercase HTTP method (e.g., 'POST')
 * @param {string} uri - Full request URI
 * @param {string} rawBody - Raw request body string
 * @param {string|number} timestamp - X-HubSpot-Request-Timestamp header value
 * @param {string} clientSecret - HubSpot App Client Secret
 * @returns {string} Base64-encoded HMAC-SHA256 signature
 */
function computeHubspotSignatureV3(method, uri, rawBody, timestamp, clientSecret) {
  if (!clientSecret) {
    throw new Error('Missing client secret for signature calculation');
  }
  const source = `${(method || 'POST').toUpperCase()}${uri || ''}${rawBody || ''}${timestamp || ''}`;
  return crypto
    .createHmac('sha256', clientSecret)
    .update(source, 'utf8')
    .digest('base64');
}

/**
 * Constant-time signature comparison using crypto.timingSafeEqual
 * Protects against timing attacks
 *
 * @param {string} sigA - Received signature
 * @param {string} sigB - Computed signature
 * @returns {boolean} True if signatures match identically
 */
function safeCompareSignatures(sigA, sigB) {
  if (typeof sigA !== 'string' || typeof sigB !== 'string') {
    return false;
  }
  const bufA = Buffer.from(sigA, 'utf8');
  const bufB = Buffer.from(sigB, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates timestamp freshness against replay attacks
 * Permitted window: +/- 5 minutes (HUBSPOT_MAX_TIMESTAMP_AGE_MS)
 *
 * @param {string|number} timestampHeader - X-HubSpot-Request-Timestamp header
 * @param {number} [maxAgeMs=HUBSPOT_MAX_TIMESTAMP_AGE_MS] - Maximum allowed drift
 * @returns {{ valid: boolean, code?: string, error?: string, timestamp?: number }}
 */
function validateTimestamp(timestampHeader, maxAgeMs = HUBSPOT_MAX_TIMESTAMP_AGE_MS) {
  if (!timestampHeader && timestampHeader !== 0) {
    return {
      valid: false,
      code: 'MISSING_TIMESTAMP',
      error: 'Missing X-HubSpot-Request-Timestamp header'
    };
  }

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp) || isNaN(timestamp) || timestamp <= 0) {
    return {
      valid: false,
      code: 'INVALID_TIMESTAMP_FORMAT',
      error: 'Invalid X-HubSpot-Request-Timestamp format'
    };
  }

  const now = Date.now();
  const drift = Math.abs(now - timestamp);

  if (drift > maxAgeMs) {
    return {
      valid: false,
      code: 'TIMESTAMP_EXPIRED',
      error: `Request timestamp drift (${drift}ms) exceeds maximum replay window (${maxAgeMs}ms)`
    };
  }

  return { valid: true, timestamp };
}

// Approved host allowlist for HubSpot Signature V3 verification
const ALLOWED_HOSTS = new Set([
  'www.avanifinserv.com',
  'avanifinserv.com',
  'localhost',
  '127.0.0.1'
]);

const CANONICAL_HOST = 'www.avanifinserv.com';
const CANONICAL_SCHEME = 'https';
const CANONICAL_WEBHOOK_PATH = '/api/crm/hubspot/webhook';

/**
 * Extracts and sanitizes hostname and port from a host string.
 * Handles comma-separated forwarded headers and ports.
 *
 * @param {string} rawHost - Raw host string from header
 * @returns {{ hostname: string, port: string, hostWithPort: string } | null}
 */
function parseHostHeader(rawHost) {
  if (!rawHost || typeof rawHost !== 'string') return null;
  const first = rawHost.split(',')[0].trim();
  if (!first) return null;

  try {
    const parsed = new URL(`http://${first}`);
    return {
      hostname: parsed.hostname.toLowerCase(),
      port: parsed.port,
      hostWithPort: parsed.port ? `${parsed.hostname.toLowerCase()}:${parsed.port}` : parsed.hostname.toLowerCase()
    };
  } catch (_) {
    return null;
  }
}

/**
 * Deterministic request URI constructor with strict host allowlist validation.
 * Rejects arbitrary caller-controlled hostnames from x-hubspot-request-url,
 * x-forwarded-host, and host headers, resolving exclusively to approved hosts
 * or the canonical production host (www.avanifinserv.com).
 *
 * @param {object} req - Express request object
 * @param {object} [options] - Optional overrides for testing
 * @returns {string} Hardened deterministic request URI
 */
function buildDeterministicRequestUri(req, options = {}) {
  if (options.uri) {
    return options.uri;
  }

  // 1. Preserve exact request path and query-string semantics
  let requestPath = req.originalUrl || req.url || CANONICAL_WEBHOOK_PATH;

  // 2. Resolve candidate host with strict allowlist enforcement
  let candidateHost = null;
  let candidateProto = null;

  // Priority a: x-hubspot-request-url header (only if host is in ALLOWED_HOSTS)
  if (req.headers && req.headers['x-hubspot-request-url']) {
    try {
      const parsedUrl = new URL(req.headers['x-hubspot-request-url']);
      const hostname = parsedUrl.hostname.toLowerCase();
      if (ALLOWED_HOSTS.has(hostname)) {
        candidateHost = parsedUrl.port ? `${hostname}:${parsedUrl.port}` : hostname;
        candidateProto = parsedUrl.protocol.replace(':', '');
        if (parsedUrl.pathname) {
          requestPath = `${parsedUrl.pathname}${parsedUrl.search || ''}`;
        }
      }
    } catch (_) {
      // Malformed URL in header - ignore and fallback to validated proxy/host headers
    }
  }

  // Priority b: x-forwarded-host header (only if host is in ALLOWED_HOSTS)
  if (!candidateHost && req.headers && req.headers['x-forwarded-host']) {
    const parsed = parseHostHeader(req.headers['x-forwarded-host']);
    if (parsed && ALLOWED_HOSTS.has(parsed.hostname)) {
      candidateHost = parsed.hostWithPort;
    }
  }

  // Priority c: standard host header (only if host is in ALLOWED_HOSTS)
  if (!candidateHost) {
    const rawHost = (req.get && typeof req.get === 'function') ? req.get('host') : (req.headers && req.headers.host);
    const parsed = parseHostHeader(rawHost);
    if (parsed && ALLOWED_HOSTS.has(parsed.hostname)) {
      candidateHost = parsed.hostWithPort;
    }
  }

  // Fallback: If no approved host was found, enforce canonical production host
  const finalHost = candidateHost || CANONICAL_HOST;

  // 3. Resolve deterministic scheme
  // Production hosts strictly use https; local development/test hosts allow http
  let finalScheme = CANONICAL_SCHEME;
  const baseHostname = finalHost.split(':')[0].toLowerCase();
  if (baseHostname === 'localhost' || baseHostname === '127.0.0.1') {
    finalScheme = candidateProto ||
      (req.headers && req.headers['x-forwarded-proto']) ||
      req.protocol ||
      'http';
  }

  return `${finalScheme}://${finalHost}${requestPath}`;
}

/**
 * Full HubSpot Webhook Signature V3 Verification
 * Validates method, deterministic URI, raw body, timestamp, and HMAC-SHA256 signature
 *
 * @param {object} req - Express request object
 * @param {object} [options] - Optional overrides for testing
 * @param {string} [options.clientSecret] - Explicit secret override
 * @param {number} [options.maxAgeMs] - Explicit max age override
 * @param {string} [options.uri] - Explicit URI override
 * @returns {{ success: boolean, status?: number, code?: string, error?: string }}
 */
function verifyHubSpotWebhookRequest(req, options = {}) {
  const clientSecret = options.clientSecret || process.env.HUBSPOT_CLIENT_SECRET;
  if (!clientSecret) {
    return {
      success: false,
      status: 401,
      code: 'SECRET_MISSING',
      error: 'HubSpot client secret is not configured'
    };
  }

  const signature = req.headers ? req.headers['x-hubspot-signature-v3'] : null;
  if (!signature) {
    return {
      success: false,
      status: 401,
      code: 'MISSING_SIGNATURE',
      error: 'Missing X-HubSpot-Signature-v3 header'
    };
  }

  const timestampHeader = req.headers ? req.headers['x-hubspot-request-timestamp'] : null;
  const tsValidation = validateTimestamp(timestampHeader, options.maxAgeMs);
  if (!tsValidation.valid) {
    return {
      success: false,
      status: 400,
      code: tsValidation.code,
      error: tsValidation.error
    };
  }

  const method = (req.method || 'POST').toUpperCase();

  // Extract raw request body safely
  let rawBody = '';
  if (req.rawBody) {
    rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : String(req.rawBody);
  } else if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (req.body && Object.keys(req.body).length > 0) {
    rawBody = JSON.stringify(req.body);
  }

  // Construct single deterministic URI with strict host allowlist validation
  const deterministicUri = buildDeterministicRequestUri(req, options);

  // Constant-time signature comparison using the deterministic URI
  let matched = false;
  try {
    const computed = computeHubspotSignatureV3(method, deterministicUri, rawBody, String(timestampHeader), clientSecret);
    if (safeCompareSignatures(signature, computed)) {
      matched = true;
    } else {
      // Per HubSpot V3 specification: If query string contains URL-encoded characters,
      // HubSpot may have signed the decoded URI variant.
      try {
        const decodedUri = decodeURI(deterministicUri);
        if (decodedUri !== deterministicUri) {
          const computedDecoded = computeHubspotSignatureV3(method, decodedUri, rawBody, String(timestampHeader), clientSecret);
          if (safeCompareSignatures(signature, computedDecoded)) {
            matched = true;
          }
        }
      } catch (_) {}
    }
  } catch (_) {}

  if (!matched) {
    return {
      success: false,
      status: 401,
      code: 'INVALID_SIGNATURE',
      error: 'HubSpot Signature V3 validation failed'
    };
  }

  return { success: true };
}

module.exports = {
  ALLOWED_HOSTS,
  CANONICAL_HOST,
  CANONICAL_SCHEME,
  CANONICAL_WEBHOOK_PATH,
  HUBSPOT_MAX_TIMESTAMP_AGE_MS,
  computeHubspotSignatureV3,
  safeCompareSignatures,
  validateTimestamp,
  buildDeterministicRequestUri,
  verifyHubSpotWebhookRequest
};
