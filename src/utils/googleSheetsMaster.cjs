// src/utils/googleSheetsMaster.cjs
// ─────────────────────────────────────────────────────────────────
// Complete Lead Master Schema & Tracking Synchronization Engine
// Columns A through AU (47 fields total)
// ─────────────────────────────────────────────────────────────────
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const APPS_SCRIPT_URL =
  process.env.GOOGLE_SHEET_APP_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyoAmAabpO9PUDH-AXatZm5Td7pO9n5W00Eoh6TNIkPtjbQZiYrhAv27XgyMtJdBxchEg/exec';

let globalLeadCounter = Date.now() % 100000;

/**
 * Generate unique Lead ID (ALS-2026-000001)
 */
function generateLeadId() {
  globalLeadCounter += 1;
  const formatted = ("000000" + globalLeadCounter).slice(-6);
  return `ALS-2026-${formatted}`;
}

/**
 * Calculate automated lead priority (HOT, WARM, COLD)
 */
function calculatePriority(lead) {
  let score = 0;
  const amount = String(lead.amount || lead.loanAmount || '');
  const prefTime = String(lead.preferredCallTime || '');
  const income = String(lead.monthlyIncome || '');

  if (amount.includes('50') || amount.includes('1 Crore') || amount.includes('Above')) score += 3;
  if (prefTime.toLowerCase().includes('immediately') || prefTime.toLowerCase().includes('1 hour')) score += 3;
  if (income.includes('1–2') || income.includes('Above') || income.includes('50K')) score += 2;

  if (score >= 5) return 'HOT';
  if (score >= 2) return 'WARM';
  return 'COLD';
}

/**
 * Clean phone number to 10 digits
 */
function sanitizePhone(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Format full Lead Master record (Columns A to AU)
 */
function formatMasterRecord(lead) {
  const leadId = lead.leadId || generateLeadId();
  const priority = lead.priority || calculatePriority(lead);
  const mobile = sanitizePhone(lead.mobile || lead.phone);
  const whatsapp = sanitizePhone(lead.whatsapp || mobile);

  return {
    leadId: leadId,                                              // A: Lead ID
    timestamp: lead.timestamp || new Date().toISOString(),      // B: Timestamp
    fullName: lead.fullName || lead.name || 'Valued Customer',  // C: Full Name
    mobile: mobile,                                              // D: Mobile
    whatsapp: whatsapp,                                          // E: WhatsApp
    email: lead.email || '',                                    // F: Email
    city: lead.city || 'Latur',                                 // G: City
    state: lead.state || 'Maharashtra',                         // H: State
    customerProfile: lead.customerProfile || 'Salaried Professional', // I: Customer Profile
    loanProduct: lead.loanProduct || lead.loanType || 'Personal / Salary Loan', // J: Loan Product
    loanAmount: lead.loanAmount || lead.amount || 'Below ₹5 Lakh', // K: Loan Amount
    employmentType: lead.employmentType || 'Salaried',          // L: Employment Type
    monthlyIncomeRange: lead.monthlyIncome || '₹25,000–₹50,000', // M: Monthly Income Range
    existingLoan: lead.existingLoan || 'No',                    // N: Existing Loan
    cibilRange: lead.cibilRange || 'Prefer to discuss',          // O: CIBIL Range
    educationCountry: lead.educationCountry || '',              // P: Education Country
    course: lead.course || '',                                  // Q: Course
    university: lead.university || '',                          // R: University
    businessType: lead.businessType || '',                      // S: Business Type
    businessVintage: lead.businessVintage || '',                // T: Business Vintage
    annualTurnover: lead.annualTurnover || '',                  // U: Annual Turnover
    propertyType: lead.propertyType || '',                      // V: Property Type
    propertyLocation: lead.propertyLocation || '',              // W: Property Location
    propertyValue: lead.propertyValue || '',                    // X: Property Value
    contactPreference: lead.contactPreference || 'WhatsApp + Call', // Y: Contact Preference
    preferredCallTime: lead.preferredCallTime || 'Immediately', // Z: Preferred Call Time
    consent: 'I agree to be contacted by AVANI LOAN SERVICES regarding my loan enquiry.', // AA: Consent
    leadSource: lead.utm_source || lead.source || 'website',    // AB: Lead Source
    platform: lead.platform || 'Website',                       // AC: Platform
    campaign: lead.utm_campaign || 'ALS_DIRECT_2026',           // AD: Campaign
    adSet: lead.adSet || 'Default AdSet',                       // AE: Ad Set
    adCreative: lead.utm_content || 'general_enquiry',          // AF: Ad / Creative
    utmSource: lead.utm_source || 'website',                    // AG: UTM Source
    utmMedium: lead.utm_medium || 'cpc',                        // AH: UTM Medium
    utmCampaign: lead.utm_campaign || 'ALS_DIRECT_2026',        // AI: UTM Campaign
    utmContent: lead.utm_content || 'cta',                      // AJ: UTM Content
    utmTerm: lead.utm_term || '',                               // AK: UTM Term
    landingPage: lead.landingPage || 'https://www.avanifinserv.com/contact', // AL: Landing Page
    leadStatus: lead.status || 'New',                           // AM: Lead Status
    leadPriority: priority,                                     // AN: Lead Priority
    assignedTo: 'Unassigned',                                   // AO: Assigned To
    firstContactDate: new Date().toISOString(),                 // AP: First Contact Date
    followUpDate: '',                                           // AQ: Follow-up Date
    followUpNotes: 'Lead logged cleanly into Master System',     // AR: Follow-up Notes
    loanAmountApproved: '',                                     // AS: Loan Amount Approved
    conversionStatus: 'Pending',                                // AT: Conversion Status
    lostReason: ''                                              // AU: Lost Reason
  };
}

/**
 * Synchronize full record to Google Sheet Apps Script Web App
 */
async function syncToGoogleSheetMaster(leadData) {
  const masterRecord = formatMasterRecord(leadData);

  try {
    const res = await axios.post(APPS_SCRIPT_URL, masterRecord, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log('[GoogleSheetMaster] Sync success:', res.status, masterRecord.leadId);
    return { success: true, record: masterRecord, response: res.data };
  } catch (err) {
    console.error('[GoogleSheetMaster] Sync error (non-fatal):', err.message);
    return { success: false, record: masterRecord, error: err.message };
  }
}

module.exports = {
  formatMasterRecord,
  syncToGoogleSheetMaster,
  generateLeadId,
  calculatePriority
};
