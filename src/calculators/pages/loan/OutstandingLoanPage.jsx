// src/calculators/pages/loan/OutstandingLoanPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.4 Outstanding Loan Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateOutstandingLoan } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateLoanAmount, validateInterestRate, validateTenure, validateNumber } from '../../utils/validation.js';

export default function OutstandingLoanPage() {
  const [originalAmount, setOriginalAmount] = useState('1000000');
  const [rate, setRate] = useState('10.5');
  const [originalTenureYears, setOriginalTenureYears] = useState('5');
  const [emisPaid, setEmisPaid] = useState('18');

  const errors = useMemo(() => {
    return {
      originalAmount: validateLoanAmount(originalAmount),
      rate: validateInterestRate(rate),
      originalTenureYears: validateTenure(originalTenureYears, 'years', 'Original Tenure'),
      emisPaid: validateNumber(emisPaid, {
        min: 0,
        max: parseNumber(originalTenureYears) * 12,
        fieldName: 'EMIs Paid',
      }),
    };
  }, [originalAmount, rate, originalTenureYears, emisPaid]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        outstandingPrincipal: 0,
        totalPrincipalPaid: 0,
        totalInterestPaid: 0,
        remainingTenureMonths: 0,
        remainingInterest: 0,
        monthlyEmi: 0,
      };
    }
    return calculateOutstandingLoan({
      originalAmount: parseNumber(originalAmount),
      rate: parseNumber(rate),
      originalTenureYears: parseNumber(originalTenureYears),
      emisPaid: parseNumber(emisPaid),
    });
  }, [originalAmount, rate, originalTenureYears, emisPaid, hasErrors]);

  const handleReset = () => {
    setOriginalAmount('1000000');
    setRate('10.5');
    setOriginalTenureYears('5');
    setEmisPaid('18');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="out-amount">Original Loan Sanction Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(originalAmount)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="out-amount"
            type="number"
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
            className={`calc-input has-prefix ${errors.originalAmount ? 'calc-input-error' : ''}`}
            placeholder="e.g. 1000000"
            min="10000"
            step="10000"
          />
        </div>
        {errors.originalAmount && <span className="calc-error-text">{errors.originalAmount}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="out-rate">Interest Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="out-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 10.5"
              min="0"
              max="40"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="out-tenure">Original Tenure (Yrs)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="out-tenure"
              type="number"
              value={originalTenureYears}
              onChange={(e) => setOriginalTenureYears(e.target.value)}
              className={`calc-input has-suffix ${errors.originalTenureYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 5"
              min="1"
              max="35"
              step="1"
            />
            <span className="calc-addon-suffix">Yrs</span>
          </div>
          {errors.originalTenureYears && <span className="calc-error-text">{errors.originalTenureYears}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="out-paid">Number of Monthly EMIs Paid</label>
          <span className="calc-field-hint">
            {emisPaid} of {parseNumber(originalTenureYears) * 12} EMIs Paid
          </span>
        </div>
        <div className="calc-input-addon-wrap">
          <input
            id="out-paid"
            type="number"
            value={emisPaid}
            onChange={(e) => setEmisPaid(e.target.value)}
            className={`calc-input has-suffix ${errors.emisPaid ? 'calc-input-error' : ''}`}
            placeholder="e.g. 18"
            min="0"
            max={parseNumber(originalTenureYears) * 12}
            step="1"
          />
          <span className="calc-addon-suffix">EMIs</span>
        </div>
        {errors.emisPaid && <span className="calc-error-text">{errors.emisPaid}</span>}
        <div className="calc-slider-wrap">
          <input
            type="range"
            min="0"
            max={Math.max(1, parseNumber(originalTenureYears) * 12)}
            step="1"
            value={parseNumber(emisPaid, 0)}
            onChange={(e) => setEmisPaid(e.target.value)}
            className="calc-slider"
            aria-label="EMIs Paid Slider"
          />
        </div>
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Estimated Outstanding Principal</div>
        <div className="calc-primary-result-value">{formatINR(result.outstandingPrincipal)}</div>
        <div className="calc-primary-result-caption">
          {result.remainingTenureMonths} months remaining ({Math.round(result.remainingTenureMonths / 12 * 10) / 10} Years)
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Principal Paid So Far</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-primary)' }}>
            {formatINR(result.totalPrincipalPaid)}
          </div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Interest Paid So Far</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-accent)' }}>
            {formatINR(result.totalInterestPaid)}
          </div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Monthly EMI Amount</div>
          <div className="calc-metric-value">{formatINR(result.monthlyEmi)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Remaining Interest Payable</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-text-muted)' }}>
            {formatINR(result.remainingInterest)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Outstanding Loan Calculator">
      <CalculatorShell
        title="Outstanding Loan Calculator"
        category="Loan Calculators"
        description="Compute your remaining loan balance, principal paid, and future interest obligations based on your amortization history."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Amortization Balance Formula"
        formulaCode="Outstanding Principal = Balance(k) = P(1+r)^k - (EMI/r)[(1+r)^k - 1]"
        formulaDescription="Standard reducing balance tracking where each monthly installment is split between accrued monthly interest and principal reduction."
        disclaimerText="This calculation provides an indicative estimate assuming regular on-time EMI repayments. Exact outstanding balance on lender statement may include accrued broken-period interest or unpaid charges."
        calcTag="outstanding"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
