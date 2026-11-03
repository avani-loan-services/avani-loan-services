// src/routes/unifiedPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — CENTRAL ADMINISTRATION DASHBOARD & AUTOMATION API
// Absolute Data Separation: Aggregates live database metrics without mixing records
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const db = require('../models/portalDatabase.cjs');
const { requirePortalAuth, requirePermission, requireRole } = require('../middleware/portalAuthMiddleware.cjs');
const ExcelJS = require('exceljs');

// 1. GET /api/portal/dashboard/overview
router.get('/overview', requirePortalAuth, (req, res) => {
  // Fetch real database records (never hardcoded figures)
  const builders = db.getAll('builder_companies');
  const bDeals = db.getAll('builder_pipeline');
  const bEnquiries = db.getAll('builder_enquiries');

  const institutions = db.getAll('education_institutions');
  const eDeals = db.getAll('education_pipeline');
  const eConsents = db.getAll('education_consent_records');
  const eEnquiries = db.getAll('education_enquiries');

  const tasks = db.getAll('unified_tasks');
  const autoState = db.getAutomationState();

  // Builder Metrics
  const totalBuilders = builders.length;
  const verifiedBuilders = builders.filter(b => b.verification_status === 'Verified').length;
  const partnershipReadyBuilders = builders.filter(b => b.outreach_readiness === 'APPROVED FOR IMMEDIATE OUTREACH').length;
  const awaitingConfirmationBuilders = builders.filter(b => b.outreach_readiness === 'APPROVED AFTER CONTACT CONFIRMATION').length;
  const meetingsScheduled = bDeals.filter(d => d.stage === 9).length;
  const activePartnerships = bDeals.filter(d => d.stage === 16).length;

  // Education Metrics
  const totalInstitutions = institutions.length;
  const verifiedInstitutions = institutions.filter(i => i.verification_status === 'Verified').length;
  const qualifiedFundingProspects = institutions.length; // all 80 benchmark institutions
  const aPlusProspects = institutions.filter(i => i.lead_priority_tier === 'A+').length;
  const permissionPending = eConsents.filter(c => c.consent_status === 'Pending_Request').length;
  const permissionApproved = eConsents.filter(c => c.consent_status === 'Granted').length;
  const totalFundingEnquiries = eEnquiries.length;
  const applicationsInitiated = eDeals.filter(d => d.stage === 16).length;
  const applicationsSubmitted = eDeals.filter(d => d.stage === 17).length;
  const sanctions = eDeals.filter(d => d.stage === 19).length;
  const disbursements = eDeals.filter(d => d.stage === 21).length;

  return res.json({
    success: true,
    data: {
      builder: {
        totalBuilders,
        verifiedBuilders,
        partnershipReadyBuilders,
        awaitingConfirmationBuilders,
        meetingsScheduled,
        activePartnerships,
        enquiriesCount: bEnquiries.length,
        activeDealsCount: bDeals.filter(d => d.status === 'Active').length
      },
      education: {
        totalInstitutions,
        verifiedInstitutions,
        qualifiedFundingProspects,
        aPlusProspects,
        permissionPending,
        permissionApproved,
        fundingEnquiries: totalFundingEnquiries,
        applicationsInitiated,
        applicationsSubmitted,
        sanctions,
        disbursements,
        activeDealsCount: eDeals.filter(d => d.status === 'Active').length
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        highPriority: tasks.filter(t => t.priority === 'High' && t.status === 'Pending').length
      },
      automation: autoState,
      serverTime: new Date().toISOString()
    }
  });
});

// 2. Tasks Management
// GET /api/portal/dashboard/tasks
router.get('/tasks', requirePortalAuth, (req, res) => {
  const { module, status, priority } = req.query;
  let tasks = db.getAll('unified_tasks');

  if (module) tasks = tasks.filter(t => t.module === module);
  if (status) tasks = tasks.filter(t => t.status === status);
  if (priority) tasks = tasks.filter(t => t.priority === priority);

  return res.json({ success: true, total: tasks.length, data: tasks });
});

