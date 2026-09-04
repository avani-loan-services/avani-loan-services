import React, { useState, useEffect } from 'react';
import { getEnquiries, deleteEnquiry } from '../lib/db';
import brandLogo from '../assets/avani-brand-logo.png';
import { Lock, FileText, CheckCircle, Calculator, Trash2 } from 'lucide-react';
import './AdminEligibility.css';

export default function AdminEligibility() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadEnquiries();
    }
  }, [isAuthenticated]);

  const loadEnquiries = async () => {
    const data = await getEnquiries();
    setEnquiries(data.sort((a, b) => b.id - a.id));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Samarth@1356') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this enquiry?')) {
      await deleteEnquiry(id);
      loadEnquiries();
      if(selectedEnquiry?.id === id) setSelectedEnquiry(null);
    }
  };

  const calculateEligibility = (enq) => {
    const income = parseFloat(enq.monthlyIncome) || 0;
    const emi = parseFloat(enq.existingEmi) || 0;
    const r = parseFloat(enq.rate) || 10.5;
    const n = parseFloat(enq.tenure) || 60;

    const foir = 0.50; // 50%
    const totalEmiCapacity = income * foir;
    const newEmiAffordability = totalEmiCapacity - emi;

    if (newEmiAffordability <= 0) {
      setCalculation({ maxAmount: 0, availableEmi: 0, eligible: false });
      return;
    }

    const monthlyRate = r / 100 / 12;
    const amount = newEmiAffordability * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n));
    
    setCalculation({
      maxAmount: Math.round(amount),
      availableEmi: Math.round(newEmiAffordability),
      eligible: true
    });
  };

  const selectEnquiry = (enq) => {
    setSelectedEnquiry(enq);
    setCalculation(null); // reset calculation
  };

  const fmt = n => '₹' + Math.max(0, n).toLocaleString('en-IN');

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <Lock size={48} color="#0f4c81" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '20px', color: '#0f4c81' }}>Admin Eligibility Portal</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="form-input"
            style={{ marginBottom: '20px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login securely</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-eligibility-page">
      <section className="page-header" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge" style={{ background: '#ef4444' }}>Protected Admin View</span>
            </div>
          </div>
          <h1>Eligibility Applications</h1>
          <p>Review customer documents and calculate eligibility instantly.</p>
        </div>
      </section>

      <section className="section">
        <div className="container admin-grid">
          <div className="enquiry-list glass-card">
            <h3 style={{ marginBottom: 20 }}>Recent Enquiries</h3>
            {enquiries.length === 0 ? <p>No enquiries found.</p> : null}
            <div className="list-scroll">
              {enquiries.map(enq => (
                <div 
                  key={enq.id} 
                  className={`enquiry-item ${selectedEnquiry?.id === enq.id ? 'active' : ''}`}
                  onClick={() => selectEnquiry(enq)}
                >
                  <div className="enquiry-meta">
                    <strong>{enq.name || 'Anonymous User'}</strong>
                    <span className="date">{new Date(enq.date).toLocaleDateString()}</span>
                  </div>
                  <div className="enquiry-sub">
                    <span>{enq.loanType} {enq.subType ? `(${enq.subType})` : ''}</span>
                    <button className="del-btn" onClick={(e) => handleDelete(enq.id, e)}><Trash2 size={16} color="#ef4444" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="enquiry-details glass-card">
            {selectedEnquiry ? (
              <div className="details-content animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ color: '#0f4c81' }}>Applicant: {selectedEnquiry.name || 'N/A'}</h3>
                  <span className="badge">{selectedEnquiry.loanType}</span>
                </div>
                
                <div className="data-grid">
                  <div className="data-item">
                    <label>Phone Number</label>
                    <p>{selectedEnquiry.phone || 'N/A'}</p>
                  </div>
                  <div className="data-item">
                    <label>Monthly Income</label>
                    <p>₹{selectedEnquiry.monthlyIncome}</p>
                  </div>
                  <div className="data-item">
                    <label>Existing EMIs</label>
                    <p>₹{selectedEnquiry.existingEmi}</p>
                  </div>
                  <div className="data-item">
                    <label>Requested Rate</label>
                    <p>{selectedEnquiry.rate}%</p>
                  </div>
                  <div className="data-item">
                    <label>Requested Tenure</label>
                    <p>{selectedEnquiry.tenure} Months</p>
                  </div>
                  <div className="data-item">
                    <label>Age</label>
                    <p>{selectedEnquiry.age} Years</p>
                  </div>
                </div>

                <div className="documents-section">
                  <h4 style={{ margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} /> Uploaded Documents ({selectedEnquiry.files?.length || 0})
                  </h4>
                  <div className="doc-grid">
                    {selectedEnquiry.files && selectedEnquiry.files.map((f, i) => (
                      <div key={i} className="doc-card">
                        {f.docName && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{f.docName}</span>}
                        <span className="doc-name">{f.name}</span>
                        <a href={f.data} download={f.name} className="btn-small btn-secondary">Download / View</a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="action-section" style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #eee' }}>
                  <button onClick={() => calculateEligibility(selectedEnquiry)} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <Calculator size={20} /> Generate Eligibility Automatically
                  </button>
                  
                  {calculation && (
                    <div className={`calc-result animate-slide-up ${!calculation.eligible ? 'ineligible' : ''}`} style={{ marginTop: 20, padding: 20, borderRadius: 8, background: calculation.eligible ? '#f0fdf4' : '#fef2f2', border: `1px solid ${calculation.eligible ? '#bbf7d0' : '#fecaca'}` }}>
                      <h3 style={{ color: calculation.eligible ? '#16a34a' : '#ef4444', marginBottom: 10 }}>System Result: {calculation.eligible ? 'Eligible' : 'Not Eligible'}</h3>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: 5 }}>Max Amount: {fmt(calculation.maxAmount)}</div>
                      <p style={{ color: '#444' }}>Approved EMI Capacity: {fmt(calculation.availableEmi)}/month</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                <CheckCircle size={48} color="#cbd5e1" style={{ margin: '0 auto 15px' }} />
                <h3>Select an Enquiry</h3>
                <p>Click on an enquiry from the left list to review documents and calculate eligibility.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
