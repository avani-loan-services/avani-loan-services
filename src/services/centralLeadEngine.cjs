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
 * Generate Sequential Lead ID (ALS-2026-000001)
 */
function generateLeadId(leads) {
  const nextNum = leads.length + 1001;
  const formatted = ("000000" + nextNum).slice(-6);
  return `ALS-2026-${formatted}`;
}

/**
 * Generate Secure Token for Customer Upload Portal
 */
function generateSecureToken() {
  return crypto.randomBytes(16).toString('hex');
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
  const normalizedSrc = normalizeSource(leadPayload.source || leadPayload.utm_source);

  // Check for existing lead by mobile number
  const existingIndex = leads.findIndex(l => l.mobile === mobile);

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
      ad: leadPayload.ad || leadPayload.utm_content || 'N/A'
    });

    existing.duplicateEvents = duplicateHistory;
    existing.lastTouchDate = new Date().toISOString();
    existing.duplicateCount = (existing.duplicateCount || 0) + 1;
    existing.status = existing.status === 'NEW' ? 'DUPLICATE' : existing.status;

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
  const timestamp = new Date().toISOString();

  const newLead = {
    leadId: leadId,
    secureToken: secureToken,
    fullName: leadPayload.fullName || leadPayload.name || 'Valued Customer',
    mobile: mobile,
    whatsapp: normalizeMobile(leadPayload.whatsapp || mobile),
    email: leadPayload.email || '',
    city: leadPayload.city || 'Latur',
    state: leadPayload.state || 'Maharashtra',
    preferredLanguage: leadPayload.preferredLanguage || 'English/Marathi',

    leadSource: normalizedSrc,
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

    loanProduct: leadPayload.loanProduct || leadPayload.loanType || 'Personal / Salary Loan',
    loanAmount: leadPayload.loanAmount || leadPayload.amount || 'Below ₹5 Lakh',
    employmentType: leadPayload.employmentType || 'Salaried',
    monthlyIncome: leadPayload.monthlyIncome || '₹25,000–₹50,000',
    businessTurnover: leadPayload.businessTurnover || '',
    existingEmi: leadPayload.existingEmi || 'No',
    cibilStatus: leadPayload.cibilStatus || 'Prefer to discuss',
    propertyDetails: leadPayload.propertyDetails || '',
    educationDetails: leadPayload.educationDetails || '',

    status: 'NEW', // Initial lifecycle status
    priority: leadPayload.priority || 'HOT',
    assignedTo: 'Unassigned',
    documentStatus: 'DOCUMENTS_PENDING',
    receivedDocuments: [],
    missingDocuments: [],
    duplicateEvents: [],
    duplicateCount: 0
  };

  leads.push(newLead);
  saveLeads(leads);

  // Background sync to Google Sheet Master
  syncToGoogleSheetMaster(newLead).catch(err => console.warn('[CentralLeadEngine] Sheets sync non-fatal:', err.message));

  return {
    isDuplicate: false,
    lead: newLead,
    message: `New Lead ${leadId} created successfully`
  };
}

/**
 * Get Lead by Lead ID or Secure Token
 */
function getLead(identifier) {
  const leads = loadLeads();
  return leads.find(l => l.leadId === identifier || l.secureToken === identifier) || null;
}

/**
 * Update Lead Lifecycle Status
 */
function updateLeadStatus(identifier, newStatus, notes = '') {
  const leads = loadLeads();
  const index = leads.findIndex(l => l.leadId === identifier || l.secureToken === identifier);

  if (index === -1) return null;

  const oldStatus = leads[index].status;
  leads[index].status = newStatus;
  leads[index].lastTouchDate = new Date().toISOString();
  if (notes) leads[index].followUpNotes = notes;

  saveLeads(leads);
  console.log(`[CentralLeadEngine] Status transition for ${leads[index].leadId}: ${oldStatus} ➔ ${newStatus}`);

  return { lead: leads[index], oldStatus, newStatus };
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
  updateLeadStatus,
  getAllLeads,
  normalizeMobile,
  generateLeadId
};
