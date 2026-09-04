// src/calculators/pages/investment/PpfCalculatorPage.jsx
// ─────────────────────────────────────────────────────────────────
// 2.5 Public Provident Fund (PPF) Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculatePPF } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateInterestRate } from '../../utils/validation.js';
import { Table } from 'lucide-react';

export default function PpfCalculatorPage() {
  const [initialAmount, setInitialAmount] = useState('0');
  const [annualContribution, setAnnualContribution] = useState('150000');
  const [rate, setRate] = useState('7.1');
  const [tenureYears, setTenureYears] = useState('15');

  const errors = useMemo(() => {
    return {
      initialAmount: validateNumber(initialAmount, { min: 0, max: 1500000, fieldName: 'Opening Balance' }),
      annualContribution: validateNumber(annualContribution, { min: 500, max: 150000, fieldName: 'Annual Contribution (Max ₹1.5L)' }),
      rate: validateInterestRate(rate, 'PPF Interest Rate'),
      tenureYears: validateNumber(tenureYears, { min: 15, max: 50, fieldName: 'Tenure (Min 15 Years)' }),
    };
  }, [initialAmount, annualContribution, rate, tenureYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        totalContribution: 0,
        estimatedInterest: 0,
        maturityAmount: 0,
        yearlySchedule: [],
      };
    }
    return calculatePPF({
      initialAmount: parseNumber(initialAmount),
      annualContribution: parseNumber(annualContribution),
      rate: parseNumber(rate),
      tenureYears: parseNumber(tenureYears),
    });
  }, [initialAmount, annualContribution, rate, tenureYears, hasErrors]);

  const handleReset = () => {
    setInitialAmount('0');
    setAnnualContribution('150000');
    setRate('7.1');
    setTenureYears('15');
  };

  const contribPct = result.maturityAmount > 0 ? (result.totalContribution / result.maturityAmount) * 100 : 100;
  const interestPct = result.maturityAmount > 0 ? (result.estimatedInterest / result.maturityAmount) * 100 : 0;

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="ppf-annual">Yearly Deposit Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(annualContribution)}/yr (Max ₹1.5L)</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="ppf-annual"
            type="number"
            value={annualContribution}
            onChange={(e) => setAnnualContribution(e.target.value)}
            className={`calc-input has-prefix ${errors.annualContribution ? 'calc-input-error' : ''}`}
            placeholder="e.g. 150000"
            min="500"
            max="150000"
            step="5000"
          />
        </div>
        {errors.annualContribution && <span className="calc-error-text">{errors.annualContribution}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="ppf-rate">Govt PPF Rate (%)</label>
            <span className="calc-field-hint">Configurable</span>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="ppf-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 7.1"
              min="1"
              max="15"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="ppf-tenure">Duration (Years)</label>
            <span className="calc-field-hint">Min 15 Yrs</span>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="ppf-tenure"
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className={`calc-input has-suffix ${errors.tenureYears ? 'calc-input-error' : ''}`}
              placeholder="e.g. 15"
              min="15"
              max="50"
              step="5"
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
        <div className="calc-primary-result-label" style={{ color: '#166534' }}>Total Maturity Amount (Tax-Free)</div>
        <div className="calc-primary-result-value" style={{ color: 'var(--calc-success)' }}>
          {formatINR(result.maturityAmount)}
        </div>
        <div className="calc-primary-result-caption" style={{ color: '#15803d' }}>
          After {tenureYears} years of disciplined annual contributions
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Contribution</div>
          <div className="calc-metric-value">{formatINR(result.totalContribution)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Tax-Free Interest Earned</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            + {formatINR(result.estimatedInterest)}
          </div>
        </div>
      </div>

      <div className="calc-visual-bar-wrap">
        <div className="calc-visual-bar">
          <div className="calc-bar-segment-a" style={{ width: `${contribPct}%` }} />
          <div className="calc-bar-segment-b" style={{ width: `${interestPct}%`, background: 'var(--calc-success)' }} />
        </div>
        <div className="calc-visual-legend">
          <span><span className="calc-legend-dot dot-a" />Deposits: {formatPercent(contribPct)}</span>
          <span><span className="calc-legend-dot dot-b" style={{ background: 'var(--calc-success)' }} />Interest: {formatPercent(interestPct)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="PPF Calculator">
      <CalculatorShell
        title="Public Provident Fund (PPF) Calculator"
        category="Investment Calculators"
        description="Compute long-term wealth accumulation and tax-exempt compounding returns under the Government of India PPF Scheme."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="PPF Annual Compounding Model"
        formulaCode="Balance(Year) = (Opening Balance + Annual Deposit) × (1 + Rate %)"
        formulaDescription="Interest is calculated monthly on the lowest balance between the 5th and last day of each calendar month, and credited annually on 31st March."
        disclaimerText="PPF interest rates and rules are subject to government notification and revision every fiscal quarter under Ministry of Finance notifications."
        onReset={handleReset}
      >
        {result.yearlySchedule.length > 0 && (
          <section className="calc-table-container">
            <div className="calc-table-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Table size={18} color="var(--calc-primary)" />
                <h3 className="calc-table-title">PPF Yearly Growth Schedule</h3>
              </div>
            </div>
            <div className="calc-table-scroll">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Opening Balance (₹)</th>
                    <th>Deposited (₹)</th>
                    <th>Interest Earned (₹)</th>
                    <th>Closing Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlySchedule.map((row) => (
                    <tr key={row.year}>
                      <td style={{ fontWeight: 600 }}>Year {row.year}</td>
                      <td>{formatINR(row.openingBalance)}</td>
                      <td style={{ color: 'var(--calc-primary)', fontWeight: 600 }}>{formatINR(row.deposited)}</td>
                      <td style={{ color: 'var(--calc-success)', fontWeight: 600 }}>+{formatINR(row.interestEarned)}</td>
                      <td style={{ fontWeight: 700 }}>{formatINR(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </CalculatorShell>
    </CalculatorLayout>
  );
}
