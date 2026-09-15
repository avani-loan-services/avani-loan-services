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
const { generateAllImageConcepts, generate100VisualConcepts } = require('../services/imageAssetEngine.cjs');
const { generateAllVideoConcepts, generateProductVideoConcepts } = require('../services/videoAssetEngine.cjs');
const { scoreTemplateQuality, findDuplicates } = require('../services/contentQualityScorer.cjs');
const { generate30DayCalendar, convertToCSV, convertCalendarToCSV } = require('../services/contentCalendarEngine.cjs');
const { PUBLISHING_STATES, transitionTemplateState } = require('../services/publishingStateMachine.cjs');
const {
  ASSET_STATUSES,
  queryMediaAssets,
  getMediaAssetById,
  saveMediaAsset,
  transitionAssetStatus,
  countMediaAssets
} = require('../models/MediaAsset.cjs');
const {
  generateImageAsset,
  generateVideoAsset,
  initializeAllMediaAssetConcepts,
  validateImageQualityControl
} = require('../services/mediaAssetPipeline.cjs');
const {
  saveCampaign,
  getCampaignById,
  queryCampaigns,
  CAMPAIGN_STATUSES
} = require('../models/Campaign.cjs');
const { generateCampaignPack, adaptContentForChannels } = require('../services/campaignAutomationEngine.cjs');
const {
  enqueuePublishItem,
  getPublishingQueue,
  processPublishItem,
  retryPublishItem,
  QUEUE_STATUSES
} = require('../services/publishingQueueService.cjs');


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
    let result = await queryTemplates(req.query);
    if (!result.items || result.items.length === 0) {
      const targetProduct = req.query.product && req.query.product !== 'ALL' ? req.query.product : 'personal_loan';
      const generated = generateProductTemplates(targetProduct);
      for (const t of generated) {
        await saveTemplate(t);
      }
      result = await queryTemplates(req.query);
    }
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
    const { items } = await queryTemplates({ limit: 2000 });
    const stats = {
      businessId: BUSINESS_IDENTITY.businessId,
      totalTemplates: items.length,
      byProduct: {},
      byChannel: {},
      byLanguage: { en: 0, mr: 0, hi: 0 },
      byStatus: {
        DRAFT: 0,
        VALIDATED: 0,
        READY_FOR_SUBMISSION: 0,
        SUBMITTED_TO_META: 0,
        META_PENDING: 0,
        META_APPROVED: 0,
        META_REJECTED: 0,
        READY_FOR_AISENSY: 0,
        PUBLISHED_TO_AISENSY: 0,
        FAILED: 0,
        ARCHIVED: 0
      },
      imageConceptsCount: 100,
      imageFormatsTotal: 400,
      videoConceptsCount: 300,
      metaApproved: 0,
      aisensyActive: 0
    };

    ALL_PRODUCT_KEYS.forEach(p => { stats.byProduct[p] = 0; });

    items.forEach(t => {
      if (stats.byProduct[t.product] !== undefined) stats.byProduct[t.product]++;
      stats.byChannel[t.channel] = (stats.byChannel[t.channel] || 0) + 1;
      if (stats.byLanguage[t.language] !== undefined) stats.byLanguage[t.language]++;
      if (stats.byStatus[t.status] !== undefined) stats.byStatus[t.status]++;

      if (t.metaStatus === 'APPROVED' || t.status === 'META_APPROVED' || t.status === 'APPROVED') {
        stats.metaApproved++;
      }
      if (t.aisensyStatus === 'ACTIVE' || t.status === 'PUBLISHED_TO_AISENSY') {
        stats.aisensyActive++;
      }
    });

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. GET /api/templates/products ───────────────────────────────
router.get('/products', (req, res) => {
  const products = Object.values(PRODUCTS_CATALOG);
  res.json({
    success: true,
    businessId: BUSINESS_IDENTITY.businessId,
    count: products.length,
    total: products.length,
    products
  });
});

