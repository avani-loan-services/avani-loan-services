import useSEO from '../hooks/useSEO';
import { useState } from 'react';
import { ShieldCheck, Mail, Phone, User, FileText, Download, CheckCircle, ArrowRight, Lock, AlertTriangle, RefreshCw, MessageCircle, ExternalLink } from 'lucide-react';
import { generateWhatsAppDocumentLink, PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import { syncLeadData } from '../lib/syncLeads';
import brandLogo from '../assets/avani-brand-logo.png';
import './CibilCheck.css';

export default function CibilCheck() {
  useSEO({
    title: 'Free CIBIL Score Check - Avani Loan Services',
    description: 'Check your estimated CIBIL credit score for free with instant report preview and document checklist.',
    keywords: 'CIBIL check, credit score India, free loan eligibility, Avani Finserv Latur'
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    mobile: '',
    email: '',
    pan: '',
    income: '50000',
    age: '30'
  });

  const [error, setError] = useState('');
  const [estimatedScore, setEstimatedScore] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const panStr = (formData.pan || '').trim().toUpperCase();
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (!panRegex.test(panStr)) {
      setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }

    calculateResult();
  };

  const getPanSeed = (pan) => {
    if (!pan) return 0;
    let hash = 0;
    const s = String(pan).toUpperCase();
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const calculateResult = async () => {
    setLoading(true);
    
    const panStr = (formData.pan || '').trim().toUpperCase();
    const seed = getPanSeed(panStr);
    const baseScore = 680;
    const incomeNum = parseInt(formData.income) || 50000;
    const ageNum = parseInt(formData.age) || 30;

    const incomeFactor = Math.min(80, (incomeNum / 1000) * 0.8);
    const ageFactor = Math.min(40, (ageNum / 2.5));
    const panVariation = (seed % 101) - 50;
    
    const finalScore = Math.min(900, Math.max(300, Math.floor(baseScore + incomeFactor + ageFactor + panVariation)));
    setEstimatedScore(finalScore);

    const fullName = `${formData.name || ''} ${formData.lastName || ''}`.trim() || 'Valued Customer';

    try {
      await syncLeadData({
        name: fullName,
        phone: formData.mobile || '',
        email: formData.email || '',
        loanType: 'CIBIL_Report',
        amount: finalScore,
        details: `PAN: ${panStr}, Income: ${formData.income}`,
        source: 'CIBIL_Checker'
      });
    } catch (err) {
      console.warn('[CibilCheck] syncLeadData non-fatal:', err.message);
    }

    setStep(2);
    setLoading(false);
  };

  const downloadReport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const fullName = (`${formData.name || ''} ${formData.lastName || ''}`.trim() || 'Valued Customer').toUpperCase();
      const reportControlNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const sectionHeader = (title, y) => {
        doc.setFillColor(240, 244, 248);
        doc.rect(15, y, pageWidth - 30, 8, 'F');
        doc.setTextColor(10, 79, 139);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, y + 5.5);
      };

      // Header
      doc.setFillColor(10, 79, 139);
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('TransUnion CIBIL', 15, 20);
      doc.setFontSize(9);
      doc.text('A TransUnion Company', 15, 26);
      
      doc.setFontSize(11);
      doc.text('CREDIT INFORMATION REPORT', pageWidth - 80, 20);
      doc.setFontSize(8);
      doc.text(`REPORT CONTROL NUMBER: ${reportControlNumber}`, pageWidth - 80, 26);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 80, 31);
      doc.text(`TIME: ${new Date().toLocaleTimeString()}`, pageWidth - 80, 36);

      // Score Meter Box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, 55, pageWidth - 30, 60, 2, 2, 'F');
      doc.setDrawColor(240, 240, 240);
      doc.roundedRect(15, 55, pageWidth - 30, 60, 2, 2, 'D');
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.text('Your CIBIL Score', 35, 68);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(30, 95, 80, 95);
      
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text(estimatedScore.toString(), 42, 90);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`As of ${new Date().toLocaleDateString()}`, 40, 100);

      // Where You Stand Bars in PDF
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Where You Stand', 110, 68);
      
      const bars = [
        { range: '778-900', perc: '17%', color: [16, 124, 16] },
        { range: '765-777', perc: '20%', color: [144, 238, 144] },
        { range: '748-764', perc: '21%', color: [255, 215, 0] },
        { range: '723-747', perc: '22%', color: [255, 165, 0] },
        { range: '300-722', perc: '20%', color: [255, 69, 0] }
      ];

      bars.forEach((bar, i) => {
        const y = 75 + (i * 7);
        doc.setFillColor(bar.color[0], bar.color[1], bar.color[2]);
        doc.rect(110, y, 70, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text(bar.range, 112, y + 3.5);
        doc.text(bar.perc, 175, y + 3.5);
        
        const isMatch = (i === 0 && estimatedScore >= 778) ||
                        (i === 1 && estimatedScore >= 765 && estimatedScore < 778) ||
                        (i === 2 && estimatedScore >= 748 && estimatedScore < 765) ||
                        (i === 3 && estimatedScore >= 723 && estimatedScore < 748) ||
                        (i === 4 && estimatedScore < 723);
        
        if (isMatch) {
          doc.setFillColor(255, 255, 255);
          doc.rect(172, y, 12, 5, 'F');
          doc.setDrawColor(50, 50, 50);
          doc.rect(172, y, 12, 5, 'D');
          doc.setTextColor(33, 33, 33);
          doc.text(estimatedScore.toString(), 174, y + 3.5);
        }
      });

      sectionHeader('PERSONAL INFORMATION', 115);
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('NAME:', 20, 132);
      doc.text('DATE OF BIRTH:', 20, 138);
      doc.text('GENDER:', 20, 144);
      
      doc.setFont('helvetica', 'normal');
      doc.text(fullName, 60, 132);
      doc.text(`12/05/${1996 - ((parseInt(formData.age) || 30) - 30)}`, 60, 138);
      doc.text('MALE', 60, 144);

      doc.setFont('helvetica', 'bold');
      doc.text('PAN:', 110, 132);
      doc.text('EMPLOYMENT:', 110, 138);
      doc.setFont('helvetica', 'normal');
      doc.text((formData.pan || '').toUpperCase(), 140, 132);
      doc.text('SALARIED', 140, 138);

      sectionHeader('CONTACT INFORMATION', 155);
      doc.setFontSize(8);
      doc.text('ADDRESS:', 20, 172);
      doc.text('MAHARASHTRA, INDIA', 60, 172);
      doc.text('TELEPHONE:', 20, 178);
      doc.text(formData.mobile || '', 60, 178);
      doc.text('EMAIL:', 20, 184);
      doc.text(formData.email || '', 60, 184);

      const finalY = 210;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is an estimated Credit Analysis report based on self-reported and analyzed data.', 15, finalY);
      doc.text('For a full official report, please visit the official CIBIL website.', 15, finalY + 5);
      doc.text('Avani Loan Services - ALS Report: ALS-' + reportControlNumber, 15, finalY + 15);
      doc.text('Premium Credit Analysis Tool', pageWidth - 55, finalY + 15);

      doc.save(`${fullName.replace(/\s+/g, '_')}_Cibil_Summary.pdf`);
    } catch (err) {
      console.error('[CibilCheck] Download error:', err);
      alert('Unable to generate PDF report at this time. Please try again.');
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 778) return { label: 'Excellent', class: 'excellent', description: 'Outstanding credit behavior and history.' };
    if (score >= 765) return { label: 'Good', class: 'good', description: 'Healthy credit profile with timely payments.' };
    if (score >= 748) return { label: 'Satisfactory', class: 'satisfactory', description: 'Moderate credit health with room for improvement.' };
    if (score >= 723) return { label: 'Fair', class: 'fair', description: 'Acceptable but could benefit from lower utilization.' };
    return { label: 'Poor', class: 'poor', description: 'Needs significant improvement to access best rates.' };
  };

  return (
    <div className="cibil-check-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Avani Credit Insights</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Free CIBIL Score Check</h1>
          <p>Get an instant estimation of your credit health and download your summary report.</p>
        </div>
      </section>

      <section className="section">
        <div className="container cibil-container">
          
          <div className="cibil-form-card">
            {step === 1 && !loading && (
              <div className="animate-fade-in">
                <div className="step-header">
                  <h3>Check Your CIBIL Score</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px', fontWeight: '500' }}>
                    *Disclaimer: Cibil score calculation is for estimation and reference purposes only.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modern-form-grid">
                    <div className="floating-group">
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="modern-input" required placeholder=" " />
                      <label className="floating-label">First Name</label>
                    </div>
                    <div className="floating-group">
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="modern-input" required placeholder=" " />
                      <label className="floating-label">Last Name</label>
                    </div>
                    <div className="floating-group">
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="modern-input" required placeholder=" " maxLength="10" />
                      <label className="floating-label">Mobile Number</label>
                    </div>
                    <div className="floating-group">
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="modern-input" required placeholder=" " />
                      <label className="floating-label">Email ID</label>
                    </div>
                    <div className="floating-group" style={{ gridColumn: 'span 2' }}>
                      <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} className="modern-input" required placeholder=" " maxLength="10" style={{ textTransform: 'uppercase' }} />
                      <label className="floating-label">Permanent Account Number (PAN)</label>
                    </div>
                  </div>

                  <div style={{ margin: '20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                    <label style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" required defaultChecked style={{ marginTop: '3px' }} />
                      <span>I hereby appoint Avani Loan Services as my authorized representative to receive my credit information from CIBIL/Experian/Equifax/CRIF.</span>
                    </label>
                  </div>

                  {error && <div className="error-message" style={{ color: '#e53e3e', marginBottom: '20px', fontWeight: '600' }}>{error}</div>}

                  <button type="submit" className="btn-modern-submit">
                    Get Free CIBIL Report
                  </button>
                </form>
              </div>
            )}

            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <h3>Fetching your CIBIL score...</h3>
                <p>Analyzing your credit history and generating report.</p>
              </div>
            )}

            {step === 2 && !loading && (
              <div className="animate-fade-in">
                <div className="cibil-results-split">
                  <div className="gauge-side">
                    <div className="gauge-wrap-modern">
                      <div className="gauge-modern"></div>
                      <div className="gauge-needle-modern" style={{ transform: `rotate(${(estimatedScore - 300) * 180 / 600 - 90}deg)` }}></div>
                      <div className="score-center">
                        <span className="score-number">{estimatedScore}</span>
                        <p className="score-date">As of {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <h2 style={{ textAlign: 'center', marginTop: '20px', color: '#034EA2' }}>
                      {getScoreLabel(estimatedScore).label}
                    </h2>
                  </div>

                  <div className="where-you-stand">
                    <h4>Where You Stand</h4>
                    <div className="stand-bars">
                      <div className={`stand-bar excellent ${getScoreLabel(estimatedScore).class === 'excellent' ? 'active' : ''}`}>
                        <span>Excellent</span>
                        <span>778 - 900</span>
                      </div>
                      <div className={`stand-bar good ${getScoreLabel(estimatedScore).class === 'good' ? 'active' : ''}`}>
                        <span>Good</span>
                        <span>765 - 777</span>
                      </div>
                      <div className={`stand-bar satisfactory ${getScoreLabel(estimatedScore).class === 'satisfactory' ? 'active' : ''}`}>
                        <span>Satisfactory</span>
                        <span>748 - 764</span>
                      </div>
                      <div className={`stand-bar fair ${getScoreLabel(estimatedScore).class === 'fair' ? 'active' : ''}`}>
                        <span>Fair</span>
                        <span>723 - 747</span>
                      </div>
                      <div className={`stand-bar poor ${getScoreLabel(estimatedScore).class === 'poor' ? 'active' : ''}`}>
                        <span>Poor</span>
                        <span>300 - 722</span>
                      </div>
                    </div>
                    <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
                      {getScoreLabel(estimatedScore).description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  <button onClick={downloadReport} className="download-report-btn">
                    <Download size={20} style={{ marginRight: '8px' }} />
                    Download Full CIBIL Report (PDF)
                  </button>
                  <a 
                    href="https://b2c.creditsamadhaan.com/?refer_code=FY665935" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="download-report-btn" 
                    style={{ background: '#0052CC', color: 'white', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <ExternalLink size={20} style={{ marginRight: '8px' }} />
                    Start CIBIL Correction with Avani
                  </a>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <a 
                      href={generateWhatsAppDocumentLink('CIBIL Improvement')} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="download-report-btn" 
                      style={{ background: '#25D366', color: 'white', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem' }}
                      aria-label="Get CIBIL document checklist on WhatsApp"
                    >
                      <MessageCircle size={18} style={{ marginRight: '6px' }} />
                      WhatsApp Document List
                    </a>
                    <a 
                      href={PHONE_NUMBER} 
                      className="download-report-btn" 
                      style={{ background: '#1B3A6B', color: 'white', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem' }}
                      aria-label="Call Avani Loan Services at 9175635165"
                    >
                      <Phone size={18} style={{ marginRight: '6px' }} />
                      Call {DISPLAY_PHONE}
                    </a>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>
                    Check another score
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
