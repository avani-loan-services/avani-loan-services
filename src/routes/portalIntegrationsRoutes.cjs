// src/routes/portalIntegrationsRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Unified Ecosystem Integration & Workflow API Routes
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const express = require('express');
const router = express.Router();
const { requirePortalAuth, requirePortalCsrf, requireRole } = require('../middleware/portalAuthMiddleware.cjs');
const db = require('../models/portalDatabase.cjs');
const registry = require('../services/ecosystemIntegrationRegistry.cjs');
const { verifyServiceTokenAndRequest } = require('../services/serviceAuthGuard.cjs');

// Allows either authenticated Portal User OR signed S2S caller (svc-ai-crm, svc-loan-agents, svc-ai-calling)
async function requirePortalOrServiceAuth(req, res, next) {
  if (req.headers['x-service-auth']) {
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});
    const verified = verifyServiceTokenAndRequest({
      authHeader: req.headers['x-service-auth'],
      serviceIdHeader: req.headers['x-service-id'],
      timestampHeader: req.headers['x-service-timestamp'],
      signatureHeader: req.headers['x-service-signature'],
      rawBody,
      expectedAudience: 'svc-loan-api'
    });
    if (!verified.ok) {
      return res.status(verified.status || 401).json({
        success: false,
        code: verified.code,
        message: verified.error
      });
    }
    req.serviceCaller = { serviceId: verified.serviceId, keyId: verified.keyId, jti: verified.claims.jti };
    return next();
  }
  return requirePortalAuth(req, res, () => requirePortalCsrf(req, res, () => {
    return requireRole('Super Administrator', 'Administrator', 'Sales Manager', 'Sales Executive')(req, res, next);
  }));
}

// GET /api/portal/integrations
router.get('/', requirePortalAuth, (req, res) => {
  return res.json({
    success: true,
    mode: registry.getEffectiveMode(),
    providers: registry.listIntegrations(),
    workflows: registry.listWorkflows(),
    events: registry.crossProjectEvents.slice(-50),
    dlq: registry.gateway.deadLetterQueue.slice(-50),
    ledger: registry.gateway.auditLedger.slice(-50)
  });
});

// GET /api/portal/integrations/health
router.get('/health', requirePortalAuth, (req, res) => {
  const providers = registry.listIntegrations();
  return res.json({
    success: true,
    mode: registry.getEffectiveMode(),
    totalProviders: providers.length,
    enabledProviders: providers.filter(p => p.enabled).length,
    dlqPendingCount: registry.gateway.deadLetterQueue.filter(i => i.status !== 'RESOLVED').length,
    crossProjectEventCount: registry.crossProjectEvents.length,
    ledgerEntries: registry.gateway.auditLedger.length
  });
});

// POST /api/portal/integrations/cross-project/event
router.post('/cross-project/event', requirePortalOrServiceAuth, async (req, res) => {
  const { eventType, payload = {}, correlationId = null } = req.body || {};
  if (!eventType) {
    return res.status(400).json({ success: false, message: 'eventType is required.' });
  }
  const actor = req.serviceCaller ? `s2s:${req.serviceCaller.serviceId}` : (req.portalUser && req.portalUser.username) || 'unknown';
  const result = registry.syncCrossProjectEvent(eventType, {
    ...payload,
    ...(req.serviceCaller && !payload.sourceProject ? { sourceProject: req.serviceCaller.serviceId } : {})
  }, correlationId || req.headers['x-correlation-id'] || null);
  await db.appendAuditLog({
    action: 'CROSS_PROJECT_EVENT_SYNC',
    actor,
    eventType,
    correlationId: result.correlationId,
    status: result.status
  }).catch(() => {});
  return res.status(result.status || 200).json(result);
});

// POST /api/portal/integrations/s2s/dispatch (Authenticated Project 1 -> Projects 2/3/4)
router.post('/s2s/dispatch', requirePortalAuth, requirePortalCsrf, requireRole('Super Administrator', 'Administrator', 'Sales Manager'), async (req, res) => {
  const { targetProjectId, eventType, payload = {}, correlationId = null, idempotencyKey = null, targetUrl = null } = req.body || {};
  if (!targetProjectId || !eventType) {
    return res.status(400).json({ success: false, message: 'targetProjectId and eventType are required.' });
  }
  const result = await registry.dispatchToConnectedService({
    targetProjectId,
    eventType,
    payload,
    correlationId,
    idempotencyKey,
    targetUrl
  });
  await db.appendAuditLog({
    action: 'CROSS_PROJECT_S2S_DISPATCH',
    actor: req.portalUser.username,
    targetProjectId,
    eventType,
    correlationId: result.correlationId,
    status: result.status
  }).catch(() => {});
  return res.status(result.status || 200).json(result);
});

// POST /api/portal/integrations/:providerId/test-connection
router.post('/:providerId/test-connection', requirePortalAuth, requirePortalCsrf, requireRole('Super Administrator', 'Administrator'), async (req, res) => {
  const result = await registry.testProviderConnection(req.params.providerId);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Integration provider not found.' });
  }
  await db.appendAuditLog({
    action: 'INTEGRATION_TEST_CONNECTION',
    actor: req.portalUser.username,
    providerId: req.params.providerId,
    success: result.success
  }).catch(() => {});
  return res.json(result);
});

// POST /api/portal/integrations/:providerId/toggle
router.post('/:providerId/toggle', requirePortalAuth, requirePortalCsrf, requireRole('Super Administrator', 'Administrator'), async (req, res) => {
  const { enabled } = req.body || {};
  const updated = registry.toggleProvider(req.params.providerId, enabled);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Integration provider not found.' });
  }
  await db.appendAuditLog({
    action: 'INTEGRATION_TOGGLE',
    actor: req.portalUser.username,
    providerId: req.params.providerId,
    enabled: updated.enabled
  }).catch(() => {});
  return res.json({ success: true, provider: updated });
});

// POST /api/portal/integrations/workflows/:workflowId/toggle
router.post('/workflows/:workflowId/toggle', requirePortalAuth, requirePortalCsrf, requireRole('Super Administrator', 'Administrator'), async (req, res) => {
  const { enabled } = req.body || {};
  const updated = registry.toggleWorkflow(req.params.workflowId, enabled);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Workflow not found.' });
  }
  await db.appendAuditLog({
    action: 'WORKFLOW_TOGGLE',
    actor: req.portalUser.username,
    workflowId: req.params.workflowId,
    enabled: updated.enabled
  }).catch(() => {});
  return res.json({ success: true, workflow: updated });
});

// POST /api/portal/integrations/dlq/:dlqId/replay
router.post('/dlq/:dlqId/replay', requirePortalAuth, requirePortalCsrf, requireRole('Super Administrator', 'Administrator'), async (req, res) => {
  try {
    const result = await registry.gateway.replayDLQ(req.params.dlqId, async payload => ({
      replayed: true,
      mode: registry.getEffectiveMode(),
      payloadSummary: payload ? Object.keys(payload) : []
    }));
    await db.appendAuditLog({
      action: 'INTEGRATION_DLQ_REPLAY',
      actor: req.portalUser.username,
      dlqId: req.params.dlqId,
      success: result.success
    }).catch(() => {});
    return res.json(result);
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
