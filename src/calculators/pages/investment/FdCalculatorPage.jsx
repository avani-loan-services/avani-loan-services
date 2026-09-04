// src/calculators/pages/investment/FdCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 2.1 Fixed Deposit (FD) Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateFD } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateInterestRate } from '../../utils/validation.js';

export default function FdCalculatorPage() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('7.5');
  const [tenureYears, setTenureYears] = useState('3');
  const [compoundingFrequency, setCompoundingFrequency] = useState('quarterly'); // 'monthly', 'quarterly', 'half_yearly', 'yearly'

  const errors = useMemo(() => {
    return {
      principal: validateNumber(principal, { min: 1000, max: 1000000000, fieldName: 'Deposit Principal' }),
      rate: validateInterestRate(rate),
      tenureYears: validateNumber(tenureYears, { min: 0.1, max: 30, fieldName: 'Tenure Years' }),
    };
  }, [principal, rate, tenureYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        principal: parseNumber(principal),
        maturityAmount: 0,
        interestEarned: 0,
      };
    }
    const months = parseNumber(tenureYears) * 12;
    return calculateFD({
      principal: parseNumber(principal),
      rate: parseNumber(rate),
      tenureMonths: months,
      compoundingFrequency,
    });
  }, [principal, rate, tenureYears, compoundingFrequency, hasErrors]);

  const handleReset = () => {
    setPrincipal('100000');
    setRate('7.5');
    setTenureYears('3');
    setCompoundingFrequency('quarterly');
  };

  const principalPct = result.maturityAmount > 0 ? (result.principal / result.maturityAmount) * 100 : 100;
  const interestPct = result.maturityAmount > 0 ? (result.interestEarned / result.maturityAmount) * 100 : 0;

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="fd-amount">Deposit Principal Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(principal)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="fd-amount"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={`calc-input has-prefix ${errors.principal ? 'calc-input-error' : ''}`}
            placeholder="e.g. 100000"
            min="1000"
            step="10000"
          />
        </div>
        {errors.principal && <span className="calc-error-text">{errors.principal}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="fd-rate">Interest Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="fd-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 7.5"
              min="0"
              max="20"
              step="0.05"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="fd-tenure">Tenure (Years)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="fd-tenure"
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className={`calc-input has-suffix ${errors.tenureYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 3"
              min="0.25"
              max="25"
              step="0.5"
            />
            <span className="calc-addon-suffix">Yrs</span>
          </div>
          {errors.tenureYears && <span className="calc-error-text">{errors.tenureYears}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <label className="calc-field-label">Compounding Frequency</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
          {[
            { label: 'Monthly', key: 'monthly' },
            { label: 'Quarterly (Std)', key: 'quarterly' },
            { label: 'Half-Yearly', key: 'half_yearly' },
            { label: 'Yearly', key: 'yearly' },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              className={`calc-btn calc-btn-sm ${compoundingFrequency === f.key ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
              onClick={() => setCompoundingFrequency(f.key)}
              style={{ fontSize: '0.78rem', padding: '8px 4px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Estimated Maturity Amount</div>
        <div className="calc-primary-result-value">{formatINR(result.maturityAmount)}</div>
        <div className="calc-primary-result-caption">
          Total wealth accrued over {tenureYears} years ({compoundingFrequency} compounding)
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Invested Principal</div>
          <div className="calc-metric-value">{formatINR(result.principal)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Interest Earned</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            + {formatINR(result.interestEarned)}
          </div>
        </div>
      </div>

      <div className="calc-visual-bar-wrap">
        <div className="calc-visual-bar">
          <div className="calc-bar-segment-a" style={{ width: `${principalPct}%` }} />
          <div className="calc-bar-segment-b" style={{ width: `${interestPct}%` }} />
        </div>
        <div className="calc-visual-legend">
          <span><span className="calc-legend-dot dot-a" />Principal: {formatPercent(principalPct)}</span>
          <span><span className="calc-legend-dot dot-b" />Interest: {formatPercent(interestPct)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="FD Calculator">
      <CalculatorShell
        title="Fixed Deposit (FD) Calculator"
        category="Investment Calculators"
        description="Compute maturity payouts and interest accumulation on bank and corporate term deposits."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Compound Interest Maturity Formula"
        formulaCode="A = P × (1 + r / n)^(n × t)"
        formulaDescription="Where P = Principal, r = Annual rate, n = Compounding frequency per year (Quarterly = 4), and t = Time in years."
        disclaimerText="Interest rates and TDS deductions are subject to bank policies, investor age (senior citizen rates), and prevailing income tax regulations."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
