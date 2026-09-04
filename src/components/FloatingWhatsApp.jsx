import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FloatingActionButtons.css'; // Shared CSS for floating buttons

export default function FloatingWhatsApp() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });

  useEffect(() => {
    // Capture UTM parameters from URL
    const params = new URLSearchParams(window.location.search);
    setUtm({
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || ''
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send data to our unified CRM endpoint
      await axios.post('/api/crm/sync', {
        name: formData.name,
        phone: formData.phone,
        source: 'WhatsApp_Floating_Button',
        campaign: utm.campaign || 'Organic',
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        timestamp: new Date().toISOString()
      });

      // Open WhatsApp after successful capture
      const message = encodeURIComponent(`Hi Avani Loan Service! My name is ${formData.name}. I need help with a loan.`);
      window.open(`https://wa.me/919175635165?text=${message}`, '_blank');
      
      setShowForm(false);
    } catch (err) {
      console.error('CRM Sync Failed:', err);
      // Fallback: Open WhatsApp anyway
      window.open('https://wa.me/919175635165', '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fab-wrapper whatsapp-fab">
      {showForm && (
        <div className="fab-form-popup slide-in-bottom">
          <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
          <h4>Chat on WhatsApp 💬</h4>
          <p>Please enter your details</p>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Your Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <button type="submit" disabled={loading} className="wa-submit-btn">
              {loading ? 'Connecting...' : 'Start Chat'}
            </button>
          </form>
        </div>
      )}
      
      <button 
        className="fab-btn wa-bg-color" 
        onClick={() => setShowForm(!showForm)}
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  );
}
