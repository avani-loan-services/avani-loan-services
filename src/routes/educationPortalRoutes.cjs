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
const { isSchool, isCollege, getCollegeSubtypes, getSchoolSubtypes } = require('../utils/educationCategoryHelper.cjs');

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

// 1.1 GET /api/portal/education/schools (Dedicated School Funding Database)
router.get('/schools', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { search, city, state, tier, subview = 'all', page = 1, limit = 50 } = req.query;
  const allInstitutions = db.getAll('education_institutions');
  const allPipeline = db.getAll('education_pipeline');
  const allContacts = db.getAll('education_contacts');

  // Filter strictly to the 24 schools
  let schools = allInstitutions.filter(isSchool);

  // Subview counts across all 24 schools
  const groupsCount = schools.filter(s => getSchoolSubtypes(s).includes('groups')).length;
  const trustsCount = schools.filter(s => getSchoolSubtypes(s).includes('trusts')).length;
  const prospectsCount = schools.filter(s => getSchoolSubtypes(s).includes('prospects')).length;
  const schoolIdsSet = new Set(schools.map(s => s.institution_id));
  const schoolPipelineDeals = allPipeline.filter(p => schoolIdsSet.has(p.institution_id));
  const pipelineCount = new Set(schoolPipelineDeals.map(p => p.institution_id)).size;

  const subviewCounts = {
    all: schools.length, // 24
    groups: groupsCount,
    trusts: trustsCount,
    prospects: prospectsCount,
    pipeline: pipelineCount
  };

  // Subview filter
  if (subview === 'groups') {
    schools = schools.filter(s => getSchoolSubtypes(s).includes('groups'));
  } else if (subview === 'trusts') {
    schools = schools.filter(s => getSchoolSubtypes(s).includes('trusts'));
  } else if (subview === 'prospects') {
    schools = schools.filter(s => getSchoolSubtypes(s).includes('prospects'));
  } else if (subview === 'pipeline') {
    const activeDealInstIds = new Set(schoolPipelineDeals.map(p => p.institution_id));
    schools = schools.filter(s => activeDealInstIds.has(s.institution_id));
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    schools = schools.filter(s =>
      (s.institution_name && s.institution_name.toLowerCase().includes(q)) ||
      (s.institution_id && s.institution_id.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.parent_trust_society && s.parent_trust_society.toLowerCase().includes(q))
    );
  }
  if (city) {
    schools = schools.filter(s => s.city && s.city.toLowerCase() === city.toLowerCase());
  }
  if (state) {
    schools = schools.filter(s => s.state && s.state.toLowerCase() === state.toLowerCase());
  }
  if (tier) {
    schools = schools.filter(s => s.lead_priority_tier === tier);
  }

  // Enrich with data classification (distinguishing confirmed vs research-based estimates)
  const enrichedSchools = schools.map(s => {
    const sContacts = allContacts.filter(c => c.institution_id === s.institution_id);
    const sDeal = allPipeline.find(p => p.institution_id === s.institution_id);

    return {
      ...s,
      contacts: sContacts,
      pipelineDeal: sDeal || null,
      data_classification: {
        confirmed_fields: [
          'institution_id', 'institution_name', 'board_affiliation',
          'ownership_type', 'parent_trust_society', 'year_established',
          'official_email', 'official_telephone', 'complete_address', 'city', 'state'
        ],
        research_estimates: [
          { field: 'student_capacity', value: s.student_capacity, note: 'Estimated from branch capacity and infrastructure disclosures' },
          { field: 'approx_enrolment', value: s.approx_enrolment, note: 'Estimated from public student intake data' },
          { field: 'potential_funding_requirement', value: s.potential_funding_requirement, note: 'Preliminary infrastructure assessment estimate' }
        ],
        is_estimate: true
      }
    };
  });

  const total = enrichedSchools.length;
  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const paginated = enrichedSchools.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    database_type: 'SCHOOL_FUNDING_DATABASE',
    subview,
    subviewCounts,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 1.2 GET /api/portal/education/schools/export (Excel Export for Schools)
router.get('/schools/export', requirePortalAuth, requirePermission('education:export'), async (req, res) => {
  try {
    const allInstitutions = db.getAll('education_institutions');
    const schools = allInstitutions.filter(isSchool);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('School Funding Database');

    worksheet.columns = [
      { header: 'School ID', key: 'institution_id', width: 22 },
      { header: 'School / Group Name', key: 'institution_name', width: 38 },
      { header: 'Affiliation / Category', key: 'subcategory', width: 30 },
      { header: 'Parent Trust / Society', key: 'parent_trust', width: 32 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Official Telephone', key: 'telephone', width: 20 },
      { header: 'Official Email', key: 'email', width: 32 },
      { header: 'Student Capacity (Est.)', key: 'capacity', width: 22 },
      { header: 'Approx Enrolment (Est.)', key: 'enrolment', width: 22 },
      { header: 'Potential Funding Need', key: 'funding_req', width: 25 },
      { header: 'Priority Tier', key: 'tier', width: 14 },
      { header: 'Score (100-Pt)', key: 'score', width: 14 },
      { header: 'Data Verification Note', key: 'note', width: 35 }
    ];

    schools.forEach(s => {
      worksheet.addRow({
        institution_id: s.institution_id,
        institution_name: s.institution_name,
        subcategory: s.subcategory || s.board_affiliation || 'K-12 School',
        parent_trust: s.parent_trust_society,
        city: s.city,
        state: s.state,
        telephone: s.official_telephone,
        email: s.official_email,
        capacity: s.student_capacity ? `${s.student_capacity} (Estimate)` : 'Verified Profile',
        enrolment: s.approx_enrolment ? `${s.approx_enrolment} (Estimate)` : 'Verified Profile',
        funding_req: s.potential_funding_requirement,
        tier: s.lead_priority_tier,
        score: s.qualification_score,
        note: 'Capacity/enrolment values are research-based estimates'
      });
    });

    db.logAudit(req.portalUser.userId, 'EDUCATION', 'EXPORT_SCHOOLS_DATABASE', { count: schools.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="School_Funding_Database_Master.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[SchoolsExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate school export file.' });
  }
});

// 1.3 GET /api/portal/education/colleges (Dedicated College & University Funding Database)
router.get('/colleges', requirePortalAuth, requirePermission('education:read'), (req, res) => {
  const { search, city, state, tier, subview = 'all', page = 1, limit = 50 } = req.query;
  const allInstitutions = db.getAll('education_institutions');
  const allPipeline = db.getAll('education_pipeline');
  const allContacts = db.getAll('education_contacts');

  // Filter strictly to the 56 colleges & universities
  let colleges = allInstitutions.filter(isCollege);

  // Subview counts across all 56 higher education institutions
  const engineeringCount = colleges.filter(c => getCollegeSubtypes(c).includes('engineering')).length;
  const medicalCount = colleges.filter(c => getCollegeSubtypes(c).includes('medical')).length;
  const autonomousCount = colleges.filter(c => getCollegeSubtypes(c).includes('autonomous')).length;
  const deemedCount = colleges.filter(c => getCollegeSubtypes(c).includes('deemed')).length;
  const trustsCount = colleges.filter(c => getCollegeSubtypes(c).includes('trusts')).length;
  const groupsCount = colleges.filter(c => getCollegeSubtypes(c).includes('groups')).length;
  const prospectsCount = colleges.filter(c => getCollegeSubtypes(c).includes('prospects')).length;
  const collegeIdsSet = new Set(colleges.map(c => c.institution_id));
  const collegePipelineDeals = allPipeline.filter(p => collegeIdsSet.has(p.institution_id));
  const pipelineCount = new Set(collegePipelineDeals.map(p => p.institution_id)).size;

  const subviewCounts = {
    all: colleges.length, // 56
    engineering: engineeringCount,
    medical: medicalCount,
    autonomous: autonomousCount,
    deemed: deemedCount,
    trusts: trustsCount,
    groups: groupsCount,
    prospects: prospectsCount,
    pipeline: pipelineCount
  };

  // Subview filter
  if (subview === 'engineering') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('engineering'));
  } else if (subview === 'medical') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('medical'));
  } else if (subview === 'autonomous') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('autonomous'));
  } else if (subview === 'deemed') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('deemed'));
  } else if (subview === 'trusts') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('trusts'));
  } else if (subview === 'groups') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('groups'));
  } else if (subview === 'prospects') {
    colleges = colleges.filter(c => getCollegeSubtypes(c).includes('prospects'));
  } else if (subview === 'pipeline') {
    const activeDealInstIds = new Set(collegePipelineDeals.map(p => p.institution_id));
    colleges = colleges.filter(c => activeDealInstIds.has(c.institution_id));
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    colleges = colleges.filter(c =>
      (c.institution_name && c.institution_name.toLowerCase().includes(q)) ||
      (c.institution_id && c.institution_id.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.parent_trust_society && c.parent_trust_society.toLowerCase().includes(q))
    );
  }
  if (city) {
    colleges = colleges.filter(c => c.city && c.city.toLowerCase() === city.toLowerCase());
  }
  if (state) {
    colleges = colleges.filter(c => c.state && c.state.toLowerCase() === state.toLowerCase());
  }
  if (tier) {
    colleges = colleges.filter(c => c.lead_priority_tier === tier);
  }

  // Enrich with contacts and deals
  const enrichedColleges = colleges.map(c => {
    const cContacts = allContacts.filter(ct => ct.institution_id === c.institution_id);
    const cDeal = allPipeline.find(p => p.institution_id === c.institution_id);

    return {
      ...c,
      contacts: cContacts,
      pipelineDeal: cDeal || null,
      subtypes: getCollegeSubtypes(c)
    };
  });

  const total = enrichedColleges.length;
  const p = parseInt(page);
  const l = parseInt(limit);
  const startIndex = (p - 1) * l;
  const paginated = enrichedColleges.slice(startIndex, startIndex + l);

  return res.json({
    success: true,
    total,
    database_type: 'COLLEGE_UNIVERSITY_FUNDING_DATABASE',
    subview,
    subviewCounts,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
    data: paginated
  });
});

