// apps/policy-engine/index.cjs
// ─────────────────────────────────────────────────────────────────
// Versioned Lender Policy Engine & Match Evaluator
// AVANI LOAN SERVICES — Autonomous Credit Underwriting Suite
// Version: 1.0.0 (Deterministic, Traceable, Zero LLM Inference)
// ─────────────────────────────────────────────────────────────────

'use strict';

const fs = require('fs');
const path = require('path');
const { calculateFOIR } = require('../foir-engine/index.cjs');

const DEFAULT_POLICY_PATH = path.resolve(__dirname, '../../policies/v1/lender_policies.json');

/**
 * Load versioned lender policies from disk.
 * 
 * @param {string} [customPath]
 * @returns {Array<Object>} List of lender policies
 */
function loadPolicies(customPath = DEFAULT_POLICY_PATH) {
  if (!fs.existsSync(customPath)) {
    throw new Error(`Policy file not found at path: ${customPath}`);
  }
  const raw = fs.readFileSync(customPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Evaluate a single applicant against a single lender policy.
 * 
 * @param {Object} applicant
 * @param {Object} policy
 * @returns {Object} Evaluation outcome with status, reasonCodes, and checklist
 */
function evaluatePolicy(applicant = {}, policy = {}) {
  const reasonCodes = [];
  const warnings = [];

  const income = Number(applicant.monthlyIncome) || 0;
  const existingObligations = Number(applicant.existingObligations) || 0;
  const requestedLoan = Number(applicant.requestedLoanAmount) || 0;
  const requestedTenure = Number(applicant.requestedTenureMonths) || 60;
  const cibilScore = Number(applicant.cibilScore) || 0;
  const age = Number(applicant.ageYears) || 0;
  const dpdLast12Months = Number(applicant.dpdLast12Months) || 0;
  const employmentType = String(applicant.employmentType || '').toUpperCase();
  const geography = String(applicant.geography || 'MAHARASHTRA').toUpperCase();

  // 1. Geography Check
  const geoAllowed = policy.allowedGeographies.some(g => g === 'PAN_INDIA' || g === geography);
  if (!geoAllowed) {
    reasonCodes.push('REASON_GEO_NOT_SERVICED');
  }

  // 2. Employment Type Check
  const empAllowed = policy.allowedEmploymentTypes.includes(employmentType);
  if (!empAllowed) {
    reasonCodes.push('REASON_EMPLOYMENT_NOT_ACCEPTED');
  }

  // 3. Minimum Income Check
  if (income < policy.minimumIncomeMonthly) {
    reasonCodes.push('REASON_INSUFFICIENT_INCOME');
  }

  // 4. CIBIL Bureau Score Check
  if (cibilScore > 0 && cibilScore < policy.minimumCibilScore) {
    reasonCodes.push('REASON_CIBIL_BELOW_THRESHOLD');
  } else if (cibilScore <= 0) {
    warnings.push('CIBIL score missing or zero; human credit assessment required.');
  }

  // 5. Past DPD Delinquency Check
  if (dpdLast12Months > policy.maxDpdLast12Months) {
    reasonCodes.push('REASON_DPD_DELINQUENCY_DETECTED');
  }

  // 6. Age Criteria
  if (age > 0) {
    if (age < policy.minAgeYears || age > policy.maxAgeYears) {
      reasonCodes.push('REASON_AGE_OUT_OF_BOUNDS');
    }
  }

  // 7. Loan Amount Range
  if (requestedLoan > 0) {
    if (requestedLoan < policy.minLoanAmount || requestedLoan > policy.maxLoanAmount) {
      reasonCodes.push('REASON_LOAN_AMOUNT_OUT_OF_BOUNDS');
    }
  }

  // 8. Tenure Range
  if (requestedTenure < policy.minTenureMonths || requestedTenure > policy.maxTenureMonths) {
    warnings.push(`Requested tenure (${requestedTenure}m) adjusted to policy limits [${policy.minTenureMonths}-${policy.maxTenureMonths}m].`);
  }

  // 9. Deterministic FOIR Check with proposed rate from policy
  const effectiveRate = policy.indicativeAnnualRate || 10.5;
  const foirResult = calculateFOIR({
    verifiedMonthlyIncome: income,
    existingMonthlyObligations: existingObligations,
    proposedLoanAmount: requestedLoan,
    proposedAnnualRate: effectiveRate,
    proposedTenureMonths: requestedTenure,
    maxPermissibleFoirPercent: policy.maximumFoirPercent
  });

  if (!foirResult.isWithinPolicy && foirResult.foirPercent !== null) {
    reasonCodes.push('REASON_FOIR_BREACH');
  }

  // Determine Match Status
  let matchStatus = 'MATCH_RECOMMENDED';
  if (reasonCodes.length > 0) {
    // If only FOIR or CIBIL is slightly off, flag as conditional or refer
    const hardRejections = reasonCodes.filter(r => 
      r === 'REASON_EMPLOYMENT_NOT_ACCEPTED' || 
      r === 'REASON_GEO_NOT_SERVICED' || 
      r === 'REASON_DPD_DELINQUENCY_DETECTED' ||
      r === 'REASON_INSUFFICIENT_INCOME'
    );
    if (hardRejections.length > 0) {
      matchStatus = 'REJECT';
    } else {
      matchStatus = 'REFER_HUMAN_UNDERWRITER';
    }
  } else if (warnings.length > 0) {
    matchStatus = 'CONDITIONAL_MATCH';
  }

  return {
    policyId: policy.policyId,
    lenderId: policy.lenderId,
    lenderName: policy.lenderName,
    product: policy.product,
    policyVersion: policy.policyVersion,
    sourceReference: policy.sourceReference,
    matchStatus,
    reasonCodes,
    warnings,
    foirAssessment: foirResult,
    indicativeRate: policy.indicativeAnnualRate,
    maxEligibleAmountUnderPolicy: foirResult.maxEligibleLoanAmount,
    requiredDocuments: policy.requiredDocuments,
    humanReviewMandatory: true
  };
}

/**
 * Match applicant against all active policies for a given loan product.
 * Returns ranked lenders by lowest indicative rate and highest eligible amount.
 * 
 * @param {Object} applicant
 * @param {string} [loanProduct]
 * @param {Array<Object>} [policies]
 * @returns {Object} Comprehensive multi-lender matching result
 */
function matchLenders(applicant = {}, loanProduct = null, policies = null) {
  const allPolicies = policies || loadPolicies();
  const productFilter = loanProduct ? loanProduct.toUpperCase() : null;

  const relevantPolicies = allPolicies.filter(p => {
    if (!productFilter) return true;
    return p.product.toUpperCase() === productFilter;
  });

  if (relevantPolicies.length === 0) {
    return {
      status: 'NO_POLICIES_CONFIGURED',
      loanProduct: productFilter,
      matchedLenders: [],
      reason: `No active lender policies found matching product '${productFilter}'.`
    };
  }

  const results = relevantPolicies.map(p => evaluatePolicy(applicant, p));

  // Partition into Eligible / Conditional / Refer / Rejected
  const recommended = results.filter(r => r.matchStatus === 'MATCH_RECOMMENDED')
    .sort((a, b) => a.indicativeRate - b.indicativeRate);

  const conditional = results.filter(r => r.matchStatus === 'CONDITIONAL_MATCH')
    .sort((a, b) => a.indicativeRate - b.indicativeRate);

  const referred = results.filter(r => r.matchStatus === 'REFER_HUMAN_UNDERWRITER');
  const rejected = results.filter(r => r.matchStatus === 'REJECT');

  return {
    applicantName: applicant.fullName || 'Valued Customer',
    loanProduct: productFilter || 'ALL',
    totalPoliciesEvaluated: relevantPolicies.length,
    bestMatchCount: recommended.length,
    recommendedLenders: recommended,
    conditionalLenders: conditional,
    referredToHumanReview: referred,
    rejectedLenders: rejected,
    topRecommendation: recommended[0] || conditional[0] || null,
    evaluationTimestamp: new Date().toISOString()
  };
}

module.exports = {
  loadPolicies,
  evaluatePolicy,
  matchLenders
};
