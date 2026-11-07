// src/routes/builderPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MODULE A: BUILDER PARTNERSHIP API ROUTES
// Absolute Data Separation: Only interacts with builder_* tables
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission } = require('../middleware/portalAuthMiddleware.cjs');
const ExcelJS = require('exceljs');

// 1. GET /api/portal/builder/companies
router.get('/companies', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const { search, city, verification_status, outreach_readiness, subview = 'all', page = 1, limit = 50 } = req.query;
  let builders = db.getAll('builder_companies');
  const contacts = db.getAll('builder_contacts');
  const pipeline = db.getAll('builder_pipeline');
  const activities = db.getAll('builder_activities');

  // Compute subview counts across the entire dataset
  const residentialBuilders = builders.filter(b =>
    (b.company_category && b.company_category.toLowerCase().includes('residential')) ||
    (b.residential_project_count && b.residential_project_count > 0)
  );

  const contactBuilderIds = new Set(contacts.map(c => c.builder_id));
  const dmKeywords = ['director', 'managing', 'md', 'ceo', 'promoter', 'founder', 'partner', 'chairman', 'head', 'president', 'executive'];
  const dmContacts = contacts.filter(c => {
    const des = (c.designation || '').toLowerCase();
    return dmKeywords.some(k => des.includes(k));
  });
  const dmBuilderIds = new Set([
    ...dmContacts.map(c => c.builder_id),
    ...builders.filter(b => b.decision_maker_name || b.key_decision_maker_name).map(b => b.builder_id)
  ]);
  const pipelineBuilderIds = new Set(pipeline.map(d => d.builder_id));
  const activityBuilderIds = new Set(activities.map(a => a.builder_id));

  const subviewCounts = {
    all: builders.length,
    residential: residentialBuilders.length,
    contacts: builders.filter(b => contactBuilderIds.has(b.builder_id)).length,
    decision_makers: builders.filter(b => dmBuilderIds.has(b.builder_id)).length,
    pipeline: builders.filter(b => pipelineBuilderIds.has(b.builder_id)).length,
    tasks: builders.filter(b => activityBuilderIds.has(b.builder_id)).length
  };

  // Subview filtering
  if (subview === 'residential') {
    builders = residentialBuilders;
  } else if (subview === 'contacts') {
    builders = builders.filter(b => contactBuilderIds.has(b.builder_id));
  } else if (subview === 'decision_makers') {
    builders = builders.filter(b => dmBuilderIds.has(b.builder_id));
  } else if (subview === 'pipeline') {
    builders = builders.filter(b => pipelineBuilderIds.has(b.builder_id));
  } else if (subview === 'tasks') {
    builders = builders.filter(b => activityBuilderIds.has(b.builder_id));
  }

  // General Filter
  if (search) {
    const q = search.toLowerCase();
    builders = builders.filter(b =>
      (b.company_name && b.company_name.toLowerCase().includes(q)) ||
      (b.brand_name && b.brand_name.toLowerCase().includes(q)) ||
      (b.builder_id && b.builder_id.toLowerCase().includes(q)) ||
      (b.city && b.city.toLowerCase().includes(q))
    );
  }
  if (city) {
    builders = builders.filter(b => b.city && b.city.toLowerCase() === city.toLowerCase());
  }
  if (verification_status) {
    builders = builders.filter(b => b.verification_status === verification_status);
  }
  if (outreach_readiness) {
    builders = builders.filter(b => b.outreach_readiness === outreach_readiness);
  }

  // Enrich builder records with contacts and pipeline summaries for views
  const enrichedBuilders = builders.map(b => {
    const bContacts = contacts.filter(c => c.builder_id === b.builder_id);
    const bPipeline = pipeline.find(p => p.builder_id === b.builder_id);
    const bActivities = activities.filter(a => a.builder_id === b.builder_id);
    const bDMs = bContacts.filter(c => {
      const des = (c.designation || '').toLowerCase();
      return dmKeywords.some(k => des.includes(k));
    });

    const dmName = b.decision_maker_name || b.key_decision_maker_name || (bDMs[0] && bDMs[0].contact_name) || '';
    const dmRole = b.executive_designation || b.key_decision_maker_role || (bDMs[0] && bDMs[0].designation) || '';
    const waUrl = b.whatsapp_direct_link || b.whatsapp_direct_url || (b.official_mobile ? `https://wa.me/${b.official_mobile.replace(/[^0-9]/g, '')}` : '');
    const reraUrl = b.maharera_url || b.maharera_verification_url || 'https://maharera.maharashtra.gov.in/';
    const batchId = b.import_batch_id || b.source_lineage_batch_id || 'BATCH-20261107-P5318';

    return {
      ...b,
      key_decision_maker_name: dmName,
      key_decision_maker_role: dmRole,
      whatsapp_direct_url: waUrl,
      maharera_verification_url: reraUrl,
      source_lineage_batch_id: batchId,
      contactsCount: bContacts.length,
      decisionMakers: bDMs,
      contacts: bContacts,
      pipelineDeal: bPipeline || null,
      activitiesCount: bActivities.length
    };
  });

  // Pagination
  const total = enrichedBuilders.length;
  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const paginated = enrichedBuilders.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    subview,
    subviewCounts,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 2. GET /api/portal/builder/companies/:id
router.get('/companies/:id', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const builderId = req.params.id;
  const company = db.getById('builder_companies', builderId);
  if (!company) {
    return res.status(404).json({ success: false, message: 'Builder company not found.' });
  }

  const contacts = db.find('builder_contacts', c => c.builder_id === builderId);
  const maharera = db.find('builder_maharera', m => m.builder_id === builderId);
  const deals = db.find('builder_pipeline', d => d.builder_id === builderId);
  const activities = db.find('builder_activities', a => a.builder_id === builderId);

  return res.json({
    success: true,
    data: {
      ...company,
      contacts,
      maharera,
      deals,
      activities
    }
  });
});

