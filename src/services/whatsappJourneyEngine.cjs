// src/services/whatsappJourneyEngine.cjs
// ─────────────────────────────────────────────────────────────────
// State-Machine-Driven WhatsApp Customer Journey Engine
// AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const { getTemplate } = require('../config/whatsappTemplates.cjs');
const { getLead, updateLead } = require('./centralLeadEngine.cjs');
const { recordProviderAttempt } = require('../models/ProviderLedger.cjs');

const JOURNEY_STAGES = [
  'LEAD_CREATED',
  'TEMPLATE_APPROVED',
  'TEMPLATE_SENT',
  'CUSTOMER_ENGAGED',
  'QUALIFICATION',
  'QUALIFICATION_COMPLETE',
  'DOCUMENT_CHECKLIST',
  'DOCUMENTS_PENDING',
  'DOCUMENTS_RECEIVED',
  'ADVISOR_REVIEW',
  'FOLLOW_UP'
];

// In-memory processed webhook event deduplication cache
const processedEvents = new Set();

/**
 * Check if running in safe test / mock mode
 */
function isTestMode() {
  return process.env.WHATSAPP_TEST_MODE === 'true' ||
         process.env.NODE_ENV === 'test' ||
         process.env.PROVIDER_MODE === 'mock' ||
         !process.env.META_WHATSAPP_PERMANENT_TOKEN;
}

/**
 * Dispatch an approved template to customer through journey
 */
async function sendJourneyTemplate(leadIdentifier, templateKey, customVars = {}) {
  const lead = getLead(leadIdentifier);
  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }

  const template = getTemplate(templateKey);
  if (!template || !template.active) {
    return { success: false, error: `Invalid or inactive template: ${templateKey}` };
  }

  const recipient = lead.mobile;
  const portalUrl = `https://www.avanifinserv.com/loan-documents/${lead.secureToken || lead.leadId}`;

  // Fill template variables
  let messageText = template.text
    .replace(/\{\{name\}\}/g, lead.fullName || 'Customer')
    .replace(/\{\{leadId\}\}/g, lead.leadId)
    .replace(/\{\{loanProduct\}\}/g, lead.loanProduct || lead.loanType || 'Loan')
    .replace(/\{\{portalUrl\}\}/g, portalUrl)
    .replace(/\{\{advisorName\}\}/g, lead.assignedAdvisor || 'Sachin Shinde')
    .replace(/\{\{newStatus\}\}/g, customVars.newStatus || lead.status);

  // Safe Mock / Test Mode: Zero external HTTP request
  if (isTestMode()) {
    const simulatedMessageId = `MOCK-WA-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    console.log(`[WhatsAppJourneyEngine] [SAFE MOCK] Template '${templateKey}' simulated for ${lead.leadId} -> ${recipient}`);

    const logEntry = {
      timestamp: new Date().toISOString(),
      channel: 'WHATSAPP',
      event: 'TEMPLATE_SENT',
      templateKey,
      metaTemplateName: template.metaTemplateName,
      messageId: simulatedMessageId,
      recipient,
      simulated: true
    };

    const comms = lead.communicationHistory || [];
    comms.push(logEntry);

    updateLead(lead.leadId, {
      communicationHistory: comms,
      whatsappJourneyStage: template.stage,
      lastContactedAt: new Date().toISOString()
    });

    await recordProviderAttempt({
      provider: 'META_WHATSAPP_MOCK',
      operation: 'SEND_TEMPLATE',
      leadId: lead.leadId,
      status: 'SENT_MOCK',
      providerRequestId: simulatedMessageId,
      requestPayload: { templateKey, recipient }
    });

    return {
      success: true,
      simulated: true,
      messageId: simulatedMessageId,
      stage: template.stage,
      leadId: lead.leadId
    };
  }

  // Live Meta WhatsApp API dispatch (production only)
  try {
    const axios = require('axios');
    const token = process.env.META_WHATSAPP_PERMANENT_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID || '104332499105436';

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `91${recipient}`,
        type: 'template',
        template: {
          name: template.metaTemplateName,
          language: { code: template.language }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const liveMsgId = response.data?.messages?.[0]?.id || `WA-${Date.now()}`;

    const comms = lead.communicationHistory || [];
    comms.push({
      timestamp: new Date().toISOString(),
      channel: 'WHATSAPP',
      event: 'TEMPLATE_SENT',
      templateKey,
      metaTemplateName: template.metaTemplateName,
      messageId: liveMsgId,
      recipient,
      simulated: false
    });

    updateLead(lead.leadId, {
      communicationHistory: comms,
      whatsappJourneyStage: template.stage,
      lastContactedAt: new Date().toISOString()
    });

    return {
      success: true,
      simulated: false,
      messageId: liveMsgId,
      stage: template.stage,
      leadId: lead.leadId
    };
  } catch (err) {
    console.error('[WhatsAppJourneyEngine] Error sending template:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Handle incoming customer webhook event with strict idempotency
 */
async function handleCustomerEvent(eventPayload) {
  const eventId = eventPayload.eventId || eventPayload.id || `${eventPayload.from}_${eventPayload.timestamp || Date.now()}`;

  if (processedEvents.has(eventId)) {
    console.log(`[WhatsAppJourneyEngine] Duplicate webhook event suppressed: ${eventId}`);
    return { success: true, isDuplicate: true, eventId };
  }
  processedEvents.add(eventId);

  const phone = String(eventPayload.from || eventPayload.mobile || '').replace(/[^0-9]/g, '').slice(-10);
  const lead = getLead(phone);

  if (!lead) {
    return { success: false, error: `No active lead for phone ${phone}`, isDuplicate: false };
  }

  const incomingText = String(eventPayload.text || eventPayload.body || '').trim();

  const comms = lead.communicationHistory || [];
  comms.push({
    timestamp: new Date().toISOString(),
    channel: 'WHATSAPP',
    event: 'CUSTOMER_REPLY',
    eventId,
    text: incomingText
  });

  // Advance journey stage if appropriate
  let nextStage = lead.whatsappJourneyStage || 'LEAD_CREATED';
  if (nextStage === 'LEAD_CREATED' || nextStage === 'TEMPLATE_SENT') {
    nextStage = 'CUSTOMER_ENGAGED';
  } else if (nextStage === 'CUSTOMER_ENGAGED') {
    nextStage = 'QUALIFICATION';
  }

  updateLead(lead.leadId, {
    communicationHistory: comms,
    whatsappJourneyStage: nextStage,
    lastContactedAt: new Date().toISOString()
  });

  return {
    success: true,
    isDuplicate: false,
    leadId: lead.leadId,
    currentStage: nextStage
  };
}

module.exports = {
  JOURNEY_STAGES,
  sendJourneyTemplate,
  handleCustomerEvent,
  isTestMode
};
