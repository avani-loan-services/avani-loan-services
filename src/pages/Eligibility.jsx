import React, { useState } from 'react';
import axios from 'axios';
import useSEO from '../hooks/useSEO';
import { CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, AlertCircle } from 'lucide-react';
import PasswordGate from '../components/PasswordGate';
import './Eligibility.css';

const LOAN_TYPES = [
  'Personal', 'Business', 'School_Funding', 'College_Funding', 'Doctor_Salaried', 'Doctor_Self', 
  'CA', 'Education_India', 'Education_Global', 'Home', 'Mortgage'
];

export default function Eligibility() {
  useSEO({ title: 'AI Eligibility Engine - Password Protected - Avani Loan Services', description: 'Check your loan eligibility and get AI recommendations securely.', keywords: 'Eligibility, Loan, AI, School Funding, College Funding' });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    applicantName: '', phone: '', email: '', city: '',
    loanType: 'Personal', amount: '', tenureMonths: '60',
    year1Income: '', year2Income: '', monthlyNetIncome: '', existingEmi: '0'
  });

  const [files, setFiles] = useState({
    itrYear1: null, itrYear2: null, bankStatements: [], otherDocs: []
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFileChange = (e, key) => {
    if (key === 'bankStatements' || key === 'otherDocs') {
      setFiles({ ...files, [key]: Array.from(e.target.files) });
    } else {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('payload', JSON.stringify(formData));
    
    if (files.itrYear1) data.append('itrYear1', files.itrYear1);
    if (files.itrYear2) data.append('itrYear2', files.itrYear2);
    files.bankStatements.forEach(file => data.append('bankStatements', file));
    files.otherDocs.forEach(file => data.append('otherDocs', file));

    try {
      const response = await axios.post('/api/eligibility/calculate', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setResult(response.data.data);
        setStep(5);
        
        // Also trigger CRM sync silently
        axios.post('/api/crm/sync', {
          name: formData.applicantName,
          phone: formData.phone,
          email: formData.email,
          source: 'Eligibility_Engine',
          product: formData.loanType,
          timestamp: new Date().toISOString()
        }).catch(err => console.error('CRM sync failed', err));
      } else {
        setError(response.data.error || 'Calculation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PasswordGate title="AI Loan Eligibility Engine - Authorized Access">
      <div className="eligibility-container">
        <div className="eligibility-header">
          <h1>AI Loan Eligibility Engine</h1>
          <p>Get instant eligibility scores, EMI calculations, and personalized loan recommendations.</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>

        <div className="eligibility-content">
          {error && <div className="error-banner"><AlertCircle size={18} /> {error}</div>}

          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && (
              <div className="form-step slide-in">
                <h2>Step 1: Personal Information</h2>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.applicantName} onChange={e => setFormData({...formData, applicantName: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                </div>
                <button type="button" className="primary-btn mt-4" onClick={handleNext}>Next <ChevronRight size={18}/></button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step slide-in">
                <h2>Step 2: Loan Requirements</h2>
                <div className="input-group">
                  <label>Loan Type</label>
                  <select value={formData.loanType} onChange={e => setFormData({...formData, loanType: e.target.value})}>
                    {LOAN_TYPES.map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Requested Tenure (Months)</label>
                  <input type="number" value={formData.tenureMonths} onChange={e => setFormData({...formData, tenureMonths: e.target.value})} required />
                </div>
                <div className="step-actions">
                  <button type="button" className="secondary-btn" onClick={handleBack}><ChevronLeft size={18}/> Back</button>
                  <button type="button" className="primary-btn" onClick={handleNext}>Next <ChevronRight size={18}/></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step slide-in">
                <h2>Step 3: Financial Details</h2>
                <div className="input-group">
                  <label>Monthly Net Income (₹)</label>
                  <input type="number" value={formData.monthlyNetIncome} onChange={e => setFormData({...formData, monthlyNetIncome: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Year 1 Annual Income (₹) (from ITR)</label>
                  <input type="number" value={formData.year1Income} onChange={e => setFormData({...formData, year1Income: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Year 2 Annual Income (₹) (from ITR)</label>
                  <input type="number" value={formData.year2Income} onChange={e => setFormData({...formData, year2Income: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Existing EMI (₹)</label>
                  <input type="number" value={formData.existingEmi} onChange={e => setFormData({...formData, existingEmi: e.target.value})} required />
                </div>
                <div className="step-actions">
                  <button type="button" className="secondary-btn" onClick={handleBack}><ChevronLeft size={18}/> Back</button>
                  <button type="button" className="primary-btn" onClick={handleNext}>Next <ChevronRight size={18}/></button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="form-step slide-in">
                <h2>Step 4: Document Upload</h2>
                <div className="file-upload-grid">
                  <div className="upload-box">
                    <UploadCloud size={24} />
                    <label>ITR Year 1 (PDF)</label>
                    <input type="file" accept=".pdf,.png,.jpg" onChange={e => handleFileChange(e, 'itrYear1')} />
                  </div>
                  <div className="upload-box">
                    <UploadCloud size={24} />
                    <label>ITR Year 2 (PDF)</label>
                    <input type="file" accept=".pdf,.png,.jpg" onChange={e => handleFileChange(e, 'itrYear2')} />
                  </div>
                  <div className="upload-box">
                    <UploadCloud size={24} />
                    <label>Bank Statements (Multi)</label>
                    <input type="file" accept=".pdf,.png,.jpg" multiple onChange={e => handleFileChange(e, 'bankStatements')} />
                  </div>
                </div>
                
                <div className="step-actions mt-6">
                  <button type="button" className="secondary-btn" onClick={handleBack}><ChevronLeft size={18}/> Back</button>
                  <button type="button" className="primary-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Submit for AI Analysis'} <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 5 && result && (
              <div className="form-step slide-in result-step">
                <h2><CheckCircle2 color="#25D366" size={28}/> Eligibility Analysis Complete</h2>
                
                <div className="result-grid">
                  <div className="result-card">
                    <h4>Maximum Eligible Loan</h4>
                    <div className="value">₹{result.maxPrincipal.toLocaleString()}</div>
                  </div>
                  <div className="result-card">
                    <h4>Estimated EMI</h4>
                    <div className="value">₹{result.emi.toLocaleString()}</div>
                  </div>
                  <div className="result-card">
                    <h4>FOIR</h4>
                    <div className="value">{result.foir}%</div>
                  </div>
                  <div className="result-card">
                    <h4>Debt-to-Income (DTI)</h4>
                    <div className="value">{result.dti}%</div>
                  </div>
                </div>

                <div className="ai-recommendation-box">
                  <h3>AI Credit Manager Recommendation</h3>
                  <p className="recommendation-text">{result.recommendation}</p>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '16px', background: '#F8FAFC', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #0052CC' }}>
                  ⚠️ <strong>Indicative Eligibility Assessment:</strong> Final sanction depends on lender policy, complete document verification, credit profile, and formal bank approval.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <a 
                    href={`https://wa.me/919175635165?text=${encodeURIComponent(`Hello AVANI LOAN SERVICES, I checked my eligibility for ${formData.loanType} Loan on your website. Estimated Eligible Amount: ₹${result.maxPrincipal.toLocaleString()}. Please assist me.`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="primary-btn"
                    style={{ background: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    📲 Connect on WhatsApp for Quick Processing
                  </a>
                  <button className="secondary-btn" onClick={() => window.location.reload()}>Start New Application</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </PasswordGate>
  );
}

