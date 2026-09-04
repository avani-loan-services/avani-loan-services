// src/routes/whatsappWebhookController.cjs
// ─────────────────────────────────────────────────────────────────
// Master Forensic Webhook Controller & State Machine Orchestrator
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { registerWebhookEvent, acquireLease, releaseLease } = require('../models/WebhookInbox.cjs');
const { findOrCreateLead, updateLeadState } = require('../models/Lead.cjs');
const { getOrCreateConversation, transitionConversationState } = require('../models/ConversationState.cjs');
const { processCustomerMessageWithAI } = require('../services/avaniAiAgent.cjs');
const { generateDocumentChecklist } = require('../services/documentRulesEngine.cjs');
const { dispatchOutboundWhatsApp, updateMessageStatus } = require('../services/whatsappProviderEngine.cjs');
const { initiateOmnidmCall } = require('../services/omnidmAgent.cjs');
const { syncLeadToHubSpot, syncLeadToGoogleSheets, syncLeadToZapier } = require('../services/crmSyncEngine.cjs');
const { workerAuthMiddleware } = require('../middleware/workerAuth.cjs');

// Counter metrics for forensic verification
const forensicCounters = {
  webhookReceived: 0,
  webhookInboxInsert: 0,
  duplicateSuppressed: 0,
  aiInvocationCount: 0,
  whatsappResponseCount: 0,
  omnidmCallCount: 0,
  hubspotSyncCount: 0,
  sheetsSyncCount: 0,
  zapierSyncCount: 0
};

function getForensicCounters() {
  return { ...forensicCounters };
}

function resetForensicCounters() {
  Object.keys(forensicCounters).forEach(k => forensicCounters[k] = 0);
}

