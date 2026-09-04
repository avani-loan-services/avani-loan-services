// src/calculators/pages/investment/RdCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 2.2 Recurring Deposit (RD) Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateRD } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateInterestRate } from '../../utils/validation.js';

export default function RdCalculatorPage() {
  const [monthlyDeposit, setMonthlyDeposit] = useState('5000');
  const [rate, setRate] = useState('7.0');
  const [tenureYears, setTenureYears] = useState('3');

  const errors = useMemo(() => {
    return {
      monthlyDeposit: validateNumber(monthlyDeposit, { min: 500, max: 10000000, fieldName: 'Monthly Deposit' }),
      rate: validateInterestRate(rate),
      tenureYears: validateNumber(tenureYears, { min: 0.5, max: 10, fieldName: 'Tenure Years' }),
    };
  }, [monthlyDeposit, rate, tenureYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        monthlyDeposit: parseNumber(monthlyDeposit),
        totalDeposit: 0,
        maturityAmount: 0,
        interestEarned: 0,
      };
    }
    const months = Math.round(parseNumber(tenureYears) * 12);
    return calculateRD({
      monthlyDeposit: parseNumber(monthlyDeposit),
      rate: parseNumber(rate),
      tenureMonths: months,
    });
  }, [monthlyDeposit, rate, tenureYears, hasErrors]);

  const handleReset = () => {
    setMonthlyDeposit('5000');
    setRate('7.0');
    setTenureYears('3');
  };

  const depositPct = result.maturityAmount > 0 ? (result.totalDeposit / result.maturityAmount) * 100 : 100;
  const interestPct = result.maturityAmount > 0 ? (result.interestEarned / result.maturityAmount) * 100 : 0;

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="rd-amount">Monthly Recurring Deposit (₹)</label>
          <span className="calc-field-hint">{formatINR(monthlyDeposit)}/month</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="rd-amount"
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            className={`calc-input has-prefix ${errors.monthlyDeposit ? 'calc-input-error' : ''}`}
            placeholder="e.g. 5000"
            min="500"
            step="500"
          />
        </div>
        {errors.monthlyDeposit && <span className="calc-error-text">{errors.monthlyDeposit}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="rd-rate">Interest Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="rd-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 7.0"
              min="1"
              max="20"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="rd-tenure">Investment Duration</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="rd-tenure"
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className={`calc-input has-suffix ${errors.tenureYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 3"
              min="0.5"
              max="10"
              step="0.5"
            />
            <span className="calc-addon-suffix">Yrs</span>
          </div>
          {errors.tenureYears && <span className="calc-error-text">{errors.tenureYears}</span>}
        </div>
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Maturity Value</div>
        <div className="calc-primary-result-value">{formatINR(result.maturityAmount)}</div>
        <div className="calc-primary-result-caption">
          Accumulated across {parseNumber(tenureYears) * 12} monthly installments
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Deposited</div>
          <div className="calc-metric-value">{formatINR(result.totalDeposit)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Interest Earned</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            + {formatINR(result.interestEarned)}
          </div>
        </div>
      </div>

      <div className="calc-visual-bar-wrap">
        <div className="calc-visual-bar">
          <div className="calc-bar-segment-a" style={{ width: `${depositPct}%` }} />
          <div className="calc-bar-segment-b" style={{ width: `${interestPct}%` }} />
        </div>
        <div className="calc-visual-legend">
          <span><span className="calc-legend-dot dot-a" />Deposited: {formatPercent(depositPct)}</span>
          <span><span className="calc-legend-dot dot-b" />Interest: {formatPercent(interestPct)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="RD Calculator">
      <CalculatorShell
        title="Recurring Deposit (RD) Calculator"
        category="Investment Calculators"
        description="Forecast maturity returns from systematic monthly bank recurring deposit savings with Indian quarterly compounding."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Quarterly Compounded RD Sum"
        formulaCode="M = ∑ P × (1 + r / 4)^(4 × (N - k + 1)/12)"
        formulaDescription="In Indian banking practice, each monthly installment earns interest compounded on a quarterly cycle until final maturity."
        disclaimerText="Actual bank RD calculation methodology and interest payout dates may vary slightly across public, private, and cooperative financial institutions."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
