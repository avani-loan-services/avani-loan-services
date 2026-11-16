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
router.post('/cross-project/event', requirePortalAuth, requirePortalCsrf, requireRole('Super Administrator', 'Administrator', 'Sales Manager', 'Sales Executive'), async (req, res) => {
  const { eventType, payload = {}, correlationId = null } = req.body || {};
  if (!eventType) {
    return res.status(400).json({ success: false, message: 'eventType is required.' });
  }
  const result = registry.syncCrossProjectEvent(eventType, payload, correlationId);
  await db.appendAuditLog({
    action: 'CROSS_PROJECT_EVENT_SYNC',
    actor: req.portalUser.username,
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
