import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  Info,
  Building2,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Calculator,
  Home,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { generateWhatsAppDocumentLink, PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/avani-brand-logo.png';
import './Documents.css';

const DOCUMENT_CATEGORIES = [
  {
    id: 'personal-salaried',
    title: 'PERSONAL / SALARIED LOAN',
    icon: '💼',
    badge: 'Fast Track 24-48 Hours',
    summary: 'Documentation checklist for salaried corporate, IT, MNC, and government employees across Maharashtra.',
    prepInstructions: 'Provide the most recent 3 months payslips along with matching bank statement salary credits. Form 16 or ITR must reflect aggregate annual CTC accurately.',
    requiredDocs: [
      { name: 'PAN Card', note: 'Primary mandatory identification' },
      { name: 'Aadhaar Card', note: 'Linked with active mobile number for e-sign' },
      { name: 'Salary Slips (Last 3 Months)', note: 'Must display net pay, employer stamp/digital sign' },
      { name: 'Salary Account Bank Statements (Last 6 Months)', note: 'Original net banking PDF download with account details' },
      { name: 'Current Residence Proof', note: 'Electricity bill / Rental agreement / Passport' }
    ],
    optionalDocs: [
      { name: 'Form 16 (Part A & B, Last 2 Years)', note: 'Accelerates sanction and maximizes loan amount' },
      { name: 'Appointment / Offer Letter', note: 'Required if current employment duration is under 6 months' },
      { name: 'Existing Loan Sanction Letters', note: 'For debt consolidation or FOIR balance calculation' }
    ],
    applySlug: 'personal-loan'
  },
  {
    id: 'business-self-employed',
    title: 'BUSINESS / SELF-EMPLOYED LOAN',
    icon: '🏭',
    badge: 'MSME & SME Growth Capital',
    summary: 'Essential business entity, turnover, GST, and banking documentation for proprietors, partnerships, and private limited companies.',
    prepInstructions: 'Ensure 12 months GST returns tally with banking credits. Audit reports must be certified by an ICAI-registered Chartered Accountant.',
    requiredDocs: [
      { name: 'Entity Registration / Udyam MSME Certificate', note: 'Proof of business continuity (>1 year)' },
      { name: 'PAN Card (Individual & Business Entity)', note: 'Mandatory for all partners/directors' },
      { name: 'Aadhaar Card of Promoters/Proprietor', note: 'Identity and residence verification' },
      { name: 'Last 12 Months Current Account Bank Statements', note: 'All active business bank accounts in PDF format' },
      { name: 'GST Returns (GSTR-3B & GSTR-1, Last 12 Months)', note: 'Filed returns verifying official turnover' },
      { name: 'Last 2–3 Years ITR with Computation of Income', note: 'CA certified with Balance Sheet & P&L' }
    ],
    optionalDocs: [
      { name: 'Shop Act / Trade License', note: 'Local municipal business registration' },
      { name: 'Partnership Deed / MOA & AOA', note: 'Mandatory for LLPs and Pvt Ltd companies' },
      { name: 'Existing Sanction Letters / Repayment Tracks', note: 'Proves positive repayment discipline' }
    ],
    applySlug: 'business-loan'
  },
  {
    id: 'doctor-professional',
    title: 'DOCTOR / PROFESSIONAL LOAN',
    icon: '👨‍⚕️',
    badge: 'Custom Practice Financing',
    summary: 'Specialized low-documentation medical practitioner loans for MBBS, MD, MS, BDS, MDS, BAMS, and BHMS doctors.',
    prepInstructions: 'State medical council registration certificate and clinic/hospital trade license enable high-value collateral-free loan sanction.',
    requiredDocs: [
      { name: 'Medical Degree Certificate (MBBS / MD / BDS / BAMS / BHMS)', note: 'Highest medical qualification proof' },
      { name: 'State Medical Council Registration Certificate', note: 'Active license to practice in Maharashtra' },
      { name: 'PAN Card & Aadhaar Card of Doctor', note: 'Identity and address proof' },
      { name: 'Last 6–12 Months Bank Statements', note: 'Primary operative savings or current account' },
      { name: 'Last 2 Years ITR with Computation', note: 'Professional income verification' }
    ],
    optionalDocs: [
      { name: 'Clinic / Hospital Ownership or Rent Agreement', note: 'Proof of clinical establishment' },
      { name: 'Medical Equipment Proforma Invoice', note: 'Required if applying for medical equipment financing' },
      { name: 'IMA / Professional Association Membership', note: 'Supporting credential profile' }
    ],
    applySlug: 'doctor-loan'
  },
  {
    id: 'ca-professional',
    title: 'CA / PROFESSIONAL LOAN',
    icon: '📊',
    badge: 'ICAI Certified Professionals',
    summary: 'Unsecured credit lines and professional term loans for practicing Chartered Accountants and financial consultants.',
    prepInstructions: 'Active Certificate of Practice (COP) for 2+ years qualifies for pre-approved multi-lender credit limits without collateral.',
    requiredDocs: [
      { name: 'ICAI Membership Certificate', note: 'Verification of chartered accountant credential' },
      { name: 'Certificate of Practice (COP)', note: 'Proof of active independent practice' },
      { name: 'PAN & Aadhaar Card of Applicant', note: 'Primary identity verification' },
      { name: 'Last 6–12 Months Bank Statements', note: 'Primary professional operating account' },
      { name: 'Last 2 Years Income Tax Returns (ITR)', note: 'With audited computation sheets' }
    ],
    optionalDocs: [
      { name: 'Office Premises Title Deed / Rental Agreement', note: 'Place of professional practice' },
      { name: 'Firm Constitution / Partnership Deed', note: 'If operating as a CA partnership firm' }
    ],
    applySlug: 'ca-loan'
  },
  {
    id: 'home-loan',
    title: 'HOME LOAN',
    icon: '🏠',
    badge: 'Long-Term Property Financing',
    summary: 'Comprehensive documentation required for purchasing ready possession flats, under-construction apartments, or plot purchase + construction.',
    prepInstructions: 'Collect chain of title documents for the past 13–30 years. Society NOC and builder allotment letters must have authorized signatories.',
    requiredDocs: [
      { name: 'Registered Agreement for Sale / Allotment Letter', note: 'Primary property purchase agreement' },
      { name: 'Sanctioned Building Plan & Commencement Certificate (CC)', note: 'Municipal/Town Planning approval' },
      { name: 'Property Tax Receipts & Society Maintenance NOC', note: 'Up-to-date municipal tax clearance' },
      { name: 'Applicant & Co-Applicant KYC (PAN & Aadhaar)', note: 'Mandatory for all co-owners' },
      { name: 'Income Proof (Salary Slips / 3 Yrs ITR)', note: 'Based on employment classification' },
      { name: 'Last 6 Months Bank Statements', note: 'Reflecting down payment capability' }
    ],
    optionalDocs: [
      { name: 'Chain of Title Deeds (13–30 Years)', note: 'Essential for resale/individual house purchases' },
      { name: 'Architect Cost Estimate (For Self-Construction)', note: 'Required if building on personal plot' },
      { name: 'Encumbrance Certificate (Nil EC)', note: 'Confirms property is free from prior legal charges' }
    ],
    applySlug: 'home-loan'
  },
  {
    id: 'mortgage-lap',
    title: 'MORTGAGE / LAP (LOAN AGAINST PROPERTY)',
    icon: '🏦',
    badge: 'High-Value Secured Credit',
    summary: 'Unlock substantial capital against residential, commercial, or industrial property with extended 10–15 year tenures.',
    prepInstructions: 'Original title deed, mutation extract (7/12 or Akhiv Patrika), and approved map are required for technical valuation and legal title search.',
    requiredDocs: [
      { name: 'Original Title Deed / Sale Deed / Sanad', note: 'Proof of absolute unencumbered ownership' },
      { name: 'Extracts (7/12 & 8A / Property Card / PR Card)', note: 'Recent mutation records with applicant name' },
      { name: 'Approved Building / Layout Plan', note: 'Local planning authority approval' },
      { name: 'Applicant & Co-Borrower KYC Documents', note: 'PAN, Aadhaar, Photographs' },
      { name: 'Last 3 Years ITR with Audit Report', note: 'Financial repayment capacity' },
      { name: 'Last 12 Months Bank Statements', note: 'Operative account showing regular cash flows' }
    ],
    optionalDocs: [
      { name: 'Latest Property Tax Paid Receipt', note: 'Current financial year municipal receipt' },
      { name: 'NOC from Co-Owners / Legal Heirs', note: 'Required if property is jointly inherited' },
      { name: 'Existing Rent Agreements (If Commercial Asset)', note: 'For rental discounting assessment' }
    ],
    applySlug: 'mortgage-loan'
  },
  {
    id: 'education-loan-india',
    title: 'EDUCATION LOAN — INDIA',
    icon: '🎓',
    badge: 'Domestic Degree Financing',
    summary: 'Collateral-free and secured education loans for engineering, medical, MBA, law, and undergraduate degree courses across India.',
    prepInstructions: 'Keep entrance examination score card, college merit list, and formal institute fee schedule on university letterhead ready.',
    requiredDocs: [
      { name: 'Offer / Admission Letter from Institution', note: 'Confirmed seat allocation letter' },
      { name: 'Detailed Semester-Wise Fee Structure', note: 'Official fee breakdown on institute letterhead' },
      { name: 'Student Academic Records (10th, 12th, Degree Marksheets)', note: 'Certified copies with passing certificates' },
      { name: 'Student & Co-Applicant KYC (PAN & Aadhaar)', note: 'Parent/Guardian as primary co-borrower' },
      { name: 'Co-Applicant Income Proof (ITR / Salary Slips)', note: 'Demonstrates household repayment support' },
      { name: 'Co-Applicant 6 Months Bank Statement', note: 'Primary operational bank statement' }
    ],
    optionalDocs: [
      { name: 'Entrance Exam Score Card (JEE / NEET / CET / CAT)', note: 'Supports favorable interest concession' },
      { name: 'Scholarship / Fee Waiver Documentation', note: 'Deducted from gross required funding' },
      { name: 'Collateral Documents', note: 'Required only for loan amounts above ₹7.5–10 Lakhs' }
    ],
    applySlug: 'education-loan'
  },
  {
    id: 'education-loan-global',
    title: 'EDUCATION LOAN — GLOBAL STUDIES',
    icon: '✈️',
    badge: 'International University Studies',
    summary: 'Comprehensive overseas education funding covering tuition, living expenses, health insurance, and airfare for USA, UK, Canada, Europe, and Australia.',
    prepInstructions: 'Obtain university I-20 (USA), CAS (UK), or official unconditional admit letter. Verify foreign exchange visa compliance.',
    requiredDocs: [
      { name: 'Unconditional Admission Letter from Foreign University', note: 'Official university acceptance notice' },
      { name: 'I-20 Form (USA) / CAS Letter (UK) / COE (Australia)', note: 'Immigration & visa eligibility documentation' },
      { name: 'Valid Passport Copy of Student', note: 'Must have at least 18 months validity' },
      { name: 'Standardized Test Scores (GRE / GMAT / IELTS / TOEFL)', note: 'Mandatory test score transcripts' },
      { name: 'Co-Applicant KYC & 2–3 Years ITR', note: 'Financial sponsor verification' },
      { name: 'Co-Applicant 12 Months Bank Statements', note: 'Durable income verification' }
    ],
    optionalDocs: [
      { name: 'Collateral Property Title Papers', note: 'For secured overseas funding above ₹40–50 Lakhs' },
      { name: 'Scholarship / Assistantship Award Letter', note: 'TA/RA stipend documentation' },
      { name: 'Fixed Deposit / Liquid Investment Statements', note: 'Accepted by selected lenders as liquid collateral' }
    ],
    applySlug: 'education-loan'
  },
  {
    id: 'school-funding',
    title: 'SCHOOL FUNDING & INFRASTRUCTURE',
    icon: '🏫',
    badge: 'Institutional School Trusts',
    summary: 'Tailored institutional project finance for private schools, CBSE/ICSE institutions, and rural/urban educational trusts in Maharashtra.',
    prepInstructions: 'Trust deed must have valid registration with Charity Commissioner. Audited financials for the past 3 consecutive years are required.',
    requiredDocs: [
      { name: 'School Trust / Society Registration Certificate', note: 'Charity Commissioner / Registrar of Societies certificate' },
      { name: 'Board Affiliation NOC (CBSE / ICSE / State Board)', note: 'Official recognition and affiliation letters' },
      { name: 'Trust Property Deed / 30-Year Registered Land Lease', note: 'Title of school campus premises' },
      { name: 'Audited Financial Statements (Last 3 Years)', note: 'Balance Sheet, P&L, Audit Report of Trust' },
      { name: 'School Fee Collection Bank Statements (12 Months)', note: 'Main operational account showing fee receipts' },
      { name: 'Trustees / Management Committee KYC (PAN & Aadhaar)', note: 'Authorised signatories and president/secretary' }
    ],
    optionalDocs: [
      { name: 'Architect Construction / Expansion Estimate', note: 'For new classroom wings, lab, or auditorium' },
      { name: 'Smart Classroom / EdTech Equipment Vendor Quotations', note: 'For IT and laboratory infrastructure' },
      { name: 'School Bus / Fleet Vendor Invoices', note: 'For student transport vehicle financing' }
    ],
    applySlug: 'school-funding'
  },
  {
    id: 'college-funding',
    title: 'COLLEGE & HIGHER EDUCATION FUNDING',
    icon: '🏛️',
    badge: 'Degree Institutes & Universities',
    summary: 'Institutional debt capital for engineering colleges, medical institutes, pharmacy colleges, and polytechnics across Maharashtra.',
    prepInstructions: 'Statutory approvals (AICTE, NMC, UGC, PCI) and student fee intake registers must be submitted alongside 3-year audit balance sheets.',
    requiredDocs: [
      { name: 'College Trust / Society Deed & Constitution', note: 'Charity commissioner registration documents' },
      { name: 'Regulatory Approvals (UGC / AICTE / NMC / PCI / DTE)', note: 'Current academic year approval sanction' },
      { name: 'University Affiliation Letter', note: 'State university affiliation certification' },
      { name: 'Audited Balance Sheets & P&L (Last 3 Years)', note: 'Certified by registered Chartered Accountant' },
      { name: '12 Months Bank Statements (All Trust & College Accounts)', note: 'Operative accounts reflecting fee credits' },
      { name: 'Key Trustees & Management Council KYC', note: 'President, Secretary, and Treasurer credentials' }
    ],
    optionalDocs: [
      { name: 'Detailed Project Report (DPR) for Campus Expansion', note: 'Hostel, research laboratory, or sports complex' },
      { name: 'NAAC / NBA Accreditation Certificates', note: 'Qualifies for privileged institutional rates' },
      { name: 'Student Enrollment & Tuition Fee Intake Records', note: 'Last 3 academic intake cycles' }
    ],
    applySlug: 'college-funding'
  },
  {
    id: 'cibil-resolution',
    title: 'CIBIL / CREDIT PROFILE ASSESSMENT',
    icon: '🛡️',
    badge: 'Dispute & Correction Checklist',
    summary: 'Documentation required for credit bureau forensic review, resolving clerical reporting errors, and updating loan status with banks.',
    prepInstructions: 'Ensure closure letters or NOCs from previous lenders have exact loan account numbers matching the credit bureau record.',
    requiredDocs: [
      { name: 'Official Credit Report Copy (CIBIL / Experian / CRIF)', note: 'Latest credit bureau report PDF (if available)' },
      { name: 'PAN Card & Aadhaar Card', note: 'For verifying correct tax ID and demographic records' },
      { name: 'Bank Account Passbook / Statement', note: 'Showing accurate identity and clearing records' }
    ],
    optionalDocs: [
      { name: 'Loan Closure Certificate / No Objection Certificate (NOC)', note: 'From previous lenders for closed accounts' },
      { name: 'Bank Settlement Letter / Payment Receipts', note: 'If any past account was settled or restructured' },
      { name: 'Past Loan Sanction Letters', note: 'To reconcile reporting discrepancies' }
    ],
    applySlug: 'cibil-check'
  }
];

export default function Documents() {
  useSEO({
    title: 'Loan Document Checklists & Requirements | AVANI LOAN SERVICES',
    description: 'Complete public documentation checklist for Personal, Business, Doctor, Home, Mortgage, Education, School & College Funding loans in Latur & Maharashtra.',
    keywords: 'loan documents Latur, loan checklist Maharashtra, personal loan documents, business loan documents, home loan papers, school funding documents'
  });

  const [activeSearch, setActiveSearch] = useState('');
  const [expandedId, setExpandedId] = useState('personal-salaried');

  const filteredCategories = DOCUMENT_CATEGORIES.filter((cat) => {
    if (!activeSearch.trim()) return true;
    const query = activeSearch.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.summary.toLowerCase().includes(query) ||
      cat.requiredDocs.some((d) => d.name.toLowerCase().includes(query)) ||
      cat.optionalDocs.some((d) => d.name.toLowerCase().includes(query))
    );
  });

  const toggleAccordion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="documents-page">
      {/* ── Page Header ── */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Public Documentation Portal</span>
              <div className="page-header-address">
                Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India
              </div>
            </div>
          </div>
          <h1>Loan Documentation Checklists</h1>
          <p>
            Transparent, organized document checklists for every loan product. Prepare your paperwork with zero confusion and accelerate your loan approval.
          </p>
        </div>
      </section>

      {/* ── Search & Filter Bar ── */}
      <section className="docs-search-section">
        <div className="container">
          <div className="docs-search-wrapper glass-card">
            <div className="search-input-group">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                value={activeSearch}
                onChange={(e) => setActiveSearch(e.target.value)}
                placeholder="Search documents (e.g. PAN, GST, Salary slips, 7/12, Trust Deed, Degree)..."
                className="docs-search-input"
              />
              {activeSearch && (
                <button
                  type="button"
                  className="docs-clear-btn"
                  onClick={() => setActiveSearch('')}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="search-stats">
              Showing {filteredCategories.length} loan categories
            </div>
          </div>
        </div>
      </section>

      {/* ── Important Advisory Tip ── */}
      <section className="section" style={{ paddingBottom: '10px', paddingTop: '10px' }}>
        <div className="container">
          <div className="docs-tip glass-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#F0F9FF', borderLeft: '4px solid #0284C7', padding: '16px 20px', borderRadius: '8px' }}>
            <Sparkles size={24} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#091E3A', fontSize: '0.98rem' }}>Avani Expert Review Service:</strong>
              <p style={{ margin: '4px 0 8px 0', color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Unsure if your documents meet banking criteria? Send your paperwork securely for a <strong>free in-principle preliminary review</strong> by our experienced loan advisors before formal bank submission.
              </p>
              <a
                href="https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES,%20I%20would%20like%20a%20free%20document%20review%20for%20my%20loan%20application."
                target="_blank"
                rel="noopener noreferrer"
                className="tip-link"
                style={{ color: '#0052CC', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Send documents for free verification on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Documents Accordion List ── */}
      <section className="section">
        <div className="container">
          <div className="docs-list">
            {filteredCategories.map((category) => {
              const isOpen = expandedId === category.id;
              const whatsappLink = generateWhatsAppDocumentLink(category.title);

              return (
                <article key={category.id} id={category.id} className="doc-card glass-card" style={{ marginBottom: '20px' }}>
                  <button
                    type="button"
                    className="doc-header"
                    onClick={() => toggleAccordion(category.id)}
                    aria-expanded={isOpen}
                    style={{ width: '100%', cursor: 'pointer', textAlign: 'left', border: 'none', background: 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <span className="doc-icon" style={{ fontSize: '1.8rem' }}>{category.icon}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span className="doc-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#091E3A' }}>
                            {category.title}
                          </span>
                          <span style={{ background: '#E2E8F0', color: '#0F274A', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px' }}>
                            {category.badge}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                          {category.summary}
                        </p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={24} color="#0284C7" /> : <ChevronDown size={24} color="#64748B" />}
                  </button>

                  {isOpen && (
                    <div className="doc-body animate-fade-in" style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', marginTop: '14px' }}>
                      {/* Preparation Guideline Box */}
                      <div style={{ background: '#F8FAFC', borderLeft: '3px solid #0F274A', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
                        <strong style={{ color: '#0F274A', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Info size={16} /> Preparation Guideline:
                        </strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                          {category.prepInstructions}
                        </p>
                      </div>

                      {/* Required Documents */}
                      <div className="doc-category" style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#091E3A', fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={18} color="#16A34A" /> Mandatory / Required Documents
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                          {category.requiredDocs.map((doc, idx) => (
                            <li key={idx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '6px' }}>
                              <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem' }}>✅ {doc.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{doc.note}</div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Optional Documents */}
                      {category.optionalDocs && category.optionalDocs.length > 0 && (
                        <div className="doc-category" style={{ marginBottom: '20px' }}>
                          <h4 style={{ color: '#475569', fontSize: '0.92rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileCheck size={18} color="#0284C7" /> Optional / Supporting Documents (Enhances Approval)
                          </h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                            {category.optionalDocs.map((doc, idx) => (
                              <li key={idx} style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', padding: '10px 14px', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>🔹 {doc.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{doc.note}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '16px', lineHeight: '1.4' }}>
                        * Note: Specific documentation requests may vary depending on sanctioning bank, NBFC policy, borrower profile, and scheme guidelines.
                      </p>

                      {/* Actions Row */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', alignItems: 'center' }}>
                        <Link
                          to={`/contact?product=${encodeURIComponent(category.title)}`}
                          className="btn btn-primary"
                          style={{ fontSize: '0.88rem', padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          Apply for {category.title} <ArrowRight size={16} />
                        </Link>

                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{ background: '#25D366', color: '#FFFFFF', border: 'none', fontSize: '0.88rem', padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          aria-label={`Get ${category.title} checklist on WhatsApp`}
                        >
                          <MessageCircle size={16} />
                          📲 Get Checklist on WhatsApp
                        </a>

                        <a
                          href={PHONE_NUMBER}
                          className="btn btn-outline"
                          style={{ fontSize: '0.88rem', padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          aria-label={`Call Avani Loan Services for ${category.title}`}
                        >
                          <Phone size={16} />
                          📞 Call {DISPLAY_PHONE}
                        </a>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
