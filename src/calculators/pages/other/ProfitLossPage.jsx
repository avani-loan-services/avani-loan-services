// src/calculators/pages/other/ProfitLossPage.jsx
// ─────────────────────────────────────────────────────────────────
// 3.2 Profit, Loss & Margin Calculator
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateProfitLoss } from '../../utils/calculations.js';
import { formatINR, formatPercent, parseNumber } from '../../utils/formatters.js';
import { validateNumber } from '../../utils/validation.js';

export default function ProfitLossPage() {
  const [costPrice, setCostPrice] = useState('800');
  const [sellingPrice, setSellingPrice] = useState('1000');

  const errors = useMemo(() => {
    return {
      costPrice: validateNumber(costPrice, { min: 0, max: 1000000000, fieldName: 'Cost Price' }),
      sellingPrice: validateNumber(sellingPrice, { min: 0, max: 1000000000, fieldName: 'Selling Price' }),
    };
  }, [costPrice, sellingPrice]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        costPrice: parseNumber(costPrice),
        sellingPrice: parseNumber(sellingPrice),
        isProfit: true,
        type: 'Profit',
        amount: 0,
        profitLossPercent: 0,
        marginPercent: 0,
      };
    }
    return calculateProfitLoss({
      costPrice: parseNumber(costPrice),
      sellingPrice: parseNumber(sellingPrice),
    });
  }, [costPrice, sellingPrice, hasErrors]);

  const handleReset = () => {
    setCostPrice('800');
    setSellingPrice('1000');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="pl-cp">Cost Price (CP) (₹)</label>
          <span className="calc-field-hint">{formatINR(costPrice)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="pl-cp"
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className={`calc-input has-prefix ${errors.costPrice ? 'calc-input-error' : ''}`}
            placeholder="e.g. 800"
            min="0"
            step="50"
          />
        </div>
        {errors.costPrice && <span className="calc-error-text">{errors.costPrice}</span>}
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="pl-sp">Selling Price (SP) (₹)</label>
          <span className="calc-field-hint">{formatINR(sellingPrice)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="pl-sp"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className={`calc-input has-prefix ${errors.sellingPrice ? 'calc-input-error' : ''}`}
            placeholder="e.g. 1000"
            min="0"
            step="50"
          />
        </div>
        {errors.sellingPrice && <span className="calc-error-text">{errors.sellingPrice}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div
        className="calc-primary-result-box"
        style={{
          background: result.isProfit ? '#f0fdf4' : '#fef2f2',
          borderColor: result.isProfit ? '#bbf7d0' : '#fecaca',
        }}
      >
        <div className="calc-primary-result-label" style={{ color: result.isProfit ? '#166534' : '#991b1b' }}>
          Net {result.type} Realized
        </div>
        <div
          className="calc-primary-result-value"
          style={{ color: result.isProfit ? 'var(--calc-success)' : 'var(--calc-error)' }}
        >
          {result.isProfit ? `+ ${formatINR(result.amount)}` : `- ${formatINR(result.amount)}`}
        </div>
        <div className="calc-primary-result-caption" style={{ color: result.isProfit ? '#15803d' : '#b91c1c' }}>
          {result.type} on Cost: {formatPercent(result.profitLossPercent)} | Margin on Revenue: {formatPercent(result.marginPercent)}
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Profit / Markup % (on Cost)</div>
          <div className="calc-metric-value" style={{ color: result.isProfit ? 'var(--calc-success)' : 'var(--calc-error)' }}>
            {formatPercent(result.profitLossPercent)}
          </div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Profit Margin % (on Sales Price)</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-primary)' }}>
            {formatPercent(result.marginPercent)}
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', lineHeight: 1.45, color: '#475569' }}>
        <strong>Key Business Distinction:</strong>
        <ul style={{ paddingLeft: '16px', marginTop: '6px', listStyleType: 'disc' }}>
          <li><strong>Markup / Profit %:</strong> Measured relative to your Cost Price (Profit / CP × 100).</li>
          <li><strong>Margin %:</strong> Measured relative to your Selling Revenue (Profit / SP × 100).</li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Profit & Margin Calculator">
      <CalculatorShell
        title="Profit, Loss & Margin Calculator"
        category="Other Financial Tools"
        description="Compute gross profit, loss, markup percentage on purchase price, and net profit margin percentage on sales turnover."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Profit vs Margin Formulas"
        formulaCode="Profit % = (SP - CP) / CP × 100 ; Margin % = (SP - CP) / SP × 100"
        formulaDescription="Markup shows profit over investment cost, while gross margin shows the percentage of revenue remaining after accounting for goods sold."
        disclaimerText="This tool calculates gross product/transaction profitability and does not factor in operating overheads, logistics, or income taxation."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
