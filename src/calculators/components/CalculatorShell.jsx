// src/calculators/components/CalculatorShell.jsx
// ─────────────────────────────────────────────────────────────────
// Standardized UI Shell for Every Financial Calculator
// Consistent Architecture: Header, Inputs, Actions, Results, Formula, Disclaimer
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Calculator,
  Printer,
  ChevronRight,
  Info,
  AlertTriangle,
  Code2
} from 'lucide-react';
import ExploreServices from './ExploreServices';
import '../styles/calculators.css';

export default function CalculatorShell({
  title,
  category,
  description,
  inputsComponent,
  resultsComponent,
  formulaTitle,
  formulaCode,
  formulaDescription,
  disclaimerText,
  calcTag,
  onCalculate,
  onReset,
  children,
}) {
  const handlePrint = () => {
    window.print();
  };

  const defaultDisclaimer =
    "Disclaimer: This calculator provides an indicative estimate for informational purposes only. Actual loan eligibility, EMI, interest, charges, returns and other terms may vary based on lender policy, applicant credit profile, income documentation, applicable regulations, product terms and other underwriting conditions.";

  return (
    <div className="calc-workspace animate-fade-in">
      {/* Workspace Header */}
      <section className="calc-workspace-header">
        <nav className="calc-breadcrumbs" aria-label="Calculator Breadcrumb">
          <Link to="/calculators" className="calc-breadcrumb-link">Calculators</Link>
          <ChevronRight size={14} />
          {category && (
            <>
              <span>{category}</span>
              <ChevronRight size={14} />
            </>
          )}
          <span style={{ fontWeight: 600, color: 'var(--calc-text-main)' }}>{title}</span>
        </nav>

        <div className="calc-workspace-title-row">
          <div>
            <h2 className="calc-workspace-title">{title}</h2>
            <p className="calc-workspace-desc">{description}</p>
          </div>

          <div className="calc-workspace-actions">
            <button
              type="button"
              onClick={handlePrint}
              className="calc-btn calc-btn-secondary calc-btn-sm"
              title="Print Calculation Report"
            >
              <Printer size={16} />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* Two-Column Interactive Workspace */}
      <div className="calc-layout-grid">
        {/* Left Column: Inputs */}
        <section className="calc-card-inputs" aria-labelledby="calc-inputs-heading">
          <h3 id="calc-inputs-heading" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: 'var(--calc-navy-dark)' }}>
            Input Parameters
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); if (onCalculate) onCalculate(); }}>
            {inputsComponent}

            <div className="calc-btn-group">
              <button
                type="submit"
                className="calc-btn calc-btn-primary"
                style={{ flex: 1 }}
              >
                <Calculator size={18} />
                <span>Calculate</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="calc-btn calc-btn-secondary"
                title="Reset all inputs to default"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Results & Breakdown */}
        <section className="calc-card-results" aria-labelledby="calc-results-heading">
          <h3 id="calc-results-heading" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: 'var(--calc-navy-dark)' }}>
            Calculation Summary
          </h3>

          {resultsComponent}

          {/* Formula / Explanation Box */}
          {formulaCode && (
            <div className="calc-formula-box">
              <div className="calc-formula-title">
                <Code2 size={16} />
                <span>{formulaTitle || 'Calculation Formula'}</span>
              </div>
              <div className="calc-formula-code">{formulaCode}</div>
              {formulaDescription && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--calc-text-muted)', lineHeight: 1.4 }}>
                  {formulaDescription}
                </p>
              )}
            </div>
          )}

          {/* Legal / Financial Disclaimer */}
          <div className="calc-disclaimer-box" role="note">
            <AlertTriangle size={18} className="calc-disclaimer-icon" />
            <div>
              <strong>Indicative Calculation: </strong>
              <span>{disclaimerText || defaultDisclaimer}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Extra Full Width Children (e.g., Amortization Schedules) */}
      {children}

      {/* Contextual Explore Services Integration */}
      <ExploreServices currentCalcTag={calcTag} />
    </div>
  );
}
