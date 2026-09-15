import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  UserCheck,
  Briefcase,
  Stethoscope,
  Home as HomeIcon,
  Building,
  GraduationCap,
  Globe,
  School,
  Landmark,
  Award,
  ShieldCheck,
  CheckCircle,
  FileText,
  MessageCircle,
  Phone,
  ArrowRight,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Clock,
  Sparkles
} from 'lucide-react';
import './Catalog.css';

const WHATSAPP_BASE = 'https://wa.me/919175635165';

const PRODUCTS = [
  {
    id: 'personal-loan',
    category: 'Personal',
    name: 'Personal Loan / Salary Loan',
    badge: 'Salaried Professionals',
    icon: UserCheck,
    shortDesc: 'Tailored personal financing for government, corporate, and private salaried professionals across Maharashtra.',
    idealFor: 'Salaried and working professionals with regular monthly income',
    commonUses: [
      'Personal financial needs and liquidity smoothing',
      'Major family milestones and wedding expenses',
      'Emergency medical and hospital expenditure',
      'Debt consolidation to eliminate high-interest revolving card dues'
    ],
    keyBenefits: [
      'Multi-lender loan options matched to your specific employer category',
      'Structured FOIR calculations to safeguard your credit profile',
      'Tenures ranging from 12 to 60 months with predictable fixed EMIs',
      'Minimal documentation with preliminary in-principle verification'
    ],
    eligibilityFactors: [
      'Regular verifiable monthly net salary credit',
      'Minimum age 21 years up to retirement age',
      'Valid identity, residence, and current employment proof',
      'Healthy banking transaction records with low return history'
    ],
    documents: [
      'PAN Card and Aadhaar Card',
      'Last 3 months salary slips',
      'Last 6 months salary bank account statement',
      'Current employment ID card / appointment letter'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am interested in a Personal / Salary Loan. Please help me check my eligibility.'
  },
  {
    id: 'business-loan',
    category: 'Business',
    name: 'Business Loan',
    badge: 'MSMEs & Entrepreneurs',
    icon: Briefcase,
    shortDesc: 'Unsecured and structured business capital solutions to fuel operations, inventory, and enterprise expansion.',
    idealFor: 'Business owners, self-employed traders, manufacturers, MSMEs and entrepreneurs',
    commonUses: [
      'Working capital to bridge receivables and operational cash flow',
      'Bulk seasonal inventory and raw materials procurement',
      'Machinery, tools, and technology equipment acquisition',
      'Retail store, workshop, or commercial office expansion'
    ],
    keyBenefits: [
      'Collateral-free options available subject to business vintage and turnover',
      'Evaluation based on actual banking turnover and GST filings',
      'Customized repayment tenures aligned with your enterprise cash cycle',
      'Expert advisory from Sachin Shinde to structure clean financial files'
    ],
    eligibilityFactors: [
      'Minimum 2 to 3 years operational business vintage',
      'Consistent annual turnover reflected in official GST returns',
      'Healthy Average Bank Balance (ABB) without cheque bounces',
      'Clean repayment history on existing commercial or personal credit'
    ],
    documents: [
      'PAN and Aadhaar of Proprietor / Partners / Directors',
      'GST Registration Certificate & 12 months GST returns (GSTR-3B)',
      'Last 12 months current bank account statements',
      'Last 2 to 3 years ITR with computation, Balance Sheet and P&L'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am interested in a Business Loan. Please help me understand my eligibility and documentation.'
  },
  {
    id: 'doctor-loan',
    category: 'Professional',
    name: 'Doctor Loan',
    badge: 'Medical Specialists',
    icon: Stethoscope,
    shortDesc: 'Specialized financing for doctors, surgeons, dentists, and clinic operators to elevate healthcare infrastructure.',
    idealFor: 'Practicing doctors, MBBS/MD specialists, BDS/MDS dentists, clinic and nursing home owners',
    commonUses: [
      'Setting up a new private clinic or diagnostic pathology center',
      'Procurement of advanced medical devices and surgical equipment',
      'Expansion and modern interior renovation of existing consultation rooms',
      'Working capital for pharmacy inventory and healthcare staff'
    ],
    keyBenefits: [
      'Preferential professional credit limits based on medical qualification degree',
      'Collateral-free loan sanctions available from institutional lenders',
      'Fast-track file processing with medical council registration proof',
      'Tailored moratorium and flexible structured tenure options'
    ],
    eligibilityFactors: [
      'Valid medical qualification (MBBS, MD, MS, BDS, MDS, BHMS/BAMS as per lender)',
      'Registration with State / National Medical Council',
      'Active medical practice or clinic setup vintage',
      'Satisfactory banking and credit bureau track record'
    ],
    documents: [
      'KYC (PAN Card and Aadhaar Card)',
      'Medical Council Registration Certificate',
      'Highest Qualification Degree Certificate',
      'Last 6 to 12 months bank statements and clinic financial proofs'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am a medical professional and would like information about Doctor Loan options.'
  },
  {
    id: 'home-loan',
    category: 'Home & Property',
    name: 'Home Loan',
    badge: 'Property Buyers',
    icon: HomeIcon,
    shortDesc: 'Comprehensive home buying assistance with multi-lender comparison, legal vetting support, and long-tenure EMIs.',
    idealFor: 'Salaried professionals, business owners, self-employed individuals, and first-time home buyers',
    commonUses: [
      'Purchase of ready-to-move-in flats or under-construction apartments',
      'Self-construction of independent bungalow or residential row houses',
      'Purchase of NA residential residential plots with composite construction finance',
      'Home expansion, structural extension, or major terrace/room additions'
    ],
    keyBenefits: [
      'Extended tenures up to 30 years to minimize your monthly EMI impact',
      'Multi-bank interest rate benchmarking across major nationalized institutions',
      'Assistance with property legal search reports and title documentation',
      'Co-applicant inclusion support to maximize sanction eligibility'
    ],
    eligibilityFactors: [
      'Stable income stream with adequate disposable FOIR headroom',
      'Clear, marketable legal title of the residential property',
      'Property valuation and technical feasibility verified by bank valuers',
      'Disciplined credit bureau score (preferably 750+ for optimal terms)'
    ],
    documents: [
      'Applicant & Co-Applicant KYC (PAN and Aadhaar)',
      'Income proof: Salary slips + Form 16 (Salaried) or ITR + Financials (Business)',
      'Last 6 months updated bank statement',
      'Property documents: Registered Agreement for Sale, Chain Deeds, Sanctioned Plan'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am interested in a Home Loan. Please guide me.'
  },
  {
    id: 'mortgage-loan',
    category: 'Home & Property',
    name: 'Mortgage Loan / Loan Against Property (LAP)',
    badge: 'Secured High-Value',
    icon: Building,
    shortDesc: 'Unlock the dormant equity in your residential or commercial real estate for long-term business or personal funding.',
    idealFor: 'Property owners, business founders, commercial landlords, and self-employed professionals',
    commonUses: [
      'High-value long-term business expansion and capital investment',
      'Debt consolidation to replace expensive short-term liabilities',
      'Commercial property development or industrial land enhancement',
      'Funding significant educational, hospital, or institutional commitments'
    ],
    keyBenefits: [
      'Substantially lower interest rates compared to unsecured business loans',
      'Longer repayment tenures up to 15 years for manageable cash flow',
      'High loan quanta based on institutional market valuation of the property',
      'Continued ownership, possession, and regular use of your real estate'
    ],
    eligibilityFactors: [
      'Clear freehold marketable title with zero encumbrance / litigation',
      'Property valuation and physical inspection clearance by empanelled architects',
      'Demonstrated cash flow and repayment capacity through banking and ITR',
      'Compliance with municipal zone and town-planning regulations'
    ],
    documents: [
      'KYC documents of all property owners and co-applicants',
      'Income documentation (3 years ITR, audit reports, 12 months bank statements)',
      'Complete chain of title deeds, Index II, approved municipal layout',
      'Latest Property Tax receipts, Electricity bill, and occupancy certificate'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am interested in a Mortgage Loan / Loan Against Property. Please guide me.'
  },
  {
    id: 'education-loan-india',
    category: 'Education',
    name: 'Education Loan — India',
    badge: 'Domestic Studies',
    icon: GraduationCap,
    shortDesc: 'Dedicated education financing covering college tuition, hostel fees, and academic equipment across top Indian universities.',
    idealFor: 'Students admitted to higher secondary, undergraduate, postgraduate, and professional degrees in India',
    commonUses: [
      'Tuition fees for Engineering (IIT/NIT), Medical (AIIMS/NEET), Management (IIM)',
      'Hostel accommodation, mess charges, and campus residential expenses',
      'Purchase of academic books, technical equipment, and laptop computers',
      'Professional certification courses and government-approved diploma programs'
    ],
    keyBenefits: [
      'Comprehensive coverage of institutional tuition and living expenses',
      'Repayment moratorium during entire course duration plus grace period',
      'Parent or legal guardian as co-borrower with simplified documentation',
      'Tax deduction benefits under Section 80E on interest paid'
    ],
    eligibilityFactors: [
      'Confirmed admission in recognized college/university through merit or entrance test',
      'Parent, guardian, or spouse with verifiable income acting as co-borrower',
      'Clear academic track record in 10th, 12th, and graduation levels',
      'Applicable collateral requirement for high-value loans as per bank norms'
    ],
    documents: [
      'Student and Co-Applicant KYC (PAN, Aadhaar)',
      'Admission confirmation letter & official college fee structure',
      'Academic marksheets (10th, 12th, graduation degree if applicable)',
      'Co-applicant income proof: Salary slips / Form 16 / ITR with 6 months banking'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am interested in an Education Loan for studies in India. Please help me with eligibility and documents.'
  },
  {
    id: 'education-loan-global',
    category: 'Education',
    name: 'Education Loan — Global Studies',
    badge: 'Study Abroad',
    icon: Globe,
    shortDesc: 'Structured overseas student funding assisting with visa-compliant sanction letters, tuition, living costs, and forex disbursement.',
    idealFor: 'Students admitted to universities in USA, UK, Canada, Germany, Australia, Ireland, and global destinations',
    commonUses: [
      'International university tuition fees disbursed directly in foreign currency',
      'Mandatory blocked account funding (Germany) or GIC deposit (Canada)',
      'Overseas accommodation, food, travel, and student health insurance',
      'Visa-compliant financial proof certificates required by foreign consulates'
    ],
    keyBenefits: [
      'Secured and unsecured overseas study loan avenues tailored to GRE/IELTS profile',
      'Timely pre-visa sanction letters to expedite embassy student visa processing',
      'Comprehensive funding including airfare, laptop, and initial campus setup',
      'Grace period on principal repayment during study and job-search duration'
    ],
    eligibilityFactors: [
      'Valid passport and unconditional or conditional university offer letter',
      'Standardized test scores (IELTS / TOEFL / GRE / GMAT as required)',
      'Co-applicant financial eligibility and acceptable CIBIL history',
      'Appropriate immovable collateral or financial asset backing if loan exceeds unsecured limits'
    ],
    documents: [
      'Student Passport, Academic Transcripts, Standardized Test Scorecards',
      'Foreign University Admission Offer Letter & I-20 / CAS statement',
      'Co-applicant KYC, 3 years ITR, 6 months bank statement',
      'Property papers if applying for secured overseas educational loan'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am looking for an Education Loan for Global Studies. Please guide me regarding eligibility and documents.'
  },
  {
    id: 'school-funding',
    category: 'Funding',
    name: 'School Funding & Infrastructure Finance',
    badge: 'Institutions',
    icon: School,
    shortDesc: 'Specialized institutional credit for private schools, trusts, and societies for campus expansion, labs, and modern transport.',
    idealFor: 'School management, educational trusts, society trustees, and private K-12 school operators',
    commonUses: [
      'Construction of additional classroom wings, auditorium, and laboratories',
      'Deployment of digital smart classrooms, AV tech, and modern computer labs',
      'Fleet purchase and renewal of school buses and student transport vans',
      'Seasonal operational cash flow and sports ground/playground development'
    ],
    keyBenefits: [
      'Institutional underwriting structured around trust bylaws and fee collections',
      'Extended repayment tenures suited for institutional development cycles',
      'Advisory on society registration compliances and balance sheet presentation',
      'Direct guidance from Sachin Shinde on institutional lender requirements'
    ],
    eligibilityFactors: [
      'Registered educational trust or society with recognized recognition status',
      'Consistent student enrollment strength and verified historical fee collection',
      'Audited balance sheets and Income & Expenditure accounts for past 3 years',
      'School campus land ownership or long-term registered lease agreement'
    ],
    documents: [
      'Trust / Society Registration Certificate & Trust Deed / Memorandum',
      'Government / Board Recognition & Affiliation letters (CBSE/ICSE/State Board)',
      'Last 3 years audited financial statements and bank statements',
      'Campus land title deeds / lease deed and building plans'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I would like to discuss School Funding and infrastructure finance.'
  },
  {
    id: 'college-funding',
    category: 'Funding',
    name: 'College Funding & Campus Project Finance',
    badge: 'Institutions',
    icon: Landmark,
    shortDesc: 'High-value structured project financing for degree colleges, engineering/medical campuses, hostels, and lab setups.',
    idealFor: 'College management, university trustees, higher education groups, and polytechnic institutes',
    commonUses: [
      'High-capacity campus building construction and student hostel towers',
      'State-of-the-art engineering, medical, or research laboratory equipment',
      'Campus modernization for NAAC, NBA, and AICTE accreditation upgrades',
      'Working capital to bridge admission cycle fee receipts and faculty payroll'
    ],
    keyBenefits: [
      'High-quantum long-term structured credit tailored for higher education',
      'Flexible disbursement milestones linked to project construction phases',
      'Custom debt servicing structured to harmonize with semester fee cycles',
      'Independent financial advisory across nationalized and private banking desks'
    ],
    eligibilityFactors: [
      'UGC, AICTE, NMC, or relevant statutory council approval & active affiliations',
      'Proven student enrollment metrics and sustainable institutional surplus',
      'Healthy 3 to 5 years audited financial performance',
      'Clear title of institutional campus property and regulatory sanctions'
    ],
    documents: [
      'Trust / Society / Corporate Entity incorporation and registration deeds',
      'Statutory council approvals and University affiliation certificates',
      'Last 3 to 5 years audited balance sheets, P&L, and 12 months bank records',
      'Detailed Project Report (DPR), architect estimates, and layout sanctions'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I would like to discuss College Funding and campus project finance.'
  },
  {
    id: 'ca-loan',
    category: 'Professional',
    name: 'CA Professional Loan',
    badge: 'Chartered Accountants',
    icon: Award,
    shortDesc: 'Customized credit lines and practice expansion loans designed exclusively for practicing Chartered Accountants and CA firms.',
    idealFor: 'Chartered Accountants in independent practice, audit partners, and CA firms',
    commonUses: [
      'Establishing or modernizing prime commercial office premises',
      'Investing in advanced server infrastructure, audit software, and IT security',
      'Expanding professional team strength during peak audit and tax filing periods',
      'Branch office setup and practice diversification'
    ],
    keyBenefits: [
      'Exclusive interest rates and special terms for qualified ICAI members',
      'No collateral or security required for eligible practicing professionals',
      'Fast-track verification using Certificate of Practice (COP) and membership card',
      'Flexible repayment structures designed around quarterly practice cash flows'
    ],
    eligibilityFactors: [
      'Active Certificate of Practice (COP) from Institute of Chartered Accountants of India (ICAI)',
      'Minimum continuous practice vintage (typically 2 to 3 years post-COP)',
      'Clean professional banking and satisfactory credit bureau score',
      'Valid office address proof and registration'
    ],
    documents: [
      'ICAI Membership Certificate & Certificate of Practice (COP)',
      'KYC documents of the Chartered Accountant / Partners',
      'Last 2 to 3 years ITR with computation of income and Balance Sheet',
      'Last 6 to 12 months bank account statements (Current and Savings)'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I am a Chartered Accountant interested in CA Professional Loan options.'
  },
  {
    id: 'cibil-consultation',
    category: 'CIBIL',
    name: 'CIBIL Improvement Consultation',
    badge: 'Credit Advisory',
    icon: ShieldCheck,
    shortDesc: 'Professional credit report review to identify reporting discrepancies, optimize debt utilization, and build a healthy profile.',
    idealFor: 'Individuals with past loan rejections, low credit scores, or those planning major loan applications in the next 3 to 12 months',
    commonUses: [
      'Detailed forensic review of CIBIL, Experian, CRIF, and Equifax credit reports',
      'Identifying outdated default status, erroneous duplicate accounts, or typo errors',
      'Guidance on structured debt reduction and credit card balance restructuring',
      'Formulating responsible repayment disciplines to gradually strengthen your credit score'
    ],
    keyBenefits: [
      'Honest, fact-based guidance without false or illegal score promises',
      'Clear roadmap to resolve outstanding disputes with original lenders',
      'Techniques to balance credit utilization ratios below 30%',
      'Pre-loan preparation to prevent multiple hard credit rejections'
    ],
    eligibilityFactors: [
      'Any borrower seeking to understand and improve their credit health',
      'Willingness to review credit bureau reports and adhere to financial discipline',
      'Note: This is an educational and advisory service, not a magic fix'
    ],
    documents: [
      'Latest copy of CIBIL / Credit Bureau Report (if available)',
      'PAN Card & Aadhaar Card for identity verification',
      'Sanction letters or closure NOCs of any disputed or settled accounts'
    ],
    whatsappMsg: 'Hello AVANI LOAN SERVICES, I would like guidance regarding my CIBIL / credit profile and would like to understand the next steps.'
  }
];

const CATEGORIES = ['All', 'Personal', 'Business', 'Professional', 'Home & Property', 'Education', 'Funding', 'CIBIL'];

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [activeDocModal, setActiveDocModal] = useState(null);

  useSEO({
    title: 'Loan Products & Loan Consultancy Services in Latur & Maharashtra | AVANI LOAN SERVICES',
    description: 'Explore Personal, Business, Doctor, Home, Mortgage, Education, School & College Funding and professional loan consultancy services from AVANI LOAN SERVICES in Latur and across Maharashtra.',
    keywords: 'loan consultancy Latur, loan services Latur, personal loan Latur, business loan Latur, home loan Latur, education loan Latur, loan consultancy Maharashtra, business loan Maharashtra, education loan Maharashtra, mortgage loan Latur, doctor loan, CA professional loan, CIBIL guidance'
  });

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const toggleExpand = (id) => {
    setExpandedProduct(prev => (prev === id ? null : id));
  };

  const openDocModal = (product) => {
    setActiveDocModal(product);
  };

  const closeDocModal = () => {
    setActiveDocModal(null);
  };

  return (
    <div className="product-catalog-page">
      {/* Schema.org Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": "AVANI LOAN SERVICES",
          "url": "https://www.avanifinserv.com/loan-products",
          "telephone": "+919175635165",
          "email": "enquiry@avanifinserv.com",
          "founder": {
            "@type": "Person",
            "name": "Sachin Shinde"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Old Barshi Road, 5 No Chauk, Kulswamini Nagar, Next to Sai School",
            "addressLocality": "Latur",
            "addressRegion": "Maharashtra",
            "postalCode": "413512",
            "addressCountry": "IN"
          },
          "areaServed": ["Latur", "Maharashtra"],
          "description": "Professional loan consultancy and advisory services across Personal, Business, Doctor, Home, Mortgage, Education, and Institutional Funding."
        })
      }} />

      {/* SECTION 1 — HERO */}
      <header className="catalog-hero-section">
        <div className="catalog-hero-container">
          <div className="catalog-hero-badge">
            <Sparkles size={16} className="hero-sparkle-icon" />
            <span>Authoritative Loan Consultancy • Latur & Maharashtra</span>
          </div>
          <h1 className="catalog-hero-title">
            Find the Right Loan for Your Financial Goals
          </h1>
          <p className="catalog-hero-subtitle">
            AVANI LOAN SERVICES provides professional loan consultancy and advisory support for individuals, professionals, businesses, property buyers and students across Latur and Maharashtra.
          </p>

          <div className="catalog-hero-actions">
            <Link to="/contact" className="catalog-btn catalog-btn-primary">
              Apply Now <ArrowRight size={18} />
            </Link>
            <a
              href={WHATSAPP_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-btn catalog-btn-whatsapp"
            >
              <MessageCircle size={18} /> WhatsApp an Advisor
            </a>
            <Link to="/financial-tools" className="catalog-btn catalog-btn-secondary">
              Check Eligibility
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 2 — QUICK PRODUCT NAVIGATION / FILTER */}
      <nav className="catalog-nav-filter" aria-label="Product Categories">
        <div className="catalog-nav-container">
          <div className="catalog-filter-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`catalog-filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* SECTION 3 — PRODUCT CARDS & DETAILS */}
      <main className="catalog-main-content">
        <div className="catalog-content-container">
          <div className="catalog-products-grid">
            {filteredProducts.map((p) => {
              const IconComponent = p.icon;
              const isExpanded = expandedProduct === p.id;
              const encodedMsg = encodeURIComponent(p.whatsappMsg);
              const whatsappUrl = `${WHATSAPP_BASE}?text=${encodedMsg}`;
              const applyUrl = `/contact?product=${encodeURIComponent(p.name)}`;

              return (
                <article key={p.id} id={p.id} className="catalog-product-card">
                  <div className="card-top-header">
                    <div className="card-icon-wrap">
                      <IconComponent size={26} className="card-product-icon" />
                    </div>
                    <span className="card-product-badge">{p.badge}</span>
                  </div>

                  <h2 className="card-product-name">{p.name}</h2>
                  <p className="card-product-desc">{p.shortDesc}</p>

                  <div className="card-target-box">
                    <span className="target-label">Ideal For:</span>
                    <span className="target-value">{p.idealFor}</span>
                  </div>

                  <div className="card-benefits-preview">
                    <h3 className="section-mini-heading">Key Advantages</h3>
                    <ul className="mini-benefits-list">
                      {p.keyBenefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx}>
                          <CheckCircle size={15} className="bullet-icon" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="card-action-bar">
                    <Link to={applyUrl} className="btn-card-apply">
                      Apply Now
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-wa"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                    <button
                      type="button"
                      className="btn-card-doc"
                      onClick={() => openDocModal(p)}
                      title="View Required Documents"
                    >
                      <FileText size={16} /> Documents
                    </button>
                    <Link to="/financial-tools" className="btn-card-calc" title="Check Eligibility">
                      Eligibility
                    </Link>
                  </div>

                  {/* Expandable Details Toggle */}
                  <div className="card-details-accordion">
                    <button
                      type="button"
                      className="btn-accordion-toggle"
                      onClick={() => toggleExpand(p.id)}
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Hide Detailed Overview' : 'View Detailed Overview & Process'}</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isExpanded && (
                      <div className="accordion-body">
                        {/* 1. Overview */}
                        <div className="acc-section">
                          <h4 className="acc-heading">Product Overview</h4>
                          <p>{p.shortDesc} AVANI LOAN SERVICES provides hands-on documentation support and matches eligible borrowers with suitable bank schemes across Maharashtra.</p>
                        </div>

                        {/* 2. Common Uses */}
                        <div className="acc-section">
                          <h4 className="acc-heading">Common Uses</h4>
                          <ul className="acc-list">
                            {p.commonUses.map((use, uIdx) => (
                              <li key={uIdx}>{use}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. Key Benefits */}
                        <div className="acc-section">
                          <h4 className="acc-heading">Key Benefits</h4>
                          <ul className="acc-list">
                            {p.keyBenefits.map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. Typical Eligibility Factors */}
                        <div className="acc-section">
                          <h4 className="acc-heading">Typical Eligibility Factors</h4>
                          <ul className="acc-list">
                            {p.eligibilityFactors.map((f, fIdx) => (
                              <li key={fIdx}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 5. 5-Step Process */}
                        <div className="acc-section">
                          <h4 className="acc-heading">How It Works (5-Step Advisory)</h4>
                          <ol className="acc-process-steps">
                            <li><strong>Submit Enquiry:</strong> Share your basic loan requirement and profile online or via WhatsApp.</li>
                            <li><strong>Preliminary Eligibility Review:</strong> Our advisory team reviews income FOIR, banking, and CIBIL status.</li>
                            <li><strong>Documentation Guidance:</strong> Collect and organize required KYC, income, and business/property papers.</li>
                            <li><strong>Lender Processing:</strong> File submitted to the most suitable nationalized or private partner bank.</li>
                            <li><strong>Sanction & Disbursement:</strong> Loan sanction and fund disbursement subject to lender credit approval.</li>
                          </ol>
                        </div>

                        {/* CTA within details */}
                        <div className="acc-cta-row">
                          <Link to={applyUrl} className="catalog-btn catalog-btn-primary">
                            Apply for {p.name}
                          </Link>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="catalog-btn catalog-btn-whatsapp"
                          >
                            <MessageCircle size={16} /> WhatsApp Advisor
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      {/* SECTION 4 — TRUST SECTION */}
      <section className="catalog-trust-section">
        <div className="catalog-trust-container">
          <h2 className="trust-main-heading">Why Choose AVANI LOAN SERVICES?</h2>
          <p className="trust-main-subtitle">
            Reliable financial guidance backed by integrity, market expertise, and personalized advisory in Latur.
          </p>

          <div className="trust-pillars-grid">
            <div className="trust-pillar-card">
              <div className="pillar-icon-box"><ShieldCheck size={28} /></div>
              <h3>Independent Loan Consultancy</h3>
              <p>We work for you, not a single lender. We analyze multiple bank policies to recommend the most suitable option for your unique profile.</p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-box"><FileText size={28} /></div>
              <h3>Meticulous Documentation</h3>
              <p>Avoid credit bureau damage from repeated rejections. We verify your file, calculate FOIR ratios, and assemble documents before lender submission.</p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-box"><Clock size={28} /></div>
              <h3>Fast Processing Support</h3>
              <p>Fast-track processing assistance — subject to lender eligibility, documentation completeness, and credit underwriting approval.</p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-box"><MapPin size={28} /></div>
              <h3>Local Rooted Presence</h3>
              <p>Proudly based in Latur, Maharashtra. Personal guidance available directly from Founder Sachin Shinde at our Kulswamini Nagar office.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — SIMPLE 5-STEP LOAN PROCESS */}
      <section className="catalog-process-section">
        <div className="catalog-process-container">
          <h2 className="process-main-heading">Simple 5-Step Loan Assistance Process</h2>
          <div className="process-timeline">
            <div className="process-step">
              <div className="step-number">1</div>
              <h4>Tell Us Your Requirement</h4>
              <p>Choose the product and submit your basic requirements online or via WhatsApp.</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h4>Eligibility Assessment</h4>
              <p>Our team reviews your basic income, FOIR headroom, and credit health.</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h4>Documentation</h4>
              <p>Assemble and verify your KYC, bank statements, and relevant financial records.</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h4>Lender Processing</h4>
              <p>Application is evaluated according to partner bank underwriting guidelines.</p>
            </div>
            <div className="process-step">
              <div className="step-number">5</div>
              <h4>Decision & Disbursement</h4>
              <p>Approval and disbursement subject to the lender's final decision and terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FAQS */}
      <section className="catalog-faq-section">
        <div className="catalog-faq-container">
          <h2 className="faq-main-heading">Frequently Asked Questions</h2>
          <div className="faq-cards-list">
            <div className="faq-card">
              <h4 className="faq-question"><HelpCircle size={18} /> How do I apply for a loan through AVANI LOAN SERVICES?</h4>
              <p className="faq-answer">You can submit an online enquiry on our website, visit our office in Latur, or message our advisory desk directly on WhatsApp at +91 91756 35165.</p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question"><HelpCircle size={18} /> Can you check my loan eligibility before submitting an official bank application?</h4>
              <p className="faq-answer">Yes. We perform a preliminary eligibility review using FOIR and banking analysis. This helps evaluate your borrowing capacity without triggering multiple hard inquiries on your CIBIL report.</p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question"><HelpCircle size={18} /> What documents are commonly required for loan processing?</h4>
              <p className="faq-answer">Basic KYC (PAN, Aadhaar), 6 months bank statement, and income verification (Salary slips & Form 16 for salaried; 3 years ITR and GST returns for business owners). Specific requirements vary by product.</p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question"><HelpCircle size={18} /> Do you provide loans directly or act as a financial advisory service?</h4>
              <p className="faq-answer">AVANI LOAN SERVICES is an independent loan consultancy and advisory firm. We guide borrowers and facilitate loan applications through accredited nationalized banks, private financial institutions, and NBFCs.</p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question"><HelpCircle size={18} /> Is loan approval guaranteed?</h4>
              <p className="faq-answer">No. Final approval and sanction terms are solely determined by institutional lenders based on credit underwriting, applicant eligibility, property/security verification, and internal risk policies.</p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question"><HelpCircle size={18} /> Can I get education loan support for overseas higher studies?</h4>
              <p className="faq-answer">Yes. We assist students aiming for higher education in the USA, UK, Canada, Germany, and other countries with visa-compliant sanction letters, living expense planning, and lender documentation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — FOOTER CTA & CONTACT DETAILS */}
      <section className="catalog-contact-cta">
        <div className="catalog-cta-container">
          <h2>Need Help Choosing the Right Loan?</h2>
          <p>Talk directly with Founder Sachin Shinde and the AVANI LOAN SERVICES team.</p>

          <div className="cta-button-row">
            <a
              href={WHATSAPP_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-btn catalog-btn-whatsapp"
            >
              <MessageCircle size={18} /> WhatsApp Now (+91 91756 35165)
            </a>
            <Link to="/contact" className="catalog-btn catalog-btn-primary">
              Apply Online
            </Link>
            <Link to="/contact" className="catalog-btn catalog-btn-secondary">
              Contact Us
            </Link>
          </div>

          <div className="contact-details-bar">
            <div className="detail-item">
              <Phone size={18} />
              <span>+91 91756 35165</span>
            </div>
            <div className="detail-item">
              <Mail size={18} />
              <span>enquiry@avanifinserv.com</span>
            </div>
            <div className="detail-item">
              <MapPin size={18} />
              <span>Old Barshi Road, 5 No Chauk, Kulswamini Nagar, Latur – 413512</span>
            </div>
          </div>

          <div className="social-links-bar">
            <span className="social-label">Follow Us:</span>
            <a
              href="https://www.facebook.com/share/19Pvp8PqP2/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-anchor"
            >
              Facebook
            </a>
            <span className="social-sep">•</span>
            <a
              href="https://www.instagram.com/avanifinservlatur/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-anchor"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 8 — REGULATORY DISCLAIMER */}
      <footer className="catalog-disclaimer-section">
        <div className="catalog-disclaimer-container">
          <p>
            <strong>Disclaimer:</strong> AVANI LOAN SERVICES provides loan consultancy and advisory support. Loan approval, interest rate, tenure, loan amount, documentation and other terms are subject to lender policies, applicant eligibility, verification and final approval. Information on this website is for general guidance and does not constitute a guarantee of loan approval or disbursement.
          </p>
        </div>
      </footer>

      {/* MODAL: Required Documents Checklist */}
      {activeDocModal && (
        <div className="doc-modal-overlay" onClick={closeDocModal} role="dialog" aria-modal="true">
          <div className="doc-modal-window" onClick={e => e.stopPropagation()}>
            <div className="doc-modal-header">
              <h3>Required Documents — {activeDocModal.name}</h3>
              <button type="button" className="doc-modal-close" onClick={closeDocModal}>
                <X size={20} />
              </button>
            </div>
            <div className="doc-modal-body">
              <p className="doc-modal-intro">
                Please prepare the following general documents for preliminary review:
              </p>
              <ul className="doc-checklist">
                {activeDocModal.documents.map((doc, idx) => (
                  <li key={idx}>
                    <CheckCircle size={16} className="doc-check-icon" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
              <div className="doc-modal-disclaimer">
                Note: Exact documents vary by product, applicant profile and lender. This is a general checklist, not a final lender-specific document list.
              </div>
            </div>
            <div className="doc-modal-footer">
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent('Hello AVANI LOAN SERVICES, please send me the complete document checklist for ' + activeDocModal.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="catalog-btn catalog-btn-whatsapp"
              >
                <MessageCircle size={16} /> WhatsApp Me Checklist
              </a>
              <button type="button" className="catalog-btn catalog-btn-secondary" onClick={closeDocModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
