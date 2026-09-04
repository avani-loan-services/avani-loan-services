// src/calculators/pages/loan/PrepaymentPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.8 Prepayment Calculator (Part-Payment Benefits)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculatePrepayment } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateLoanAmount, validateInterestRate, validateNumber } from '../../utils/validation.js';

export default function PrepaymentPage() {
  const [outstandingPrincipal, setOutstandingPrincipal] = useState('1000000');
  const [rate, setRate] = useState('10.5');
  const [remainingTenureMonths, setRemainingTenureMonths] = useState('60');
  const [currentEmi, setCurrentEmi] = useState('');
  const [prepaymentAmount, setPrepaymentAmount] = useState('200000');
  const [option, setOption] = useState('reduce_tenure'); // 'reduce_tenure' or 'reduce_emi'

  const errors = useMemo(() => {
    return {
      outstandingPrincipal: validateLoanAmount(outstandingPrincipal, 'Outstanding Balance'),
      rate: validateInterestRate(rate),
      remainingTenureMonths: validateNumber(remainingTenureMonths, { min: 1, max: 480, fieldName: 'Remaining Tenure' }),
      prepaymentAmount: validateNumber(prepaymentAmount, {
        min: 1000,
        max: parseNumber(outstandingPrincipal, 10000000),
        fieldName: 'Prepayment Amount',
      }),
    };
  }, [outstandingPrincipal, rate, remainingTenureMonths, prepaymentAmount]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        withoutPrepayment: { monthlyEmi: 0, remainingTenureMonths: 0, totalInterest: 0, totalCost: 0 },
        withPrepayment: { newPrincipal: 0, monthlyEmi: 0, newTenureMonths: 0, totalInterest: 0, totalCost: 0 },
        interestSaved: 0,
        tenureSavedMonths: 0,
        monthlyEmiSaved: 0,
        prepaymentAmount: parseNumber(prepaymentAmount),
        option,
      };
    }
    return calculatePrepayment({
      outstandingPrincipal: parseNumber(outstandingPrincipal),
      rate: parseNumber(rate),
      remainingTenureMonths: parseNumber(remainingTenureMonths),
      currentEmi: parseNumber(currentEmi),
      prepaymentAmount: parseNumber(prepaymentAmount),
      option,
    });
  }, [outstandingPrincipal, rate, remainingTenureMonths, currentEmi, prepaymentAmount, option, hasErrors]);

  const handleReset = () => {
    setOutstandingPrincipal('1000000');
    setRate('10.5');
    setRemainingTenureMonths('60');
    setCurrentEmi('');
    setPrepaymentAmount('200000');
    setOption('reduce_tenure');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="prep-balance">Current Outstanding Balance (₹)</label>
          <span className="calc-field-hint">{formatINR(outstandingPrincipal)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="prep-balance"
            type="number"
            value={outstandingPrincipal}
            onChange={(e) => setOutstandingPrincipal(e.target.value)}
            className={`calc-input has-prefix ${errors.outstandingPrincipal ? 'calc-input-error' : ''}`}
            placeholder="e.g. 1000000"
            min="10000"
            step="25000"
          />
        </div>
        {errors.outstandingPrincipal && <span className="calc-error-text">{errors.outstandingPrincipal}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="prep-rate">Interest Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="prep-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 10.5"
              min="1"
              max="35"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="prep-tenure">Remaining Tenure (Mos)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="prep-tenure"
              type="number"
              value={remainingTenureMonths}
              onChange={(e) => setRemainingTenureMonths(e.target.value)}
              className={`calc-input has-suffix ${errors.remainingTenureMonths ? 'calc-input-error' : ''}`}
              placeholder="e.g. 60"
              min="1"
              max="480"
              step="1"
            />
            <span className="calc-addon-suffix">Mos</span>
          </div>
          {errors.remainingTenureMonths && <span className="calc-error-text">{errors.remainingTenureMonths}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="prep-lump">Lump Sum Prepayment Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(prepaymentAmount)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="prep-lump"
            type="number"
            value={prepaymentAmount}
            onChange={(e) => setPrepaymentAmount(e.target.value)}
            className={`calc-input has-prefix ${errors.prepaymentAmount ? 'calc-input-error' : ''}`}
            placeholder="e.g. 200000"
            min="1000"
            step="10000"
          />
        </div>
        {errors.prepaymentAmount && <span className="calc-error-text">{errors.prepaymentAmount}</span>}
      </div>

      {/* Prepayment Preference Strategy */}
      <div className="calc-field-wrap">
        <label className="calc-field-label">Prepayment Strategy</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            className={`calc-btn ${option === 'reduce_tenure' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setOption('reduce_tenure')}
            style={{ fontSize: '0.85rem' }}
          >
            Reduce Tenure (Keep EMI Same)
          </button>
          <button
            type="button"
            className={`calc-btn ${option === 'reduce_emi' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setOption('reduce_emi')}
            style={{ fontSize: '0.85rem' }}
          >
            Reduce Monthly EMI (Keep Tenure Same)
          </button>
        </div>
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="calc-primary-result-label" style={{ color: '#166534' }}>Total Interest Saved</div>
        <div className="calc-primary-result-value" style={{ color: 'var(--calc-success)' }}>
          {formatINR(result.interestSaved)}
        </div>
        <div className="calc-primary-result-caption" style={{ color: '#15803d' }}>
          {option === 'reduce_tenure'
            ? `Loan closes ${result.tenureSavedMonths} months earlier!`
            : `Monthly EMI reduced by ${formatINR(result.monthlyEmiSaved)}/mo`}
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--calc-text-muted)', marginBottom: '8px' }}>
            WITHOUT PREPAYMENT
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
            Tenure: <strong>{result.withoutPrepayment.remainingTenureMonths} Mos</strong>
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
            EMI: <strong>{formatINR(result.withoutPrepayment.monthlyEmi)}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--calc-accent)' }}>
            Interest: <strong>{formatINR(result.withoutPrepayment.totalInterest)}</strong>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
            WITH PREPAYMENT
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
            Tenure: <strong>{result.withPrepayment.newTenureMonths} Mos</strong>
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
            EMI: <strong>{formatINR(result.withPrepayment.monthlyEmi)}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#16a34a' }}>
            Interest: <strong>{formatINR(result.withPrepayment.totalInterest)}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Prepayment Calculator">
      <CalculatorShell
        title="Prepayment Calculator"
        category="Loan Calculators"
        description="Simulate the direct impact of part-prepaying your loan to save interest and close your loan years earlier."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Part-Payment Savings Logic"
        formulaCode="New Principal = Outstanding Balance - Prepayment Lump Sum"
        formulaDescription="Prepayments directly reduce the principal balance, permanently eliminating compounding interest over the remaining loan period."
        disclaimerText="Check your loan agreement for minimum part-payment thresholds (e.g., minimum 1 EMI or ₹10,000) and frequency limits."
        calcTag="prepayment"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
