// src/routes/crm.cjs
// ─────────────────────────────────────────────────────────────────
// Comprehensive Express Router for AVANI AI CRM Pipeline & Operations
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { syncToCrm } = require('../services/crmService.cjs');
const { verifyHubSpotWebhookRequest } = require('../utils/hubspotSignature.cjs');
const WebhookInbox = require('../models/WebhookInbox.cjs');
const {
  getDashboardMetrics,
  queryLeads,
  transitionLeadStage,
  scheduleFollowUp,
  completeFollowUp
} = require('../services/crmPipelineEngine.cjs');
const { getLead, processIncomingLead, updateLead } = require('../services/centralLeadEngine.cjs');
const { evaluateQualification, getQualificationSchema } = require('../services/loanQualificationEngine.cjs');
const { generateChecklistForLead, reviewDocument } = require('../services/documentWorkflowEngine.cjs');
const { sendJourneyTemplate, handleCustomerEvent } = require('../services/whatsappJourneyEngine.cjs');
const { runVoiceQualificationWorkflow } = require('../services/aiVoiceWorkflowEngine.cjs');

// ── 1. GET /api/crm/dashboard ────────────────────────────────────
router.get('/dashboard', (req, res) => {
  try {
    const metrics = getDashboardMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    console.error('[CRM Route] Dashboard error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. GET /api/crm/leads (Query, Filter, Search, Paginate) ──────
router.get('/leads', (req, res) => {
  try {
    const result = queryLeads(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[CRM Route] Leads query error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. GET /api/crm/leads/:id (Lead Details) ─────────────────────
router.get('/leads/:id', (req, res) => {
  try {
    const lead = getLead(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Attach dynamic checklist if not already present
    if (!lead.requiredDocuments || lead.requiredDocuments.length === 0) {
      lead.requiredDocuments = generateChecklistForLead(lead.loanProduct, lead.employmentType, lead.profession);
    }

    // Attach qualification schema
    const schema = getQualificationSchema(lead.loanProduct);

    res.json({
      success: true,
      lead,
      qualificationSchema: schema
    });
  } catch (err) {
    console.error('[CRM Route] Lead details error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. POST /api/crm/leads (Create / Manual Ingest) ──────────────
router.post('/leads', (req, res) => {
  try {
    const payload = {
      ...req.body,
      source: req.body.source || 'MANUAL_CRM',
      createdBy: req.body.createdBy || 'Loan Advisor'
    };
    const result = processIncomingLead(payload);
    res.status(result.isDuplicate ? 200 : 201).json(result);
  } catch (err) {
    console.error('[CRM Route] Create lead error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. POST /api/crm/leads/:id/transition (Pipeline Transition) ──
router.post('/leads/:id/transition', (req, res) => {
  try {
    const targetStage = req.body.targetStage || req.body.toStage;
    const reason = req.body.reason || req.body.note;
    const actor = req.body.actor;
    const result = transitionLeadStage(req.params.id, targetStage, { reason, actor });
    if (!result.success) {
      const statusCode = result.error && result.error.includes('not found') ? 404 : 400;
      return res.status(statusCode).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Transition error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 6. POST /api/crm/leads/:id/qualify (Run Qualification) ───────
router.post('/leads/:id/qualify', (req, res) => {
  try {
    const lead = getLead(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    const answers = req.body.answers || req.body;
    const evaluation = evaluateQualification(lead.loanProduct, answers);

    const updated = updateLead(lead.leadId, {
      qualificationStatus: evaluation.qualificationStatus,
      qualificationAnswers: answers,
      leadScore: evaluation.leadScore,
      leadScoreGrade: evaluation.leadScoreGrade
    }, req.body.actor || 'SYSTEM');

    res.json({
      success: true,
      leadId: lead.leadId,
      evaluation,
      lead: updated
    });
  } catch (err) {
    console.error('[CRM Route] Qualify error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 7. POST /api/crm/leads/:id/followups (Schedule Follow-Up) ────
router.post('/leads/:id/followups', (req, res) => {
  try {
    const result = scheduleFollowUp(req.params.id, req.body);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Schedule follow-up error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 8. PATCH /api/crm/leads/:id/followups/:followupId (Complete) ─
router.patch('/leads/:id/followups/:followupId', (req, res) => {
  try {
    const { outcome, notes } = req.body;
    const result = completeFollowUp(req.params.id, req.params.followupId, outcome, notes);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Complete follow-up error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 9. POST /api/crm/leads/:id/documents/:docId/review ───────────
router.post('/leads/:id/documents/:docId/review', (req, res) => {
  try {
    const { decision, reviewerNotes, reviewer } = req.body;
    const result = reviewDocument(req.params.id, req.params.docId, decision, reviewerNotes, reviewer);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Document review error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 10. POST /api/crm/leads/:id/whatsapp-journey (Trigger Step) ──
router.post('/leads/:id/whatsapp-journey', async (req, res) => {
  try {
    const { templateKey, customVars } = req.body;
    const result = await sendJourneyTemplate(req.params.id, templateKey, customVars);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] WhatsApp journey error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 11. POST /api/crm/leads/:id/voice-workflow (Run AI Voice) ────
router.post('/leads/:id/voice-workflow', async (req, res) => {
  try {
    const { simulatedResponses } = req.body;
    const result = await runVoiceQualificationWorkflow(req.params.id, simulatedResponses);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Voice workflow error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 12. POST /api/crm/sync (Legacy Sync Endpoint) ────────────────
router.post('/sync', async (req, res) => {
  try {
    await syncToCrm(req.body);
    res.json({ success: true, message: 'Synced to CRM' });
  } catch (error) {
    console.error('[CRM Route] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dedicated rate limiter for inbound HubSpot webhooks (120 req/min per IP)
const hubspotWebhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, error: 'Rate limit exceeded for HubSpot webhook endpoint' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Downstream CRM Event Dispatcher (Extension Point)
 * Safely processes normalized, authenticated, and deduplicated inbound events.
 * Strict minimum data principle: logs only safe metadata, never secrets or raw PII.
 */
async function dispatchHubSpotEvent(evt) {
  // Safe metadata logging
  console.log(
    `[HubSpotWebhook] Event ${evt.eventId} | Sub: ${evt.subscriptionType} | Portal: ${evt.portalId} | Object: ${evt.objectId || 'N/A'}`
  );

  // Extension hook for future business logic (e.g., stage sync, contact property update)
  // No customer-facing side-effects are triggered automatically in this phase.
  return {
    eventId: evt.eventId,
    subscriptionType: evt.subscriptionType,
    objectId: evt.objectId,
    propertyName: evt.propertyName || null,
    propertyValue: evt.propertyValue !== undefined ? evt.propertyValue : null,
    changeSource: evt.changeSource || null,
    occurredAt: evt.occurredAt || null,
    ingestedAt: new Date().toISOString()
  };
}

// ── 13. POST /api/crm/hubspot/webhook (Inbound Webhook Receiver) ─
router.post('/hubspot/webhook', hubspotWebhookLimiter, async (req, res) => {
  try {
    // 1. Authenticate Request Signature Version 3 & Timestamp
    const authResult = verifyHubSpotWebhookRequest(req);
    if (!authResult.success) {
      return res.status(authResult.status || 401).json({
        success: false,
        code: authResult.code,
        error: authResult.error
      });
    }

    // 2. Validate Payload Structure
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        success: false,
        code: 'MALFORMED_PAYLOAD',
        error: 'Webhook payload must be a valid JSON array or object'
      });
    }

    const events = Array.isArray(payload) ? payload : [payload];
    if (events.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'EMPTY_PAYLOAD',
        error: 'Webhook payload contains no events'
      });
    }

    const expectedPortalId = String(process.env.HUBSPOT_PORTAL_ID || '244236573');

    // Validate minimum required metadata and portal isolation on all events
    for (const evt of events) {
      if (!evt || typeof evt !== 'object') {
        return res.status(400).json({
          success: false,
          code: 'INVALID_EVENT_FORMAT',
          error: 'Each item in event payload must be an object'
        });
      }

      if (evt.eventId === undefined || evt.eventId === null || evt.eventId === '') {
        return res.status(400).json({
          success: false,
          code: 'MISSING_EVENT_METADATA',
          error: 'Missing required eventId metadata'
        });
      }

      if (!evt.subscriptionType || typeof evt.subscriptionType !== 'string') {
        return res.status(400).json({
          success: false,
          code: 'MISSING_EVENT_METADATA',
          error: 'Missing required subscriptionType metadata'
        });
      }

      if (evt.portalId === undefined || evt.portalId === null || evt.portalId === '') {
        return res.status(400).json({
          success: false,
          code: 'MISSING_EVENT_METADATA',
          error: 'Missing required portalId metadata'
        });
      }

      // Tenant isolation: reject unexpected portal IDs
      if (String(evt.portalId) !== expectedPortalId) {
        return res.status(403).json({
          success: false,
          code: 'UNAUTHORIZED_PORTAL',
          error: `Event rejected: unauthorized portal ID ${evt.portalId}`
        });
      }
    }

    // 3. Process Events & Deduplicate Idempotently
    const results = [];
    let duplicateCount = 0;
    let newCount = 0;

    for (const evt of events) {
      const dedupeId = `hs_evt_${evt.eventId}`;

      // Durable idempotent registration via WebhookInbox
      let regResult;
      try {
        regResult = await WebhookInbox.registerWebhookEvent(dedupeId, 'HUBSPOT', evt);
      } catch (persistErr) {
        console.error(`[HubSpotWebhook] Persistence failure for event ${evt.eventId}:`, persistErr.message);
        return res.status(500).json({
          success: false,
          code: 'INTERNAL_PERSISTENCE_FAILURE',
          error: 'Failed to record event in durable inbox'
        });
      }

      if (regResult.isDuplicate) {
        duplicateCount++;
        results.push({
          eventId: evt.eventId,
          status: 'DUPLICATE_SUPPRESSED',
          subscriptionType: evt.subscriptionType
        });
      } else {
        newCount++;
        // Extension point execution
        const dispatched = await dispatchHubSpotEvent(evt);
        results.push({
          eventId: evt.eventId,
          status: 'PROCESSED',
          subscriptionType: evt.subscriptionType,
          dispatched
        });
      }
    }

    // 4. Prompt Acknowledgement
    return res.status(200).json({
      success: true,
      message: 'HubSpot webhook batch processed successfully',
      batchSize: events.length,
      newEvents: newCount,
      duplicatesSuppressed: duplicateCount,
      results
    });
  } catch (error) {
    // Fail closed: never leak stack traces, secrets, or internal errors
    console.error('[HubSpotWebhook] Processing error:', error.message);
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      error: 'Internal webhook processing error'
    });
  }
});

module.exports = router;
