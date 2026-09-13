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

const { processIncomingLead, processIncomingLeadAsync, getAllLeads, getAllLeadsAsync, updateLeadStatus } = require('../services/centralLeadEngine.cjs');
const { isConnected } = require('../models/database.cjs');

// ── 1. POST /api/lead/submit & /api/lead/capture ───
router.post(['/submit', '/capture'], async (req, res) => {
  try {
    const rawData = req.body;
    console.log('[FormTracking] New Lead submission received:', rawData.name || rawData.fullName);

    // Process through Central Lead Engine (Deduplication, Lead ID generation, persistence)
    const centralResult = await processIncomingLeadAsync({ ...rawData, _skipSheetsSync: true });
    const lead = centralResult.lead;

    let sheetRes = { success: true, skipped: true, reason: 'DUPLICATE_LEAD' };
    if (!centralResult.isDuplicate) {
      // Format full Columns A to AU record
      const masterRecord = formatMasterRecord({
        ...rawData,
        leadId: lead.leadId,
        secureToken: lead.secureToken,
        mobile: lead.mobile,
        leadStatus: lead.status
      });

      // Sync to Google Sheet Master (only for fresh non-duplicate leads)
      sheetRes = await syncToGoogleSheetMaster(masterRecord);
    } else {
      console.log(`[FormTracking] Lead ${lead.leadId} (mobile: ${lead.mobile}) is a recognized duplicate. Skipping Google Sheets row creation.`);
    }

    // Sync to HubSpot CRM
    syncToHubSpot({
      name: rawData.fullName || rawData.name || lead.fullName,
      email: rawData.email || lead.email,
      phone: rawData.mobile || rawData.phone || lead.mobile,
      city: rawData.city || lead.city,
      loanType: rawData.loanProduct || rawData.loanType || lead.loanProduct,
      amount: rawData.loanAmount || rawData.amount || lead.loanAmount,
      source: rawData.leadSource || rawData.source || lead.leadSource,
      status: lead.status
    }).catch(err => console.warn('[HubSpot] non-fatal sync err:', err.message));

    // Sync to Zapier / Pabbly Webhook
    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL || process.env.PABBLY_CONNECT_URL;
    if (zapierUrl && !centralResult.isDuplicate) {
      axios.post(zapierUrl, rawData).catch(err => console.warn('[Zapier] non-fatal err:', err.message));
    }

    const dbAlive = typeof isConnected === 'function' && isConnected();

    return res.status(200).json({
      success: true,
      message: 'Thank you for contacting AVANI LOAN SERVICES. Fast application processing and professional loan guidance.',
      leadId: lead.leadId,
      priority: lead.priority || 'HOT',
      whatsAppUrl: getWhatsAppProductLink(lead.loanProduct || rawData.loanProduct),
      persistenceStatus: lead.persistenceStatus || (dbAlive ? 'DURABLY_PERSISTED' : 'ACCEPTED_FOR_PROCESSING'),
      storageLayer: lead.storageLayer || (dbAlive ? 'MONGODB_ATLAS' : 'IN_MEMORY_BUFFER'),
      googleSheetsSync: sheetRes,
      isDuplicate: !!centralResult.isDuplicate,
      lead: lead
    });
  } catch (err) {
    console.error('[FormTracking] Error submitting lead:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. GET /api/lead/all (Central Lead Database Fetch) ───────────
router.get('/all', async (req, res) => {
  try {
    const leads = await getAllLeadsAsync();
    const dbAlive = typeof isConnected === 'function' && isConnected();
    return res.json({
      success: true,
      persistenceStatus: dbAlive ? 'DURABLY_PERSISTED' : 'ACCEPTED_FOR_PROCESSING',
      storageLayer: dbAlive ? 'MONGODB_ATLAS' : 'IN_MEMORY_BUFFER',
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
