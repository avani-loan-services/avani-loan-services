// src/services/documentChecklistEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Product-Specific Document Checklist Engine & Completeness Evaluator
// ─────────────────────────────────────────────────────────────────

const DOCUMENT_REQUIREMENTS = {
  'Personal / Salary Loan': [
    { id: 'pan', name: 'PAN Card', mandatory: true },
    { id: 'aadhaar', name: 'Aadhaar Card', mandatory: true },
    { id: 'salary_slips', name: 'Last 3 Months Salary Slips', mandatory: true },
    { id: 'bank_statement', name: 'Last 6 Months Bank Statement', mandatory: true },
    { id: 'form_16', name: 'Form 16 / Last 2 Years ITR', mandatory: false }
  ],
  'Business Loan': [
    { id: 'pan', name: 'PAN Card (Individual & Business)', mandatory: true },
    { id: 'aadhaar', name: 'Aadhaar Card', mandatory: true },
    { id: 'biz_reg', name: 'Business Registration (GST / Udyam / Shop Act)', mandatory: true },
    { id: 'bank_statement', name: 'Last 12 Months Bank Statement', mandatory: true },
    { id: 'itr_financials', name: 'Last 2 Years ITR with Computation & P&L', mandatory: true }
  ],
  'Doctor Loan': [
    { id: 'pan', name: 'PAN Card', mandatory: true },
    { id: 'aadhaar', name: 'Aadhaar Card', mandatory: true },
    { id: 'degree', name: 'MBBS / MD / BAMS Degree Certificate', mandatory: true },
    { id: 'medical_reg', name: 'Medical Council Registration Certificate', mandatory: true },
    { id: 'bank_statement', name: 'Last 12 Months Bank Statement', mandatory: true },
    { id: 'itr', name: 'Last 2 Years ITR', mandatory: false }
  ],
  'Home Loan': [
    { id: 'pan', name: 'PAN Card', mandatory: true },
    { id: 'aadhaar', name: 'Aadhaar Card', mandatory: true },
    { id: 'income_proof', name: 'Income Proof (Salary Slips / ITR)', mandatory: true },
    { id: 'bank_statement', name: 'Last 6 Months Bank Statement', mandatory: true },
    { id: 'property_deed', name: 'Property Title Deed & 7/12 Extract', mandatory: true },
    { id: 'agreement', name: 'Agreement to Sale / Construction Estimate', mandatory: true }
  ],
  'Mortgage / Loan Against Property': [
    { id: 'pan', name: 'PAN Card', mandatory: true },
    { id: 'aadhaar', name: 'Aadhaar Card', mandatory: true },
    { id: 'income_proof', name: 'Income Proof (Salary Slips / ITR)', mandatory: true },
    { id: 'bank_statement', name: 'Last 12 Months Bank Statement', mandatory: true },
    { id: 'property_deed', name: 'Property Title Deed & Approved Plan', mandatory: true },
    { id: 'tax_receipt', name: 'Property Tax Paid Receipt', mandatory: true }
  ],
  'Education Loan – India': [
    { id: 'student_kyc', name: 'Student PAN & Aadhaar Card', mandatory: true },
    { id: 'parent_kyc', name: 'Parent / Co-Applicant PAN & Aadhaar Card', mandatory: true },
    { id: 'admission_letter', name: 'College Admission / Offer Letter', mandatory: true },
    { id: 'fee_structure', name: 'Official Fee Breakdown Structure', mandatory: true },
    { id: 'bank_statement', name: 'Parent Last 6 Months Bank Statement', mandatory: true },
    { id: 'marksheets', name: '10th, 12th & Graduation Marksheets', mandatory: true }
  ],
  'Education Loan – Global Studies': [
    { id: 'student_passport', name: 'Student Passport & PAN Card', mandatory: true },
    { id: 'parent_kyc', name: 'Parent / Co-Applicant PAN & Aadhaar Card', mandatory: true },
    { id: 'admission_letter', name: 'University Admission Offer Letter (I-20 / CAS)', mandatory: true },
    { id: 'fee_structure', name: 'Foreign University Fee Breakdown', mandatory: true },
    { id: 'bank_statement', name: 'Parent Last 6 Months Bank Statement', mandatory: true },
    { id: 'language_test', name: 'TOEFL / IELTS / GRE Scorecard', mandatory: false }
  ],
  'School Funding': [
    { id: 'trust_deed', name: 'School Trust Deed / Society Registration', mandatory: true },
    { id: 'trustee_kyc', name: 'Trustee Board PAN & Aadhaar Cards', mandatory: true },
    { id: 'financials', name: 'Audited Financial Statements (Last 3 Years)', mandatory: true },
    { id: 'bank_statement', name: 'School Bank Statement (Last 12 Months)', mandatory: true },
    { id: 'land_docs', name: 'School Infrastructure Land / Building Deed', mandatory: true }
  ],
  'College Funding': [
    { id: 'approval_doc', name: 'College AICTE / UGC Approval Certificate', mandatory: true },
    { id: 'society_kyc', name: 'Society / Educational Trust Registration', mandatory: true },
    { id: 'financials', name: 'Audited Financial Statements (Last 3 Years)', mandatory: true },
    { id: 'bank_statement', name: 'College Bank Statement (Last 12 Months)', mandatory: true },
    { id: 'property_deed', name: 'Campus Land & Building Title Deed', mandatory: true }
  ],
  'CIBIL Improvement Consultation': [
    { id: 'pan', name: 'PAN Card', mandatory: true },
    { id: 'aadhaar', name: 'Aadhaar Card', mandatory: true },
    { id: 'cibil_report', name: 'Latest CIBIL Report / Loan Account Statements', mandatory: true }
  ]
};

/**
 * Get Document Requirements for specific loan product
 */
function getRequiredDocuments(productName) {
  return DOCUMENT_REQUIREMENTS[productName] || DOCUMENT_REQUIREMENTS['Personal / Salary Loan'];
}

/**
 * Evaluate Document Completeness Checkpoint
 */
function evaluateDocumentCompleteness(productName, receivedDocuments = []) {
  const requirements = getRequiredDocuments(productName);
  const mandatoryReqs = requirements.filter(r => r.mandatory);

  const receivedIds = receivedDocuments.map(d => (typeof d === 'string' ? d : d.docId || d.id || d.name));

  const missingMandatory = mandatoryReqs.filter(r => !receivedIds.some(rec => rec.toLowerCase().includes(r.id.toLowerCase()) || rec.toLowerCase().includes(r.name.toLowerCase())));
  const allMissing = requirements.filter(r => !receivedIds.some(rec => rec.toLowerCase().includes(r.id.toLowerCase()) || rec.toLowerCase().includes(r.name.toLowerCase())));

  const totalRequired = requirements.length;
  const receivedCount = receivedDocuments.length;
  const isComplete = missingMandatory.length === 0;

  const completenessPercentage = Math.min(100, Math.round((receivedCount / Math.max(1, totalRequired)) * 100));

  return {
    isComplete: isComplete,
    status: isComplete ? 'DOCUMENTS_COMPLETE' : (receivedCount > 0 ? 'DOCUMENTS_PARTIAL' : 'DOCUMENTS_PENDING'),
    totalRequired: totalRequired,
    receivedCount: receivedCount,
    completenessPercentage: completenessPercentage,
    missingDocuments: allMissing,
    missingMandatory: missingMandatory
  };
}

module.exports = {
  DOCUMENT_REQUIREMENTS,
  getRequiredDocuments,
  evaluateDocumentCompleteness
};
