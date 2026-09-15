// src/services/imageAssetEngine.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — 100 Visual Image Concepts & Asset Generator
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG, ALL_PRODUCT_KEYS } = require('../config/productsCatalog.cjs');

const FORMAT_SPECS = Object.freeze({
  SQUARE: { width: 1080, height: 1080, ratio: '1:1', channel: 'Instagram / Facebook Feed' },
  PORTRAIT: { width: 1080, height: 1350, ratio: '4:5', channel: 'Instagram Feed / LinkedIn' },
  STORY: { width: 1080, height: 1920, ratio: '9:16', channel: 'WhatsApp Status / Instagram Story' },
  LANDSCAPE: { width: 1200, height: 628, ratio: '1.91:1', channel: 'Facebook Ad / Website Banner' }
});

const BRAND_THEME = Object.freeze({
  primaryColor: '#0A192F',    // Navy Blue
  accentColor: '#38BDF8',     // Light Blue
  backgroundColor: '#F8FAFC', // Crisp Off-White
  fontFamily: 'Inter, system-ui, sans-serif',
  logoPlacement: 'Top-Right / Top-Left',
  contactPlacement: 'Bottom Banner: +91 91756 35165 | avanifinserv.com'
});

// 10 Visual Concepts per product (10 × 10 = 100 concepts)
const PRODUCT_IMAGE_CONCEPTS = {
  personal_loan: [
    {
      conceptId: 'C01',
      title: 'Salary & FOIR Eligibility',
      headline: 'Know Your Personal Loan Limit Before Applying',
      supportingText: 'Clear FOIR calculation across leading banks. Zero multiple credit hits.',
      cta: 'Check Eligibility',
      scene: 'Indian salaried corporate employee in modern office reviewing financial planning report calmly.',
      composition: 'Subject on left third, clean off-white negative space on right for bold headline.'
    },
    {
      conceptId: 'C02',
      title: 'Debt Consolidation',
      headline: 'Consolidate High-Cost Credit Cards Into One Simple EMI',
      supportingText: 'Switch from 36%+ revolving card dues to structured low-interest personal loans.',
      cta: 'Consolidate Debt',
      scene: 'Professional organizing credit card statements into a neat single repayment binder.',
      composition: 'Top-down desk shot with calculator, clean notebook, and Avani advisory checklist.'
    },
    {
      conceptId: 'C03',
      title: 'Emergency Medical Funding',
      headline: 'Fast-Track Medical & Emergency Personal Loans',
      supportingText: 'Swift document verification with multi-lender processing for peace of mind.',
      cta: 'Talk to Advisor',
      scene: 'Caring family standing together relieved outside a modern healthcare center.',
      composition: 'Warm, empathetic lighting, clean branding overlay at bottom.'
    },
    {
      conceptId: 'C04',
      title: 'Home Renovation Finance',
      headline: 'Upgrade Your Home Interiors Without Liquidity Stress',
      supportingText: 'Affordable renovation loans tailored for salaried & professional homeowners.',
      cta: 'Plan Your Renovation',
      scene: 'Young couple smiling while reviewing interior renovation blueprints in living room.',
      composition: 'Bright natural lighting, modern living space background.'
    },
    {
      conceptId: 'C05',
      title: 'Wedding & Milestone Expenses',
      headline: 'Celebrate Life Milestones With Transparent Financing',
      supportingText: 'Fixed monthly repayments with flexible tenures from 12 to 60 months.',
      cta: 'Calculate EMI',
      scene: 'Traditional festive Indian wedding invitation cards on clean modern wooden table.',
      composition: 'Festive yet elegant corporate aesthetic with navy blue contrast.'
    },
    {
      conceptId: 'C06',
      title: 'CIBIL Score Optimization',
      headline: '750+ CIBIL Score? Unlock Lower Interest Slabs',
      supportingText: 'Discover which lenders offer preferred rates for strong credit profiles.',
      cta: 'Review Credit Profile',
      scene: 'Advisor explaining credit report breakdown on tablet to attentive salaried client.',
      composition: 'Professional consultation setup in Latur office.'
    },
    {
      conceptId: 'C07',
      title: 'Zero Hidden Charges',
      headline: '100% Transparent Advisory & Comparison',
      supportingText: 'Clear comparison of processing fees, foreclosure terms, and annual percentage rate.',
      cta: 'Get Transparent Advice',
      scene: 'Transparent glass office desk with neatly arranged comparison chart and pen.',
      composition: 'Minimal, uncluttered, emphasizing clarity and trust.'
    },
    {
      conceptId: 'C08',
      title: 'Fast Documentation Packaging',
      headline: 'Just 4 Documents Needed for Fast-Track Review',
      supportingText: 'PAN, Aadhaar, 3 months payslips, and 6 months bank statement.',
      cta: 'Send Documents',
      scene: 'Neatly organized verification document folders on laptop with digital checkmarks.',
      composition: 'Organized corporate workflow illustration.'
    },
    {
      conceptId: 'C09',
      title: 'Multi-Bank Comparison',
      headline: 'Why Settle for One Bank? We Compare Multiple Lenders',
      supportingText: 'Avani Loan Services matches your specific salary bracket to the right institution.',
      cta: 'Compare Bank Rates',
      scene: 'Visual comparison chart showing multiple bank options with checkmarks.',
      composition: 'Structured graphic layout with clear visual hierarchy.'
    },
    {
      conceptId: 'C10',
      title: 'Local Latur Advisory',
      headline: 'Your Trusted Financial Advisory in Latur',
      supportingText: 'Personal guidance by Sachin Shinde at Kulswamini Nagar, Old Barshi Road.',
      cta: 'Visit Our Office',
      scene: 'Exterior and interior view of welcoming Avani Loan Services office in Latur.',
      composition: 'Local, approachable, credible commercial establishment.'
    }
  ],

  business_loan: [
    {
      conceptId: 'C01',
      title: 'Working Capital Smoothness',
      headline: 'Fuel Your Business Growth With Working Capital',
      supportingText: 'Keep inventory stocked and vendor payments prompt without cash-flow friction.',
      cta: 'Check Business Limit',
      scene: 'Indian MSME factory owner reviewing inventory with digital tablet in clean warehouse.',
      composition: 'Medium shot of business owner, machinery softly blurred in background.'
    },
    {
      conceptId: 'C02',
      title: 'Collateral-Free MSME Limits',
      headline: 'Unsecured Business Loans up to ₹2 Crores',
      supportingText: 'Based on clean GST turnover and banking credits. No property mortgage required.',
      cta: 'Apply for Limit',
      scene: 'Entrepreneur shaking hands with business loan advisor over formal agreement.',
      composition: 'Warm corporate lighting, crisp business attire, solid brand frame.'
    },
    {
      conceptId: 'C03',
      title: 'Machinery & Equipment Expansion',
      headline: 'Upgrade Machinery & Technology Without Capital Drain',
      supportingText: 'Term loans designed for equipment purchase and manufacturing capacity boost.',
      cta: 'Finance Machinery',
      scene: 'Precision industrial machine operating in clean modern workshop with safety gear.',
      composition: 'Industrial progress aesthetic with professional navy blue accents.'
    },
    {
      conceptId: 'C04',
      title: 'GST & Turnover Based Underwriting',
      headline: 'Turn Your GST Filings Into Borrowing Power',
      supportingText: 'We evaluate your annual turnover and average quarterly balances for maximum limit.',
      cta: 'Evaluate Turnover',
      scene: 'Accountant reviewing GST returns on dual monitors with financial charts.',
      composition: 'Analytical office scene, clean digital interface.'
    },
    {
      conceptId: 'C05',
      title: 'Seasonal Inventory Purchase',
      headline: 'Stock Up Before Festive & Harvest Demand Peaks',
      supportingText: 'Short-tenure working capital lines for traders, wholesalers, and distributors.',
      cta: 'Stock Up Now',
      scene: 'Organized wholesale trading showroom with neatly stacked packaging.',
      composition: 'Thriving trade environment, bright commercial illumination.'
    },
    {
      conceptId: 'C06',
      title: 'Business Vintage Advantage',
      headline: '2+ Years in Business? Unlock Premier Lending Brackets',
      supportingText: 'Established enterprises qualify for preferential interest rates and longer tenures.',
      cta: 'Check Vintage Benefits',
      scene: 'Proud business owner standing in front of established retail or manufacturing unit.',
      composition: 'Confident, established, respectable Indian entrepreneur.'
    },
    {
      conceptId: 'C07',
      title: 'High Banking Turnover Assessment',
      headline: 'Clean Banking Habits Deserve Lower Interest Rates',
      supportingText: 'Zero cheque bounces and healthy monthly credits unlock prime lender offers.',
      cta: 'Assess Banking History',
      scene: 'Bank passbook and statement summary showing consistent healthy credit flows.',
      composition: 'Financial credibility visual with clear graphic badges.'
    },
    {
      conceptId: 'C08',
      title: 'Multi-Branch / Outlet Expansion',
      headline: 'Opening a New Branch? Secure Expansion Capital',
      supportingText: 'Structured funding to lease prime retail space and build customer interiors.',
      cta: 'Plan Branch Expansion',
      scene: 'Architectural render of new retail store being discussed with financial consultant.',
      composition: 'Modern retail expansion blueprint on meeting table.'
    },
    {
      conceptId: 'C09',
      title: 'Fast-Track Credit Appraisal',
      headline: 'Swift Appraisal With Complete Financial Packaging',
      supportingText: 'We audit your Balance Sheet and ITR to present a bankable credit proposal.',
      cta: 'Package Financials',
      scene: 'Financial audit report being verified with green checkmarks.',
      composition: 'Audit excellence visual with trustworthy corporate palette.'
    },
    {
      conceptId: 'C10',
      title: 'Local Enterprise Support',
      headline: 'Empowering Latur & Marathwada Enterprises',
      supportingText: 'Dedicated local guidance from Sachin Shinde at Avani Loan Services.',
      cta: 'Connect with Sachin Shinde',
      scene: 'Sachin Shinde consulting local enterprise leader in Latur advisory chamber.',
      composition: 'Authentic regional business relationship.'
    }
  ],

  doctor_loan: [
    {
      conceptId: 'C01',
      title: 'Medical Equipment Finance',
      headline: 'Equip Your Clinic With Modern Diagnostic Technology',
      supportingText: 'Collateral-free financing for ultrasound, laser, and clinical diagnostic setups.',
      cta: 'Finance Equipment',
      scene: 'Doctor in clinical coat examining state-of-the-art ultrasound monitor.',
      composition: 'Pristine medical clinic interior, clean blue and white tones.'
    },
    {
      conceptId: 'C02',
      title: 'Clinic Expansion & Renovation',
      headline: 'Expand Your Patient Care Facility & OPD Rooms',
      supportingText: 'Flexible loans for clinic interior renovation and modern waiting lounges.',
      cta: 'Expand Clinic',
      scene: 'Welcoming modern clinic reception and doctor consultation cabin.',
      composition: 'Spacious, hygienic, professional medical ambiance.'
    },
    {
      conceptId: 'C03',
      title: 'Special Professional Limits',
      headline: 'Dedicated Loan Limits for MBBS, MD, BAMS & BHMS',
      supportingText: 'Fast-track verification using Medical Registration Certificate (IMC/MMC).',
      cta: 'Check Doctor Limit',
      scene: 'Stethoscope resting on medical prescription pad with doctor registration certificate.',
      composition: 'Authoritative, dignified medical iconography.'
    },
    {
      conceptId: 'C04',
      title: 'Hospital Setup & ICU Beds',
      headline: 'Scale From Clinic to Multi-Speciality Nursing Home',
      supportingText: 'Structured project finance for hospital building and ICU infrastructure.',
      cta: 'Consult Hospital Desk',
      scene: 'Modern private hospital corridor with attentive medical staff.',
      composition: 'Advanced healthcare facility perspective.'
    },
    {
      conceptId: 'C05',
      title: 'Working Capital for Pharmacies',
      headline: 'Maintain Uninterrupted Medicine & Vaccine Inventory',
      supportingText: 'Cash-flow lines tailored for hospital pharmacies and medical stores.',
      cta: 'Smooth Cash Flow',
      scene: 'Pharmacist in clean medical store organizing temperature-controlled medicines.',
      composition: 'Organized pharmaceutical care visual.'
    },
    {
      conceptId: 'C06',
      title: 'Chartered Accountant Loan Facility',
      headline: 'Professional Loans for CAs & Audit Practices',
      supportingText: 'Customized limits based on Certificate of Practice (COP) and client base.',
      cta: 'Check CA Limit',
      scene: 'Chartered accountant reviewing tax audit report in refined wood-panelled office.',
      composition: 'Classic professional advisory setting.'
    },
    {
      conceptId: 'C07',
      title: 'Collateral-Free Confidence',
      headline: 'High-Ticket Professional Lending Without Property Collateral',
      supportingText: 'Lenders evaluate medical qualification vintage and patient footfall.',
      cta: 'Request Professional Quote',
      scene: 'Senior doctor smiling warmly in consultation room holding pen.',
      composition: 'Approachable, authoritative healthcare professional.'
    },
    {
      conceptId: 'C08',
      title: 'Low EMI & Flexible Moratorium',
      headline: 'Moratorium Periods While Equipment Begins Generating Revenue',
      supportingText: 'Structured repayment schedules that match clinical cash-flow cycles.',
      cta: 'Explore Repayment Terms',
      scene: 'Financial schedule displaying clean monthly milestones on clinic computer.',
      composition: 'Orderly financial planning for healthcare practitioners.'
    },
    {
      conceptId: 'C09',
      title: 'Fast Doorstep Verification',
      headline: 'Doorstep Documentation Assistance for Busy Doctors',
      supportingText: 'Our team visits your clinic at a time that suits your OPD schedule.',
      cta: 'Book Doorstep Service',
      scene: 'Avani advisor meeting doctor discreetly between clinical appointments.',
      composition: 'Respectful, professional, time-saving client service.'
    },
    {
      conceptId: 'C10',
      title: 'Healthcare Partner in Latur',
      headline: 'Trusted by Doctors Across Latur & Surrounding Districts',
      supportingText: 'Dedicated professional desk by Sachin Shinde at Avani Loan Services.',
      cta: 'Connect with Sachin Shinde',
      scene: 'Doctor shaking hands with Sachin Shinde in front of clinic entrance.',
      composition: 'Strong community trust and verified local relationships.'
    }
  ],

  home_loan: [
    {
      conceptId: 'C01',
      title: 'Dream Home Purchase',
      headline: 'Step Into Your Dream Home With Confidence',
      supportingText: 'Compare Home Loan interest rates and processing terms across top banks.',
      cta: 'Check Home Loan Rates',
      scene: 'Indian family smiling happily standing before their new independent home.',
      composition: 'Warm daylight, vibrant home exterior, clear navy overlay.'
    },
    {
      conceptId: 'C02',
      title: 'Pre-Approval Confidence',
      headline: 'Get Pre-Approved Before You Shortlist Property',
      supportingText: 'Know your exact borrowing budget and negotiate better prices with developers.',
      cta: 'Get Pre-Approved',
      scene: 'Homebuyer holding pre-sanction letter while reviewing apartment floor plans.',
      composition: 'Empowered consumer reviewing real estate options.'
    },
    {
      conceptId: 'C03',
      title: 'Plot Purchase + Construction',
      headline: 'Plot Loan + Home Construction Composite Finance',
      supportingText: 'Build your custom bungalow with stage-wise construction disbursements.',
      cta: 'Finance Construction',
      scene: 'Architectural sketch of bungalow overlaid on neat green residential plot.',
      composition: 'Visionary residential construction visual.'
    },
    {
      conceptId: 'C04',
      title: 'Balance Transfer & Top-Up',
      headline: 'Paying High Home Loan EMI? Switch & Reduce Interest',
      supportingText: 'Balance transfer to lower interest brackets with additional top-up funds.',
      cta: 'Calculate Savings',
      scene: 'Homeowner calculating interest savings on home loan statement.',
      composition: 'Financial optimization desk scene.'
    },
    {
      conceptId: 'C05',
      title: 'Rural & Semi-Urban Verification',
      headline: 'Home Loans for Gram Panchayat & Municipal Properties',
      supportingText: 'Navigating 7/12 extracts, Form 8, and municipal sanction permissions in Maharashtra.',
      cta: 'Verify Property Papers',
      scene: 'Legal documents, 7/12 extract, and official municipal plan with ruler and glasses.',
      composition: 'Authentic property paperwork review in Maharashtra.'
    },
    {
      conceptId: 'C06',
      title: 'Joint Applicant Benefits',
      headline: 'Add a Co-Applicant to Boost Your Loan Eligibility',
      supportingText: 'Combine spouse or parent income for a higher sanction amount and tax benefits.',
      cta: 'Explore Joint Eligibility',
      scene: 'Working couple sitting together reviewing joint home loan calculation.',
      composition: 'Partnership, mutual aspiration, clean modern decor.'
    },
    {
      conceptId: 'C07',
      title: 'Long Tenures up to 30 Years',
      headline: 'Affordable Monthly EMIs With Tenures up to 30 Years',
      supportingText: 'Align your repayment horizon with your working career for stress-free living.',
      cta: 'Calculate 30-Year EMI',
      scene: 'Calendar schedule transitioning through decades, small manageable EMI graph.',
      composition: 'Peace of mind visual metaphor.'
    },
    {
      conceptId: 'C08',
      title: 'Section 80C & 24(b) Tax Deductions',
      headline: 'Maximize Income Tax Deductions With Home Loans',
      supportingText: 'Save tax on principal repayment (80C) and home loan interest (24b) annually.',
      cta: 'Understand Tax Savings',
      scene: 'Tax calculation sheet showing clear savings breakdown next to home keys.',
      composition: 'Prudent financial planning iconography.'
    },
    {
      conceptId: 'C09',
      title: 'Legal Search & Title Scrutiny',
      headline: 'Independent Title & Legal Verification Guidance',
      supportingText: 'Ensure your builder title is 100% clear and encumbrance-free before signing.',
      cta: 'Get Legal Guidance',
      scene: 'Legal advocate reviewing title deeds with magnifying glass and official seal.',
      composition: 'Thorough legal integrity visual.'
    },
    {
      conceptId: 'C10',
      title: 'Latur Home Loan Specialists',
      headline: 'Latur’s Premier Home Loan Advisory Desk',
      supportingText: 'Guiding home buyers across Latur city and district with total transparency.',
      cta: 'Visit Avani Loan Services',
      scene: 'Sachin Shinde handing keys and approved file to delighted home buyer in Latur.',
      composition: 'Joy of homeownership supported by local expertise.'
    }
  ],

  mortgage_loan: [
    {
      conceptId: 'C01',
      title: 'Unlock Property Value',
      headline: 'Unlock Large-Ticket Liquidity From Your Freehold Property',
      supportingText: 'Mortgage Loan / LAP provides long-tenure capital at lower interest rates than unsecured debt.',
      cta: 'Check Property Value',
      scene: 'Commercial showroom owner standing proudly before his owned commercial property.',
      composition: 'Substantial commercial asset visual.'
    },
    {
      conceptId: 'C02',
      title: 'Residential Property LAP',
      headline: 'Leverage Your Residential Bungalow or Flat for Business Funds',
      supportingText: 'Retain 100% ownership and occupancy while accessing structured term finance.',
      cta: 'Explore Residential LAP',
      scene: 'Premium residential villa with clean boundary wall and front garden.',
      composition: 'High-value real estate asset visual.'
    },
    {
      conceptId: 'C03',
      title: 'Commercial Property LAP',
      headline: 'Mortgage Loan Against Commercial Shops, Offices & Warehouses',
      supportingText: 'Capitalize on rental yields and commercial valuation for business expansion.',
      cta: 'Check Commercial Limit',
      scene: 'Multi-storey commercial shopping complex in vibrant city center.',
      composition: 'Prime commercial investment aesthetic.'
    },
    {
      conceptId: 'C04',
      title: 'High-Cost Debt Consolidation',
      headline: 'Consolidate Multiple Costly Loans Into One Low-Interest LAP',
      supportingText: 'Cut your combined monthly outflow dramatically with tenures up to 15 years.',
      cta: 'Restructure Debt',
      scene: 'Financial balance scale tipping in favor of single consolidated monthly payment.',
      composition: 'Clarity and debt-relief concept.'
    },
    {
      conceptId: 'C05',
      title: 'Flexible Overdraft / Dropline Facility',
      headline: 'LAP Overdraft: Pay Interest Only on Amount Utilized',
      supportingText: 'Ideal for traders and manufacturers with fluctuating working capital needs.',
      cta: 'Explore LAP Overdraft',
      scene: 'Bank limit statement showing flexible drawdowns and interest savings.',
      composition: 'Modern cash-management graphic.'
    },
    {
      conceptId: 'C06',
      title: 'Industrial Property Financing',
      headline: 'Loan Against MIDC & Industrial Shed Land',
      supportingText: 'Structured funding for factory owners with clear industrial leasehold/freehold rights.',
      cta: 'Finance Industrial Plot',
      scene: 'Spacious industrial shed in organized MIDC industrial zone.',
      composition: 'Productive manufacturing ecosystem.'
    },
    {
      conceptId: 'C07',
      title: 'Fair Market Valuation',
      headline: 'Transparent Property Valuation Across Authorized Evaluators',
      supportingText: 'We coordinate with premier bank-empanelled evaluators for realistic LTV limits.',
      cta: 'Check LTV Slabs',
      scene: 'Civil engineer and bank valuer inspecting building dimensions with measuring tape.',
      composition: 'Accurate technical assessment.'
    },
    {
      conceptId: 'C08',
      title: 'Clean Title Scrutiny',
      headline: 'Thorough Legal Search to Ensure Hassle-Free Sanction',
      supportingText: 'Pre-check non-agricultural (NA) orders, sanctioned plans, and search reports.',
      cta: 'Check Legal Checklist',
      scene: 'Official NA order and municipal blueprint documents on desk.',
      composition: 'Document compliance excellence.'
    },
    {
      conceptId: 'C09',
      title: 'Long Tenures up to 15 Years',
      headline: '15-Year Repayment Horizon for Comfortable Cash Flow',
      supportingText: 'Spread large investments over 180 manageable monthly installments.',
      cta: 'Calculate LAP EMI',
      scene: 'Comfortable business discussion between advisor and commercial landlord.',
      composition: 'Professional, calm, long-term stability.'
    },
    {
      conceptId: 'C10',
      title: 'Sachin Shinde Mortgage Advisory',
      headline: 'Marathwada’s Trusted Mortgage Advisory Desk',
      supportingText: 'Over a decade of trusted financial advisory at Avani Loan Services, Latur.',
      cta: 'Consult Sachin Shinde',
      scene: 'Sachin Shinde reviewing property mortgage file in his private advisory chamber.',
      composition: 'Authoritative, trusted, experienced local leadership.'
    }
  ],

  education_loan_india: [
    {
      conceptId: 'C01',
      title: 'Premier Institute Funding',
      headline: 'Fund Higher Education in India’s Top Universities',
      supportingText: 'IITs, IIMs, AIIMS, NITs, and premier accredited colleges across India.',
      cta: 'Check College Slabs',
      scene: 'Confident Indian student holding engineering / management degree on campus.',
      composition: 'Inspiring educational aspiration.'
    },
    {
      conceptId: 'C02',
      title: '100% Comprehensive Expense Cover',
      headline: 'Covers Tuition, Hostel, Laptop & Books',
      supportingText: 'Zero out-of-pocket stress for parents. Comprehensive academic coverage.',
      cta: 'Explore Expense Cover',
      scene: 'Laptop, academic textbooks, campus hostel room key, and calculator.',
      composition: 'All-inclusive student needs layout.'
    },
    {
      conceptId: 'C03',
      title: 'Moratorium Period Benefits',
      headline: 'Repayment Starts Only After Course Completion',
      supportingText: 'Study stress-free with course duration + up to 12 months moratorium.',
      cta: 'Understand Moratorium',
      scene: 'Student studying peacefully in library knowing repayment starts after job placement.',
      composition: 'Calm, focused academic setting.'
    },
    {
      conceptId: 'C04',
      title: 'Section 80E Tax Deduction',
      headline: '100% Tax Exemption on Education Loan Interest',
      supportingText: 'Claim complete interest deductions under Section 80E for up to 8 continuous years.',
      cta: 'Check Tax Savings',
      scene: 'Parent reviewing 80E deduction with tax advisor beside smiling student.',
      composition: 'Smart family financial planning.'
    },
    {
      conceptId: 'C05',
      title: 'Non-Collateral Student Limits',
      headline: 'Collateral-Free Education Loans for Select Premier Institutes',
      supportingText: 'Merit-based underwriting based on entrance exam scores and college ranking.',
      cta: 'Check Merit Benefits',
      scene: 'Entrance scorecard with percentile and college offer letter.',
      composition: 'Merit recognition graphic.'
    },
    {
      conceptId: 'C06',
      title: 'Medical & Dental Education',
      headline: 'Finance MBBS, MD, BDS & Allied Health Sciences',
      supportingText: 'Dedicated loan structures for high-tuition medical college admissions.',
      cta: 'Finance Medical Degree',
      scene: 'Medical student in lab coat holding stethoscope in college anatomy lab.',
      composition: 'Professional medical education visual.'
    },
    {
      conceptId: 'C07',
      title: 'Engineering & Technology',
      headline: 'Fund B.Tech, M.Tech & Data Science Certifications',
      supportingText: 'Flexible disbursements aligned with semester-wise university fee schedules.',
      cta: 'Plan Semester Fees',
      scene: 'Engineering student coding on laptop in campus innovation lab.',
      composition: 'Modern tech innovation aesthetic.'
    },
    {
      conceptId: 'C08',
      title: 'MBA & Business Schools',
      headline: 'Invest in Your Career With a Top-Tier MBA Loan',
      supportingText: 'Fast-track pre-approval based on CAT / CMAT / XAT scores.',
      cta: 'Apply for MBA Loan',
      scene: 'Management student presenting case study in corporate amphitheatre.',
      composition: 'Executive leadership education.'
    },
    {
      conceptId: 'C09',
      title: 'Simple Co-Applicant Norms',
      headline: 'Father, Mother, or Brother as Supportive Co-Applicant',
      supportingText: 'Simple income verification based on family ITR or salary slips.',
      cta: 'Check Co-Applicant Norms',
      scene: 'Parent and child signing admission form happily together.',
      composition: 'Supportive family milestone.'
    },
    {
      conceptId: 'C10',
      title: 'Latur Student Education Desk',
      headline: 'Empowering Latur Students to Achieve Their Dreams',
      supportingText: 'Dedicated educational loan counselling at Avani Loan Services, Latur.',
      cta: 'Talk to Education Advisor',
      scene: 'Sachin Shinde guiding student and parent at the Latur advisory desk.',
      composition: 'Nurturing community guidance.'
    }
  ],

  education_loan_global: [
    {
      conceptId: 'C01',
      title: 'Study Abroad Finance',
      headline: 'Fly to USA, UK, Canada, Germany & Australia',
      supportingText: 'Comprehensive Global Education Loans covering tuition and overseas living expenses.',
      cta: 'Plan Global Study',
      scene: 'Student holding passport, university admit letter, and luggage in airport terminal.',
      composition: 'Global journey begins visual.'
    },
    {
      conceptId: 'C02',
      title: 'Pre-Visa Sanction Letters',
      headline: 'Official Financial Sanction Letter for Student Visa (I-20 / CAS)',
      supportingText: 'Meets 100% embassy proof-of-funds criteria for hassle-free visa stamping.',
      cta: 'Request Sanction Letter',
      scene: 'Official university I-20 form and bank sanction letter with embassy stamp icon.',
      composition: 'Immigration document compliance.'
    },
    {
      conceptId: 'C03',
      title: 'Non-Collateral Foreign Limits',
      headline: 'Unsecured Global Education Loans up to ₹75 Lakhs',
      supportingText: 'Available for STEM and top-tier global university master’s programs.',
      cta: 'Check Unsecured Limits',
      scene: 'Student in winter coat on historic European / American university campus.',
      composition: 'Prestigious global academia.'
    },
    {
      conceptId: 'C04',
      title: 'Living Expenses & Forex Cards',
      headline: 'Covers Overseas Rent, Health Insurance & Living Costs',
      supportingText: 'Direct remittance to foreign university accounts plus student international card limits.',
      cta: 'Calculate Living Costs',
      scene: 'Student checking living expense budget on phone in international student residence.',
      composition: 'Comfortable international lifestyle.'
    },
    {
      conceptId: 'C05',
      title: 'STEM Masters & Tech Programs',
      headline: 'Specialized Financing for MS in Computer Science & AI',
      supportingText: 'High future earning potential recognized by international lending partners.',
      cta: 'Finance STEM Master',
      scene: 'Student working with advanced robotics equipment in overseas university lab.',
      composition: 'Cutting-edge technology research.'
    },
    {
      conceptId: 'C06',
      title: 'Germany Public University Funding',
      headline: 'Blocked Account (Sperrkonto) Financing for Germany',
      supportingText: 'Fast funding to fulfill German visa living deposit requirements.',
      cta: 'Finance Germany Studies',
      scene: 'Student cycling past Brandenburg Gate in Berlin holding university folder.',
      composition: 'European academic adventure.'
    },
    {
      conceptId: 'C07',
      title: 'Competitive Forex Remittance',
      headline: 'Seamless University Fee Remittance in USD, GBP, EUR & AUD',
      supportingText: 'Transparent currency exchange rates with zero hidden transaction markups.',
      cta: 'Check Forex Options',
      scene: 'Clean digital remittance dashboard showing multi-currency transfer confirmation.',
      composition: 'Global fintech transparency.'
    },
    {
      conceptId: 'C08',
      title: 'Flexible Co-Applicant Options',
      headline: 'Co-Signer Flexibility for International Higher Studies',
      supportingText: 'Salaried or business parents and immediate family members qualify as co-signers.',
      cta: 'Check Co-Signer Rules',
      scene: 'Family smiling proudly as student shows admission letter via video call.',
      composition: 'Emotional international connection.'
    },
    {
      conceptId: 'C09',
      title: 'End-to-End Application Guidance',
      headline: 'From University Offer to Visa Sanction: Complete Guidance',
      supportingText: 'Avoid last-minute financial rejections before university deadlines.',
      cta: 'Schedule Global Consultation',
      scene: 'Advisory timeline chart showing smooth step-by-step milestones.',
      composition: 'Structured milestone roadmap.'
    },
    {
      conceptId: 'C10',
      title: 'Sachin Shinde Overseas Desk',
      headline: 'Latur’s Trusted Pathway to World-Class Education',
      supportingText: 'Guiding Marathwada students to top universities worldwide.',
      cta: 'Connect with Sachin Shinde',
      scene: 'World map background with Sachin Shinde mentoring ambitious student in office.',
      composition: 'Global aspiration rooted in trusted local leadership.'
    }
  ],

  school_funding: [
    {
      conceptId: 'C01',
      title: 'Smart Classroom Infrastructure',
      headline: 'Upgrade Your School With Smart Digital Classrooms',
      supportingText: 'Institutional project funding for K-12 trusts, private schools, and academies.',
      cta: 'Finance Classrooms',
      scene: 'Vibrant smart classroom with interactive digital board and engaged school children.',
      composition: 'Modern school pedagogy visual.'
    },
    {
      conceptId: 'C02',
      title: 'Campus Building & Expansion',
      headline: 'Build New Academic Wings & Sports Complexes',
      supportingText: 'Long-term structured project loans tailored to educational trust cash flows.',
      cta: 'Expand Campus',
      scene: 'Architectural rendering of modern new school building wing.',
      composition: 'Expansive academic campus vision.'
    },
    {
      conceptId: 'C03',
      title: 'Science & Robotics Labs',
      headline: 'Equip Advanced STEM & Atal Tinkering Labs',
      supportingText: 'Equip your school with top-grade physics, chemistry, and computer laboratories.',
      cta: 'Equip School Labs',
      scene: 'School children in uniforms conducting robotics experiment with instructor.',
      composition: 'Innovative school education.'
    },
    {
      conceptId: 'C04',
      title: 'Working Capital for School Operations',
      headline: 'Smooth School Cash Flow Aligned With Annual Fee Cycles',
      supportingText: 'Working capital lines to manage staff salaries and campus maintenance seamlessly.',
      cta: 'Smooth School Cash Flow',
      scene: 'School administrator and bursar reviewing institutional ledger in modern office.',
      composition: 'Prudent educational management.'
    },
    {
      conceptId: 'C05',
      title: 'School Bus & Transport Fleet',
      headline: 'Finance Safe School Buses & GPS Transport Fleets',
      supportingText: 'Expand school transport coverage to attract students from surrounding towns.',
      cta: 'Finance School Buses',
      scene: 'Yellow school bus parked safely in clean school driveway.',
      composition: 'Safe child transport.'
    },
    {
      conceptId: 'C06',
      title: 'CBSE / ICSE Affiliation Upgrades',
      headline: 'Infrastructure Upgrades for CBSE & ICSE Board Affiliation',
      supportingText: 'Fulfill library, sports ground, and safety infrastructure regulatory norms.',
      cta: 'Upgrade Affiliation Norms',
      scene: 'Modern school library with books and comfortable reading pods for children.',
      composition: 'Accreditation excellence.'
    },
    {
      conceptId: 'C07',
      title: 'Trust & Society Loan Structuring',
      headline: 'Specialized Financing for Educational Trusts & Societies',
      supportingText: 'Underwriting aligned with trust bylaws, society registrations, and student strength.',
      cta: 'Consult Trust Finance Desk',
      scene: 'School board trustees in formal meeting reviewing institutional expansion plan.',
      composition: 'Dignified institutional leadership.'
    },
    {
      conceptId: 'C08',
      title: 'Auditorium & Sports Complex',
      headline: 'Build Indoor Sports Complexes & Performing Auditoriums',
      supportingText: 'Create standout infrastructure that elevates your school reputation.',
      cta: 'Plan Sports Complex',
      scene: 'Clean modern school indoor badminton court / multipurpose sports hall.',
      composition: 'Healthy student athletic lifestyle.'
    },
    {
      conceptId: 'C09',
      title: 'Solar & Green Energy Campus',
      headline: 'Slash School Electricity Costs With Solar Rooftop Finance',
      supportingText: 'Eco-friendly green school transition with high cost-recovery savings.',
      cta: 'Go Solar',
      scene: 'Rooftop solar panels installed neatly on school building roof.',
      composition: 'Sustainable green school leadership.'
    },
    {
      conceptId: 'C10',
      title: 'Marathwada School Advisory',
      headline: 'Partnering With School Leaders Across Maharashtra',
      supportingText: 'Institutional financial advisory led by Sachin Shinde at Avani Loan Services.',
      cta: 'Schedule Trustee Meeting',
      scene: 'Sachin Shinde walking through school courtyard with senior school trustee.',
      composition: 'Respectful institutional partnership.'
    }
  ],

  college_funding: [
    {
      conceptId: 'C01',
      title: 'University Campus Expansion',
      headline: 'Multi-Crore Project Debt for University & College Campuses',
      supportingText: 'Construct modern academic blocks, administrative centers, and campus libraries.',
      cta: 'Plan Campus Project',
      scene: 'Majestic college campus building facade with students walking in sunlit pathways.',
      composition: 'Grand higher education perspective.'
    },
    {
      conceptId: 'C02',
      title: 'Hostel Blocks & Student Housing',
      headline: 'Build Modern Student Hostels With Escrowed Cash Flows',
      supportingText: 'Self-liquidating project loans backed by predictable annual hostel fee revenues.',
      cta: 'Finance Hostel Blocks',
      scene: 'Newly constructed multistory student residential hostel block.',
      composition: 'Modern student living infrastructure.'
    },
    {
      conceptId: 'C03',
      title: 'Medical & Engineering College Labs',
      headline: 'Equip Advanced Research Facilities & Engineering Workshops',
      supportingText: 'Large-ticket equipment loans for CNC machines, simulation centers, and hospital wards.',
      cta: 'Equip Higher Ed Labs',
      scene: 'Engineering college workshop with CNC machinery and industrial research tools.',
      composition: 'Advanced professional training.'
    },
    {
      conceptId: 'C04',
      title: 'NAAC / NBA Accreditation Upgrades',
      headline: 'Infrastructure Upgrades for A+ NAAC & NBA Accreditation',
      supportingText: 'Fulfill premier accreditation metrics to boost enrolment and NIRF ranking.',
      cta: 'Prepare Accreditation',
      scene: 'College council room with NAAC plaque and institutional master plan.',
      composition: 'Accredited quality benchmark.'
    },
    {
      conceptId: 'C05',
      title: 'Hospital Attachment for Medical Colleges',
      headline: 'Finance 300+ Bed Hospital Attachments for Medical Colleges',
      supportingText: 'Fulfill National Medical Commission (NMC) clinical bed capacity guidelines.',
      cta: 'Consult Medical College Desk',
      scene: 'Modern clinical hospital wing attached to medical university.',
      composition: 'Premier healthcare education infrastructure.'
    },
    {
      conceptId: 'C06',
      title: 'Consortium Debt Structuring',
      headline: 'Multi-Bank Consortium Debt for Mega Higher-Ed Projects',
      supportingText: 'We structure syndicated credit lines across leading public & private banks.',
      cta: 'Explore Consortium Financing',
      scene: 'Formal consortium bank meeting with institutional financial directors.',
      composition: 'High-level financial syndication.'
    },
    {
      conceptId: 'C07',
      title: 'Audited Balance Sheet Underwriting',
      headline: 'Bankable Financial Modelling Aligned With Fee Escrows',
      supportingText: 'Professional credit notes prepared by seasoned institutional advisors.',
      cta: 'Model Institutional Debt',
      scene: 'Financial controller reviewing 10-year cash flow model on dual monitors.',
      composition: 'Sophisticated institutional finance.'
    },
    {
      conceptId: 'C08',
      title: 'Long-Tenure Debt up to 15 Years',
      headline: '10 to 15-Year Repayment Horizon Aligned With Academic Batches',
      supportingText: 'Comfortable debt-service coverage ratio (DSCR) for institutional peace of mind.',
      cta: 'Check DSCR Terms',
      scene: 'Graduation ceremony with graduates tossing caps in front of funded college auditorium.',
      composition: 'Institutional triumph and longevity.'
    },
    {
      conceptId: 'C09',
      title: 'Campus Solar & Renewable Energy',
      headline: 'Megawatt-Scale Rooftop Solar Financing for Universities',
      supportingText: 'Massive annual utility savings with structured capital equipment leasing.',
      cta: 'Green Campus Financing',
      scene: 'Solar array covering multiple college building roofs across campus.',
      composition: 'Green campus innovation.'
    },
    {
      conceptId: 'C10',
      title: 'Sachin Shinde Institutional Desk',
      headline: 'Trusted by Higher-Education Trusts in Maharashtra',
      supportingText: 'Dedicated higher-education debt advisory at Avani Loan Services.',
      cta: 'Schedule Management Discussion',
      scene: 'Sachin Shinde in deep discussion with college chairman in boardroom.',
      composition: 'High-level institutional advisory relationship.'
    }
  ],

  cibil_consultation: [
    {
      conceptId: 'C01',
      title: 'Understand Credit Report',
      headline: 'Understand Your CIBIL Score & Credit Health',
      supportingText: 'Demystify credit report codes, DPD entries, and inquiry histories with an expert.',
      cta: 'Review Credit Profile',
      scene: 'Indian consumer looking at credit report with advisor pointing out positive markers.',
      composition: 'Educational, clear, non-judgmental atmosphere.'
    },
    {
      conceptId: 'C02',
      title: 'Dispute Bureau Errors',
      headline: 'Dispute Inaccurate Data on Your Credit Report',
      supportingText: 'Identify wrong loan accounts or outdated overdue statuses and submit formal bureau disputes.',
      cta: 'Dispute Report Errors',
      scene: 'Credit bureau report with red circle around an erroneous entry and green resolution arrow.',
      composition: 'Problem solving clarity.'
    },
    {
      conceptId: 'C03',
      title: 'Credit Utilization Ratio',
      headline: 'Keep Credit Card Utilization Under 30%',
      supportingText: 'High card balances drag down your score even if you pay minimum dues on time.',
      cta: 'Optimize Credit Usage',
      scene: 'Credit card with utilization meter in green 25% zone.',
      composition: 'Clear financial education graphic.'
    },
    {
      conceptId: 'C04',
      title: 'Overdue Loan Resolution',
      headline: 'Clear Lingering Overdues & Settle Negative Accounts Ethically',
      supportingText: 'Step-by-step guidance on closing old default tags and obtaining clean NOC letters.',
      cta: 'Resolve Overdues',
      scene: 'Bank NOC closure certificate being stamped and filed cleanly.',
      composition: 'Fresh start, unburdened relief.'
    },
    {
      conceptId: 'C05',
      title: 'Avoid Multiple Inquiries',
      headline: 'Stop Multiple Hard Inquiries From Lowering Your Score',
      supportingText: 'Each direct loan rejection drops your score. Pre-evaluate eligibility with Avani first.',
      cta: 'Pre-Assess Without Inquiries',
      scene: 'Warning sign on multiple credit hits transitioning to single green pre-approval check.',
      composition: 'Protection of credit score health.'
    },
    {
      conceptId: 'C06',
      title: 'Credit Card Rollover Trap',
      headline: 'Break Free From 42% Annual Credit Card Interest',
      supportingText: 'Understand how revolving credit damages your debt-to-income profile.',
      cta: 'Learn Debt Management',
      scene: 'Credit card statement showing minimum due trap explained simply.',
      composition: 'Financial literacy concept.'
    },
    {
      conceptId: 'C07',
      title: 'Build Credit for First-Time Borrowers',
      headline: 'New to Credit? Build a 750+ CIBIL From Scratch',
      supportingText: 'Prudent strategies with secured cards and small consumer loans to establish credit.',
      cta: 'Build Credit Profile',
      scene: 'Young professional opening first bank investment / secured card with smile.',
      composition: 'Fresh start, optimistic financial journey.'
    },
    {
      conceptId: 'C08',
      title: 'Truth About Fast Credit Repair',
      headline: 'No One Can Guarantee CIBIL Score Jumps Overnight',
      supportingText: 'Beware of fraudulent agencies. Genuine credit improvement requires disciplined financial habits.',
      cta: 'Get Honest Advice',
      scene: 'Scales of justice and transparent magnifying glass over genuine credit guidelines.',
      composition: 'Ethical, compliant, trustworthy messaging.'
    },
    {
      conceptId: 'C09',
      title: 'Prepare for Big Future Loans',
      headline: 'Planning a Home or Business Loan in 6–12 Months?',
      supportingText: 'Start strengthening your credit score today so you qualify for the lowest interest brackets.',
      cta: 'Plan Ahead',
      scene: 'Calendar showing 6-month progression of credit score from 680 to 760.',
      composition: 'Disciplined progress visual.'
    },
    {
      conceptId: 'C10',
      title: 'Free Initial Credit Review',
      headline: 'Free CIBIL Review Guidance at Avani Loan Services',
      supportingText: 'Confidential analysis of your bureau report by Sachin Shinde in Latur.',
      cta: 'Book Confidential Review',
      scene: 'Sachin Shinde in consultation cabin pointing out healthy credit benchmarks to client.',
      composition: 'Warm, respectful, confidential advisory atmosphere.'
    }
  ]
};

