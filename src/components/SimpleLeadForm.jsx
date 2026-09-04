import { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function SimpleLeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: 'Latur',
    state: 'Maharashtra',
    customerProfile: 'Salaried Professional',
    loanType: 'Personal / Salary Loan',
    amount: '₹5–10 Lakh',
    employmentType: 'Salaried',
    monthlyIncome: '₹25,000–₹50,000',
    existingLoan: 'No',
    cibilRange: 'Prefer to discuss',
    contactPreference: 'WhatsApp + Call',
    preferredCallTime: 'Immediately',
    consent: true,
    utm_source: 'website',
    utm_medium: 'cpc',
    utm_campaign: 'ALS_DIRECT_2026',
    utm_content: 'cta',
    utm_term: ''
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [leadResult, setLeadResult] = useState(null);

  // Extract UTM parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFormData(prev => ({
        ...prev,
        utm_source: params.get('utm_source') || prev.utm_source,
        utm_medium: params.get('utm_medium') || prev.utm_medium,
        utm_campaign: params.get('utm_campaign') || prev.utm_campaign,
        utm_content: params.get('utm_content') || prev.utm_content,
        utm_term: params.get('utm_term') || prev.utm_term,
        loanType: params.get('product') || prev.loanType
      }));
    }
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please accept the consent checkbox to proceed.');
      return;
    }
    setStatus('loading');

    try {
      const response = await axios.post('/api/lead/submit', {
        ...formData,
        timestamp: new Date().toISOString(),
        source: formData.utm_source || 'website'
      });

      if (response.data && response.data.success) {
        setLeadResult(response.data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Master lead submission error:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="form-success-card animate-fade-in" style={{ textAlign: 'center', padding: '40px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
        <CheckCircle2 size={64} color="#16a34a" style={{ margin: '0 auto 20px' }} />
        <h3 style={{ color: '#166534', marginBottom: '10px' }}>Application Submitted Successfully!</h3>
        <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
          Lead ID: {leadResult?.leadId || 'ALS-2026-000001'}
        </div>
        <p style={{ color: '#15803d', marginBottom: '20px' }}>
          Thank you, <strong>{formData.name}</strong>. Your enquiry for <strong>{formData.loanType}</strong> has been logged. Our loan advisor will contact you shortly via <strong>{formData.contactPreference}</strong>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <a 
            href={leadResult?.whatsAppUrl || `https://wa.me/919175635165?text=Hello AVANI LOAN SERVICES, I submitted enquiry ${leadResult?.leadId || ''} for ${formData.loanType}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn" 
            style={{ background: '#25D366', color: '#fff', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
          >
            💬 Chat on WhatsApp Now
          </a>
          <button onClick={() => setStatus('idle')} className="btn" style={{ background: 'transparent', border: '1px solid #16a34a', color: '#16a34a', width: '100%', justifyContent: 'center' }}>
            Submit Another Requirement
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="simple-contact-form glass-card" style={{ padding: '30px', background: '#ffffff', borderRadius: '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label className="input-label" style={{ fontWeight: 600 }}>Full Name *</label>
        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Mobile Number *</label>
          <input type="tel" name="phone" required pattern="[0-9]{10}" value={formData.phone} onChange={handleChange} className="form-input" placeholder="10-digit mobile" />
        </div>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Email address (optional)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>City *</label>
          <input type="text" name="city" required value={formData.city} onChange={handleChange} className="form-input" placeholder="Your City (e.g. Latur, Pune)" />
        </div>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>What best describes you? *</label>
          <select name="customerProfile" value={formData.customerProfile} onChange={handleChange} className="form-input">
            <option>Salaried Professional</option>
            <option>Business Owner</option>
            <option>Self-Employed</option>
            <option>Doctor</option>
            <option>Chartered Accountant</option>
            <option>Architect</option>
            <option>Engineer</option>
            <option>Student</option>
            <option>Parent</option>
            <option>Property Buyer</option>
            <option>MSME / SME</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Which loan do you need? *</label>
          <select name="loanType" value={formData.loanType} onChange={handleChange} className="form-input">
            <option>Personal / Salary Loan</option>
            <option>Business Loan</option>
            <option>Doctor Loan</option>
            <option>Home Loan</option>
            <option>Mortgage / Loan Against Property</option>
            <option>Education Loan – India</option>
            <option>Education Loan – Global Studies</option>
            <option>School Funding</option>
            <option>College Funding</option>
            <option>CIBIL Improvement Consultation</option>
            <option>Not Sure – Need Guidance</option>
          </select>
        </div>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Approximate Amount Required? *</label>
          <select name="amount" value={formData.amount} onChange={handleChange} className="form-input">
            <option>Below ₹5 Lakh</option>
            <option>₹5–10 Lakh</option>
            <option>₹10–25 Lakh</option>
            <option>₹25–50 Lakh</option>
            <option>₹50 Lakh–₹1 Crore</option>
            <option>Above ₹1 Crore</option>
            <option>Not Sure</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Employment Type *</label>
          <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="form-input">
            <option>Salaried</option>
            <option>Self-Employed</option>
            <option>Business</option>
            <option>Professional</option>
            <option>Student</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Monthly Income *</label>
          <select name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="form-input">
            <option>Below ₹25,000</option>
            <option>₹25,000–₹50,000</option>
            <option>₹50,000–₹1 Lakh</option>
            <option>₹1–2 Lakh</option>
            <option>₹2–5 Lakh</option>
            <option>Above ₹5 Lakh</option>
            <option>Prefer to discuss with advisor</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Preferred Contact Method *</label>
          <select name="contactPreference" value={formData.contactPreference} onChange={handleChange} className="form-input">
            <option>WhatsApp + Call</option>
            <option>WhatsApp</option>
            <option>Phone Call</option>
            <option>Email</option>
          </select>
        </div>
        <div>
          <label className="input-label" style={{ fontWeight: 600 }}>Preferred Call Time *</label>
          <select name="preferredCallTime" value={formData.preferredCallTime} onChange={handleChange} className="form-input">
            <option>Immediately</option>
            <option>Within 1 Hour</option>
            <option>Today</option>
            <option>Tomorrow</option>
            <option>Prefer WhatsApp</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            name="consent" 
            checked={formData.consent} 
            onChange={handleChange} 
            style={{ marginTop: '3px' }} 
            required
          />
          <span>
            I agree to be contacted by <strong>AVANI LOAN SERVICES</strong> regarding my loan enquiry. Fast application processing and professional loan guidance.
          </span>
        </label>
      </div>

      {status === 'error' && (
        <div style={{ marginBottom: '20px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <span>Something went wrong submitting your form. Please try again or WhatsApp us.</span>
        </div>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
        {status === 'loading' ? 'Processing Application...' : 'Check Loan Eligibility & Submit'} <Send size={18} style={{ marginLeft: '10px' }} />
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={16} color="#0052CC" /> Loan approval is subject to lender eligibility, documentation, credit profile, underwriting and lender policies.
      </p>
    </form>
  );
}

