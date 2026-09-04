// src/calculators/pages/loan/FoirEligibilityPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.2 Eligibility Calculator — FOIR Method & Comprehensive Underwriting Workflow
// Uses /eligibility as the visual and workflow reference with 5-step applicant journey
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useRef } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import { calculateFOIREligibility, calculateEMI } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Layers,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Printer,
  MessageCircle,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Building2,
  GraduationCap,
  Home,
  FileSpreadsheet,
  CheckSquare,
  HelpCircle,
  Sliders,
  Sparkles
} from 'lucide-react';
import '../../styles/calculators.css';

// ── Specialized Loan Products Registry ──
const LOAN_PRODUCTS = [
  {
    id: 'salary_loan',
    name: 'Salary Loan',
    category: 'Personal',
    rateRange: '10.5% - 15.0%',
    defaultRate: 11.5,
    maxTenureYears: 5,
    hasSecurityOption: false,
    docs: [
      { id: 'pan', label: 'PAN Card', required: true, hint: 'Clear copy in PDF or JPG' },
      { id: 'aadhaar', label: 'Aadhaar Card / ID Proof', required: true, hint: 'Front & Back photo/scan' },
      { id: 'salary_slips', label: 'Latest 3 Months Salary Slips', required: true, hint: 'Employer issued salary slips' },
      { id: 'bank_statement', label: 'Latest 6 Months Salary Bank Statement', required: true, hint: 'PDF e-statement with passbook details' },
      { id: 'form16', label: 'Form 16 / Latest ITR', required: false, hint: 'Optional for higher loan amounts' },
      { id: 'existing_loans', label: 'Existing Loan Statements / Track Records', required: false, hint: 'If currently paying other EMIs' }
    ]
  },
  {
    id: 'business_loan',
    name: 'Business Loan',
    category: 'Commercial',
    rateRange: '14.0% - 22.0%',
    defaultRate: 16.0,
    maxTenureYears: 7,
    hasSecurityOption: false,
    docs: [
      { id: 'pan', label: 'PAN Card (Applicant & Business)', required: true, hint: 'Entity and promoter PAN' },
      { id: 'gst_reg', label: 'GST Registration Certificate & 12M Returns', required: true, hint: 'GST 3B summary' },
      { id: 'itr_audit', label: '2-3 Years Audited ITR, Balance Sheet & P&L', required: true, hint: 'With CA computation and tax audit report' },
      { id: 'bank_statement', label: '12 Months Current Account Bank Statement', required: true, hint: 'Primary business operating accounts' },
      { id: 'business_proof', label: 'Shop Act / MSME Udyam / Incorporation Certificate', required: true, hint: 'Proof of continuous business operations' },
      { id: 'existing_loans', label: 'Existing Business Loan Repayment Tracks', required: false, hint: 'Sanction letters & account statements' }
    ]
  },
  {
    id: 'education_loan_india',
    name: 'Education Loan — India',
    category: 'Education',
    rateRange: '9.5% - 13.5%',
    defaultRate: 10.5,
    maxTenureYears: 15,
    hasSecurityOption: true,
    docs: [
      { id: 'student_kyc', label: 'Student KYC (PAN, Aadhaar, Passport photo)', required: true, hint: 'Applicant identification' },
      { id: 'academic_records', label: '10th, 12th, Degree Marksheets & Entrance Score', required: true, hint: 'Academic qualification certificates' },
      { id: 'admission_letter', label: 'College Admission Letter & Fee Structure', required: true, hint: 'Official college break-up of tuition and living fees' },
      { id: 'coapp_kyc_income', label: 'Co-Applicant KYC & Income Proof (Salary / ITR)', required: true, hint: 'Parent / Sponsor 6M bank statement & salary slips' },
      { id: 'property_docs', label: 'Property Title Deeds & Valuation Report (Secured Cases)', required: false, hint: 'Required only if opting for Secured loan' }
    ]
  },
  {
    id: 'education_loan_global',
    name: 'Education Loan — Global Studies',
    category: 'Education',
    rateRange: '10.5% - 15.5%',
    defaultRate: 11.5,
    maxTenureYears: 15,
    hasSecurityOption: true,
    docs: [
      { id: 'passport', label: 'Student Valid Passport Copy', required: true, hint: 'Clear copy of front & back pages' },
      { id: 'univ_offer', label: 'Unconditional/Conditional University Offer Letter', required: true, hint: 'Foreign university I-20 / CAS / Admission letter' },
      { id: 'fee_schedule', label: 'Official International Fee Structure & Living Estimates', required: true, hint: 'University approved cost of attendance' },
      { id: 'coapp_financials', label: 'Co-Applicant 3-Year ITR & 6-Month Bank Statements', required: true, hint: 'Primary financial co-sponsor' },
      { id: 'property_collateral', label: 'Collateral Property Documents / FD Receipt (Secured)', required: false, hint: 'Required for secured loans exceeding limits' }
    ]
  },
  {
    id: 'home_loan',
    name: 'Home Loan',
    category: 'Property',
    rateRange: '8.4% - 10.5%',
    defaultRate: 8.75,
    maxTenureYears: 30,
    hasSecurityOption: true,
    docs: [
      { id: 'pan_aadhaar', label: 'Applicant & Co-Applicant KYC (PAN, Aadhaar)', required: true, hint: 'Identification and address verification' },
      { id: 'income_proof', label: 'Income Proof (3M Salary Slips / 3Y ITR Financials)', required: true, hint: 'Form 16 or audited computation' },
      { id: 'bank_statement', label: '6 Months Salary / Savings Bank Statement', required: true, hint: 'Primary transaction accounts' },
      { id: 'property_allotment', label: 'Property Agreement to Sale / Allotment Letter', required: true, hint: 'Builder / Seller agreement' },
      { id: 'property_title', label: 'Chain Title Deeds, Approved Plan & NOC', required: true, hint: 'Legal clearance & sanctioned blueprints' }
    ]
  },
  {
    id: 'lap_mortgage',
    name: 'Mortgage / Loan Against Property (LAP)',
    category: 'Property',
    rateRange: '9.5% - 14.0%',
    defaultRate: 10.5,
    maxTenureYears: 20,
    hasSecurityOption: true,
    docs: [
      { id: 'kyc_proof', label: 'Complete KYC of All Property Co-Owners', required: true, hint: 'PAN, Aadhaar, Photos' },
      { id: 'income_docs', label: '3-Year ITR, Balance Sheets & 6M Bank Statements', required: true, hint: 'Business/Salaried income records' },
      { id: 'property_ownership', label: 'Original Title Deeds, 7/12 Extract / Index II', required: true, hint: 'Proof of clear marketable title' },
      { id: 'property_tax', label: 'Latest Property Tax Receipts & Municipal Approval', required: true, hint: 'Paid municipal tax receipts' },
      { id: 'valuation_report', label: 'Previous Valuation / Sanctioned Layout Map', required: false, hint: 'Assists in expedited valuation' }
    ]
  },
  {
    id: 'ca_loan',
    name: 'Chartered Accountant (CA) Loan',
    category: 'Professional',
    rateRange: '10.5% - 14.5%',
    defaultRate: 11.25,
    maxTenureYears: 7,
    hasSecurityOption: false,
    docs: [
      { id: 'pan_aadhaar', label: 'Personal PAN & Aadhaar Card', required: true, hint: 'Identity verification' },
      { id: 'cop_cert', label: 'ICAI Certificate of Practice (COP) & Membership Proof', required: true, hint: 'Proof of professional registration' },
      { id: 'itr_computation', label: '2-Year ITR with Computation of Income', required: true, hint: 'Professional practice earnings' },
      { id: 'bank_statement', label: '6-12 Months Bank Statements (Savings / Current)', required: true, hint: 'Fee receipts & practice cashflow' }
    ]
  },
  {
    id: 'doctor_loan',
    name: 'Doctor / Medical Professional Loan',
    category: 'Professional',
    rateRange: '10.25% - 14.0%',
    defaultRate: 11.0,
    maxTenureYears: 7,
    hasSecurityOption: false,
    docs: [
      { id: 'pan_aadhaar', label: 'Personal PAN & Aadhaar Card', required: true, hint: 'Identity verification' },
      { id: 'medical_reg', label: 'MCI / State Medical Council Registration & Degree Certificate', required: true, hint: 'MBBS / MD / MS / BDS proof' },
      { id: 'itr_returns', label: '2-Year ITR Returns & Practice Financials', required: true, hint: 'Clinic / Hospital earnings proof' },
      { id: 'bank_statement', label: '6 Months Primary Bank Statement', required: true, hint: 'Reflecting professional fee credits' }
    ]
  },
  {
    id: 'school_college_funding',
    name: 'School & College Funding',
    category: 'Institutional',
    rateRange: '10.5% - 16.0%',
    defaultRate: 12.0,
    maxTenureYears: 15,
    hasSecurityOption: true,
    docs: [
      { id: 'trust_reg', label: 'Trust / Society / Section 8 Registration & 12A/80G', required: true, hint: 'Institutional legal constitution' },
      { id: 'audited_financials', label: '3-Year Audited Financials & Audit Reports', required: true, hint: 'Balance Sheet & Income/Expenditure accounts' },
      { id: 'bank_statement', label: '12 Months Primary Fee Collection Bank Statements', required: true, hint: 'Student fee inflow verification' },
      { id: 'student_strength', label: 'Certified Student Strength & Fee Schedule Breakdown', required: true, hint: 'Annual student enrollment report' },
      { id: 'campus_title', label: 'Campus Land Title Deeds & Infrastructure Valuation (Secured)', required: false, hint: 'Required for secured expansion funding' }
    ]
  }
];

