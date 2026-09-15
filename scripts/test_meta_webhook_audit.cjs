// scripts/test_meta_webhook_audit.cjs
const express = require('express');
const metaRouter = require('../src/routes/metaWebhooks.cjs');
const http = require('http');
const axios = require('axios');
require('dotenv').config();

async function testMetaWebhook() {
  console.log('====================================================');
  console.log('🔍 META LEAD ADS WEBHOOK AUDIT');
  console.log('====================================================');

  const app = express();
  app.use(express.json());
  app.use('/api/meta', metaRouter);

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/meta/webhook`;

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'AVANI_META_VERIFY_TOKEN_2026';
  console.log('Configured Verify Token exists:', !!verifyToken);

  let allPassed = true;

  // 1. Valid GET challenge
  try {
    const res = await axios.get(baseUrl, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': 'synthetic_challenge_998877'
      }
    });
    const match = String(res.data) === 'synthetic_challenge_998877';
    console.log(`GET Challenge verification (valid token): HTTP ${res.status} [Match: ${match}]`);
    if (res.status !== 200 || !match) allPassed = false;
  } catch (e) {
    console.error('GET Challenge failed:', e.message);
    allPassed = false;
  }

  // 2. Invalid GET challenge
  try {
    await axios.get(baseUrl, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token_xyz',
        'hub.challenge': 'fail_challenge'
      }
    });
    console.error('Invalid token did NOT fail as expected');
    allPassed = false;
  } catch (e) {
    const is403 = e.response && e.response.status === 403;
    console.log(`GET Challenge rejection (invalid token): HTTP ${e.response?.status} [403 Expected: ${is403}]`);
    if (!is403) allPassed = false;
  }

  // 3. POST leadgen event
  try {
    const payload = {
      object: 'page',
      entry: [{
        id: 'page_123',
        time: Date.now(),
        changes: [{
          field: 'leadgen',
          value: {
            leadgen_id: 'leadgen_mock_99998888',
            page_id: 'page_123',
            form_id: 'form_456'
          }
        }]
      }]
    };
    const res = await axios.post(baseUrl, payload);
    console.log(`POST Leadgen Event: HTTP ${res.status}, body: "${res.data}"`);
    if (res.status !== 200 || res.data !== 'EVENT_RECEIVED') allPassed = false;
  } catch (e) {
    console.error('POST Leadgen Event failed:', e.message);
    allPassed = false;
  }

  // 4. Duplicate POST leadgen event (idempotency)
  try {
    const payload = {
      object: 'page',
      entry: [{
        id: 'page_123',
        time: Date.now(),
        changes: [{
          field: 'leadgen',
          value: {
            leadgen_id: 'leadgen_mock_99998888',
            page_id: 'page_123',
            form_id: 'form_456'
          }
        }]
      }]
    };
    const res = await axios.post(baseUrl, payload);
    console.log(`Duplicate POST Leadgen Replay: HTTP ${res.status}, body: "${res.data}"`);
    if (res.status !== 200 || res.data !== 'EVENT_RECEIVED') allPassed = false;
  } catch (e) {
    console.error('Duplicate POST Leadgen Replay failed:', e.message);
    allPassed = false;
  }

  server.close();

  console.log('====================================================');
  console.log(`META WEBHOOK AUDIT RESULT: ${allPassed ? 'ALL PASS' : 'FAIL'}`);
  console.log('====================================================');

  if (!allPassed) process.exit(1);
}

testMetaWebhook();
