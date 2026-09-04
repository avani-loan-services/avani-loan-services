// src/calculators/pages/loan/OverdraftPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.6 Overdraft (OD) Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateOverdraft } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateLoanAmount, validateInterestRate, validateNumber } from '../../utils/validation.js';

export default function OverdraftPage() {
  const [sanctionedLimit, setSanctionedLimit] = useState('1000000');
  const [amountUtilized, setAmountUtilized] = useState('300000');
  const [rate, setRate] = useState('12');
  const [daysUtilized, setDaysUtilized] = useState('30');
  const [otherCharges, setOtherCharges] = useState('0');

  const errors = useMemo(() => {
    return {
      sanctionedLimit: validateLoanAmount(sanctionedLimit, 'Sanctioned Limit'),
      amountUtilized: validateNumber(amountUtilized, {
        min: 0,
        max: parseNumber(sanctionedLimit, 10000000),
        fieldName: 'Utilized Amount',
      }),
      rate: validateInterestRate(rate),
      daysUtilized: validateNumber(daysUtilized, { min: 1, max: 365, fieldName: 'Days Utilized' }),
      otherCharges: validateNumber(otherCharges, { min: 0, max: 100000, fieldName: 'Charges' }),
    };
  }, [sanctionedLimit, amountUtilized, rate, daysUtilized, otherCharges]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        sanctionedLimit: parseNumber(sanctionedLimit),
        amountUtilized: parseNumber(amountUtilized),
        availableLimit: 0,
        estimatedInterest: 0,
        totalEstimatedCost: 0,
      };
    }
    return calculateOverdraft({
      sanctionedLimit: parseNumber(sanctionedLimit),
      amountUtilized: parseNumber(amountUtilized),
      rate: parseNumber(rate),
      daysUtilized: parseNumber(daysUtilized),
      otherCharges: parseNumber(otherCharges),
    });
  }, [sanctionedLimit, amountUtilized, rate, daysUtilized, otherCharges, hasErrors]);

  const handleReset = () => {
    setSanctionedLimit('1000000');
    setAmountUtilized('300000');
    setRate('12');
    setDaysUtilized('30');
    setOtherCharges('0');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="od-limit">Sanctioned OD Limit (₹)</label>
          <span className="calc-field-hint">{formatINR(sanctionedLimit)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="od-limit"
            type="number"
            value={sanctionedLimit}
            onChange={(e) => setSanctionedLimit(e.target.value)}
            className={`calc-input has-prefix ${errors.sanctionedLimit ? 'calc-input-error' : ''}`}
            placeholder="e.g. 1000000"
            min="10000"
            step="50000"
          />
        </div>
        {errors.sanctionedLimit && <span className="calc-error-text">{errors.sanctionedLimit}</span>}
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="od-utilized">Amount Utilized (₹)</label>
          <span className="calc-field-hint">{formatINR(amountUtilized)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="od-utilized"
            type="number"
            value={amountUtilized}
            onChange={(e) => setAmountUtilized(e.target.value)}
            className={`calc-input has-prefix ${errors.amountUtilized ? 'calc-input-error' : ''}`}
            placeholder="e.g. 300000"
            min="0"
            step="10000"
          />
        </div>
        {errors.amountUtilized && <span className="calc-error-text">{errors.amountUtilized}</span>}
        <div className="calc-slider-wrap">
          <input
            type="range"
            min="0"
            max={Math.max(1, parseNumber(sanctionedLimit))}
            step="10000"
            value={parseNumber(amountUtilized, 0)}
            onChange={(e) => setAmountUtilized(e.target.value)}
            className="calc-slider"
            aria-label="Utilized Amount Slider"
          />
        </div>
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="od-rate">Interest Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="od-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 12"
              min="1"
              max="36"
              step="0.25"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="od-days">Days Utilized</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="od-days"
              type="number"
              value={daysUtilized}
              onChange={(e) => setDaysUtilized(e.target.value)}
              className={`calc-input has-suffix ${errors.daysUtilized ? 'calc-input-error' : ''}`}
              placeholder="e.g. 30"
              min="1"
              max="365"
              step="1"
            />
            <span className="calc-addon-suffix">Days</span>
          </div>
          {errors.daysUtilized && <span className="calc-error-text">{errors.daysUtilized}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="od-charges">Annual Renewal / Service Charges (₹)</label>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="od-charges"
            type="number"
            value={otherCharges}
            onChange={(e) => setOtherCharges(e.target.value)}
            className={`calc-input has-prefix ${errors.otherCharges ? 'calc-input-error' : ''}`}
            placeholder="e.g. 0"
            min="0"
            step="500"
          />
        </div>
        {errors.otherCharges && <span className="calc-error-text">{errors.otherCharges}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Estimated Overdraft Interest</div>
        <div className="calc-primary-result-value">{formatINR(result.estimatedInterest)}</div>
        <div className="calc-primary-result-caption">
          For {daysUtilized} days on utilized sum of {formatINR(amountUtilized)}
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Available OD Limit</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            {formatINR(result.availableLimit)}
          </div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Utilized Amount</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-primary)' }}>
            {formatINR(result.amountUtilized)}
          </div>
        </div>
        <div className="calc-metric-card" style={{ gridColumn: '1 / -1' }}>
          <div className="calc-metric-label">Total Estimated Overdraft Cost (Interest + Fees)</div>
          <div className="calc-metric-value">{formatINR(result.totalEstimatedCost)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Overdraft Calculator">
      <CalculatorShell
        title="Overdraft (OD / CC) Calculator"
        category="Loan Calculators"
        description="Calculate exact interest costs on utilized credit lines and overdraft limits without paying interest on idle funds."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Daily Overdraft Interest Formula"
        formulaCode="Interest = Utilized Amount × (Annual Rate / 100) × (Days / 365)"
        formulaDescription="Interest is applied only on the amount withdrawn from your credit line for the specific number of days utilized."
        disclaimerText="Actual overdraft interest calculation depends on daily closing balance methodology, monthly capitalization, and specific bank/NBFC ledger calculation rules."
        calcTag="overdraft"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