/**
 * Generate all 100 image concepts (10 products × 10 concepts) across 4 formats = 400 asset concepts
 */
function generateAllImageConcepts() {
  const allConcepts = [];

  ALL_PRODUCT_KEYS.forEach(pKey => {
    const product = PRODUCTS_CATALOG[pKey];
    const concepts = PRODUCT_IMAGE_CONCEPTS[pKey] || [];

    concepts.forEach(c => {
      Object.entries(FORMAT_SPECS).forEach(([fmtKey, fmtSpec]) => {
        const templateId = `ALS-${product.code}-IMG-${c.conceptId}-${fmtKey}-V1`;
        const filename = `${product.slug}_${c.conceptId.toLowerCase()}_${fmtSpec.width}x${fmtSpec.height}.png`;

        allConcepts.push({
          templateId,
          businessId: BUSINESS_IDENTITY.businessId,
          product: pKey,
          productName: product.name,
          conceptId: c.conceptId,
          conceptTitle: c.title,
          audience: product.targetAudience,
          headline: c.headline,
          supportingText: c.supportingText,
          cta: c.cta,
          channel: fmtSpec.channel,
          formatKey: fmtKey,
          width: fmtSpec.width,
          height: fmtSpec.height,
          resolution: `${fmtSpec.width}x${fmtSpec.height}`,
          aspectRatio: fmtSpec.ratio,
          filename,
          brandColors: {
            primary: BRAND_THEME.primaryColor,
            accent: BRAND_THEME.accentColor,
            background: BRAND_THEME.backgroundColor
          },
          imagePrompt: {
            scene: c.scene,
            style: 'Premium corporate financial-services photography, natural diffused lighting, realistic Indian business environment.',
            composition: c.composition,
            brandPalette: 'Navy blue (#0A192F), crisp off-white (#F8FAFC), light blue (#38BDF8) accents.',
            dimensions: `${fmtSpec.width}x${fmtSpec.height}`,
            doNot: 'Do not generate fake bank logos, fake sanction letters, fake currency bundles, or misleading 100% approval stamps.'
          },
          version: 1,
          status: 'VALIDATED',
          qualityScore: 95
        });
      });
    });
  });

  return allConcepts;
}