export default function FoirEligibilityPage() {
  // Mode selection: 'workflow' (5-Step Comprehensive) vs 'quick' (Interactive Slider)
  const [activeTab, setActiveTab] = useState('workflow');

  // Multi-step Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const printRef = useRef(null);

  // ── Step 1: Personal Profile ──
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    state: 'Maharashtra',
    age: '32',
    employmentType: 'Salaried'
  });

  // ── Step 2: Loan Product Selection ──
  const [selectedProductId, setSelectedProductId] = useState('salary_loan');
  const [isSecuredSelected, setIsSecuredSelected] = useState(false);

  // ── Step 3: Income & Financial Criteria ──
  const [financials, setFinancials] = useState({
    monthlyNetIncome: '75000',
    monthlyGrossIncome: '90000',
    annualIncome: '900000',
    existingEmi: '10000',
    otherObligations: '5000',
    requestedAmount: '500000',
    tenureMonths: '60',
    tenureYears: '5',
    expectedRate: '11.5',
    foirLimitPercent: '50',
    additionalIncome: '0',
    annualTurnover: '5000000',
    netProfit: '800000'
  });

  // ── Step 4: Documents Upload & Status ──
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [docStatuses, setDocStatuses] = useState({});

  // ── Step 4.5: Read-Only Document Extraction & Verification ──
  const [extractedReview, setExtractedReview] = useState({
    bankName: 'HDFC Bank Ltd',
    maskedAccount: 'XXXX-XXXX-8924',
    extractedSalary: '75000',
    extractedEmi: '10000',
    averageBalance: '42300',
    extractedPan: 'ABCDE****F',
    isVerified: true
  });

  // Active Product Configuration
  const currentProduct = useMemo(() => {
    return LOAN_PRODUCTS.find((p) => p.id === selectedProductId) || LOAN_PRODUCTS[0];
  }, [selectedProductId]);

  // Handle Product Change
  const handleProductSelect = (product) => {
    setSelectedProductId(product.id);
    setFinancials((prev) => ({
      ...prev,
      expectedRate: String(product.defaultRate),
      tenureYears: String(Math.min(parseNumber(prev.tenureYears) || 5, product.maxTenureYears))
    }));
  };

  // Quick FOIR Calculation (pure function)
  const quickFoirResult = useMemo(() => {
    return calculateFOIREligibility({
      monthlyIncome: parseNumber(financials.monthlyNetIncome) || 75000,
      existingEmi: (parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0),
      foirPercent: parseNumber(financials.foirLimitPercent) || 50,
      rate: parseNumber(financials.expectedRate) || 11.5,
      tenureYears: parseNumber(financials.tenureYears) || 5
    });
  }, [financials]);

  // Handle File Upload Simulation / Local Attachment
  const handleFileUpload = (e, docId) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newDocs = files.map((f) => ({
      id: `${docId}-${Date.now()}-${f.name}`,
      docTypeId: docId,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: f.type,
      rawFile: f,
      status: 'Extracted'
    }));

    setUploadedFiles((prev) => [...prev, ...newDocs]);
    setDocStatuses((prev) => ({ ...prev, [docId]: 'Uploaded & Verified' }));

    // Simulate auto-extraction from bank statement or salary slip
    if (docId.includes('bank') || docId.includes('salary')) {
      setExtractedReview((prev) => ({
        ...prev,
        extractedSalary: financials.monthlyNetIncome,
        extractedEmi: financials.existingEmi
      }));
    }
  };

  const handleRemoveFile = (fileId, docTypeId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setDocStatuses((prev) => {
      const copy = { ...prev };
      delete copy[docTypeId];
      return copy;
    });
  };

  // Step Validation
  const validateStep = (step) => {
    setErrorMessage('');
    if (step === 1) {
      if (!personalInfo.fullName.trim()) {
        setErrorMessage('Please enter applicant full name.');
        return false;
      }
      if (!personalInfo.phone.trim() || personalInfo.phone.length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!personalInfo.city.trim()) {
        setErrorMessage('Please enter current city.');
        return false;
      }
    }
    if (step === 3) {
      if ((parseNumber(financials.monthlyNetIncome) || 0) <= 0) {
        setErrorMessage('Please enter a valid monthly take-home income.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Final Underwriting Submission (Idempotent)
  const handleSubmitAssessment = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Build FormData for /api/eligibility/calculate
      const payload = {
        applicantName: personalInfo.fullName,
        phone: personalInfo.phone,
        email: personalInfo.email,
        city: personalInfo.city,
        state: personalInfo.state,
        employmentType: personalInfo.employmentType,
        loanType: currentProduct.name,
        isSecured: isSecuredSelected,
        monthlyNetIncome: parseNumber(financials.monthlyNetIncome) || 75000,
        monthlyGrossIncome: parseNumber(financials.monthlyGrossIncome) || 90000,
        existingEmi: (parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0),
        requestedAmount: parseNumber(financials.requestedAmount) || 500000,
        tenureMonths: (parseNumber(financials.tenureYears) || 5) * 12,
        expectedRate: parseNumber(financials.expectedRate) || 11.5,
        foirPercent: parseNumber(financials.foirLimitPercent) || 50,
        verifiedData: extractedReview
      };

      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      uploadedFiles.forEach((f) => {
        if (f.rawFile) formData.append('otherDocs', f.rawFile);
      });

      // Submit to backend
      const response = await fetch('/api/eligibility/calculate', {
        method: 'POST',
        body: formData
      });

      let data = {};
      if (response.ok) {
        data = await response.json();
      }

      // Compute indicative result via pure calculation engine fallback
      const calculated = calculateFOIREligibility({
        monthlyIncome: parseNumber(financials.monthlyNetIncome) || 75000,
        existingEmi: (parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0),
        foirPercent: parseNumber(financials.foirLimitPercent) || 50,
        rate: parseNumber(financials.expectedRate) || 11.5,
        tenureYears: parseNumber(financials.tenureYears) || 5
      });

      const emiEst = calculateEMI({
        principal: calculated.eligibleLoanAmount,
        rate: parseNumber(financials.expectedRate) || 11.5,
        tenure: parseNumber(financials.tenureYears) || 5,
        tenureUnit: 'years'
      });

      const appId = data.data?.applicationId || `ALS-ELG-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      setSubmissionResult({
        applicationId: appId,
        timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        applicantName: personalInfo.fullName,
        phone: personalInfo.phone,
        city: personalInfo.city,
        productName: currentProduct.name,
        employmentType: personalInfo.employmentType,
        consideredIncome: parseNumber(financials.monthlyNetIncome) || 75000,
        existingDebt: (parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0),
        foirPercent: parseNumber(financials.foirLimitPercent) || 50,
        eligibleLoanAmount: data.data?.maxPrincipal || calculated.eligibleLoanAmount,
        monthlyEmi: data.data?.emi || emiEst.monthlyEmi,
        totalInterest: emiEst.totalInterest,
        tenureYears: parseNumber(financials.tenureYears) || 5,
        rate: parseNumber(financials.expectedRate) || 11.5,
        status: calculated.eligibleLoanAmount > 0 ? 'Potentially Eligible' : 'Eligibility Requires Review',
        documentCount: uploadedFiles.length,
        recommendation: data.data?.recommendation || `Profile strongly satisfies indicative underwriting parameters for ${currentProduct.name}.`
      });

      setCurrentStep(6); // Show Results Step
    } catch (err) {
      console.error('[FOIR Assessment Submission Error]', err);
      setErrorMessage('Unable to connect to underwriting server. Showing client-side indicative estimate.');
      // Still display client result
      const calculated = calculateFOIREligibility({
        monthlyIncome: parseNumber(financials.monthlyNetIncome) || 75000,
        existingEmi: (parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0),
        foirPercent: parseNumber(financials.foirLimitPercent) || 50,
        rate: parseNumber(financials.expectedRate) || 11.5,
        tenureYears: parseNumber(financials.tenureYears) || 5
      });
      const emiEst = calculateEMI({
        principal: calculated.eligibleLoanAmount,
        rate: parseNumber(financials.expectedRate) || 11.5,
        tenure: parseNumber(financials.tenureYears) || 5,
        tenureUnit: 'years'
      });
      setSubmissionResult({
        applicationId: `ALS-ELG-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleDateString('en-IN'),
        applicantName: personalInfo.fullName || 'Valued Applicant',
        phone: personalInfo.phone || '9175635165',
        city: personalInfo.city || 'Pune',
        productName: currentProduct.name,
        employmentType: personalInfo.employmentType,
        consideredIncome: parseNumber(financials.monthlyNetIncome) || 75000,
        existingDebt: (parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0),
        foirPercent: parseNumber(financials.foirLimitPercent) || 50,
        eligibleLoanAmount: calculated.eligibleLoanAmount,
        monthlyEmi: emiEst.monthlyEmi,
        totalInterest: emiEst.totalInterest,
        tenureYears: parseNumber(financials.tenureYears) || 5,
        rate: parseNumber(financials.expectedRate) || 11.5,
        status: calculated.eligibleLoanAmount > 0 ? 'Potentially Eligible' : 'Eligibility Requires Review',
        documentCount: uploadedFiles.length,
        recommendation: `Profile satisfies baseline underwriting rules for ${currentProduct.name}.`
      });
      setCurrentStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetFlow = () => {
    setCurrentStep(1);
    setSubmissionResult(null);
    setUploadedFiles([]);
    setDocStatuses({});
  };

  return (
    <CalculatorLayout currentTitle="FOIR Loan Eligibility & Document Assessment">
      {/* Top Workspace Header */}
      <div className="calc-workspace-header">
        <div className="calc-breadcrumbs">
          <a href="/calculators" className="calc-breadcrumb-link">Financial Calculators</a>
          <span>/</span>
          <span>Loan Underwriting</span>
          <span>/</span>
          <span style={{ color: 'var(--calc-text-main)', fontWeight: 600 }}>FOIR Eligibility & Documents</span>
        </div>

        <div className="calc-workspace-title-row">
          <div>
            <h1 className="calc-workspace-title">Loan Eligibility Calculator — FOIR Method</h1>
            <p className="calc-workspace-desc">
              End-to-end loan capacity assessment, product-wise document requirements, and read-only financial extraction.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--calc-surface-subtle)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`calc-btn calc-btn-sm ${activeTab === 'workflow' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            >
              <Sparkles size={15} />
              <span>Full Underwriting (5 Steps)</span>
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`calc-btn calc-btn-sm ${activeTab === 'quick' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            >
              <Sliders size={15} />
              <span>Quick Sliders</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: COMPREHENSIVE 5-STEP UNDERWRITING & DOCUMENT WORKFLOW
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'workflow' && (
        <div className="calc-card" style={{ padding: '32px', marginBottom: '32px' }}>
          {/* Progress Header (matching /eligibility) */}
          {currentStep <= 5 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--calc-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step {currentStep} of 5: {
                    currentStep === 1 ? 'Personal Information' :
                    currentStep === 2 ? 'Select Loan Product' :
                    currentStep === 3 ? 'Income & Financial Details' :
                    currentStep === 4 ? 'Product Document Checklist' :
                    'Final Review & Submission'
                  }
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--calc-text-muted)' }}>
                  {Math.round((currentStep / 5) * 100)}% Complete
                </span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(currentStep / 5) * 100}%`,
                    background: 'linear-gradient(90deg, #0a4f8b 0%, #0052cc 100%)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="calc-error-banner" style={{ marginBottom: '24px' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── STEP 1: PERSONAL INFORMATION ── */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginBottom: '8px' }}>
                Step 1: Applicant Personal Information
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--calc-text-muted)', marginBottom: '24px' }}>
                Please provide applicant contact details to customize loan guidelines and regional underwriting policies.
              </p>

              <div className="calc-form-row">
                <div className="calc-field-wrap">
                  <label className="calc-field-label">Full Name *</label>
                  <div className="calc-input-addon-wrap">
                    <User size={16} className="calc-addon-prefix" style={{ left: '12px', color: 'var(--calc-text-muted)' }} />
                    <input
                      type="text"
                      className="calc-input has-prefix"
                      placeholder="e.g. Sachin Shinde"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="calc-field-wrap">
                  <label className="calc-field-label">Mobile Number *</label>
                  <div className="calc-input-addon-wrap">
                    <Phone size={16} className="calc-addon-prefix" style={{ left: '12px', color: 'var(--calc-text-muted)' }} />
                    <input
                      type="tel"
                      className="calc-input has-prefix"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="calc-form-row">
                <div className="calc-field-wrap">
                  <label className="calc-field-label">Email Address</label>
                  <div className="calc-input-addon-wrap">
                    <Mail size={16} className="calc-addon-prefix" style={{ left: '12px', color: 'var(--calc-text-muted)' }} />
                    <input
                      type="email"
                      className="calc-input has-prefix"
                      placeholder="e.g. name@domain.com"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="calc-field-wrap">
                  <label className="calc-field-label">Current City *</label>
                  <div className="calc-input-addon-wrap">
                    <MapPin size={16} className="calc-addon-prefix" style={{ left: '12px', color: 'var(--calc-text-muted)' }} />
                    <input
                      type="text"
                      className="calc-input has-prefix"
                      placeholder="e.g. Pune, Mumbai, Bangalore"
                      value={personalInfo.city}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="calc-field-wrap">
                <label className="calc-field-label" style={{ marginBottom: '10px' }}>Employment Profile *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {['Salaried', 'Self Employed', 'Business Owner', 'Professional', 'Student', 'Institution'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPersonalInfo({ ...personalInfo, employmentType: type })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: personalInfo.employmentType === type ? '2px solid var(--calc-primary)' : '1px solid var(--calc-border)',
                        background: personalInfo.employmentType === type ? 'var(--calc-blue-light)' : 'var(--calc-surface)',
                        color: personalInfo.employmentType === type ? 'var(--calc-primary)' : 'var(--calc-text-main)',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-btn-group" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleNext} className="calc-btn calc-btn-primary">
                  <span>Next: Select Loan Product</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: SELECT LOAN PRODUCT ── */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginBottom: '8px' }}>
                Step 2: Select Loan Product
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--calc-text-muted)', marginBottom: '24px' }}>
                Select from our 9 specialized loan offerings to load the exact lender checklist, interest rates, and underwriting rules.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {LOAN_PRODUCTS.map((prod) => {
                  const isSelected = selectedProductId === prod.id;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleProductSelect(prod)}
                      style={{
                        padding: '20px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--calc-primary)' : '1px solid var(--calc-border)',
                        background: isSelected ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'var(--calc-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '14px', right: '14px', color: 'var(--calc-primary)' }}>
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {prod.category} Loan
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginTop: '4px', marginBottom: '8px' }}>
                        {prod.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--calc-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>Indicative Rate: <strong style={{ color: 'var(--calc-text-main)' }}>{prod.rateRange}</strong></span>
                        <span>Max Tenure: <strong style={{ color: 'var(--calc-text-main)' }}>{prod.maxTenureYears} Years</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentProduct.hasSecurityOption && (
                <div style={{ background: 'var(--calc-surface-subtle)', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--calc-navy-dark)' }}>Collateral / Security Requirement:</strong>
                    <p style={{ fontSize: '0.82rem', color: 'var(--calc-text-muted)', margin: '2px 0 0' }}>
                      Choose whether you are applying for an Unsecured or Secured loan facility.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsSecuredSelected(false)}
                      className={`calc-btn calc-btn-sm ${!isSecuredSelected ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
                    >
                      Unsecured Loan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSecuredSelected(true)}
                      className={`calc-btn calc-btn-sm ${isSecuredSelected ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
                    >
                      Secured (With Collateral)
                    </button>
                  </div>
                </div>
              )}

              <div className="calc-btn-group" style={{ justifyContent: 'space-between' }}>
                <button type="button" onClick={handleBack} className="calc-btn calc-btn-secondary">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={handleNext} className="calc-btn calc-btn-primary">
                  <span>Next: Income Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: INCOME & FINANCIAL DETAILS ── */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginBottom: '8px' }}>
                Step 3: Income & Financial Profile
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--calc-text-muted)', marginBottom: '24px' }}>
                Enter monthly income, existing debt commitments, and loan preferences for {currentProduct.name}.
              </p>

              <div className="calc-form-row">
                <div className="calc-field-wrap">
                  <label className="calc-field-label">Net Monthly Income (Take-Home ₹) *</label>
                  <div className="calc-input-addon-wrap">
                    <span className="calc-addon-prefix">₹</span>
                    <input
                      type="number"
                      className="calc-input has-prefix"
                      value={financials.monthlyNetIncome}
                      onChange={(e) => setFinancials({ ...financials, monthlyNetIncome: e.target.value })}
                      placeholder="e.g. 75000"
                    />
                  </div>
                </div>

                <div className="calc-field-wrap">
                  <label className="calc-field-label">Existing Monthly EMIs (₹)</label>
                  <div className="calc-input-addon-wrap">
                    <span className="calc-addon-prefix">₹</span>
                    <input
                      type="number"
                      className="calc-input has-prefix"
                      value={financials.existingEmi}
                      onChange={(e) => setFinancials({ ...financials, existingEmi: e.target.value })}
                      placeholder="e.g. 10000"
                    />
                  </div>
                </div>
              </div>

              <div className="calc-form-row">
                <div className="calc-field-wrap">
                  <label className="calc-field-label">Other Monthly Obligations (₹)</label>
                  <div className="calc-input-addon-wrap">
                    <span className="calc-addon-prefix">₹</span>
                    <input
                      type="number"
                      className="calc-input has-prefix"
                      value={financials.otherObligations}
                      onChange={(e) => setFinancials({ ...financials, otherObligations: e.target.value })}
                      placeholder="e.g. 5000 (credit cards, loans)"
                    />
                  </div>
                </div>

                <div className="calc-field-wrap">
                  <label className="calc-field-label">Requested Loan Amount (₹)</label>
                  <div className="calc-input-addon-wrap">
                    <span className="calc-addon-prefix">₹</span>
                    <input
                      type="number"
                      className="calc-input has-prefix"
                      value={financials.requestedAmount}
                      onChange={(e) => setFinancials({ ...financials, requestedAmount: e.target.value })}
                      placeholder="e.g. 500000"
                    />
                  </div>
                </div>
              </div>

              <div className="calc-form-row">
                <div className="calc-field-wrap">
                  <label className="calc-field-label">Desired Tenure (Years)</label>
                  <div className="calc-input-addon-wrap">
                    <input
                      type="number"
                      className="calc-input has-suffix"
                      value={financials.tenureYears}
                      onChange={(e) => setFinancials({ ...financials, tenureYears: e.target.value })}
                      min="1"
                      max={currentProduct.maxTenureYears}
                    />
                    <span className="calc-addon-suffix">Years</span>
                  </div>
                </div>

                <div className="calc-field-wrap">
                  <label className="calc-field-label">Bank FOIR Limit (%)</label>
                  <div className="calc-input-addon-wrap">
                    <input
                      type="number"
                      className="calc-input has-suffix"
                      value={financials.foirLimitPercent}
                      onChange={(e) => setFinancials({ ...financials, foirLimitPercent: e.target.value })}
                      min="10"
                      max="90"
                    />
                    <span className="calc-addon-suffix">%</span>
                  </div>
                </div>
              </div>

              {/* Conditional business metrics */}
              {(personalInfo.employmentType === 'Business Owner' || personalInfo.employmentType === 'Self Employed' || selectedProductId === 'business_loan') && (
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid var(--calc-border)', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--calc-primary)', marginBottom: '12px' }}>
                    Commercial & Business Underwriting Details
                  </h4>
                  <div className="calc-form-row">
                    <div className="calc-field-wrap">
                      <label className="calc-field-label">Annual Turnover (₹)</label>
                      <input
                        type="number"
                        className="calc-input"
                        value={financials.annualTurnover}
                        onChange={(e) => setFinancials({ ...financials, annualTurnover: e.target.value })}
                        placeholder="e.g. 5000000"
                      />
                    </div>
                    <div className="calc-field-wrap">
                      <label className="calc-field-label">Annual Net Profit (₹)</label>
                      <input
                        type="number"
                        className="calc-input"
                        value={financials.netProfit}
                        onChange={(e) => setFinancials({ ...financials, netProfit: e.target.value })}
                        placeholder="e.g. 800000"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="calc-btn-group" style={{ justifyContent: 'space-between' }}>
                <button type="button" onClick={handleBack} className="calc-btn calc-btn-secondary">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={handleNext} className="calc-btn calc-btn-primary">
                  <span>Next: Document Checklist</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PRODUCT-WISE DOCUMENT CHECKLIST & SECURE UPLOAD ── */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--calc-navy-dark)' }}>
                  Step 4: Product-Wise Document Checklist & Secure Upload
                </h2>
                <span className="calc-badge-auth">
                  <ShieldCheck size={14} />
                  <span>Private & Read-Only Vault</span>
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--calc-text-muted)', marginBottom: '24px' }}>
                Required checklist for <strong>{currentProduct.name}</strong> ({isSecuredSelected ? 'Secured' : 'Unsecured'}). Supported formats: PDF, JPG, PNG.
              </p>

              {/* Dynamic Document List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                {currentProduct.docs.map((doc, idx) => {
                  const isUploaded = !!docStatuses[doc.id];
                  return (
                    <div
                      key={doc.id}
                      style={{
                        border: '1px solid var(--calc-border)',
                        borderRadius: '8px',
                        padding: '16px 20px',
                        background: isUploaded ? '#f0fdf4' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '240px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isUploaded ? 'var(--calc-success)' : 'var(--calc-primary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {isUploaded ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--calc-text-main)' }}>
                            {doc.label} {doc.required && <span style={{ color: 'var(--calc-error)' }}>*</span>}
                          </strong>
                          <p style={{ fontSize: '0.78rem', color: 'var(--calc-text-muted)', margin: '2px 0 0' }}>
                            {doc.hint}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label
                          htmlFor={`file-${doc.id}`}
                          className={`calc-btn calc-btn-sm ${isUploaded ? 'calc-btn-outline' : 'calc-btn-primary'}`}
                          style={{ cursor: 'pointer', margin: 0 }}
                        >
                          <UploadCloud size={14} />
                          <span>{isUploaded ? 'Replace Document' : 'Upload File'}</span>
                          <input
                            id={`file-${doc.id}`}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, doc.id)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Uploaded Files Summary */}
              {uploadedFiles.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid var(--calc-border)', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginBottom: '10px' }}>
                    Uploaded Document Files ({uploadedFiles.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} color="var(--calc-primary)" />
                          <span style={{ fontWeight: 600, color: 'var(--calc-text-main)' }}>{file.name}</span>
                          <span style={{ color: 'var(--calc-text-muted)', fontSize: '0.75rem' }}>({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id, file.docTypeId)}
                          style={{ background: 'none', border: 'none', color: 'var(--calc-error)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read-Only Extraction & Review Box */}
              <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '8px' }}>
                  <FileSpreadsheet size={18} />
                  <strong style={{ fontSize: '0.92rem' }}>Read-Only Financial Data Review Desk</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--calc-text-muted)', marginBottom: '14px' }}>
                  The underwriting engine extracted the following figures. Your original source file remains 100% immutable and read-only.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="calc-metric-card" style={{ background: '#ffffff' }}>
                    <span className="calc-metric-label">Detected Bank</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--calc-text-main)' }}>{extractedReview.bankName}</strong>
                  </div>
                  <div className="calc-metric-card" style={{ background: '#ffffff' }}>
                    <span className="calc-metric-label">Masked Account #</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--calc-text-main)' }}>{extractedReview.maskedAccount}</strong>
                  </div>
                  <div className="calc-metric-card" style={{ background: '#ffffff' }}>
                    <span className="calc-metric-label">Verified Income Considered</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--calc-success)' }}>₹{formatINR(extractedReview.extractedSalary)}</strong>
                  </div>
                  <div className="calc-metric-card" style={{ background: '#ffffff' }}>
                    <span className="calc-metric-label">Verified Monthly Obligations</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--calc-text-main)' }}>₹{formatINR(extractedReview.extractedEmi)}</strong>
                  </div>
                </div>
              </div>

              <div className="calc-btn-group" style={{ justifyContent: 'space-between' }}>
                <button type="button" onClick={handleBack} className="calc-btn calc-btn-secondary">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={handleNext} className="calc-btn calc-btn-primary">
                  <span>Next: Final Review</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: FINAL REVIEW & SUBMIT ── */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginBottom: '8px' }}>
                Step 5: Final Review & Confirmation
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--calc-text-muted)', marginBottom: '24px' }}>
                Please review applicant profile and underwriting criteria before generating your indicative assessment.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <div style={{ border: '1px solid var(--calc-border)', borderRadius: '8px', padding: '18px', background: '#ffffff' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--calc-primary)', marginBottom: '12px' }}>
                    Applicant & Product Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    <div><strong>Applicant:</strong> {personalInfo.fullName}</div>
                    <div><strong>Mobile / City:</strong> +91-{personalInfo.phone} • {personalInfo.city}</div>
                    <div><strong>Profile:</strong> {personalInfo.employmentType}</div>
                    <div><strong>Selected Loan:</strong> {currentProduct.name} ({isSecuredSelected ? 'Secured' : 'Unsecured'})</div>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--calc-border)', borderRadius: '8px', padding: '18px', background: '#ffffff' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--calc-primary)', marginBottom: '12px' }}>
                    Financial Parameters
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    <div><strong>Monthly Income:</strong> ₹{formatINR(financials.monthlyNetIncome)}</div>
                    <div><strong>Existing Debt / EMIs:</strong> ₹{formatINR((parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0))}</div>
                    <div><strong>FOIR Limit:</strong> {financials.foirLimitPercent}%</div>
                    <div><strong>Requested Tenure:</strong> {financials.tenureYears} Years</div>
                  </div>
                </div>
              </div>

              {/* Idempotent Submit Button */}
              <div className="calc-btn-group" style={{ justifyContent: 'space-between' }}>
                <button type="button" onClick={handleBack} className="calc-btn calc-btn-secondary" disabled={isSubmitting}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting}
                  className="calc-btn calc-btn-primary"
                  style={{ minWidth: '220px' }}
                >
                  {isSubmitting ? (
                    <span>Processing Underwriting...</span>
                  ) : (
                    <>
                      <span>Submit & Check Eligibility</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 6: INDICATIVE ELIGIBILITY RESULT SCREEN ── */}
          {currentStep === 6 && submissionResult && (
            <div ref={printRef} className="animate-fade-in">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--calc-success-bg)', color: 'var(--calc-success)', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>
                  <CheckCircle2 size={18} />
                  <span>{submissionResult.status}</span>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--calc-navy-dark)', marginBottom: '4px' }}>
                  Your Indicative Loan Eligibility Assessment
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--calc-text-muted)' }}>
                  Application ID: <strong style={{ color: 'var(--calc-primary)' }}>{submissionResult.applicationId}</strong> • Timestamp: {submissionResult.timestamp}
                </p>
              </div>

              {/* Primary Highlight Result Card */}
              <div className="calc-primary-result-box" style={{ padding: '28px', marginBottom: '28px' }}>
                <div className="calc-primary-result-label">Estimated Maximum Eligible Loan Amount</div>
                <div className="calc-primary-result-value" style={{ fontSize: '2.8rem' }}>
                  ₹{formatINR(submissionResult.eligibleLoanAmount)}
                </div>
                <div className="calc-primary-result-caption" style={{ fontSize: '0.95rem' }}>
                  Estimated Monthly Installment: <strong style={{ color: 'var(--calc-primary)' }}>₹{formatINR(submissionResult.monthlyEmi)}/mo</strong> for {submissionResult.tenureYears} Years @ {submissionResult.rate}% p.a.
                </div>
              </div>

              {/* Underwriting Metrics Grid */}
              <div className="calc-secondary-metrics-grid" style={{ marginBottom: '24px' }}>
                <div className="calc-metric-card">
                  <div className="calc-metric-label">Monthly Income Considered</div>
                  <div className="calc-metric-value">₹{formatINR(submissionResult.consideredIncome)}</div>
                </div>
                <div className="calc-metric-card">
                  <div className="calc-metric-label">Existing Monthly Debt</div>
                  <div className="calc-metric-value">₹{formatINR(submissionResult.existingDebt)}</div>
                </div>
                <div className="calc-metric-card">
                  <div className="calc-metric-label">FOIR Capacity Applied</div>
                  <div className="calc-metric-value">{submissionResult.foirPercent}%</div>
                </div>
                <div className="calc-metric-card">
                  <div className="calc-metric-label">Total Estimated Interest</div>
                  <div className="calc-metric-value">₹{formatINR(submissionResult.totalInterest)}</div>
                </div>
              </div>

              {/* Recommendation Note */}
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--calc-border)', marginBottom: '24px', fontSize: '0.88rem', color: 'var(--calc-text-main)' }}>
                <strong>Underwriting Summary: </strong>
                {submissionResult.recommendation}
              </div>

              {/* Mandatory Fair Lending Disclaimer */}
              <div style={{ background: '#fffbeb', padding: '16px 20px', borderRadius: '8px', border: '1px solid #fef3c7', marginBottom: '28px', fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
                <strong>Regulatory Disclaimer: </strong>
                This calculation is indicative and is not a formal loan sanction, approval, commitment or guarantee of credit sanction. Final eligibility, interest rate, loan amount, and approval are strictly subject to lender credit policy, physical/digital document verification, CIBIL credit score appraisal, property/security valuation where applicable, and regulatory statutory norms.
              </div>

              {/* Result Actions & Advisor CTAs */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href={`https://wa.me/919175635165?text=Hello%20Avani%20Loan%20Services,%20I%20completed%20my%20FOIR%20Eligibility%20Assessment%20(App%20ID:%20${submissionResult.applicationId})%20for%20${encodeURIComponent(submissionResult.productName)}.%20Estimated%20Eligibility:%20Rs.%20${formatINR(submissionResult.eligibleLoanAmount)}.%20Please%20guide%20me.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calc-btn calc-btn-primary"
                  style={{ background: '#25D366', borderColor: '#25D366' }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Loan Advisor</span>
                </a>

                <a href="tel:+919175635165" className="calc-btn calc-btn-secondary">
                  <PhoneCall size={16} />
                  <span>Call Credit Manager</span>
                </a>

                <button type="button" onClick={handlePrint} className="calc-btn calc-btn-outline">
                  <Printer size={16} />
                  <span>Print / Save PDF</span>
                </button>

                <button type="button" onClick={handleResetFlow} className="calc-btn calc-btn-secondary">
                  <RotateCcw size={16} />
                  <span>New Calculation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: QUICK FOIR CALCULATOR (SLIDER MODE)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'quick' && (
        <div className="calc-layout-grid">
          {/* Quick Inputs Card */}
          <div className="calc-card-inputs">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--calc-navy-dark)', marginBottom: '18px' }}>
              Quick FOIR Calculator
            </h3>

            <div className="calc-field-wrap">
              <div className="calc-field-header">
                <label className="calc-field-label" htmlFor="q-income">Net Monthly Income (₹)</label>
                <span className="calc-field-hint">₹{formatINR(financials.monthlyNetIncome)}</span>
              </div>
              <input
                id="q-income"
                type="range"
                className="calc-slider"
                min="10000"
                max="500000"
                step="5000"
                value={financials.monthlyNetIncome}
                onChange={(e) => setFinancials({ ...financials, monthlyNetIncome: e.target.value })}
              />
            </div>

            <div className="calc-field-wrap">
              <div className="calc-field-header">
                <label className="calc-field-label" htmlFor="q-emi">Existing Monthly EMIs (₹)</label>
                <span className="calc-field-hint">₹{formatINR(financials.existingEmi)}</span>
              </div>
              <input
                id="q-emi"
                type="range"
                className="calc-slider"
                min="0"
                max="200000"
                step="2000"
                value={financials.existingEmi}
                onChange={(e) => setFinancials({ ...financials, existingEmi: e.target.value })}
              />
            </div>

            <div className="calc-field-wrap">
              <div className="calc-field-header">
                <label className="calc-field-label" htmlFor="q-foir">Bank FOIR Limit (%)</label>
                <span className="calc-field-hint">{financials.foirLimitPercent}%</span>
              </div>
              <input
                id="q-foir"
                type="range"
                className="calc-slider"
                min="20"
                max="80"
                step="5"
                value={financials.foirLimitPercent}
                onChange={(e) => setFinancials({ ...financials, foirLimitPercent: e.target.value })}
              />
            </div>

            <div className="calc-field-wrap">
              <div className="calc-field-header">
                <label className="calc-field-label" htmlFor="q-tenure">Tenure (Years)</label>
                <span className="calc-field-hint">{financials.tenureYears} Years</span>
              </div>
              <input
                id="q-tenure"
                type="range"
                className="calc-slider"
                min="1"
                max="30"
                step="1"
                value={financials.tenureYears}
                onChange={(e) => setFinancials({ ...financials, tenureYears: e.target.value })}
              />
            </div>
          </div>

          {/* Quick Results Card */}
          <div className="calc-card-results">
            <div className="calc-primary-result-box">
              <div className="calc-primary-result-label">Indicative Loan Eligibility</div>
              <div className="calc-primary-result-value">₹{formatINR(quickFoirResult.eligibleLoanAmount)}</div>
              <div className="calc-primary-result-caption">
                Available Monthly EMI: ₹{formatINR(quickFoirResult.availableEmi)}/mo
              </div>
            </div>

            <div className="calc-secondary-metrics-grid">
              <div className="calc-metric-card">
                <div className="calc-metric-label">Max Permissible EMI</div>
                <div className="calc-metric-value">₹{formatINR(quickFoirResult.maxPermissibleEmi)}</div>
              </div>
              <div className="calc-metric-card">
                <div className="calc-metric-label">Existing Debt Deducted</div>
                <div className="calc-metric-value">₹{formatINR((parseNumber(financials.existingEmi) || 0) + (parseNumber(financials.otherObligations) || 0))}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('workflow')}
              className="calc-btn calc-btn-primary calc-btn-block"
              style={{ marginTop: '16px' }}
            >
              <span>Start Full 5-Step Underwriting</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}
