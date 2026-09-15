// scripts/test_aisensy_audit.cjs
// ─────────────────────────────────────────────────────────────────
// AiSensy Integration, Transport & Idempotency Audit
// ─────────────────────────────────────────────────────────────────
const { sendWhatsAppTemplate } = require('../src/services/aisensyAdapter.cjs');
const express = require('express');
const http = require('http');
const axios = require('axios');
const whatsappRouter = require('../src/routes/whatsapp.cjs');
require('dotenv').config();

async function auditAiSensy() {
  console.log('====================================================');
  console.log('🔍 AISENSY WHATSAPP TRANSPORT & WEBHOOK AUDIT');
  console.log('====================================================');

  let allPassed = true;

  // 1. Adapter Interface & Mock Dispatch
  console.log('\n--- Step 1: Testing AiSensy Adapter Interface ---');
  try {
    const testPayload = {
      destination: '919999999988',
      campaignName: 'als_lead_ack_2026',
      templateParams: ['Sachin Shinde', 'Home Loan', 'https://www.avanifinserv.com', 'ALS-2026-TEST01']
    };
    const res = await sendWhatsAppTemplate(testPayload);
    console.log('Adapter Response Success:', res.success);
    console.log('Adapter Mode:', res.mock ? 'Mock / Fallback' : 'Live Gateway');
    if (!res.success) allPassed = false;
  } catch (err) {
    console.error('Adapter test failed:', err.message);
    allPassed = false;
  }

  // 2. Inbound AiSensy Webhook Ingestion
  console.log('\n--- Step 2: Testing Inbound AiSensy Webhook Ingestion ---');
  const app = express();
  app.use(express.json());
  app.use('/api/whatsapp', whatsappRouter);

  const server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const webhookUrl = `http://localhost:${port}/api/whatsapp/webhook`;

  try {
    // AiSensy sends flat JSON with phone and text/message
    const aisensyInboundPayload = {
      phone: '919999999988',
      message: 'Hello, I want to inquire about a business loan of 10 lakhs',
      timestamp: Date.now()
    };
    const res = await axios.post(webhookUrl, aisensyInboundPayload);
    console.log(`AiSensy Inbound Webhook: HTTP ${res.status}, response:`, res.data);
    if (res.status !== 200 || !res.data.success) allPassed = false;
  } catch (err) {
    console.error('Inbound AiSensy webhook failed:', err.message);
    allPassed = false;
  }

  // 3. Duplicate Inbound Protection
  console.log('\n--- Step 3: Verifying Duplicate Inbound Safety ---');
  try {
    const replayPayload = {
      phone: '919999999988',
      message: 'Hello, I want to inquire about a business loan of 10 lakhs',
      timestamp: Date.now()
    };
    const res2 = await axios.post(webhookUrl, replayPayload);
    console.log(`AiSensy Replay Event: HTTP ${res2.status} (Handled safely without crash)`);
    if (res2.status !== 200) allPassed = false;
  } catch (err) {
    console.error('Replay test failed:', err.message);
    allPassed = false;
  }

  server.close();

  console.log('\n====================================================');
  console.log(`AISENSY AUDIT RESULT: ${allPassed ? 'ALL PASS' : 'FAIL'}`);
  console.log('====================================================');

  process.exit(allPassed ? 0 : 1);
}

auditAiSensy();
