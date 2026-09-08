// src/services/centralLeadEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Central Lead Engine & Lifecycle Management for AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { syncToGoogleSheetMaster } = require('../utils/googleSheetsMaster.cjs');

const LEADS_FILE = path.join(__dirname, '../../uploads/central_leads.json');

// Ensure storage file exists
function ensureStorage() {
  const dir = path.dirname(LEADS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

function loadLeads() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveLeads(leads) {
  ensureStorage();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

/**
 * Normalize phone number to 10 digits
 */
function normalizeMobile(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Generate Sequential Monotonic Lead ID (ALS-2026-000001)
 * Scans existing leads to find max number to guarantee zero collisions.
 */
function generateLeadId(leads) {
  let maxSeq = 1000;
  if (Array.isArray(leads)) {
    for (const l of leads) {
      if (l && l.leadId) {
        const match = l.leadId.match(/ALS-2026-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    }
  }
  const nextNum = maxSeq + 1;
  const formatted = String(nextNum).padStart(6, '0');
  return `ALS-2026-${formatted}`;
}

/**
 * Generate Cryptographically Secure 32-Byte Token for Customer Upload Portal
 */
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Compute SHA-256 Hash of a token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

/**
 * Get Lead by Secure Document Portal Token
 * Enforces token expiration, revocation checks, and hash matching
 */
function getLeadByPortalToken(token) {
  if (!token || typeof token !== 'string' || token.trim() === '') return null;
  const leads = loadLeads();
  const incomingHash = hashToken(token.trim());
  const now = Date.now();

  const lead = leads.find(l => {
    if (l.portalTokenHash && l.portalTokenHash === incomingHash) {
      if (l.portalTokenRevoked) return false;
      if (l.portalTokenExpiresAt && l.portalTokenExpiresAt < now) return false;
      return true;
    }
    // Backward compatibility for existing records
    if (l.secureToken === token.trim()) {
      if (l.portalTokenRevoked) return false;
      if (l.portalTokenExpiresAt && l.portalTokenExpiresAt < now) return false;
      return true;
    }
    return false;
  });

  return lead || null;
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
  const leads = loadLeads();
  const mobile = normalizeMobile(leadPayload.mobile || leadPayload.phone);
  const normalizedSrc = normalizeSource(leadPayload.source || leadPayload.utm_source || leadPayload.leadSource);
  const idempotencyKey = leadPayload.idempotencyKey || leadPayload.sourceEventId || '';

  // Check for existing lead by idempotencyKey first, then mobile number
  let existingIndex = -1;
  if (idempotencyKey) {
    existingIndex = leads.findIndex(l => l.idempotencyKey === idempotencyKey);
  }
  if (existingIndex === -1 && mobile) {
    existingIndex = leads.findIndex(l => l.mobile === mobile);
  }

  if (existingIndex !== -1) {
    // DUPLICATE DETECTED
    const existing = leads[existingIndex];
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

    existing.duplicateEvents = duplicateHistory;
    existing.lastTouchDate = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    existing.duplicateCount = (existing.duplicateCount || 0) + 1;

    // Preserve original status if progressing, otherwise mark as DUPLICATE event logged
    leads[existingIndex] = existing;
    saveLeads(leads);

    return {
      isDuplicate: true,
      lead: existing,
      message: `Duplicate lead matched to existing Lead ID ${existing.leadId}`
    };
  }

  // NEW LEAD CREATION
  const leadId = generateLeadId(leads);
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

  leads.push(newLead);
  saveLeads(leads);

  // Sync to in-memory store if present
  try {
    const { getInMemoryStore } = require('../models/database.cjs');
    const store = getInMemoryStore();
    if (store && store.leads && mobile) {
      store.leads.set(mobile, newLead);
    }
  } catch (e) {}

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
  const leads = loadLeads();
  const norm = normalizeMobile(identifier);
  return leads.find(l => l.leadId === identifier || l.secureToken === identifier || (norm && l.mobile === norm)) || null;
}

/**
 * Update Lead Lifecycle Status
 */
function updateLeadStatus(identifier, newStatus, notes = '', actor = 'SYSTEM') {
  const leads = loadLeads();
  const norm = normalizeMobile(identifier);
  const index = leads.findIndex(l => l.leadId === identifier || l.secureToken === identifier || (norm && l.mobile === norm));

  if (index === -1) return null;

  const oldStatus = leads[index].status;
  const timestamp = new Date().toISOString();
  leads[index].status = newStatus;
  leads[index].currentWorkflowState = newStatus;
  leads[index].lastTouchDate = timestamp;
  leads[index].updatedAt = timestamp;
  if (notes) leads[index].followUpNotes = notes;

  leads[index].timeline = leads[index].timeline || [];
  leads[index].timeline.push({
    timestamp,
    fromStatus: oldStatus,
    toStatus: newStatus,
    reason: notes || 'Status update',
    actor
  });

  saveLeads(leads);
  console.log(`[CentralLeadEngine] Status transition for ${leads[index].leadId}: ${oldStatus} ➔ ${newStatus}`);

  return { lead: leads[index], oldStatus, newStatus };
}

/**
 * Update Lead with arbitrary fields
 */
function updateLead(identifier, updates, actor = 'SYSTEM') {
  const leads = loadLeads();
  const norm = normalizeMobile(identifier);
  const index = leads.findIndex(l => l.leadId === identifier || l.secureToken === identifier || (norm && l.mobile === norm));

  if (index === -1) return null;

  const timestamp = new Date().toISOString();
  Object.assign(leads[index], updates, { updatedAt: timestamp });

  if (updates.status && updates.status !== leads[index].status) {
    leads[index].timeline = leads[index].timeline || [];
    leads[index].timeline.push({
      timestamp,
      fromStatus: leads[index].status,
      toStatus: updates.status,
      reason: updates.statusReason || 'Lead updated',
      actor
    });
  }

  saveLeads(leads);
  return leads[index];
}

/**
 * Get All Leads
 */
function getAllLeads() {
  return loadLeads();
}

module.exports = {
  processIncomingLead,
  getLead,
  getLeadByPortalToken,
  revokePortalToken,
  hashToken,
  generateSecureToken,
  updateLeadStatus,
  updateLead,
  getAllLeads,
  normalizeMobile,
  generateLeadId
};
