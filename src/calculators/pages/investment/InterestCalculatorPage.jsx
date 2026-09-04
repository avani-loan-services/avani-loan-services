// src/calculators/pages/investment/InterestCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 2.4 Interest Calculator (Simple & Compound Interest Modes)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateInterest } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateInterestRate } from '../../utils/validation.js';

export default function InterestCalculatorPage() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('10');
  const [timeYears, setTimeYears] = useState('2');
  const [isCompound, setIsCompound] = useState(false);
  const [compoundingFrequency, setCompoundingFrequency] = useState('yearly');

  const errors = useMemo(() => {
    return {
      principal: validateNumber(principal, { min: 100, max: 1000000000, fieldName: 'Principal' }),
      rate: validateInterestRate(rate),
      timeYears: validateNumber(timeYears, { min: 0.1, max: 100, fieldName: 'Time Period' }),
    };
  }, [principal, rate, timeYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        principal: parseNumber(principal),
        interest: 0,
        finalAmount: 0,
      };
    }
    return calculateInterest({
      principal: parseNumber(principal),
      rate: parseNumber(rate),
      timeYears: parseNumber(timeYears),
      isCompound,
      compoundingFrequency,
    });
  }, [principal, rate, timeYears, isCompound, compoundingFrequency, hasErrors]);

  const handleReset = () => {
    setPrincipal('100000');
    setRate('10');
    setTimeYears('2');
    setIsCompound(false);
    setCompoundingFrequency('yearly');
  };

  const inputsComponent = (
    <div>
      {/* Mode Selector Toggle */}
      <div className="calc-field-wrap">
        <label className="calc-field-label">Interest Calculation Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            className={`calc-btn ${!isCompound ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setIsCompound(false)}
          >
            Simple Interest (SI)
          </button>
          <button
            type="button"
            className={`calc-btn ${isCompound ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setIsCompound(true)}
          >
            Compound Interest (CI)
          </button>
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="int-principal">Principal Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(principal)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="int-principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={`calc-input has-prefix ${errors.principal ? 'calc-input-error' : ''}`}
            placeholder="e.g. 100000"
            min="100"
            step="5000"
          />
        </div>
        {errors.principal && <span className="calc-error-text">{errors.principal}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="int-rate">Annual Rate (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="int-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 10"
              min="0"
              max="50"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="int-time">Time Period (Yrs)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="int-time"
              type="number"
              value={timeYears}
              onChange={(e) => setTimeYears(e.target.value)}
              className={`calc-input has-suffix ${errors.timeYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 2"
              min="0.1"
              max="50"
              step="0.5"
            />
            <span className="calc-addon-suffix">Yrs</span>
          </div>
          {errors.timeYears && <span className="calc-error-text">{errors.timeYears}</span>}
        </div>
      </div>

      {isCompound && (
        <div className="calc-field-wrap">
          <label className="calc-field-label">Compounding Frequency</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
            {[
              { label: 'Yearly', key: 'yearly' },
              { label: 'Half-Yr', key: 'half_yearly' },
              { label: 'Quarterly', key: 'quarterly' },
              { label: 'Monthly', key: 'monthly' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                className={`calc-btn calc-btn-sm ${compoundingFrequency === f.key ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
                onClick={() => setCompoundingFrequency(f.key)}
                style={{ fontSize: '0.78rem', padding: '6px 2px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Total Accrued Interest ({isCompound ? 'CI' : 'SI'})</div>
        <div className="calc-primary-result-value" style={{ color: 'var(--calc-success)' }}>
          {formatINR(result.interest)}
        </div>
        <div className="calc-primary-result-caption">
          Principal {formatINR(result.principal)} + Interest = {formatINR(result.finalAmount)}
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Initial Principal (P)</div>
          <div className="calc-metric-value">{formatINR(result.principal)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Final Maturity Sum (A)</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-primary)' }}>
            {formatINR(result.finalAmount)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Interest Calculator">
      <CalculatorShell
        title="Interest Calculator (Simple & Compound)"
        category="Investment Calculators"
        description="Compute transparent interest returns for both simple interest agreements and compounded compounding investments."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle={isCompound ? 'Compound Interest Formula' : 'Simple Interest Formula'}
        formulaCode={
          isCompound
            ? 'A = P × (1 + r / n)^(n × t) ; Interest = A - P'
            : 'Interest = (P × R × T) / 100 ; Final Amount = P + Interest'
        }
        formulaDescription={
          isCompound
            ? 'Where n is the number of times interest compounds per year, and t is the investment duration in years.'
            : 'Simple interest accrues purely on the original principal sum without compounding.'
        }
        disclaimerText="Calculation is illustrative and assumes constant rate of return with no interim withdrawals or taxes."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
