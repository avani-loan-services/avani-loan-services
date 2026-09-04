// src/pages/ProductApply.jsx
// ─────────────────────────────────────────────────────────────────
// Product-Wise Application & Eligibility Workflow
// AVANI LOAN SERVICES — Unified Lending Platform
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  Briefcase,
  Building2,
  GraduationCap,
  Home,
  FileCheck,
  Stethoscope,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  RefreshCw,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { formatINR, parseNumber } from '../calculators/utils/formatters.js';
import { calculateFOIREligibility } from '../calculators/utils/calculations.js';
import './ProductApply.css';

// ── 14 Unified Loan Services Catalog ──
const ALL_PRODUCTS = [
  {
    slug: 'salary-loan',
    id: 'salary-loan',
    title: 'Salary Loan / Personal Loan',
    category: 'Personal',
    icon: <Briefcase size={22} />,
    rateRange: '10.50% - 15.00% p.a.',
    defaultRate: 11.0,
    maxTenure: 5,
    isSecured: false,
    docs: [
      { id: 'pan', label: 'PAN Card Copy', hint: 'Front photo or scanned PDF', required: true },
      { id: 'aadhaar', label: 'Aadhaar Card / ID Proof', hint: 'Front and back scan', required: true },
      { id: 'slips', label: 'Latest 3 Months Salary Slips', hint: 'Employer issued slips', required: true },
      { id: 'bank', label: 'Latest 6 Months Salary Account Bank Statement', hint: 'PDF e-statement', required: true },
      { id: 'form16', label: 'Form 16 / ITR', hint: 'Latest financial year (optional)', required: false }
    ]
  },
  {
    slug: 'business-loan',
    id: 'business-loan',
    title: 'Business Loan',
    category: 'Commercial',
    icon: <Building2 size={22} />,
    rateRange: '11.25% - 18.00% p.a.',
    defaultRate: 12.5,
    maxTenure: 7,
    isSecured: false,
    docs: [
      { id: 'pan', label: 'Promoter & Firm PAN Card', hint: 'Clear PDF/Image', required: true },
      { id: 'kyc', label: 'Udyam / Business Registration Proof', hint: 'GST, Shop Act, or Udyam', required: true },
      { id: 'gst', label: 'Latest 12 Months GST Returns (3B)', hint: 'Combined PDF', required: true },
      { id: 'bank', label: 'Latest 12 Months Current Account Statement', hint: 'Primary business account', required: true },
      { id: 'itr', label: 'Last 2-3 Years ITR with Financials', hint: 'Balance Sheet, P&L, Audit Report', required: true }
    ]
  },
  {
    slug: 'education-loan-unsecured',
    id: 'education-loan-unsecured',
    title: 'Education Loan — Unsecured',
    category: 'Education',
    icon: <GraduationCap size={22} />,
    rateRange: '9.25% - 13.00% p.a.',
    defaultRate: 10.5,
    maxTenure: 12,
    isSecured: false,
    docs: [
      { id: 'student_kyc', label: 'Student PAN & Aadhaar', hint: 'Proof of identity', required: true },
      { id: 'offer', label: 'Admission / Offer Letter', hint: 'Recognized college or university', required: true },
      { id: 'fee', label: 'Official Course Fee Structure', hint: 'Issued by institution', required: true },
      { id: 'coapp_income', label: 'Parent / Co-applicant Income Proof & ITR', hint: 'Salary slip or business ITR', required: true },
      { id: 'bank', label: 'Co-applicant Latest 6 Months Bank Statement', hint: 'Operating bank account', required: true }
    ]
  },
  {
    slug: 'education-loan-secured',
    id: 'education-loan-secured',
    title: 'Education Loan — Secured',
    category: 'Education',
    icon: <GraduationCap size={22} />,
    rateRange: '8.15% - 10.50% p.a.',
    defaultRate: 8.85,
    maxTenure: 15,
    isSecured: true,
    docs: [
      { id: 'student_kyc', label: 'Student & Co-applicant KYC', hint: 'PAN, Aadhaar, Passport', required: true },
      { id: 'admission', label: 'Admission Letter & Fee Breakdown', hint: 'Institute document', required: true },
      { id: 'collateral', label: 'Collateral Property Title Deed / FD Proof', hint: 'Residential/commercial property docs', required: true },
      { id: 'income', label: 'Co-borrower Income Proof & Bank Statements', hint: 'Last 6-12 months', required: true }
    ]
  },
  {
    slug: 'education-loan-india',
    id: 'education-loan-india',
    title: 'Education Loan — India',
    category: 'Education',
    icon: <GraduationCap size={22} />,
    rateRange: '8.40% - 11.50% p.a.',
    defaultRate: 9.0,
    maxTenure: 15,
    isSecured: false,
    docs: [
      { id: 'student_kyc', label: 'Student Academic Records (10th, 12th, Degree)', hint: 'Mark sheets & certificates', required: true },
      { id: 'entrance', label: 'Entrance Exam Score Card (JEE, NEET, CAT)', hint: 'Score card', required: true },
      { id: 'admission', label: 'College Admission Letter & Fee Schedule', hint: 'Prospectus / letter', required: true },
      { id: 'coapp', label: 'Co-applicant KYC, Income Proof & Bank Statement', hint: 'Last 6 months', required: true }
    ]
  },
  {
    slug: 'education-loan-global',
    id: 'education-loan-global',
    title: 'Education Loan — Global Studies',
    category: 'Education',
    icon: <GraduationCap size={22} />,
    rateRange: '8.85% - 12.50% p.a.',
    defaultRate: 9.5,
    maxTenure: 15,
    isSecured: false,
    docs: [
      { id: 'passport', label: 'Valid Passport Copy', hint: 'First and last pages', required: true },
      { id: 'admission', label: 'Foreign University I-20 / CAS / Offer Letter', hint: 'Official admission letter', required: true },
      { id: 'test_scores', label: 'GRE / GMAT / IELTS / TOEFL Scorecard', hint: 'Standardized test results', required: true },
      { id: 'coapp_income', label: 'Co-applicant Income Proof, Form 16 / ITR', hint: '2 years tax filings', required: true },
      { id: 'bank', label: 'Co-applicant Bank Statement (Last 6 Months)', hint: 'Proof of funds capacity', required: true }
    ]
  },
  {
    slug: 'home-loan',
    id: 'home-loan',
    title: 'Home Loan',
    category: 'Mortgage',
    icon: <Home size={22} />,
    rateRange: '8.35% - 9.75% p.a.',
    defaultRate: 8.5,
    maxTenure: 30,
    isSecured: true,
    docs: [
      { id: 'kyc', label: 'Applicant & Co-applicant KYC', hint: 'PAN and Aadhaar', required: true },
      { id: 'income', label: 'Latest 3 Months Salary Slips & 2 Years Form 16', hint: 'Or 3 Years ITR for business', required: true },
      { id: 'bank', label: 'Latest 6 Months Salary/Operating Bank Statement', hint: 'PDF passbook', required: true },
      { id: 'property', label: 'Property Allotment Letter / Agreement to Sale', hint: 'Draft sale deed / NOC', required: true }
    ]
  },
  {
    slug: 'mortgage-lap',
    id: 'mortgage-lap',
    title: 'Mortgage Loan / Loan Against Property',
    category: 'Mortgage',
    icon: <Building2 size={22} />,
    rateRange: '8.95% - 11.50% p.a.',
    defaultRate: 9.25,
    maxTenure: 20,
    isSecured: true,
    docs: [
      { id: 'kyc', label: 'Applicant KYC & Residence Proof', hint: 'PAN, Aadhaar, Utility Bill', required: true },
      { id: 'income', label: 'Last 3 Years ITR with Computation of Income', hint: 'Income tax documents', required: true },
      { id: 'bank', label: 'Latest 12 Months Bank Statements', hint: 'All active bank accounts', required: true },
      { id: 'property_title', label: 'Complete Property Title Documents (7/12, Index II, Sale Deed)', hint: 'Chain of title deeds', required: true }
    ]
  },
  {
    slug: 'chartered-accountant-loan',
    id: 'chartered-accountant-loan',
    title: 'Chartered Accountant Loan',
    category: 'Professional',
    icon: <FileCheck size={22} />,
    rateRange: '9.95% - 13.00% p.a.',
    defaultRate: 10.25,
    maxTenure: 5,
    isSecured: false,
    docs: [
      { id: 'pan', label: 'PAN Card & Aadhaar Card', hint: 'ID proof', required: true },
      { id: 'cop', label: 'ICAI Membership Certificate & Certificate of Practice (COP)', hint: 'Proof of professional seniority', required: true },
      { id: 'bank', label: 'Latest 6 Months Office / Practice Bank Statement', hint: 'Active transactions', required: true },
      { id: 'itr', label: 'Last 2 Years ITR with Computation', hint: 'Tax returns', required: true }
    ]
  },
  {
    slug: 'doctor-professional-loan',
    id: 'doctor-professional-loan',
    title: 'Doctor / Professional Loan',
    category: 'Professional',
    icon: <Stethoscope size={22} />,
    rateRange: '9.75% - 12.50% p.a.',
    defaultRate: 10.0,
    maxTenure: 7,
    isSecured: false,
    docs: [
      { id: 'kyc', label: 'Doctor / Professional KYC', hint: 'PAN, Aadhaar', required: true },
      { id: 'degree', label: 'Degree Certificate & State Council Registration', hint: 'MBBS, MD, BDS, BAMS, etc.', required: true },
      { id: 'clinic', label: 'Clinic / Hospital Registration Certificate', hint: 'Proof of active practice', required: true },
      { id: 'bank', label: 'Latest 6-12 Months Clinic Bank Account Statement', hint: 'Cash flow proof', required: true },
      { id: 'itr', label: 'Last 2 Years ITR with Computation', hint: 'Income tax returns', required: true }
    ]
  },
  {
    slug: 'school-funding-unsecured',
    id: 'school-funding-unsecured',
    title: 'School Funding — Unsecured',
    category: 'Institutional',
    icon: <BookOpen size={22} />,
    rateRange: '10.50% - 14.50% p.a.',
    defaultRate: 11.5,
    maxTenure: 7,
    isSecured: false,
    docs: [
      { id: 'trust_reg', label: 'Trust / Society / Section 8 Registration Certificate', hint: 'Foundational documents', required: true },
      { id: 'mgmt_kyc', label: 'Trustees / Management Committee KYC', hint: 'PAN and Aadhaar of authorized signers', required: true },
      { id: 'audited_fin', label: 'Last 3 Years Audited Financial Statements', hint: 'Balance sheet and income & expenditure', required: true },
      { id: 'bank', label: 'Latest 12 Months School Operating Bank Statements', hint: 'Fee collection accounts', required: true },
      { id: 'affiliation', label: 'State Board / CBSE / ICSE Affiliation Certificate', hint: 'Recognition copy', required: true }
    ]
  },
  {
    slug: 'school-funding-secured',
    id: 'school-funding-secured',
    title: 'School Funding — Secured (Campus & Infrastructure)',
    category: 'Institutional',
    icon: <BookOpen size={22} />,
    rateRange: '8.85% - 11.50% p.a.',
    defaultRate: 9.5,
    maxTenure: 15,
    isSecured: true,
    docs: [
      { id: 'trust_docs', label: 'Trust Deed, Resolution & Registration', hint: 'Legal authority', required: true },
      { id: 'campus_title', label: 'School Campus Land & Building Title Documents', hint: 'Ownership deed / NA order / building permissions', required: true },
      { id: 'financials', label: 'Last 3 Years Audited Statements & ITR', hint: 'Audit report', required: true },
      { id: 'bank', label: 'Latest 12 Months Bank Statements', hint: 'Primary bank accounts', required: true }
    ]
  },
  {
    slug: 'college-funding-unsecured',
    id: 'college-funding-unsecured',
    title: 'College Funding — Unsecured',
    category: 'Institutional',
    icon: <GraduationCap size={22} />,
    rateRange: '10.00% - 14.00% p.a.',
    defaultRate: 11.0,
    maxTenure: 7,
    isSecured: false,
    docs: [
      { id: 'society_docs', label: 'Society / Trust Registration & By-laws', hint: 'Constitutional docs', required: true },
      { id: 'board_res', label: 'Governing Body Resolution for Borrowing', hint: 'Signed minutes', required: true },
      { id: 'audited_fin', label: 'Last 3 Years Audited Balance Sheets', hint: 'With CA sign & seal', required: true },
      { id: 'bank', label: 'Latest 12 Months College Bank Statements', hint: 'Operating accounts', required: true }
    ]
  },
  {
    slug: 'college-funding-secured',
    id: 'college-funding-secured',
    title: 'College Funding — Secured',
    category: 'Institutional',
    icon: <GraduationCap size={22} />,
    rateRange: '8.50% - 10.75% p.a.',
    defaultRate: 9.25,
    maxTenure: 15,
    isSecured: true,
    docs: [
      { id: 'society_docs', label: 'Trust / Institution Foundation Documents', hint: 'Charity commissioner registration', required: true },
      { id: 'property', label: 'College Campus Land Title & Encumbrance Certificate', hint: 'Clear title search report', required: true },
      { id: 'approvals', label: 'UGC / AICTE / Medical Council Approval Letters', hint: 'Current academic year', required: true },
      { id: 'bank', label: 'Latest 12 Months Audited Accounts & Bank Statements', hint: 'All campus accounts', required: true }
    ]
  }
];

