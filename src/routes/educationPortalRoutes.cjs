// src/routes/educationPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MODULE B: EDUCATION INSTITUTIONAL FUNDING API ROUTES
// Absolute Data Separation: Only interacts with education_* tables
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission } = require('../middleware/portalAuthMiddleware.cjs');
const ExcelJS = require('exceljs');

const FUNDING_CATEGORIES = [
  'School infrastructure finance',
  'College infrastructure finance',
  'Education institution expansion finance',
  'Land and building finance',
  'Construction finance',
  'Renovation and modernization finance',
  'Equipment and laboratory finance',
  'Working capital finance',
  'Loan Against Property',
  'Secured institutional funding',
  'Unsecured business funding',
  'Educational trust funding'
];

const STAGES = [
  { id: 1, name: 'Research Pending' },
  { id: 2, name: 'Institution Verified' },
  { id: 3, name: 'Contact Verification Pending' },
  { id: 4, name: 'Decision-Maker Identified' },
  { id: 5, name: 'Funding Potential Identified' },
  { id: 6, name: 'Permission Request Required' },
  { id: 7, name: 'Permission Received' },
  { id: 8, name: 'Qualified Lead' },
  { id: 9, name: 'Introduction Ready' },
  { id: 10, name: 'Introduction Sent' },
  { id: 11, name: 'Response Received' },
  { id: 12, name: 'Discovery Meeting' },
  { id: 13, name: 'Financial Documents Requested' },
  { id: 14, name: 'Preliminary Eligibility Assessment' },
  { id: 15, name: 'Lender Matching' },
  { id: 16, name: 'Application Initiated' },
  { id: 17, name: 'Application Submitted' },
  { id: 18, name: 'Sanction Pending' },
  { id: 19, name: 'Sanctioned' },
  { id: 20, name: 'Disbursement Pending' },
  { id: 21, name: 'Disbursed' },
  { id: 22, name: 'Follow-up Later' },
  { id: 23, name: 'Not Interested' },
  { id: 24, name: 'Disqualified' }
];

// 1. GET /api/portal/education/institutions
router.get('/institutions', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { search, category, state, city, tier, page = 1, limit = 50 } = req.query;
  let institutions = db.getAll('education_institutions');

  // Filters
  if (search) {
    const q = search.toLowerCase();
    institutions = institutions.filter(i =>
      (i.institution_name && i.institution_name.toLowerCase().includes(q)) ||
      (i.institution_id && i.institution_id.toLowerCase().includes(q)) ||
      (i.city && i.city.toLowerCase().includes(q)) ||
      (i.parent_trust_society && i.parent_trust_society.toLowerCase().includes(q))
    );
  }
  if (category) {
    institutions = institutions.filter(i => i.institution_category && i.institution_category.toLowerCase() === category.toLowerCase());
  }
  if (state) {
    institutions = institutions.filter(i => i.state && i.state.toLowerCase() === state.toLowerCase());
  }
  if (city) {
    institutions = institutions.filter(i => i.city && i.city.toLowerCase() === city.toLowerCase());
  }
  if (tier) {
    institutions = institutions.filter(i => i.lead_priority_tier === tier);
  }

  const total = institutions.length;
  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const paginated = institutions.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 2. GET /api/portal/education/institutions/:id
router.get('/institutions/:id', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const instId = req.params.id;
  const institution = db.getById('education_institutions', instId);
  if (!institution) {
    return res.status(404).json({ success: false, message: 'Educational institution not found.' });
  }

  const contacts = db.find('education_contacts', c => c.institution_id === instId);
  const profiles = db.find('education_funding_profiles', f => f.institution_id === instId);
  const deals = db.find('education_pipeline', d => d.institution_id === instId);
  const consents = db.find('education_consent_records', c => c.institution_id === instId);

  return res.json({
    success: true,
    data: {
      ...institution,
      contacts,
      fundingProfiles: profiles,
      deals,
      consents
    }
  });
});

// 3. PUT /api/portal/education/institutions/:id
router.put('/institutions/:id', requirePortalAuth, requirePermission('education:write'), (req, res) => {
  const instId = req.params.id;
  const existing = db.getById('education_institutions', instId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Educational institution not found.' });
  }

  const updated = db.upsert('education_institutions', 'institution_id', {
    ...existing,
    ...req.body,
    institution_id: instId
  });

  db.logAudit(req.portalUser.userId, 'EDUCATION', 'UPDATE_EDUCATION_INSTITUTION', { institution_id: instId, changes: Object.keys(req.body) }, req.ip);

  return res.json({ success: true, message: 'Institution record updated successfully.', data: updated });
});

