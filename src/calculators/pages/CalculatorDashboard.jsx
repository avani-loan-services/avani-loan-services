/* eslint-disable react-refresh/only-export-components */
// src/calculators/pages/CalculatorDashboard.jsx
// ─────────────────────────────────────────────────────────────────
// Central Dashboard for AVANI LOAN SERVICES Financial Calculator Suite
// Organizes 20 Professional Calculators across 3 Major Categories
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CalculatorLayout from '../layouts/CalculatorLayout';
import ExploreServices from '../components/ExploreServices';
import {
  Calculator,
  Percent,
  TrendingUp,
  Scale,
  CreditCard,
  Building,
  PiggyBank,
  Receipt,
  Tag,
  Banknote,
  FileSpreadsheet,
  ArrowRight,
  Search,
  CheckCircle2,
  RefreshCw,
  Coins,
  Sliders,
  DollarSign,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import '../styles/calculators.css';

export const CALCULATOR_REGISTRY = [
  // ── Category 1: Loan Calculators
  {
    id: 'emi',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'EMI Calculator',
    description: 'Calculate monthly installment, total interest breakdown, and amortized repayment schedules.',
    path: '/financial-tools/loan/emi',
    icon: <Calculator size={22} />,
    tags: ['loan', 'emi', 'interest', 'monthly', 'amortization'],
  },
  {
    id: 'foir-eligibility',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Eligibility Calculator (FOIR)',
    description: 'Estimate maximum borrowing capacity based on fixed obligation to income ratio guidelines.',
    path: '/financial-tools/loan/foir-eligibility',
    icon: <Scale size={22} />,
    tags: ['eligibility', 'foir', 'income', 'borrowing capacity'],
  },
  {
    id: 'multiplier-eligibility',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Eligibility (Multiplier Method)',
    description: 'Quick salary/income multiplier evaluation with existing EMI capacity adjustment.',
    path: '/financial-tools/loan/multiplier-eligibility',
    icon: <TrendingUp size={22} />,
    tags: ['multiplier', 'salary', 'eligibility', 'capacity'],
  },
  {
    id: 'outstanding',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Outstanding Loan Calculator',
    description: 'Track exact principal balance, total principal & interest paid after k installments.',
    path: '/financial-tools/loan/outstanding',
    icon: <FileSpreadsheet size={22} />,
    tags: ['outstanding', 'balance', 'principal', 'emis paid'],
  },
  {
    id: 'foreclosure',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Foreclosure Calculator',
    description: 'Compute full loan settlement amount including lender foreclosure fees, GST, and extras.',
    path: '/financial-tools/loan/foreclosure',
    icon: <CheckCircle2 size={22} />,
    tags: ['foreclosure', 'pre-closure', 'settlement', 'penalty'],
  },
  {
    id: 'overdraft',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Overdraft (OD) Calculator',
    description: 'Estimate interest on utilized credit limit based on daily/monthly tenure and rates.',
    path: '/financial-tools/loan/overdraft',
    icon: <CreditCard size={22} />,
    tags: ['overdraft', 'od', 'credit limit', 'utilized'],
  },
  {
    id: 'comparison',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Loan Comparison Calculator',
    description: 'Side-by-side analysis of two loan offers comparing EMI, processing fees, and overall cost.',
    path: '/financial-tools/loan/comparison',
    icon: <Sliders size={22} />,
    tags: ['compare', 'loans', 'cheapest', 'side by side'],
  },
  {
    id: 'prepayment',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Prepayment Calculator',
    description: 'Simulate lump-sum part-payment benefits: Choose between tenure reduction or EMI reduction.',
    path: '/financial-tools/loan/prepayment',
    icon: <Coins size={22} />,
    tags: ['prepayment', 'part payment', 'save interest', 'tenure reduction'],
  },
  {
    id: 'rate-change',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'Rate Change Calculator',
    description: 'Evaluate impact of interest rate hike or reduction on monthly EMI and loan duration.',
    path: '/financial-tools/loan/rate-change',
    icon: <RefreshCw size={22} />,
    tags: ['rate change', 'repo rate', 'emi increase', 'floating rate'],
  },
  {
    id: 'gst-interest',
    category: 'Loan Calculators',
    categoryKey: 'loan',
    name: 'GST on Interest & Charges',
    description: 'Calculate applicable GST (CGST + SGST) on processing fees, late charges, and loan services.',
    path: '/financial-tools/loan/gst-interest',
    icon: <Receipt size={22} />,
    tags: ['gst', 'charges', 'processing fee', 'tax'],
  },

  // ── Category 2: Investment Calculators
  {
    id: 'fd',
    category: 'Investment Calculators',
    categoryKey: 'investment',
    name: 'Fixed Deposit (FD) Calculator',
    description: 'Determine FD maturity amount & interest earned with monthly, quarterly, or yearly compounding.',
    path: '/financial-tools/investment/fd',
    icon: <Building size={22} />,
    tags: ['fd', 'fixed deposit', 'compounding', 'bank'],
  },
  {
    id: 'rd',
    category: 'Investment Calculators',
    categoryKey: 'investment',
    name: 'Recurring Deposit (RD) Calculator',
    description: 'Calculate maturity value for recurring monthly savings with quarterly bank compounding.',
    path: '/financial-tools/investment/rd',
    icon: <PiggyBank size={22} />,
    tags: ['rd', 'recurring deposit', 'monthly deposit'],
  },
  {
    id: 'sip',
    category: 'Investment Calculators',
    categoryKey: 'investment',
    name: 'SIP Calculator',
    description: 'Project wealth accumulation and estimated returns from systematic monthly mutual fund investments.',
    path: '/financial-tools/investment/sip',
    icon: <TrendingUp size={22} />,
    tags: ['sip', 'mutual fund', 'wealth', 'systematic investment'],
  },
  {
    id: 'interest',
    category: 'Investment Calculators',
    categoryKey: 'investment',
    name: 'Interest Calculator (SI & CI)',
    description: 'Dual-mode Simple & Compound Interest calculator with transparent formula displays.',
    path: '/financial-tools/investment/interest',
    icon: <Percent size={22} />,
    tags: ['interest', 'simple interest', 'compound interest', 'si', 'ci'],
  },
  {
    id: 'ppf',
    category: 'Investment Calculators',
    categoryKey: 'investment',
    name: 'PPF Calculator',
    description: 'Calculate Public Provident Fund growth, annual tax-free interest, and 15-year maturity schedule.',
    path: '/financial-tools/investment/ppf',
    icon: <Briefcase size={22} />,
    tags: ['ppf', 'provident fund', 'tax saving', '15 years'],
  },

  // ── Category 3: Other Financial Tools
  {
    id: 'gst',
    category: 'Other Financial Tools',
    categoryKey: 'other',
    name: 'GST Calculator',
    description: 'Add or remove GST from gross or net amounts with standard 5%, 12%, 18%, 28% and custom rates.',
    path: '/financial-tools/other/gst',
    icon: <Receipt size={22} />,
    tags: ['gst', 'tax', 'cgst', 'sgst', 'reverse gst'],
  },
  {
    id: 'profit-margin',
    category: 'Other Financial Tools',
    categoryKey: 'other',
    name: 'Profit & Margin Calculator',
    description: 'Compute profit/loss amount and understand key difference between Profit % and Margin %.',
    path: '/financial-tools/other/profit-margin',
    icon: <DollarSign size={22} />,
    tags: ['profit', 'loss', 'margin', 'cost price', 'selling price'],
  },
  {
    id: 'discount',
    category: 'Other Financial Tools',
    categoryKey: 'other',
    name: 'Discount Calculator',
    description: 'Calculate final billing price after percentage discount or flat cash deduction.',
    path: '/financial-tools/other/discount',
    icon: <Tag size={22} />,
    tags: ['discount', 'sale', 'savings', 'percentage off'],
  },
  {
    id: 'cash-counter',
    category: 'Other Financial Tools',
    categoryKey: 'other',
    name: 'Cash Note Counter',
    description: 'Real-time currency denomination counter for Indian notes & coins with instant print view.',
    path: '/financial-tools/other/cash-counter',
    icon: <Banknote size={22} />,
    tags: ['cash', 'currency', 'notes', 'denomination', 'counter'],
  },
  {
    id: 'amount-to-words',
    category: 'Other Financial Tools',
    categoryKey: 'other',
    name: 'Amount to Words Converter',
    description: 'Convert numeric ₹ values to formal Indian words (Lakhs, Crores, Rupees and Paise).',
    path: '/financial-tools/other/amount-to-words',
    icon: <HelpCircle size={22} />,
    tags: ['words', 'amount in words', 'cheque writing', 'indian numbering'],
  },
];

export default function CalculatorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = useMemo(() => {
    if (!searchQuery.trim()) return CALCULATOR_REGISTRY;
    const query = searchQuery.toLowerCase().trim();
    return CALCULATOR_REGISTRY.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const categories = [
    { title: 'LOAN CALCULATORS', key: 'loan', count: 10 },
    { title: 'INVESTMENT CALCULATORS', key: 'investment', count: 5 },
    { title: 'OTHER FINANCIAL TOOLS', key: 'other', count: 5 },
  ];

  return (
    <CalculatorLayout currentTitle="Financial Tools Dashboard">
      {/* Hero Banner */}
      <section className="calc-hero animate-fade-in">
        <div className="calc-hero-badge">
          <Calculator size={16} />
          <span>AVANI LOAN SERVICES • FINANCIAL INTELLIGENCE</span>
        </div>
        <h2 className="calc-hero-title">AVANI FINANCIAL TOOLS</h2>
        <p className="calc-hero-desc">
          Loan, Investment & Financial Calculators — Professional underwriting tools, interest amortization schedules, and indicative eligibility assessment.
        </p>

        <div className="calc-search-box">
          <Search size={18} className="calc-search-icon" />
          <input
            type="text"
            placeholder="Search all 20 calculators (e.g. EMI, FOIR, SIP, Prepayment, GST)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="calc-search-input"
            aria-label="Search calculators"
          />
        </div>
      </section>

      {/* Category Sections */}
      {categories.map((cat) => {
        const calcsInCategory = filteredCalculators.filter((c) => c.categoryKey === cat.key);
        if (calcsInCategory.length === 0) return null;

        return (
          <section key={cat.key} className="calc-category-section" aria-labelledby={`cat-${cat.key}`}>
            <div className="calc-category-header">
              <div className="calc-category-title-wrap">
                <div className="calc-category-icon">
                  <Calculator size={20} />
                </div>
                <h3 id={`cat-${cat.key}`} className="calc-category-title">
                  {cat.title}
                </h3>
              </div>
              <span className="calc-category-count">
                {calcsInCategory.length} {calcsInCategory.length === 1 ? 'Tool' : 'Tools'}
              </span>
            </div>

            <div className="calc-grid">
              {calcsInCategory.map((calc) => (
                <div key={calc.id} className="calc-card">
                  <div>
                    <div className="calc-card-icon-wrap">{calc.icon}</div>
                    <h4 className="calc-card-name">{calc.name}</h4>
                    <p className="calc-card-desc">{calc.description}</p>
                  </div>
                  <Link to={calc.path} className="calc-card-btn">
                    <span>Open Calculator</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {filteredCalculators.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--calc-text-muted)' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No calculators found matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="calc-btn calc-btn-secondary"
            style={{ marginTop: '12px' }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Contextual Explore Services Integration */}
      <ExploreServices heading="Explore Our Specialized Loan Products" />
    </CalculatorLayout>
  );
}
