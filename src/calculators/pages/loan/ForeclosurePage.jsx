// src/calculators/pages/loan/ForeclosurePage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.5 Foreclosure Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateForeclosure } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateLoanAmount, validateNumber, validateGST } from '../../utils/validation.js';

export default function ForeclosurePage() {
  const [outstandingPrincipal, setOutstandingPrincipal] = useState('500000');
  const [foreclosureChargePercent, setForeclosureChargePercent] = useState('2');
  const [gstPercent, setGstPercent] = useState('18');
  const [otherCharges, setOtherCharges] = useState('500');

  const errors = useMemo(() => {
    return {
      outstandingPrincipal: validateLoanAmount(outstandingPrincipal, 'Outstanding Principal'),
      foreclosureChargePercent: validateNumber(foreclosureChargePercent, { min: 0, max: 15, fieldName: 'Foreclosure %' }),
      gstPercent: validateGST(gstPercent, 'GST %'),
      otherCharges: validateNumber(otherCharges, { min: 0, max: 1000000, fieldName: 'Other Charges' }),
    };
  }, [outstandingPrincipal, foreclosureChargePercent, gstPercent, otherCharges]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        outstandingPrincipal: parseNumber(outstandingPrincipal),
        foreclosureFee: 0,
        gstAmount: 0,
        otherCharges: 0,
        totalSettlementAmount: 0,
      };
    }
    return calculateForeclosure({
      outstandingPrincipal: parseNumber(outstandingPrincipal),
      foreclosureChargePercent: parseNumber(foreclosureChargePercent),
      gstPercent: parseNumber(gstPercent),
      otherCharges: parseNumber(otherCharges),
    });
  }, [outstandingPrincipal, foreclosureChargePercent, gstPercent, otherCharges, hasErrors]);

  const handleReset = () => {
    setOutstandingPrincipal('500000');
    setForeclosureChargePercent('2');
    setGstPercent('18');
    setOtherCharges('500');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="fore-principal">Outstanding Principal (₹)</label>
          <span className="calc-field-hint">{formatINR(outstandingPrincipal)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="fore-principal"
            type="number"
            value={outstandingPrincipal}
            onChange={(e) => setOutstandingPrincipal(e.target.value)}
            className={`calc-input has-prefix ${errors.outstandingPrincipal ? 'calc-input-error' : ''}`}
            placeholder="e.g. 500000"
            min="10000"
            step="10000"
          />
        </div>
        {errors.outstandingPrincipal && <span className="calc-error-text">{errors.outstandingPrincipal}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="fore-charge">Foreclosure Fee (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="fore-charge"
              type="number"
              value={foreclosureChargePercent}
              onChange={(e) => setForeclosureChargePercent(e.target.value)}
              className={`calc-input has-suffix ${errors.foreclosureChargePercent ? 'calc-input-error' : ''}`}
              placeholder="e.g. 2"
              min="0"
              max="10"
              step="0.25"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.foreclosureChargePercent && <span className="calc-error-text">{errors.foreclosureChargePercent}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="fore-gst">GST on Fee (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="fore-gst"
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className={`calc-input has-suffix ${errors.gstPercent ? 'calc-input-error' : ''}`}
              placeholder="e.g. 18"
              min="0"
              max="28"
              step="1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.gstPercent && <span className="calc-error-text">{errors.gstPercent}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="fore-other">Other Incidental Charges (₹)</label>
          <span className="calc-field-hint">e.g. Document retrieval, NOC fees</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="fore-other"
            type="number"
            value={otherCharges}
            onChange={(e) => setOtherCharges(e.target.value)}
            className={`calc-input has-prefix ${errors.otherCharges ? 'calc-input-error' : ''}`}
            placeholder="e.g. 500"
            min="0"
            step="100"
          />
        </div>
        {errors.otherCharges && <span className="calc-error-text">{errors.otherCharges}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Total Foreclosure Settlement Amount</div>
        <div className="calc-primary-result-value">{formatINR(result.totalSettlementAmount)}</div>
        <div className="calc-primary-result-caption">
          Includes Principal + Foreclosure Fee + Applicable GST + Incidental Charges
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Outstanding Principal</div>
          <div className="calc-metric-value">{formatINR(result.outstandingPrincipal)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Foreclosure Fee ({foreclosureChargePercent}%)</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-error)' }}>
            {formatINR(result.foreclosureFee)}
          </div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">GST on Foreclosure Fee ({gstPercent}%)</div>
          <div className="calc-metric-value">{formatINR(result.gstAmount)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Other Charges / NOC</div>
          <div className="calc-metric-value">{formatINR(result.otherCharges)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Foreclosure Calculator">
      <CalculatorShell
        title="Foreclosure Calculator"
        category="Loan Calculators"
        description="Calculate the total pre-closure settlement payout when closing your loan before maturity."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Foreclosure Settlement Formula"
        formulaCode="Settlement = Principal + (Principal × Fee%) + GST_on_Fee + Other_Charges"
        formulaDescription="Under RBI guidelines, floating rate individual term loans generally carry zero foreclosure charges, while fixed-rate and non-individual business loans may attract prepayment penalties."
        disclaimerText="Actual foreclosure charges depend on lender, product type, individual vs non-individual borrower status, loan agreement, and applicable RBI/regulatory guidelines. Verify with lender foreclosure quote."
        calcTag="foreclosure"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
