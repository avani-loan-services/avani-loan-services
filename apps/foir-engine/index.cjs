// apps/foir-engine/index.cjs
// ─────────────────────────────────────────────────────────────────
// Deterministic Financial Calculation Engine — FOIR & DTI
// AVANI LOAN SERVICES — Autonomous Credit Underwriting Suite
// Version: 1.0.0 (Deterministic, Zero LLM Inference)
// ─────────────────────────────────────────────────────────────────

'use strict';

/**
 * Standard reducing balance EMI calculation.
 * Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * 
 * @param {Object} params
 * @param {number} params.principal Loan principal in INR
 * @param {number} params.annualRate Annual interest rate percentage (e.g., 10.5 for 10.5%)
 * @param {number} params.tenureMonths Tenure in months
 * @returns {number} Monthly EMI rounded to 2 decimal places
 */
function calculateEMI({ principal = 0, annualRate = 0, tenureMonths = 0 }) {
  const P = Math.max(0, Number(principal) || 0);
  const rAnnual = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(0, Math.round(Number(tenureMonths) || 0));

  if (P <= 0 || n <= 0) return 0;
  if (rAnnual === 0) return Number((P / n).toFixed(2));

  const r = rAnnual / (12 * 100);
  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);

  return isFinite(emi) ? Number(emi.toFixed(2)) : 0;
}

/**
 * Derive maximum loan amount achievable for a given available monthly EMI.
 * Formula: P = EMI * [(1 + r)^n - 1] / [r * (1 + r)^n]
 * 
 * @param {Object} params
 * @param {number} params.availableEmi Available monthly installment capacity
 * @param {number} params.annualRate Annual interest rate percentage
 * @param {number} params.tenureMonths Tenure in months
 * @returns {number} Maximum principal rounded to nearest rupee
 */
function deriveMaxLoanFromEMI({ availableEmi = 0, annualRate = 0, tenureMonths = 0 }) {
  const emi = Math.max(0, Number(availableEmi) || 0);
  const rAnnual = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(0, Math.round(Number(tenureMonths) || 0));

  if (emi <= 0 || n <= 0) return 0;
  if (rAnnual === 0) return Math.round(emi * n);

  const r = rAnnual / (12 * 100);
  const factor = Math.pow(1 + r, n);
  const principal = (emi * (factor - 1)) / (r * factor);

  return isFinite(principal) ? Math.max(0, Math.round(principal)) : 0;
}

/**
 * Deterministic FOIR (Fixed Obligation to Income Ratio) calculation.
 * Formula: FOIR = (Existing monthly obligations + proposed monthly obligation) / Verified monthly income
 * 
 * @param {Object} input
 * @param {number} input.verifiedMonthlyIncome Verified monthly net income in INR
 * @param {number} [input.existingMonthlyObligations=0] Current ongoing EMIs and recurring obligations
 * @param {number} [input.proposedLoanAmount=0] Requested loan amount in INR
 * @param {number} [input.proposedAnnualRate=10.5] Indicative rate for proposed loan
 * @param {number} [input.proposedTenureMonths=60] Requested tenure in months
 * @param {number} [input.proposedMonthlyEmi=0] Pre-calculated proposed EMI (if supplied)
 * @param {number} [input.maxPermissibleFoirPercent=50] Lender policy max FOIR percentage cap (e.g. 50%)
 * @returns {Object} Comprehensive deterministic FOIR assessment
 */
