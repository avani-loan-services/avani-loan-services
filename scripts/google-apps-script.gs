/**
 * ============================================================================
 * AVANI LOAN SERVICES — Master Google Form + Google Sheet Automation Engine
 * File: scripts/google-apps-script.gs
 * ============================================================================
 * 
 * Features:
 * 1. Automatic Unique Lead ID Generation (ALS-2026-000001, ALS-2026-000002...)
 * 2. Automatic Lead Priority Scoring (HOT, WARM, COLD)
 * 3. Duplicate Lead Detection by Mobile Number
 * 4. Dashboard Metrics & Source Performance Aggregation
 * 5. Outbound Webhook Sync to HubSpot CRM, Zapier, and Express API
 * 6. Link Library & Marketing Link Generator
 */

// Global Configuration
const CONFIG = {
  SHEET_LEAD_MASTER: "AVANI LOAN SERVICES – Lead Master",
  SHEET_DASHBOARD: "Dashboard",
  SHEET_SOURCE_REPORT: "Marketing Source Report",
  SHEET_LINK_LIBRARY: "Link Library",
  LEAD_ID_PREFIX: "ALS-2026-",
  HUBSPOT_WEBHOOK_URL: "https://www.avanifinserv.com/api/crm/sync",
  EXPRESS_API_URL: "https://www.avanifinserv.com/api/whatsapp/qualify"
};

