// src/services/whatsappProviderEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Meta WhatsApp & AiSensy Outbound Messaging & Status Engine
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');
const { recordProviderAttempt } = require('../models/ProviderLedger.cjs');

// Status Map Store (providerMessageId -> status)
const messageStatusLedger = new Map();

/**
 * Dispatch Outbound WhatsApp Message with Granular Status Tracking
 */
async function dispatchOutboundWhatsApp({
  toPhone,
  messageText,
  templateName = null,
  leadId = 'N/A',
  correlationId = `CORR-${Date.now()}`,
  testRunId = 'AVANI-E2E-2026'
}) {
  const providerMode = process.env.PROVIDER_MODE || 'mock';
  const metaToken = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID || '2049842548930849';
  const aisensyKey = process.env.AISENSY_API_KEY;

  const cleanPhone = String(toPhone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  console.log(`[WhatsApp Provider] Outbound dispatch to ${formattedPhone.slice(0, 4)}**** (Mode: ${providerMode})...`);

  // 1. MOCK MODE
  if (providerMode === 'mock' || (!metaToken && !aisensyKey)) {
    const mockMessageId = `WAMID-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // HTTP 200 = API_ACCEPTED ONLY
    messageStatusLedger.set(mockMessageId, {
      status: 'API_ACCEPTED',
      leadId,
      correlationId,
      timestamp: new Date().toISOString()
    });

    await recordProviderAttempt({
      provider: 'META_WHATSAPP',
      operation: 'DISPATCH_MESSAGE_MOCK',
      leadId,
      correlationId,
      testRunId,
      providerMessageId: mockMessageId,
      status: 'API_ACCEPTED',
      requestPayload: { to: formattedPhone, messageText, templateName }
    });

    return {
      success: true,
      provider: 'Mock_Provider',
      providerStatus: 'API_ACCEPTED',
      providerMessageId: mockMessageId,
      leadId,
      correlationId
    };
  }

  // 2. META WHATSAPP CLOUD API
  if (metaToken && metaToken.length > 20) {
    try {
      const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      const payload = templateName ? {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: { name: templateName, language: { code: 'en' } }
      } : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { preview_url: true, body: messageText }
      };

      const res = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const messageId = res.data?.messages?.[0]?.id || `WAMID-${Date.now()}`;

      messageStatusLedger.set(messageId, {
        status: 'API_ACCEPTED',
        leadId,
        correlationId,
        timestamp: new Date().toISOString()
      });

      await recordProviderAttempt({
        provider: 'META_WHATSAPP',
        operation: 'DISPATCH_MESSAGE_LIVE',
        leadId,
        correlationId,
        testRunId,
        providerMessageId: messageId,
        status: 'API_ACCEPTED',
        responsePayload: res.data
      });

      return {
        success: true,
        provider: 'Meta_Cloud_API',
        providerStatus: 'API_ACCEPTED',
        providerMessageId: messageId,
        leadId,
        correlationId
      };
    } catch (metaErr) {
      console.error('[WhatsApp Provider] Meta Cloud API Error:', metaErr.response?.data || metaErr.message);
    }
  }

  // 3. AISENSY API
  if (aisensyKey) {
    try {
      const res = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', {
        apiKey: aisensyKey,
        campaignName: 'Avani_Qualification_Flow',
        destination: formattedPhone,
        userName: 'Valued Customer',
        templateParams: [messageText]
      }, { timeout: 10000 });

      const messageId = res.data?.messageId || `AISENSY-${Date.now()}`;

      messageStatusLedger.set(messageId, {
        status: 'API_ACCEPTED',
        leadId,
        correlationId,
        timestamp: new Date().toISOString()
      });

      await recordProviderAttempt({
        provider: 'AISENSY',
        operation: 'DISPATCH_MESSAGE_AISENSY',
        leadId,
        correlationId,
        testRunId,
        providerMessageId: messageId,
        status: 'API_ACCEPTED',
        responsePayload: res.data
      });

      return {
        success: true,
        provider: 'AiSensy',
        providerStatus: 'API_ACCEPTED',
        providerMessageId: messageId,
        leadId,
        correlationId
      };
    } catch (aisensyErr) {
      console.error('[WhatsApp Provider] AiSensy Error:', aisensyErr.message);
    }
  }

  return {
    success: false,
    providerStatus: 'FAILED',
    leadId,
    correlationId,
    error: 'No active provider credentials configured.'
  };
}

/**
 * Update Provider Message Status from Webhook Event (SENT, DELIVERED, READ)
 */
function updateMessageStatus(providerMessageId, status) {
  const allowed = ['API_ACCEPTED', 'SENT', 'DELIVERED', 'READ', 'REPLIED', 'FAILED', 'UNKNOWN'];
  const normStatus = String(status || '').toUpperCase();
  if (!allowed.includes(normStatus)) return false;

  const existing = messageStatusLedger.get(providerMessageId) || {};
  existing.status = normStatus;
  existing.updatedAt = new Date().toISOString();
  messageStatusLedger.set(providerMessageId, existing);

  console.log(`[WhatsApp Provider] Message ${providerMessageId} status transition → ${normStatus}`);
  return true;
}

function getMessageStatus(providerMessageId) {
  return messageStatusLedger.get(providerMessageId) || null;
}

module.exports = {
  dispatchOutboundWhatsApp,
  updateMessageStatus,
  getMessageStatus
};
