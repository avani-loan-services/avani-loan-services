import useSEO from '../hooks/useSEO';
import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Phone } from 'lucide-react';
import { generateWhatsAppDocumentLink, PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/avani-brand-logo.png';
import PasswordGate from '../components/PasswordGate';
import './Documents.css';

const docs = [
  {
    title: 'School Funding & Education Infrastructure',
    icon: '🏫',
    items: [
      { category: 'School Entity Proof', list: ['School Trust / Society Registration', 'CBSE / ICSE / State Board Affiliation NOC', 'Property Trust Deed / Land Lease (30 yrs)'] },
      { category: 'Financial Documents', list: ['Audited Financial Statements (Last 3 Years)', 'School Fee Collection Bank Statements (12 Months)', 'Trustee / School Director KYC (PAN & Aadhaar)'] },
      { category: 'Project Estimate', list: ['Architect Construction / Renovation Estimate', 'EdTech & Equipment Supplier Invoices'] },
    ]
  },
  {
    title: 'College & Higher Education Funding',
    icon: '🏛️',
    items: [
      { category: 'College Entity & Trust Proof', list: ['Trust / Society Deed', 'UGC / AICTE / Medical Council Approval', 'Audit Reports (3 Years)'] },
      { category: 'Financial & Student Data', list: ['Annual Tuition Fee Intake Register', '12 Months Bank Statements (Main Operating Account)', 'Form 16 / Tax returns of Trustees'] },
    ]
  },
  {
    title: 'Salary / Personal Loan',
    icon: '💼',
    items: [
      { category: 'Identity Proof (Any 1)', list: ['Aadhaar Card', 'PAN Card', 'Passport', "Voter's ID"] },
      { category: 'Address Proof (Any 1)', list: ['Aadhaar Card', 'Utility Bill (last 3 months)', 'Driving License'] },
      { category: 'Income Documents', list: ['Last 3 months salary slips', 'Last 6 months bank statements', 'Form 16 (last 2 years)'] },
      { category: 'Employment Proof', list: ['Employee ID Card', 'Appointment Letter', 'Offer Letter (for new joinees)'] },
    ]
  },
  {
    title: 'Business Loan',
    icon: '🏭',
    items: [
      { category: 'Identity & Address Proof', list: ['PAN Card (Individual + Business)', 'Aadhaar Card', 'GST Registration Certificate'] },
      { category: 'Business Documents', list: ['Business Registration / Udyam Certificate', 'Shop & Establishment Certificate', 'Partnership Deed / MOA (if applicable)'] },
      { category: 'Financial Documents', list: ['Last 2 years ITR with CA stamp', 'Last 12 months bank statements', 'Last 2 years audited balance sheet'] },
    ]
  },
  {
    title: 'Education Loan (India)',
    icon: '🎓',
    items: [
      { category: 'Student Documents', list: ['Applicant KYC (Aadhaar & PAN Card)', 'Mark sheets (10th, 12th, Graduation)', 'Admission letter from college', 'Fee structure from institution'] },
      { category: 'Co-applicant Documents', list: ['Co-applicant KYC (PAN & Aadhaar)', 'Income proof of co-applicant', 'Bank statements (6 months)'] },
      { category: 'Additional', list: ['GRE/GATE score (if applicable)', 'Scholarship proof (if any)', 'Entrance exam result'] },
    ]
  },
  {
    title: 'Education Loan (Study Abroad)',
    icon: '✈️',
    items: [
      { category: 'Student Documents', list: ['Applicant KYC (Aadhaar & PAN Card)', 'Offer/admission letter from foreign university', 'Valid passport', 'Test scores (IELTS, TOEFL, GRE, GMAT)', 'Visa (if already obtained)'] },
      { category: 'Financial Documents', list: ['Co-applicant KYC (PAN & Aadhaar)', 'Co-applicant income proof', 'ITR (2 years)', 'Bank statements (1 year)', 'Property documents (if collateral loan)'] },
    ]
  },
  {
    title: 'Home Loan',
    icon: '🏠',
    items: [
      { category: 'Personal Documents', list: ['PAN Card', 'Aadhaar Card', 'Photograph', 'Co-applicant KYC (PAN, Aadhaar, Photo)'] },
      { category: 'Income Documents', list: ['Salary slips / ITR (2 years)', 'Form 16 / CA certified accounts', 'Bank statements (6 months)'] },
      { category: 'Property Documents', list: ['Sale agreement / allotment letter', 'Property title deed', 'NOC from builder/society', 'Approved building plan', 'Property tax receipts'] },
    ]
  },
  {
    title: 'Mortgage / LAP',
    icon: '🏦',
    items: [
      { category: 'Personal Documents', list: ['PAN Card', 'Aadhaar Card', 'Passport size photo', 'Co-applicant KYC (PAN, Aadhaar, Photo)'] },
      { category: 'Income Documents', list: ['Last 3 years ITR', 'Last 6 months bank statements', 'Business financials (if self-employed)'] },
      { category: 'Property Documents', list: ['Original title deed', 'Encumbrance certificate', 'Property tax receipts', 'NOC from co-owners if applicable', 'Valuation report'] },
    ]
  },
  {
    title: 'Chartered Accountant Loan',
    icon: '📊',
    items: [
      { category: 'Professional Documents', list: ['Certificate of Practice (COP)', 'ICAI Membership Certificate'] },
      { category: 'Identity & Address Proof', list: ['PAN Card', 'Aadhaar Card', 'Passport size photo'] },
      { category: 'Financial Documents', list: ['Last 2 years ITR', 'Last 6-12 months bank statements', 'Existing loan details (if any)'] },
    ]
  },
  {
    title: 'Doctor / Professional Loan',
    icon: '👨‍⚕️',
    items: [
      { category: 'Professional Documents', list: ['Degree Certificate', 'Registration Certificate (Old & New)', 'Clinic/Hospital Registration'] },
      { category: 'Identity & Address Proof', list: ['PAN Card', 'Aadhaar Card', 'Passport size photo'] },
      { category: 'Financial Documents', list: ['Last 2 years ITR', 'Last 6-12 months bank statements (Current & Savings)', 'Existing loan details (if any)'] },
    ]
  },
];

function DocAccordion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="doc-card glass-card">
      <button className="doc-header" onClick={() => setOpen(!open)}>
        <span className="doc-icon">{item.icon}</span>
        <span className="doc-title">{item.title}</span>
        {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
      </button>
      {open && (
        <div className="doc-body animate-fade-in">
          {item.items.map((cat, i) => (
            <div key={i} className="doc-category">
              <h4>{cat.category}</h4>
              <ul>
                {cat.list.map((d, j) => <li key={j}>✅ {d}</li>)}
              </ul>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #E2E8F0' }}>
            <a 
              href={generateWhatsAppDocumentLink(item.title)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn" 
              style={{ background: '#25D366', color: '#fff', border: 'none', fontSize: '0.85rem' }}
              aria-label={`Get ${item.title} document checklist on WhatsApp`}
            >
              <MessageCircle size={16} style={{ marginRight: '6px' }} />
              📲 Get Document List on WhatsApp
            </a>
            <a 
              href={PHONE_NUMBER} 
              className="btn btn-outline"
              style={{ fontSize: '0.85rem' }}
              aria-label={`Call Avani Loan Services at 9175635165 for ${item.title}`}
            >
              <Phone size={16} style={{ marginRight: '6px' }} />
              📞 Call {DISPLAY_PHONE}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Documents() {
  useSEO({ title: 'Documents Vault - Password Protected - Avani Loan Services', description: 'Mandatory documentation checklist for Home, Business, School Funding, and Education loans.', keywords: 'Documents, Loan, Avani Finserv, School Funding, Latur' });

  return (
    <PasswordGate title="Documents Vault - Authorized Access">
      <div>
        <section className="page-header">
          <div className="container">
            <div className="page-header-top">
              <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
              <div>
                <span className="badge">Documentation</span>
                <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
              </div>
            </div>
            <h1>Documents Required for Each Loan</h1>
            <p>Click on any loan type to see the exact documents you need to prepare</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="docs-tip glass-card">
              💡 <strong>Pro Tip:</strong> Start collecting these documents before applying. Our advisors will review your documents FREE and confirm your eligibility.
              <a href="https://wa.me/919175635165" target="_blank" rel="noopener noreferrer" className="tip-link"> WhatsApp your docs →</a>
            </div>
            <div className="docs-list">
              {docs.map((d, i) => <DocAccordion key={i} item={d} />)}
            </div>
          </div>
        </section>
      </div>
    </PasswordGate>
  );
}

