// src/routes/crm.cjs
// ─────────────────────────────────────────────────────────────────
// Comprehensive Express Router for AVANI AI CRM Pipeline & Operations
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { syncToCrm } = require('../services/crmService.cjs');
const {
  getDashboardMetrics,
  queryLeads,
  transitionLeadStage,
  scheduleFollowUp,
  completeFollowUp
} = require('../services/crmPipelineEngine.cjs');
const { getLead, processIncomingLead, updateLead } = require('../services/centralLeadEngine.cjs');
const { evaluateQualification, getQualificationSchema } = require('../services/loanQualificationEngine.cjs');
const { generateChecklistForLead, reviewDocument } = require('../services/documentWorkflowEngine.cjs');
const { sendJourneyTemplate, handleCustomerEvent } = require('../services/whatsappJourneyEngine.cjs');
const { runVoiceQualificationWorkflow } = require('../services/aiVoiceWorkflowEngine.cjs');

// ── 1. GET /api/crm/dashboard ────────────────────────────────────
router.get('/dashboard', (req, res) => {
  try {
    const metrics = getDashboardMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    console.error('[CRM Route] Dashboard error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. GET /api/crm/leads (Query, Filter, Search, Paginate) ──────
router.get('/leads', (req, res) => {
  try {
    const result = queryLeads(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[CRM Route] Leads query error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. GET /api/crm/leads/:id (Lead Details) ─────────────────────
router.get('/leads/:id', (req, res) => {
  try {
    const lead = getLead(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Attach dynamic checklist if not already present
    if (!lead.requiredDocuments || lead.requiredDocuments.length === 0) {
      lead.requiredDocuments = generateChecklistForLead(lead.loanProduct, lead.employmentType, lead.profession);
    }

    // Attach qualification schema
    const schema = getQualificationSchema(lead.loanProduct);

    res.json({
      success: true,
      lead,
      qualificationSchema: schema
    });
  } catch (err) {
    console.error('[CRM Route] Lead details error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. POST /api/crm/leads (Create / Manual Ingest) ──────────────
router.post('/leads', (req, res) => {
  try {
    const payload = {
      ...req.body,
      source: req.body.source || 'MANUAL_CRM',
      createdBy: req.body.createdBy || 'Loan Advisor'
    };
    const result = processIncomingLead(payload);
    res.status(result.isDuplicate ? 200 : 201).json(result);
  } catch (err) {
    console.error('[CRM Route] Create lead error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. POST /api/crm/leads/:id/transition (Pipeline Transition) ──
router.post('/leads/:id/transition', (req, res) => {
  try {
    const targetStage = req.body.targetStage || req.body.toStage;
    const reason = req.body.reason || req.body.note;
    const actor = req.body.actor;
    const result = transitionLeadStage(req.params.id, targetStage, { reason, actor });
    if (!result.success) {
      const statusCode = result.error && result.error.includes('not found') ? 404 : 400;
      return res.status(statusCode).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Transition error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 6. POST /api/crm/leads/:id/qualify (Run Qualification) ───────
router.post('/leads/:id/qualify', (req, res) => {
  try {
    const lead = getLead(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    const answers = req.body.answers || req.body;
    const evaluation = evaluateQualification(lead.loanProduct, answers);

    const updated = updateLead(lead.leadId, {
      qualificationStatus: evaluation.qualificationStatus,
      qualificationAnswers: answers,
      leadScore: evaluation.leadScore,
      leadScoreGrade: evaluation.leadScoreGrade
    }, req.body.actor || 'SYSTEM');

    res.json({
      success: true,
      leadId: lead.leadId,
      evaluation,
      lead: updated
    });
  } catch (err) {
    console.error('[CRM Route] Qualify error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 7. POST /api/crm/leads/:id/followups (Schedule Follow-Up) ────
router.post('/leads/:id/followups', (req, res) => {
  try {
    const result = scheduleFollowUp(req.params.id, req.body);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Schedule follow-up error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 8. PATCH /api/crm/leads/:id/followups/:followupId (Complete) ─
router.patch('/leads/:id/followups/:followupId', (req, res) => {
  try {
    const { outcome, notes } = req.body;
    const result = completeFollowUp(req.params.id, req.params.followupId, outcome, notes);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Complete follow-up error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 9. POST /api/crm/leads/:id/documents/:docId/review ───────────
router.post('/leads/:id/documents/:docId/review', (req, res) => {
  try {
    const { decision, reviewerNotes, reviewer } = req.body;
    const result = reviewDocument(req.params.id, req.params.docId, decision, reviewerNotes, reviewer);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Document review error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 10. POST /api/crm/leads/:id/whatsapp-journey (Trigger Step) ──
router.post('/leads/:id/whatsapp-journey', async (req, res) => {
  try {
    const { templateKey, customVars } = req.body;
    const result = await sendJourneyTemplate(req.params.id, templateKey, customVars);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] WhatsApp journey error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 11. POST /api/crm/leads/:id/voice-workflow (Run AI Voice) ────
router.post('/leads/:id/voice-workflow', async (req, res) => {
  try {
    const { simulatedResponses } = req.body;
    const result = await runVoiceQualificationWorkflow(req.params.id, simulatedResponses);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[CRM Route] Voice workflow error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 12. POST /api/crm/sync (Legacy Sync Endpoint) ────────────────
router.post('/sync', async (req, res) => {
  try {
    await syncToCrm(req.body);
    res.json({ success: true, message: 'Synced to CRM' });
  } catch (error) {
    console.error('[CRM Route] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
