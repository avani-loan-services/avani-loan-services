// src/calculators/pages/other/AmountToWordsPage.jsx
// ─────────────────────────────────────────────────────────────────
// 3.5 Amount to Indian Words Converter (Lakhs & Crores Format)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { numberToIndianWords, formatINR, formatNumber } from '../../utils/formatters.js';
import { validateNumber } from '../../utils/validation.js';
import { Copy, Check } from 'lucide-react';

export default function AmountToWordsPage() {
  const [amount, setAmount] = useState('1250000.50');
  const [copied, setCopied] = useState(false);

  const errors = useMemo(() => {
    return {
      amount: validateNumber(amount, { min: 0, max: 10000000000, fieldName: 'Amount' }),
    };
  }, [amount]);

  const hasErrors = Object.values(errors).some(Boolean);

  const words = useMemo(() => {
    if (hasErrors || !amount) return 'Zero Rupees Only';
    return numberToIndianWords(amount);
  }, [amount, hasErrors]);

  const handleCopy = () => {
    navigator.clipboard.writeText(words);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAmount('1250000.50');
  };

  const presets = [
    { label: '₹1,250', val: '1250' },
    { label: '₹1,25,000', val: '125000' },
    { label: '₹12,50,000.50', val: '1250000.50' },
    { label: '₹1,00,00,000', val: '10000000' },
    { label: '₹25,00,00,000', val: '250000000' },
  ];

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="atw-amount">Enter Numeric Amount (₹)</label>
          <span className="calc-field-hint">{formatINR(amount)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="atw-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`calc-input has-prefix ${errors.amount ? 'calc-input-error' : ''}`}
            placeholder="e.g. 1250000.50"
            min="0"
            step="0.01"
          />
        </div>
        {errors.amount && <span className="calc-error-text">{errors.amount}</span>}
      </div>

      <div className="calc-field-wrap">
        <label className="calc-field-label">Quick Test Presets</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          {presets.map((p) => (
            <button
              key={p.val}
              type="button"
              className="calc-btn calc-btn-secondary calc-btn-sm"
              onClick={() => setAmount(p.val)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
        <div className="calc-primary-result-label">Amount in Words (Indian System)</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--calc-primary)', lineHeight: 1.4, margin: '12px 0' }}>
          "{words}"
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="calc-btn calc-btn-primary calc-btn-sm"
          style={{ marginTop: '8px' }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Verbal Text'}</span>
        </button>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Formatted Indian Currency</div>
          <div className="calc-metric-value">{formatINR(amount)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Standard Indian Number String</div>
          <div className="calc-metric-value">{formatNumber(amount, 2)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Amount to Words Converter">
      <CalculatorShell
        title="Amount to Words Converter"
        category="Other Financial Tools"
        description="Convert numeric Indian Rupee amounts into words following standard Indian banking notation (Thousands, Lakhs, Crores, Rupees and Paise)."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Indian Numbering Conversion Standards"
        formulaCode="1 Lakh = 1,00,000 (100 Thousand) ; 1 Crore = 1,00,00,000 (100 Lakhs)"
        formulaDescription="Essential for bank cheque writing, demand drafts, commercial legal contracts, promissory notes, and property deeds."
        disclaimerText="Verify wording before issuing cheques or executing binding financial and banking instruments."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
