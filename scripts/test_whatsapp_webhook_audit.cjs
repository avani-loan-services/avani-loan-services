// scripts/test_whatsapp_webhook_audit.cjs
const express = require('express');
const whatsappRouter = require('../src/routes/whatsapp.cjs');
const http = require('http');
const axios = require('axios');
require('dotenv').config();

async function testWhatsAppWebhook() {
  console.log('====================================================');
  console.log('🔍 WHATSAPP CLOUD API WEBHOOK AUDIT');
  console.log('====================================================');

  const app = express();
  app.use(express.json());
  app.use('/api/whatsapp', whatsappRouter);

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/whatsapp/webhook`;

  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || process.env.OMNIDM_VERIFY_TOKEN || 'avani_loan_verify_token_1356';
  console.log('Configured WhatsApp Verify Token exists:', !!verifyToken);

  let allPassed = true;

  // 1. GET challenge verification
  try {
    const res = await axios.get(baseUrl, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': verifyToken,
        'hub.challenge': 'whatsapp_challenge_123456'
      }
    });
    const match = String(res.data) === 'whatsapp_challenge_123456';
    console.log(`GET WhatsApp Challenge: HTTP ${res.status} [Match: ${match}]`);
    if (res.status !== 200 || !match) allPassed = false;
  } catch (e) {
    console.error('GET WhatsApp Challenge failed:', e.message);
    allPassed = false;
  }

  // 2. GET rejection on wrong token
  try {
    await axios.get(baseUrl, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token',
        'hub.challenge': 'fail'
      }
    });
    console.error('Wrong token was not rejected');
    allPassed = false;
  } catch (e) {
    const is403 = e.response && e.response.status === 403;
    console.log(`GET Rejection (invalid token): HTTP ${e.response?.status} [403 Expected: ${is403}]`);
    if (!is403) allPassed = false;
  }

  // 3. POST inbound WhatsApp Cloud API message
  try {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'WABA_123',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '919175635165', phone_number_id: 'PN_123' },
            contacts: [{ profile: { name: 'Dr. Sachin' }, wa_id: '919999999999' }],
            messages: [{
              from: '919999999999',
              id: 'wamid.test_001',
              timestamp: '1789445500',
              text: { body: 'I need a doctor professional loan of 25 lakhs' },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    const res = await axios.post(baseUrl, payload);
    console.log(`POST WhatsApp Inbound Event: HTTP ${res.status}, body: "${res.data}"`);
    if (res.status !== 200 || res.data !== 'EVENT_RECEIVED') allPassed = false;
  } catch (e) {
    console.error('POST WhatsApp Inbound Event failed:', e.message);
    allPassed = false;
  }

  server.close();

  console.log('====================================================');
  console.log(`WHATSAPP WEBHOOK AUDIT RESULT: ${allPassed ? 'ALL PASS' : 'FAIL'}`);
  console.log('====================================================');

  if (!allPassed) process.exit(1);
}

testWhatsAppWebhook();
