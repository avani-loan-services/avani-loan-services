// src/calculators/pages/CalculatorLogin.jsx
// ─────────────────────────────────────────────────────────────────
// Professional Login Experience for AVANI Financial Calculator Suite
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCalculatorAuth } from '../auth/CalculatorAuthContext';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, ArrowRight, Calculator } from 'lucide-react';
import logo from '../../assets/avani-brand-logo.png';
import '../styles/calculators.css';

export default function CalculatorLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useCalculatorAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/financial-tools';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login(password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.message || 'Invalid password.');
    }
  };

  return (
    <div className="calc-login-page">
      <div className="calc-login-container animate-fade-in">
        {/* Brand Header */}
        <div className="calc-login-header">
          <div className="calc-login-logo-wrapper">
            <img src={logo} alt="AVANI LOAN SERVICES Logo" className="calc-login-logo" />
          </div>
          <div className="calc-login-badge">
            <Calculator size={16} />
            <span>Authorized Security Protocol</span>
          </div>
          <h1 className="calc-login-title">AVANI FINANCIAL TOOLS</h1>
          <h2 className="calc-login-subtitle">Loan, Investment & Financial Calculators</h2>
          <p className="calc-login-caption">
            Underwriting Tools, Intelligence Engines & Document Assessment Portal
          </p>
        </div>

        {/* Security Form */}
        <form onSubmit={handleSubmit} className="calc-login-form">
          <div className="calc-input-group">
            <label className="calc-label" htmlFor="calc-password">
              Security Access Password
            </label>
            <div className="calc-password-input-wrap">
              <input
                id="calc-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter access password..."
                autoComplete="current-password"
                required
                className={`calc-input ${errorMsg ? 'calc-input-error' : ''}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="calc-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="calc-error-banner" role="alert">
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="calc-btn calc-btn-primary calc-btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="calc-spinner-sm" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <KeyRound size={18} />
                <span>Access Admin Center</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="calc-login-footer-info">
            <p>🔒 Server-Enforced Access Protocol • Encrypted Session</p>
            <p className="calc-login-subtext">
              Authorized for financial advisors, consultants & loan professionals.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
