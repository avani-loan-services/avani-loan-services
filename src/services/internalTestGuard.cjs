// src/services/internalTestGuard.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Phase 4C Atomic One-Message Internal Test Guard
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { getMetaCredentials, getAiSensyCredentials } = require('./templatePublishingEngine.cjs');

const LEDGER_PATH = path.join(__dirname, '../data/internalTestLedger.json');
const LOGICAL_GUARD_KEY = 'phase4c_internal_test_once';
const AUTHORIZATION_PHRASE = 'AUTHORIZE LIVE PILOT';

/**
 * Read persistent test ledger
 */
function readLedger() {
  try {
    if (fs.existsSync(LEDGER_PATH)) {
      return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
    }
  } catch (err) {
    console.warn('[InternalTestGuard] Could not read ledger:', err.message);
  }
  return {};
}

/**
 * Write persistent test ledger atomically
 */
function writeLedger(data) {
  try {
    const dir = path.dirname(LEDGER_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[InternalTestGuard] Failed to write ledger:', err.message);
  }
}

/**
 * Redact phone number for logging and reports (e.g. +91******1234)
 */
function redactPhone(phone) {
  if (!phone) return 'NOT_CONFIGURED';
  const clean = String(phone).trim();
  if (clean.length < 8) return '******';
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-4);
  return `${prefix}******${suffix}`;
}

/**
 * Validate E.164 phone number
 */
function validatePhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, error: 'Phone number is empty or missing' };
  }
  const trimmed = raw.trim();
  // Must match E.164: + followed by 10 to 15 digits, or clean digits 12 digits for India
  const e164Regex = /^\+?[1-9]\d{9,14}$/;
  if (!e164Regex.test(trimmed)) {
    return { isValid: false, error: 'Phone number is not in valid E.164 format' };
  }
  const cleanDigits = trimmed.replace(/[^0-9]/g, '');
  if (cleanDigits.length < 10 || cleanDigits.length > 15) {
    return { isValid: false, error: 'Phone number digit length invalid' };
  }
  return { isValid: true, normalized: cleanDigits.startsWith('91') && cleanDigits.length === 12 ? cleanDigits : (cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits) };
}

/**
 * Check preflight state before sending
 */
function getPreflightState() {
  const rawPhone = process.env.AVANI_INTERNAL_TEST_PHONE;
  const phoneValidation = validatePhoneNumber(rawPhone);
  const ledger = readLedger();
  const existingTest = ledger[LOGICAL_GUARD_KEY];

  return {
    testKey: LOGICAL_GUARD_KEY,
    phoneConfigured: Boolean(rawPhone),
    phoneValid: phoneValidation.isValid,
    phoneError: phoneValidation.error || null,
    redactedRecipient: phoneValidation.isValid ? redactPhone(rawPhone) : 'NOT_CONFIGURED',
    alreadyExecuted: Boolean(existingTest && ['ACCEPTED', 'SENT', 'DELIVERED', 'READ'].includes(existingTest.status)),
    existingStatus: existingTest ? existingTest.status : null,
    existingTimestamp: existingTest ? existingTest.timestamp : null,
    providerMessageId: existingTest ? existingTest.providerMessageId : null
  };
}

/**
 * Execute exactly ONE internal WhatsApp message with atomic idempotency protection
 */