// ── 4. GET /api/templates/images (100 Visual Concepts across 4 Formats) ──
router.get('/images', (req, res) => {
  try {
    const { product, format } = req.query;
    let concepts = (!format || format === 'ALL') ? generate100VisualConcepts() : generateAllImageConcepts();

    if (product && product !== 'ALL') {
      concepts = concepts.filter(c => (c.productId === product || c.product === product));
    }
    if (format && format !== 'ALL') {
      concepts = concepts.filter(c => c.formatKey === format);
    }

    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      count: concepts.length,
      total: concepts.length,
      concepts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. GET /api/templates/videos (300 Video Concepts) ────────────
router.get('/videos', (req, res) => {
  try {
    const { product, category, language } = req.query;
    const lang = language || 'mr';
    let videos = generateAllVideoConcepts(lang);

    if (product && product !== 'ALL') {
      videos = videos.filter(v => (v.productId === product || v.product === product));
    }
    if (category && category !== 'ALL') {
      videos = videos.filter(v => (v.category === category || v.categoryName === category));
    }

    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      count: videos.length,
      total: videos.length,
      videos,
      concepts: videos
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 6. GET /api/templates/calendar (30-Day Product Content Calendar) ──
router.get('/calendar', (req, res) => {
  try {
    const { product, format } = req.query;
    const calendar = generate30DayCalendar(product || 'ALL');

    if (format === 'csv') {
      const csv = convertCalendarToCSV(calendar);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="avani_content_calendar.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      totalDays: 30,
      count: calendar.length,
      entriesCount: calendar.length,
      calendar
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ── 7. POST /api/templates/score (Quality & Compliance Scoring) ──
router.post('/score', async (req, res) => {
  try {
    const templateData = req.body;
    const { items: existing } = await queryTemplates({ limit: 500 });
    const scoreReport = scoreTemplateQuality(templateData, existing);

    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      scoreReport
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 8. GET /api/templates/duplicates (Scan for duplicates) ───────
router.get('/duplicates', async (req, res) => {
  try {
    const { items } = await queryTemplates({ limit: 2000 });
    const duplicates = findDuplicates(items);

    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      totalScanned: items.length,
      duplicateCount: duplicates.length,
      duplicates
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 9. GET /api/templates/audit ──────────────────────────────────
router.get('/audit', (req, res) => {
  try {
    const logs = getAuditLogs(Number(req.query.limit) || 100);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 10. POST /api/templates/generate ─────────────────────────────
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
      t.qualityScore = scoreTemplateQuality(t).score;
      t.status = t.validationReport.isValid ? PUBLISHING_STATES.VALIDATED : PUBLISHING_STATES.DRAFT;
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

// ── 11. POST /api/templates/validate ─────────────────────────────
router.post('/validate', (req, res) => {
  try {
    const templateData = req.body;
    const report = validateTemplate(templateData);
    const agroScan = scanAgroContamination(templateData);
    const quality = scoreTemplateQuality(templateData);

    res.json({
      success: true,
      validation: report,
      agroContaminationScan: agroScan,
      qualityScore: quality
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 12. POST /api/templates/save ─────────────────────────────────
router.post('/save', async (req, res) => {
  try {
    const templateData = req.body;
    const valReport = validateTemplate(templateData);
    templateData.validationReport = valReport;
    templateData.qualityScore = scoreTemplateQuality(templateData).score;

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

// ── 13. POST /api/templates/:id/submit-meta ──────────────────────
router.post('/:id/submit-meta', async (req, res) => {
  try {
    const result = await submitToMetaWaba(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 14. POST /api/templates/bulk-submit-meta ─────────────────────
router.post('/bulk-submit-meta', async (req, res) => {
  try {
    const { templateIds, confirmed } = req.body || {};

    if (!confirmed) {
      return res.status(400).json({
        success: false,
        error: 'CONFIRMATION_REQUIRED',
        message: 'Explicit human confirmation is required before bulk Meta WABA template submission. Set { confirmed: true }.'
      });
    }

    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Provide an array of templateIds to submit.'
      });
    }

    const results = [];
    for (const id of templateIds) {
      const subRes = await submitToMetaWaba(id);
      results.push({ id, ...subRes });
    }

    res.json({
      success: true,
      totalSubmitted: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 15. POST /api/templates/:id/publish-aisensy ──────────────────
router.post('/:id/publish-aisensy', async (req, res) => {
  try {
    const result = await publishToAiSensy(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 16. POST /api/templates/bulk-publish-aisensy ─────────────────
router.post('/bulk-publish-aisensy', async (req, res) => {
  try {
    const { templateIds } = req.body || {};
    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Provide an array of templateIds to link with AiSensy.'
      });
    }

    const results = [];
    for (const id of templateIds) {
      const pubRes = await publishToAiSensy(id);
      results.push({ id, ...pubRes });
    }

    res.json({
      success: true,
      totalProcessed: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 17. GET /api/templates/meta/sync ────────────────────────────
router.get('/meta/sync', async (req, res) => {
  try {
    const result = await syncWithMeta();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 18. GET /api/templates/export ───────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', product } = req.query;
    const query = { limit: 5000 };
    if (product && product !== 'ALL') query.product = product;

    let { items } = await queryTemplates(query);
    if (!items || items.length === 0) {
      items = [];
      const targetProducts = product && product !== 'ALL' ? [product] : ALL_PRODUCT_KEYS;
      for (const pKey of targetProducts) {
        items.push(...generateProductTemplates(pKey));
      }
    }

    if (format.toLowerCase() === 'csv' || format.toLowerCase() === 'excel') {
      const csvData = convertToCSV(items);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="avani-loan-services-templates.csv"');
      return res.send(csvData);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="avani-loan-services-templates.json"');
    res.json({
      businessId: BUSINESS_IDENTITY.businessId,
      total: items.length,
      items
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ── PHASE 3: MEDIA ASSETS, CAMPAIGNS & PUBLISHING QUEUE ─────────

// ── 19. GET /api/templates/assets (Query Media Assets) ──────────
router.get('/assets', async (req, res) => {
  try {
    let assets = await queryMediaAssets(req.query);
    if (assets.length === 0) {
      await initializeAllMediaAssetConcepts();
      assets = await queryMediaAssets(req.query);
    }

    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      count: assets.length,
      assets
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 20. GET /api/templates/assets/:assetId (Single Asset) ─────────
router.get('/assets/:assetId', async (req, res) => {
  try {
    const asset = await getMediaAssetById(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Media asset not found' });
    }
    res.json({ success: true, asset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 21. POST /api/templates/assets/generate ──────────────────────
router.post('/assets/generate', async (req, res) => {
  try {
    const { type = 'IMAGE', conceptId, productId, format = '1:1', provider } = req.body || {};
    let result;
    if (type.toUpperCase() === 'VIDEO') {
      result = await generateVideoAsset({ conceptId, productId, provider });
    } else {
      result = await generateImageAsset({ conceptId, productId, format, provider });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 22. POST /api/templates/assets/approve ───────────────────────
router.post('/assets/approve', async (req, res) => {
  try {
    const { assetId, actor = 'Sachin Shinde' } = req.body || {};
    const asset = await getMediaAssetById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    const result = transitionAssetStatus(asset, ASSET_STATUSES.APPROVED_INTERNAL, { actor, reason: 'Approved by authorized operator' });
    await saveMediaAsset(asset);
    res.json({ success: true, asset, log: result.logEntry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 23. POST /api/templates/assets/reject ────────────────────────
router.post('/assets/reject', async (req, res) => {
  try {
    const { assetId, actor = 'Sachin Shinde', reason = 'Quality review revision needed' } = req.body || {};
    const asset = await getMediaAssetById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    const result = transitionAssetStatus(asset, ASSET_STATUSES.REJECTED_INTERNAL, { actor, reason });
    await saveMediaAsset(asset);
    res.json({ success: true, asset, log: result.logEntry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 24. GET /api/templates/campaigns (List Campaigns) ────────────
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await queryCampaigns(req.query);
    res.json({
      success: true,
      businessId: BUSINESS_IDENTITY.businessId,
      count: campaigns.length,
      campaigns
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 25. POST /api/templates/campaigns (Create Campaign) ──────────
router.post('/campaigns', async (req, res) => {
  try {
    const saved = await saveCampaign(req.body);
    res.json({ success: true, campaign: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 26. POST /api/templates/campaigns/pack (Generate Pack) ───────
router.post('/campaigns/pack', async (req, res) => {
  try {
    const result = await generateCampaignPack(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 27. GET /api/templates/publishing-queue ──────────────────────
router.get('/publishing-queue', (req, res) => {
  try {
    const queue = getPublishingQueue(req.query);
    res.json({
      success: true,
      count: queue.length,
      queue
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 28. POST /api/templates/publishing-queue/publish ─────────────
router.post('/publishing-queue/publish', async (req, res) => {
  try {
    const { queueId, isMetaApproved } = req.body || {};
    const result = await processPublishItem(queueId, { isMetaApproved });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── 29. POST /api/templates/publishing-queue/retry ───────────────
router.post('/publishing-queue/retry', async (req, res) => {
  try {
    const { queueId, isMetaApproved } = req.body || {};
    const result = await retryPublishItem(queueId, { isMetaApproved });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


// ── 30. GET /api/templates/:id (Single Template) ────────────────
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
