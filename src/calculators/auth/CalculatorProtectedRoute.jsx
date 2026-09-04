// src/calculators/auth/CalculatorProtectedRoute.jsx
// ─────────────────────────────────────────────────────────────────
// Route Guard for Protected Calculator Suite URLs
// Redirects unauthenticated visitors to /calculators/login
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCalculatorAuth } from './CalculatorAuthContext';
import { ShieldCheck } from 'lucide-react';

export default function CalculatorProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useCalculatorAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#0A4F8B'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#0A4F8B',
          borderRadius: '50%',
          animation: 'calcSpin 0.8s linear infinite'
        }} />
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#475569' }}>
          Verifying security authorization...
        </p>
        <style>{`
          @keyframes calcSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginTarget = location.pathname.startsWith('/financial-tools') ? '/financial-tools/login' : '/calculators/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  return children;
}

