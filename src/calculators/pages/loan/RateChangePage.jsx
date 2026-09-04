// src/calculators/pages/loan/RateChangePage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.9 Rate Change Impact Calculator (Repo Rate / Floating Revision)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateRateChange } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateLoanAmount, validateInterestRate, validateNumber } from '../../utils/validation.js';

export default function RateChangePage() {
  const [outstandingPrincipal, setOutstandingPrincipal] = useState('2500000');
  const [currentRate, setCurrentRate] = useState('8.5');
  const [newRate, setNewRate] = useState('9.25');
  const [remainingTenureMonths, setRemainingTenureMonths] = useState('180');

  const errors = useMemo(() => {
    return {
      outstandingPrincipal: validateLoanAmount(outstandingPrincipal, 'Outstanding Balance'),
      currentRate: validateInterestRate(currentRate, 'Current Rate'),
      newRate: validateInterestRate(newRate, 'New Rate'),
      remainingTenureMonths: validateNumber(remainingTenureMonths, { min: 1, max: 480, fieldName: 'Remaining Months' }),
    };
  }, [outstandingPrincipal, currentRate, newRate, remainingTenureMonths]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        currentEmi: 0,
        newEmi: 0,
        emiDifference: 0,
        currentTotalInterest: 0,
        newTotalInterest: 0,
        interestDifference: 0,
        revisedTenureMonths: 0,
      };
    }
    return calculateRateChange({
      outstandingPrincipal: parseNumber(outstandingPrincipal),
      currentRate: parseNumber(currentRate),
      newRate: parseNumber(newRate),
      remainingTenureMonths: parseNumber(remainingTenureMonths),
    });
  }, [outstandingPrincipal, currentRate, newRate, remainingTenureMonths, hasErrors]);

  const handleReset = () => {
    setOutstandingPrincipal('2500000');
    setCurrentRate('8.5');
    setNewRate('9.25');
    setRemainingTenureMonths('180');
  };

  const isHike = parseNumber(newRate) > parseNumber(currentRate);

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="rc-principal">Outstanding Loan Balance (₹)</label>
          <span className="calc-field-hint">{formatINR(outstandingPrincipal)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="rc-principal"
            type="number"
            value={outstandingPrincipal}
            onChange={(e) => setOutstandingPrincipal(e.target.value)}
            className={`calc-input has-prefix ${errors.outstandingPrincipal ? 'calc-input-error' : ''}`}
            placeholder="e.g. 2500000"
            min="10000"
            step="50000"
          />
        </div>
        {errors.outstandingPrincipal && <span className="calc-error-text">{errors.outstandingPrincipal}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="rc-curr-rate">Current Interest Rate (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="rc-curr-rate"
              type="number"
              value={currentRate}
              onChange={(e) => setCurrentRate(e.target.value)}
              className={`calc-input has-suffix ${errors.currentRate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 8.5"
              min="1"
              max="35"
              step="0.05"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.currentRate && <span className="calc-error-text">{errors.currentRate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="rc-new-rate">Revised New Rate (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="rc-new-rate"
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className={`calc-input has-suffix ${errors.newRate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 9.25"
              min="1"
              max="35"
              step="0.05"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.newRate && <span className="calc-error-text">{errors.newRate}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="rc-tenure">Remaining Tenure (Months)</label>
          <span className="calc-field-hint">{remainingTenureMonths} Mos ({Math.round(parseNumber(remainingTenureMonths)/12)} Yrs)</span>
        </div>
        <div className="calc-input-addon-wrap">
          <input
            id="rc-tenure"
            type="number"
            value={remainingTenureMonths}
            onChange={(e) => setRemainingTenureMonths(e.target.value)}
            className={`calc-input has-suffix ${errors.remainingTenureMonths ? 'calc-input-error' : ''}`}
            placeholder="e.g. 180"
            min="1"
            max="480"
            step="1"
          />
          <span className="calc-addon-suffix">Mos</span>
        </div>
        {errors.remainingTenureMonths && <span className="calc-error-text">{errors.remainingTenureMonths}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div
        className="calc-primary-result-box"
        style={{
          background: isHike ? '#fef2f2' : '#f0fdf4',
          borderColor: isHike ? '#fecaca' : '#bbf7d0',
        }}
      >
        <div className="calc-primary-result-label" style={{ color: isHike ? '#991b1b' : '#166534' }}>
          Monthly EMI Impact ({isHike ? 'Increase' : 'Savings'})
        </div>
        <div className="calc-primary-result-value" style={{ color: isHike ? 'var(--calc-error)' : 'var(--calc-success)' }}>
          {isHike ? `+ ${formatINR(result.emiDifference)}` : `- ${formatINR(Math.abs(result.emiDifference))}`}
        </div>
        <div className="calc-primary-result-caption" style={{ color: isHike ? '#b91c1c' : '#15803d' }}>
          Revised EMI: {formatINR(result.newEmi)}/mo (was {formatINR(result.currentEmi)}/mo)
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">New Total Interest</div>
          <div className="calc-metric-value">{formatINR(result.newTotalInterest)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Interest Difference</div>
          <div className="calc-metric-value" style={{ color: isHike ? 'var(--calc-error)' : 'var(--calc-success)' }}>
            {isHike ? `+ ${formatINR(result.interestDifference)}` : `- ${formatINR(Math.abs(result.interestDifference))}`}
          </div>
        </div>
        <div className="calc-metric-card" style={{ gridColumn: '1 / -1' }}>
          <div className="calc-metric-label">Alternate Scenario: Keep EMI unchanged, adjust tenure</div>
          <div className="calc-metric-value">
            Tenure changes to {result.revisedTenureMonths} months ({isHike ? `+ ${result.revisedTenureMonths - parseNumber(remainingTenureMonths)} mos` : `- ${parseNumber(remainingTenureMonths) - result.revisedTenureMonths} mos`})
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Rate Change Calculator">
      <CalculatorShell
        title="Rate Change Calculator"
        category="Loan Calculators"
        description="Analyze the financial impact when RBI repo rates change or your bank resets your floating loan interest rate."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Rate Revision Adjustment"
        formulaCode="Δ EMI = EMI(New Rate, n, P) - EMI(Current Rate, n, P)"
        formulaDescription="When interest rates adjust, lenders generally increase tenure by default. Borrowers can choose between paying higher monthly EMIs or extending repayment duration."
        disclaimerText="Actual loan adjustments depend on whether your lender automatically updates EMI or extends loan maturity tenor."
        calcTag="rate-change"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