/**
 * Triggered automatically when a Google Form submission is received
 */
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_LEAD_MASTER);
    if (!sheet) {
      sheet = setupLeadMasterSheet(ss);
    }

    const responses = e ? e.namedValues : {};
    const timestamp = new Date();
    
    // Extract Form Fields
    const fullName = getVal(responses, ['Full Name', 'Name'], 'Valued Customer');
    const mobile = cleanPhone(getVal(responses, ['Mobile Number', 'Mobile', 'Phone'], ''));
    const whatsapp = cleanPhone(getVal(responses, ['WhatsApp Number'], mobile));
    const email = getVal(responses, ['Email Address', 'Email'], '');
    const city = getVal(responses, ['City'], 'Latur');
    const state = getVal(responses, ['State'], 'Maharashtra');
    
    const customerProfile = getVal(responses, ['What best describes you?', 'Customer Profile'], 'Salaried Professional');
    const loanProduct = getVal(responses, ['Which loan do you need?', 'Loan Product'], 'Personal / Salary Loan');
    const loanAmount = getVal(responses, ['Approximate loan amount required?', 'Loan Amount'], 'Below ₹5 Lakh');
    const employmentType = getVal(responses, ['What is your employment type?'], 'Salaried');
    const monthlyIncome = getVal(responses, ['Approximate monthly income?'], '₹25,000–₹50,000');
    const existingLoan = getVal(responses, ['Do you currently have any existing loan?'], 'No');
    const cibilRange = getVal(responses, ['Do you know your approximate CIBIL score?'], 'Prefer to discuss');

    // Conditional Fields
    const eduCountry = getVal(responses, ['Country of Study'], '');
    const course = getVal(responses, ['Course / Program'], '');
    const university = getVal(responses, ['University / College'], '');
    const bizType = getVal(responses, ['Business Type'], '');
    const bizVintage = getVal(responses, ['Business Vintage'], '');
    const annualTurnover = getVal(responses, ['Approximate Annual Turnover'], '');
    const propType = getVal(responses, ['Property Type'], '');
    const propLocation = getVal(responses, ['Property Location'], '');
    const propValue = getVal(responses, ['Approximate Property Value'], '');

    const contactPref = getVal(responses, ['How should our team contact you?'], 'WhatsApp + Call');
    const preferredCallTime = getVal(responses, ['When would you prefer a call?'], 'Immediately');
    const consent = getVal(responses, ['Customer Consent', 'I agree to be contacted...'], 'Agreed');

    // Tracking / UTM Fields
    const utmSource = getVal(responses, ['utm_source', 'Source'], 'website');
    const utmMedium = getVal(responses, ['utm_medium', 'Medium'], 'organic');
    const utmCampaign = getVal(responses, ['utm_campaign', 'Campaign'], 'ALS_DIRECT_2026');
    const utmContent = getVal(responses, ['utm_content', 'Ad Content'], 'general_enquiry');
    const utmTerm = getVal(responses, ['utm_term'], '');
    const platform = getPlatformFromSource(utmSource);

    // Generate Lead ID & Check Duplicates
    const lastRow = sheet.getLastRow();
    const leadId = generateLeadId(lastRow);
    const isDuplicate = checkDuplicateMobile(sheet, mobile);

    const leadStatus = isDuplicate ? 'Duplicate' : 'New';
    const leadPriority = calculateLeadPriority(loanAmount, preferredCallTime, contactPref, monthlyIncome);

    // Row Data Array (Columns A to AU)
    const rowData = [
      leadId,                     // A: Lead ID
      timestamp,                  // B: Timestamp
      fullName,                   // C: Full Name
      mobile,                     // D: Mobile
      whatsapp,                   // E: WhatsApp
      email,                      // F: Email
      city,                       // G: City
      state,                      // H: State
      customerProfile,            // I: Customer Profile
      loanProduct,                // J: Loan Product
      loanAmount,                 // K: Loan Amount
      employmentType,             // L: Employment Type
      monthlyIncome,              // M: Monthly Income Range
      existingLoan,               // N: Existing Loan
      cibilRange,                 // O: CIBIL Range
      eduCountry,                 // P: Education Country
      course,                     // Q: Course
      university,                 // R: University
      bizType,                    // S: Business Type
      bizVintage,                 // T: Business Vintage
      annualTurnover,             // U: Annual Turnover
      propType,                   // V: Property Type
      propLocation,               // W: Property Location
      propValue,                  // X: Property Value
      contactPref,                // Y: Contact Preference
      preferredCallTime,          // Z: Preferred Call Time
      consent,                    // AA: Consent
      utmSource,                  // AB: Lead Source
      platform,                   // AC: Platform
      utmCampaign,                // AD: Campaign
      'Default AdSet',            // AE: Ad Set
      utmContent,                 // AF: Ad / Creative
      utmSource,                  // AG: UTM Source
      utmMedium,                  // AH: UTM Medium
      utmCampaign,                // AI: UTM Campaign
      utmContent,                 // AJ: UTM Content
      utmTerm,                    // AK: UTM Term
      'https://www.avanifinserv.com/contact', // AL: Landing Page
      leadStatus,                 // AM: Lead Status
      leadPriority,               // AN: Lead Priority
      'Unassigned',               // AO: Assigned To
      new Date(),                 // AP: First Contact Date
      '',                         // AQ: Follow-up Date
      'Automated form submission logged', // AR: Follow-up Notes
      '',                         // AS: Loan Amount Approved
      'Pending',                  // AT: Conversion Status
      ''                          // AU: Lost Reason
    ];

    sheet.appendRow(rowData);
    console.log(`[AppsScript] Successfully logged Lead ${leadId} for ${fullName}`);

    // Update Dashboard & Reports
    updateDashboardMetrics(ss);

    // Trigger Outbound Webhooks
    sendOutboundWebhook({
      leadId, timestamp, fullName, mobile, email, city, loanProduct, loanAmount, leadPriority, utmSource, platform
    });

  } catch (err) {
    console.error('[AppsScript] Error processing form submit:', err.toString());
  }
}

/**
 * Generate Sequential Lead ID (ALS-2026-000001)
 */
function generateLeadId(lastRowIndex) {
  const nextNum = Math.max(1, lastRowIndex);
  const formattedNum = ("000000" + nextNum).slice(-6);
  return `${CONFIG.LEAD_ID_PREFIX}${formattedNum}`;
}

/**
 * Check if Mobile number already exists in Sheet
 */
