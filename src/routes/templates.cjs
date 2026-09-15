// src/routes/templates.cjs
// ─────────────────────────────────────────────────────────────────
// Express Router for AVANI LOAN SERVICES Content Template Engine
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG, ALL_PRODUCT_KEYS } = require('../config/productsCatalog.cjs');
const {
  saveTemplate,
  getTemplateById,
  queryTemplates,
  getAuditLogs,
  recordTemplateAudit
} = require('../models/ContentTemplate.cjs');
const {
  generateProductTemplates,
  generateAllProductTemplates
} = require('../services/templateGenerator.cjs');
const { validateTemplate, scanAgroContamination } = require('../services/templateValidator.cjs');
const {
  submitToMetaWaba,
  syncWithMeta,
  publishToAiSensy
} = require('../services/templatePublishingEngine.cjs');

// Tenant isolation middleware on all template endpoints
router.use((req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      assertBusinessIsolation(req.body);
    }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'TENANT_ISOLATION_VIOLATION',
      message: err.message
    });
  }
});

// ── 1. GET /api/templates (Query & Filter) ────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await queryTemplates(req.query);
    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. GET /api/templates/stats ──────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { items } = await queryTemplates({ limit: 1000 });
    const stats = {
      businessId: BUSINESS_IDENTITY.businessId,
      totalTemplates: items.length,
      byProduct: {},
      byChannel: {},
      byLanguage: { en: 0, mr: 0, hi: 0 },
      byStatus: {
        DRAFT: 0,
        VALIDATED: 0,
        SUBMITTED: 0,
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        ARCHIVED: 0
      },
      metaApproved: 0,
      aisensyActive: 0
    };

    ALL_PRODUCT_KEYS.forEach(p => { stats.byProduct[p] = 0; });

    items.forEach(t => {
      if (stats.byProduct[t.product] !== undefined) stats.byProduct[t.product]++;
      stats.byChannel[t.channel] = (stats.byChannel[t.channel] || 0) + 1;
      if (stats.byLanguage[t.language] !== undefined) stats.byLanguage[t.language]++;
      if (stats.byStatus[t.status] !== undefined) stats.byStatus[t.status]++;

      if (t.metaStatus === 'APPROVED' || t.status === 'APPROVED') stats.metaApproved++;
      if (t.aisensyStatus === 'ACTIVE') stats.aisensyActive++;
    });

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. GET /api/templates/products ───────────────────────────────
router.get('/products', (req, res) => {
  res.json({
    success: true,
    businessId: BUSINESS_IDENTITY.businessId,
    products: Object.values(PRODUCTS_CATALOG)
  });
});

// ── 4. GET /api/templates/audit ──────────────────────────────────
router.get('/audit', (req, res) => {
  try {
    const logs = getAuditLogs(Number(req.query.limit) || 100);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. POST /api/templates/generate ──────────────────────────────
router.post('/generate', async (req, res) => {
  try {
    const { productId, languages } = req.body || {};

    if (!productId || productId === 'ALL') {
      const summary = await generateAllProductTemplates();
      return res.json({
        success: true,
        message: 'Generated templates for all 10 products successfully.',
        summary
      });
    }

    if (!PRODUCTS_CATALOG[productId]) {
      return res.status(400).json({
        success: false,
        error: `Invalid product ID: '${productId}'. Must be one of the 10 catalog products.`
      });
    }

    const generated = generateProductTemplates(productId, { languages });
    for (const t of generated) {
      t.validationReport = validateTemplate(t);
      t.status = t.validationReport.isValid ? 'VALIDATED' : 'DRAFT';
      await saveTemplate(t);
    }

    await recordTemplateAudit({
      who: req.headers['x-user-id'] || 'ADMIN_USER',
      what: `Generated ${generated.length} templates for product ${productId}`,
      product: productId,
      templateId: `GEN-${productId}`,
      channel: 'MULTI_CHANNEL',
      action: 'GENERATE_TEMPLATES',
      result: 'SUCCESS'
    });

    res.json({
      success: true,
      productId,
      count: generated.length,
      templates: generated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 6. POST /api/templates/validate ──────────────────────────────
router.post('/validate', (req, res) => {
  try {
    const templateData = req.body;
    const report = validateTemplate(templateData);
    const agroScan = scanAgroContamination(templateData);

    res.json({
      success: true,
      validation: report,
      agroContaminationScan: agroScan
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 7. POST /api/templates/save ──────────────────────────────────
router.post('/save', async (req, res) => {
  try {
    const templateData = req.body;
    const valReport = validateTemplate(templateData);
    templateData.validationReport = valReport;

    const saved = await saveTemplate(templateData);
    await recordTemplateAudit({
      who: req.headers['x-user-id'] || 'ADMIN_USER',
      what: `Saved template ${saved.templateId}`,
      product: saved.product,
      templateId: saved.templateId,
      channel: saved.channel,
      action: 'SAVE_TEMPLATE',
      result: 'SUCCESS'
    });

    res.json({ success: true, template: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 8. POST /api/templates/:id/submit-meta ───────────────────────
router.post('/:id/submit-meta', async (req, res) => {
  try {
    const result = await submitToMetaWaba(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 9. POST /api/templates/:id/publish-aisensy ───────────────────
router.post('/:id/publish-aisensy', async (req, res) => {
  try {
    const result = await publishToAiSensy(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 10. GET /api/templates/meta/sync ─────────────────────────────
router.get('/meta/sync', async (req, res) => {
  try {
    const result = await syncWithMeta();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 11. GET /api/templates/export ────────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const { items } = await queryTemplates({ limit: 5000 });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="avani-loan-services-templates.json"');
    res.send(JSON.stringify(items, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 12. GET /api/templates/:id (Single Template) ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const template = await getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
