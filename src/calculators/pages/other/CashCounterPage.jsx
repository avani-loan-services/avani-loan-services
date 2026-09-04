// src/calculators/pages/other/CashCounterPage.jsx
// ─────────────────────────────────────────────────────────────────
// 3.4 Cash Note Counter (Indian Currency Denominations)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateCashDenominations } from '../../utils/calculations.js';
import { formatINR, numberToIndianWords, parseNumber } from '../../utils/formatters.js';
import { Banknote, RotateCcw, Printer, Coins } from 'lucide-react';

const DENOMINATIONS = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

export default function CashCounterPage() {
  const [quantities, setQuantities] = useState({
    2000: '0',
    500: '10',
    200: '5',
    100: '10',
    50: '4',
    20: '0',
    10: '0',
    5: '0',
    2: '0',
    1: '0',
  });

  const result = useMemo(() => {
    return calculateCashDenominations({ quantities });
  }, [quantities]);

  const handleQtyChange = (denom, val) => {
    const cleanVal = val === '' ? '' : String(Math.max(0, Math.round(parseNumber(val, 0))));
    setQuantities((prev) => ({
      ...prev,
      [denom]: cleanVal,
    }));
  };

  const handleReset = () => {
    const empty = {};
    DENOMINATIONS.forEach((d) => (empty[d] = '0'));
    setQuantities(empty);
  };

  const amountWords = useMemo(() => {
    return numberToIndianWords(result.grandTotal);
  }, [result.grandTotal]);

  const inputsComponent = (
    <div style={{ maxHeight: '540px', overflowY: 'auto', paddingRight: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px 8px 10px', borderBottom: '2px solid #e2e8f0', fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}>
        <span>Denomination</span>
        <span>Count (Pieces)</span>
        <span style={{ textAlign: 'right' }}>Total (₹)</span>
      </div>

      {DENOMINATIONS.map((denom) => {
        const qty = quantities[denom] || '0';
        const subtotal = denom * parseNumber(qty, 0);

        return (
          <div key={denom} className="calc-denom-row">
            <div className="calc-denom-label">
              <span>₹{denom}</span>
            </div>
            <input
              type="number"
              value={qty === '0' ? '' : qty}
              onChange={(e) => handleQtyChange(denom, e.target.value)}
              placeholder="0"
              min="0"
              className="calc-denom-input"
              aria-label={`Count for ₹${denom} note`}
            />
            <div className="calc-denom-subtotal">
              {formatINR(subtotal)}
            </div>
          </div>
        );
      })}
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div className="calc-primary-result-label" style={{ color: '#166534' }}>Total Cash Value</div>
        <div className="calc-primary-result-value" style={{ color: 'var(--calc-success)' }}>
          {formatINR(result.grandTotal)}
        </div>
        <div className="calc-primary-result-caption" style={{ color: '#15803d', fontWeight: 600 }}>
          {amountWords}
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Total Notes / Coins Pieces</div>
          <div className="calc-metric-value">{result.totalNotes} Pieces</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Average Note Value</div>
          <div className="calc-metric-value">
            {result.totalNotes > 0 ? formatINR(result.grandTotal / result.totalNotes) : '₹0'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Cash Note Counter">
      <CalculatorShell
        title="Cash Note Counter (Denomination Calculator)"
        category="Other Financial Tools"
        description="Physical currency denomination counter for daily branch cash drawer balancing, bank deposits, and cash management."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Denomination Summation"
        formulaCode="Grand Total = ∑ (Denomination_i × Quantity_i)"
        formulaDescription="Computes real-time totals across all Indian currency denominations (₹2000 to ₹1) and outputs formal verbal amount for bank deposit slips."
        disclaimerText="Denomination totals reflect entered counts. Ensure physical notes are verified through bank note-counting and counterfeit detection machines before branch deposits."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