// POST /api/portal/dashboard/tasks
router.post('/tasks', requirePortalAuth, (req, res) => {
  const { module, related_id, task_title, task_type, due_date, priority } = req.body;
  if (!task_title || !due_date || !module) {
    return res.status(400).json({ success: false, message: 'module, task_title and due_date are required.' });
  }

  const taskId = `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const newTask = {
    task_id: taskId,
    module,
    related_id: related_id || '',
    task_title,
    task_type: task_type || 'Follow-up Call',
    due_date,
    priority: priority || 'Medium',
    status: 'Pending',
    assigned_to: req.portalUser.userId,
    created_at: new Date().toISOString()
  };

  db.upsert('unified_tasks', 'task_id', newTask);
  db.logAudit(req.portalUser.userId, 'SYSTEM', 'CREATE_TASK', { taskId, module, title: task_title }, req.ip);

  return res.status(201).json({ success: true, message: 'Task created.', data: newTask });
});

// PUT /api/portal/dashboard/tasks/:id
router.put('/tasks/:id', requirePortalAuth, (req, res) => {
  const taskId = req.params.id;
  const existing = db.getById('unified_tasks', taskId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const updated = db.upsert('unified_tasks', 'task_id', {
    ...existing,
    ...req.body,
    task_id: taskId
  });

  return res.json({ success: true, message: 'Task updated.', data: updated });
});

// 3. Enquiry Management
// GET /api/portal/dashboard/enquiries
router.get('/enquiries', requirePortalAuth, requirePermission('enquiry:read'), (req, res) => {
  const { module } = req.query;
  const bEnquiries = db.getAll('builder_enquiries').map(e => ({ ...e, module: 'BUILDER' }));
  const eEnquiries = db.getAll('education_enquiries').map(e => ({ ...e, module: 'EDUCATION' }));

  let all = [];
  if (module === 'BUILDER') all = bEnquiries;
  else if (module === 'EDUCATION') all = eEnquiries;
  else all = [...bEnquiries, ...eEnquiries];

  all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return res.json({
    success: true,
    total: all.length,
    builderCount: bEnquiries.length,
    educationCount: eEnquiries.length,
    data: all
  });
});

// PUT /api/portal/dashboard/enquiries/:id/status
router.put('/enquiries/:id/status', requirePortalAuth, requirePermission('enquiry:write'), (req, res) => {
  const enquiryId = req.params.id;
  const { status, notes } = req.body;

  let table = null;
  if (enquiryId.startsWith('ALS-ENQ-BLD-')) table = 'builder_enquiries';
  else if (enquiryId.startsWith('ALS-ENQ-EDU-')) table = 'education_enquiries';

  if (!table) {
    return res.status(400).json({ success: false, message: 'Invalid enquiry ID namespace.' });
  }

  const existing = db.getById(table, enquiryId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Enquiry record not found.' });
  }

  existing.status = status;
  if (notes) existing.admin_notes = notes;
  existing.updated_at = new Date().toISOString();

  db.upsert(table, 'enquiry_id', existing);
  db.logAudit(req.portalUser.userId, 'ENQUIRY', 'UPDATE_ENQUIRY_STATUS', { enquiryId, newStatus: status }, req.ip);

  return res.json({ success: true, message: 'Enquiry status updated.', data: existing });
});

// 4. Automation Control Centre & Emergency STOP
// GET /api/portal/dashboard/automation/status
router.get('/automation/status', requirePortalAuth, (req, res) => {
  return res.json({ success: true, data: db.getAutomationState() });
});

// POST /api/portal/dashboard/automation/emergency-stop
router.post('/automation/emergency-stop', requirePortalAuth, requirePermission('automation:stop'), (req, res) => {
  const { reason } = req.body;
  const now = new Date().toISOString();

  const updatedState = db.updateAutomationState({
    stop_active: true,
    stop_triggered_by: req.portalUser.username || req.portalUser.userId,
    stop_triggered_at: now,
    stop_reason: reason || 'Manual Emergency Halt Triggered via Portal Dashboard',
    email_marketing_active: false,
    whatsapp_marketing_active: false,
    auto_followups_active: false,
    inbound_enquiries_active: true // INBOUND FORMS PRESERVED!
  }, req.portalUser.userId, req.ip);

  console.warn(`[EMERGENCY STOP] Activated by ${req.portalUser.username} at ${now}. All outbound campaigns stopped!`);

  return res.json({
    success: true,
    message: 'EMERGENCY STOP ACTIVATED! All outbound marketing campaigns and auto follow-ups have been halted immediately. Inbound enquiries and CRM logging remain active.',
    data: updatedState
  });
});

// POST /api/portal/dashboard/automation/resume
router.post('/automation/resume', requirePortalAuth, requireRole('Super Administrator'), (req, res) => {
  const { channels = ['email', 'whatsapp', 'followups'] } = req.body;

  const updates = {
    stop_active: false,
    stop_triggered_by: null,
    stop_triggered_at: null,
    stop_reason: null
  };

  if (channels.includes('email')) updates.email_marketing_active = true;
  if (channels.includes('whatsapp')) updates.whatsapp_marketing_active = true;
  if (channels.includes('followups')) updates.auto_followups_active = true;

  const updatedState = db.updateAutomationState(updates, req.portalUser.userId, req.ip);

  return res.json({
    success: true,
    message: 'Automation workflows resumed successfully.',
    data: updatedState
  });
});

// POST /api/portal/dashboard/automation/sync
router.post('/automation/sync', requirePortalAuth, requirePermission('automation:write'), (req, res) => {
  const builders = db.getAll('builder_companies');
  const institutions = db.getAll('education_institutions');

  // Check duplicate builder names
  const builderNames = new Set();
  const builderDuplicates = [];
  builders.forEach(b => {
    const key = (b.company_name || '').toLowerCase().trim();
    if (builderNames.has(key)) builderDuplicates.push(b.company_name);
    else builderNames.add(key);
  });

  // Check duplicate institution names
  const instNames = new Set();
  const instDuplicates = [];
  institutions.forEach(i => {
    const key = (i.institution_name || '').toLowerCase().trim();
    if (instNames.has(key)) instDuplicates.push(i.institution_name);
    else instNames.add(key);
  });

  db.updateAutomationState({ last_sync_timestamp: new Date().toISOString() }, req.portalUser.userId, req.ip);

  return res.json({
    success: true,
    message: 'Synchronization & Data Quality audit completed successfully.',
    audit: {
      builderTotal: builders.length,
      builderDuplicatesFound: builderDuplicates.length,
      builderDuplicates,
      institutionTotal: institutions.length,
      institutionDuplicatesFound: instDuplicates.length,
      institutionDuplicates: instDuplicates,
      syncTimestamp: new Date().toISOString()
    }
  });
});

// 5. Audit Logs
// GET /api/portal/dashboard/audit-logs
router.get('/audit-logs', requirePortalAuth, requirePermission('audit:read'), (req, res) => {
  const { module, limit = 100 } = req.query;
  let logs = db.getAll('admin_audit_logs');
  if (module) {
    logs = logs.filter(l => l.module === module);
  }
  const l = parseInt(limit);
  return res.json({ success: true, total: logs.length, data: logs.slice(0, l) });
});

// 6. Unified Reports Generator
// GET /api/portal/dashboard/reports/unified-dashboard
router.get('/reports/unified-dashboard', requirePortalAuth, requirePermission('reports:export'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Unified Executive Overview');

    ws.columns = [
      { header: 'Metric Category', key: 'category', width: 30 },
      { header: 'Key Performance Indicator', key: 'kpi', width: 35 },
      { header: 'Live Value', key: 'val', width: 20 },
      { header: 'Verification Source / Evidence', key: 'evidence', width: 45 }
    ];

    const builders = db.getAll('builder_companies');
    const institutions = db.getAll('education_institutions');
    const bDeals = db.getAll('builder_pipeline');
    const eDeals = db.getAll('education_pipeline');

    const rows = [
      { category: 'Module A — Builder Partnerships', kpi: 'Total Maharashtra Builders Ingested', val: builders.length, evidence: 'Phase 3.1 & Phase 4 Source Datasets (10 Cities)' },
      { category: 'Module A — Builder Partnerships', kpi: 'Verified Builder Companies', val: builders.filter(b => b.verification_status === 'Verified').length, evidence: 'Official MahaRERA Filings & Corporate Registries' },
      { category: 'Module A — Builder Partnerships', kpi: 'Partnership-Ready Builders', val: builders.filter(b => b.outreach_readiness === 'APPROVED FOR IMMEDIATE OUTREACH').length, evidence: 'Verified Decision-Maker & Active Project Evidence' },
      { category: 'Module A — Builder Partnerships', kpi: 'Department Confirmation Pending', val: builders.filter(b => b.outreach_readiness === 'APPROVED AFTER CONTACT CONFIRMATION').length, evidence: 'Corporate Contact Awaiting Dept Routing' },
      { category: 'Module A — Builder Partnerships', kpi: 'Active Pipeline Deals', val: bDeals.filter(d => d.status === 'Active').length, evidence: '19-Stage Builder Partnership CRM Pipeline' },
      { category: 'Module B — Education Funding', kpi: 'Total Educational Institutions', val: institutions.length, evidence: 'India Education Database (Maharashtra & National Hubs)' },
      { category: 'Module B — Education Funding', kpi: 'Verified Educational Institutions', val: institutions.filter(i => i.verification_status === 'Verified').length, evidence: 'AISHE, UGC, AICTE, Affiliation Disclosures' },
      { category: 'Module B — Education Funding', kpi: 'Priority A+ Institutional Prospects', val: institutions.filter(i => i.lead_priority_tier === 'A+').length, evidence: '100-Point Scoring Model Benchmark Prospects' },
      { category: 'Module B — Education Funding', kpi: 'Active Institutional Funding Deals', val: eDeals.filter(d => d.status === 'Active').length, evidence: '24-Stage Education Institutional Pipeline' },
      { category: 'System Operations', kpi: 'Emergency Stop Status', val: db.getAutomationState().stop_active ? 'ACTIVE (STOPPED)' : 'NORMAL (RUNNING)', evidence: 'Central Automation Controller' }
    ];

    rows.forEach(r => ws.addRow(r));

    db.logAudit(req.portalUser.userId, 'REPORTS', 'EXPORT_UNIFIED_DASHBOARD_REPORT', {}, req.ip);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Unified_Dashboard_Report.xlsx"');
    await workbook.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('[UnifiedReport] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
});

module.exports = router;
