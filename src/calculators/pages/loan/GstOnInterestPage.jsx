// src/calculators/pages/loan/GstOnInterestPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.10 GST on Interest / Loan Charges Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateGSTOnInterest } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateGST } from '../../utils/validation.js';

export default function GstOnInterestPage() {
  const [baseAmount, setBaseAmount] = useState('10000');
  const [gstRate, setGstRate] = useState('18');

  const errors = useMemo(() => {
    return {
      baseAmount: validateNumber(baseAmount, { min: 1, max: 100000000, fieldName: 'Base Amount' }),
      gstRate: validateGST(gstRate),
    };
  }, [baseAmount, gstRate]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        baseAmount: parseNumber(baseAmount),
        gstRate: parseNumber(gstRate),
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: 0,
      };
    }
    return calculateGSTOnInterest({
      baseAmount: parseNumber(baseAmount),
      gstRate: parseNumber(gstRate),
    });
  }, [baseAmount, gstRate, hasErrors]);

  const handleReset = () => {
    setBaseAmount('10000');
    setGstRate('18');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="gsti-base">
            Charge / Interest Base Amount (₹)
          </label>
          <span className="calc-field-hint">{formatINR(baseAmount)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="gsti-base"
            type="number"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            className={`calc-input has-prefix ${errors.baseAmount ? 'calc-input-error' : ''}`}
            placeholder="e.g. 10000"
            min="1"
            step="500"
          />
        </div>
        {errors.baseAmount && <span className="calc-error-text">{errors.baseAmount}</span>}
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="gsti-rate">Applicable GST Rate (%)</label>
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
            id="gsti-rate"
            type="number"
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            className={`calc-input has-suffix ${errors.gstRate ? 'calc-input-error' : ''}`}
            placeholder="e.g. 18"
            min="0"
            max="40"
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
        <div className="calc-primary-result-label">Total Amount Payable (Inclusive of GST)</div>
        <div className="calc-primary-result-value">{formatINR(result.totalAmount)}</div>
        <div className="calc-primary-result-caption">
          Base {formatINR(result.baseAmount)} + GST ({result.gstRate}%) {formatINR(result.gstAmount)}
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">CGST Component ({result.gstRate / 2}%)</div>
          <div className="calc-metric-value">{formatINR(result.cgstAmount)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">SGST Component ({result.gstRate / 2}%)</div>
          <div className="calc-metric-value">{formatINR(result.sgstAmount)}</div>
        </div>
        <div className="calc-metric-card" style={{ gridColumn: '1 / -1' }}>
          <div className="calc-metric-label">Total Tax Amount (CGST + SGST)</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-error)' }}>
            {formatINR(result.gstAmount)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="GST on Interest & Charges">
      <CalculatorShell
        title="GST on Loan Charges & Interest Calculator"
        category="Loan Calculators"
        description="Compute Goods and Services Tax (GST) breakdown on loan processing fees, legal charges, penal interest, and banking services."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Tax Calculation Formula"
        formulaCode="Total = Base + (Base × GST Rate %); CGST = SGST = (GST Amount / 2)"
        formulaDescription="Standard Indian banking and NBFC services generally attract 18% GST (9% CGST + 9% SGST for intra-state supply)."
        disclaimerText="GST applicability depends on the nature of the charge/service and applicable tax rules. Pure interest on standard loans/advances is typically exempt from GST, whereas processing fees, prepayment fees, documentation fees, and penal interest attract standard GST. Verify lender tax invoices."
        calcTag="gst-interest"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
