// src/calculators/pages/other/GstCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 3.1 GST Calculator (Add GST & Remove Reverse GST)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateGST } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateGST } from '../../utils/validation.js';

export default function GstCalculatorPage() {
  const [amount, setAmount] = useState('10000');
  const [gstRate, setGstRate] = useState('18');
  const [mode, setMode] = useState('add'); // 'add' or 'remove'

  const errors = useMemo(() => {
    return {
      amount: validateNumber(amount, { min: 1, max: 1000000000, fieldName: 'Amount' }),
      gstRate: validateGST(gstRate),
    };
  }, [amount, gstRate]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        amount: parseNumber(amount),
        gstRate: parseNumber(gstRate),
        baseAmount: 0,
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        finalAmount: 0,
      };
    }
    return calculateGST({
      amount: parseNumber(amount),
      gstRate: parseNumber(gstRate),
      mode,
    });
  }, [amount, gstRate, mode, hasErrors]);

  const handleReset = () => {
    setAmount('10000');
    setGstRate('18');
    setMode('add');
  };

  const inputsComponent = (
    <div>
      {/* Mode Toggle */}
      <div className="calc-field-wrap">
        <label className="calc-field-label">Calculation Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            className={`calc-btn ${mode === 'add' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setMode('add')}
          >
            Add GST (Exclusive to Gross)
          </button>
          <button
            type="button"
            className={`calc-btn ${mode === 'remove' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setMode('remove')}
          >
            Remove GST (Inclusive to Net)
          </button>
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="gst-amount">
            {mode === 'add' ? 'Net Base Amount (₹)' : 'Gross (MRP / Inclusive) Amount (₹)'}
          </label>
          <span className="calc-field-hint">{formatINR(amount)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="gst-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`calc-input has-prefix ${errors.amount ? 'calc-input-error' : ''}`}
            placeholder="e.g. 10000"
            min="1"
            step="500"
          />
        </div>
        {errors.amount && <span className="calc-error-text">{errors.amount}</span>}
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="gst-rate">GST Slab Rate (%)</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['5', '12', '18', '28'].map((r) => (
              <button
                key={r}
                type="button"
                className={`calc-btn calc-btn-sm ${gstRate === r ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
                onClick={() => setGstRate(r)}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
        <div className="calc-input-addon-wrap">
          <input
            id="gst-rate"
            type="number"
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            className={`calc-input has-suffix ${errors.gstRate ? 'calc-input-error' : ''}`}
            placeholder="e.g. 18"
            min="0"
            max="50"
            step="1"
          />
          <span className="calc-addon-suffix">%</span>
        </div>
        {errors.gstRate && <span className="calc-error-text">{errors.gstRate}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">
          {mode === 'add' ? 'Total Invoice Amount (Gross)' : 'Original Base Price (Net)'}
        </div>
        <div className="calc-primary-result-value">
          {mode === 'add' ? formatINR(result.finalAmount) : formatINR(result.baseAmount)}
        </div>
        <div className="calc-primary-result-caption">
          GST Amount ({result.gstRate}%): {formatINR(result.gstAmount)}
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Base Net Amount</div>
          <div className="calc-metric-value">{formatINR(result.baseAmount)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total GST Tax ({result.gstRate}%)</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-error)' }}>
            {formatINR(result.gstAmount)}
          </div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">CGST ({result.gstRate / 2}%)</div>
          <div className="calc-metric-value">{formatINR(result.cgstAmount)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">SGST / UTGST ({result.gstRate / 2}%)</div>
          <div className="calc-metric-value">{formatINR(result.sgstAmount)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="GST Calculator">
      <CalculatorShell
        title="GST Calculator"
        category="Other Financial Tools"
        description="Quickly calculate Goods and Services Tax additions and reverse deductions for business invoices, retail bills, and tax filings."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="GST Computation Logic"
        formulaCode={
          mode === 'add'
            ? 'GST Amount = (Base × Rate) / 100 ; Total = Base + GST'
            : 'Base = Total / (1 + Rate/100) ; GST Amount = Total - Base'
        }
        formulaDescription="Supports both standard slab presets (5%, 12%, 18%, 28%) and custom tax percentages with 50/50 CGST & SGST splits."
        disclaimerText="Tax treatment and GST applicability may vary based on the transaction, service, HSN/SAC code, and current CBIC tax notifications."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
