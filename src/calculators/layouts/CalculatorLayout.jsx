// src/calculators/layouts/CalculatorLayout.jsx
// ─────────────────────────────────────────────────────────────────
// Main Suite Layout with Topbar, Brand Header, Breadcrumbs & Actions
// Supports Public Navigation and Protected Admin Access
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCalculatorAuth } from '../auth/CalculatorAuthContext';
import {
  Calculator,
  LogOut,
  LayoutDashboard,
  Printer,
  ShieldCheck,
  FileDown,
  Lock
} from 'lucide-react';
import logo from '../../assets/avani-brand-logo.png';
import '../styles/calculators.css';

export default function CalculatorLayout({ children }) {
  const { isAuthenticated, logout } = useCalculatorAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/calculators', { replace: true });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="calc-suite-container animate-fade-in">
      {/* Top Suite Bar */}
      <header className="calc-topbar">
        <Link to="/calculators" className="calc-topbar-brand">
          <img src={logo} alt="AVANI LOAN SERVICES Logo" className="calc-topbar-logo" />
          <div>
            <h1 className="calc-topbar-title">AVANI LOAN SERVICES</h1>
            <p className="calc-topbar-subtitle">Financial Calculator Suite</p>
          </div>
        </Link>

        <div className="calc-topbar-actions">
          <Link to="/financial-tools" className="calc-btn calc-btn-secondary calc-btn-sm" title="Financial Tools Hub">
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>

          <Link to="/financial-tools/eligibility" className="calc-btn calc-btn-primary calc-btn-sm" title="AI Loan Eligibility Assessment">
            <ShieldCheck size={16} />
            <span>Check Eligibility</span>
          </Link>

          <Link to="/download-application" className="calc-btn calc-btn-secondary calc-btn-sm" title="Download Official Application Forms & Kits">
            <FileDown size={16} />
            <span>Application Kits</span>
          </Link>

          <button
            onClick={handlePrint}
            className="calc-btn calc-btn-secondary calc-btn-sm"
            title="Print this financial calculation"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/financial-tools/admin" className="calc-btn calc-btn-secondary calc-btn-sm" title="Open Admin Operations">
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>

              <button
                onClick={handleLogout}
                className="calc-btn calc-btn-outline calc-btn-sm"
                title="Logout of Session"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/financial-tools/login"
              className="calc-btn calc-btn-ghost calc-btn-sm"
              title="Login with Security Password"
              style={{ color: '#64748b' }}
            >
              <Lock size={14} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Calculator Content */}
      <main id="calculator-printable-area">
        {children}
      </main>
    </div>
  );
}
