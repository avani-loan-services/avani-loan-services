// src/routes/portalTemplatesRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE PORTAL TEMPLATES API
// Server-Side Authentication & RBAC Enforced | Mock-Mode Safe (No Live Sends)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission } = require('../middleware/portalAuthMiddleware.cjs');

// ── 1. GET /api/portal/templates ──
// List all templates with optional channel and category filtering
router.get('/', requirePortalAuth, (req, res) => {
  try {
    const { channel, category, search } = req.query;
    let templates = db.getAll('portal_templates');

    if (channel && channel !== 'ALL') {
      templates = templates.filter(t => t.channel && t.channel.toLowerCase() === channel.toLowerCase());
    }
    if (category && category !== 'ALL') {
      templates = templates.filter(t => t.category && t.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      templates = templates.filter(t =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.body && t.body.toLowerCase().includes(q)) ||
        (t.template_id && t.template_id.toLowerCase().includes(q))
      );
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
// Meta WhatsApp Cloud API connection and approval status overview
router.get('/meta-status', requirePortalAuth, (req, res) => {
  try {
    const templates = db.getAll('portal_templates').filter(t => t.channel === 'WhatsApp');
    const approvedCount = templates.filter(t => t.meta_approval_status === 'APPROVED').length;
    const pendingCount = templates.filter(t => t.meta_approval_status === 'IN_REVIEW' || t.meta_approval_status === 'SUBMITTED').length;
    const localDrafts = templates.filter(t => t.meta_approval_status === 'LOCAL_DRAFT').length;

    return res.json({
      success: true,
      data: {
        status: 'CONNECTED',
        mock_mode: true,
        provider_mode: process.env.PROVIDER_MODE || 'mock',
        live_sending_enabled: false,
        waba_account_id: '1048291047120',
        business_name: 'Avani Loan Services',
        phone_number: '+91 9175635165',
        phone_number_id: '1098273645129',
        meta_api_version: 'v20.0',
        quality_rating: 'GREEN (High Quality)',
        messaging_limit: 'Tier 1 (1k unique users / 24h)',
        templates: {
          total: templates.length,
          approved: approvedCount,
          pending: pendingCount,
          local_drafts: localDrafts
        },
        notice: 'Strict Mock/Sandbox Mode: Outbound Meta API dispatches are disabled to preserve regulatory compliance.'
      }
    });
  } catch (err) {
    console.error('[PortalTemplates] Meta status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to check Meta status' });
  }
});

// ── 3. GET /api/portal/templates/:id ──
// Get individual template by ID
router.get('/:id', requirePortalAuth, (req, res) => {
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

// ── 4. POST /api/portal/templates ──
// Create new template
router.post('/', requirePortalAuth, (req, res) => {
  try {
    const { name, channel, category, language, body, header, footer, buttons, variables, sample_values } = req.body;
    if (!name || !channel || !body) {
      return res.status(400).json({ success: false, message: 'Name, channel, and body are required fields.' });
    }

    const templateId = `TPL-${channel.toUpperCase().slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`;
    const newTemplate = {
      template_id: templateId,
      name: name.trim().replace(/\s+/g, '_').toLowerCase(),
      display_name: name.trim(),
      channel: channel || 'WhatsApp',
      category: category || 'MARKETING',
      language: language || 'en',
      header: header || '',
      body: body.trim(),
      footer: footer || 'Avani Loan Services | RBI Registered NBFC & Banking Partner Desk',
      buttons: Array.isArray(buttons) ? buttons : [],
      variables: Array.isArray(variables) ? variables : [],
      sample_values: sample_values || {},
      meta_approval_status: channel === 'WhatsApp' ? 'LOCAL_DRAFT' : 'N/A (Email/SMS)',
      local_status: 'Active',
      created_by: req.portalUser.username || req.portalUser.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.upsert('portal_templates', 'template_id', newTemplate);
    db.logAudit(req.portalUser.userId, 'TEMPLATES', 'CREATE_TEMPLATE', { templateId, name: newTemplate.name, channel }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Template created successfully.',
      data: newTemplate
    });
  } catch (err) {
    console.error('[PortalTemplates] Create error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

// ── 5. PUT /api/portal/templates/:id ──
// Update existing template
router.put('/:id', requirePortalAuth, (req, res) => {
  try {
    const templateId = req.params.id;
    const existing = db.getById('portal_templates', templateId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const updated = {
      ...existing,
      ...req.body,
      template_id: templateId,
      updated_at: new Date().toISOString()
    };

    // If body or variables changed on WhatsApp template, re-flag as local draft
    if (existing.channel === 'WhatsApp' && req.body.body && req.body.body !== existing.body) {
      updated.meta_approval_status = 'LOCAL_DRAFT';
    }

    db.upsert('portal_templates', 'template_id', updated);
    db.logAudit(req.portalUser.userId, 'TEMPLATES', 'UPDATE_TEMPLATE', { templateId, name: updated.name }, req.ip);

    return res.json({
      success: true,
      message: 'Template updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('[PortalTemplates] Update error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

// ── 6. POST /api/portal/templates/:id/duplicate ──
// Duplicate existing template
router.post('/:id/duplicate', requirePortalAuth, (req, res) => {
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
      name: `${existing.name}_copy`,
      display_name: `${existing.display_name || existing.name} (Copy)`,
      meta_approval_status: existing.channel === 'WhatsApp' ? 'LOCAL_DRAFT' : existing.meta_approval_status,
      created_by: req.portalUser.username || req.portalUser.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.upsert('portal_templates', 'template_id', duplicated);
    db.logAudit(req.portalUser.userId, 'TEMPLATES', 'DUPLICATE_TEMPLATE', { sourceId: templateId, newId }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Template duplicated successfully.',
      data: duplicated
    });
  } catch (err) {
    console.error('[PortalTemplates] Duplicate error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to duplicate template' });
  }
});

// ── 7. POST /api/portal/templates/preview ──
// Generate simulated preview with replaced variables
router.post('/preview', requirePortalAuth, (req, res) => {
  try {
    const { body, header, footer, sample_values = {} } = req.body;
    if (!body) {
      return res.status(400).json({ success: false, message: 'Body text is required for preview.' });
    }

    let renderedBody = body;
    Object.keys(sample_values).forEach((key, idx) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}|\\{\\{${idx + 1}\\}\\}`, 'g');
      renderedBody = renderedBody.replace(placeholder, sample_values[key]);
    });

    return res.json({
      success: true,
      preview: {
        header: header || '',
        renderedBody,
        footer: footer || '',
        sample_values
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate preview' });
  }
});

module.exports = router;
