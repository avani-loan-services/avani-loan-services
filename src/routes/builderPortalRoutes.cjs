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
  const { search, city, verification_status, outreach_readiness, page = 1, limit = 50 } = req.query;
  let builders = db.getAll('builder_companies');

  // Filter
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

  // Pagination
  const total = builders.length;
  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const paginated = builders.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
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
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'Brand Name', key: 'brand_name', width: 25 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Corporate Website', key: 'corporate_website', width: 30 },
      { header: 'Official Telephone', key: 'official_telephone', width: 20 },
      { header: 'Official Mobile / WhatsApp', key: 'official_mobile', width: 25 },
      { header: 'Official Email', key: 'official_email', width: 30 },
      { header: 'MahaRERA Numbers', key: 'rera_numbers', width: 30 },
      { header: 'Qualification Score', key: 'qualification_score', width: 20 },
      { header: 'Verification Status', key: 'verification_status', width: 20 },
      { header: 'Outreach Readiness', key: 'outreach_readiness', width: 35 }
    ];

    builders.forEach(b => {
      worksheet.addRow({
        builder_id: b.builder_id,
        company_name: b.company_name,
        brand_name: b.brand_name,
        city: b.city,
        corporate_website: b.corporate_website,
        official_telephone: b.official_telephone,
        official_mobile: b.whatsapp_channel || b.official_mobile,
        official_email: b.official_email,
        rera_numbers: b.maharera_reg_numbers ? b.maharera_reg_numbers.join(', ') : '',
        qualification_score: b.qualification_score,
        verification_status: b.verification_status,
        outreach_readiness: b.outreach_readiness
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
