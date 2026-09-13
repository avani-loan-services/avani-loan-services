// src/services/centralLeadEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Central Lead Engine & Lifecycle Management for AVANI LOAN SERVICES
// AVANI LOAN SERVICES — ZERO LOCAL FILESYSTEM / ZERO /TMP DEPENDENCY
// ─────────────────────────────────────────────────────────────────

const crypto = require('crypto');
const { syncToGoogleSheetMaster } = require('../utils/googleSheetsMaster.cjs');
const {
  saveLead: persistSaveLead,
  saveLeadAsync: persistSaveLeadAsync,
  findLeadById,
  findLeadByIdAsync,
  findLeadByMobile,
  findLeadByIdempotencyKey,
  findLeadByPortalToken: persistFindLeadByPortalToken,
  updateLead: persistUpdateLead,
  getAllLeads: persistGetAllLeads,
  getAllLeadsAsync: persistGetAllLeadsAsync,
  normalizeMobile,
  hashToken,
  generateLeadId: persistGenerateLeadId,
  getNextAtomicLeadId,
  formatCanonicalLeadId
} = require('./leadPersistenceService.cjs');

/**
 * Generate Lead ID (Canonical ALS-2026-XXXXXX format)
 * Production MongoDB persistence executes getNextAtomicLeadId() atomically.
 * Synchronous calls delegate to the persistence service fallback generator.
 */
function generateLeadId(leads) {
  return persistGenerateLeadId();
}

/**
 * Generate Cryptographically Secure 32-Byte Token for Customer Upload Portal
 */
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get Lead by Secure Document Portal Token
 * Enforces token expiration, revocation checks, and hash matching
 */
function getLeadByPortalToken(token) {
  return persistFindLeadByPortalToken(token);
}

/**
 * Revoke a customer's document portal token
 */
function revokePortalToken(leadId, reason = 'Revoked by Advisor') {
  return updateLead(leadId, {
    portalTokenRevoked: true,
    portalTokenRevokedAt: new Date().toISOString(),
    portalTokenRevocationReason: reason
  });
}

/**
 * Normalize Lead Source into standard categories
 */
function normalizeSource(source) {
  const s = String(source || '').toUpperCase();
  if (s.includes('FACEBOOK') || s.includes('FB')) return 'META_FACEBOOK';
  if (s.includes('INSTAGRAM') || s.includes('IG')) return 'META_INSTAGRAM';
  if (s.includes('META_LEAD')) return 'META_LEAD_AD';
  if (s.includes('WHATSAPP') || s.includes('WA')) return 'WHATSAPP';
  if (s.includes('GOOGLE_FORM')) return 'GOOGLE_FORM';
  if (s.includes('GOOGLE_SHEET')) return 'GOOGLE_SHEET';
  if (s.includes('AISENSY')) return 'AISENSY';
  if (s.includes('OMNIDM')) return 'OMNIDM';
  if (s.includes('MANUAL')) return 'MANUAL_CRM';
  if (s.includes('REFERRAL')) return 'REFERRAL';
  if (s.includes('WEBSITE')) return 'WEBSITE';
  return 'WEBSITE';
}

/**
 * Create or Deduplicate Incoming Lead
 */
