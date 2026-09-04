/**
 * ============================================================================
 * AVANI LOAN SERVICES — Unified 5-Sheet Control & Monitoring Automation Engine
 * File: scripts/googleAppsScriptUnified.gs
 * ============================================================================
 * 
 * Sheets:
 * 1. LEADS — Primary Lead Master Record
 * 2. DOCUMENT STATUS — Verification & Document Tracking
 * 3. FOLLOW-UP — Operational Advisory Call Queue
 * 4. CAMPAIGN PERFORMANCE — Platform & Marketing Source Analytics
 * 5. SYSTEM LOGS — Audit Trail & Webhook Retry Logs
 */

const UNIFIED_CONFIG = {
  SHEET_LEADS: "LEADS",
  SHEET_DOC_STATUS: "DOCUMENT STATUS",
  SHEET_FOLLOWUP: "FOLLOW-UP",
  SHEET_PERFORMANCE: "CAMPAIGN PERFORMANCE",
  SHEET_LOGS: "SYSTEM LOGS",
  LEAD_ID_PREFIX: "ALS-2026-"
};

/**
 * Handle incoming Webhook GET requests
 */
function doGet(e) {
  const action = e ? e.parameter.action : '';
  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({ status: 'OK', message: 'Unified Apps Script is active.' })).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'OK', service: 'AVANI LOAN SERVICES Unified Lead Engine' })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle incoming Webhook POST requests (From Meta, Website, AiSensy, OmniDM)
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupAllUnifiedSheets(ss);

    let postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const leadId = postData.leadId || generateUnifiedLeadId(ss);
    const timestamp = new Date();
    const fullName = postData.fullName || postData.name || 'Valued Customer';
    const mobile = postData.mobile || postData.phone || '';
    const email = postData.email || '';
    const city = postData.city || 'Latur';
    const product = postData.loanProduct || postData.loanType || 'Personal / Salary Loan';
    const amount = postData.loanAmount || postData.amount || 'Below ₹5 Lakh';
    const source = postData.leadSource || postData.utm_source || 'website';
    const platform = postData.platform || 'Website';
    const campaign = postData.campaign || postData.utm_campaign || 'ALS_DIRECT_2026';
    const status = postData.leadStatus || postData.status || 'NEW';
    const priority = postData.leadPriority || postData.priority || 'HOT';

    // 1. LEADS SHEET
    const leadsSheet = ss.getSheetByName(UNIFIED_CONFIG.SHEET_LEADS);
    leadsSheet.appendRow([
      leadId, timestamp, fullName, mobile, email, city, product, amount,
      source, platform, campaign, postData.adSet || 'Default AdSet', postData.ad || 'Default Ad',
      postData.utmSource || source, postData.utmMedium || 'cpc', postData.utmCampaign || campaign,
      status, 'Unassigned', timestamp, '', postData.documentStatus || 'DOCUMENTS_PENDING',
      postData.receivedCount || 0, postData.pendingCount || 5, priority, 'Logged cleanly'
    ]);

    // 2. DOCUMENT STATUS SHEET
    const docSheet = ss.getSheetByName(UNIFIED_CONFIG.SHEET_DOC_STATUS);
    docSheet.appendRow([
      leadId, 'PAN Card', 'Yes', 'No', '', '', 'Pending Verification', '', '', 'Initial intake'
    ]);

    // 3. FOLLOW-UP SHEET
    const followSheet = ss.getSheetByName(UNIFIED_CONFIG.SHEET_FOLLOWUP);
    followSheet.appendRow([
      leadId, mobile, product, status, timestamp, '', 0, 'Unassigned', priority
    ]);

    // 4. SYSTEM LOGS SHEET
    logUnifiedEvent(ss, leadId, 'LEAD_LOGGED', platform, '/doPost', '200 OK', 'Success', '');

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      leadId: leadId,
      status: status,
      priority: priority
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('[AppsScriptUnified] Error processing POST:', err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Log System Event
 */
function logUnifiedEvent(ss, leadId, event, platform, endpoint, status, response, error) {
  const logSheet = ss.getSheetByName(UNIFIED_CONFIG.SHEET_LOGS);
  if (logSheet) {
    logSheet.appendRow([new Date(), leadId, event, platform, endpoint, status, response, error, 0]);
  }
}

/**
 * Generate Sequential Lead ID
 */
function generateUnifiedLeadId(ss) {
  const leadsSheet = ss.getSheetByName(UNIFIED_CONFIG.SHEET_LEADS);
  const nextNum = Math.max(1, leadsSheet.getLastRow());
  const formattedNum = ("000000" + nextNum).slice(-6);
  return `${UNIFIED_CONFIG.LEAD_ID_PREFIX}${formattedNum}`;
}

/**
 * Setup All 5 Sheets
 */
function setupAllUnifiedSheets(ss) {
  // 1. LEADS
  let sheet1 = ss.getSheetByName(UNIFIED_CONFIG.SHEET_LEADS);
  if (!sheet1) {
    sheet1 = ss.insertSheet(UNIFIED_CONFIG.SHEET_LEADS);
    sheet1.appendRow([
      "Lead ID", "Created Date", "Name", "Mobile", "Email", "City", "Product", "Loan Amount",
      "Source", "Platform", "Campaign", "Ad Set", "Ad", "UTM Source", "UTM Medium", "UTM Campaign",
      "Status", "Assigned To", "Last Contact", "Next Follow-up", "Document Status", "Documents Received", "Documents Pending", "Priority", "Notes"
    ]);
  }

  // 2. DOCUMENT STATUS
  let sheet2 = ss.getSheetByName(UNIFIED_CONFIG.SHEET_DOC_STATUS);
  if (!sheet2) {
    sheet2 = ss.insertSheet(UNIFIED_CONFIG.SHEET_DOC_STATUS);
    sheet2.appendRow([
      "Lead ID", "Document Type", "Required", "Received", "File ID", "Upload Date", "Verification Status", "Verified By", "Verification Date", "Remarks"
    ]);
  }

  // 3. FOLLOW-UP
  let sheet3 = ss.getSheetByName(UNIFIED_CONFIG.SHEET_FOLLOWUP);
  if (!sheet3) {
    sheet3 = ss.insertSheet(UNIFIED_CONFIG.SHEET_FOLLOWUP);
    sheet3.appendRow([
      "Lead ID", "Customer Mobile", "Product", "Status", "Last Contact", "Next Follow-up", "Follow-up Count", "Assigned To", "Priority"
    ]);
  }

  // 4. CAMPAIGN PERFORMANCE
  let sheet4 = ss.getSheetByName(UNIFIED_CONFIG.SHEET_PERFORMANCE);
  if (!sheet4) {
    sheet4 = ss.insertSheet(UNIFIED_CONFIG.SHEET_PERFORMANCE);
    sheet4.appendRow([
      "Date", "Platform", "Campaign", "Ad Set", "Ad", "Product", "Leads", "Qualified", "Documents Complete", "Applications", "Approved", "Disbursed", "Cost", "CPL", "Conversion Rate"
    ]);
  }

  // 5. SYSTEM LOGS
  let sheet5 = ss.getSheetByName(UNIFIED_CONFIG.SHEET_LOGS);
  if (!sheet5) {
    sheet5 = ss.insertSheet(UNIFIED_CONFIG.SHEET_LOGS);
    sheet5.appendRow([
      "Timestamp", "Lead ID", "Event", "Platform", "Endpoint", "Status", "Response", "Error", "Retry Count"
    ]);
  }
}
