// src/components/ErrorBoundary.jsx
// ─────────────────────────────────────────────────────────────────
// Production React Error Boundary to Prevent Blank Screen Crashes
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught component crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#F8FAFC'
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#1E293B', margin: '0 0 10px 0' }}>
              Service Temporarily Unavailable
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              We encountered a minor issue loading this page section. Please refresh or return to home.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: '#0052CC',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={18} /> Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
