import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, MessageCircle, Phone, FileText, Globe, GraduationCap, Building2 } from 'lucide-react';
import { generateWhatsAppDocumentLink, PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/avani-brand-logo.png';
import './Loans.css';
import services from '../data/services.json';

// Import Images
import personalImg from '../assets/personal-loan.png';
import businessImg from '../assets/business-loan.png';
import educationImg from '../assets/education-loan.png';
import homeImg from '../assets/home-loan.png';
import mortgageImg from '../assets/mortgage-loan.png';
import doctorImg from '../assets/business-loan.png'; // Reusing business icon if doctor icon not available, or I should use a more specific one if possible, but I'll stick to a placeholder for now and could use generate_image if needed. Actually, let's use business-loan as a placeholder or search for one.

const loans = [
  {
    id: 'school-funding',
    image: educationImg,
    title: 'School Funding & Infrastructure Loan',
    tagline: 'Empowering Educational Institutions in Maharashtra',
    description: 'Comprehensive financial solutions for school trusts, private schools, and educational institutions for infrastructure expansion, Smart Classrooms, buses, and operational working capital.',
    minAmount: '₹5 Lakhs', maxAmount: '₹5 Crores',
    tenure: '12–120 months',
    rate: '9.5% – 14% p.a.',
    features: ['Trust / Society registration accepted', 'Smart Classroom & EdTech equipment funding', 'School bus & transport fleet finance', 'Working capital for staff salary & expansion', 'Attractive interest rates for rural & urban schools'],
  },
  {
    id: 'college-funding',
    image: educationImg,
    title: 'College & Higher Education Funding',
    tagline: 'Supporting Colleges, Universities & Professional Degree Students',
    description: 'Tailored funding for degree colleges, engineering/medical institutes, as well as high-value education loans for undergraduate and postgraduate students.',
    minAmount: '₹2 Lakhs', maxAmount: '₹10 Crores',
    tenure: 'Up to 15 years',
    rate: '8.5% – 13.5% p.a.',
    features: ['Institutional expansion funding', '100% tuition & hostel fee coverage for students', 'Special grants & subvention support', 'No collateral up to ₹7.5 Lakhs for students', 'Fast clearance for NAAC/UGC recognized colleges'],
  },
  {
    id: 'salary',
    image: personalImg,
    title: 'Salary / Personal Loan',
    tagline: 'Quick cash for salaried employees',
    description: 'Unsecured personal loan for government and private sector employees. No collateral required.',
    minAmount: '₹50,000', maxAmount: '₹50 Lakhs',
    tenure: '12–60 months',
    rate: '10.5% – 18% p.a.',
    features: ['No collateral needed', 'Instant approval for govt employees', 'Salary slip required', 'Minimum salary ₹15,000/month', 'Repayment via auto-EMI'],
  },
  {
    id: 'business',
    image: businessImg,
    title: 'Business Loan',
    tagline: 'Fuel your business growth',
    description: 'Unsecured business loans for MSMEs, proprietors, and small businesses in Maharashtra.',
    minAmount: '₹1 Lakh', maxAmount: '₹2 Crores',
    tenure: '12–84 months',
    rate: '12% – 24% p.a.',
    features: ['No collateral up to ₹50L', 'GST / ITR required', 'Bank statement last 12 months', 'Approval within 5 days', 'Balance transfer facility'],
  },
  {
    id: 'education-india',
    image: educationImg,
    title: 'Education Loan (India)',
    tagline: 'Invest in your future in India',
    description: 'Education loan for MBBS, Engineering, MBA at top Indian institutions with easy repayment.',
    minAmount: '₹1 Lakh', maxAmount: '₹75 Lakhs',
    tenure: 'Up to 15 years',
    rate: '8.15% – 12% p.a.',
    features: ['Covers tuition + hostel + books', 'Moratorium period available', 'Tax benefit u/s 80E', 'Co-applicant required', 'No margin for loans up to ₹4L'],
  },
  {
    id: 'education-global',
    image: educationImg,
    title: 'Education Loan (Study Abroad)',
    tagline: 'Study globally, repay easily',
    description: 'Fund your education at top universities in USA, UK, Canada, Australia, Germany, and more.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1.5 Crores',
    tenure: 'Up to 15 years',
    rate: '9% – 14% p.a.',
    features: ['GRE/IELTS not required for approval', 'Visa letter assistance', 'Covers living expenses abroad', 'Tax benefit u/s 80E', 'Collateral required above ₹40L'],
  },
  {
    id: 'home',
    image: homeImg,
    title: 'Home Loan',
    tagline: 'Own your dream home',
    description: 'Secured home loans for purchase, construction, or renovation of residential property.',
    minAmount: '₹5 Lakhs', maxAmount: '₹5 Crores',
    tenure: 'Up to 30 years',
    rate: '8.5% – 12% p.a.',
    features: ['Up to 90% of property value', 'PMAY subsidy available', 'Joint loan with spouse', 'Balance transfer benefits', 'Flexible repayment options'],
  },
  {
    id: 'mortgage',
    image: mortgageImg,
    title: 'Mortgage / LAP',
    tagline: 'Unlock your property value',
    description: 'Loan Against Property (LAP) for business or personal needs by pledging residential/commercial property.',
    minAmount: '₹5 Lakhs', maxAmount: '₹10 Crores',
    tenure: 'Up to 20 years',
    rate: '9% – 14% p.a.',
    features: ['Up to 70% of property value', 'Both residential & commercial', 'Minimal documentation', 'Income from all sources considered', 'Top-up loans available'],
  },
  {
    id: 'chartered-accountant',
    image: businessImg,
    title: 'Chartered Accountant Loan',
    tagline: 'Exclusively for CAs',
    description: 'Specialized professional loan for Chartered Accountants to expand their practice or meet personal needs.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1 Crore',
    tenure: '12–60 months',
    rate: '10.25% – 14.5% p.a.',
    features: [
      'Valid COP required',
      'ICAI Membership active',
      'No collateral required',
      'Special rates for CAs',
      'Quick approvals'
    ],
  },
  {
    id: 'doctor-professional',
    image: doctorImg,
    title: 'Doctor / Professional Loan',
    tagline: 'For Medical & Certified Professionals',
    description: 'Specialized loan for doctors, architects, and certified professionals to expand their practice, clinics, or personal needs.',
    minAmount: '₹5 Lakhs', maxAmount: '₹1 Crore',
    tenure: '12–84 months',
    rate: '10.25% – 14.5% p.a.',
    features: [
      'Degree / Registration required',
      'No collateral for equipment',
      'Special rates for professionals',
      'Flexible repayment options',
      'Minimum practice experience'
    ],
  },
  {
    id: 'car',
    image: mortgageImg,
    title: 'Car Loan',
    tagline: 'Drive your success',
    description: 'Finance your new or used car with flexible repayment options and competitive interest rates.',
    minAmount: '₹1 Lakh', maxAmount: '₹50 Lakhs',
    tenure: '12–84 months',
    rate: '7.5% – 12% p.a.',
    features: ['Up to 100% on-road funding', 'Used car loans available', 'Quick processing', 'Flexible EMIs', 'Minimal documentation'],
  }
];

export default function Loans() {
  useSEO({ title: 'Loans - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: 'Loans, Loan, Avani Finserv, Latur' });

  return (
    <div className="loans-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">All Loan Products</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Find the Right Loan for You</h1>
          <p>Explore all loan products with transparent rates, eligibility, and terms</p>
        </div>
      </section>

      {/* Quick Links to Service Landing Pages */}
      <section className="section">
        <div className="container">
          <h3>Explore Our Services</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {services.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="btn btn-outline">
                {s.h1}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="loans-detail-grid">
            {loans.map((loan) => (
              <div key={loan.id} id={loan.id} className="loan-detail-card glass-card animate-fade-in">
                <div className="ldc-image-wrapper">
                  <img src={loan.image} alt={loan.title} className="ldc-image" />
                </div>
                <div className="ldc-header">
                  <div>
                    <h2 className="ldc-title">{loan.title}</h2>
                    <p className="ldc-tagline">{loan.tagline}</p>
                  </div>
                </div>

                <p className="ldc-desc">{loan.description}</p>

                <div className="ldc-meta">
                  <div className="meta-item"><span className="meta-label">Min Amount</span><span className="meta-val">{loan.minAmount}</span></div>
                  <div className="meta-item"><span className="meta-label">Max Amount</span><span className="meta-val">{loan.maxAmount}</span></div>
                  <div className="meta-item"><span className="meta-label">Tenure</span><span className="meta-val">{loan.tenure}</span></div>
                  <div className="meta-item"><span className="meta-label">Interest Rate</span><span className="meta-val rate-val">{loan.rate}</span></div>
                </div>

                <ul className="ldc-features">
                  {loan.features.map((f, i) => (
                    <li key={i}><CheckCircle size={16} color="var(--primary)" /> {f}</li>
                  ))}
                </ul>

                <div className="ldc-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <Link to="/contact" state={{ loanType: loan.title }} className="btn btn-primary" style={{ flex: '1 1 auto', justifyContent: 'center' }}>
                    Apply for {loan.title} <ArrowRight size={16} />
                  </Link>
                  <a 
                    href={generateWhatsAppDocumentLink(loan.title)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn" 
                    style={{ background: '#25D366', color: '#fff', border: 'none', flex: '1 1 auto', justifyContent: 'center' }}
                    aria-label={`Get ${loan.title} document checklist on WhatsApp`}
                  >
                    <MessageCircle size={16} style={{ marginRight: '6px' }} />
                    📲 Get Document List on WhatsApp
                  </a>
                  <a 
                    href={PHONE_NUMBER} 
                    className="btn btn-outline" 
                    style={{ flex: '1 1 auto', justifyContent: 'center' }}
                    aria-label={`Call Avani Loan Services at 9175635165 for ${loan.title}`}
                  >
                    <Phone size={16} style={{ marginRight: '6px' }} />
                    📞 Call {DISPLAY_PHONE}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property & Comprehensive Documentation Guide */}
      <section className="section document-guide-section bg-light">
        <div className="container">
          
          {/* 1. PROPERTY DOCUMENTS GUIDE */}
          <div className="text-center" style={{ marginBottom: 40 }}>
            <span className="badge">Documentation Architecture</span>
            <h2 className="section-title">Home Loan & Mortgage Property Documents</h2>
            <p className="section-subtitle">Property documents required for Home Loans and Mortgage Loans / LAP vary across geographies and property types. Final requirement is confirmed after eligibility assessment.</p>
          </div>

          <div className="doc-section-block">
            <h3>A. Property Documents by Location</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>Governing authorities issue location-specific title and clearance documents:</p>
            <div className="doc-grid-3">
              <div className="doc-card">
                <div className="doc-card-icon">🌾</div>
                <h4>Rural Areas (Villages)</h4>
                <p className="doc-gov">Gov: Gram Panchayat / Revenue Dept</p>
                <ul className="doc-list sm">
                  <li><strong>7/12 Extract / Khata:</strong> Official land registry record.</li>
                  <li><strong>Form 8 / 8A Extract:</strong> Assessment register document.</li>
                  <li><strong>NA Permission:</strong> Required where agricultural land converted.</li>
                  <li><strong>Gram Panchayat NOC:</strong> Applicable official clearance.</li>
                  <li><strong>Certified Layout Sketch:</strong> Map certified by revenue authority.</li>
                </ul>
              </div>
              
              <div className="doc-card">
                <div className="doc-card-icon">🏡</div>
                <h4>Semi-Urban Areas (Towns)</h4>
                <p className="doc-gov">Gov: Municipal Councils</p>
                <ul className="doc-list sm">
                  <li><strong>Khata Certificate:</strong> Identifies owner in municipal records.</li>
                  <li><strong>Sanctioned Building Plan:</strong> Approved structural blueprint.</li>
                  <li><strong>Commencement Certificate:</strong> Construction permission (where applicable).</li>
                  <li><strong>Conversion Order:</strong> Valid land conversion documentation.</li>
                </ul>
              </div>

              <div className="doc-card">
                <div className="doc-card-icon">🏙️</div>
                <h4>Urban & Metro Cities</h4>
                <p className="doc-gov">Gov: Municipal Corporations</p>
                <ul className="doc-list sm">
                  <li><strong>Approved Building Blueprint:</strong> Sanctioned municipal layout plan.</li>
                  <li><strong>Occupancy Certificate (OC):</strong> Applicable for ready properties.</li>
                  <li><strong>Builder-Buyer Agreement:</strong> Registered Agreement for Sale.</li>
                  <li><strong>Society Share Certificate & NOC:</strong> Original share certificate & NOC.</li>
                  <li><strong>ULC Clearance:</strong> Applicable where required under land laws.</li>
                </ul>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '12px' }}>
              *Note: Exact requirements may vary by state, local authority, property type, and lender.
            </p>
          </div>

          <div className="doc-section-block" style={{ marginTop: 40 }}>
            <h3>B. Documents by Property Type</h3>
            <div className="doc-grid-3" style={{ marginTop: 20 }}>
              <div className="doc-card alt">
                <h4>🧱 Under-Construction Property</h4>
                <ul className="doc-list sm no-icon">
                  <li>RERA Registration Certificate</li>
                  <li>Allotment Letter</li>
                  <li>Registered Agreement for Sale</li>
                  <li>Sanctioned Building Plan & Layout</li>
                  <li>Commencement Certificate (CC)</li>
                  <li>Builder NOC</li>
                  <li>Tripartite Agreement (where applicable)</li>
                  <li>Demand Letters & Payment Receipts</li>
                </ul>
              </div>
              <div className="doc-card alt">
                <h4>🔄 Resale Property</h4>
                <ul className="doc-list sm no-icon">
                  <li>Original Sale Deed</li>
                  <li>Chain of Title Deeds</li>
                  <li>NOC from Housing Society</li>
                  <li>Share Certificate</li>
                  <li>Occupancy Certificate (OC, where applicable)</li>
                  <li>Encumbrance Certificate (EC, where applicable)</li>
                  <li>Latest Possession Letter</li>
                </ul>
              </div>
              <div className="doc-card alt">
                <h4>📐 Vacant Plot / Land</h4>
                <ul className="doc-list sm no-icon">
                  <li>Original Parent Deed / Allotment Document</li>
                  <li>Mutation Certificate (Khata / 7/12)</li>
                  <li>Non-Agricultural (NA) Conversion (where applicable)</li>
                  <li>Layout Approval Plan</li>
                  <li>Fencing / Demarcation Certificate (where applicable)</li>
                  <li>Land Tax Receipts</li>
                </ul>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
              <a 
                href={generateWhatsAppDocumentLink('Home Loan')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#25D366', color: '#fff' }}
                aria-label="Get Home Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Home Loan Document List on WhatsApp
              </a>
              <a 
                href={generateWhatsAppDocumentLink('Mortgage Loan / LAP')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#0052CC', color: '#fff' }}
                aria-label="Get Mortgage Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Mortgage / LAP Document List on WhatsApp
              </a>
            </div>
          </div>

          {/* 2. EDUCATION LOAN (INDIA) SECTION */}
          <div className="doc-section-block" style={{ marginTop: 60, background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <GraduationCap size={28} color="#0052CC" />
              <h3 style={{ margin: 0, color: '#1E293B' }}>Education Loan — India Document Checklist</h3>
            </div>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Comprehensive checklist for higher education studies in India (Engineering, Medical, MBA, etc.):</p>
            
            <div className="doc-grid-3">
              <div className="doc-card alt">
                <h4>A. Student Documents</h4>
                <ul className="doc-list sm no-icon">
                  <li>Aadhaar Card & PAN Card</li>
                  <li>Passport-size photographs</li>
                  <li>10th & 12th Standard Marksheets</li>
                  <li>Graduation Marksheets (if applicable)</li>
                  <li>Entrance Exam Scorecard (JEE, NEET, CAT, etc.)</li>
                  <li>Admission / Offer Letter from College</li>
                  <li>Official Course Fee Structure</li>
                  <li>Scholarship Letter (if applicable)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>B. Parent / Co-Applicant Documents</h4>
                <ul className="doc-list sm no-icon">
                  <li>Parent / Co-Applicant Aadhaar & PAN Card</li>
                  <li>Passport-size photographs & Address Proof</li>
                  <li>Last 3 Months Salary Slips (for salaried)</li>
                  <li>Last 6 Months Bank Statements</li>
                  <li>Form 16 / Income Tax Returns (last 2 yrs)</li>
                  <li>Business Registration & Financials (for self-employed)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>C. Institution Documents</h4>
                <ul className="doc-list sm no-icon">
                  <li>College Admission / Offer Letter</li>
                  <li>Detailed Fee Structure & Payment Schedule</li>
                  <li>Course Duration & Recognition Proof (UGC/AICTE)</li>
                  <li>Hostel & Miscellaneous Expense Estimate</li>
                  <li>Approved Education Expenses breakdown</li>
                </ul>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #0052CC' }}>
              *Note: Document requirements may vary by lender, applicant profile, course, institution, and loan structure. Final requirements will be confirmed after eligibility assessment.
            </p>

            <div style={{ marginTop: '20px' }}>
              <a 
                href={generateWhatsAppDocumentLink('Education Loan India')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#25D366', color: '#fff' }}
                aria-label="Get India Education Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get India Education Loan Document List on WhatsApp
              </a>
            </div>
          </div>

          {/* 3. EDUCATION LOAN (GLOBAL STUDIES) SECTION */}
          <div className="doc-section-block" style={{ marginTop: 40, background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Globe size={28} color="#0052CC" />
              <h3 style={{ margin: 0, color: '#1E293B' }}>Education Loan — Global Studies (Study Abroad)</h3>
            </div>
            <p style={{ color: '#0052CC', fontWeight: 'bold', marginBottom: '15px' }}>
              Supported Countries: USA | Canada | UK | Australia | Germany & More
            </p>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Comprehensive documentation required for foreign university education loans:</p>

            <div className="doc-grid-3">
              <div className="doc-card alt">
                <h4>A. Student KYC & Academic</h4>
                <ul className="doc-list sm no-icon">
                  <li>Valid Passport (mandatory)</li>
                  <li>Aadhaar Card & PAN Card</li>
                  <li>10th, 12th & Degree Marksheets</li>
                  <li>English Test Score (IELTS / TOEFL / PTE)</li>
                  <li>Standardized Test Scores (GRE / GMAT)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>B. Foreign University Admission</h4>
                <ul className="doc-list sm no-icon">
                  <li>University Offer / Admission Letter</li>
                  <li>I-20 (USA) / CAS (UK) / COE (Australia)</li>
                  <li>Tuition Fee Breakdown & Schedule</li>
                  <li>Estimated Living Expense Document</li>
                  <li>Scholarship / Grant Letter (if applicable)</li>
                </ul>
              </div>

              <div className="doc-card alt">
                <h4>C. Co-Applicant & Financials</h4>
                <ul className="doc-list sm no-icon">
                  <li>Parent / Co-applicant KYC (PAN & Aadhaar)</li>
                  <li>Income Proof (Salary Slips / ITR 2 yrs)</li>
                  <li>Parent Bank Statements (6–12 months)</li>
                  <li>Property Documents (if collateral loan)</li>
                  <li>Asset & Property Valuation Report</li>
                </ul>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '16px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #0052CC' }}>
              *Disclaimer: Global education loan document requirements vary by country, university, lender, course, collateral structure, and applicant profile. Final documentation will be confirmed after assessment.
            </p>

            <div style={{ marginTop: '20px' }}>
              <a 
                href={generateWhatsAppDocumentLink('Education Loan Global')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn"
                style={{ background: '#25D366', color: '#fff' }}
                aria-label="Get Global Education Loan document checklist on WhatsApp"
              >
                <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Global Education Loan Document List on WhatsApp
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