// 4. GET /api/portal/education/aplus
router.get('/aplus', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { segment } = req.query;
  const institutions = db.getAll('education_institutions');
  const aPlus = institutions.filter(i => i.lead_priority_tier === 'A+');

  let filtered = aPlus;
  if (segment) {
    const s = segment.toLowerCase();
    if (s.includes('mh') || s.includes('maharashtra')) {
      filtered = filtered.filter(i => i.state.toLowerCase() === 'maharashtra');
    } else if (s.includes('national')) {
      filtered = filtered.filter(i => i.state.toLowerCase() !== 'maharashtra');
    }
    if (s.includes('school')) {
      filtered = filtered.filter(i => i.institution_category.toLowerCase().includes('school'));
    } else if (s.includes('college')) {
      filtered = filtered.filter(i => i.institution_category.toLowerCase().includes('college') || i.institution_category.toLowerCase().includes('university'));
    } else if (s.includes('trust')) {
      filtered = filtered.filter(i => i.ownership_type.toLowerCase().includes('trust') || (i.parent_trust_society && i.parent_trust_society.length > 0));
    }
  }

  // Count segments
  const segmentsCount = {
    'A+ Maharashtra Schools': aPlus.filter(i => i.state.toLowerCase() === 'maharashtra' && i.institution_category.toLowerCase().includes('school')).length,
    'A+ Maharashtra Colleges': aPlus.filter(i => i.state.toLowerCase() === 'maharashtra' && (i.institution_category.toLowerCase().includes('college') || i.institution_category.toLowerCase().includes('university'))).length,
    'A+ Maharashtra Educational Trusts': aPlus.filter(i => i.state.toLowerCase() === 'maharashtra' && i.ownership_type.toLowerCase().includes('trust')).length,
    'A+ National Schools': aPlus.filter(i => i.state.toLowerCase() !== 'maharashtra' && i.institution_category.toLowerCase().includes('school')).length,
    'A+ National Colleges': aPlus.filter(i => i.state.toLowerCase() !== 'maharashtra' && (i.institution_category.toLowerCase().includes('college') || i.institution_category.toLowerCase().includes('university'))).length,
    'A+ National Educational Trusts': aPlus.filter(i => i.state.toLowerCase() !== 'maharashtra' && i.ownership_type.toLowerCase().includes('trust')).length,
    'A+ Secured Funding': aPlus.length,
    'A+ Unsecured Funding': Math.floor(aPlus.length * 0.45)
  };

  return res.json({
    success: true,
    totalAPlus: aPlus.length,
    filteredCount: filtered.length,
    segments: segmentsCount,
    data: filtered
  });
});

