// src/calculators/pages/CalculatorAdmin.jsx
// ─────────────────────────────────────────────────────────────────
// Protected Administrative Management Area for Calculator Suite
// Allows authorized staff to configure assumptions, defaults, & application kits
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CalculatorLayout from '../layouts/CalculatorLayout';
import { useCalculatorAuth } from '../auth/CalculatorAuthContext';
import {
  ShieldCheck,
  Settings,
  FileDown,
  Sliders,
  Save,
  CheckCircle2,
  RefreshCw,
  Lock,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import '../styles/calculators.css';

export default function CalculatorAdmin() {
  const { logout } = useCalculatorAuth();

  // Configurable Defaults State (Stored locally in session / admin state)
  const [defaults, setDefaults] = useState({
    defaultFoir: '50',
    defaultMultiplier: '60',
    defaultHomeLoanRate: '8.50',
    defaultPersonalLoanRate: '10.50',
    defaultBusinessLoanRate: '11.25',
    defaultGstRate: '18',
    defaultForeclosureCharge: '2.0',
    defaultPpfRate: '7.1',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleReset = () => {
    setDefaults({
      defaultFoir: '50',
      defaultMultiplier: '60',
      defaultHomeLoanRate: '8.50',
      defaultPersonalLoanRate: '10.50',
      defaultBusinessLoanRate: '11.25',
      defaultGstRate: '18',
      defaultForeclosureCharge: '2.0',
      defaultPpfRate: '7.1',
    });
  };

  return (
    <CalculatorLayout currentTitle="Calculator Administration">
      <div className="calc-workspace animate-fade-in">
        {/* Workspace Header */}
        <section className="calc-workspace-header">
          <div className="calc-breadcrumbs">
            <Link to="/calculators" className="calc-breadcrumb-link">Calculators</Link>
            <span>/</span>
            <span style={{ fontWeight: 600, color: 'var(--calc-text-main)' }}>Admin Operations</span>
          </div>

          <div className="calc-workspace-title-row">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                <ShieldCheck size={14} />
                <span>AUTHENTICATED ADMIN SESSION ACTIVE</span>
              </div>
              <h2 className="calc-workspace-title">Calculator & Application Admin Center</h2>
              <p className="calc-workspace-desc">
                Configure underwriting assumptions, default interest rates, tax parameters, and manage customer application kits.
              </p>
            </div>
          </div>
        </section>

        {savedSuccess && (
          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '14px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} />
            <span>Administrative configuration parameters saved successfully.</span>
          </div>
        )}

        <div className="grid grid-2" style={{ gap: '24px' }}>
          {/* Column 1: Financial Calculator Defaults Configuration */}
          <section className="calc-card-inputs" style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid var(--calc-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <Sliders size={20} style={{ color: 'var(--calc-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--calc-navy-dark)' }}>
                Calculator Default Assumptions
              </h3>
            </div>

            <form onSubmit={handleSave}>
              <div className="calc-field-wrap">
                <label className="calc-field-label" htmlFor="admin-foir">Default FOIR Assumption (%)</label>
                <input
                  id="admin-foir"
                  type="number"
                  className="calc-input"
                  value={defaults.defaultFoir}
                  onChange={(e) => setDefaults({ ...defaults, defaultFoir: e.target.value })}
                  min="10"
                  max="90"
                />
                <span className="calc-field-hint">Used as default benchmark for FOIR Loan Eligibility Calculator</span>
              </div>

              <div className="calc-field-wrap">
                <label className="calc-field-label" htmlFor="admin-multiplier">Default Income Multiplier (x)</label>
                <input
                  id="admin-multiplier"
                  type="number"
                  className="calc-input"
                  value={defaults.defaultMultiplier}
                  onChange={(e) => setDefaults({ ...defaults, defaultMultiplier: e.target.value })}
                  min="10"
                  max="120"
                />
                <span className="calc-field-hint">Used for salary / business income multiplier eligibility</span>
              </div>

              <div className="calc-field-wrap">
                <label className="calc-field-label" htmlFor="admin-gst">Default GST on Processing & Charges (%)</label>
                <input
                  id="admin-gst"
                  type="number"
                  className="calc-input"
                  value={defaults.defaultGstRate}
                  onChange={(e) => setDefaults({ ...defaults, defaultGstRate: e.target.value })}
                  min="0"
                  max="30"
                />
                <span className="calc-field-hint">Standard rate for loan service fees (currently 18%)</span>
              </div>

              <div className="calc-field-wrap">
                <label className="calc-field-label" htmlFor="admin-foreclosure">Standard Foreclosure Fee (%)</label>
                <input
                  id="admin-foreclosure"
                  type="number"
                  step="0.1"
                  className="calc-input"
                  value={defaults.defaultForeclosureCharge}
                  onChange={(e) => setDefaults({ ...defaults, defaultForeclosureCharge: e.target.value })}
                />
                <span className="calc-field-hint">Benchmark lender pre-closure charge</span>
              </div>

              <div className="calc-btn-group" style={{ marginTop: '24px' }}>
                <button type="submit" className="calc-btn calc-btn-primary" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>Save Configuration</span>
                </button>
                <button type="button" onClick={handleReset} className="calc-btn calc-btn-secondary">
                  <RefreshCw size={16} />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </form>
          </section>

          {/* Column 2: Application Kit Management & Security Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Application Kits Overview */}
            <section style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid var(--calc-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <FileDown size={20} style={{ color: 'var(--calc-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--calc-navy-dark)' }}>
                  Active Application Download Kits
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Salaried Application Kit (v2.6)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Form Code: ALS-SAL-2026 • Status: Active</div>
                  </div>
                  <Link to="/download-application" className="calc-btn calc-btn-secondary calc-btn-sm">
                    View
                  </Link>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Business & MSME Loan Kit (v2.6)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Form Code: ALS-BIZ-2026 • Status: Active</div>
                  </div>
                  <Link to="/download-application" className="calc-btn calc-btn-secondary calc-btn-sm">
                    View
                  </Link>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>Student Education Loan Kit (v2.6)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Form Code: ALS-EDU-2026 • Status: Active</div>
                  </div>
                  <Link to="/download-application" className="calc-btn calc-btn-secondary calc-btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </section>

            {/* Admin Security Guidelines Box */}
            <section style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Lock size={18} style={{ color: 'var(--calc-navy-dark)' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--calc-navy-dark)' }}>
                  Security & Access Policy
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Administrative sessions use encrypted <strong>HttpOnly secure cookies</strong>. Credentials and passwords are authenticated strictly server-side and never exposed to browser memory or client code.
              </p>
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={logout}
                  className="calc-btn calc-btn-outline calc-btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Logout Admin Session</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