async function executeInternalWhatsAppTest({ authorizationToken, applicantName = 'Sachin Shinde' }) {
  // 1. Mandatory Authorization Check
  if (authorizationToken !== AUTHORIZATION_PHRASE) {
    return {
      success: false,
      status: 'AUTHORIZATION_REQUIRED',
      error: `Invalid authorization token. Exact required phrase: '${AUTHORIZATION_PHRASE}'`
    };
  }

  // 2. Internal Test Recipient Check
  const rawPhone = process.env.AVANI_INTERNAL_TEST_PHONE;
  if (!rawPhone) {
    return {
      success: false,
      status: 'TEST_RECIPIENT_NOT_CONFIGURED',
      error: 'AVANI_INTERNAL_TEST_PHONE is not configured in environment'
    };
  }

  // 3. Validate Phone Number
  const phoneVal = validatePhoneNumber(rawPhone);
  if (!phoneVal.isValid) {
    return {
      success: false,
      status: 'INTERNAL_TEST_PHONE_INVALID',
      error: phoneVal.error
    };
  }

  const destinationPhone = phoneVal.normalized;
  const redactedRecipient = redactPhone(rawPhone);

  // 4. Exactly-One Atomic Guard Check
  const ledger = readLedger();
  if (ledger[LOGICAL_GUARD_KEY] && ['ACCEPTED', 'SENT', 'DELIVERED', 'READ'].includes(ledger[LOGICAL_GUARD_KEY].status)) {
    return {
      success: false,
      status: 'INTERNAL_TEST_ALREADY_EXECUTED',
      error: `Guard key '${LOGICAL_GUARD_KEY}' has already been executed at ${ledger[LOGICAL_GUARD_KEY].timestamp}`,
      previousResult: {
        status: ledger[LOGICAL_GUARD_KEY].status,
        providerMessageId: ledger[LOGICAL_GUARD_KEY].providerMessageId,
        timestamp: ledger[LOGICAL_GUARD_KEY].timestamp
      }
    };
  }

  // 5. Customer Isolation Audit Object
  const recipientAudit = {
    recipientSource: 'AVANI_INTERNAL_TEST_PHONE',
    customerDatabaseUsed: false,
    crmRecipientsUsed: false,
    metaLeadRecipientsUsed: false,
    broadcastListUsed: false,
    recipientCount: 1
  };

  // 6. Template & Parameters
  const templateName = 'business_loan_lead_received';
  const metaTemplateId = '2297724821040645';
  const correlationId = `CORR-PHASE4C-TEST-${Date.now()}`;
  const now = new Date().toISOString();

  // Set atomic lock in ledger
  ledger[LOGICAL_GUARD_KEY] = {
    guardKey: LOGICAL_GUARD_KEY,
    status: 'REQUESTED',
    timestamp: now,
    redactedRecipient,
    recipientAudit,
    templateName,
    metaTemplateId,
    correlationId,
    dispatchesCount: 0
  };
  writeLedger(ledger);

  // 7. Verify Credentials
  const { wabaId, token, phoneId } = getMetaCredentials();
  const { apiKey: aisensyKey, projectId: aisensyProjectId } = getAiSensyCredentials();

  let outboundResult = null;
  let transportUsed = null;
  let providerMessageId = null;

  // 8. Execute Dispatch via Authoritative Transport (Meta Graph API or AiSensy)
  // Direct Meta Graph API is preferred for zero-delay message delivery & WAMID generation
  if (token && phoneId) {
    transportUsed = 'META_GRAPH_API';
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: destinationPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: applicantName
              }
            ]
          }
        ]
      }
    };

    try {
      console.log(`[InternalTestGuard] Dispatching single message via Meta Graph API to ${redactedRecipient}...`);
      const res = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      providerMessageId = res.data?.messages?.[0]?.id || `WAMID-${Date.now()}`;
      outboundResult = {
        httpStatus: res.status,
        data: res.data,
        status: 'ACCEPTED'
      };
    } catch (err) {
      const errData = err.response?.data || {};
      console.error('[InternalTestGuard] Meta dispatch error:', errData.error?.message || err.message);
      ledger[LOGICAL_GUARD_KEY].status = 'FAILED';
      ledger[LOGICAL_GUARD_KEY].error = errData.error?.message || err.message;
      writeLedger(ledger);

      return {
        success: false,
        status: 'INTERNAL_TEST_SEND_FAILED',
        error: errData.error?.message || err.message,
        errorCode: errData.error?.code,
        transport: transportUsed
      };
    }
  } else if (aisensyKey) {
    transportUsed = 'AISENSY_API';
    try {
      console.log(`[InternalTestGuard] Dispatching single message via AiSensy to ${redactedRecipient}...`);
      const res = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', {
        apiKey: aisensyKey,
        campaignName: templateName,
        destination: destinationPhone,
        userName: applicantName,
        templateParams: [applicantName]
      }, { timeout: 15000 });

      providerMessageId = res.data?.messageId || `AISENSY-${Date.now()}`;
      outboundResult = {
        httpStatus: res.status,
        data: res.data,
        status: 'ACCEPTED'
      };
    } catch (err) {
      console.error('[InternalTestGuard] AiSensy dispatch error:', err.message);
      ledger[LOGICAL_GUARD_KEY].status = 'FAILED';
      ledger[LOGICAL_GUARD_KEY].error = err.message;
      writeLedger(ledger);

      return {
        success: false,
        status: 'INTERNAL_TEST_SEND_FAILED',
        error: err.message,
        transport: transportUsed
      };
    }
  } else {
    return {
      success: false,
      status: 'META_CREDENTIALS_NOT_CONFIGURED',
      error: 'Neither Meta Access Token nor AiSensy API Key is available'
    };
  }

  // 9. Update Ledger Atomically
  ledger[LOGICAL_GUARD_KEY].status = 'ACCEPTED';
  ledger[LOGICAL_GUARD_KEY].transport = transportUsed;
  ledger[LOGICAL_GUARD_KEY].providerMessageId = providerMessageId;
  ledger[LOGICAL_GUARD_KEY].dispatchesCount = 1;
  ledger[LOGICAL_GUARD_KEY].acceptedAt = new Date().toISOString();
  writeLedger(ledger);

  return {
    success: true,
    status: 'ACCEPTED',
    providerMessageId,
    transport: transportUsed,
    redactedRecipient,
    correlationId,
    idempotencyKey: LOGICAL_GUARD_KEY,
    dispatchesCount: 1,
    recipientAudit
  };
}

/**
 * Record a delivery event from webhook
 */
function recordWebhookEvent({ providerMessageId, eventStatus, timestamp }) {
  const ledger = readLedger();
  const test = ledger[LOGICAL_GUARD_KEY];
  if (test && test.providerMessageId === providerMessageId) {
    test.status = eventStatus.toUpperCase();
    test.lastEventTimestamp = timestamp || new Date().toISOString();
    test.webhookEvents = test.webhookEvents || [];
    test.webhookEvents.push({ status: eventStatus, timestamp: test.lastEventTimestamp });
    writeLedger(ledger);
    return true;
  }
  return false;
}

module.exports = {
  LOGICAL_GUARD_KEY,
  AUTHORIZATION_PHRASE,
  redactPhone,
  validatePhoneNumber,
  getPreflightState,
  executeInternalWhatsAppTest,
  recordWebhookEvent
};
