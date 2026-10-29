// src/services/chatmitraProviderEngine.cjs
// ─────────────────────────────────────────────────────────────────
// ChatMitra Pro REST API & Outbound Dispatcher (AVANI AI CRM Adapter)
// Official API Endpoints:
//   Template: POST https://api.chatmitra.com/v2/client/send_template
//   Messages: POST https://api.chatmitra.com/v1/messages
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');
const crypto = require('crypto');
const { recordProviderAttempt } = require('../models/ProviderLedger.cjs');

const CHATMITRA_BASE_URL = 'https://api.chatmitra.com';
const CHATMITRA_BACKEND_URL = 'https://backend.chatmitra.com';

/**
 * Verifies HMAC-SHA256 signature on incoming ChatMitra webhook requests
 * Official header: X-Webhook-Signature (plain hex, no sha256= prefix)
 * Also supports legacy / Meta-style sha256= prefix and X-Hub-Signature-256
 */
function verifyChatMitraWebhookSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  try {
    const rawString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawString)
      .digest('hex');
    
    // Support either raw hex (official ChatMitra) or sha256= prefix
    const cleanSig = signatureHeader.replace(/^sha256=/, '').trim();
    const cleanSigBuf = Buffer.from(cleanSig, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    if (cleanSigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(cleanSigBuf, expectedBuf);
  } catch (err) {
    console.warn('[ChatMitra Security] Signature verification error:', err.message);
    return false;
  }
}

/**
 * Format Indian 10-digit number into standard ChatMitra format (e.g. 919876543210)
 */
function formatChatMitraPhone(phone) {
  const clean = String(phone || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) return `91${clean}`;
  return clean;
}

/**
 * Dispatches an outbound template or text message via ChatMitra
 */
async function dispatchChatMitraMessage({
  toPhone,
  messageText = '',
  templateName = null,
  templateParams = [],
  language = 'en',
  leadId = 'N/A',
  correlationId = `CORR-${Date.now()}`,
  testRunId = 'AVANI-CHATMITRA-TRIAL',
  forceMock = false
}) {
  const providerMode = process.env.PROVIDER_MODE || 'mock';
  const apiKey = (process.env.CHATMITRA_API_KEY || '').trim();
  const formattedPhone = formatChatMitraPhone(toPhone);
  const maskedPhone = formattedPhone.slice(0, 4) + '****' + formattedPhone.slice(-2);

  // 1. MOCK / SANDBOX MODE SAFETY GATE
  if (forceMock || providerMode === 'mock' || !apiKey) {
    const mockMsgId = `CM-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`[ChatMitra Engine] MOCK dispatch to ${maskedPhone} (Template: ${templateName || 'TEXT'})`);

    await recordProviderAttempt({
      provider: 'CHATMITRA',
      operation: templateName ? 'SEND_TEMPLATE_MOCK' : 'SEND_MESSAGE_MOCK',
      leadId,
      correlationId,
      testRunId,
      providerMessageId: mockMsgId,
      status: 'API_ACCEPTED',
      requestPayload: {
        to: formattedPhone,
        templateName,
        templateParams,
        language
      }
    });

    return {
      success: true,
      provider: 'ChatMitra_Mock',
      status: 'API_ACCEPTED',
      providerMessageId: mockMsgId,
      leadId,
      correlationId,
      rawResponse: { message: 'Mock dispatch accepted by safety gate', id: mockMsgId }
    };
  }

  // 2. LIVE CHATMITRA REST API DISPATCH (Authorized live credentials only)
  try {
    let res;
    if (templateName) {
      // ChatMitra Official v2 Template Endpoint
      const endpoint = `${CHATMITRA_BASE_URL}/v2/client/send_template`;
      const payload = {
        templateName,
        language,
        phoneNumber: formattedPhone,
        components: [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: String(param)
            }))
          }
        ]
      };

      res = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    } else {
      // ChatMitra Official Session Message Endpoint (24-hour service window)
      const endpoint = `${CHATMITRA_BACKEND_URL}/developer/api/send_message`;
      const payload = {
        recipient_mobile_number: formattedPhone,
        messages: [
          {
            kind: 'raw',
            payload: {
              type: 'text',
              text: {
                body: messageText
              }
            }
          }
        ]
      };

      res = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    }

    const providerMessageId = res.data?.id || res.data?.messages?.[0]?.id || `CM-${Date.now()}`;

    await recordProviderAttempt({
      provider: 'CHATMITRA',
      operation: templateName ? 'SEND_TEMPLATE_LIVE' : 'SEND_MESSAGE_LIVE',
      leadId,
      correlationId,
      testRunId,
      providerMessageId,
      status: 'API_ACCEPTED',
      responsePayload: res.data
    });

    return {
      success: true,
      provider: 'ChatMitra_Live',
      status: 'API_ACCEPTED',
      providerMessageId,
      leadId,
      correlationId,
      rawResponse: res.data
    };
  } catch (error) {
    const rawErr = error?.response?.data || error.message;
    const errStr = typeof rawErr === 'object' ? JSON.stringify(rawErr) : String(rawErr);
    console.error(`[ChatMitra Engine Error]:`, errStr);

    await recordProviderAttempt({
      provider: 'CHATMITRA',
      operation: 'DISPATCH_ERROR',
      leadId,
      correlationId,
      testRunId,
      providerMessageId: `CM-ERR-${Date.now()}`,
      status: 'FAILED',
      responsePayload: { error: errStr }
    });

    return {
      success: false,
      provider: 'ChatMitra',
      status: 'FAILED',
      error: errStr
    };
  }
}

module.exports = {
  dispatchChatMitraMessage,
  verifyChatMitraWebhookSignature,
  formatChatMitraPhone
};
