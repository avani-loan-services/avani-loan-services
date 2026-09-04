// src/calculators/pages/other/DiscountPage.jsx
// ─────────────────────────────────────────────────────────────────
// 3.3 Discount Calculator (Percentage & Flat Amount Modes)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateDiscount } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateDiscountPercent } from '../../utils/validation.js';

export default function DiscountPage() {
  const [originalPrice, setOriginalPrice] = useState('2500');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [discountAmount, setDiscountAmount] = useState('375');
  const [mode, setMode] = useState('percent'); // 'percent' or 'amount'

  const errors = useMemo(() => {
    return {
      originalPrice: validateNumber(originalPrice, { min: 1, max: 100000000, fieldName: 'Original Price' }),
      discountPercent: mode === 'percent' ? validateDiscountPercent(discountPercent) : null,
      discountAmount: mode === 'amount' ? validateNumber(discountAmount, { min: 0, max: parseNumber(originalPrice), fieldName: 'Discount Amount' }) : null,
    };
  }, [originalPrice, discountPercent, discountAmount, mode]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        originalPrice: parseNumber(originalPrice),
        discountPercent: 0,
        discountAmount: 0,
        finalPrice: parseNumber(originalPrice),
        amountSaved: 0,
      };
    }
    return calculateDiscount({
      originalPrice: parseNumber(originalPrice),
      discountPercent: parseNumber(discountPercent),
      discountAmount: parseNumber(discountAmount),
      mode,
    });
  }, [originalPrice, discountPercent, discountAmount, mode, hasErrors]);

  const handleReset = () => {
    setOriginalPrice('2500');
    setDiscountPercent('15');
    setDiscountAmount('375');
    setMode('percent');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <label className="calc-field-label">Discount Method</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            className={`calc-btn ${mode === 'percent' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setMode('percent')}
          >
            Percentage Off (%)
          </button>
          <button
            type="button"
            className={`calc-btn ${mode === 'amount' ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
            onClick={() => setMode('amount')}
          >
            Flat Cash Off (₹)
          </button>
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="disc-price">Original Price (MRP) (₹)</label>
          <span className="calc-field-hint">{formatINR(originalPrice)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="disc-price"
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className={`calc-input has-prefix ${errors.originalPrice ? 'calc-input-error' : ''}`}
            placeholder="e.g. 2500"
            min="1"
            step="100"
          />
        </div>
        {errors.originalPrice && <span className="calc-error-text">{errors.originalPrice}</span>}
      </div>

      {mode === 'percent' ? (
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="disc-pct">Discount Percentage (%)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['5', '10', '15', '20', '25', '50'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`calc-btn calc-btn-sm ${discountPercent === p ? 'calc-btn-primary' : 'calc-btn-secondary'}`}
                  onClick={() => setDiscountPercent(p)}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="disc-pct"
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={`calc-input has-suffix ${errors.discountPercent ? 'calc-input-error' : ''}`}
              placeholder="e.g. 15"
              min="0"
              max="100"
              step="1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.discountPercent && <span className="calc-error-text">{errors.discountPercent}</span>}
        </div>
      ) : (
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="disc-amt">Discount Amount (₹)</label>
            <span className="calc-field-hint">{formatINR(discountAmount)}</span>
          </div>
          <div className="calc-input-addon-wrap">
            <span className="calc-addon-prefix">₹</span>
            <input
              id="disc-amt"
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className={`calc-input has-prefix ${errors.discountAmount ? 'calc-input-error' : ''}`}
              placeholder="e.g. 375"
              min="0"
              step="50"
            />
          </div>
          {errors.discountAmount && <span className="calc-error-text">{errors.discountAmount}</span>}
        </div>
      )}
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="calc-primary-result-label" style={{ color: '#166534' }}>Final Payable Price</div>
        <div className="calc-primary-result-value" style={{ color: 'var(--calc-success)' }}>
          {formatINR(result.finalPrice)}
        </div>
        <div className="calc-primary-result-caption" style={{ color: '#15803d' }}>
          You save {formatINR(result.amountSaved)} ({formatPercent(result.discountPercent)}) off original MRP
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Original Tag Price</div>
          <div className="calc-metric-value">{formatINR(result.originalPrice)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Savings / Cash Off</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            - {formatINR(result.amountSaved)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Discount Calculator">
      <CalculatorShell
        title="Discount Calculator"
        category="Other Financial Tools"
        description="Calculate final payable price and exact rupees saved during sales, promotional offers, and commercial trade discounts."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Discount Calculation"
        formulaCode="Discount Amount = (Original Price × Discount %) / 100 ; Final Price = Original - Discount"
        formulaDescription="Computes net payable price after deducting percentage reductions or direct flat cash rebates."
        disclaimerText="Discounts are subject to vendor terms, minimum purchase values, and coupon code conditions."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
