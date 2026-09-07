// src/services/loanQualificationEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Deterministic Loan Qualification & Scoring Engine for AVANI LOAN SERVICES
// Supports 10 Canonical Loan Types with dynamic schema & score rating
// ─────────────────────────────────────────────────────────────────

const LOAN_PRODUCTS = {
  PERSONAL_LOAN: 'PERSONAL_LOAN',
  BUSINESS_LOAN: 'BUSINESS_LOAN',
  DOCTOR_LOAN: 'DOCTOR_LOAN',
  CA_LOAN: 'CA_LOAN',
  HOME_LOAN: 'HOME_LOAN',
  MORTGAGE_LOAN: 'MORTGAGE_LOAN',
  EDUCATION_LOAN_INDIA: 'EDUCATION_LOAN_INDIA',
  EDUCATION_LOAN_GLOBAL: 'EDUCATION_LOAN_GLOBAL',
  SCHOOL_FUNDING: 'SCHOOL_FUNDING',
  COLLEGE_FUNDING: 'COLLEGE_FUNDING',
  CIBIL_CONSULTATION: 'CIBIL_CONSULTATION'
};

const DISCLAIMER = "Indicative / preliminary assessment only. Final sanction and disbursement are subject to formal underwriting, credit verification, and policy approval by lending partner institutions.";

/**
 * Standardize loan product string to canonical enum
 */
function normalizeLoanProduct(raw) {
  const norm = String(raw || '').toUpperCase().trim();
  if (norm.includes('DOCTOR')) return LOAN_PRODUCTS.DOCTOR_LOAN;
  if ((/\bCA\b|_CA_|^CA_/.test(norm) || norm.includes('CHARTERED')) && !norm.includes('EDUCATION')) return LOAN_PRODUCTS.CA_LOAN;
  if (norm.includes('HOME') || norm.includes('HOUSING')) return LOAN_PRODUCTS.HOME_LOAN;
  if (norm.includes('MORTGAGE') || norm.includes('PROPERTY') || norm.includes('LAP')) return LOAN_PRODUCTS.MORTGAGE_LOAN;
  if (norm.includes('GLOBAL') || norm.includes('ABROAD') || norm.includes('OVERSEAS') || norm.includes('USA') || norm.includes('UK') || norm.includes('CANADA')) return LOAN_PRODUCTS.EDUCATION_LOAN_GLOBAL;
  if (norm.includes('EDUCATION') || norm.includes('STUDENT')) return LOAN_PRODUCTS.EDUCATION_LOAN_INDIA;
  if (norm.includes('SCHOOL')) return LOAN_PRODUCTS.SCHOOL_FUNDING;
  if (norm.includes('COLLEGE')) return LOAN_PRODUCTS.COLLEGE_FUNDING;
  if (norm.includes('CIBIL') || norm.includes('CREDIT')) return LOAN_PRODUCTS.CIBIL_CONSULTATION;
  if (norm.includes('BUSINESS') || norm.includes('COMMERCIAL') || norm.includes('MSME')) return LOAN_PRODUCTS.BUSINESS_LOAN;
  return LOAN_PRODUCTS.PERSONAL_LOAN;
}

/**
 * Dynamic qualification questions schema per loan product
 */