// 3. PUT /api/portal/builder/companies/:id
router.put('/companies/:id', requirePortalAuth, requirePermission('builder:write'), (req, res) => {
  const builderId = req.params.id;
  const existing = db.getById('builder_companies', builderId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Builder company not found.' });
  }

  const updated = db.upsert('builder_companies', 'builder_id', {
    ...existing,
    ...req.body,
    builder_id: builderId // Prevent tampering with PK
  });

  db.logAudit(req.portalUser.userId, 'BUILDER', 'UPDATE_BUILDER_COMPANY', { builder_id: builderId, changes: Object.keys(req.body) }, req.ip);

  return res.json({ success: true, message: 'Builder company updated successfully.', data: updated });
});

// 4. GET /api/portal/builder/pipeline
router.get('/pipeline', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const deals = db.getAll('builder_pipeline');
  const companies = db.getAll('builder_companies');
  const companyMap = new Map(companies.map(c => [c.builder_id, c]));

  // 19 Standard Stages
  const STAGES = [
    { id: 1, name: 'Research Pending' },
    { id: 2, name: 'Company Identity Verified' },
    { id: 3, name: 'Official Channel Verified' },
    { id: 4, name: 'Department Confirmation Pending' },
    { id: 5, name: 'Partnership Contact Identified' },
    { id: 6, name: 'Introduction Ready' },
    { id: 7, name: 'Introduction Sent — Manual Confirmation' },
    { id: 8, name: 'Response Received' },
    { id: 9, name: 'Discovery Meeting Scheduled' },
    { id: 10, name: 'Discovery Meeting Completed' },
    { id: 11, name: 'Proposal Requested' },
    { id: 12, name: 'Proposal Shared' },
    { id: 13, name: 'Commercial Discussion' },
    { id: 14, name: 'Legal Review' },
    { id: 15, name: 'Agreement Pending' },
    { id: 16, name: 'Partnership Active' },
    { id: 17, name: 'Follow-up Later' },
    { id: 18, name: 'Not Interested' },
    { id: 19, name: 'Disqualified' }
  ];

  const enrichedDeals = deals.map(d => ({
    ...d,
    company: companyMap.get(d.builder_id) || {}
  }));

  const grouped = {};
  STAGES.forEach(s => {
    grouped[s.id] = {
      stageId: s.id,
      stageName: s.name,
      deals: enrichedDeals.filter(d => d.stage === s.id)
    };
  });

  return res.json({ success: true, stages: STAGES, grouped, totalDeals: deals.length });
});

