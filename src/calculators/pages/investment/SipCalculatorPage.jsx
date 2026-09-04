// src/calculators/pages/investment/SipCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 2.3 Systematic Investment Plan (SIP) Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateSIP } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateInterestRate } from '../../utils/validation.js';

export default function SipCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('10000');
  const [rate, setRate] = useState('12');
  const [tenureYears, setTenureYears] = useState('5');

  const errors = useMemo(() => {
    return {
      monthlyInvestment: validateNumber(monthlyInvestment, { min: 500, max: 10000000, fieldName: 'Monthly SIP' }),
      rate: validateInterestRate(rate, 'Expected Return %'),
      tenureYears: validateNumber(tenureYears, { min: 1, max: 40, fieldName: 'Investment Period' }),
    };
  }, [monthlyInvestment, rate, tenureYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        monthlyInvestment: parseNumber(monthlyInvestment),
        totalInvestment: 0,
        estimatedReturns: 0,
        maturityValue: 0,
        investmentPercent: 100,
        returnsPercent: 0,
      };
    }
    return calculateSIP({
      monthlyInvestment: parseNumber(monthlyInvestment),
      rate: parseNumber(rate),
      tenureYears: parseNumber(tenureYears),
    });
  }, [monthlyInvestment, rate, tenureYears, hasErrors]);

  const handleReset = () => {
    setMonthlyInvestment('10000');
    setRate('12');
    setTenureYears('5');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="sip-amount">Monthly Investment (₹)</label>
          <span className="calc-field-hint">{formatINR(monthlyInvestment)}/mo</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="sip-amount"
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(e.target.value)}
            className={`calc-input has-prefix ${errors.monthlyInvestment ? 'calc-input-error' : ''}`}
            placeholder="e.g. 10000"
            min="500"
            step="1000"
          />
        </div>
        {errors.monthlyInvestment && <span className="calc-error-text">{errors.monthlyInvestment}</span>}
        <div className="calc-slider-wrap">
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={parseNumber(monthlyInvestment, 10000)}
            onChange={(e) => setMonthlyInvestment(e.target.value)}
            className="calc-slider"
            aria-label="Monthly SIP Slider"
          />
        </div>
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="sip-rate">Expected Annual Return (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="sip-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 12"
              min="1"
              max="30"
              step="0.5"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="sip-tenure">Time Period (Years)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="sip-tenure"
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className={`calc-input has-suffix ${errors.tenureYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 5"
              min="1"
              max="35"
              step="1"
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
      <div className="calc-primary-result-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="calc-primary-result-label" style={{ color: '#166534' }}>Estimated Future Corpus</div>
        <div className="calc-primary-result-value" style={{ color: 'var(--calc-success)' }}>
          {formatINR(result.maturityValue)}
        </div>
        <div className="calc-primary-result-caption" style={{ color: '#15803d' }}>
          Over {tenureYears} years ({parseNumber(tenureYears) * 12} monthly investments)
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Invested Amount</div>
          <div className="calc-metric-value">{formatINR(result.totalInvestment)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Estimated Wealth Gain</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            + {formatINR(result.estimatedReturns)}
          </div>
        </div>
      </div>

      <div className="calc-visual-bar-wrap">
        <div className="calc-visual-bar">
          <div className="calc-bar-segment-a" style={{ width: `${result.investmentPercent}%` }} />
          <div className="calc-bar-segment-b" style={{ width: `${result.returnsPercent}%`, background: 'var(--calc-success)' }} />
        </div>
        <div className="calc-visual-legend">
          <span><span className="calc-legend-dot dot-a" />Invested: {formatPercent(result.investmentPercent)}</span>
          <span><span className="calc-legend-dot dot-b" style={{ background: 'var(--calc-success)' }} />Gains: {formatPercent(result.returnsPercent)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="SIP Calculator">
      <CalculatorShell
        title="SIP Calculator"
        category="Investment Calculators"
        description="Calculate estimated corpus growth and compounding gains from disciplined monthly mutual fund SIP investments."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Future Value of Annuity Regular"
        formulaCode="M = P × [((1 + i)^n - 1) / i] × (1 + i)"
        formulaDescription="Where P = Monthly investment, i = Monthly interest rate (Annual Return / 12 / 100), and n = Total number of monthly contributions."
        disclaimerText="Illustrative estimate — mutual fund returns are market-linked and not guaranteed. Past performance does not guarantee future financial returns."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