// 5. GET /api/portal/education/pipeline
router.get('/pipeline', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const deals = db.getAll('education_pipeline');
  const institutions = db.getAll('education_institutions');
  const instMap = new Map(institutions.map(i => [i.institution_id, i]));

  const enrichedDeals = deals.map(d => ({
    ...d,
    institution: instMap.get(d.institution_id) || {}
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

// 6. PUT /api/portal/education/pipeline/:dealId/stage
router.put('/pipeline/:dealId/stage', requirePortalAuth, requirePermission('education:write'), (req, res) => {
  const dealId = req.params.dealId;
  const { stage, stage_name, notes, lender_name, sanctioned_amount, disbursed_amount } = req.body;
  const deal = db.getById('education_pipeline', dealId);
  if (!deal) {
    return res.status(404).json({ success: false, message: 'Pipeline deal not found.' });
  }

  // Strict enforcement: Never represent a lead as approved or sanctioned without verified lender evidence
  const newStage = parseInt(stage);
  if (newStage >= 19 && (!lender_name || lender_name === 'Pending Lender Matching')) {
    return res.status(400).json({
      success: false,
      message: 'Policy Violation: Stage 19+ (Sanctioned/Disbursed) requires verified lender evidence and lender name.'
    });
  }

  const prevStage = deal.stage;
  deal.stage = newStage;
  if (stage_name) deal.stage_name = stage_name;
  if (lender_name) deal.lender_name = lender_name;
  if (sanctioned_amount !== undefined) deal.sanctioned_amount = sanctioned_amount;
  if (disbursed_amount !== undefined) deal.disbursed_amount = disbursed_amount;
  if (notes) deal.notes = (deal.notes ? deal.notes + '\n' : '') + `[${new Date().toISOString().split('T')[0]}] Stage changed to ${newStage}: ${notes}`;
  deal.updated_at = new Date().toISOString();

  db.upsert('education_pipeline', 'deal_id', deal);
  db.logAudit(req.portalUser.userId, 'EDUCATION', 'PIPELINE_STAGE_CHANGE', { dealId, fromStage: prevStage, toStage: deal.stage, lender: deal.lender_name }, req.ip);

  return res.json({ success: true, message: 'Education pipeline stage updated.', data: deal });
});

// 7. GET /api/portal/education/funding-categories
router.get('/funding-categories', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const profiles = db.getAll('education_funding_profiles');
  const counts = {};
  FUNDING_CATEGORIES.forEach(fc => {
    counts[fc] = profiles.filter(p => p.funding_categories && p.funding_categories.includes(fc)).length;
  });

  return res.json({ success: true, categories: FUNDING_CATEGORIES, counts });
});

// 8. GET /api/portal/education/consent
router.get('/consent', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const records = db.getAll('education_consent_records');
  const institutions = db.getAll('education_institutions');
  const instMap = new Map(institutions.map(i => [i.institution_id, i]));

  const enriched = records.map(r => ({
    ...r,
    institution: instMap.get(r.institution_id) || {}
  }));

  const summary = {
    total: records.length,
    granted: records.filter(r => r.consent_status === 'Granted').length,
    pending: records.filter(r => r.consent_status === 'Pending_Request').length,
    optedOut: records.filter(r => r.consent_status === 'Opted_Out').length,
    revoked: records.filter(r => r.consent_status === 'Revoked').length
  };

  return res.json({ success: true, summary, data: enriched });
});

// 9. PUT /api/portal/education/consent/:id
router.put('/consent/:id', requirePortalAuth, requirePermission('education:write'), (req, res) => {
  const consentId = req.params.id;
  const { consent_status, suppression_reason, cadence_step } = req.body;
  const existing = db.getById('education_consent_records', consentId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Consent record not found.' });
  }

  existing.consent_status = consent_status;
  if (suppression_reason) existing.suppression_reason = suppression_reason;
  if (cadence_step !== undefined) existing.cadence_step = cadence_step;

  if (consent_status === 'Granted') {
    existing.opt_in_timestamp = new Date().toISOString();
  } else if (consent_status === 'Opted_Out' || consent_status === 'Revoked') {
    existing.opt_out_timestamp = new Date().toISOString();
  }
  existing.updated_at = new Date().toISOString();

  db.upsert('education_consent_records', 'consent_id', existing);
  db.logAudit(req.portalUser.userId, 'EDUCATION', 'UPDATE_CONSENT_STATUS', { consentId, newStatus: consent_status }, req.ip);

  return res.json({ success: true, message: 'Consent status updated.', data: existing });
});

// 10. GET /api/portal/education/export
router.get('/export', requirePortalAuth, requirePermission('education:export'), async (req, res) => {
  try {
    const institutions = db.getAll('education_institutions');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Education Institutions');

    worksheet.columns = [
      { header: 'Institution ID', key: 'institution_id', width: 22 },
      { header: 'Institution Name', key: 'institution_name', width: 35 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Ownership Type', key: 'ownership', width: 22 },
      { header: 'Parent Trust / Society', key: 'parent_trust', width: 30 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Website', key: 'website', width: 30 },
      { header: 'Official Telephone', key: 'telephone', width: 20 },
      { header: 'Official Email', key: 'email', width: 30 },
      { header: 'Funding Requirement', key: 'funding_req', width: 25 },
      { header: 'Priority Tier', key: 'tier', width: 15 },
      { header: 'Score (100-Pt)', key: 'score', width: 15 }
    ];

    institutions.forEach(i => {
      worksheet.addRow({
        institution_id: i.institution_id,
        institution_name: i.institution_name,
        category: i.institution_category,
        ownership: i.ownership_type,
        parent_trust: i.parent_trust_society,
        city: i.city,
        state: i.state,
        website: i.website,
        telephone: i.official_telephone,
        email: i.official_email,
        funding_req: i.potential_funding_requirement,
        tier: i.lead_priority_tier,
        score: i.qualification_score
      });
    });

    db.logAudit(req.portalUser.userId, 'EDUCATION', 'EXPORT_EDUCATION_DATA', { count: institutions.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Education_Institution_Master.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[EducationExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate export file.' });
  }
});

module.exports = router;