/**
 * Generate 100 unique visual concepts (10 per product × 10 products),
 * where each concept contains an array of the 4 supported aspect ratios.
 */
function generate100VisualConcepts() {
  const conceptsList = [];

  ALL_PRODUCT_KEYS.forEach(pKey => {
    const product = PRODUCTS_CATALOG[pKey];
    const concepts = PRODUCT_IMAGE_CONCEPTS[pKey] || [];

    concepts.forEach(c => {
      const formats = Object.entries(FORMAT_SPECS).map(([fmtKey, fmtSpec]) => ({
        formatKey: fmtKey,
        width: fmtSpec.width,
        height: fmtSpec.height,
        resolution: `${fmtSpec.width}x${fmtSpec.height}`,
        aspectRatio: fmtSpec.ratio,
        channel: fmtSpec.channel,
        filename: `${product.slug}_${c.conceptId.toLowerCase()}_${fmtSpec.width}x${fmtSpec.height}.png`
      }));

      conceptsList.push({
        templateId: `ALS-${product.code}-IMG-${c.conceptId}-V1`,
        conceptId: `ALS-${product.code}-IMG-${c.conceptId}`,
        productId: pKey,
        productName: product.name,
        audience: product.targetAudience.join(', '),
        headline: c.headline,
        supportingText: c.supportingText,
        cta: c.cta,
        brandIdentity: {
          businessName: BUSINESS_IDENTITY.businessName,
          founder: BUSINESS_IDENTITY.founder,
          colors: {
            primary: '#0f172a',
            accent: '#38bdf8',
            background: '#f8fafc'
          },
          whatsapp: BUSINESS_IDENTITY.whatsappBusiness,
          website: BUSINESS_IDENTITY.websiteShort
        },
        imagePrompt: `${c.scene} ${c.composition} Corporate navy and light blue palette. Professional financial advisory. No fake approval stamps.`,
        formats,
        status: 'VALIDATED',
        version: 1,
        qualityScore: 95
      });
    });
  });

  return conceptsList;
}

function generateProductImageConcepts(productId) {
  return generate100VisualConcepts().filter(c => c.productId === productId);
}

module.exports = {
  FORMAT_SPECS,
  BRAND_THEME,
  PRODUCT_IMAGE_CONCEPTS,
  generateAllImageConcepts,
  generateAllProductImageConcepts: generate100VisualConcepts,
  generate100VisualConcepts,
  generateProductImageConcepts
};

