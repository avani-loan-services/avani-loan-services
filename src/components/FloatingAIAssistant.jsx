import React, { useState } from 'react';
import axios from 'axios';
import './FloatingActionButtons.css';

export default function FloatingAIAssistant() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', language: 'marathi' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCallStatus('Initiating call...');

    try {
      // 1. Send request to CRM and Backend to trigger OmniDM call
      await axios.post('/api/crm/sync', {
        name: formData.name,
        phone: formData.phone,
        source: 'OmniDM_Floating_Button',
        campaign: 'AI Voice Assistant Request',
        language: formData.language,
        timestamp: new Date().toISOString()
      });

      // Simulate API call to OmniDM to initiate the call
      setTimeout(() => {
        setCallStatus(`Success! Our ${formData.language === 'marathi' ? 'Marathi' : 'Hindi'} AI Agent is calling you now.`);
        setLoading(false);
        
        // Hide form after 5 seconds
        setTimeout(() => {
          setShowForm(false);
          setCallStatus('');
        }, 5000);
      }, 1500);

    } catch (err) {
      console.error('Call Request Failed:', err);
      setCallStatus('Failed to connect. Please try again or use WhatsApp.');
      setLoading(false);
    }
  };

  return (
    <div className="fab-wrapper ai-fab">
      {showForm && (
        <div className="fab-form-popup slide-in-bottom">
          <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
          <h4>AI Voice Assistant 🎙️</h4>
          <p>Request an instant AI callback</p>
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
            <select 
              value={formData.language} 
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              required
            >
              <option value="marathi">Marathi Agent</option>
              <option value="hindi">Hindi Agent</option>
            </select>
            <button type="submit" disabled={loading} className="ai-submit-btn">
              {loading ? 'Connecting...' : 'Call Me Now'}
            </button>
          </form>
          {callStatus && (
            <div className="call-status">
              {callStatus}
            </div>
          )}
        </div>
      )}
      
      <button 
        className="fab-btn ai-bg-color" 
        onClick={() => setShowForm(!showForm)}
        title="Talk to AI Assistant"
      >
        <svg viewBox="0 0 24 24" fill="white" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>
    </div>
  );
}
