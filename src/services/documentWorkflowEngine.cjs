// src/services/documentWorkflowEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Dynamic Document Requirement, Collection & Review Engine
// AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const { normalizeLoanProduct, LOAN_PRODUCTS } = require('./loanQualificationEngine.cjs');
const { getLead, updateLead } = require('./centralLeadEngine.cjs');

const DOCUMENT_STATUSES = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  REQUESTED: 'REQUESTED',
  UPLOADED: 'UPLOADED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  REUPLOAD_REQUIRED: 'REUPLOAD_REQUIRED'
};

/**
 * Generate tailored required document checklist based on loan product & applicant profile
 */
function generateChecklistForLead(loanProductRaw, employmentTypeRaw = 'SALARIED', professionRaw = '') {
  const normProduct = normalizeLoanProduct(loanProductRaw);
  const normEmp = String(employmentTypeRaw || '').toUpperCase();
  const normProf = String(professionRaw || '').toUpperCase();

  const docs = [];

  // Common KYC
  docs.push({
    docId: 'pan_card',
    category: 'IDENTITY',
    title: 'PAN Card',
    description: 'Clear image or PDF copy of PAN card',
    required: true,
    status: DOCUMENT_STATUSES.REQUESTED
  });

  docs.push({
    docId: 'aadhaar_card',
    category: 'IDENTITY',
    title: 'Aadhaar Card (Front & Back)',
    description: 'Masked Aadhaar or government photo ID proof',
    required: true,
    status: DOCUMENT_STATUSES.REQUESTED
  });

  // Product & Profile specific
  switch (normProduct) {
    case LOAN_PRODUCTS.PERSONAL_LOAN:
      docs.push({
        docId: 'salary_slips',
        category: 'SALARIED_INCOME',
        title: 'Latest 3 Months Salary Slips',
        description: 'Stamped / signed salary slips issued by employer',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'bank_statement',
        category: 'SALARIED_INCOME',
        title: 'Latest 6 Months Salary Bank Statement',
        description: 'Net-banking downloaded official PDF statement',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'form_16',
        category: 'SALARIED_INCOME',
        title: 'Form 16 / ITR (Part A & B)',
        description: 'Latest 1-2 financial years',
        required: false,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;

    case LOAN_PRODUCTS.BUSINESS_LOAN:
      docs.push({
        docId: 'business_reg_proof',
        category: 'BUSINESS_FINANCIALS',
        title: 'Business Registration / Udyam / Shop Act',
        description: 'Proof of business existence and vintage',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'gst_returns',
        category: 'BUSINESS_FINANCIALS',
        title: 'Latest 12 Months GST Returns (3B)',
        description: 'Combined monthly GST filing acknowledgments',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'current_account_bank',
        category: 'BUSINESS_FINANCIALS',
        title: 'Latest 12 Months Current Account Statement',
        description: 'Primary operational current account bank statements',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'business_itr_financials',
        category: 'BUSINESS_FINANCIALS',
        title: 'Last 2-3 Years ITR & Audit Financials',
        description: 'Balance sheet, profit & loss, audit report, computations',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;

    case LOAN_PRODUCTS.DOCTOR_LOAN:
      docs.push({
        docId: 'doctor_degree_certificate',
        category: 'PROFESSIONAL',
        title: 'MBBS / MD / MS / BDS Degree Certificate',
        description: 'Copy of highest medical qualification degree',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'council_reg_certificate',
        category: 'PROFESSIONAL',
        title: 'State / National Medical Council Registration',
        description: 'Valid permanent registration certificate',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'clinic_reg_proof',
        category: 'PROFESSIONAL',
        title: 'Clinic / Nursing Home Registration Certificate',
        description: 'Local authority clinic license or hospital appointment letter',
        required: false,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'doctor_bank_statement',
        category: 'PROFESSIONAL',
        title: 'Latest 6 Months Operational Bank Statement',
        description: 'Professional receipts account bank statement',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;

    case LOAN_PRODUCTS.CA_LOAN:
      docs.push({
        docId: 'ca_membership_certificate',
        category: 'PROFESSIONAL',
        title: 'ICAI Membership Certificate & COP',
        description: 'Certificate of Practice & Membership letter',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'ca_bank_statement',
        category: 'PROFESSIONAL',
        title: 'Latest 6-12 Months Professional Bank Statement',
        description: 'Fee collection bank account statement',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'ca_itr_computation',
        category: 'PROFESSIONAL',
        title: 'Last 2 Years ITR with Computation of Income',
        description: 'ITR acknowledgments and financial statements',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;

    case LOAN_PRODUCTS.HOME_LOAN:
    case LOAN_PRODUCTS.MORTGAGE_LOAN:
      docs.push({
        docId: 'property_title_deed',
        category: 'PROPERTY',
        title: 'Registered Sale Deed / Title Deed',
        description: 'Complete chain of registered title documents',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'property_tax_receipt',
        category: 'PROPERTY',
        title: 'Latest Municipal Property Tax Receipt',
        description: 'Paid tax challan or assessment receipt',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'sanctioned_plan',
        category: 'PROPERTY',
        title: 'Sanctioned Layout / Building Plan',
        description: 'Approved building construction plan & permission',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'applicant_income_proof',
        category: 'SALARIED_INCOME',
        title: 'Income Proof (Salary Slips / Business ITR)',
        description: '3 months salary slips or 2 years business ITR',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'primary_bank_statement',
        category: 'SALARIED_INCOME',
        title: 'Latest 6 Months Bank Statement',
        description: 'Bank statement reflecting regular salary or business cashflow',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;

    case LOAN_PRODUCTS.EDUCATION_LOAN_INDIA:
    case LOAN_PRODUCTS.EDUCATION_LOAN_GLOBAL:
      docs.push({
        docId: 'admission_offer_letter',
        category: 'ACADEMIC',
        title: 'Official Admission / Offer Letter',
        description: 'Letter of acceptance from university or college',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'fee_structure',
        category: 'ACADEMIC',
        title: 'Institutional Fee Structure Breakdown',
        description: 'Detailed semester-wise or annual tuition fee schedule',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'academic_records',
        category: 'ACADEMIC',
        title: 'Academic Records (10th, 12th, Degree Transcripts)',
        description: 'Marks cards, passing certificates, entrance exam score card',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'coapplicant_income_proof',
        category: 'SALARIED_INCOME',
        title: 'Co-applicant Income Proof & Bank Statement',
        description: 'Parent / sponsor salary slips or business ITR and 6m statement',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      if (normProduct === LOAN_PRODUCTS.EDUCATION_LOAN_GLOBAL) {
        docs.push({
          docId: 'student_passport',
          category: 'IDENTITY',
          title: 'Student Passport (Front & Back)',
          description: 'Valid passport for international travel',
          required: true,
          status: DOCUMENT_STATUSES.REQUESTED
        });
      }
      break;

    case LOAN_PRODUCTS.SCHOOL_FUNDING:
    case LOAN_PRODUCTS.COLLEGE_FUNDING:
      docs.push({
        docId: 'trust_society_registration',
        category: 'INSTITUTIONAL',
        title: 'Trust / Society Registration Certificate & Bye-Laws',
        description: 'Registered trust deed, society certificate, PAN',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'audited_institutional_financials',
        category: 'INSTITUTIONAL',
        title: 'Last 3 Years Audited Financial Statements',
        description: 'Audited balance sheet, income/expenditure statement, audit notes',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'affiliation_recognition_letter',
        category: 'INSTITUTIONAL',
        title: 'Government / Board Affiliation & Recognition Order',
        description: 'Valid CBSE / ICSE / State Board / University affiliation',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      docs.push({
        docId: 'campus_property_documents',
        category: 'PROPERTY',
        title: 'School / College Campus Land & Building Title Deed',
        description: 'Freehold land deed or registered 30-year lease agreement',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;

    default:
      docs.push({
        docId: 'income_proof',
        category: 'SALARIED_INCOME',
        title: 'Income Proof / Salary Slip / Bank Statement',
        description: 'Latest 6 months bank statement',
        required: true,
        status: DOCUMENT_STATUSES.REQUESTED
      });
      break;
  }

  return docs;
}

/**
 * Review an uploaded document (by Loan Advisor)
 */
function reviewDocument(leadIdentifier, docId, decision, reviewerNotes = '', reviewer = 'Sachin Shinde') {
  const lead = getLead(leadIdentifier);
  if (!lead) return { success: false, error: 'Lead not found' };

  const validDecisions = [
    DOCUMENT_STATUSES.ACCEPTED,
    DOCUMENT_STATUSES.REJECTED,
    DOCUMENT_STATUSES.REUPLOAD_REQUIRED,
    DOCUMENT_STATUSES.UNDER_REVIEW
  ];

  if (!validDecisions.includes(decision)) {
    return { success: false, error: `Invalid review decision: ${decision}` };
  }

  const reqDocs = lead.requiredDocuments || [];
  const recDocs = lead.receivedDocuments || [];

  // Update in requiredDocuments
  const targetReq = reqDocs.find(d => d.docId === docId);
  if (targetReq) {
    targetReq.status = decision;
    targetReq.reviewerNotes = reviewerNotes;
    targetReq.reviewedBy = reviewer;
    targetReq.reviewedAt = new Date().toISOString();
  }

  // Update in receivedDocuments if present
  const targetRec = recDocs.find(d => d.docId === docId);
  if (targetRec) {
    targetRec.status = decision;
    targetRec.reviewerNotes = reviewerNotes;
    targetRec.reviewedBy = reviewer;
    targetRec.reviewedAt = new Date().toISOString();
  }

  // Compute overall document status
  let overallStatus = DOCUMENT_STATUSES.UNDER_REVIEW;
  const allRequired = reqDocs.filter(d => d.required);
  const allAccepted = allRequired.every(d => d.status === DOCUMENT_STATUSES.ACCEPTED);
  const anyReupload = reqDocs.some(d => d.status === DOCUMENT_STATUSES.REUPLOAD_REQUIRED || d.status === DOCUMENT_STATUSES.REJECTED);

  if (allAccepted && allRequired.length > 0) {
    overallStatus = 'DOCUMENTS_RECEIVED';
  } else if (anyReupload) {
    overallStatus = 'DOCUMENTS_PENDING';
  }

  const updatedLead = updateLead(lead.leadId, {
    requiredDocuments: reqDocs,
    receivedDocuments: recDocs,
    documentStatus: overallStatus
  }, reviewer);

  return {
    success: true,
    leadId: lead.leadId,
    docId,
    decision,
    overallDocumentStatus: overallStatus,
    lead: updatedLead
  };
}

module.exports = {
  DOCUMENT_STATUSES,
  generateChecklistForLead,
  reviewDocument
};