// 5. PUT /api/portal/builder/pipeline/:dealId/stage
router.put('/pipeline/:dealId/stage', requirePortalAuth, requirePermission('builder:write'), (req, res) => {
  const dealId = req.params.dealId;
  const { stage, stage_name, notes } = req.body;
  const deal = db.getById('builder_pipeline', dealId);
  if (!deal) {
    return res.status(404).json({ success: false, message: 'Pipeline deal not found.' });
  }

  const prevStage = deal.stage;
  deal.stage = parseInt(stage);
  if (stage_name) deal.stage_name = stage_name;
  if (notes) deal.notes = (deal.notes ? deal.notes + '\n' : '') + `[${new Date().toISOString().split('T')[0]}] Stage changed to ${stage}: ${notes}`;
  deal.updated_at = new Date().toISOString();

  // Probability auto-adjustment based on stage progression
  if (deal.stage >= 16) deal.probability_pct = 100;
  else if (deal.stage >= 12) deal.probability_pct = 75;
  else if (deal.stage >= 9) deal.probability_pct = 50;
  else if (deal.stage >= 6) deal.probability_pct = 35;

  db.upsert('builder_pipeline', 'deal_id', deal);
  db.logAudit(req.portalUser.userId, 'BUILDER', 'PIPELINE_STAGE_CHANGE', { dealId, fromStage: prevStage, toStage: deal.stage }, req.ip);

  return res.json({ success: true, message: 'Pipeline stage updated.', data: deal });
});

// 6. GET /api/portal/builder/contacts
router.get('/contacts', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const { classification, verification_status } = req.query;
  let contacts = db.getAll('builder_contacts');

  if (classification) {
    contacts = contacts.filter(c => c.contact_classification === classification);
  }
  if (verification_status) {
    contacts = contacts.filter(c => c.verification_status === verification_status);
  }

  return res.json({ success: true, total: contacts.length, data: contacts });
});

// 7. GET /api/portal/builder/maharera
router.get('/maharera', requirePortalAuth, requirePermission('builder:read'), (req, res) => {
  const records = db.getAll('builder_maharera');
  return res.json({ success: true, total: records.length, data: records });
});

// 8. GET /api/portal/builder/export
router.get('/export', requirePortalAuth, requirePermission('builder:export'), async (req, res) => {
  try {
    const format = req.query.format || 'xlsx';
    const builders = db.getAll('builder_companies');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Maharashtra Builders');

    worksheet.columns = [
      { header: 'Builder ID', key: 'builder_id', width: 20 },
      { header: 'Company Name', key: 'company_name', width: 32 },
      { header: 'Brand Name', key: 'brand_name', width: 25 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'Key Decision-Maker', key: 'key_decision_maker_name', width: 25 },
      { header: 'Decision-Maker Role', key: 'key_decision_maker_role', width: 25 },
      { header: 'Official Telephone', key: 'official_telephone', width: 20 },
      { header: 'WhatsApp / Mobile', key: 'official_mobile', width: 22 },
      { header: 'WhatsApp Direct URL', key: 'whatsapp_direct_url', width: 35 },
      { header: 'Official Email', key: 'official_email', width: 30 },
      { header: 'Corporate Website', key: 'corporate_website', width: 30 },
      { header: 'Project Class', key: 'project_class', width: 20 },
      { header: 'Primary Asset Type', key: 'primary_asset_type', width: 22 },
      { header: 'MahaRERA Numbers', key: 'rera_numbers', width: 30 },
      { header: 'MahaRERA Verification URL', key: 'maharera_verification_url', width: 40 },
      { header: 'Qualification Score', key: 'qualification_score', width: 20 },
      { header: 'Verification Status', key: 'verification_status', width: 20 },
      { header: 'Outreach Readiness', key: 'outreach_readiness', width: 30 },
      { header: 'Source Lineage Batch', key: 'source_lineage_batch_id', width: 25 }
    ];

    builders.forEach(b => {
      worksheet.addRow({
        builder_id: b.builder_id,
        company_name: b.company_name,
        brand_name: b.brand_name,
        city: b.city,
        key_decision_maker_name: b.key_decision_maker_name || '',
        key_decision_maker_role: b.key_decision_maker_role || '',
        official_telephone: b.official_telephone,
        official_mobile: b.whatsapp_channel || b.official_mobile,
        whatsapp_direct_url: b.whatsapp_direct_url || '',
        official_email: b.official_email,
        corporate_website: b.corporate_website,
        project_class: b.project_class || '',
        primary_asset_type: b.primary_asset_type || '',
        rera_numbers: b.maharera_reg_numbers ? b.maharera_reg_numbers.join(', ') : '',
        maharera_verification_url: b.maharera_verification_url || '',
        qualification_score: b.qualification_score,
        verification_status: b.verification_status,
        outreach_readiness: b.outreach_readiness,
        source_lineage_batch_id: b.source_lineage_batch_id || 'BATCH-20261107-P5318'
      });
    });

    db.logAudit(req.portalUser.userId, 'BUILDER', 'EXPORT_BUILDER_DATA', { format, count: builders.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Builder_Master_Database.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[BuilderExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate export file.' });
  }
});

module.exports = router;
