// src/services/omnidmAgent.cjs
// ─────────────────────────────────────────────────────────────────
// OmniDM AI Voice Agent Integration & Post-Call WhatsApp Router
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');
const { recordProviderAttempt } = require('../models/ProviderLedger.cjs');

const OMNIDM_SYSTEM_PROMPT = `You are a multilingual AI agent for AVANI LOAN SERVICES.
Detect the customer's language automatically (Marathi / Hindi / English).
Respond in the same language. Never switch languages unless requested.
Collect and confirm: name, city, profession/employment, monthly income, loan product, loan amount.
Use application-provided document rules.
Never invent eligibility criteria or document requirements.`;

/**
 * Dispatch Call Request to OmniDM AI Calling Agent
 */
async function initiateOmnidmCall(leadData) {
  const apiKey = process.env.OMNIDM_API_KEY || 'MOCK_OMNIDM_KEY';
  const agentId = process.env.OMNIDM_AGENT_ID || 'AGENT_AVANI_01';
  const providerMode = process.env.PROVIDER_MODE || 'mock';

  const cleanPhone = String(leadData.mobile || leadData.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
  const correlationId = leadData.correlationId || `CORR-${Date.now()}`;
  const testRunId = leadData.testRunId || 'AVANI-E2E-2026';
  const leadId = leadData.leadId || 'AVL-20260811-000001';

  console.log(`[OmniDM Engine] Requesting AI Voice Call to ${formattedPhone.slice(0, 5)}**** (Mode: ${providerMode})...`);

  // Provider Ledger Entry for CALL_REQUESTED
  await recordProviderAttempt({
    provider: 'OMNIDM',
    operation: 'INITIATE_CALL',
    leadId,
    correlationId,
    testRunId,
    status: 'DISPATCHED',
    requestPayload: { phone: formattedPhone, agentId, language: leadData.language || 'Marathi' }
  });

  if (providerMode === 'mock' || apiKey.includes('MOCK')) {
    const mockCallId = `OMNI-CALL-${Date.now()}`;
    console.log(`[OmniDM Engine] Mock Call Dispatched. Call ID: ${mockCallId}`);

    return {
      success: true,
      providerStatus: 'PROVIDER_ACCEPTED',
      providerCallId: mockCallId,
      leadId,
      correlationId,
      callStatus: 'DISPATCHED'
    };
  }

  try {
    const response = await axios.post(
      'https://api.omnidm.ai/v1/calls',
      {
        agent_id: agentId,
        phone_number: formattedPhone,
        system_prompt: OMNIDM_SYSTEM_PROMPT,
        language: leadData.language || 'Marathi',
        metadata: { leadId, correlationId, testRunId }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const callId = response.data?.call_id || response.data?.id || `OMNI-${Date.now()}`;

    // HTTP 200 = PROVIDER_ACCEPTED ONLY
    await recordProviderAttempt({
      provider: 'OMNIDM',
      operation: 'CALL_DISPATCH_CONFIRM',
      leadId,
      correlationId,
      testRunId,
      providerCallId: callId,
      status: 'DISPATCHED',
      responsePayload: response.data
    });

    return {
      success: true,
      providerStatus: 'PROVIDER_ACCEPTED',
      providerCallId: callId,
      leadId,
      correlationId,
      callStatus: 'DISPATCHED'
    };
  } catch (err) {
    console.error('[OmniDM Engine] Call Dispatch Failed:', err.message);

    await recordProviderAttempt({
      provider: 'OMNIDM',
      operation: 'CALL_DISPATCH_FAIL',
      leadId,
      correlationId,
      testRunId,
      status: 'FAILED',
      errorMessage: err.message
    });

    return {
      success: false,
      providerStatus: 'FAILED',
      leadId,
      correlationId,
      error: err.message
    };
  }
}

/**
 * Handle OmniDM Callback & Post-Call WhatsApp Routing
 */
async function processOmnidmCallback(callbackData, sendWhatsAppFn) {
  const callStatus = String(callbackData.status || callbackData.callStatus || 'UNKNOWN').toUpperCase();
  const providerCallId = callbackData.call_id || callbackData.providerCallId || 'N/A';
  const leadId = callbackData.metadata?.leadId || callbackData.leadId || 'N/A';
  const correlationId = callbackData.metadata?.correlationId || callbackData.correlationId || `CORR-${Date.now()}`;
  const testRunId = callbackData.metadata?.testRunId || callbackData.testRunId || 'AVANI-E2E-2026';
  const phone = callbackData.phone_number || callbackData.phone || '';

  console.log(`[OmniDM Callback] Call ID ${providerCallId} status: ${callStatus}`);

  let postCallAction = '';
  let templateName = '';

  if (callStatus === 'ANSWERED' || callStatus === 'COMPLETED') {
    postCallAction = 'SEND_CONSULTATION_OFFER';
    templateName = 'loan_consultation_offer';
    if (sendWhatsAppFn && phone) {
      await sendWhatsAppFn(
        phone,
        '🌟 Thank you for speaking with AVANI LOAN SERVICES! Here is your exclusive Loan Consultation Offer link: https://www.avanifinserv.com/consultation',
        templateName,
        leadId,
        correlationId
      );
    }
  } else {
    // NO_ANSWER / FAILED / BUSY
    postCallAction = 'SEND_INTRO_V2';
    templateName = 'avani_loan_intro_v2';
    if (sendWhatsAppFn && phone) {
      await sendWhatsAppFn(
        phone,
        '👋 We tried calling you from AVANI LOAN SERVICES regarding your loan enquiry. Reply to this chat to continue instantly on WhatsApp!',
        templateName,
        leadId,
        correlationId
      );
    }
  }

  await recordProviderAttempt({
    provider: 'OMNIDM',
    operation: 'POST_CALL_ROUTING',
    leadId,
    correlationId,
    testRunId,
    providerCallId,
    status: callStatus === 'ANSWERED' || callStatus === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
    responsePayload: { callStatus, postCallAction, templateName }
  });

  return {
    leadId,
    correlationId,
    providerCallId,
    callStatus,
    postCallAction,
    templateName,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  OMNIDM_SYSTEM_PROMPT,
  initiateOmnidmCall,
  processOmnidmCallback
};
