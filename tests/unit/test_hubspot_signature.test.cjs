// tests/unit/test_hubspot_signature.test.cjs
// ─────────────────────────────────────────────────────────────────
// Unit Test Suite: HubSpot Webhook Signature V3 & Replay Protection
// Safe in-memory execution (No localhost server, No ports opened)
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const {
  HUBSPOT_MAX_TIMESTAMP_AGE_MS,
  computeHubspotSignatureV3,
  safeCompareSignatures,
  validateTimestamp,
  verifyHubSpotWebhookRequest
} = require('../../src/utils/hubspotSignature.cjs');

console.log('🧪 RUNNING UNIT TESTS: HubSpot Signature V3 & Replay Protection');

const TEST_SECRET = 'avani_test_secret_for_unit_tests_2026';
const TEST_URI = 'https://www.avanifinserv.com/api/crm/hubspot/webhook';
const TEST_PAYLOAD = JSON.stringify([{
  eventId: 123456,
  subscriptionType: 'contact.creation',
  portalId: 244236573,
  objectId: 998877
}]);

// 1. Signature calculation
const ts = Date.now().toString();
const sig = computeHubspotSignatureV3('POST', TEST_URI, TEST_PAYLOAD, ts, TEST_SECRET);
assert.strictEqual(typeof sig, 'string');
assert.ok(sig.length > 20, 'Signature should be non-empty base64 string');
console.log('  ✅ computeHubspotSignatureV3 produces valid base64 signature: PASS');

// 2. Safe compare
assert.strictEqual(safeCompareSignatures(sig, sig), true);
assert.strictEqual(safeCompareSignatures(sig, 'different_signature_of_differing_length'), false);
assert.strictEqual(safeCompareSignatures(sig, sig.slice(0, -1) + 'X'), false);
assert.strictEqual(safeCompareSignatures(null, sig), false);
console.log('  ✅ safeCompareSignatures constant-time equality check: PASS');

// 3. Timestamp validation
const freshTs = Date.now() - 2000;
const freshRes = validateTimestamp(freshTs);
assert.strictEqual(freshRes.valid, true);

const staleTs = Date.now() - (HUBSPOT_MAX_TIMESTAMP_AGE_MS + 10000);
const staleRes = validateTimestamp(staleTs);
assert.strictEqual(staleRes.valid, false);
assert.strictEqual(staleRes.code, 'TIMESTAMP_EXPIRED');

const invalidTs = validateTimestamp('invalid-date-string');
assert.strictEqual(invalidTs.valid, false);
assert.strictEqual(invalidTs.code, 'INVALID_TIMESTAMP_FORMAT');
console.log('  ✅ validateTimestamp fresh, stale, and invalid format handling: PASS');

// 4. Request verification - Success case
const validReq = {
  method: 'POST',
  headers: {
    'x-hubspot-signature-v3': sig,
    'x-hubspot-request-timestamp': ts,
    'x-hubspot-request-url': TEST_URI
  },
  body: TEST_PAYLOAD,
  rawBody: TEST_PAYLOAD,
  originalUrl: '/api/crm/hubspot/webhook'
};
const verifySuccess = verifyHubSpotWebhookRequest(validReq, { clientSecret: TEST_SECRET, uri: TEST_URI });
assert.strictEqual(verifySuccess.success, true);
console.log('  ✅ verifyHubSpotWebhookRequest valid payload & signature: PASS');

// 5. Request verification - Missing signature
const noSigReq = {
  method: 'POST',
  headers: {
    'x-hubspot-request-timestamp': ts
  },
  body: TEST_PAYLOAD
};
const verifyNoSig = verifyHubSpotWebhookRequest(noSigReq, { clientSecret: TEST_SECRET });
assert.strictEqual(verifyNoSig.success, false);
assert.strictEqual(verifyNoSig.code, 'MISSING_SIGNATURE');
console.log('  ✅ verifyHubSpotWebhookRequest missing signature rejected: PASS');

// 6. Request verification - Tampered signature
const badSigReq = {
  method: 'POST',
  headers: {
    'x-hubspot-signature-v3': 'tampered_bad_signature_base64==',
    'x-hubspot-request-timestamp': ts
  },
  body: TEST_PAYLOAD,
  rawBody: TEST_PAYLOAD,
  originalUrl: '/api/crm/hubspot/webhook'
};
const verifyBadSig = verifyHubSpotWebhookRequest(badSigReq, { clientSecret: TEST_SECRET, uri: TEST_URI });
assert.strictEqual(verifyBadSig.success, false);
assert.strictEqual(verifyBadSig.code, 'INVALID_SIGNATURE');
console.log('  ✅ verifyHubSpotWebhookRequest tampered signature rejected: PASS');

// 7. Request verification - Expired timestamp
const expiredReq = {
  method: 'POST',
  headers: {
    'x-hubspot-signature-v3': sig,
    'x-hubspot-request-timestamp': staleTs.toString()
  },
  body: TEST_PAYLOAD
};
const verifyExpired = verifyHubSpotWebhookRequest(expiredReq, { clientSecret: TEST_SECRET });
assert.strictEqual(verifyExpired.success, false);
assert.strictEqual(verifyExpired.code, 'TIMESTAMP_EXPIRED');
console.log('  ✅ verifyHubSpotWebhookRequest expired timestamp rejected: PASS');

console.log('🎉 ALL UNIT TESTS FOR hubspotSignature PASSED SUCCESSFULLY!\n');
process.exit(0);
