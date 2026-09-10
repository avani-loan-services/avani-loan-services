// scripts/test_oauth_persistence_remediation.cjs
// ─────────────────────────────────────────────────────────────────
// Comprehensive Test Suite for HubSpot OAuth Persistence Remediation
// Tests A, B, and C
// ─────────────────────────────────────────────────────────────────

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING OAUTH PERSISTENCE REMEDIATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // ─────────────────────────────────────────────────────────────────
  // TEST A: OAuth callback static and runtime no-filesystem-persistence
  // ─────────────────────────────────────────────────────────────────
  console.log('--- Test A: OAuth Callback Static & Runtime Filesystem Invariance ---');
  try {
    const authCjsPath = path.resolve(__dirname, '../src/routes/auth.cjs');
    const authCode = fs.readFileSync(authCjsPath, 'utf8');

    assert(!authCode.includes('fs.writeFileSync'), 'Code must not contain fs.writeFileSync');
    assert(!authCode.includes('fs.readFileSync'), 'Code must not contain fs.readFileSync');
    assert(!authCode.includes("require('fs')"), 'Code must not import fs');
    assert(!authCode.includes("require('path')"), 'Code must not import path');

    // Runtime test: mock axios.post and simulate handler invocation
    const originalAxiosPost = axios.post;
    const testSecretRefresh = 'test_sample_refresh_token_xyz987';
    const testSecretAccess = 'test_sample_access_token_abc123';

    axios.post = async function(url, data, config) {
      if (url === 'https://api.hubapi.com/oauth/v1/token') {
        return {
          data: {
            refresh_token: testSecretRefresh,
            access_token: testSecretAccess,
            expires_in: 1800
          }
        };
      }
      return originalAxiosPost(url, data, config);
    };

    // Track fs writes globally
    let attemptedFsWrite = false;
    const origWriteFileSync = fs.writeFileSync;
    fs.writeFileSync = function(...args) {
      attemptedFsWrite = true;
      return origWriteFileSync.apply(fs, args);
    };

    const authRouter = require('../src/routes/auth.cjs');
    // Find the GET /hubspot/callback handler
    const layer = authRouter.stack.find(s => s.route && s.route.path === '/hubspot/callback');
    assert(layer, 'GET /hubspot/callback route must be registered');

    const handler = layer.route.stack[0].handle;

    let responseStatus = null;
    let responseBody = null;
    const req = { query: { code: 'test_auth_code_12345' } };
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      send(body) {
        responseBody = body;
        return this;
      }
    };

    await handler(req, res);

    // Restore fs and axios
    fs.writeFileSync = origWriteFileSync;
    axios.post = originalAxiosPost;

    assert.strictEqual(attemptedFsWrite, false, 'fs.writeFileSync must never be called during callback');
    assert.strictEqual(responseStatus, 200, 'Callback must return HTTP 200 on valid code');
    assert(typeof responseBody === 'string', 'Response body must be a sanitized string');

    console.log('✅ Test A Passed: Zero filesystem persistence detected in static code and runtime execution.');
    passed++;
  } catch (err) {
    console.error('❌ Test A Failed:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────
  // TEST B: No Token Leakage in Response, URLs, or Logs
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Test B: No Token Leakage ---');
  try {
    const originalAxiosPost = axios.post;
    const testSecretRefresh = 'canary_leak_token_refresh_9999';
    const testSecretAccess = 'canary_leak_token_access_8888';

    axios.post = async function(url, data, config) {
      return {
        data: {
          refresh_token: testSecretRefresh,
          access_token: testSecretAccess,
          expires_in: 1800
        }
      };
    };

    let loggedOutput = '';
    const origConsoleLog = console.log;
    const origConsoleError = console.error;
    console.log = (...args) => { loggedOutput += args.join(' ') + '\n'; origConsoleLog(...args); };
    console.error = (...args) => { loggedOutput += args.join(' ') + '\n'; origConsoleError(...args); };

    const authRouter = require('../src/routes/auth.cjs');
    const layer = authRouter.stack.find(s => s.route && s.route.path === '/hubspot/callback');
    const handler = layer.route.stack[0].handle;

    let responseBody = '';
    const req = { query: { code: 'canary_code_test' } };
    const res = {
      status() { return this; },
      send(body) { responseBody = body; return this; }
    };

    await handler(req, res);

    // Restore
    console.log = origConsoleLog;
    console.error = origConsoleError;
    axios.post = originalAxiosPost;

    assert(!responseBody.includes(testSecretRefresh), 'Refresh token must NOT appear in response body');
    assert(!responseBody.includes(testSecretAccess), 'Access token must NOT appear in response body');
    assert(!loggedOutput.includes(testSecretRefresh), 'Refresh token must NOT appear in console output/logs');
    assert(!loggedOutput.includes(testSecretAccess), 'Access token must NOT appear in console output/logs');

    console.log('✅ Test B Passed: Zero credential leakage in response body or application logs.');
    passed++;
  } catch (err) {
    console.error('❌ Test B Failed:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────
  // TEST C: CRM Client process.env.HUBSPOT_REFRESH_TOKEN Compatibility
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- Test C: CRM Client Environment Compatibility ---');
  try {
    const hubSpotUtilPath = path.resolve(__dirname, '../src/utils/hubSpot.cjs');
    const hubSpotCode = fs.readFileSync(hubSpotUtilPath, 'utf8');

    assert(hubSpotCode.includes('process.env.HUBSPOT_REFRESH_TOKEN'), 'CRM client must consume process.env.HUBSPOT_REFRESH_TOKEN');
    assert(hubSpotCode.includes('grant_type'), 'CRM client must support grant_type');
    assert(hubSpotCode.includes('refresh_token'), 'CRM client must support refresh_token param');

    // Test 1: Placeholder rejection test
    const oldToken = process.env.HUBSPOT_REFRESH_TOKEN;
    process.env.HUBSPOT_REFRESH_TOKEN = 'na2-99de-b4d2-4640-af6a-1b35de1eec48';
    delete require.cache[require.resolve('../src/utils/hubSpot.cjs')];
    const hubSpotModule = require('../src/utils/hubSpot.cjs');

    let placeholderRejected = false;
    let loggedError = '';
    const origErr = console.error;
    console.error = (...args) => { loggedError += args.join(' '); };

    await hubSpotModule.syncToHubSpot({ name: 'Test Lead', email: 'test@example.com' });
    console.error = origErr;

    if (loggedError.includes('HubSpot refresh token is a placeholder') || loggedError.includes('Please complete OAuth')) {
      placeholderRejected = true;
    }
    assert(placeholderRejected, 'Placeholder refresh token must be rejected');

    // Test 2: In serverless environment (simulating fs.existsSync returning false for ../../.env)
    // Verify that getAccessToken uses process.env.HUBSPOT_REFRESH_TOKEN
    process.env.HUBSPOT_REFRESH_TOKEN = 'valid_synthetic_refresh_token_test';
    process.env.HUBSPOT_CLIENT_ID = 'test_client_id';
    process.env.HUBSPOT_CLIENT_SECRET = 'test_client_secret';

    const origExistsSync = fs.existsSync;
    fs.existsSync = function(p) {
      if (typeof p === 'string' && p.endsWith('.env')) {
        return false; // simulate serverless runtime where .env file is absent
      }
      return origExistsSync.apply(fs, arguments);
    };

    let capturedPostParams = null;
    let capturedAuthHeader = null;
    const originalAxiosPost = axios.post;
    axios.post = async function(url, body, config) {
      if (url === 'https://api.hubapi.com/oauth/v1/token') {
        capturedPostParams = config?.params;
        return {
          data: {
            access_token: 'test_access_token_123',
            expires_in: 1800
          }
        };
      }
      if (url === 'https://api.hubapi.com/crm/v3/objects/contacts') {
        capturedAuthHeader = config?.headers?.Authorization;
        return { data: { id: 'mock_contact_id_999' } };
      }
      return originalAxiosPost(url, body, config);
    };

    delete require.cache[require.resolve('../src/utils/hubSpot.cjs')];
    const hubSpotModule2 = require('../src/utils/hubSpot.cjs');
    await hubSpotModule2.syncToHubSpot({ name: 'Synthetic Test', email: 'synth@avanifinserv.com' });

    // Restore
    fs.existsSync = origExistsSync;
    axios.post = originalAxiosPost;
    process.env.HUBSPOT_REFRESH_TOKEN = oldToken;

    assert(capturedPostParams, 'CRM client must trigger OAuth token refresh');
    assert.strictEqual(capturedPostParams.grant_type, 'refresh_token');
    assert.strictEqual(capturedPostParams.refresh_token, 'valid_synthetic_refresh_token_test');
    assert.strictEqual(capturedPostParams.client_id, 'test_client_id');
    assert.strictEqual(capturedPostParams.client_secret, 'test_client_secret');
    assert.strictEqual(capturedAuthHeader, 'Bearer test_access_token_123', 'CRM client must use refreshed bearer token');

    console.log('✅ Test C Passed: CRM client successfully operates with process.env.HUBSPOT_REFRESH_TOKEN and constructs token refresh without modifying CRM.');
    passed++;
  } catch (err) {
    console.error('❌ Test C Failed:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