const QUALIFICATION_SCHEMAS = {
  [LOAN_PRODUCTS.PERSONAL_LOAN]: {
    loanType: 'Personal / Salary Loan',
    questions: [
      { id: 'fullName', label: 'Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City / Location', type: 'text', required: true },
      { id: 'employmentType', label: 'Employment Type', type: 'select', options: ['Salaried - Private', 'Salaried - Govt', 'Self-Employed Professional', 'Other'], required: true },
      { id: 'monthlyIncome', label: 'Net Monthly Income (₹)', type: 'number', required: true },
      { id: 'existingEmi', label: 'Current Total Monthly EMI (₹)', type: 'number', required: true },
      { id: 'loanAmount', label: 'Required Loan Amount (₹)', type: 'number', required: true },
      { id: 'cibilStatus', label: 'CIBIL / Credit Status', type: 'select', options: ['Above 750 (Excellent)', '700-750 (Good)', '650-700 (Average)', 'Below 650 / Low', 'No CIBIL / New to Credit', 'Not Sure'], required: false }
    ]
  },
  [LOAN_PRODUCTS.BUSINESS_LOAN]: {
    loanType: 'Business Loan',
    questions: [
      { id: 'fullName', label: 'Proprietor / Director Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'Business City / Location', type: 'text', required: true },
      { id: 'businessType', label: 'Business Type', type: 'select', options: ['Proprietorship', 'Partnership / LLP', 'Private Limited', 'Retail / Wholesale Trader', 'Manufacturer', 'Service Provider'], required: true },
      { id: 'vintageYears', label: 'Business Vintage (Years in Operation)', type: 'number', required: true },
      { id: 'annualTurnover', label: 'Annual Turnover (₹)', type: 'number', required: true },
      { id: 'existingBusinessLoans', label: 'Existing Business Loans (₹)', type: 'number', required: false },
      { id: 'existingEmi', label: 'Current Monthly EMI (₹)', type: 'number', required: true },
      { id: 'loanAmount', label: 'Required Loan Amount (₹)', type: 'number', required: true },
      { id: 'itrAvailable', label: 'Last 2-3 Years ITR Available?', type: 'select', options: ['Yes - Last 2+ Years', 'Yes - 1 Year Only', 'No ITR Available'], required: true },
      { id: 'gstAvailable', label: 'GST Registration & Returns Available?', type: 'select', options: ['Yes - Active GST with Returns', 'GST Registered without Regular Returns', 'No GST (Exempt / Below Limit)'], required: true }
    ]
  },
  [LOAN_PRODUCTS.DOCTOR_LOAN]: {
    loanType: 'Doctor Professional Loan',
    questions: [
      { id: 'fullName', label: 'Doctor Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'Practice City / Location', type: 'text', required: true },
      { id: 'medicalSpecialty', label: 'Medical Specialization', type: 'select', options: ['MBBS / MD / MS', 'BDS / MDS (Dental)', 'BHMS / BAMS (Ayush)', 'Specialist / Super Specialist', 'Physiotherapist', 'Veterinary'], required: true },
      { id: 'qualification', label: 'Highest Medical Qualification Degree', type: 'text', required: true },
      { id: 'practiceType', label: 'Practice / Employment Type', type: 'select', options: ['Own Clinic / Nursing Home', 'Consultant at Hospital', 'Salaried Doctor', 'Both Clinic & Hospital'], required: true },
      { id: 'practiceVintage', label: 'Post-Qualification Experience (Years)', type: 'number', required: true },
      { id: 'monthlyIncome', label: 'Average Monthly Income / Receipts (₹)', type: 'number', required: true },
      { id: 'existingEmi', label: 'Existing Monthly EMI (₹)', type: 'number', required: true },
      { id: 'loanAmount', label: 'Required Loan Amount (₹)', type: 'number', required: true },
      { id: 'councilRegistration', label: 'Medical Council Registration Certificate Available?', type: 'select', options: ['Yes - Valid Certificate', 'In Process / Renewal', 'No'], required: true }
    ]
  },
  [LOAN_PRODUCTS.CA_LOAN]: {
    loanType: 'Chartered Accountant / Professional Loan',
    questions: [
      { id: 'fullName', label: 'Professional Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City / Location', type: 'text', required: true },
      { id: 'professionType', label: 'Profession', type: 'select', options: ['Chartered Accountant (CA)', 'Company Secretary (CS)', 'Cost & Management Accountant (CMA)', 'Architect', 'Consulting Engineer'], required: true },
      { id: 'copVintageYears', label: 'Certificate of Practice (COP) Vintage (Years)', type: 'number', required: true },
      { id: 'monthlyIncome', label: 'Average Monthly Income / Fee Receipts (₹)', type: 'number', required: true },
      { id: 'existingEmi', label: 'Existing Monthly EMI (₹)', type: 'number', required: true },
      { id: 'loanAmount', label: 'Required Loan Amount (₹)', type: 'number', required: true },
      { id: 'membershipDocAvailable', label: 'ICAI / Council Membership & COP Available?', type: 'select', options: ['Yes - Both Available', 'Membership only (No COP)', 'No'], required: true }
    ]
  },
  [LOAN_PRODUCTS.HOME_LOAN]: {
    loanType: 'Home Loan & Housing Finance',
    questions: [
      { id: 'fullName', label: 'Applicant Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City of Residence', type: 'text', required: true },
      { id: 'employmentType', label: 'Employment Type', type: 'select', options: ['Salaried (Govt / MNC / Pvt)', 'Self-Employed Business', 'Professional', 'NRI'], required: true },
      { id: 'monthlyIncome', label: 'Net Monthly Household Income (₹)', type: 'number', required: true },
      { id: 'propertyType', label: 'Property Type', type: 'select', options: ['Ready Possession Flat / House', 'Under-Construction Flat', 'Plot + Construction', 'Self Construction on Owned Plot', 'Home Renovation / Extension'], required: true },
      { id: 'propertyLocation', label: 'Property City / Location', type: 'text', required: true },
      { id: 'propertyValue', label: 'Estimated Property Value (₹)', type: 'number', required: true },
      { id: 'loanAmount', label: 'Required Home Loan Amount (₹)', type: 'number', required: true },
      { id: 'downPaymentAvailable', label: 'Down Payment Contribution Ready (₹)', type: 'number', required: true },
      { id: 'existingEmi', label: 'Existing Monthly EMI (₹)', type: 'number', required: true },
      { id: 'cibilStatus', label: 'CIBIL Status', type: 'select', options: ['Above 750', '700-750', 'Below 700', 'New to Credit'], required: false }
    ]
  },
  [LOAN_PRODUCTS.MORTGAGE_LOAN]: {
    loanType: 'Mortgage Loan / Loan Against Property (LAP)',
    questions: [
      { id: 'fullName', label: 'Applicant / Property Owner Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City of Residence', type: 'text', required: true },
      { id: 'employmentType', label: 'Employment / Business Profile', type: 'select', options: ['Self-Employed Business', 'Salaried', 'Commercial Property Owner', 'Professional'], required: true },
      { id: 'monthlyIncome', label: 'Monthly Income / Business Turnover (₹)', type: 'number', required: true },
      { id: 'propertyType', label: 'Mortgage Property Type', type: 'select', options: ['Residential Self-Occupied', 'Residential Rented', 'Commercial Shop / Office', 'Industrial Unit / Shed', 'Open NA Residential Plot'], required: true },
      { id: 'propertyLocation', label: 'Property Location', type: 'text', required: true },
      { id: 'propertyValue', label: 'Estimated Market Value of Property (₹)', type: 'number', required: true },
      { id: 'existingLoanOnProperty', label: 'Existing Loan on this Property (₹)?', type: 'number', required: false },
      { id: 'loanAmount', label: 'Required Mortgage Loan Amount (₹)', type: 'number', required: true },
      { id: 'clearTitleDocs', label: 'Are Clear Title & Sanctioned Plans Available?', type: 'select', options: ['Yes - Clear Title & Registered Deeds', 'Ancestral / Partition Pending', 'Grampanchayat Property', 'Under Verification'], required: true }
    ]
  },
  [LOAN_PRODUCTS.EDUCATION_LOAN_INDIA]: {
    loanType: 'Education Loan — India',
    questions: [
      { id: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { id: 'coapplicantName', label: 'Parent / Co-applicant Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Contact Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City / Location', type: 'text', required: true },
      { id: 'courseName', label: 'Course Name (e.g., B.Tech, MBA, MBBS)', type: 'text', required: true },
      { id: 'collegeName', label: 'College / University Name', type: 'text', required: true },
      { id: 'courseFee', label: 'Total Course Fee (₹)', type: 'number', required: true },
      { id: 'loanAmount', label: 'Required Loan Amount (₹)', type: 'number', required: true },
      { id: 'admissionStatus', label: 'Admission Status', type: 'select', options: ['Confirmed / Admission Letter Received', 'Merit List Announced / Counseling Scheduled', 'Entrance Exam Cleared', 'Awaiting Results'], required: true },
      { id: 'coapplicantIncome', label: 'Co-applicant Monthly Income (₹)', type: 'number', required: true },
      { id: 'existingEmi', label: 'Co-applicant Existing Monthly EMI (₹)', type: 'number', required: false }
    ]
  },
  [LOAN_PRODUCTS.EDUCATION_LOAN_GLOBAL]: {
    loanType: 'Education Loan — Global Studies (Abroad)',
    questions: [
      { id: 'studentName', label: 'Student Full Name', type: 'text', required: true },
      { id: 'coapplicantName', label: 'Parent / Co-applicant Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Contact Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City / Location', type: 'text', required: true },
      { id: 'destinationCountry', label: 'Destination Country', type: 'select', options: ['United States (USA)', 'United Kingdom (UK)', 'Canada', 'Germany', 'Australia', 'Ireland', 'Singapore / Europe', 'Other'], required: true },
      { id: 'universityName', label: 'Target University / Institution', type: 'text', required: true },
      { id: 'courseName', label: 'Course Degree / Master’s Program', type: 'text', required: true },
      { id: 'tuitionFee', label: 'Estimated Total Tuition Fee (₹ / Foreign Currency)', type: 'number', required: true },
      { id: 'livingExpenses', label: 'Estimated Living Expenses (₹)', type: 'number', required: false },
      { id: 'loanAmount', label: 'Required Total Loan Amount (₹)', type: 'number', required: true },
      { id: 'offerStatus', label: 'University Offer Letter Status', type: 'select', options: ['Unconditional Offer Letter / I-20 / CAS', 'Conditional Offer Letter', 'Application Submitted / Awaiting Decision'], required: true },
      { id: 'coapplicantIncome', label: 'Co-applicant Annual Income (₹)', type: 'number', required: true }
    ]
  },
  [LOAN_PRODUCTS.SCHOOL_FUNDING]: {
    loanType: 'School Funding & Infrastructure Loan',
    questions: [
      { id: 'institutionName', label: 'School / Institution Name', type: 'text', required: true },
      { id: 'authorizedPerson', label: 'Trustee / Chairman / Authorized Person Name', type: 'text', required: true },
      { id: 'mobile', label: 'Contact Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'School City / District', type: 'text', required: true },
      { id: 'institutionType', label: 'School Category / Board', type: 'select', options: ['CBSE Affiliated', 'ICSE Affiliated', 'State Board (Private Unaided)', 'International / IB School', 'Pre-School / K-12 Chain'], required: true },
      { id: 'yearsOperating', label: 'Years in Operation', type: 'number', required: true },
      { id: 'annualRevenue', label: 'Annual Fee Collection / Revenue (₹)', type: 'number', required: true },
      { id: 'studentStrength', label: 'Current Student Strength', type: 'number', required: false },
      { id: 'existingLoans', label: 'Current Outstanding Institutional Loans (₹)', type: 'number', required: false },
      { id: 'loanAmount', label: 'Required Funding Amount (₹)', type: 'number', required: true },
      { id: 'fundingPurpose', label: 'Funding Purpose', type: 'select', options: ['Campus Construction / Building Expansion', 'Lab / Sports / Tech Infrastructure', 'Working Capital / Fee Advance', 'Refinance / Takeover of Costly Loan'], required: true },
      { id: 'schoolPropertyType', label: 'School Campus Land Status', type: 'select', options: ['Trust Owned Land & Building', 'Registered Long Lease (30+ Years)', 'Leased Building'], required: true }
    ]
  },
  [LOAN_PRODUCTS.COLLEGE_FUNDING]: {
    loanType: 'College & Higher Education Institute Funding',
    questions: [
      { id: 'institutionName', label: 'College / Institute Name', type: 'text', required: true },
      { id: 'authorizedPerson', label: 'Secretary / Trustee / Principal Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Contact Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'College City / District', type: 'text', required: true },
      { id: 'institutionType', label: 'College Category', type: 'select', options: ['Engineering / Polytechnic', 'Medical / Dental / Pharmacy', 'Management / MBA Institute', 'Arts / Science / Commerce Degree College', 'Autonomous University / Campus'], required: true },
      { id: 'yearsOperating', label: 'Years in Operation', type: 'number', required: true },
      { id: 'annualRevenue', label: 'Annual Institutional Receipts / Fee (₹)', type: 'number', required: true },
      { id: 'existingLoans', label: 'Existing Institutional Debt (₹)', type: 'number', required: false },
      { id: 'loanAmount', label: 'Required Funding Amount (₹)', type: 'number', required: true },
      { id: 'fundingPurpose', label: 'Purpose of Funding', type: 'select', options: ['New Wing / Hostel / Hospital Construction', 'Equipment & Advanced Labs', 'Working Capital / Expansion', 'Debt Consolidation'], required: true },
      { id: 'campusPropertyStatus', label: 'Campus Land & Building Ownership', type: 'select', options: ['Trust Owned Freehold', 'Government Allotment / Long Lease', 'Other'], required: true }
    ]
  },
  [LOAN_PRODUCTS.CIBIL_CONSULTATION]: {
    loanType: 'CIBIL Repair & Credit Score Consultation',
    questions: [
      { id: 'fullName', label: 'Customer Full Name', type: 'text', required: true },
      { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
      { id: 'city', label: 'City / Location', type: 'text', required: true },
      { id: 'cibilIssue', label: 'Current Credit / CIBIL Issue', type: 'select', options: ['Loan Written-Off / Settled Status', 'Overdue Dues / Payment Delays (DPD)', 'Multiple Loan Enquiries / Rejections', 'Identity / Name Dispute on Report', 'Low Score (Below 650) with No Default', 'Need Score Improvement for New Home/Business Loan'], required: true },
      { id: 'approxCibilScore', label: 'Approximate Current CIBIL Score', type: 'select', options: ['Below 600', '600 - 650', '650 - 700', 'Don’t Know / Need Report'], required: true },
      { id: 'totalOutstandingDebt', label: 'Approximate Total Unpaid/Disputed Debt (₹)', type: 'number', required: false },
      { id: 'monthlyIncome', label: 'Current Net Monthly Income (₹)', type: 'number', required: true }
    ]
  }
};

/**
 * Get schema for a loan product
 */
function getQualificationSchema(productRaw) {
  const normProduct = normalizeLoanProduct(productRaw);
  return QUALIFICATION_SCHEMAS[normProduct] || QUALIFICATION_SCHEMAS[LOAN_PRODUCTS.PERSONAL_LOAN];
}

function getAnswerValue(answers, fieldId) {
  if (answers[fieldId] !== undefined && answers[fieldId] !== null && String(answers[fieldId]).trim() !== '') {
    return answers[fieldId];
  }
  // Field aliases for flexible form submissions
  if (fieldId === 'fullName') {
    return answers.studentName || answers.applicantName || answers.authorizedPerson || answers.name;
  }
  if (fieldId === 'studentName') {
    return answers.fullName || answers.name;
  }
  if (fieldId === 'applicantName') {
    return answers.fullName || answers.name;
  }
  if (fieldId === 'authorizedPerson') {
    return answers.fullName || answers.name;
  }
  if (fieldId === 'coapplicantName') {
    return answers.parentName || answers.coApplicantName || answers.guarantorName;
  }
  return undefined;
}

/**
 * Evaluate qualification answers and compute deterministic score
 * Returns: {
 *   isComplete: boolean,
 *   qualificationStatus: 'QUALIFIED_FOR_REVIEW' | 'INFORMATION_PENDING' | 'REVIEW_REQUIRED' | 'NOT_READY',
 *   leadScore: number (0-100),
 *   leadScoreGrade: 'HOT' | 'WARM' | 'COLD',
 *   missingFields: string[],
 *   summary: string,
 *   disclaimer: string
 * }
 */
function evaluateQualification(productRaw, answers = {}) {
  const normProduct = normalizeLoanProduct(productRaw);
  const schema = QUALIFICATION_SCHEMAS[normProduct] || QUALIFICATION_SCHEMAS[LOAN_PRODUCTS.PERSONAL_LOAN];

  const missingFields = [];
  schema.questions.forEach(q => {
    if (q.required) {
      const val = getAnswerValue(answers, q.id);
      if (val === undefined || val === null || String(val).trim() === '') {
        missingFields.push(q.id);
      }
    }
  });

  // 1. Completeness points (up to 25 pts)
  const totalQuestions = schema.questions.length;
  const answeredCount = schema.questions.filter(q => {
    const val = getAnswerValue(answers, q.id);
    return val !== undefined && val !== null && String(val).trim() !== '';
  }).length;
  const completenessPoints = Math.round((answeredCount / totalQuestions) * 25);

  // 2. Financial Capability & Debt-to-Income (up to 35 pts)
  let capabilityPoints = 15; // default baseline
  let monthlyIncomeEst = 0;
  if (answers.monthlyIncome && parseFloat(answers.monthlyIncome) > 0) {
    monthlyIncomeEst = parseFloat(answers.monthlyIncome);
  } else if (answers.annualRevenue && parseFloat(answers.annualRevenue) > 0) {
    monthlyIncomeEst = parseFloat(answers.annualRevenue) / 12;
  } else if (answers.annualTurnover && parseFloat(answers.annualTurnover) > 0) {
    monthlyIncomeEst = parseFloat(answers.annualTurnover) / 12;
  } else if (answers.coapplicantIncome && parseFloat(answers.coapplicantIncome) > 0) {
    const coInc = parseFloat(answers.coapplicantIncome);
    monthlyIncomeEst = coInc > 200000 ? coInc / 12 : coInc;
  }

  const emi = parseFloat(answers.existingEmi || answers.existingLoans || answers.existingBusinessLoans || 0);

  if (monthlyIncomeEst > 0) {
    const dtiRatio = emi / monthlyIncomeEst;

    if (dtiRatio <= 0.3) capabilityPoints = 35;
    else if (dtiRatio <= 0.5) capabilityPoints = 25;
    else if (dtiRatio <= 0.7) capabilityPoints = 18;
    else capabilityPoints = 8;
  }

  // 3. Stability & Profile Vintage (up to 20 pts)
  let stabilityPoints = 10;
  const vintage = parseFloat(answers.vintageYears || answers.practiceVintage || answers.copVintageYears || answers.yearsOperating || 0);
  if (vintage >= 5) stabilityPoints = 20;
  else if (vintage >= 2) stabilityPoints = 16;
  else if (vintage >= 1) stabilityPoints = 12;
  else if (answers.employmentType && String(answers.employmentType).toLowerCase().includes('salaried')) stabilityPoints = 18;
  else if (answers.admissionStatus || answers.offerStatus) stabilityPoints = 16;

  // 4. Documentation Readiness (up to 20 pts)
  let docPoints = 12;
  const hasItr = answers.itrAvailable && answers.itrAvailable.includes('Yes');
  const hasGst = answers.gstAvailable && answers.gstAvailable.includes('Yes');
  const hasTitle = answers.clearTitleDocs && answers.clearTitleDocs.includes('Yes');
  const hasCouncil = (answers.councilRegistration && answers.councilRegistration.includes('Yes')) || 
                     (answers.membershipDocAvailable && answers.membershipDocAvailable.includes('Yes'));
  const hasAdmission = answers.admissionStatus && answers.admissionStatus.includes('Confirmed');
  const hasOffer = answers.offerStatus && answers.offerStatus.includes('Unconditional');
  const hasGoodCibil = answers.cibilStatus && (answers.cibilStatus.includes('Above 750') || answers.cibilStatus.includes('700-750'));

  if (hasItr || hasGst || hasTitle || hasCouncil || hasAdmission || hasOffer) docPoints = 20;
  else if (hasGoodCibil || answers.downPaymentAvailable || answers.schoolPropertyType || answers.campusPropertyStatus || answers.cibilIssue) docPoints = 18;
  else if (answers.employmentType && String(answers.employmentType).toLowerCase().includes('salaried')) docPoints = 16;

  // Total Score
  let leadScore = completenessPoints + capabilityPoints + stabilityPoints + docPoints;
  leadScore = Math.min(100, Math.max(10, leadScore));

  let leadScoreGrade = 'COLD';
  if (leadScore >= 70) leadScoreGrade = 'HOT';
  else if (leadScore >= 45) leadScoreGrade = 'WARM';

  // Determine Qualification Status
  let qualificationStatus = 'QUALIFIED_FOR_REVIEW';

  if (missingFields.length > 0) {
    qualificationStatus = 'INFORMATION_PENDING';
  } else if (monthlyIncomeEst <= 0 || capabilityPoints <= 5) {
    qualificationStatus = 'NOT_READY';
  } else if (leadScoreGrade === 'HOT') {
    qualificationStatus = 'QUALIFIED_FOR_REVIEW';
  } else {
    qualificationStatus = 'REVIEW_REQUIRED';
  }

  const summary = `Evaluated for ${schema.loanType}. Score: ${leadScore}/100 (${leadScoreGrade}). Status: ${qualificationStatus}.`;

  return {
    loanProduct: normProduct,
    loanType: schema.loanType,
    isComplete: missingFields.length === 0,
    missingFields,
    leadScore,
    leadScoreGrade,
    qualificationStatus,
    summary,
    disclaimer: DISCLAIMER,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  LOAN_PRODUCTS,
  DISCLAIMER,
  normalizeLoanProduct,
  getQualificationSchema,
  evaluateQualification,
  QUALIFICATION_SCHEMAS
};
