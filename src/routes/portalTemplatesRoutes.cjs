// src/routes/portalTemplatesRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE PORTAL TEMPLATES API (Phase 5.3.23)
// Server-Side Authentication & RBAC Enforced | Mock-Mode Safe (No Live Sends)
// Genuine Meta WABA Status Verification & Template Lifecycle Management
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission } = require('../middleware/portalAuthMiddleware.cjs');
const {
  getMetaConnectionStatus,
  syncTemplatesWithDatabase,
  simulateTestDispatch
} = require('../services/metaWhatsAppTemplateService.cjs');

// ── 1. GET /api/portal/templates ──
// List templates with filtering (channel, category, status, language, search) and sorting
router.get('/', requirePortalAuth, requirePermission('crm:read'), (req, res) => {
  try {
    const { channel, category, status, language, search, sort } = req.query;
    let templates = db.getAll('portal_templates');

    if (channel && channel !== 'ALL') {
      templates = templates.filter(t => t.channel && t.channel.toLowerCase() === channel.toLowerCase());
    }
    if (category && category !== 'ALL') {
      templates = templates.filter(t => t.category && t.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'ALL') {
      templates = templates.filter(t => {
        const st = (t.meta_approval_status || '').toUpperCase();
        const qSt = status.toUpperCase();
        if (qSt === 'APPROVED') return st === 'APPROVED' && t.synced_from_meta === true;
        if (qSt === 'NOT_VERIFIED' || qSt === 'LOCAL_DRAFT') {
          return ['LOCAL_DRAFT', 'NOT_VERIFIED', 'UNVERIFIED_LOCAL_TEMPLATE', 'UNKNOWN'].includes(st) || (t.channel === 'WhatsApp' && !t.synced_from_meta);
        }
        return st === qSt;
      });
    }
    if (language && language !== 'ALL') {
      templates = templates.filter(t => (t.language || 'en').toLowerCase() === language.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase().trim();
      templates = templates.filter(t =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.display_name && t.display_name.toLowerCase().includes(q)) ||
        (t.body && t.body.toLowerCase().includes(q)) ||
        (t.template_id && t.template_id.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'name_asc') {
      templates.sort((a, b) => (a.display_name || a.name || '').localeCompare(b.display_name || b.name || ''));
    } else if (sort === 'name_desc') {
      templates.sort((a, b) => (b.display_name || b.name || '').localeCompare(a.display_name || a.name || ''));
    } else if (sort === 'updated_desc') {
      templates.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
    }

    return res.json({
      success: true,
      total: templates.length,
      provider_mode: process.env.PROVIDER_MODE || 'mock',
      data: templates
    });
  } catch (err) {
    console.error('[PortalTemplates] List error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve templates' });
  }
});

// ── 2. GET /api/portal/templates/meta-status ──
// Genuine Meta WhatsApp Cloud API connection and template status overview
router.get('/meta-status', requirePortalAuth, requirePermission('crm:read'), async (req, res) => {
  try {
    const statusData = await getMetaConnectionStatus();
    return res.json({
      success: true,
      data: statusData
    });
  } catch (err) {
    console.error('[PortalTemplates] Meta status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to check Meta status' });
  }
});

// ── 3. POST /api/portal/templates/sync-meta ──
// Synchronize templates from Meta WhatsApp Business Account (never fabricates success)
router.post('/sync-meta', requirePortalAuth, requirePermission('automation:write'), async (req, res) => {
  try {
    const syncOutcome = await syncTemplatesWithDatabase();
    db.logAudit(
      req.portalUser.userId,
      'TEMPLATES',
      'META_TEMPLATE_SYNC_ATTEMPT',
      { synced: syncOutcome.synced, count: syncOutcome.count, reason: syncOutcome.reason || 'OK' },
      req.ip
    );

    return res.json({
      success: true,
      synced: syncOutcome.synced,
      data: syncOutcome
    });
  } catch (err) {
    console.error('[PortalTemplates] Sync error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to execute Meta template synchronization' });
  }
});

