// src/routes/formTracking.cjs
// ─────────────────────────────────────────────────────────────────
// Express Router for Lead Capture, UTM Preservation & Link Library
// ─────────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { syncToGoogleSheetMaster, formatMasterRecord } = require('../utils/googleSheetsMaster.cjs');
const { getCompleteLinkLibrary, PRODUCTS, PLATFORMS, getWhatsAppProductLink } = require('../utils/marketingLinkLibrary.cjs');
const { syncToHubSpot } = require('../utils/hubSpot.cjs');
const axios = require('axios');

const { processIncomingLead } = require('../services/centralLeadEngine.cjs');

// ── 1. POST /api/lead/submit (Centralized Master Lead Capture) ───
router.post('/submit', async (req, res) => {
  try {
    const rawData = req.body;
    console.log('[FormTracking] New Lead submission received:', rawData.name || rawData.fullName);

    // Process through Central Lead Engine (Deduplication & Lead ID generation)
    const centralResult = processIncomingLead(rawData);
    const lead = centralResult.lead;

    // Format full Columns A to AU record
    const masterRecord = formatMasterRecord({
      ...rawData,
      leadId: lead.leadId,
      secureToken: lead.secureToken,
      mobile: lead.mobile,
      leadStatus: lead.status
    });

    // Sync to Google Sheet Master (skip if requested)
    let sheetRes = { success: true, skipped: true };
    if (!rawData._skipSheetsSync) {
      sheetRes = await syncToGoogleSheetMaster(masterRecord);
    }

    // ── Forward to Authoritative Master Lead Store: AVANI AI CRM ──
    const CRM_BASE_URL = process.env.AVANI_CRM_URL || process.env.NEXT_PUBLIC_CRM_URL || 'https://avani-ai-crm.vercel.app';
    const CRM_API_KEY = process.env.CRM_API_KEY || '';
    axios.post(`${CRM_BASE_URL}/api/leads`, {
      leadId: masterRecord.leadId,
      name: masterRecord.fullName,
      phone: masterRecord.mobile,
      email: masterRecord.email,
      city: masterRecord.city,
      loanType: masterRecord.loanProduct,
      requestedAmount: masterRecord.loanAmount,
      monthlyIncome: masterRecord.monthlyIncomeRange,
      leadSource: masterRecord.leadSource || 'WEBSITE',
      campaign: masterRecord.campaign || 'DIRECT',
      utmSource: masterRecord.utmSource,
      utmMedium: masterRecord.utmMedium,
      utmCampaign: masterRecord.utmCampaign,
      consentStatus: 'GRANTED',
      consentPurpose: 'LOAN_ELIGIBILITY_PROCESSING',
      idempotencyKey: `IDEMP-EXPRESS-${masterRecord.leadId}`
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(CRM_API_KEY ? { 'x-api-key': CRM_API_KEY } : {})
      },
      timeout: 8000
    }).catch(err => console.warn('[AVANI AI CRM] non-fatal sync err:', err.message));

    // Sync to HubSpot CRM
    syncToHubSpot({
      leadId: masterRecord.leadId,
      monthlyIncomeRange: masterRecord.monthlyIncomeRange,
      name: masterRecord.fullName,
      email: masterRecord.email,
      phone: masterRecord.mobile,
      city: masterRecord.city,
      loanType: masterRecord.loanProduct,
      amount: masterRecord.loanAmount,
      source: masterRecord.leadSource,
      status: masterRecord.leadStatus
    }).catch(err => console.warn('[HubSpot] non-fatal sync err:', err.message));

    // Sync to Zapier / Pabbly Webhook
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL || process.env.PABBLY_CONNECT_URL;
    if (zapierUrl) {
      axios.post(zapierUrl, masterRecord).catch(err => console.warn('[Zapier] non-fatal err:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for contacting AVANI LOAN SERVICES. Fast application processing and professional loan guidance.',
      leadId: masterRecord.leadId,
      priority: masterRecord.leadPriority,
      whatsAppUrl: getWhatsAppProductLink(masterRecord.loanProduct)
    });
  } catch (err) {
    console.error('[FormTracking] Error submitting lead:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. GET /api/lead/all (Central Lead Database Fetch) ───────────
const { getAllLeads, updateLeadStatus } = require('../services/centralLeadEngine.cjs');

router.get('/all', (req, res) => {
  try {
    const leads = getAllLeads();
    return res.json({
      success: true,
      totalLeads: leads.length,
      leads: leads
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. POST /api/lead/status-update ─────────────────────────────
router.post('/status-update', (req, res) => {
  try {
    const { leadId, status, notes } = req.body;
    const result = updateLeadStatus(leadId, status, notes);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Lead ID not found' });
    }

    return res.json({
      success: true,
      message: `Status updated to ${status} for ${leadId}`,
      lead: result.lead
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