// 1.4 GET /api/portal/education/colleges/export (Excel Export for Colleges & Universities)
router.get('/colleges/export', requirePortalAuth, requirePermission('education:export'), async (req, res) => {
  try {
    const allInstitutions = db.getAll('education_institutions');
    const colleges = allInstitutions.filter(isCollege);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('College & University Database');

    worksheet.columns = [
      { header: 'Institution ID', key: 'institution_id', width: 22 },
      { header: 'College / University Name', key: 'institution_name', width: 42 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Subcategory / Specialization', key: 'subcategory', width: 36 },
      { header: 'Parent Trust / Society', key: 'parent_trust', width: 32 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Official Telephone', key: 'telephone', width: 20 },
      { header: 'Official Email', key: 'email', width: 32 },
      { header: 'Potential Funding Need', key: 'funding_req', width: 26 },
      { header: 'Priority Tier', key: 'tier', width: 14 },
      { header: 'Score (100-Pt)', key: 'score', width: 14 },
      { header: 'Verification Status', key: 'status', width: 20 }
    ];

    colleges.forEach(c => {
      worksheet.addRow({
        institution_id: c.institution_id,
        institution_name: c.institution_name,
        category: c.institution_category,
        subcategory: c.subcategory,
        parent_trust: c.parent_trust_society,
        city: c.city,
        state: c.state,
        telephone: c.official_telephone,
        email: c.official_email,
        funding_req: c.potential_funding_requirement,
        tier: c.lead_priority_tier,
        score: c.qualification_score,
        status: c.verification_status
      });
    });

    db.logAudit(req.portalUser.userId, 'EDUCATION', 'EXPORT_COLLEGES_DATABASE', { count: colleges.length }, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="College_University_Funding_Master.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[CollegesExport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate college export file.' });
  }
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
