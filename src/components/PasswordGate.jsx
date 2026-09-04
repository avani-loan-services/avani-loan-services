// src/components/PasswordGate.jsx
// ─────────────────────────────────────────────────────────────────
// Password Gate Security Layer for Sensitive Operations
// Enforced via Server-Side Session Authentication
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';

export default function PasswordGate({ children, pageTitle = 'Protected Access Area' }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Verify server session
    fetch('/api/calculator-auth/verify', {
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.authenticated) {
          setAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMsg('Please enter security password.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/calculator-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setAuthenticated(true);
      } else {
        setErrorMsg(data.message || 'Incorrect Password! Please enter valid security password.');
      }
    } catch {
      setErrorMsg('Network error during authentication. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A4F8B' }}>
        <p style={{ fontWeight: 600 }}>Verifying access authorization...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A6B 0%, #0052CC 100%)',
          padding: '30px 24px',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            backdropFilter: 'blur(4px)'
          }}>
            <Lock size={32} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', color: '#FFFFFF' }}>
            Security Authorization Required
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#93C5FD' }}>
            {pageTitle} is password protected
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUnlock} style={{ padding: '30px 24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#334155', marginBottom: '8px' }}>
              Enter Security Password
            </label>
            
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password to unlock..."
                required
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 16px',
                  borderRadius: '8px',
                  border: errorMsg ? '2px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <ShieldAlert size={20} color="#DC2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1B3A6B 0%, #0052CC 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)'
            }}
          >
            <KeyRound size={18} /> Unlock Page Access
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748B', marginTop: '20px', margin: '20px 0 0 0' }}>
            🔒 Protected by AVANI LOAN SERVICES Security Protocol
          </p>
        </form>
      </div>
    </div>
  );
}