function processIncomingLead(leadPayload) {
  const mobile = normalizeMobile(leadPayload.mobile || leadPayload.phone);
  const normalizedSrc = normalizeSource(leadPayload.source || leadPayload.utm_source || leadPayload.leadSource);
  const idempotencyKey = leadPayload.idempotencyKey || leadPayload.sourceEventId || '';

  // Check for existing lead by idempotencyKey first, then mobile number
  let existing = null;
  if (idempotencyKey) {
    existing = findLeadByIdempotencyKey(idempotencyKey);
  }
  if (!existing && mobile) {
    existing = findLeadByMobile(mobile);
  }

  if (existing) {
    // DUPLICATE DETECTED
    console.log(`[CentralLeadEngine] Duplicate detected for mobile ${mobile}. Original Lead ID: ${existing.leadId}`);

    const duplicateHistory = existing.duplicateEvents || [];
    duplicateHistory.push({
      timestamp: new Date().toISOString(),
      source: normalizedSrc,
      campaign: leadPayload.campaign || leadPayload.utm_campaign || 'N/A',
      adSet: leadPayload.adSet || 'N/A',
      ad: leadPayload.ad || leadPayload.utm_content || 'N/A',
      idempotencyKey: idempotencyKey || 'N/A'
    });

    const updates = {
      duplicateEvents: duplicateHistory,
      lastTouchDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duplicateCount: (existing.duplicateCount || 0) + 1
    };

    const updated = persistUpdateLead(existing.leadId, updates);

    return {
      isDuplicate: true,
      lead: updated || existing,
      message: `Duplicate lead matched to existing Lead ID ${existing.leadId}`
    };
  }

  // NEW LEAD CREATION
  const leadId = leadPayload.leadId || generateLeadId();
  const secureToken = generateSecureToken();
  const tokenHash = hashToken(secureToken);
  const tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7-day expiration
  const timestamp = new Date().toISOString();

  const newLead = {
    leadId: leadId,
    secureToken: secureToken,
    portalTokenHash: tokenHash,
    portalTokenExpiresAt: tokenExpiresAt,
    portalTokenRevoked: false,
    fullName: leadPayload.fullName || leadPayload.name || 'Valued Customer',
    mobile: mobile,
    whatsapp: normalizeMobile(leadPayload.whatsapp || mobile),
    email: leadPayload.email || '',
    city: leadPayload.city || 'Latur',
    state: leadPayload.state || 'Maharashtra',
    preferredLanguage: leadPayload.preferredLanguage || 'English/Marathi',

    leadSource: normalizedSrc,
    source: normalizedSrc,
    platform: leadPayload.platform || 'Meta / Web',
    campaign: leadPayload.campaign || leadPayload.utm_campaign || 'ALS_CAMPAIGN_2026',
    adSet: leadPayload.adSet || 'Default AdSet',
    ad: leadPayload.ad || leadPayload.utm_content || 'Default Ad',
    form: leadPayload.form || 'Central Lead Form',
    landingPage: leadPayload.landingPage || 'https://www.avanifinserv.com/contact',

    utmSource: leadPayload.utm_source || 'website',
    utmMedium: leadPayload.utm_medium || 'cpc',
    utmCampaign: leadPayload.utm_campaign || 'ALS_CAMPAIGN_2026',
    utmContent: leadPayload.utm_content || 'ad',
    utmTerm: leadPayload.utm_term || '',

    firstTouchDate: timestamp,
    lastTouchDate: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,

    // Loan details
    loanType: leadPayload.loanType || leadPayload.loanProduct || 'Personal / Salary Loan',
    loanProduct: leadPayload.loanProduct || leadPayload.loanType || 'Personal / Salary Loan',
    requestedAmount: leadPayload.requestedAmount || leadPayload.loanAmount || leadPayload.amount || 'Below ₹5 Lakh',
    loanAmount: leadPayload.loanAmount || leadPayload.requestedAmount || leadPayload.amount || 'Below ₹5 Lakh',
    applicantType: leadPayload.applicantType || 'INDIVIDUAL',
    employmentType: leadPayload.employmentType || 'Salaried',
    profession: leadPayload.profession || 'OTHER_PROFESSIONAL',
    monthlyIncome: leadPayload.monthlyIncome || '₹25,000–₹50,000',
    businessTurnover: leadPayload.businessTurnover || '',
    existingEmi: leadPayload.existingEmi || 'No',
    cibilStatus: leadPayload.cibilStatus || 'Prefer to discuss',
    cibilScore: leadPayload.cibilScore || 0,
    propertyInfo: leadPayload.propertyInfo || leadPayload.propertyDetails || '',
    educationInfo: leadPayload.educationInfo || leadPayload.educationDetails || '',

    // Pipeline
    status: 'NEW_LEAD',
    currentWorkflowState: 'NEW_LEAD',
    priority: leadPayload.priority || 'HOT',
    leadScore: leadPayload.leadScore || 50,
    leadScoreGrade: leadPayload.leadScoreGrade || 'WARM',
    assignedAdvisor: leadPayload.assignedAdvisor || 'Sachin Shinde',
    qualificationStatus: 'NOT_EVALUATED',
    qualificationAnswers: leadPayload.qualificationAnswers || {},
    documentStatus: 'NOT_REQUESTED',
    requiredDocuments: [],
    receivedDocuments: [],
    missingDocuments: [],
    followUps: [],
    nextFollowUp: '',
    lastContactedAt: '',

    // Audit & Timeline
    createdBy: leadPayload.createdBy || normalizedSrc,
    updatedBy: 'SYSTEM',
    sourceEventId: leadPayload.sourceEventId || '',
    idempotencyKey: idempotencyKey,
    correlationId: leadPayload.correlationId || `CORR-${Date.now()}`,
    duplicateEvents: [],
    duplicateCount: 0,
    communicationHistory: [],
    timeline: [{
      timestamp: timestamp,
      fromStatus: null,
      toStatus: 'NEW_LEAD',
      reason: 'Initial Lead Creation',
      actor: normalizedSrc
    }]
  };

  persistSaveLead(newLead);

  // Background sync to Google Sheet Master
  syncToGoogleSheetMaster(newLead).catch(err => console.warn('[CentralLeadEngine] Sheets sync non-fatal:', err.message));

  return {
    isDuplicate: false,
    lead: newLead,
    message: `New Lead ${leadId} created successfully`
  };
}

