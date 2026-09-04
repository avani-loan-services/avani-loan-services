import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import vapiService from '../lib/vapiService';
import '../pages/AIAssistant.css';
import brandLogo from '../assets/avani-brand-logo.png';

const AIAssistant = () => {
  const { language } = useContext(LanguageContext);
  const [selectedLoan, setSelectedLoan] = useState('personal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [callData, setCallData] = useState(null);
  const [callLog, setCallLog] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [assistantId, setAssistantId] = useState('9f322737-3bb8-467a-95e3-7a66f9a93dc1');

  const loanTypes = {
    personal: { name: 'Personal Loan', icon: '💳', color: '#007bff' },
    business: { name: 'Business Loan', icon: '💼', color: '#28a745' },
    doctor: { name: 'Doctor Loan', icon: '🏥', color: '#dc3545' },
    home: { name: 'Home Loan', icon: '🏠', color: '#ffc107' },
    education: { name: 'Education Loan', icon: '📚', color: '#17a2b8' },
    mortgage: { name: 'Mortgage Loan', icon: '🏢', color: '#6f42c1' }
  };

  const translations = {
    en: {
      title: 'AI Calling Assistant',
      subtitle: 'Select a loan type to initiate AI call',
      selectLoan: 'Select Loan Type',
      phoneLabel: 'Customer Phone Number',
      phonePlaceholder: '+91 XXXXXXXXXX',
      startCall: 'Start AI Call',
      endCall: 'End Call',
      calling: 'Calling...',
      connected: 'Connected',
      callDuration: 'Call Duration',
      transcript: 'Call Transcript',
      callHistory: 'Call History',
      noCallHistory: 'No calls yet',
      successRate: 'Success Rate',
      totalCalls: 'Total Calls',
      avgDuration: 'Avg Duration',
      qualificationStatus: 'Qualification Status',
      qualified: 'Qualified',
      needsReview: 'Needs Review',
      notQualified: 'Not Qualified'
    },
    hi: {
      title: 'एआई कॉलिंग सहायक',
      subtitle: 'एआई कॉल शुरू करने के लिए एक लोन प्रकार चुनें',
      selectLoan: 'लोन प्रकार चुनें',
      phoneLabel: 'ग्राहक फोन नंबर',
      phonePlaceholder: '+91 XXXXXXXXXX',
      startCall: 'एआई कॉल शुरू करें',
      endCall: 'कॉल समाप्त करें',
      calling: 'कॉल कर रहे हैं...',
      connected: 'जुड़ा हुआ',
      callDuration: 'कॉल की अवधि',
      transcript: 'कॉल प्रतिलेख',
      callHistory: 'कॉल इतिहास',
      noCallHistory: 'अभी तक कोई कॉल नहीं',
      successRate: 'सफलता दर',
      totalCalls: 'कुल कॉल',
      avgDuration: 'औसत अवधि',
      qualificationStatus: 'योग्यता स्थिति',
      qualified: 'योग्य',
      needsReview: 'समीक्षा की आवश्यकता',
      notQualified: 'योग्य नहीं'
    },
    mr: {
      title: 'एआই कॉलिंग सहायक',
      subtitle: 'एआই कॉल सुरू करण्यासाठी लोन प्रकार निवडा',
      selectLoan: 'लोन प्रकार निवडा',
      phoneLabel: 'ग्राहक फोन नंबर',
      phonePlaceholder: '+91 XXXXXXXXXX',
      startCall: 'एआई कॉल सुरू करा',
      endCall: 'कॉल समाप्त करा',
      calling: 'कॉल करत आहे...',
      connected: 'जुडला',
      callDuration: 'कॉलची अवधी',
      transcript: 'कॉल लिप्यंतरण',
      callHistory: 'कॉल इतिहास',
      noCallHistory: 'अद्याप कोणत्याही कॉलस्टॅटस नाही',
      successRate: 'यशस्वी दर',
      totalCalls: 'एकूण कॉल',
      avgDuration: 'सरासरी अवधी',
      qualificationStatus: 'योग्यता स्थिती',
      qualified: 'योग्य',
      needsReview: 'समीक्षा आवश्यक',
      notQualified: 'योग्य नाही'
    }
  };

  const t = translations[language] || translations.en;

  // Initialize call timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [callStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartCall = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setCallStatus('calling');
    try {
      // Make the outbound call
      const callResult = await vapiService.makeCall(phoneNumber, assistantId, selectedLoan);

      if (callResult.id) {
        setCallStatus('connected');
        setCallData({
          id: callResult.id,
          phoneNumber,
          loanType: selectedLoan,
          startTime: new Date().toISOString()
        });

        // Add to call log
        setCallLog(prev => [...prev, { ...callResult, timestamp: new Date() }]);

        // Simulate call webhook processing
        setTimeout(async () => {
          try {
            const callDetails = await vapiService.getCallDetails(callResult.id);
            setTranscript(callDetails.transcript || '');
          } catch (error) {
            console.error('Error fetching call details:', error);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call. Please try again.');
      setCallStatus('idle');
    }
  };

  const handleEndCall = () => {
    if (callData && transcript) {
      // Save call data
      vapiService.saveLeadData({
        callId: callData.id,
        phoneNumber: callData.phoneNumber,
        loanType: callData.loanType,
        duration: callDuration,
        transcript,
        timestamp: callData.startTime
      });
    }

    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
      setPhoneNumber('');
      setTranscript('');
      setCallData(null);
    }, 2000);
  };

  const handleSendWhatsApp = async (index) => {
    const call = callLog[index];
    try {
      await vapiService.sendWhatsAppMessage(
        call.phoneNumber,
        `Hi! Thank you for speaking with our AI assistant about ${loanTypes[call.loanType].name}. Here's a summary of our discussion...`,
        call.loanType
      );
      alert('WhatsApp message sent successfully!');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="page-header-top">
        <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
        <div>
          <h1>{t.title}</h1>
          <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
        </div>
      </div>
      <div className="ai-assistant-header">
        <p>{t.subtitle}</p>
      </div>

      <div className="ai-assistant-content">
        {/* Loan Type Selection */}
        <div className="loan-selection-panel">
          <h2>{t.selectLoan}</h2>
          <div className="loan-types-grid">
            {Object.entries(loanTypes).map(([key, value]) => (
              <button
                key={key}
                className={`loan-type-btn ${selectedLoan === key ? 'active' : ''}`}
                onClick={() => setSelectedLoan(key)}
                style={{ borderColor: selectedLoan === key ? value.color : '#ddd' }}
              >
                <span className="loan-icon">{value.icon}</span>
                <span className="loan-name">{value.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Input & Call Controls */}
        <div className="call-control-panel">
          <div className="phone-input-group">
            <label>{t.phoneLabel}</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phonePlaceholder}
              disabled={callStatus !== 'idle'}
              className="phone-input"
            />
          </div>

          {callStatus === 'idle' && (
            <button onClick={handleStartCall} className="btn-start-call">
              {t.startCall}
            </button>
          )}

          {callStatus === 'calling' && (
            <div className="calling-indicator">
              <div className="pulse"></div>
              <p>{t.calling}</p>
            </div>
          )}

          {callStatus === 'connected' && (
            <>
              <div className="connected-indicator">
                <div className="connected-badge">{t.connected}</div>
                <div className="call-timer">
                  {t.callDuration}: <span>{formatTime(callDuration)}</span>
                </div>
              </div>
              <button onClick={handleEndCall} className="btn-end-call">
                {t.endCall}
              </button>
            </>
          )}

          {callStatus === 'ended' && (
            <div className="call-ended-message">
              ✓ Call ended successfully
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="transcript-panel">
            <h3>{t.transcript}</h3>
            <div className="transcript-content">
              <p>{transcript}</p>
            </div>
          </div>
        )}

        {/* Call History */}
        <div className="call-history-panel">
          <h3>{t.callHistory}</h3>
          {callLog.length === 0 ? (
            <p className="no-history">{t.noCallHistory}</p>
          ) : (
            <div className="call-history-list">
              {callLog.map((call, index) => (
                <div key={index} className="call-history-item">
                  <div className="call-info">
                    <span className="call-loan-type">{loanTypes[call.loanType]?.name}</span>
                    <span className="call-phone">{call.phoneNumber}</span>
                    <span className="call-time">{new Date(call.timestamp).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleSendWhatsApp(index)}
                    className="btn-whatsapp"
                    title="Send WhatsApp Follow-up"
                  >
                    💬
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call Statistics */}
        <div className="statistics-panel">
          <div className="stat-card">
            <h4>{t.totalCalls}</h4>
            <p className="stat-value">{callLog.length}</p>
          </div>
          <div className="stat-card">
            <h4>{t.successRate}</h4>
            <p className="stat-value">{callLog.length > 0 ? '85%' : '-'}</p>
          </div>
          <div className="stat-card">
            <h4>{t.avgDuration}</h4>
            <p className="stat-value">
              {callLog.length > 0 ? formatTime(Math.floor(callDuration / callLog.length)) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