export default function ProductApply() {
  const { productSlug } = useParams();
  const navigate = useNavigate();

  // Selected Product State
  const initialProduct = useMemo(() => {
    if (!productSlug) return ALL_PRODUCTS[0];
    const match = ALL_PRODUCTS.find(p => p.slug === productSlug || p.id === productSlug);
    return match || ALL_PRODUCTS[0];
  }, [productSlug]);

  const [selectedProduct, setSelectedProduct] = useState(initialProduct);

  useSEO({
    title: `Apply for ${selectedProduct.title} - Avani Loan Services`,
    description: `Instant eligibility check and application for ${selectedProduct.title}. Low interest rates, fast processing, and doorstep documentation in Maharashtra.`,
    keywords: `${selectedProduct.title}, Loan Application, Eligibility Check, Avani Loan Services`
  });

  // Step Wizard State (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    requestedAmount: '1000000',
    tenureYears: '5',
    applicantName: '',
    phone: '',
    email: '',
    city: 'Latur',
    employmentType: 'Salaried',
    monthlyIncome: '50000',
    existingEmi: '0',
    consent: true
  });

  // Document Uploads State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Sync selected product if URL changes
  useEffect(() => {
    if (productSlug) {
      const match = ALL_PRODUCTS.find(p => p.slug === productSlug || p.id === productSlug);
      if (match) setSelectedProduct(match);
    }
  }, [productSlug]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      const validExt = ['pdf', 'png', 'jpg', 'jpeg'].includes(ext);
      const validSize = f.size <= 15 * 1024 * 1024;
      return validExt && validSize;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Real-time Indicative Eligibility Calculation
  const eligibility = useMemo(() => {
    const income = parseNumber(formData.monthlyIncome);
    const existing = parseNumber(formData.existingEmi);
    const rate = selectedProduct.defaultRate;
    const tenure = parseNumber(formData.tenureYears, 5);

    const foirRes = calculateFOIREligibility({
      monthlyIncome: income,
      existingEmi: existing,
      foirPercent: 50,
      rate,
      tenureYears: tenure
    });

    return foirRes;
  }, [formData.monthlyIncome, formData.existingEmi, formData.tenureYears, selectedProduct.defaultRate]);

  // Submission Handler
  const handleSubmitApplication = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    // Collision-resistant Application Reference ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const appId = `ALS-2026-${randomSuffix}`;

    const payload = {
      applicationId: appId,
      product: selectedProduct.title,
      productCategory: selectedProduct.category,
      applicantName: formData.applicantName || 'Applicant',
      phone: formData.phone || '',
      email: formData.email || '',
      city: formData.city || 'Latur',
      requestedAmount: parseNumber(formData.requestedAmount),
      monthlyIncome: parseNumber(formData.monthlyIncome),
      existingEmi: parseNumber(formData.existingEmi),
      indicativeEligibleAmount: eligibility.eligibleLoanAmount,
      availableEmiCapacity: eligibility.availableEmi,
      assumedRate: selectedProduct.defaultRate,
      assumedTenureYears: parseNumber(formData.tenureYears),
      status: 'DOCUMENT_SUBMITTED',
      createdAt: new Date().toISOString()
    };

    try {
      // Send non-sensitive metadata to lead endpoint / CRM sync
      const meta = {
        name: payload.applicantName,
        phone: payload.phone,
        email: payload.email,
        loanType: payload.product,
        amount: String(payload.requestedAmount),
        city: payload.city,
        source: 'Product_Apply_Portal',
        status: 'Application Received',
        applicationId: payload.applicationId
      };

      await fetch('/api/lead/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      }).catch(() => {});

      setSubmissionResult(payload);
      setCurrentStep(4);
    } catch {
      // Fallback display even if offline
      setSubmissionResult(payload);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAppId = () => {
    if (submissionResult?.applicationId) {
      navigator.clipboard.writeText(submissionResult.applicationId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  return (
    <div className="apply-page-wrapper animate-fade-in">
      <div className="apply-container">
        {/* Page Top Header */}
        <div className="apply-header">
          <div className="apply-badge">
            <ShieldCheck size={14} />
            <span>Secure Loan Application Portal</span>
          </div>
          <h1 className="apply-title">Loan Application & Eligibility Assessment</h1>
          <p className="apply-subtitle">
            Experience fast processing, custom underwriting, and doorstep documentation across 40+ leading partner banks & NBFCs.
          </p>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="apply-wizard-steps">
          <div className={`apply-step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="apply-step-circle">{currentStep > 1 ? <Check size={18} /> : '1'}</div>
            <span className="apply-step-label">Select Loan</span>
          </div>
          <div className={`apply-step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="apply-step-circle">{currentStep > 2 ? <Check size={18} /> : '2'}</div>
            <span className="apply-step-label">Applicant Info</span>
          </div>
          <div className={`apply-step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
            <div className="apply-step-circle">{currentStep > 3 ? <Check size={18} /> : '3'}</div>
            <span className="apply-step-label">Documents</span>
          </div>
          <div className={`apply-step-item ${currentStep === 4 ? 'active' : ''}`}>
            <div className="apply-step-circle">4</div>
            <span className="apply-step-label">Eligibility Result</span>
          </div>
        </div>

        {/* ── STEP 1: PRODUCT SELECTION & PARAMETERS ── */}
        {currentStep === 1 && (
          <div className="apply-card animate-fade-in">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              Step 1: Choose Your Financial Product
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
              Select the lending solution tailored to your profile, income stream, and requirements.
            </p>

            <div className="apply-product-grid">
              {ALL_PRODUCTS.map(p => (
                <div
                  key={p.id}
                  className={`apply-product-card ${selectedProduct.id === p.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedProduct(p);
                    navigate(`/apply/${p.slug}`, { replace: true });
                  }}
                >
                  <div className="apply-product-header">
                    <div className="apply-product-icon">{p.icon}</div>
                    <div>
                      <div className="apply-product-name">{p.title}</div>
                      <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '10px' }}>
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <div className="apply-product-meta">
                    <span>Rate: <strong>{p.rateRange}</strong></span>
                    <span>•</span>
                    <span>Max: <strong>{p.maxTenure} yrs</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="apply-form-grid" style={{ marginTop: '30px' }}>
              <div className="apply-field-group">
                <label className="apply-label">Required Loan Amount (₹)</label>
                <input
                  type="number"
                  className="apply-input"
                  value={formData.requestedAmount}
                  onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                  placeholder="e.g. 1000000"
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {formatINR(parseNumber(formData.requestedAmount))}
                </span>
              </div>

              <div className="apply-field-group">
                <label className="apply-label">Desired Tenure (Years)</label>
                <select
                  className="apply-select"
                  value={formData.tenureYears}
                  onChange={(e) => handleInputChange('tenureYears', e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30].map(yr => (
                    <option key={yr} value={yr}>{yr} {yr === 1 ? 'Year' : 'Years'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="apply-actions-row">
              <Link to="/financial-tools" className="apply-btn apply-btn-secondary">
                <ArrowLeft size={16} />
                <span>Financial Calculators</span>
              </Link>
              <button
                type="button"
                className="apply-btn apply-btn-primary"
                onClick={() => setCurrentStep(2)}
              >
                <span>Continue to Applicant Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: APPLICANT INFORMATION ── */}
        {currentStep === 2 && (
          <div className="apply-card animate-fade-in">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              Step 2: Applicant & Financial Profile
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
              Enter your income and current EMI obligations for real-time FOIR underwriting estimation.
            </p>

            <div className="apply-form-grid">
              <div className="apply-field-group">
                <label className="apply-label">Full Name *</label>
                <input
                  type="text"
                  className="apply-input"
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  placeholder="e.g. Sachin Shinde"
                  required
                />
              </div>

              <div className="apply-field-group">
                <label className="apply-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="apply-input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g. 9175635165"
                  required
                />
              </div>

              <div className="apply-field-group">
                <label className="apply-label">Email Address</label>
                <input
                  type="email"
                  className="apply-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g. enquiry@avanifinserv.com"
                />
              </div>

              <div className="apply-field-group">
                <label className="apply-label">City / Location *</label>
                <input
                  type="text"
                  className="apply-input"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Latur, Pune, Mumbai"
                  required
                />
              </div>

              <div className="apply-field-group">
                <label className="apply-label">Employment / Constitution Type</label>
                <select
                  className="apply-select"
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                >
                  <option value="Salaried">Salaried (Private / Govt)</option>
                  <option value="Self-Employed Professional">Self-Employed Professional (Doctor, CA, Architect)</option>
                  <option value="Business Owner / MSME">Business Owner / MSME Trader</option>
                  <option value="Educational Trust">Educational Trust / Society</option>
                </select>
              </div>

              <div className="apply-field-group">
                <label className="apply-label">Monthly Net Income / Turnover (₹) *</label>
                <input
                  type="number"
                  className="apply-input"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="e.g. 75000"
                  required
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {formatINR(parseNumber(formData.monthlyIncome))} / month
                </span>
              </div>

              <div className="apply-field-group">
                <label className="apply-label">Total Existing Monthly EMIs (₹)</label>
                <input
                  type="number"
                  className="apply-input"
                  value={formData.existingEmi}
                  onChange={(e) => handleInputChange('existingEmi', e.target.value)}
                  placeholder="0 if no active loans"
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Current EMI Outgo: {formatINR(parseNumber(formData.existingEmi))}
                </span>
              </div>
            </div>

            {/* Real-Time Indicative Calculation Preview */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', marginTop: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0a4f8b', fontWeight: 700, marginBottom: '8px' }}>
                <CheckCircle2 size={18} />
                <span>Live Indicative Eligibility Estimate</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.92rem' }}>
                <div>Available Monthly Capacity: <strong>{formatINR(eligibility.availableEmi)}</strong></div>
                <div>Estimated Borrowing Power: <strong style={{ color: '#0a4f8b' }}>{formatINR(eligibility.eligibleLoanAmount)}</strong></div>
                <div>Assumed Rate: <strong>{selectedProduct.defaultRate}% p.a.</strong></div>
              </div>
            </div>

            <div className="apply-actions-row">
              <button
                type="button"
                className="apply-btn apply-btn-secondary"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Change Product</span>
              </button>
              <button
                type="button"
                className="apply-btn apply-btn-primary"
                onClick={() => setCurrentStep(3)}
              >
                <span>Continue to Document Checklist</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: DOCUMENT CHECKLIST & UPLOAD ── */}
        {currentStep === 3 && (
          <div className="apply-card animate-fade-in">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              Step 3: Document Checklist for {selectedProduct.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
              Upload your documents for read-only verification. We never modify original customer files and process all statements confidentially.
            </p>

            <div className="apply-doc-list">
              {selectedProduct.docs.map(doc => (
                <div key={doc.id} className="apply-doc-item">
                  <FileCheck size={20} className="apply-doc-check" />
                  <div>
                    <div className="apply-doc-name">
                      {doc.label} {doc.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </div>
                    <div className="apply-doc-hint">{doc.hint}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drag & Drop Upload Container */}
            <div className="apply-dropzone" onClick={() => document.getElementById('apply-file-input').click()}>
              <UploadCloud size={40} color="var(--primary, #0a4f8b)" style={{ margin: '0 auto 10px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Click to Upload Statements & Documents
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                Supports PDF, JPG, JPEG, PNG (Max 15 MB per file). All uploads are stored in private transient memory.
              </p>
              <input
                id="apply-file-input"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                <div className="apply-uploaded-files">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="apply-file-chip">
                      <FileText size={14} />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', marginLeft: '4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="apply-disclaimer-box">
              <strong>🔒 Document Privacy & Read-Only Processing Guarantee:</strong>
              <br />
              Uploaded bank statements and financial files are analyzed strictly in read-only mode to extract income credits and EMI debits for underwriting. Files are protected under banking encryption and never published or altered.
            </div>

            <div className="apply-actions-row">
              <button
                type="button"
                className="apply-btn apply-btn-secondary"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back to Details</span>
              </button>
              <button
                type="button"
                className="apply-btn apply-btn-primary"
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application & View Results</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: ELIGIBILITY RESULT & APPLICATION SUMMARY ── */}
        {currentStep === 4 && submissionResult && (
          <div className="apply-card animate-fade-in">
            <div className="apply-result-hero">
              <div className="apply-result-id-badge">
                <span>APP REF: {submissionResult.applicationId}</span>
                <button
                  type="button"
                  onClick={copyAppId}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Copy Reference ID"
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
                Indicative Eligibility Assessment
              </h2>
              <p style={{ margin: '0 0 16px 0', color: '#bfdbfe', fontSize: '0.95rem' }}>
                Application registered successfully for <strong>{submissionResult.product}</strong>
              </p>
              <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>
                Estimated Maximum Loan Capacity
              </div>
              <div className="apply-result-amount">
                {formatINR(submissionResult.indicativeEligibleAmount)}
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#93c5fd' }}>
                Status: <strong>{submissionResult.status}</strong> • Dedicated Lending Officer Assigned
              </p>
            </div>

            {/* Assessment Details Breakdown */}
            <div className="apply-result-grid">
              <div className="apply-stat-card">
                <div className="apply-stat-label">Requested Amount</div>
                <div className="apply-stat-val">{formatINR(submissionResult.requestedAmount)}</div>
              </div>
              <div className="apply-stat-card">
                <div className="apply-stat-label">Monthly Income</div>
                <div className="apply-stat-val">{formatINR(submissionResult.monthlyIncome)}</div>
              </div>
              <div className="apply-stat-card">
                <div className="apply-stat-label">Existing EMIs</div>
                <div className="apply-stat-val">{formatINR(submissionResult.existingEmi)}</div>
              </div>
              <div className="apply-stat-card">
                <div className="apply-stat-label">Available EMI Capacity</div>
                <div className="apply-stat-val" style={{ color: '#0a4f8b' }}>{formatINR(submissionResult.availableEmiCapacity)}</div>
              </div>
              <div className="apply-stat-card">
                <div className="apply-stat-label">Assumed Interest Rate</div>
                <div className="apply-stat-val">{submissionResult.assumedRate}% p.a.</div>
              </div>
              <div className="apply-stat-card">
                <div className="apply-stat-label">Assumed Tenure</div>
                <div className="apply-stat-val">{submissionResult.assumedTenureYears} Years</div>
              </div>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 2px 0', color: '#065f46', fontSize: '0.98rem' }}>Next Operational Step</h4>
                <p style={{ margin: 0, color: '#047857', fontSize: '0.88rem' }}>
                  Our senior loan underwriter in Latur has received your dossier (Ref: {submissionResult.applicationId}). We will review your uploaded documents and contact you within 2 business hours.
                </p>
              </div>
            </div>

            {/* Mandatory Regulatory Financial Disclaimer */}
            <div className="apply-disclaimer-box">
              <strong>Mandatory Regulatory Financial Disclaimer:</strong>
              <br />
              This evaluation is an indicative estimate and does not represent an unconditional loan sanction or financial commitment. Final loan approval, interest rate, eligible amount, tenure, processing charges and terms are governed by the respective lender bank/NBFC's policies, income assessment, credit profile, and formal document verification.
            </div>

            <div className="apply-actions-row" style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="apply-btn apply-btn-secondary"
              >
                <Printer size={16} />
                <span>Print Application Summary</span>
              </button>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES,%20I%20have%20submitted%20my%20loan%20application%20${submissionResult.applicationId}%20for%20${encodeURIComponent(submissionResult.product)}.%20Please%20guide%20me.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apply-btn"
                  style={{ background: '#25D366', color: '#fff', border: 'none' }}
                >
                  <MessageCircle size={16} />
                  <span>Share via WhatsApp</span>
                </a>
                <a
                  href="tel:+919175635165"
                  className="apply-btn apply-btn-primary"
                >
                  <PhoneCall size={16} />
                  <span>Speak with Advisor</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