/**
 * Get Lead by Lead ID or Secure Token or Mobile
 */
function getLead(identifier) {
  if (!identifier) return null;
  return findLeadById(identifier) || findLeadByMobile(identifier) || persistFindLeadByPortalToken(identifier) || null;
}

/**
 * Update Lead Lifecycle Status
 */
function updateLeadStatus(identifier, newStatus, notes = '', actor = 'SYSTEM') {
  const lead = getLead(identifier);
  if (!lead) return null;

  const oldStatus = lead.status;
  const updates = {
    status: newStatus,
    currentWorkflowState: newStatus,
    lastTouchDate: new Date().toISOString()
  };
  if (notes) updates.followUpNotes = notes;

  const updated = persistUpdateLead(lead.leadId, updates, actor);
  console.log(`[CentralLeadEngine] Status transition for ${lead.leadId}: ${oldStatus} ➔ ${newStatus}`);

  return { lead: updated || lead, oldStatus, newStatus };
}

/**
 * Update Lead with arbitrary fields
 */
function updateLead(identifier, updates, actor = 'SYSTEM') {
  return persistUpdateLead(identifier, updates, actor);
}

/**
 * Get All Leads
 */
function getAllLeads() {
  return persistGetAllLeads();
}

/**
 * Asynchronously process incoming lead with atomic sequence allocation and awaited DB persistence
 */
async function processIncomingLeadAsync(leadPayload) {
  if (!leadPayload.leadId) {
    leadPayload = { ...leadPayload, leadId: await getNextAtomicLeadId() };
  }
  const result = processIncomingLead(leadPayload);
  if (result && result.lead) {
    await persistSaveLeadAsync(result.lead).catch(() => {});
  }
  return result;
}

module.exports = {
  processIncomingLead,
  processIncomingLeadAsync,
  getLead,
  getLeadByPortalToken,
  revokePortalToken,
  hashToken,
  generateSecureToken,
  updateLeadStatus,
  updateLead,
  getAllLeads,
  getAllLeadsAsync: persistGetAllLeadsAsync,
  findLeadByIdAsync,
  normalizeMobile,
  generateLeadId,
  getNextAtomicLeadId,
  formatCanonicalLeadId
};
