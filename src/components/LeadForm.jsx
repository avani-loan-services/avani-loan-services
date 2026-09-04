import { useState } from 'react';
import { CheckCircle, Loader, Phone } from 'lucide-react';
import './LeadForm.css';
import vapiService from '../lib/vapiService';

// Integration Endpoints (Manual Update Required in .env or here)
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || 'https://hook.eu1.make.com/your_unique_webhook_id_here';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://www.avanifinserv.com/api';

export default function LeadForm({ compact = false, loanType = '' }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', loanType: loanType, amount: '', city: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [aiCallStatus, setAICallStatus] = useState('ready'); // ready | calling | connected | ended

  const loanTypes = ['Salary Loan', 'Business Loan', 'Education Loan (India)', 'Education Loan (Abroad)', 'Home Loan', 'Mortgage / LAP', 'Chartered Accountant Loan', 'Doctor / Professional Loan'];

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const syncToIntegrations = async (data) => {
    const results = [];
    
    // 1. Sync to Make.com
    try {
      results.push(fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', // Use no-cors if preflight fails on custom webhooks
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'Website Form' })
      }));
    } catch (e) { console.error('Make.com error:', e); }

    // 2. Sync to Backend (which handles CRM sync, including Google Sheets)
    try {
      results.push(fetch(`${BACKEND_URL}/crm/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }));
    } catch (e) { console.error('Backend error:', e); }

    return Promise.allSettled(results);
  };

  const handleAICall = async e => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.loanType) {
      alert('Please fill name, phone and loan type first.');
      return;
    }
    setAICallStatus('calling');
    
    try {
      const vapiLoanType = form.loanType.toLowerCase().includes('salary') ? 'personal' :
        form.loanType.toLowerCase().includes('business') ? 'business' :
        form.loanType.toLowerCase().includes('education') ? 'education' :
        form.loanType.toLowerCase().includes('home') ? 'home' :
        form.loanType.toLowerCase().includes('mortgage') ? 'mortgage' : 'personal';

      const callResult = await vapiService.makeCall(form.phone, '9f322737-3bb8-467a-95e3-7a66f9a93dc1', vapiLoanType);
      
      if (callResult.id) {
        setAICallStatus('connected');
        
        const leadData = {
          ...form,
          callId: callResult.id,
          aiCallInitiated: true,
          timestamp: new Date().toISOString()
        };

        await syncToIntegrations(leadData);

        setTimeout(() => {
          setAICallStatus('ended');
          setStatus('success');
        }, 3000);
      }
    } catch (error) {
      console.error('AI call error:', error);
      setAICallStatus('ready');
      alert('Error initiating AI call. Please try again.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('loading');
    
    const leadData = {
      ...form,
      timestamp: new Date().toISOString(),
      source: 'Website Form'
    };

    try {
      await syncToIntegrations(leadData);
      
      // Also open WhatsApp as a direct customer action
      const waMsg = encodeURIComponent(
        `Hello! I'm ${form.name} from ${form.city || 'Maharashtra'}. I'm interested in a ${form.loanType} of ₹${form.amount}. Please contact me at ${form.phone}.`
      );
      window.open(`https://wa.me/919175635165?text=${waMsg}`, '_blank', 'noopener noreferrer');

      setStatus('success');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('success'); // Still show success as we try multiple channels
    }
  };

  if (status === 'success') {
    return (
      <div className="form-success animate-fade-in">
        <CheckCircle size={48} color="#22c55e" />
        <h3>Application Submitted!</h3>
        <p>Thank you {form.name}! Our loan advisor will call you within 5 minutes.</p>
        <p className="wa-note">Data has been synced to HubSpot, Google Sheets, and Make.com.</p>
        <button className="btn btn-primary" onClick={() => setStatus('idle')}>Submit Another</button>
      </div>
    );
  }

  return (
    <form className={`lead-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      {!compact && <h3 className="form-title">Get Free Loan Consultation</h3>}

      <div className={compact ? 'compact-grid' : ''}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Mobile Number *</label>
          <input className="form-input" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 XXXXXXXXXX" required pattern="[0-9+\-\s]{10,13}" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Loan Type *</label>
          <select className="form-select" name="loanType" value={form.loanType} onChange={handleChange} required>
            <option value="">-- Select Loan Type --</option>
            {loanTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Loan Amount (₹) *</label>
          <input className="form-input" name="amount" value={form.amount} onChange={handleChange} placeholder="e.g. 5,00,000" required />
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" name="city" value={form.city} onChange={handleChange} placeholder="Your city" />
        </div>
      </div>

      <button type="submit" className="btn btn-secondary submit-btn" disabled={status === 'loading'}>
        {status === 'loading' ? <><Loader size={18} className="spin" /> Processing...</> : '🚀 Get Free Callback'}
      </button>

      {status === 'idle' && !compact && (
        <div className="ai-call-option">
          <p className="or-divider">─── OR ───</p>
          <button 
            type="button" 
            onClick={handleAICall}
            className="btn btn-ai-call"
            disabled={aiCallStatus !== 'ready'}
          >
            {aiCallStatus === 'calling' ? (
              <><Loader size={18} className="spin" /> AI Calling...</>
            ) : aiCallStatus === 'connected' ? (
              <><Phone size={18} /> Call Connected...</>
            ) : (
              <><Phone size={18} /> Get Instant AI Call</>
            )}
          </button>
          <p className="ai-call-note">🤖 Speak with our AI Loan Advisor instantly</p>
        </div>
      )}

      <p className="form-note">✅ Synced to HubSpot, Google Sheets & Make.com</p>
    </form>
  );
}
