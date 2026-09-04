// src/services/notificationService.cjs
// ─────────────────────────────────────────────────────────────────
// Unified Central Notification Service for AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const { sendWhatsAppTemplate } = require('./aisensyAdapter.cjs');
const { sendEmail } = require('../utils/emailService.cjs');
const { syncToHubSpot } = require('../utils/hubSpot.cjs');

const ADMIN_EMAIL = 'enquiry@avanifinserv.com';
const ADMIN_WABA = '919175635165';

/**
 * 1. Notify Lead Created (Auto Acknowledgement)
 */
async function notifyLeadCreated(lead) {
  console.log(`[NotificationService] Dispatching auto-reply for Lead ${lead.leadId}...`);

  const secureUploadLink = `https://www.avanifinserv.com/loan-documents/${lead.secureToken}`;

  // WhatsApp Acknowledgement
  const waMsg = `Namaskar ${lead.fullName} 👋 Thank you for contacting AVANI LOAN SERVICES. We have received your enquiry for ${lead.loanProduct}. Our team will review your requirement and guide you regarding eligibility and documents. To speed up processing, upload documents here: ${secureUploadLink} Lead ID: ${lead.leadId}`;

  sendWhatsAppTemplate({
    destination: lead.mobile,
    campaignName: 'als_lead_ack_2026',
    templateParams: [lead.fullName, lead.loanProduct, secureUploadLink, lead.leadId]
  }).catch(e => console.warn('[NotificationService] WA non-fatal:', e.message));

  // Email Notification to Customer & Admin
  if (lead.email) {
    sendEmail({
      to: lead.email,
      subject: `[ALS] Loan Enquiry Received | Lead ID: ${lead.leadId}`,
      html: `<h3>Namaskar ${lead.fullName},</h3><p>Thank you for choosing AVANI LOAN SERVICES. We have received your enquiry for <strong>${lead.loanProduct}</strong>.</p><p><strong>Lead ID:</strong> ${lead.leadId}</p><p><a href="${secureUploadLink}" style="background:#0052CC;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Upload Loan Documents</a></p>`
    }).catch(e => console.warn('[NotificationService] Email non-fatal:', e.message));
  }

  // Internal Alert to Admin
  sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ALS] NEW LEAD: ${lead.leadId} | ${lead.fullName} (${lead.loanProduct})`,
    html: `<h3>New Lead Logged</h3><p><strong>Lead ID:</strong> ${lead.leadId}</p><p><strong>Name:</strong> ${lead.fullName}</p><p><strong>Mobile:</strong> ${lead.mobile}</p><p><strong>Product:</strong> ${lead.loanProduct}</p><p><strong>Amount:</strong> ${lead.loanAmount}</p><p><strong>Source:</strong> ${lead.leadSource} (${lead.utmSource})</p>`
  }).catch(e => console.warn('[NotificationService] Admin email non-fatal:', e.message));

  // Sync to HubSpot CRM
  syncToHubSpot({
    name: lead.fullName,
    email: lead.email,
    phone: lead.mobile,
    city: lead.city,
    loanType: lead.loanProduct,
    amount: lead.loanAmount,
    source: lead.leadSource,
    status: lead.status
  }).catch(e => console.warn('[NotificationService] HubSpot non-fatal:', e.message));
}

/**
 * 2. Notify Partial Documents / Pending Documents Reminder
 */
async function notifyDocumentsPending(lead, missingDocs = []) {
  const missingNames = missingDocs.map(d => d.name || d.id || d).join(', ');
  const secureUploadLink = `https://www.avanifinserv.com/loan-documents/${lead.secureToken}`;

  console.log(`[NotificationService] Sending document reminder for Lead ${lead.leadId}... Missing: ${missingNames}`);

  sendWhatsAppTemplate({
    destination: lead.mobile,
    campaignName: 'als_doc_reminder_2026',
    templateParams: [lead.fullName, String(missingDocs.length), missingNames, secureUploadLink, lead.leadId]
  }).catch(e => console.warn('[NotificationService] Reminder WA non-fatal:', e.message));
}

/**
 * 3. Notify Documents Complete (Internal Escalation)
 */
async function notifyDocumentsComplete(lead) {
  const secureAdminLink = `https://www.avanifinserv.com/documents`;

  console.log(`[NotificationService] 🚨 DOCUMENTS COMPLETE for Lead ${lead.leadId}. Sending internal escalation...`);

  // Internal Escalation Email to enquiry@avanifinserv.com
  sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ALS] DOCUMENTS COMPLETE | ${lead.leadId} | ${lead.loanProduct} | ${lead.fullName}`,
    html: `
      <h2>🚨 NEW DOCUMENT-COMPLETE LEAD PACKAGE</h2>
      <p><strong>Lead ID:</strong> ${lead.leadId}</p>
      <p><strong>Customer:</strong> ${lead.fullName}</p>
      <p><strong>Mobile:</strong> ${lead.mobile}</p>
      <p><strong>Product:</strong> ${lead.loanProduct}</p>
      <p><strong>Loan Amount:</strong> ${lead.loanAmount}</p>
      <p><strong>Document Status:</strong> COMPLETE (100%)</p>
      <p><strong>Review Status:</strong> HUMAN VERIFICATION REQUIRED</p>
      <p><a href="${secureAdminLink}" style="background:#16a34a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Open Admin Vault & Verify Documents</a></p>
    `
  }).catch(e => console.warn('[NotificationService] Escalation email non-fatal:', e.message));

  // Admin WhatsApp Alert
  sendWhatsAppTemplate({
    destination: ADMIN_WABA,
    campaignName: 'als_admin_doc_complete',
    templateParams: [lead.leadId, lead.fullName, lead.loanProduct, lead.loanAmount, secureAdminLink]
  }).catch(e => console.warn('[NotificationService] Admin WA non-fatal:', e.message));
}

/**
 * 4. Notify Human Review / Handoff Required
 */
async function notifyHumanReviewRequired(lead, reason = 'Complex eligibility assessment') {
  console.log(`[NotificationService] Human handoff requested for Lead ${lead.leadId} (${reason})`);
  sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ALS] HUMAN HANDOFF REQUIRED | ${lead.leadId} | ${lead.fullName}`,
    html: `<p>Advisor attention required for Lead <strong>${lead.leadId}</strong> (${lead.fullName}).</p><p>Reason: ${reason}</p>`
  }).catch(e => console.warn('[NotificationService] Handoff email non-fatal:', e.message));
}

module.exports = {
  notifyLeadCreated,
  notifyDocumentsPending,
  notifyDocumentsComplete,
  notifyHumanReviewRequired
};
