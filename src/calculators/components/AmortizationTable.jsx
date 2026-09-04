// src/calculators/components/AmortizationTable.jsx
// ─────────────────────────────────────────────────────────────────
// Reusable Amortization Schedule Table (Monthly & Yearly View)
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { formatINR } from '../utils/formatters.js';
import { Table, Calendar, CalendarDays } from 'lucide-react';
import '../styles/calculators.css';

export default function AmortizationTable({ monthly = [], yearly = [], title = 'Repayment Schedule & Amortization' }) {
  const [viewMode, setViewMode] = useState('yearly'); // 'yearly' or 'monthly'

  if ((!monthly || monthly.length === 0) && (!yearly || yearly.length === 0)) {
    return null;
  }

  return (
    <section className="calc-table-container" aria-label="Amortization Schedule">
      <div className="calc-table-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table size={18} color="var(--calc-primary)" />
          <h3 className="calc-table-title">{title}</h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`calc-btn calc-btn-sm ${viewMode === 'yearly' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setViewMode('yearly')}
          >
            <Calendar size={14} />
            <span>Yearly Summary</span>
          </button>
          <button
            type="button"
            className={`calc-btn calc-btn-sm ${viewMode === 'monthly' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setViewMode('monthly')}
          >
            <CalendarDays size={14} />
            <span>Monthly Breakdown</span>
          </button>
        </div>
      </div>

      <div className="calc-table-scroll">
        {viewMode === 'yearly' ? (
          <table className="calc-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Principal Paid (₹)</th>
                <th>Interest Paid (₹)</th>
                <th>Total Payment (₹)</th>
                <th>Ending Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {yearly.map((row) => (
                <tr key={row.year}>
                  <td style={{ fontWeight: 600 }}>Year {row.year}</td>
                  <td style={{ color: 'var(--calc-primary)', fontWeight: 600 }}>{formatINR(row.principalPaid)}</td>
                  <td style={{ color: 'var(--calc-accent)', fontWeight: 600 }}>{formatINR(row.interestPaid)}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(row.totalPaid)}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="calc-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>EMI (₹)</th>
                <th>Principal Paid (₹)</th>
                <th>Interest Paid (₹)</th>
                <th>Ending Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.month}>
                  <td style={{ fontWeight: 600 }}>Month {row.month}</td>
                  <td>{formatINR(row.emi)}</td>
                  <td style={{ color: 'var(--calc-primary)' }}>{formatINR(row.principalPaid)}</td>
                  <td style={{ color: 'var(--calc-accent)' }}>{formatINR(row.interestPaid)}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