function checkDuplicateMobile(sheet, mobile) {
  if (!mobile || mobile.length < 10) return false;
  const data = sheet.getRange(2, 4, Math.max(1, sheet.getLastRow() - 1), 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (cleanPhone(data[i][0]) === mobile) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate Lead Priority (HOT, WARM, COLD)
 */
function calculateLeadPriority(amount, callTime, contactPref, income) {
  let score = 0;
  if ((amount || '').includes('50') || (amount || '').includes('1 Crore')) score += 3;
  if ((callTime || '').toLowerCase().includes('immediately') || (callTime || '').toLowerCase().includes('1 hour')) score += 3;
  if ((income || '').includes('1–2 Lakh') || (income || '').includes('Above')) score += 2;
  if ((contactPref || '').toLowerCase().includes('call') || (contactPref || '').toLowerCase().includes('whatsapp')) score += 2;

  if (score >= 6) return 'HOT';
  if (score >= 3) return 'WARM';
  return 'COLD';
}

/**
 * Map source string to clean Platform name
 */
function getPlatformFromSource(source) {
  const s = (source || '').toLowerCase();
  if (s.includes('facebook') || s.includes('fb')) return 'Facebook';
  if (s.includes('instagram') || s.includes('ig')) return 'Instagram';
  if (s.includes('whatsapp') || s.includes('wa')) return 'WhatsApp';
  if (s.includes('google') || s.includes('cpc')) return 'Google Ads';
  if (s.includes('linkedin')) return 'LinkedIn';
  if (s.includes('youtube')) return 'YouTube';
  if (s.includes('qr')) return 'QR Code';
  if (s.includes('referral')) return 'Referral';
  return 'Website Direct';
}

/**
 * Helper to extract value from namedValues map
 */
function getVal(map, keys, fallback) {
  for (let i = 0; i < keys.length; i++) {
    if (map[keys[i]] && map[keys[i]][0]) {
      return map[keys[i]][0].trim();
    }
  }
  return fallback;
}

/**
 * Clean phone number to 10 digits
 */
function cleanPhone(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Setup Lead Master Sheet with Columns A to AU
 */
function setupLeadMasterSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEET_LEAD_MASTER);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_LEAD_MASTER);

  const headers = [
    "Lead ID", "Timestamp", "Full Name", "Mobile", "WhatsApp", "Email", "City", "State",
    "Customer Profile", "Loan Product", "Loan Amount", "Employment Type", "Monthly Income Range",
    "Existing Loan", "CIBIL Range", "Education Country", "Course", "University", "Business Type",
    "Business Vintage", "Annual Turnover", "Property Type", "Property Location", "Property Value",
    "Contact Preference", "Preferred Call Time", "Consent", "Lead Source", "Platform", "Campaign",
    "Ad Set", "Ad / Creative", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "UTM Term",
    "Landing Page", "Lead Status", "Lead Priority", "Assigned To", "First Contact Date", "Follow-up Date",
    "Follow-up Notes", "Loan Amount Approved", "Conversion Status", "Lost Reason"
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1B3A6B").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * Refresh Dashboard Metrics
 */
function updateDashboardMetrics(ss) {
  let dash = ss.getSheetByName(CONFIG.SHEET_DASHBOARD);
  if (!dash) {
    dash = ss.insertSheet(CONFIG.SHEET_DASHBOARD);
    dash.getRange("A1").setValue("AVANI LOAN SERVICES — EXECUTIVE DASHBOARD").setFontSize(16).setFontWeight("bold");
  }
  // Formula-driven dashboard structure
  dash.getRange("A3:B9").setValues([
    ["Total Leads Captured", "=COUNTA('AVANI LOAN SERVICES – Lead Master'!A2:A)"],
    ["Hot Leads", '=COUNTIF(\'AVANI LOAN SERVICES – Lead Master\'!AN2:AN, "HOT")'],
    ["Warm Leads", '=COUNTIF(\'AVANI LOAN SERVICES – Lead Master\'!AN2:AN, "WARM")'],
    ["Cold Leads", '=COUNTIF(\'AVANI LOAN SERVICES – Lead Master\'!AN2:AN, "COLD")'],
    ["Applications Submitted", '=COUNTIF(\'AVANI LOAN SERVICES – Lead Master\'!AM2:AM, "Application Submitted")'],
    ["Loans Disbursed", '=COUNTIF(\'AVANI LOAN SERVICES – Lead Master\'!AM2:AM, "Disbursed")'],
    ["Conversion Rate (%)", '=IF(B3>0, (B8/B3)*100, "0%")']
  ]);
}

/**
 * Post lead payload to external Webhooks
 */
function sendOutboundWebhook(payload) {
  try {
    UrlFetchApp.fetch(CONFIG.EXPRESS_API_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (e) {
    console.warn("[AppsScript] Outbound webhook dispatch skipped:", e.toString());
  }
}
