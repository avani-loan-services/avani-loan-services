// src/config/whatsappTemplates.cjs
// ─────────────────────────────────────────────────────────────────
// Approved Meta WhatsApp / AiSensy Template Registry
// ─────────────────────────────────────────────────────────────────

const WHATSAPP_TEMPLATES = {
  lead_received: {
    templateKey: 'lead_received',
    metaTemplateName: 'avani_lead_acknowledgement_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'LEAD_CREATED',
    active: true,
    text: "Hello {{name}}, welcome to AVANI LOAN SERVICES! We have received your application for {{loanProduct}} (Ref: {{leadId}}). Our dedicated loan advisor will guide you step-by-step."
  },
  qualification_start: {
    templateKey: 'qualification_start',
    metaTemplateName: 'avani_quick_qualification_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'QUALIFICATION',
    active: true,
    text: "Hi {{name}}, to ensure the fastest loan approval for {{loanProduct}}, please confirm a few key details: your city, monthly income, and existing obligations."
  },
  qualification_reminder: {
    templateKey: 'qualification_reminder',
    metaTemplateName: 'avani_qualification_nudge_v1',
    category: 'MARKETING',
    language: 'en_US',
    stage: 'QUALIFICATION',
    active: true,
    text: "Hi {{name}}, we noticed your loan inquiry {{leadId}} is pending. Completing these quick details allows our banks to issue your preliminary eligibility."
  },
  documents_required: {
    templateKey: 'documents_required',
    metaTemplateName: 'avani_document_checklist_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'DOCUMENT_CHECKLIST',
    active: true,
    text: "📋 AVANI LOAN SERVICES — Document Checklist for {{loanProduct}} (Ref: {{leadId}}):\nPlease view your personalized checklist and securely upload your documents at:\n{{portalUrl}}"
  },
  documents_received: {
    templateKey: 'documents_received',
    metaTemplateName: 'avani_docs_received_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'DOCUMENTS_RECEIVED',
    active: true,
    text: "Thank you {{name}}! We have successfully received your documents for {{leadId}}. Our underwriting team is now performing initial document verification."
  },
  advisor_review: {
    templateKey: 'advisor_review',
    metaTemplateName: 'avani_advisor_assigned_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'ADVISOR_REVIEW',
    active: true,
    text: "Good news {{name}}! Your dedicated loan advisor {{advisorName}} has been assigned to your file {{leadId}} and will connect with you to review best lender offers."
  },
  follow_up_1: {
    templateKey: 'follow_up_1',
    metaTemplateName: 'avani_followup_day1_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'FOLLOW_UP',
    active: true,
    text: "Hello {{name}}, checking in from AVANI LOAN SERVICES regarding your {{loanProduct}} application {{leadId}}. Do you have any questions or need assistance with documents?"
  },
  follow_up_2: {
    templateKey: 'follow_up_2',
    metaTemplateName: 'avani_followup_day3_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'FOLLOW_UP',
    active: true,
    text: "Hi {{name}}, your preliminary file for {{loanProduct}} is ready for submission to our partner banks. Please upload the remaining documents to avoid processing delays."
  },
  follow_up_3: {
    templateKey: 'follow_up_3',
    metaTemplateName: 'avani_followup_day7_v1',
    category: 'MARKETING',
    language: 'en_US',
    stage: 'FOLLOW_UP',
    active: true,
    text: "Hello {{name}}, AVANI LOAN SERVICES continues to support your funding goals in Maharashtra. Whenever you are ready to proceed with {{leadId}}, our team is at your service."
  },
  application_update: {
    templateKey: 'application_update',
    metaTemplateName: 'avani_application_update_v1',
    category: 'UTILITY',
    language: 'en_US',
    stage: 'APPLICATION_UPDATE',
    active: true,
    text: "Update on {{leadId}}: Your {{loanProduct}} application status has been updated to {{newStatus}}. Log in to your portal or reply to this message for details."
  }
};

function getTemplate(key) {
  return WHATSAPP_TEMPLATES[key] || null;
}

function listTemplates() {
  return Object.values(WHATSAPP_TEMPLATES);
}

module.exports = {
  WHATSAPP_TEMPLATES,
  getTemplate,
  listTemplates
};
