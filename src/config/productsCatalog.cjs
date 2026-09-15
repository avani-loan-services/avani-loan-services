// src/config/productsCatalog.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — 10 LOAN PRODUCT SPECIFICATIONS & LIBRARIES
// ─────────────────────────────────────────────────────────────────

const PRODUCTS_CATALOG = Object.freeze({
  personal_loan: {
    id: 'personal_loan',
    code: 'PERSONAL',
    name: 'Personal Loan',
    slug: 'personal-loan',
    category: 'RETAIL',
    targetAudience: ['Salaried Professionals', 'Working Professionals', 'Self-Employed Individuals'],
    topics: [
      'Personal loan eligibility',
      'Salary-based eligibility & FOIR calculations',
      'CIBIL credit score benchmarks',
      'Required KYC and income documents',
      'Loan amount & tenure optimization',
      'EMI budgeting & existing obligations management',
      'Common application mistakes to avoid',
      'Multi-lender rate comparison',
      'Emergency, wedding & medical funding needs'
    ],
    ctas: [
      'Check Eligibility',
      'Talk to an Advisor',
      'WhatsApp AVANI LOAN SERVICES',
      'Book Your Free Loan Consultation'
    ],
    primaryCompliantDisclaimer: 'Eligibility and sanction terms depend on lender policies and applicant credit profile.'
  },

  business_loan: {
    id: 'business_loan',
    code: 'BUSINESS',
    name: 'Business Loan',
    slug: 'business-loan',
    category: 'COMMERCIAL',
    targetAudience: ['Business Owners', 'MSMEs', 'SMEs', 'Self-Employed Traders & Manufacturers'],
    topics: [
      'Working capital financing',
      'Business expansion & infrastructure',
      'Machinery & equipment purchase',
      'Inventory & seasonal stock purchase',
      'Cash-flow smoothing & turnover assessment',
      'Banking history & average quarterly balance',
      'ITR, GST returns & balance sheet review',
      'Business vintage & operational viability',
      'Unsecured collateral-free possibilities'
    ],
    ctas: [
      'Apply for Business Loan',
      'Check Business Limit',
      'Connect with Advisor',
      'Evaluate Working Capital Needs'
    ],
    primaryCompliantDisclaimer: 'Business loan sanction limits and interest rates are determined by lender credit assessment and audited financials.'
  },

  doctor_loan: {
    id: 'doctor_loan',
    code: 'DOCTOR',
    name: 'Doctor Loan',
    slug: 'doctor-loan',
    category: 'PROFESSIONAL',
    targetAudience: ['Doctors', 'Medical Practitioners', 'Clinic Owners', 'Hospital Directors', 'Chartered Accountants'],
    topics: [
      'Clinic & medical centre expansion',
      'Advanced medical equipment financing',
      'New practice setup & renovation',
      'Working capital for healthcare setups',
      'Collateral-free professional limits',
      'Income documentation & practice vintage',
      'Fast-track verification with medical registration certificate'
    ],
    ctas: [
      'Check Special Limit',
      'Speak to Expert',
      'Schedule Doctor Consultation',
      'Get Practice Loan Details'
    ],
    primaryCompliantDisclaimer: 'Professional loan offers are customized for qualified medical and chartered professionals based on institutional lender criteria.'
  },

  home_loan: {
    id: 'home_loan',
    code: 'HOME',
    name: 'Home Loan',
    slug: 'home-loan',
    category: 'RETAIL_SECURED',
    targetAudience: ['Property Buyers', 'Salaried Professionals', 'Business Owners', 'First-Time Home Buyers'],
    topics: [
      'Home purchase financing',
      'Eligibility & down payment planning',
      'EMI calculation across 10 to 30-year tenures',
      'Income verification & joint applicant benefits',
      'Existing financial obligations management',
      'Property legal search & title documentation',
      'Plot purchase & home construction finance',
      'Balance transfer & top-up possibilities'
    ],
    ctas: [
      'Check Home Loan Rates',
      'Calculate Home EMI',
      'Check Eligibility',
      'Book Free Home Advisory'
    ],
    primaryCompliantDisclaimer: 'Home loan approvals and loan-to-value ratios are subject to lender credit evaluation and property legal verification.'
  },

  mortgage_loan: {
    id: 'mortgage_loan',
    code: 'MORTGAGE',
    name: 'Mortgage Loan / Loan Against Property',
    slug: 'mortgage-loan',
    category: 'COMMERCIAL_SECURED',
    targetAudience: ['Property Owners', 'Business Owners', 'Self-Employed Individuals', 'Commercial Landlords'],
    topics: [
      'Loan Against Residential Property (LAP)',
      'Loan Against Commercial Property',
      'Long-tenure business funding',
      'Working capital unlock from real estate',
      'Property valuation & title documentation',
      'Lower interest rates compared to unsecured loans',
      'Existing debt consolidation'
    ],
    ctas: [
      'Check Borrowing Power',
      'Mortgage LAP Options',
      'Consult Property Finance Expert',
      'Check Property Loan Eligibility'
    ],
    primaryCompliantDisclaimer: 'Loan Against Property is subject to clear legal title, property market valuation, and bank credit underwriting.'
  },

  education_loan_india: {
    id: 'education_loan_india',
    code: 'EDU-INDIA',
    name: 'Education Loan — India',
    slug: 'education-loan-india',
    category: 'EDUCATION',
    targetAudience: ['Students', 'Parents', 'Higher Education Applicants', 'Working Professionals Upskilling'],
    topics: [
      'College & university tuition fee financing',
      'Hostel, laptop & course materials expenses',
      'Co-applicant & parent income assessment',
      'Repayment moratorium during study period',
      'Top engineering, medical & management institutes in India',
      'Application checklist & fast-track pre-admission preparation'
    ],
    ctas: [
      'Talk to an Education Loan Advisor',
      'Study in India Info',
      'Check Student Eligibility',
      'Request Education Loan Guidance'
    ],
    primaryCompliantDisclaimer: 'Education loan sanction and co-applicant norms depend on accredited institution status and lender student finance policies.'
  },

  education_loan_global: {
    id: 'education_loan_global',
    code: 'EDU-GLOBAL',
    name: 'Education Loan — Global Studies',
    slug: 'education-loan-global',
    category: 'EDUCATION',
    targetAudience: ['Students Planning Overseas Education', 'Parents Seeking Global Education Funding'],
    topics: [
      'Overseas university tuition & campus accommodation',
      'Living expenses & international health insurance',
      'Visa-compliant financial sanction letters',
      'Collateral and non-collateral loan pathways',
      'Co-applicant requirements for foreign studies',
      'Forex disbursement & global education planning'
    ],
    ctas: [
      'Global Education Info',
      'Study Abroad Consultation',
      'Check Overseas Eligibility',
      'Connect with Global Study Advisor'
    ],
    primaryCompliantDisclaimer: 'Global education loan sanctions do not guarantee university admission or visa issuance; approvals are subject to lender assessment.'
  },

  school_funding: {
    id: 'school_funding',
    code: 'SCHOOL',
    name: 'School Funding',
    slug: 'school-funding',
    category: 'INSTITUTIONAL',
    targetAudience: ['School Owners', 'Educational Trusts', 'School Management Committees', 'Private K-12 Operators'],
    topics: [
      'School campus infrastructure & expansion',
      'Smart classroom setups & digital lab equipment',
      'Building renovation & sports complex development',
      'Working capital & institutional operational cash flow',
      'Trust & society financial structuring',
      'B2B long-tenure institutional project financing'
    ],
    ctas: [
      'Talk to Institutional Expert',
      'Request School Funding Brochure',
      'Schedule Trustee Consultation',
      'Explore Campus Project Finance'
    ],
    primaryCompliantDisclaimer: 'Institutional project funding terms depend on society registration, trust bylaws, student strength, and institutional financial audit.'
  },

  college_funding: {
    id: 'college_funding',
    code: 'COLLEGE',
    name: 'College Funding',
    slug: 'college-funding',
    category: 'INSTITUTIONAL',
    targetAudience: ['College Management', 'University Trustees', 'Higher Education Groups', 'Polytechnic Directors'],
    topics: [
      'Campus expansion & new college building construction',
      'Advanced laboratory, medical or engineering equipment',
      'Hostel block construction & campus modernising',
      'Working capital for staff & faculty development',
      'NAAC/AICTE accreditation facility upgrades',
      'Long-term structured institutional finance'
    ],
    ctas: [
      'Schedule Consultation with Sachin Shinde',
      'Request College Project Finance Details',
      'Institutional Division Callback',
      'Discuss Campus Expansion Loan'
    ],
    primaryCompliantDisclaimer: 'College and institutional funding is subject to regulatory recognition, balance sheet strength, and bank underwriting approval.'
  },

  cibil_consultation: {
    id: 'cibil_consultation',
    code: 'CIBIL',
    name: 'CIBIL Improvement Consultation',
    slug: 'cibil-consultation',
    category: 'ADVISORY',
    targetAudience: ['Applicants with Credit Concerns', 'Existing Borrowers', 'Individuals Planning Future Loans'],
    topics: [
      'Understanding CIBIL score & credit report components',
      'Credit report review & error dispute guidance',
      'Credit utilization ratio optimization',
      'Timely payment history & overdue loan resolution',
      'Existing loan obligation restructuring advice',
      'Healthy credit habits for long-term loan eligibility'
    ],
    ctas: [
      'Get Free Credit Review Guidance',
      'Understand Your Credit Profile',
      'Book Credit Consultation',
      'Review Your CIBIL Report'
    ],
    primaryCompliantDisclaimer: 'Avani Loan Services provides credit education and report review guidance. Credit scores are computed solely by credit bureaus.'
  }
});

const ALL_PRODUCT_KEYS = Object.keys(PRODUCTS_CATALOG);

function getProduct(productId) {
  return PRODUCTS_CATALOG[productId] || null;
}

module.exports = {
  PRODUCTS_CATALOG,
  ALL_PRODUCT_KEYS,
  getProduct
};