function calculateFOIR(input = {}) {
  const verifiedMonthlyIncome = Number(input.verifiedMonthlyIncome);
  const rawExisting = Number(input.existingMonthlyObligations);
  const existingMonthlyObligations = isNaN(rawExisting) ? 0 : Math.max(0, rawExisting);
  const maxPermissibleFoirPercent = Number(input.maxPermissibleFoirPercent) || 50;

  // Boundary condition checks
  if (isNaN(verifiedMonthlyIncome) || verifiedMonthlyIncome <= 0) {
    return {
      status: 'REJECT_INVALID_INCOME',
      reason: 'Verified monthly income must be a positive number greater than 0.',
      verifiedMonthlyIncome: 0,
      existingMonthlyObligations,
      proposedMonthlyEmi: 0,
      totalMonthlyObligations: existingMonthlyObligations,
      foirPercent: null,
      maxPermissibleEmi: 0,
      availableEmiCapacity: 0,
      maxEligibleLoanAmount: 0,
      riskBand: 'CRITICAL_INVALID',
      isWithinPolicy: false
    };
  }

  // Calculate proposed EMI if not explicitly provided
  let proposedMonthlyEmi = Number(input.proposedMonthlyEmi) || 0;
  if (proposedMonthlyEmi <= 0 && Number(input.proposedLoanAmount) > 0) {
    proposedMonthlyEmi = calculateEMI({
      principal: input.proposedLoanAmount,
      annualRate: input.proposedAnnualRate || 10.5,
      tenureMonths: input.proposedTenureMonths || 60
    });
  }

  const totalMonthlyObligations = Number((existingMonthlyObligations + proposedMonthlyEmi).toFixed(2));
  const rawFoirRatio = totalMonthlyObligations / verifiedMonthlyIncome;
  const foirPercent = Number((rawFoirRatio * 100).toFixed(2));

  // Policy threshold calculations
  const maxPermissibleTotalObligations = Number(((verifiedMonthlyIncome * maxPermissibleFoirPercent) / 100).toFixed(2));
  const availableEmiCapacity = Number(Math.max(0, maxPermissibleTotalObligations - existingMonthlyObligations).toFixed(2));

  const maxEligibleLoanAmount = deriveMaxLoanFromEMI({
    availableEmi: availableEmiCapacity,
    annualRate: input.proposedAnnualRate || 10.5,
    tenureMonths: input.proposedTenureMonths || 60
  });

  // Risk band determination
  let riskBand = 'PRIME';
  if (foirPercent <= 40) {
    riskBand = 'PRIME';
  } else if (foirPercent <= 50) {
    riskBand = 'STANDARD';
  } else if (foirPercent <= 60) {
    riskBand = 'STRETCHED';
  } else {
    riskBand = 'CRITICAL_OVERBURDENED';
  }

  const isWithinPolicy = foirPercent <= maxPermissibleFoirPercent;

  return {
    status: isWithinPolicy ? 'ELIGIBLE' : 'FOIR_EXCEEDED',
    verifiedMonthlyIncome,
    existingMonthlyObligations,
    proposedMonthlyEmi,
    totalMonthlyObligations,
    foirPercent,
    maxPermissibleFoirPercent,
    maxPermissibleTotalObligations,
    availableEmiCapacity,
    maxEligibleLoanAmount,
    riskBand,
    isWithinPolicy,
    policyVersion: '1.0.0-DETERMINISTIC'
  };
}

/**
 * Deterministic DTI (Debt-to-Income) ratio calculation according to lender standards.
 * Standard monthly DTI: Total Monthly Debt / Monthly Gross or Net Income
 * Standard annual DTI: Total Annual Debt / Annual Gross Income
 * 
 * @param {Object} input
 * @param {number} input.income Monthly or annual income
 * @param {number} input.totalDebt Total monthly or annual debt obligations
 * @param {string} [input.mode='monthly'] 'monthly' or 'annual'
 * @param {number} [input.maxDtiPercent=45] Max permissible DTI cap
 * @returns {Object}
 */
function calculateDTI(input = {}) {
  const income = Number(input.income);
  const totalDebt = Math.max(0, Number(input.totalDebt) || 0);
  const mode = input.mode === 'annual' ? 'annual' : 'monthly';
  const maxDtiPercent = Number(input.maxDtiPercent) || 45;

  if (isNaN(income) || income <= 0) {
    return {
      status: 'REJECT_INVALID_INCOME',
      dtiPercent: null,
      mode,
      isWithinPolicy: false
    };
  }

  const dtiPercent = Number(((totalDebt / income) * 100).toFixed(2));
  const isWithinPolicy = dtiPercent <= maxDtiPercent;

  return {
    status: isWithinPolicy ? 'ACCEPTABLE' : 'DTI_EXCEEDED',
    income,
    totalDebt,
    dtiPercent,
    maxDtiPercent,
    mode,
    isWithinPolicy,
    policyVersion: '1.0.0-DETERMINISTIC'
  };
}

module.exports = {
  calculateEMI,
  deriveMaxLoanFromEMI,
  calculateFOIR,
  calculateDTI
};