// ── 4. POST /api/portal/templates/preview ──
// Generate preview with variable replacement and missing variable validation
router.post('/preview', requirePortalAuth, requirePermission('crm:read'), (req, res) => {
  try {
    const { template_id, body: rawBody, header: rawHeader, footer: rawFooter, sample_values = {} } = req.body;
    let body = rawBody;
    let header = rawHeader;
    let footer = rawFooter;
    let requiredVars = [];

    if (template_id) {
      const tpl = db.getById('portal_templates', template_id);
      if (tpl) {
        body = body || tpl.body;
        header = header !== undefined ? header : tpl.header;
        footer = footer !== undefined ? footer : tpl.footer;
        requiredVars = Array.isArray(tpl.variables) ? tpl.variables : [];
      }
    }

    if (!body) {
      return res.status(400).json({ success: false, message: 'Body text is required for preview.' });
    }

    // Extract placeholders from body & header
    const matches = `${header || ''} ${body}`.match(/\{\{([0-9a-zA-Z_]+)\}\}/g) || [];
    const extractedVars = [...new Set(matches.map(m => m.replace(/[\{\}]/g, '')))];
    const allVars = requiredVars.length > 0 ? requiredVars : extractedVars;

    const missingVariables = [];
    let renderedBody = body;
    let renderedHeader = header || '';

    allVars.forEach((vKey, idx) => {
      const val = sample_values[vKey] !== undefined ? sample_values[vKey] : sample_values[String(idx + 1)];
      if (val === undefined || String(val).trim() === '') {
        missingVariables.push(vKey);
      } else {
        const reg = new RegExp(`\\{\\{${vKey}\\}\\}|\\{\\{${idx + 1}\\}\\}`, 'g');
        renderedBody = renderedBody.replace(reg, val);
        renderedHeader = renderedHeader.replace(reg, val);
      }
    });

    // Also replace any remaining sample_values keys
    Object.keys(sample_values).forEach((key, idx) => {
      if (sample_values[key]) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}|\\{\\{${idx + 1}\\}\\}`, 'g');
        renderedBody = renderedBody.replace(placeholder, sample_values[key]);
        renderedHeader = renderedHeader.replace(placeholder, sample_values[key]);
      }
    });

    return res.json({
      success: true,
      valid: missingVariables.length === 0,
      missing_variables: missingVariables,
      preview: {
        header: renderedHeader,
        renderedBody,
        footer: footer || '',
        sample_values
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate preview' });
  }
});

// ── 5. POST /api/portal/templates/send-test ──
// Controlled individual template message test workflow (strictly mock-mode safe)
router.post('/send-test', requirePortalAuth, requirePermission('automation:write'), async (req, res) => {
  try {
    const { template_id, recipient_phone, language, variables } = req.body;
    const result = await simulateTestDispatch({
      templateId: template_id,
      recipientPhone: recipient_phone,
      language: language || 'en',
      variables: variables || {},
      user: req.portalUser.username || req.portalUser.userId
    });

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('[PortalTemplates] Send test error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process test message workflow' });
  }
});

// ── 6. GET /api/portal/templates/:id ──
// Get individual template by ID
router.get('/:id', requirePortalAuth, requirePermission('crm:read'), (req, res) => {
  try {
    const template = db.getById('portal_templates', req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.json({ success: true, data: template });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving template' });
  }
});

// ── 7. POST /api/portal/templates ──
// Create new local template draft
router.post('/', requirePortalAuth, requirePermission('automation:write'), async (req, res) => {
  try {
    const { name, display_name, channel, category, language, body, header, footer, buttons, variables, variable_labels, sample_values } = req.body;
    if (!name || !channel || !body) {
      return res.status(400).json({ success: false, message: 'Name, channel, and body are required fields.' });
    }

    const templateId = `TPL-${channel.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;
    const matches = body.match(/\{\{([0-9a-zA-Z_]+)\}\}/g) || [];
    const extractedVars = [...new Set(matches.map(m => m.replace(/[\{\}]/g, '')))];

    const newTemplate = {
      template_id: templateId,
      meta_id: null,
      name: name.trim().replace(/\s+/g, '_').toLowerCase(),
      display_name: (display_name || name).trim(),
      channel: channel || 'WhatsApp',
      category: category || 'UTILITY',
      language: language || 'en',
      header: header || '',
      body: body.trim(),
      footer: footer || 'Avani Loan Services | RBI Registered NBFC & Banking Partner Desk',
      buttons: Array.isArray(buttons) ? buttons : [],
      variables: Array.isArray(variables) && variables.length > 0 ? variables : extractedVars,
      variable_labels: Array.isArray(variable_labels) ? variable_labels : [],
      sample_values: sample_values || {},
      meta_approval_status: channel === 'WhatsApp' ? 'LOCAL_DRAFT' : `N/A (${channel})`,
      synced_from_meta: false,
      quality_score: 'UNKNOWN',
      verification_note: channel === 'WhatsApp' ? 'Local draft — must be submitted to Meta Business Suite for WABA review before live use.' : 'Internal channel blueprint.',
      local_status: 'Active',
      created_by: req.portalUser.username || req.portalUser.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.upsertAsync('portal_templates', 'template_id', newTemplate);
    db.logAudit(req.portalUser.userId, 'TEMPLATES', 'CREATE_TEMPLATE_DRAFT', { templateId, name: newTemplate.name, channel }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Local template draft created successfully.',
      data: newTemplate
    });
  } catch (err) {
    console.error('[PortalTemplates] Create error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

// ── 8. PUT /api/portal/templates/:id ──
// Update local draft template (blocks direct mutation of verified Meta-approved templates)
router.put('/:id', requirePortalAuth, requirePermission('automation:write'), async (req, res) => {
  try {
    const templateId = req.params.id;
    const existing = db.getById('portal_templates', templateId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Critical safeguard: Approved Meta templates cannot be directly modified in-place
    if (existing.synced_from_meta === true && existing.meta_approval_status === 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Verified Meta-Approved templates cannot be modified directly. Duplicate as a local draft to create a new version.'
      });
    }

    const nextBody = typeof req.body.body === 'string' ? req.body.body.trim() : existing.body;
    const matches = (nextBody || '').match(/\{\{([0-9a-zA-Z_]+)\}\}/g) || [];
    const extractedVars = [...new Set(matches.map(m => m.replace(/[\{\}]/g, '')))];

    const updated = {
      ...existing,
      ...req.body,
      template_id: templateId,
      meta_id: existing.meta_id || null,
      created_at: existing.created_at,
      created_by: existing.created_by,
      body: nextBody,
      variables: Array.isArray(req.body.variables) ? req.body.variables : extractedVars,
      synced_from_meta: false,
      updated_at: new Date().toISOString()
    };

    if (updated.channel === 'WhatsApp') {
      updated.meta_approval_status = 'LOCAL_DRAFT';
    }

    await db.upsertAsync('portal_templates', 'template_id', updated);
    db.logAudit(req.portalUser.userId, 'TEMPLATES', 'UPDATE_TEMPLATE_DRAFT', { templateId, name: updated.name }, req.ip);

    return res.json({
      success: true,
      message: 'Local template draft updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('[PortalTemplates] Update error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

// ── 9. POST /api/portal/templates/:id/duplicate ──
// Duplicate existing template as a clearly labelled Local Draft
router.post('/:id/duplicate', requirePortalAuth, requirePermission('automation:write'), async (req, res) => {
  try {
    const templateId = req.params.id;
    const existing = db.getById('portal_templates', templateId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Source template not found' });
    }

    const newId = `TPL-${existing.channel.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;
    const duplicated = {
      ...existing,
      template_id: newId,
      meta_id: null,
      name: `${existing.name}_draft_${Date.now().toString(36).toLowerCase().slice(-4)}`,
      display_name: `${existing.display_name || existing.name} (Local Draft)`,
      meta_approval_status: existing.channel === 'WhatsApp' ? 'LOCAL_DRAFT' : existing.meta_approval_status,
      synced_from_meta: false,
      verification_note: 'Duplicated as a Local Draft — requires submission and approval in Meta Business Suite before live WABA dispatch.',
      created_by: req.portalUser.username || req.portalUser.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.upsertAsync('portal_templates', 'template_id', duplicated);
    db.logAudit(req.portalUser.userId, 'TEMPLATES', 'DUPLICATE_TEMPLATE_DRAFT', { sourceId: templateId, newId }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Template duplicated as a Local Draft.',
      data: duplicated
    });
  } catch (err) {
    console.error('[PortalTemplates] Duplicate error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to duplicate template' });
  }
});

module.exports = router;
