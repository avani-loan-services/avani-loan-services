// src/calculators/pages/loan/EmiCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.1 EMI Calculator with Amortization Schedule
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import AmortizationTable from '../../components/AmortizationTable';
import { calculateEMI, generateAmortizationSchedule } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateLoanAmount, validateInterestRate, validateTenure } from '../../utils/validation.js';

export default function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('5');
  const [tenureUnit, setTenureUnit] = useState('years'); // 'years' or 'months'

  // Errors
  const errors = useMemo(() => {
    return {
      principal: validateLoanAmount(principal),
      rate: validateInterestRate(rate),
      tenure: validateTenure(tenure, tenureUnit),
    };
  }, [principal, rate, tenure, tenureUnit]);

  const hasErrors = Object.values(errors).some(Boolean);

  // Result
  const result = useMemo(() => {
    if (hasErrors) {
      return {
        monthlyEmi: 0,
        principal: parseNumber(principal),
        totalInterest: 0,
        totalRepayment: 0,
        principalPercent: 100,
        interestPercent: 0,
        totalMonths: 0,
      };
    }
    return calculateEMI({
      principal: parseNumber(principal),
      rate: parseNumber(rate),
      tenure: parseNumber(tenure),
      tenureUnit,
    });
  }, [principal, rate, tenure, tenureUnit, hasErrors]);

  const schedule = useMemo(() => {
    if (hasErrors || result.monthlyEmi === 0) return { monthly: [], yearly: [] };
    return generateAmortizationSchedule({
      principal: parseNumber(principal),
      rate: parseNumber(rate),
      tenure: parseNumber(tenure),
      tenureUnit,
    });
  }, [principal, rate, tenure, tenureUnit, hasErrors, result.monthlyEmi]);

  const handleReset = () => {
    setPrincipal('1000000');
    setRate('10.5');
    setTenure('5');
    setTenureUnit('years');
  };

  const inputsComponent = (
    <div>
      {/* Loan Amount */}
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="emi-amount">Loan Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(principal)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="emi-amount"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={`calc-input has-prefix ${errors.principal ? 'calc-input-error' : ''}`}
            placeholder="e.g. 1000000"
            min="1000"
            step="10000"
          />
        </div>
        {errors.principal && <span className="calc-error-text">{errors.principal}</span>}
        <div className="calc-slider-wrap">
          <input
            type="range"
            min="50000"
            max="10000000"
            step="25000"
            value={parseNumber(principal, 50000)}
            onChange={(e) => setPrincipal(e.target.value)}
            className="calc-slider"
            aria-label="Loan Amount Slider"
          />
        </div>
      </div>

      {/* Interest Rate */}
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="emi-rate">Interest Rate (% p.a.)</label>
          <span className="calc-field-hint">{rate}%</span>
        </div>
        <div className="calc-input-addon-wrap">
          <input
            id="emi-rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
            placeholder="e.g. 10.5"
            min="0"
            max="100"
            step="0.05"
          />
          <span className="calc-addon-suffix">%</span>
        </div>
        {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        <div className="calc-slider-wrap">
          <input
            type="range"
            min="5"
            max="30"
            step="0.1"
            value={parseNumber(rate, 10.5)}
            onChange={(e) => setRate(e.target.value)}
            className="calc-slider"
            aria-label="Interest Rate Slider"
          />
        </div>
      </div>

      {/* Loan Tenure */}
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="emi-tenure">Loan Tenure</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`calc-btn calc-btn-sm ${tenureUnit === 'years' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
              onClick={() => {
                if (tenureUnit !== 'years') {
                  setTenure(String(Math.max(1, Math.round(parseNumber(tenure) / 12))));
                  setTenureUnit('years');
                }
              }}
            >
              Years
            </button>
            <button
              type="button"
              className={`calc-btn calc-btn-sm ${tenureUnit === 'months' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
              onClick={() => {
                if (tenureUnit !== 'months') {
                  setTenure(String(parseNumber(tenure) * 12));
                  setTenureUnit('months');
                }
              }}
            >
              Months
            </button>
          </div>
        </div>
        <div className="calc-input-addon-wrap">
          <input
            id="emi-tenure"
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            className={`calc-input has-suffix ${errors.tenure ? 'calc-input-error' : ''}`}
            placeholder={tenureUnit === 'years' ? 'e.g. 5' : 'e.g. 60'}
            min="1"
            max={tenureUnit === 'years' ? 40 : 480}
            step="1"
          />
          <span className="calc-addon-suffix">{tenureUnit === 'years' ? 'Yrs' : 'Mos'}</span>
        </div>
        {errors.tenure && <span className="calc-error-text">{errors.tenure}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Monthly EMI</div>
        <div className="calc-primary-result-value">{formatINR(result.monthlyEmi)}</div>
        <div className="calc-primary-result-caption">
          Total {result.totalMonths} monthly installments
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Principal Amount</div>
          <div className="calc-metric-value">{formatINR(result.principal)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Interest Payable</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-accent)' }}>
            {formatINR(result.totalInterest)}
          </div>
        </div>
        <div className="calc-metric-card" style={{ gridColumn: '1 / -1' }}>
          <div className="calc-metric-label">Total Repayment (Principal + Interest)</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-primary)' }}>
            {formatINR(result.totalRepayment)}
          </div>
        </div>
      </div>

      {/* Visual Proportional Bar */}
      <div className="calc-visual-bar-wrap">
        <div className="calc-visual-bar">
          <div
            className="calc-bar-segment-a"
            style={{ width: `${result.principalPercent}%` }}
            title={`Principal: ${formatPercent(result.principalPercent)}`}
          />
          <div
            className="calc-bar-segment-b"
            style={{ width: `${result.interestPercent}%` }}
            title={`Interest: ${formatPercent(result.interestPercent)}`}
          />
        </div>
        <div className="calc-visual-legend">
          <span>
            <span className="calc-legend-dot dot-a" />
            Principal: {formatPercent(result.principalPercent)}
          </span>
          <span>
            <span className="calc-legend-dot dot-b" />
            Interest: {formatPercent(result.interestPercent)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="EMI Calculator">
      <CalculatorShell
        title="EMI Calculator"
        category="Loan Calculators"
        description="Compute monthly installment (EMI), total interest, and amortized repayment schedules for home, personal, and business loans."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Standard Reducing Balance Formula"
        formulaCode="EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)"
        formulaDescription="Where P = Principal Loan Amount, r = Monthly interest rate (Annual rate / 12 / 100), and n = Total number of monthly installments."
        disclaimerText="This calculator provides an indicative estimate. Actual EMI and repayment schedules may vary based on lender terms, interest rate type (fixed vs floating), processing fees, and documentation."
        calcTag="emi"
        onReset={handleReset}
      >
        <AmortizationTable monthly={schedule.monthly} yearly={schedule.yearly} />
      </CalculatorShell>
    </CalculatorLayout>
  );
}
