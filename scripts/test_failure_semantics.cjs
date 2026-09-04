// scripts/test_failure_semantics.cjs
// ─────────────────────────────────────────────────────────────────
// Negative & Failure Semantics Test Suite for AVANI AI CRM
// ─────────────────────────────────────────────────────────────────

const { registerWebhookEvent } = require('../src/models/WebhookInbox.cjs');
const { processCustomerMessageWithAI } = require('../src/services/avaniAiAgent.cjs');
const { workerAuthMiddleware } = require('../src/middleware/workerAuth.cjs');
const { initiateOmnidmCall } = require('../src/services/omnidmAgent.cjs');
const { dispatchOutboundWhatsApp } = require('../src/services/whatsappProviderEngine.cjs');

async function testFailureSemantics() {
  console.log('\n--- RUNNING NEGATIVE & FAILURE SEMANTICS SUITE ---');
  const results = [];

  // 1. Invalid Worker Secret
  try {
    const mockReq = { headers: { 'x-worker-auth': 'WRONG_SECRET' }, ip: '127.0.0.1' };
    let statusSet = 400;
    let jsonBody = null;
    const mockRes = {
      status: (code) => { statusSet = code; return mockRes; },
      json: (obj) => { jsonBody = obj; return mockRes; }
    };
    workerAuthMiddleware(mockReq, mockRes, () => {});
    if (statusSet === 401) {
      console.log('✅ Test 1: Invalid Worker Secret rejected with 401: PASS');
      results.push({ test: 'Invalid Worker Secret', status: 'PASS' });
    } else {
      results.push({ test: 'Invalid Worker Secret', status: 'FAIL' });
    }
  } catch (e) {
    results.push({ test: 'Invalid Worker Secret', status: 'FAIL', error: e.message });
  }

  // 2. Duplicate Inbound Webhook Replay
  try {
    const eventId = `FAIL_TEST_EVT_${Date.now()}`;
    const reg1 = await registerWebhookEvent(eventId, 'META_WHATSAPP', { msg: 'Test' });
    const reg2 = await registerWebhookEvent(eventId, 'META_WHATSAPP', { msg: 'Test' });
    if (!reg1.isDuplicate && reg2.isDuplicate) {
      console.log('✅ Test 2: Duplicate Inbound Webhook Replay Suppressed: PASS');
      results.push({ test: 'Duplicate Webhook Replay', status: 'PASS' });
    } else {
      results.push({ test: 'Duplicate Webhook Replay', status: 'FAIL' });
    }
  } catch (e) {
    results.push({ test: 'Duplicate Webhook Replay', status: 'FAIL', error: e.message });
  }

  // 3. Customer Sends Unsupported / Unstructured Message
  try {
    const aiRes = await processCustomerMessageWithAI('xyz123randomtext', { language: 'English' });
    if (aiRes.success && aiRes.extraction) {
      console.log('✅ Test 3: Unsupported Message Handled Safely: PASS');
      results.push({ test: 'Unsupported Message Handling', status: 'PASS' });
    } else {
      results.push({ test: 'Unsupported Message Handling', status: 'FAIL' });
    }
  } catch (e) {
    results.push({ test: 'Unsupported Message Handling', status: 'FAIL', error: e.message });
  }

  // 4. Missing Provider Key Handling
  try {
    const prevMode = process.env.PROVIDER_MODE;
    process.env.PROVIDER_MODE = 'live';
    delete process.env.META_WHATSAPP_TOKEN;
    delete process.env.AISENSY_API_KEY;

    const waRes = await dispatchOutboundWhatsApp({
      toPhone: '919175635165',
      messageText: 'Test Fail Closed',
      leadId: 'AVL-TEST-FAIL'
    });

    process.env.PROVIDER_MODE = prevMode;

    if (waRes.providerStatus === 'FAILED') {
      console.log('✅ Test 4: Missing WhatsApp Key Fails Closed (No Fake Success): PASS');
      results.push({ test: 'Missing WhatsApp Key Fail Closed', status: 'PASS' });
    } else {
      results.push({ test: 'Missing WhatsApp Key Fail Closed', status: 'FAIL' });
    }
  } catch (e) {
    results.push({ test: 'Missing WhatsApp Key Fail Closed', status: 'FAIL', error: e.message });
  }

  // 5. Malformed JSON AI Extraction Fallback
  try {
    const aiRes = await processCustomerMessageWithAI('मला १ लाख रुपये पगार आहे', { language: 'Marathi' });
    if (aiRes.extraction && aiRes.extraction.extractedFields) {
      console.log('✅ Test 5: AI Extraction Fallback & Schema Validation: PASS');
      results.push({ test: 'AI Extraction Schema Validation', status: 'PASS' });
    } else {
      results.push({ test: 'AI Extraction Schema Validation', status: 'FAIL' });
    }
  } catch (e) {
    results.push({ test: 'AI Extraction Schema Validation', status: 'FAIL', error: e.message });
  }

  console.log('--- FAILURE SEMANTICS SUITE COMPLETE ---\n');
  return results;
}

if (require.main === module) {
  testFailureSemantics().catch(err => {
    console.error('❌ Failure Semantics Test Suite Errored:', err.message);
    process.exit(1);
  });
}

module.exports = { testFailureSemantics };
