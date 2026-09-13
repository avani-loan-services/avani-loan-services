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
    const centralResult = await processIncomingLeadAsync(rawData);
    const lead = centralResult.lead;

    // Format full Columns A to AU record
    const masterRecord = formatMasterRecord({
      ...rawData,
      leadId: lead.leadId,
      secureToken: lead.secureToken,
      mobile: lead.mobile,
      leadStatus: lead.status
    });

    // Sync to Google Sheet Master
    const sheetRes = await syncToGoogleSheetMaster(masterRecord);

    // Sync to HubSpot CRM
    syncToHubSpot({
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

    const dbAlive = typeof isConnected === 'function' && isConnected();

    return res.status(200).json({
      success: true,
      message: 'Thank you for contacting AVANI LOAN SERVICES. Fast application processing and professional loan guidance.',
      leadId: masterRecord.leadId,
      priority: masterRecord.leadPriority,
      whatsAppUrl: getWhatsAppProductLink(masterRecord.loanProduct),
      persistenceStatus: lead.persistenceStatus || (dbAlive ? 'DURABLY_PERSISTED' : 'ACCEPTED_FOR_PROCESSING'),
      storageLayer: lead.storageLayer || (dbAlive ? 'MONGODB_ATLAS' : 'IN_MEMORY_BUFFER'),
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