// GET Verification Endpoint
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'avani_loan_verify_token_1356';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta Webhook Verification] SUCCESS');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// POST Inbound Event Endpoint
router.post('/webhook', async (req, res) => {
  forensicCounters.webhookReceived++;
  const body = req.body;

  try {
    // 1. Extract Event ID & Type
    let eventId = body.eventId;
    let messageId = body.messageId || body.id;
    let fromPhone = body.phone || body.from;
    let messageText = body.text || body.message || '';
    let isStatusUpdate = false;
    let statusValue = '';

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.statuses?.[0]) {
        isStatusUpdate = true;
        const statusObj = value.statuses[0];
        messageId = statusObj.id;
        statusValue = statusObj.status; // sent, delivered, read, failed
        eventId = `META_STATUS_${messageId}_${statusValue.toUpperCase()}`;
      } else if (value?.messages?.[0]) {
        const msg = value.messages[0];
        messageId = msg.id;
        fromPhone = msg.from;
        messageText = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || 'Hi';
        eventId = `META_INBOUND_${messageId}`;
      }
    }

    if (!eventId) {
      eventId = `GENERIC_EVT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    // 2. Register Webhook Inbox Event (Atomic Deduplication)
    const { isDuplicate, event } = await registerWebhookEvent(eventId, 'META_WHATSAPP', body);

    if (isDuplicate) {
      forensicCounters.duplicateSuppressed++;
      console.log(`[DEDUPLICATION PASS] Duplicate event ${eventId} suppressed. HTTP 200 returned. (Secondary actions: 0)`);
      return res.status(200).json({
        status: 'OK',
        duplicateSuppressed: true,
        message: 'Duplicate event received and suppressed.'
      });
    }

    forensicCounters.webhookInboxInsert++;

    // 3. Status Update Handling (SENT, DELIVERED, READ)
    if (isStatusUpdate) {
      updateMessageStatus(messageId, statusValue);
      return res.status(200).send('EVENT_RECEIVED');
    }

    // 4. Atomic Lease Acquisition (5 minutes)
    const leaseAcquired = await acquireLease(eventId);
    if (!leaseAcquired) {
      console.warn(`[WorkerLease] Failed to acquire lease for ${eventId}`);
      return res.status(200).send('LEASE_BUSY');
    }

    // 5. Canonical Lead Creation / Retrieval (Idempotent)
    const testRunId = body.testRunId || `AVANI-E2E-${Date.now()}`;
    const correlationId = body.correlationId || `CORR-${Date.now()}`;

    const leadResult = await findOrCreateLead({
      mobile: fromPhone,
      source: 'WHATSAPP_WEBHOOK',
      campaign: 'ALS_FORENSIC_VALIDATION_2026',
      correlationId,
      testRunId
    });

    const lead = leadResult.lead;
    const leadId = lead.leadId;

    // 6. Conversation State Machine Retrieval
    const conversation = await getOrCreateConversation(fromPhone, leadId, correlationId, testRunId);

    // 7. AVANI AI AGENT Invocation (Gemini / Multilingual)
    forensicCounters.aiInvocationCount++;
    const aiResult = await processCustomerMessageWithAI(messageText, conversation);
    const extraction = aiResult.extraction;
    const detectedLang = extraction.detectedLanguage || conversation.language || 'Marathi';

    // 8. Workflow State Machine Transition
    let nextState = conversation.currentState;
    const patchData = { language: detectedLang };

    if (extraction.extractedFields.fullName) patchData.fullName = extraction.extractedFields.fullName;
    if (extraction.extractedFields.profession) patchData.profession = extraction.extractedFields.profession;
    if (extraction.extractedFields.employmentType) patchData.employmentType = extraction.extractedFields.employmentType;
    if (extraction.extractedFields.monthlyIncome) patchData.monthlyIncome = extraction.extractedFields.monthlyIncome;
    if (extraction.extractedFields.loanProduct) patchData.loanProduct = extraction.extractedFields.loanProduct;
    if (extraction.extractedFields.loanAmount) patchData.loanAmount = extraction.extractedFields.loanAmount;

    // Determine state transition
    if (conversation.currentState === 'NEW_LEAD') {
      nextState = 'QUALIFICATION';
    }

    if (patchData.profession === 'DOCTOR' || patchData.loanProduct === 'DOCTOR_LOAN') {
      nextState = 'DOCUMENT_GUIDANCE';
    } else if (patchData.loanProduct) {
      nextState = 'DOCUMENT_GUIDANCE';
    }

    await transitionConversationState(fromPhone, nextState, patchData, {
      speaker: 'CUSTOMER',
      message: messageText
    });

    await updateLeadState(leadId, {
      currentWorkflowState: nextState,
      profession: patchData.profession || lead.profession,
      employmentType: patchData.employmentType || lead.employmentType,
      monthlyIncome: patchData.monthlyIncome || lead.monthlyIncome,
      loanProduct: patchData.loanProduct || lead.loanProduct,
      loanAmount: patchData.loanAmount || lead.loanAmount,
      language: detectedLang
    });

    // 9. Rules-based Document Checklist Generation
    const checklist = generateDocumentChecklist(
      patchData.employmentType || lead.employmentType,
      patchData.profession || lead.profession,
      patchData.loanProduct || lead.loanProduct,
      patchData.fullName || lead.fullName
    );

    // 10. Outbound WhatsApp Dispatch
    forensicCounters.whatsappResponseCount++;
    const outboundMsg = await dispatchOutboundWhatsApp({
      toPhone: fromPhone,
      messageText: checklist.checklistText,
      leadId,
      correlationId,
      testRunId
    });

    await transitionConversationState(fromPhone, 'DOCUMENTS_PENDING', {}, {
      speaker: 'AVANI_AI_AGENT',
      message: checklist.checklistText
    });

    // 11. OmniDM Voice Agent Trigger
    let omnidmResult = null;
    if (nextState === 'DOCUMENT_GUIDANCE' || nextState === 'DOCUMENTS_PENDING') {
      forensicCounters.omnidmCallCount++;
      omnidmResult = await initiateOmnidmCall({
        mobile: fromPhone,
        leadId,
        correlationId,
        testRunId,
        language: detectedLang
      });
    }

    // 12. Downstream CRM Sync (HubSpot, Google Sheets, Zapier)
    forensicCounters.hubspotSyncCount++;
    await syncLeadToHubSpot({ ...lead.toObject ? lead.toObject() : lead, ...patchData, leadId, correlationId, testRunId });

    forensicCounters.sheetsSyncCount++;
    await syncLeadToGoogleSheets({ ...lead.toObject ? lead.toObject() : lead, ...patchData, leadId, correlationId, testRunId });

    forensicCounters.zapierSyncCount++;
    await syncLeadToZapier({ ...lead.toObject ? lead.toObject() : lead, ...patchData, leadId, correlationId, testRunId }, eventId);

    // 13. Release Worker Lease
    await releaseLease(eventId, true);

    return res.status(200).json({
      status: 'SUCCESS',
      testRunId,
      leadId,
      correlationId,
      eventId,
      currentState: nextState,
      language: detectedLang,
      outboundMessageId: outboundMsg.providerMessageId,
      omnidmCallId: omnidmResult?.providerCallId || null
    });
  } catch (err) {
    console.error('[Master Controller Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = {
  router,
  getForensicCounters,
  resetForensicCounters
};
