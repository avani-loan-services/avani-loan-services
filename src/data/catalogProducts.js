// src/data/catalogProducts.js
// ─────────────────────────────────────────────────────────────────
// Source-of-Truth for AVANI LOAN SERVICES — 11 Loan Products Catalog
// ─────────────────────────────────────────────────────────────────

export const CATALOG_CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'personal', label: 'Personal' },
  { id: 'business', label: 'Business' },
  { id: 'professional', label: 'Professional' },
  { id: 'property', label: 'Home & Property' },
  { id: 'education', label: 'Education' },
  { id: 'funding', label: 'Funding' },
  { id: 'cibil', label: 'CIBIL' }
];

export const CATALOG_PRODUCTS = [
  {
    id: 'personal-salary-loan',
    slug: 'salary-loan',
    applySlug: 'salary-loan',
    title: 'Personal Loan / Salary Loan',
    category: 'personal',
    categoryLabel: 'Personal',
    iconName: 'UserCheck',
    badge: 'Fast Processing Support',
    shortDescription: 'Flexible financing support for eligible salaried and working professionals to meet planned or urgent personal needs.',
    idealFor: 'Salaried professionals, working employees with regular income from private or government employers.',
    commonUses: [
      'Personal financial needs and planned life goals',
      'Medical emergencies and healthcare expenses',
      'Home improvement, electronics, or planned purchases',
      'Family celebrations, weddings, and travel expenses',
      'Consolidating existing short-term personal obligations'
    ],
    keyBenefits: [
      'Flexible loan amounts customized to your verified income profile',
      'Doorstep and digital documentation support across Maharashtra',
      'No collateral or security required for eligible salaried profiles',
      'Convenient repayment tenures ranging up to 5 years',
      'Guidance on matching with leading nationalized banks and reputed NBFCs',
      'Transparent advisory without hidden processing fees or false promises'
    ],
    eligibilityFactors: [
      'Valid employment with regular verified monthly salary credit',
      'Age criteria typically between 21 and 58 years',
      'Stable employment history and active banking record',
      'Satisfactory credit history and repayment discipline',
      'Existing EMI obligations within standard debt-to-income benchmarks'
    ],
    commonDocuments: [
      'PAN Card & Aadhaar Card / Valid government identity proof',
      'Current residence address proof (Electricity bill, Passport, or Rental Agreement)',
      'Latest 3 to 6 months salary slips issued by employer',
      'Latest 6 months salary bank account statement in PDF format',
      'Form 16 / Income tax returns where applicable'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am interested in a Personal / Salary Loan. Please help me check my eligibility.',
    eligibilityRoute: '/apply/salary-loan',
    applyProductValue: 'Personal / Salary Loan',
    safeNote: 'Eligibility, loan amount, interest rate and tenure depend on lender policies, applicant profile and documentation.'
  },
  {
    id: 'business-loan',
    slug: 'business-loan',
    applySlug: 'business-loan',
    title: 'Business Loan',
    category: 'business',
    categoryLabel: 'Business',
    iconName: 'Building2',
    badge: 'Working Capital & Expansion',
    shortDescription: 'Customized business financing solutions for entrepreneurs, proprietors, partnerships, and MSMEs across Maharashtra.',
    idealFor: 'Business owners, self-employed individuals, MSMEs, SMEs, traders, manufacturers, and growing enterprises.',
    commonUses: [
      'Working capital replenishment and seasonal inventory stocking',
      'Business expansion, opening new retail outlets, or branch setup',
      'Purchasing commercial machinery, tech upgrades, or equipment',
      'Managing vendor payments, cash flow cycles, and operational expenses',
      'Executing bulk trade orders and institutional client contracts'
    ],
    keyBenefits: [
      'Structured business loan options tailored to your actual business turnover',
      'Unsecured and secured funding pathways assessed against cash flows',
      'Dedicated guidance on business financial documentation and GST analysis',
      'Support for proprietary firms, partnerships, LLPs, and private entities',
      'Direct liaison with business lending departments of top banks and NBFCs',
      'Repayment schedules structured to respect your trade cash cycles'
    ],
    eligibilityFactors: [
      'Active business operation with verifiable trading history (typically 1–2+ years)',
      'Business registration (GST, Udyam, Shop Act, or Certificate of Incorporation)',
      'Healthy banking turnover in primary current accounts',
      'Filed Income Tax Returns (ITR) with computation of income and financials',
      'Satisfactory commercial credit score and absence of recent default records'
    ],
    commonDocuments: [
      'Proprietor / Partners / Directors PAN and Aadhaar cards',
      'Business registration proof (GST certificate, Udyam registration, Trade license)',
      'Latest 12 months current account bank statements',
      'Last 2 to 3 years audited financial statements, ITR filings, and balance sheets',
      'Latest 12 months GST returns (GSTR-3B)'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am interested in a Business Loan. Please help me understand my eligibility and documentation.',
    eligibilityRoute: '/apply/business-loan',
    applyProductValue: 'Business Loan',
    safeNote: 'Eligibility, loan amount, interest rate and tenure depend on lender policies, applicant profile and documentation.'
  },
  {
    id: 'doctor-loan',
    slug: 'doctor-professional-loan',
    applySlug: 'doctor-professional-loan',
    title: 'Doctor Loan',
    category: 'professional',
    categoryLabel: 'Professional',
    iconName: 'Stethoscope',
    badge: 'Special Healthcare Terms',
    shortDescription: 'Specialized financing advisory for qualified medical and healthcare professionals to establish, equip, or scale their medical practice.',
    idealFor: 'Doctors (MBBS, MD, MS, BDS, MDS, BAMS, BHMS), specialized surgeons, diagnostic center promoters, and healthcare clinic owners.',
    commonUses: [
      'Setting up new clinics, maternity homes, or nursing facilities',
      'Purchasing advanced medical equipment, radiology units, or dental chairs',
      'Renovation and infrastructure modernizing of hospitals and consulting rooms',
      'Meeting practice working capital and medical inventory requirements',
      'Personal financing requirements for experienced medical practitioners'
    ],
    keyBenefits: [
      'Customized lending options designed specifically for certified medical practitioners',
      'Equipment funding available without extra collateral on eligible medical machinery',
      'Higher borrowing limits recognized based on professional qualification and practice seniority',
      'Minimal operational documentation required for established doctors',
      'Flexible tenures up to 7 years to align with clinic cash receipts',
      'Doorstep assistance in Latur, Marathwada, and across Maharashtra'
    ],
    eligibilityFactors: [
      'Valid medical qualification degree and registration with State Medical Council / MCI',
      'Active medical practice or hospital attachment history',
      'Clean professional track record and acceptable credit profile',
      'Financial evaluation of clinic banking account and tax filings',
      'Verification of clinic or consulting facility address'
    ],
    commonDocuments: [
      'Doctor’s PAN Card, Aadhaar Card, and passport-size photographs',
      'Medical degree certificate and State Council Registration certificate',
      'Clinic / Hospital registration / Establishment certificate',
      'Latest 6 to 12 months clinic operating bank statements',
      'Last 2 years Income Tax Returns (ITR) with computation of income'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am a medical professional and would like information about Doctor Loan options.',
    eligibilityRoute: '/apply/doctor-professional-loan',
    applyProductValue: 'Doctor Loan',
    safeNote: 'Eligibility, loan amount, interest rate and tenure depend on lender policies, applicant profile and documentation.'
  },
  {
    id: 'home-loan',
    slug: 'home-loan',
    applySlug: 'home-loan',
    title: 'Home Loan',
    category: 'property',
    categoryLabel: 'Home & Property',
    iconName: 'Home',
    badge: 'Long-Term Property Financing',
    shortDescription: 'End-to-end consultancy and advisory support to finance your dream residential property, flat purchase, or home construction.',
    idealFor: 'Salaried professionals, business owners, self-employed individuals, and families seeking to acquire or construct a home.',
    commonUses: [
      'Purchasing ready-to-move or under-construction residential flats and apartments',
      'Self-construction of independent houses or villas on approved NA plots',
      'Plot purchase plus home construction composite loans',
      'Major home extension, structural remodeling, or floor additions',
      'Balance transfer of existing high-interest home loans with top-up options'
    ],
    keyBenefits: [
      'Competitive interest rate comparison across top public and private sector banks',
      'Long-term repayment tenures up to 30 years for affordable, manageable EMIs',
      'Complete assistance with property legal checks and technical valuation reports',
      'Guidance on government subsidy schemes (PMAY) where applicable',
      'Joint applicant inclusion options to enhance overall loan eligibility',
      'Transparent advisory ensuring no hidden clauses in loan sanction letters'
    ],
    eligibilityFactors: [
      'Stable verifiable income for salaried or self-employed applicants',
      'Applicant age generally between 21 and 65 years at loan maturity',
      'Healthy CIBIL score (typically 700+ preferred by most home lenders)',
      'Clear, marketable legal title of the residential property being financed',
      'Compliance with municipal building sanctions, NA orders, and layout approvals'
    ],
    commonDocuments: [
      'Applicant & Co-applicant KYC (PAN Card, Aadhaar Card, Residence Proof)',
      'Income documents (3 months salary slips + Form 16, or 3 years business ITRs)',
      'Latest 6 months bank statement showing regular income credits',
      'Property documents (Sale agreement, Draft deed, Sanctioned building plan, 7/12 / Index II)',
      'Property tax receipts, builder NOC / allotment letter where applicable'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am interested in a Home Loan. Please guide me.',
    eligibilityRoute: '/apply/home-loan',
    applyProductValue: 'Home Loan',
    safeNote: 'Eligibility, loan amount, interest rate and tenure depend on lender policies, applicant profile and documentation.'
  },
  {
    id: 'mortgage-loan-lap',
    slug: 'mortgage-lap',
    applySlug: 'mortgage-lap',
    title: 'Mortgage Loan / Loan Against Property',
    category: 'property',
    categoryLabel: 'Home & Property',
    iconName: 'Layers',
    badge: 'Unlock Property Equity',
    shortDescription: 'Leverage the financial value of your self-owned residential or commercial property to secure high-value long-term funding.',
    idealFor: 'Property owners, business promoters, self-employed professionals, and individuals holding clear-title real estate.',
    commonUses: [
      'Infusing large-scale capital into commercial business operations or scaling',
      'Consolidating high-cost unsecured liabilities into a single structured loan',
      'Funding significant personal expenditures, higher education, or overseas medical care',
      'Acquiring commercial assets, warehouse space, or business premises',
      'Meeting substantial working capital needs with longer repayment runway'
    ],
    keyBenefits: [
      'Access substantial loan amounts determined by fair market property valuation',
      'Significantly lower interest rates compared to unsecured business or personal loans',
      'Extended repayment tenures up to 15–20 years to maintain manageable monthly EMIs',
      'Accepted against residential houses, commercial offices, shops, and selected industrial units',
      'Complete legal title documentation guidance from local property advisory experts',
      'Flexible overdraft (OD / Drop-line) structures available with select institutional lenders'
    ],
    eligibilityFactors: [
      'Ownership of clear, encumbrance-free residential or commercial property',
      'Verifiable debt repayment capacity through salaried, professional, or business income',
      'Legal verification and search report confirming defect-free title chain (typically 30 years)',
      'Approved building layout and adherence to local development authority norms',
      'Satisfactory credit history of primary borrower and co-owners'
    ],
    commonDocuments: [
      'Complete KYC of all title holders and co-applicants (PAN, Aadhaar)',
      'Income proof: Salaried (6 months salary slips + Form 16) / Business (3 years ITR with financials)',
      'Latest 12 months primary banking accounts statement',
      'Chain of property title deeds: Registered Sale Deed, Conveyance Deed, Gift Deed',
      'Revenue records: 7/12 extract, 8-A, Index II, Sanctioned plan, Tax paid receipts, Search report'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am interested in a Mortgage Loan. Please guide me.',
    eligibilityRoute: '/apply/mortgage-lap',
    applyProductValue: 'Mortgage / Loan Against Property',
    safeNote: 'Property valuation, legal verification, applicant eligibility and lender policies apply. Information for general guidance.'
  },
  {
    id: 'education-loan-india',
    slug: 'education-loan-india',
    applySlug: 'education-loan-india',
    title: 'Education Loan — India',
    category: 'education',
    categoryLabel: 'Education',
    iconName: 'GraduationCap',
    badge: 'Higher Studies in India',
    shortDescription: 'Comprehensive educational financing guidance for students pursuing undergraduate, postgraduate, and professional courses across India.',
    idealFor: 'Students admitted to recognized universities in India, along with their parents or legal guardians as co-applicants.',
    commonUses: [
      'Tuition fees for Engineering (IITs, NITs, BITS, state colleges), Medical (MBBS, MD), Management (IIMs)',
      'Hostel accommodation, mess charges, and institute campus expenses',
      'Purchase of mandatory laptops, equipment, laboratory supplies, and books',
      'Specialized professional certifications, aviation courses, and design institutes',
      'Bridge financing for semester fees pending institutional clearances'
    ],
    keyBenefits: [
      'Wide coverage including institute tuition fees, hostel, books, and study instruments',
      'Moratorium period benefit — repayment typically commences after course completion plus grace period',
      'Tax deduction benefits on interest paid under Section 80E of the Income Tax Act',
      'Collateral-free options available for meritorious admissions in premier institutions',
      'Co-applicant income flexibility accommodating salaried parents, farmers, or business owners',
      'Direct fee disbursement directly to university accounts ensuring transparency'
    ],
    eligibilityFactors: [
      'Secured admission to a recognized college / university through merit or entrance exam (JEE, NEET, CAT, CET)',
      'Indian citizenship with complete academic background verification',
      'Creditworthy co-applicant (parent, spouse, or guardian) with stable income source',
      'Reasonable future employability prospects based on degree and institution tier',
      'Clean credit track record of the co-borrower'
    ],
    commonDocuments: [
      'Student KYC (Aadhaar Card, PAN Card) and passport-size photographs',
      'Academic records: 10th, 12th marksheets, graduation degree/transcripts',
      'Entrance examination scorecard (JEE, NEET, CAT, GATE, CET)',
      'Official admission letter from the educational institution with course duration',
      'Official fee structure schedule issued on institute letterhead',
      'Co-applicant KYC, income proof (Salary slips / ITR), and 6 months bank statement'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am interested in an Education Loan for studies in India. Please help me with eligibility and documents.',
    eligibilityRoute: '/apply/education-loan-india',
    applyProductValue: 'Education Loan – India',
    safeNote: 'Eligibility, loan amount, interest rate and tenure depend on lender policies, applicant profile and documentation.'
  },
  {
    id: 'education-loan-global',
    slug: 'education-loan-global',
    applySlug: 'education-loan-global',
    title: 'Education Loan — Global Studies',
    category: 'education',
    categoryLabel: 'Education',
    iconName: 'Globe',
    badge: 'Study Abroad Financing',
    shortDescription: 'Specialized education loan advisory for ambitious students planning overseas studies in USA, UK, Canada, Australia, Germany, and beyond.',
    idealFor: 'Students preparing for foreign university admissions and parents seeking structured international education financing guidance.',
    commonUses: [
      'Foreign university tuition fees for Masters (MS, MBA), PhD, and professional degree programs',
      'Mandatory living expense deposits (e.g. US I-20 proof of funds, German Blocked Account, UK CAS)',
      'International air travel tickets, visa application fees, and international student health insurance',
      'Laptop, specialized course study materials, and overseas campus setup costs',
      'Pre-visa disbursement certificates required by international embassies'
    ],
    keyBenefits: [
      'Assistance securing formal Loan Sanction Letters required for visa interviews and foreign university I-20/CAS',
      'Both unsecured (collateral-free) and secured (property-backed) global loan advisory',
      'High-value financing capacity tailored to cover high international living and tuition benchmarks',
      'Moratorium period covering complete study duration plus initial post-study job search runway',
      'Income Tax benefits under Section 80E on educational loan interest payments',
      'Expert advisory on currency conversion, foreign inward remittances, and blocked account transfers'
    ],
    eligibilityFactors: [
      'Unconditional or conditional admission offer from an accredited international university',
      'Qualifying standardized test scores (GRE, GMAT, IELTS, TOEFL, PTE) where required',
      'Financial profile and credit health of co-applicant (parent or close blood relative)',
      'Evaluation of collateral property where high-value secured financing is requested',
      'Target country student visa eligibility and course accreditation'
    ],
    commonDocuments: [
      'Student Passport copy (first and last page) and valid identity documents',
      'Foreign university official Admission / Offer Letter, I-20, CAS, or admit confirmation',
      'Official breakdown of international tuition fees and estimated living expenses',
      'Scorecards: GRE / GMAT / IELTS / TOEFL / Duolingo / PTE tests',
      'Complete academic transcripts and degree certificates',
      'Co-applicant income proof: 2 years Form 16 / ITR, 6 months bank statement, property papers if secured'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am looking for an Education Loan for Global Studies. Please guide me regarding eligibility and documents.',
    eligibilityRoute: '/apply/education-loan-global',
    applyProductValue: 'Education Loan – Global Studies',
    safeNote: 'AVANI LOAN SERVICES does not guarantee visa approval, university admission, or loan approval. Loan terms depend on lender criteria and student profile.'
  },
  {
    id: 'school-funding',
    slug: 'school-funding',
    applySlug: 'school-funding-secured',
    title: 'School Funding',
    category: 'funding',
    categoryLabel: 'Funding',
    iconName: 'GraduationCap',
    badge: 'Institutional Growth',
    shortDescription: 'Dedicated financial advisory for educational trusts, school societies, and private school managements seeking institutional capital.',
    idealFor: 'School management committees, registered educational trusts, Section 8 companies, society promoters, and private school directors.',
    commonUses: [
      'Constructing additional academic wings, smart classrooms, and modern science laboratories',
      'Campus infrastructure modernization, auditorium construction, and sports facility expansion',
      'Procurement of school transport fleets (school buses, vans) and fleet maintenance',
      'Installing EdTech digital boards, high-speed campus networking, and solar energy systems',
      'Bridge financing for operational working capital, annual maintenance, and faculty expansion'
    ],
    keyBenefits: [
      'Solutions structured around academic fee collection schedules and seasonal admission cycles',
      'Financing support against institutional cash flows and campus real estate security',
      'Guidance for both state board, CBSE, ICSE, and international school affiliations',
      'Long repayment tenures up to 10–15 years for major infrastructural capital projects',
      'Liaison with specialized institutional lending desks at leading commercial banks and NBFCs',
      'Local advisory grounded in the educational landscape of Latur and across Maharashtra'
    ],
    eligibilityFactors: [
      'Registered educational trust, society, or Section 8 entity with active constitutional status',
      'Valid affiliation and recognition from State Education Department, CBSE, or ICSE',
      'Track record of student enrollment stability and consistent fee collection receipts',
      'Audited balance sheets and Income & Expenditure statements for the preceding 3 years',
      'Clear institutional resolution approving borrowing and acceptable trustee credit history'
    ],
    commonDocuments: [
      'Trust Deed / Society Registration Certificate / Section 8 Memorandum & Articles',
      'State Government Recognition / CBSE / ICSE Affiliation certificates',
      'Audited financial statements (Balance Sheet, Income & Expenditure) for last 3 financial years',
      'Last 12 months fee collection bank account statements across all operational branches',
      'Board of Trustees Resolution authorizing loan application and identifying authorized signatories',
      'Campus land title records (NA Order, Sale deed / Long lease deed, Sanctioned building plan)'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I would like to discuss School Funding options for our institution.',
    eligibilityRoute: '/contact?product=School%20Funding',
    applyProductValue: 'School Funding',
    safeNote: 'Institutional loan sanctions depend on statutory approvals, audited financials, trust constitution, and lender underwriting criteria.'
  },
  {
    id: 'college-funding',
    slug: 'college-funding',
    applySlug: 'college-funding-secured',
    title: 'College Funding',
    category: 'funding',
    categoryLabel: 'Funding',
    iconName: 'Building',
    badge: 'Campus & Degree Institutes',
    shortDescription: 'Institutional funding solutions and advisory for degree colleges, professional universities, engineering, medical, and polytechnic institutes.',
    idealFor: 'Degree colleges, polytechnics, engineering & medical institutes, private university boards, and higher education trusts.',
    commonUses: [
      'Constructing multi-storey academic blocks, advanced engineering workshops, and medical labs',
      'Building student hostels, modern cafeterias, faculty residential quarters, and libraries',
      'Procurement of specialized medical, engineering, research, and simulation technology equipment',
      'Accreditation infrastructure enhancements required for NAAC, NBA, NIRF, or AICTE compliance',
      'Refinancing high-cost institutional loans with lower-cost structured credit'
    ],
    keyBenefits: [
      'Tailored institutional credit structures accommodating student semester fee inflows',
      'High ticket-size funding capacity aligned with extensive campus asset valuations',
      'Flexible combinations of term loans, equipment finance, and working capital lines',
      'Advisory on institutional underwriting standards, compliance ratios, and DSCR metrics',
      'Support throughout the evaluation process by experienced financial consultants',
      'Direct engagement with specialized institutional project finance teams'
    ],
    eligibilityFactors: [
      'Recognized university / college established under statutory state or national education framework',
      'Accreditation and approval from regulatory authorities (UGC, AICTE, NMC, DTE, PCI, BCI)',
      'Minimum operating history demonstrating student intake stability across programs',
      'Healthy debt-service coverage ratio (DSCR) verified through 3 years audited accounts',
      'Clear title or registered long-term lease on college campus land and premises'
    ],
    commonDocuments: [
      'Society / Trust constitution, registration, and Charity Commissioner records',
      'Regulatory approval letters: UGC / AICTE / Medical Council / State Directorate of Technical Education',
      'Governing body resolution authorizing loan borrowing with member signatures',
      'Last 3 to 5 years audited balance sheets and financial statements with CA audit report',
      'Latest 12 months college operating bank statements',
      'Campus land documentation, building completion certificate, and fire safety NOCs'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I would like to discuss College Funding options for our institution.',
    eligibilityRoute: '/contact?product=College%20Funding',
    applyProductValue: 'College Funding',
    safeNote: 'Institutional loan sanctions depend on statutory approvals, audited financials, trust constitution, and lender underwriting criteria.'
  },
  {
    id: 'ca-professional-loan',
    slug: 'chartered-accountant-loan',
    applySlug: 'chartered-accountant-loan',
    title: 'CA Professional Loan',
    category: 'professional',
    categoryLabel: 'Professional',
    iconName: 'Award',
    badge: 'Exclusive for CAs',
    shortDescription: 'Tailor-made collateral-free financial solutions designed specifically for practicing Chartered Accountants and established CA firms.',
    idealFor: 'Practicing Chartered Accountants with valid Certificate of Practice (COP), CA partners in audit firms, and financial consultants.',
    commonUses: [
      'Setting up new audit offices, corporate consulting chambers, or branch expansion',
      'Procuring high-end IT infrastructure, audit automation software, and secure servers',
      'Recruiting audit trainees, hiring professional staff, and meeting office working capital',
      'Financing personal commitments, residential property upgrades, or vehicle acquisition',
      'Managing seasonal audit cash flow cycles and advisory project mobilization'
    ],
    keyBenefits: [
      'Exclusive professional underwriting recognizing your ICAI membership and professional reputation',
      'Collateral-free funding options with limits structured around professional practice receipts',
      'Quick evaluation and streamlined documentation honoring the busy schedule of practitioners',
      'Competitive interest rates tailored for certified accounting professionals',
      'Tenures ranging up to 5 years with flexible part-payment and foreclosure facilities',
      'Doorstep assistance in Latur, Marathwada, and across Maharashtra'
    ],
    eligibilityFactors: [
      'Active membership with the Institute of Chartered Accountants of India (ICAI)',
      'Valid and current Certificate of Practice (COP) with minimum practice vintage (typically 2–3+ years)',
      'Satisfactory professional credit history and clean personal financial standing',
      'Review of past 2 years Income Tax Returns and firm / individual banking conduct',
      'Verification of active professional office premises'
    ],
    commonDocuments: [
      'PAN Card and Aadhaar Card of the Chartered Accountant / Partners',
      'ICAI Membership Certificate & latest Certificate of Practice (COP)',
      'Firm registration deed / Partnership deed / Shop Act license where applicable',
      'Latest 6 to 12 months office or individual bank statements',
      'Last 2 years filed Income Tax Returns (ITR) with Computation of Income'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I am a Chartered Accountant and would like to explore CA Professional Loan options.',
    eligibilityRoute: '/apply/chartered-accountant-loan',
    applyProductValue: 'Chartered Accountant Loan',
    safeNote: 'Eligibility, loan amount, interest rate and tenure depend on lender policies, applicant profile and documentation.'
  },
  {
    id: 'cibil-consultation',
    slug: 'cibil-guidance',
    applySlug: 'cibil-consultation',
    title: 'CIBIL Improvement Consultation',
    category: 'cibil',
    categoryLabel: 'CIBIL',
    iconName: 'ShieldAlert',
    badge: 'Credit Health Advisory',
    shortDescription: 'Professional credit consultation to help applicants understand credit report issues, repayment history, and take responsible improvement steps.',
    idealFor: 'Individuals and business owners facing past loan rejections, low credit scores, credit card defaults, or report inaccuracies.',
    commonUses: [
      'Reviewing TransUnion CIBIL, Experian, CRIF High Mark, and Equifax credit reports in detail',
      'Identifying clerical errors, reporting mismatches, or disputed loan accounts',
      'Analyzing credit utilization ratios across existing active credit cards and lines',
      'Formulating a structured, disciplined repayment timeline to clear overdue balances',
      'Preparing your overall credit profile before applying for major home or business loans'
    ],
    keyBenefits: [
      'Expert forensic review of your complete credit bureau report by trained loan consultants',
      'Objective analysis of factors pulling your credit score down without false promises',
      'Guidance on resolving disputes directly with reporting lending institutions',
      'Clear roadmap for debt management and lowering revolving debt ratios responsibly',
      'Factual understanding of credit rebuilding timelines based on Indian banking norms',
      'Safe, confidential review adhering to strict financial data privacy protocols'
    ],
    eligibilityFactors: [
      'Open to any borrower, salaried individual, professional, or entrepreneur seeking credit guidance',
      'Applicant must have an existing credit history or previous loan/credit card account',
      'Willingness to review official credit bureau records transparently',
      'Commitment to following disciplined financial and repayment habits over time'
    ],
    commonDocuments: [
      'PAN Card and Aadhaar Card copy for identity verification',
      'Latest credit bureau report (TransUnion CIBIL, Experian, or CRIF) if already available',
      'Statements of disputed or overdue loan / credit card accounts if applicable',
      'No Objection Certificates (NOC) or closure letters from previous lenders if settled'
    ],
    whatsappText: 'Hello AVANI LOAN SERVICES, I need CIBIL guidance. Please help me understand my credit profile.',
    eligibilityRoute: '/cibil-check',
    applyProductValue: 'CIBIL Improvement Consultation',
    safeNote: 'AVANI LOAN SERVICES does not promise a specific credit score increase nor claim that accurate negative information can be simply removed. Consultation focuses on analysis, dispute identification, and responsible credit habits.'
  }
];

export const GENERAL_DOCUMENTS = [
  {
    category: 'Salaried Professionals',
    subtitle: 'Personal / Salary Loan, Salaried Home Loan',
    documents: [
      'PAN Card (mandatory government tax identity)',
      'Aadhaar Card / Valid passport / Voter ID (proof of identity & address)',
      'Current residence address proof (Electricity bill, rental agreement, or gas bill)',
      'Latest 3 to 6 months salary slips with company seal/stamp or digital payroll slip',
      'Latest 6 months salary account bank statements in original PDF format',
      'Form 16 (Part A & B) for the latest 2 assessment years / Income Tax Returns'
    ]
  },
  {
    category: 'Business Owners & Self-Employed',
    subtitle: 'Business Loan, Self-Employed Home Loan, Commercial Funding',
    documents: [
      'Proprietor / Partners / Directors PAN & Aadhaar Cards',
      'Business Registration: GST Certificate, Udyam Registration, Shop Act, or Incorporation Deed',
      'Partnership Deed / MOA & AOA with Certificate of Commencement of Business',
      'Latest 12 months primary current bank account statements',
      'Last 2 to 3 years Income Tax Returns (ITR) with Computation of Income and CA Audit Report',
      'Latest 12 months GST returns (GSTR-3B & GSTR-1) matching bank statement turnover'
    ]
  },
  {
    category: 'Certified Professionals (Doctors & CAs)',
    subtitle: 'Doctor Loan, CA Professional Loan',
    documents: [
      'PAN Card and Aadhaar Card of the practicing professional',
      'Professional Degree Certificate (MBBS, MD, BDS, BAMS / CA Final Certificate)',
      'Active Registration Certificate: State Medical Council or ICAI Certificate of Practice (COP)',
      'Clinic / Practice establishment proof (Shop Act, Municipal license, Clinic lease deed)',
      'Latest 6 to 12 months practice bank account statements',
      'Last 2 years filed ITRs with Computation of Income and Financial Statements'
    ]
  },
  {
    category: 'Students & Higher Education',
    subtitle: 'Education Loan (India & Global Studies)',
    documents: [
      'Student KYC: PAN Card, Aadhaar Card, Valid Passport (mandatory for Global Studies)',
      'Complete academic records: 10th, 12th, Degree transcripts, and passing certificates',
      'Entrance / Standardized exam scorecards (JEE, NEET, CAT, GRE, GMAT, IELTS, TOEFL)',
      'Confirmed Admission Letter / I-20 / CAS / Offer Letter from recognized institution',
      'Official course fee structure and breakdown of living expenses on institute letterhead',
      'Co-applicant KYC, proof of relationship, income proof (Salary slips / ITR), and 6 months bank statements'
    ]
  },
  {
    category: 'Property Borrowers',
    subtitle: 'Home Loan, Mortgage Loan / LAP',
    documents: [
      'Identity and address KYC of all property co-owners and applicants',
      'Complete chain of registered property title documents (Sale deed, Conveyance, Gift deed, Allotment letter)',
      'Revenue records: 7/12 extract, 8-A, Index II, City Survey extract, Sanctioned building layout',
      'Latest paid Property Tax receipts, Electricity connection bill, Municipal NOC / OC',
      'Detailed legal search and title verification report (typically 30 years chain)',
      'Detailed construction estimate / Architect cost certificate for self-construction'
    ]
  }
];

export const CATALOG_FAQS = [
  {
    q: 'How do I apply for a loan through AVANI LOAN SERVICES?',
    a: 'You can apply easily by submitting an online enquiry on our website, exploring our Loan Product Catalog, or connecting directly with our advisory desk via WhatsApp at +91 91756 35165. Our dedicated team will evaluate your requirement and assist you through each step.'
  },
  {
    q: 'Can you check my eligibility before I formally apply?',
    a: 'Yes. We conduct a thorough preliminary eligibility assessment based on your income profile, existing obligations, credit record, and required loan amount before submitting any documents to lenders, preventing unnecessary rejections.'
  },
  {
    q: 'Do you provide loans directly as a bank or NBFC?',
    a: 'No. AVANI LOAN SERVICES is a professional loan consultancy and advisory firm based in Latur, Maharashtra. We act as an authorized DSA and advisory channel partner, matching your profile with top nationalized banks, private banks, and reputed NBFCs.'
  },
  {
    q: 'Is loan approval guaranteed?',
    a: 'No financial consultancy can guarantee loan approval. Final loan sanction, interest rate, tenure, and disbursal are strictly subject to the respective lending bank or NBFC’s underwriting criteria, policy checks, documentation, and property legal verification.'
  },
  {
    q: 'What documents are required for my loan application?',
    a: 'Documentation requirements depend on whether you are salaried, self-employed, a professional (Doctor/CA), a student, or a property owner. Typical documents include KYC, income proofs (salary slips or ITRs), bank statements, and property or admission documents where applicable.'
  },
  {
    q: 'Can I get education loan support for overseas studies?',
    a: 'Yes. AVANI LOAN SERVICES provides dedicated consultancy for students pursuing higher education abroad in destinations such as the US, UK, Canada, Australia, and Germany, covering both collateral-free and secured loan options with visa support documentation.'
  },
  {
    q: 'Can you guarantee that my CIBIL score will increase?',
    a: 'No. We provide an honest, compliant CIBIL Improvement Consultation. We help you read your credit bureau report, spot reporting errors, understand high credit utilization, and recommend disciplined repayment habits. Accurate negative credit records cannot be erased arbitrarily.'
  },
  {
    q: 'How fast can a loan application be processed?',
    a: 'Processing timelines depend on the specific loan product, complete documentation submission, and lender evaluation. For eligible salaried profiles, preliminary decisions can be reached quickly, but all timelines remain subject to lender verification and compliance.'
  }
];
