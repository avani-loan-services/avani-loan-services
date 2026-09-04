// src/services/documentRulesEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Deterministic Business Routing & Document Checklist Engine
// Enforces Application-Owned Enums for Loan Products & Profiles
// ─────────────────────────────────────────────────────────────────

const CANONICAL_LOAN_PRODUCTS = [
  'PERSONAL_LOAN',
  'BUSINESS_LOAN',
  'DOCTOR_LOAN',
  'CA_LOAN',
  'HOME_LOAN',
  'MORTGAGE_LOAN',
  'EDUCATION_LOAN_INDIA',
  'EDUCATION_LOAN_GLOBAL',
  'SCHOOL_FUNDING',
  'COLLEGE_FUNDING'
];

const CANONICAL_EMPLOYMENT_TYPES = [
  'SALARIED',
  'SELF_EMPLOYED',
  'BUSINESS_OWNER',
  'PROFESSIONAL'
];

const CANONICAL_PROFESSIONS = [
  'DOCTOR',
  'CHARTERED_ACCOUNTANT',
  'ARCHITECT',
  'ENGINEER',
  'OTHER_PROFESSIONAL'
];

function normalizeLoanProduct(raw) {
  const norm = String(raw || '').toUpperCase().trim();
  if (norm.includes('DOCTOR')) return 'DOCTOR_LOAN';
  if ((/\bCA\b|_CA_|^CA_/.test(norm) || norm.includes('CHARTERED')) && !norm.includes('EDUCATION')) return 'CA_LOAN';
  if (norm.includes('HOME') || norm.includes('HOUSING')) return 'HOME_LOAN';
  if (norm.includes('MORTGAGE') || norm.includes('PROPERTY')) return 'MORTGAGE_LOAN';
  if (norm.includes('GLOBAL') || norm.includes('ABROAD') || norm.includes('USA') || norm.includes('UK') || norm.includes('CANADA')) return 'EDUCATION_LOAN_GLOBAL';
  if (norm.includes('EDUCATION') || norm.includes('STUDENT')) return 'EDUCATION_LOAN_INDIA';
  if (norm.includes('SCHOOL')) return 'SCHOOL_FUNDING';
  if (norm.includes('COLLEGE')) return 'COLLEGE_FUNDING';
  if (norm.includes('BUSINESS') || norm.includes('COMMERCIAL')) return 'BUSINESS_LOAN';
  return 'PERSONAL_LOAN';
}

