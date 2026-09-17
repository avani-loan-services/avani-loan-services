import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  ShieldCheck,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { syncLeadData } from '../lib/syncLeads';
import brandLogo from '../assets/avani-brand-logo.png';
import './CibilCheck.css';

export default function CibilCheck() {
  useSEO({
    title: 'Credit Profile Analysis & CIBIL Advisory — AVANI LOAN SERVICES',
    description: 'Professional credit profile analysis, bureau dispute guidance, and debt restructuring roadmap from Avani Loan Services.',
    keywords: 'Credit profile analysis, CIBIL advisory, credit repair, loan eligibility Latur, debt restructuring Avani Finserv'
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    pan: '',
    city: 'Latur',
    age: '30',
    monthlyIncome: '50000',
    scoreTier: '748_777', // Default known tier
    primaryChallenge: 'BEST_RATES',
    consent: true
  });

  const [analysisResult, setAnalysisResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const maskPan = (pan) => {
    if (!pan) return 'XXXXX0000X';
    const clean = pan.trim().toUpperCase();
    if (clean.length < 10) return clean;
    return `XXXXX${clean.slice(5)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const panStr = (formData.pan || '').trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panStr)) {
      setError('Please enter a valid 10-character Indian PAN (e.g., ABCDE1234F).');
      return;
    }

    if (!formData.mobile || formData.mobile.trim().length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.consent) {
      setError('Please provide authorization consent to proceed with the profile analysis.');
      return;
    }

    setLoading(true);

    const refNumber = `ALS-CPA-${Math.floor(100000 + Math.random() * 900000)}`;
    const maskedPan = maskPan(panStr);
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Valued Client';

    // Map score tier to advisory parameters
    let tierTitle = 'Good Credit Standing';
    let tierRange = '748 - 777';
    let riskLevel = 'Low - Standard Eligibility';
    let recommendation = 'Eligible for prime banking rates. Maintain credit card utilization below 30%.';

    if (formData.scoreTier === '778_900') {
      tierTitle = 'Excellent Credit Standing';
      tierRange = '778 - 900';
      riskLevel = 'Minimal Risk — Prime Pre-Approvals';
      recommendation = 'Qualifies for lowest bank interest rates, expedited processing, and maximum loan amounts.';
    } else if (formData.scoreTier === '700_747') {
      tierTitle = 'Satisfactory / Moderate';
      tierRange = '700 - 747';
      riskLevel = 'Moderate Risk';
      recommendation = 'Eligible for standard NBFC & bank loans. Avoid multiple hard enquiries over the next 90 days.';
    } else if (formData.scoreTier === '650_699') {
      tierTitle = 'Challenged Profile';
      tierRange = '650 - 699';
      riskLevel = 'Elevated Risk — Selective Lenders';
      recommendation = 'Target specialized NBFCs and prioritize settling overdue balances to lift score above 750.';
    } else if (formData.scoreTier === 'BELOW_650') {
      tierTitle = 'High Risk / Distressed';
      tierRange = 'Below 650';
      riskLevel = 'High Risk — Structured Repair Required';
      recommendation = 'Requires structured bureau dispute resolution, debt settlement, or secured collateral financing.';
    } else if (formData.scoreTier === 'NTC') {
      tierTitle = 'New to Credit (NTC)';
      tierRange = 'No Bureau History';
      riskLevel = 'Unrated / Fresh Profile';
      recommendation = 'Start with small secured facilities or salary-linked loans to build an initial 750+ score.';
    }

    const result = {
      refNumber,
      fullName,
      maskedPan,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      tierTitle,
      tierRange,
      riskLevel,
      recommendation
    };

    // Durable Sync to CRM with synthetic safety (never unmasked PAN)
    try {
      await syncLeadData({
        name: fullName,
        phone: formData.mobile,
        email: formData.email,
        loanType: 'Credit_Profile_Analysis',
        amount: parseInt(formData.monthlyIncome, 10) || 50000,
        city: formData.city,
        details: `CPA Ref: ${refNumber}, Masked PAN: ${maskedPan}, Tier: ${tierRange}, Challenge: ${formData.primaryChallenge}`,
        source: 'Credit_Profile_Analyzer'
      });
    } catch (err) {
      console.warn('[CibilCheck] syncLeadData non-fatal warning:', err.message);
    }

    setAnalysisResult(result);
    setLoading(false);
    setStep(2);
  };

  const downloadReport = async () => {
    if (!analysisResult) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Palette
      const primaryNavy = [15, 39, 74];
      const accentGold = [217, 119, 6];
      const slateDark = [30, 41, 59];
      const lightBg = [248, 250, 252];

      let y = 14;

      // Section 1: Top Brand Banner (AVANI LOAN SERVICES)
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AVANI LOAN SERVICES', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Authoritative Financial Advisory & Credit Architecture', 14, 18);
      doc.text('KulswaminiNagar, Latur - 413531, Maharashtra | enquiry@avanifinserv.com', 14, 23);

      // Section 2: Document Title (Credit Profile Analysis)
      y = 36;
      doc.setTextColor(...primaryNavy);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('CREDIT PROFILE ANALYSIS', 14, y);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentGold);
      doc.text('[ CONFIDENTIAL ADVISORY DOCUMENT — NOT AN OFFICIAL BUREAU PULL ]', 14, y + 5);

      // Section 3 & 4: Reference & Date
      doc.setTextColor(...slateDark);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Customer Reference: ${analysisResult.refNumber}`, pageWidth - 80, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${analysisResult.date} ${analysisResult.time}`, pageWidth - 80, y + 5);

      y += 14;

      // Section 5: Customer Information
      doc.setFillColor(...lightBg);
      doc.rect(14, y, pageWidth - 28, 22, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, pageWidth - 28, 22, 'D');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('5. CUSTOMER INFORMATION', 18, y + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text(`Client Name: ${analysisResult.fullName}`, 18, y + 12);
      doc.text(`Mobile: +91-${formData.mobile}`, 18, y + 17);

      doc.text(`Masked PAN: ${analysisResult.maskedPan}`, 110, y + 12);
      doc.text(`City: ${formData.city || 'Maharashtra'} | Age: ${formData.age}`, 110, y + 17);

      y += 28;

      // Section 6: Credit Summary
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('6. CREDIT SUMMARY & BUREAU PROFILE TIER', 14, y);

      y += 5;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, pageWidth - 28, 16, 'F');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...slateDark);
      doc.text(`Standing: ${analysisResult.tierTitle} (${analysisResult.tierRange})`, 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(`Risk Assessment: ${analysisResult.riskLevel}`, 18, y + 11);

      y += 22;

      // Section 7 & 8: Account Summary & Account History
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('7. ACCOUNT SUMMARY & 8. ACCOUNT HISTORY', 14, y);

      y += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text('• Healthy Portfolio Ratio: Recommended 60% Secured Debt (Home/Auto) to 40% Unsecured Debt (Personal/Cards).', 14, y);
      doc.text('• Account Age & Longevity: Keep oldest credit card accounts open to demonstrate a seasoned repayment track record.', 14, y + 4.5);

      y += 13;

      // Section 9 & 10: Payment History & Credit Enquiries
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('9. PAYMENT HISTORY & 10. CREDIT ENQUIRIES', 14, y);

      y += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text('• Repayment Track Record: 100% on-time payments across EMIs and Credit Cards is mandatory for prime rates.', 14, y);
      doc.text('• Inquiry Discipline: Limit hard bureau inquiries to 1 or 2 per quarter. Excessive pulls trigger rejection cascades.', 14, y + 4.5);

      y += 13;

      // Section 11 & 12: Outstanding Obligations & Attention Areas
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('11. OUTSTANDING OBLIGATIONS & 12. ATTENTION AREAS', 14, y);

      y += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text('• Fixed Obligation to Income Ratio (FOIR): Keep aggregate monthly EMIs under 45% of gross verifiable income.', 14, y);
      doc.text('• Critical Flagged Items: Zero tolerance for written-off, settled, or 90+ DPD accounts in the last 24 months.', 14, y + 4.5);

      y += 13;

      // Section 13: Avani Analysis
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('13. AVANI EXPERT ANALYSIS & STRATEGIC RECOMMENDATIONS', 14, y);

      y += 5;
      doc.setFillColor(254, 243, 199);
      doc.rect(14, y, pageWidth - 28, 18, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.rect(14, y, pageWidth - 28, 18, 'D');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(146, 64, 14);
      doc.text(doc.splitTextToSize(analysisResult.recommendation, pageWidth - 36), 18, y + 5.5);

      y += 24;

      // Section 14: General Improvement Observations
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('14. GENERAL IMPROVEMENT OBSERVATIONS (60 - 90 DAY ROADMAP)', 14, y);

      y += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text('1. Cap credit card spending below 30% of authorized limits before statement generation date.', 14, y);
      doc.text('2. Resolve any clerical errors or wrong phone/address tags directly with lenders or via bureau disputes.', 14, y + 4.5);
      doc.text('3. Restructure multiple expensive high-interest personal loans into a single consolidated lower-cost facility.', 14, y + 9);
      doc.text('4. In case of disputed charges, obtain official No Objection Certificates (NOC) and update bureau records.', 14, y + 13.5);

      y += 22;

      // Section 15: Mandatory Legal Disclaimer
      doc.setFillColor(...lightBg);
      doc.rect(14, y, pageWidth - 28, 22, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, pageWidth - 28, 22, 'D');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryNavy);
      doc.text('15. STATUTORY DISCLAIMER & INDEPENDENT ADVISORY NOTICE', 18, y + 5);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const disclaimerText = 'This document is an analysis/summary based on information supplied through an authorized source. It is not an official TransUnion CIBIL report unless generated directly by an authorized TransUnion CIBIL service. Avani Loan Services provides credit consultation, loan syndication, and financial advisory services. Avani Loan Services does not manipulate bureau algorithms or make deceptive credit improvement guarantees.';
      doc.text(doc.splitTextToSize(disclaimerText, pageWidth - 36), 18, y + 10);

      // Save PDF
      doc.save(`${analysisResult.fullName.replace(/\s+/g, '_')}_Credit_Profile_Analysis.pdf`);
    } catch (err) {
      console.error('[CibilCheck] Download error:', err);
      alert('Unable to generate PDF report at this time. Please try again.');
    }
  };

  return (
    <div className="cibil-check-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Avani Credit Architecture</span>
              <div className="page-header-address">
                Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra
              </div>
            </div>
          </div>
          <h1>Credit Profile Analysis & Advisory</h1>
          <p>
            Understand how leading banks and NBFCs evaluate your creditworthiness with zero fabricated scores.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container cibil-container">

          <div className="cibil-form-card">
            {step === 1 && !loading && (
              <div className="animate-fade-in">
                <div className="step-header">
                  <h3>Credit Assessment Intake</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px', fontWeight: '500' }}>
                    Transparent advisory based on your self-reported profile or official report metrics.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', borderLeft: '4px solid #034EA2', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.86rem', color: '#334155' }}>
                  <strong>Authoritative Advisory Notice:</strong> Avani Loan Services evaluates your credit metrics to formulate customized loan approval strategies. We never fabricate bureau records or make false score claims.
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modern-form-grid">
                    <div className="floating-group">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="modern-input"
                        required
                        placeholder=" "
                      />
                      <label className="floating-label">First Name</label>
                    </div>

                    <div className="floating-group">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="modern-input"
                        required
                        placeholder=" "
                      />
                      <label className="floating-label">Last Name</label>
                    </div>

                    <div className="floating-group">
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="modern-input"
                        required
                        placeholder=" "
                        maxLength="10"
                      />
                      <label className="floating-label">10-Digit Mobile Number</label>
                    </div>

                    <div className="floating-group">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="modern-input"
                        required
                        placeholder=" "
                      />
                      <label className="floating-label">Email Address</label>
                    </div>

                    <div className="floating-group">
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        className="modern-input"
                        required
                        placeholder=" "
                        maxLength="10"
                        style={{ textTransform: 'uppercase' }}
                      />
                      <label className="floating-label">Permanent Account Number (PAN)</label>
                      <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Masked Preview: {maskPan(formData.pan)}
                      </small>
                    </div>

                    <div className="floating-group">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="modern-input"
                        required
                        placeholder=" "
                      />
                      <label className="floating-label">City / District</label>
                    </div>

                    <div className="floating-group">
                      <select
                        name="scoreTier"
                        value={formData.scoreTier}
                        onChange={handleInputChange}
                        className="modern-input"
                        style={{ paddingTop: '20px' }}
                      >
                        <option value="778_900">778 - 900 (Excellent - Prime Bank Tier)</option>
                        <option value="748_777">748 - 777 (Good - Standard Approval Tier)</option>
                        <option value="700_747">700 - 747 (Moderate - Needs Optimization)</option>
                        <option value="650_699">650 - 699 (Challenged - Advisory Required)</option>
                        <option value="BELOW_650">Below 650 (High Risk / Past Overdues)</option>
                        <option value="NTC">New To Credit (No Bureau History)</option>
                      </select>
                      <label className="floating-label">Estimated Bureau Standing / Known Score</label>
                    </div>

                    <div className="floating-group">
                      <select
                        name="primaryChallenge"
                        value={formData.primaryChallenge}
                        onChange={handleInputChange}
                        className="modern-input"
                        style={{ paddingTop: '20px' }}
                      >
                        <option value="BEST_RATES">Seeking Best Interest Rates for Large Loan</option>
                        <option value="CARD_UTILIZATION">High Credit Card Balances / High Utilization</option>
                        <option value="PAST_DELAYS">Past Late Payments or Settlement Record</option>
                        <option value="MULTIPLE_INQUIRIES">Recent Loan Rejections / Too Many Inquiries</option>
                        <option value="BUREAU_DISPUTE">Incorrect Information / Inaccurate Bureau Details</option>
                        <option value="GENERAL_AUDIT">General Credit Health Audit</option>
                      </select>
                      <label className="floating-label">Primary Financial Goal / Bottleneck</label>
                    </div>
                  </div>

                  <div style={{ margin: '20px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                    <label style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        style={{ marginTop: '3px' }}
                      />
                      <span>
                        I hereby authorize Avani Loan Services to analyze my self-reported credit parameters to provide credit advisory, debt-to-income assessment, and loan consultation. I acknowledge that this is an independent advisory document and not an official TransUnion CIBIL pull.
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="error-message" style={{ color: '#dc2626', marginBottom: '20px', fontWeight: '600' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn-modern-submit">
                    Generate Credit Profile Analysis
                  </button>
                </form>
              </div>
            )}

            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <h3>Formulating Credit Architecture...</h3>
                <p>Synthesizing debt-to-income models, bureau guidelines, and lender eligibility criteria.</p>
              </div>
            )}

            {step === 2 && analysisResult && !loading && (
              <div className="animate-fade-in">
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span className="badge" style={{ background: '#034EA2', color: '#ffffff' }}>
                        ANALYSIS READY
                      </span>
                      <h2 style={{ color: '#0f274a', margin: '8px 0 4px 0', fontSize: '1.6rem' }}>
                        {analysisResult.fullName}
                      </h2>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Ref: <strong>{analysisResult.refNumber}</strong> | Masked PAN: <strong>{analysisResult.maskedPan}</strong> | City: <strong>{formData.city}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Generated On</div>
                      <div style={{ fontWeight: '700', color: '#0f274a' }}>{analysisResult.date}</div>
                    </div>
                  </div>
                </div>

                {/* Score & Health Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                      Standing & Tier
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#034EA2', margin: '6px 0' }}>
                      {analysisResult.tierTitle}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                      Score Range: <strong>{analysisResult.tierRange}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                      Risk Assessment
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f274a', margin: '6px 0' }}>
                      {analysisResult.riskLevel}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Target: Optimal Bank Sanction Matrix
                    </div>
                  </div>
                </div>

                {/* Strategic Pillars */}
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ color: '#0f274a', marginBottom: '14px', fontSize: '1.1rem' }}>
                    Critical Evaluation Pillars
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#034EA2', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle size={16} color="#059669" /> Repayment Discipline
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        Timely EMI servicing without single 30+ DPD default builds 35% of total score weighting.
                      </p>
                    </div>

                    <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#034EA2', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle size={16} color="#059669" /> Credit Card Utilization
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        Keep monthly card statements below 30% of aggregate limit to maintain peak ratings.
                      </p>
                    </div>

                    <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#034EA2', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle size={16} color="#059669" /> Credit Mix Ratio
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        Maintain a balanced blend of secured loans (Home/LAP) and unsecured facilities.
                      </p>
                    </div>

                    <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#034EA2', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle size={16} color="#059669" /> Enquiry Frequency
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        Avoid scattergun loan applications. Let Avani pre-qualify lenders before hard bureau pulls.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Avani Analysis Box */}
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '10px', marginBottom: '28px' }}>
                  <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '6px', fontSize: '0.95rem' }}>
                    Avani Expert Advisory Roadmap
                  </div>
                  <p style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                    {analysisResult.recommendation}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <button
                    onClick={downloadReport}
                    className="download-report-btn"
                    style={{ margin: 0 }}
                  >
                    <Download size={20} />
                    Download Official Credit Profile Analysis (PDF)
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <Link
                      to="/apply"
                      className="btn btn-primary"
                      style={{ textAlign: 'center', textDecoration: 'none', padding: '14px 16px', fontWeight: '700' }}
                    >
                      Apply for Loan with Advisory
                    </Link>

                    <Link
                      to="/documents"
                      className="btn btn-outline"
                      style={{ textAlign: 'center', textDecoration: 'none', padding: '14px 16px', fontWeight: '700' }}
                    >
                      View Required Documents
                    </Link>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => { setStep(1); setAnalysisResult(null); }}
                    style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Analyze Another Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
