const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { syncToCrm } = require('../services/crmService.cjs');
const { verifyHubSpotWebhookRequest } = require('../utils/hubspotSignature.cjs');
const { registerWebhookEvent } = require('../models/WebhookInbox.cjs');

// Dedicated rate limiter for inbound HubSpot webhooks (120 req/min per IP)
const hubspotWebhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, error: 'Rate limit exceeded for HubSpot webhook endpoint' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Existing Outbound CRM Sync Route
 * AVANI LOAN SERVICES -> HubSpot
 * Preserved exactly as required
 */
router.post('/sync', async (req, res) => {
  try {
    await syncToCrm(req.body);
    res.json({ success: true, message: 'Synced to CRM' });
  } catch (error) {
    console.error('[CRM Route] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
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

/**
 * Inbound HubSpot Webhook Receiver
 * Route: POST /api/crm/hubspot/webhook
 * Public URL: https://www.avanifinserv.com/api/crm/hubspot/webhook
 *
 * Security Controls:
 * 1. Rate Limiting: 120 req/min
 * 2. Signature Version 3 validation (HMAC-SHA256 with HUBSPOT_CLIENT_SECRET)
 * 3. Timestamp replay protection (5-minute window)
 * 4. Constant-time signature comparison (timing-safe)
 * 5. Event schema validation
 * 6. Idempotency & deduplication via WebhookInbox
 * 7. Prompt HTTP 200 acknowledgement
 */
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

    // Validate minimum required metadata on all events in batch
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
    }

    // 3. Process Events & Deduplicate Idempotently
    const results = [];
    let duplicateCount = 0;
    let newCount = 0;

    for (const evt of events) {
      const dedupeId = `hs_evt_${evt.eventId}`;

      // Atomic deduplication check via WebhookInbox
      const { isDuplicate } = await registerWebhookEvent(dedupeId, 'HUBSPOT', evt);

      if (isDuplicate) {
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