function generateDocumentChecklist(employmentType = 'SALARIED', profession = 'OTHER_PROFESSIONAL', loanProduct = 'PERSONAL_LOAN', customerName = 'Valued Customer') {
  const normEmp = String(employmentType || '').toUpperCase();
  const normProf = String(profession || '').toUpperCase();
  const normLoan = normalizeLoanProduct(loanProduct);
  const cleanName = customerName.replace(/^(Dr\.|CA)\s+/i, '');

  // 1. DOCTOR LOAN
  if (normProf === 'DOCTOR' || normLoan === 'DOCTOR_LOAN') {
    return {
      category: 'DOCTOR_LOAN',
      title: 'Doctor Professional Loan Document Checklist',
      checklistText: `📋 *AVANI LOAN SERVICES — DOCTOR PROFESSIONAL LOAN DOCUMENT CHECKLIST*

Hello Dr. ${cleanName}, here is your required document checklist:

🩺 *DOCTOR PROFESSIONAL DOCUMENTS*
• ✅ Degree Certificate
• ✅ Registration Certificate (Old & New)
• ✅ Clinic / Hospital Registration Certificate

🪪 *KYC & IDENTITY PROOF*
• ✅ PAN Card
• ✅ Aadhaar Card
• ✅ Passport-size Photo

📊 *FINANCIAL DOCUMENTS*
• ✅ Last 2 years ITR
• ✅ Last 6–12 months Bank Statements (Current & Savings)
• ✅ Existing Loan Details (if any)`
    };
  }

  // 2. CA LOAN
  if (normProf === 'CHARTERED_ACCOUNTANT' || normLoan === 'CA_LOAN') {
    return {
      category: 'CA_LOAN',
      title: 'Chartered Accountant Loan Document Checklist',
      checklistText: `📋 *AVANI LOAN SERVICES — CHARTERED ACCOUNTANT LOAN CHECKLIST*

Hello CA ${cleanName}, here is your required document checklist:

💼 *PROFESSIONAL DOCUMENTS*
• ✅ Certificate of Practice (COP)
• ✅ ICAI Membership Certificate

🪪 *KYC & IDENTITY PROOF*
• ✅ PAN Card
• ✅ Aadhaar Card
• ✅ Passport-size Photo

📊 *FINANCIAL DOCUMENTS*
• ✅ Last 2 years ITR
• ✅ Last 6–12 months Bank Statements
• ✅ Existing Loan Details (if any)`
    };
  }

  // 3. BUSINESS / SELF-EMPLOYED LOAN
  if (normEmp === 'BUSINESS_OWNER' || normEmp === 'SELF_EMPLOYED' || normLoan === 'BUSINESS_LOAN') {
    return {
      category: 'BUSINESS_LOAN',
      title: 'Business & Self-Employed Document Checklist',
      checklistText: `📋 *AVANI LOAN SERVICES — BUSINESS & SELF-EMPLOYED CHECKLIST*

Hello ${customerName}, here is your required document checklist:

🪪 *IDENTITY & ADDRESS PROOF*
• ✅ PAN Card (Individual + Business)
• ✅ Aadhaar Card
• ✅ GST Registration Certificate

🏢 *BUSINESS DOCUMENTS*
• ✅ Business Registration / Udyam Certificate
• ✅ Shop & Establishment Certificate
• ✅ Partnership Deed / MOA (where applicable)

📊 *FINANCIAL DOCUMENTS*
• ✅ Last 2 years ITR with CA stamp
• ✅ Last 12 months Bank Statements
• ✅ Last 2 years Audited Balance Sheet`
    };
  }

  // 4. EDUCATION LOAN (GLOBAL OR INDIA)
  if (normLoan === 'EDUCATION_LOAN_GLOBAL' || normLoan === 'EDUCATION_LOAN_INDIA' || normLoan === 'SCHOOL_FUNDING' || normLoan === 'COLLEGE_FUNDING') {
    const isGlobal = normLoan === 'EDUCATION_LOAN_GLOBAL';
    return {
      category: normLoan,
      title: `${isGlobal ? 'Global' : 'India'} Education Loan Document Checklist`,
      checklistText: `📋 *AVANI LOAN SERVICES — ${isGlobal ? 'GLOBAL' : 'INDIA'} EDUCATION LOAN CHECKLIST*

Hello ${customerName}, here is the document requirement for ${isGlobal ? 'Overseas (USA/UK/Canada/Germany/Australia)' : 'India'} Education Funding:

🎓 *STUDENT DOCUMENTS*
• ✅ Admission Letter / Offer Letter
• ✅ Passport (Both sides) ${isGlobal ? '[Mandatory]' : ''}
• ✅ Test Scorecard (${isGlobal ? 'GRE / TOEFL / Duolingo / PTE / IELTS' : 'CET / JEE / GATE'})
• ✅ Academic Certificates (10th, 12th/Diploma, Degree, Transcripts, CMM & PC)
• ✅ Work Experience Documents & Resume (if applicable)
• ✅ Aadhaar & PAN Card

👥 *CO-APPLICANT DOCUMENTS (Father / Mother / Sibling / Blood Relative)*
• If Salaried: Aadhaar, PAN, 3 months Payslips, 6 months Bank Statements, 2 years Form 16.
• If Self-Employed: Aadhaar, PAN, 2 years ITR, P&L & Balance Sheet, Business License, 6 months Bank Statements.
• If Farmer: Aadhaar, PAN, Patta Pass Book, Agriculture Income Certificate, 6 months Bank Statements.
• If Pensioner: Aadhaar, PAN, Pension Receipts, 6 months Bank Statements.
• If Rental Income: Aadhaar, PAN, Rental Agreements, 6 months Bank Statements.

📌 *ADDITIONAL*
• ✅ Property Documents (if Collateral Loan)
• ✅ Two References (Name, Number, Email, Address)`
    };
  }

  // 5. HOME & MORTGAGE LOAN
  if (normLoan === 'HOME_LOAN' || normLoan === 'MORTGAGE_LOAN') {
    return {
      category: normLoan,
      title: 'Home & Mortgage Loan Document Checklist',
      checklistText: `📋 *AVANI LOAN SERVICES — HOME / MORTGAGE LOAN CHECKLIST*

Hello ${customerName}, here is your required document checklist:

🪪 *IDENTITY & ADDRESS PROOF*
• ✅ Aadhaar Card & PAN Card
• ✅ Utility Bill (last 3 months) / Driving License

🏠 *PROPERTY DOCUMENTS*
• ✅ Sale Agreement / Allotment Letter
• ✅ Original Property Title Deed & Title Search Report
• ✅ Approved Building Plan & Tax Receipts

💰 *INCOME PROOF*
• If Salaried: Payslips (3m), Bank Stmts (6m), Form 16 (2y)
• If Business: ITR (2y), Bank Stmts (12m), Audited Financials (2y)`
    };
  }

  // 6. SALARIED PERSONAL LOAN (Default)
  return {
    category: 'PERSONAL_LOAN',
    title: 'Salaried Personal Loan Document Checklist',
    checklistText: `📋 *AVANI LOAN SERVICES — SALARIED PERSONAL LOAN CHECKLIST*

Hello ${customerName}, here is your required document checklist:

🪪 *IDENTITY PROOF*
• ✅ Aadhaar Card
• ✅ PAN Card
• ✅ Passport / Voter ID

📍 *ADDRESS PROOF*
• ✅ Aadhaar Card
• ✅ Utility Bill (last 3 months) / Driving License

💰 *INCOME DOCUMENTS*
• ✅ Last 3 months Salary Slips
• ✅ Last 6 months Bank Statements
• ✅ Last 2 years Form 16

💼 *EMPLOYMENT PROOF*
• ✅ Employee ID Card
• ✅ Appointment Letter / Offer Letter`
  };
}

module.exports = {
  CANONICAL_LOAN_PRODUCTS,
  CANONICAL_EMPLOYMENT_TYPES,
  CANONICAL_PROFESSIONS,
  normalizeLoanProduct,
  generateDocumentChecklist
};
