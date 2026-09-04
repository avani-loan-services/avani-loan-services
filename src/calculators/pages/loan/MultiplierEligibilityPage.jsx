// src/calculators/pages/loan/MultiplierEligibilityPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.3 Eligibility Calculator — Multiplier Method
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateMultiplierEligibility } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateMultiplier, validateInterestRate, validateTenure } from '../../utils/validation.js';

export default function MultiplierEligibilityPage() {
  const [income, setIncome] = useState('60000');
  const [multiplier, setMultiplier] = useState('60');
  const [existingEmi, setExistingEmi] = useState('10000');
  const [rate, setRate] = useState('9.5');
  const [tenureYears, setTenureYears] = useState('15');

  const errors = useMemo(() => {
    return {
      income: validateNumber(income, { min: 5000, max: 50000000, fieldName: 'Monthly Income' }),
      multiplier: validateMultiplier(multiplier),
      existingEmi: validateNumber(existingEmi, { min: 0, max: 50000000, fieldName: 'Existing EMI' }),
      rate: validateInterestRate(rate),
      tenureYears: validateTenure(tenureYears, 'years', 'Tenure'),
    };
  }, [income, multiplier, existingEmi, rate, tenureYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        grossEligibleAmount: 0,
        existingCapacityDeduction: 0,
        netEligibleAmount: 0,
        estimatedMonthlyEmi: 0,
      };
    }
    return calculateMultiplierEligibility({
      income: parseNumber(income),
      incomeType: 'monthly',
      multiplier: parseNumber(multiplier),
      existingEmi: parseNumber(existingEmi),
      rate: parseNumber(rate),
      tenureYears: parseNumber(tenureYears),
    });
  }, [income, multiplier, existingEmi, rate, tenureYears, hasErrors]);

  const handleReset = () => {
    setIncome('60000');
    setMultiplier('60');
    setExistingEmi('10000');
    setRate('9.5');
    setTenureYears('15');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="mult-income">Net Monthly Income (₹)</label>
          <span className="calc-field-hint">{formatINR(income)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="mult-income"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={`calc-input has-prefix ${errors.income ? 'calc-input-error' : ''}`}
            placeholder="e.g. 60000"
            min="5000"
            step="5000"
          />
        </div>
        {errors.income && <span className="calc-error-text">{errors.income}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="mult-val">Income Multiplier (X)</label>
            <span className="calc-field-hint">{multiplier}x Income</span>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="mult-val"
              type="number"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              className={`calc-input has-suffix ${errors.multiplier ? 'calc-input-error' : ''}`}
              placeholder="e.g. 60"
              min="10"
              max="120"
              step="5"
            />
            <span className="calc-addon-suffix">X</span>
          </div>
          {errors.multiplier && <span className="calc-error-text">{errors.multiplier}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="mult-existing">Existing EMIs (₹)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <span className="calc-addon-prefix">₹</span>
            <input
              id="mult-existing"
              type="number"
              value={existingEmi}
              onChange={(e) => setExistingEmi(e.target.value)}
              className={`calc-input has-prefix ${errors.existingEmi ? 'calc-input-error' : ''}`}
              placeholder="e.g. 10000"
              min="0"
              step="1000"
            />
          </div>
          {errors.existingEmi && <span className="calc-error-text">{errors.existingEmi}</span>}
        </div>
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="mult-rate">Interest Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="mult-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 9.5"
              min="1"
              max="30"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="mult-tenure">Tenure (Years)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="mult-tenure"
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className={`calc-input has-suffix ${errors.tenureYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 15"
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
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Net Eligible Loan Amount</div>
        <div className="calc-primary-result-value">{formatINR(result.netEligibleAmount)}</div>
        <div className="calc-primary-result-caption">
          Estimated EMI for this amount: {formatINR(result.estimatedMonthlyEmi)}/mo
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Gross Multiplier Capacity ({multiplier}x)</div>
          <div className="calc-metric-value">{formatINR(result.grossEligibleAmount)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Deduction for Existing EMIs</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-error)' }}>
            - {formatINR(result.existingCapacityDeduction)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Multiplier Eligibility Calculator">
      <CalculatorShell
        title="Eligibility Calculator (Multiplier Method)"
        category="Loan Calculators"
        description="Quick benchmark calculation used by many financial institutions where loan capacity is a multiple of monthly or annual net income."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Multiplier Evaluation Formula"
        formulaCode="Eligible Loan = (Monthly Income × Multiplier) - Existing Obligation Load"
        formulaDescription="Standard home and personal loan policies often allow between 40x and 80x monthly salary based on employer category and applicant credit standing."
        disclaimerText="This calculation is an indicative estimation for planning purposes. Final sanctioned amount depends on credit scoring, property/asset valuation, and internal lender underwriting."
        calcTag="multiplier"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
