// tests/unit/test_policy_engine.test.cjs
// ─────────────────────────────────────────────────────────────────
// Unit Tests: Versioned Lender Policy Matching Engine
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const path = require('path');
const { loadPolicies, evaluatePolicy, matchLenders } = require('../../apps/policy-engine/index.cjs');

console.log('🧪 RUNNING UNIT TESTS: apps/policy-engine');

const policies = loadPolicies();
assert.ok(policies.length >= 5, 'Expected at least 5 default lender policies loaded.');
console.log(`  ✅ loadPolicies loaded ${policies.length} versioned policies: PASS`);

// 1. Prime Salaried Applicant for Personal Loan
const primeApplicant = {
  fullName: 'Pooja Kulkarni',
  monthlyIncome: 65000,
  existingObligations: 8000,
  requestedLoanAmount: 500000,
  requestedTenureMonths: 36,
  cibilScore: 760,
  dpdLast12Months: 0,
  ageYears: 28,
  employmentType: 'SALARIED',
  geography: 'MAHARASHTRA'
};

const plMatch = matchLenders(primeApplicant, 'PERSONAL_LOAN', policies);
assert.ok(plMatch.bestMatchCount >= 1, 'Expected at least 1 recommended lender for prime salaried');
assert.strictEqual(plMatch.recommendedLenders[0].matchStatus, 'MATCH_RECOMMENDED');
console.log(`  ✅ matchLenders prime salaried applicant matched: ${plMatch.recommendedLenders[0].lenderName}: PASS`);

// 2. Doctor Professional Loan Match
const doctorApplicant = {
  fullName: 'Dr. Aarav Deshmukh',
  monthlyIncome: 120000,
  existingObligations: 15000,
  requestedLoanAmount: 2500000,
  requestedTenureMonths: 60,
  cibilScore: 780,
  dpdLast12Months: 0,
  ageYears: 35,
  employmentType: 'SELF_EMPLOYED_PROFESSIONAL',
  geography: 'MAHARASHTRA'
};

const docMatch = matchLenders(doctorApplicant, 'DOCTOR_LOAN', policies);
assert.ok(docMatch.bestMatchCount >= 1, 'Expected doctor policy match');
assert.strictEqual(docMatch.topRecommendation.lenderName, 'Bajaj Finserv');
assert.strictEqual(docMatch.topRecommendation.matchStatus, 'MATCH_RECOMMENDED');
console.log('  ✅ matchLenders doctor professional loan matched Bajaj Finserv: PASS');

// 3. Low CIBIL Score Rejection
const lowCibilApplicant = {
  fullName: 'Vikas Jadhav',
  monthlyIncome: 45000,
  existingObligations: 5000,
  requestedLoanAmount: 300000,
  requestedTenureMonths: 36,
  cibilScore: 610,
  dpdLast12Months: 60,
  ageYears: 31,
  employmentType: 'SALARIED',
  geography: 'MAHARASHTRA'
};

const lowCibilMatch = matchLenders(lowCibilApplicant, 'PERSONAL_LOAN', policies);
assert.strictEqual(lowCibilMatch.bestMatchCount, 0, 'Low CIBIL should have 0 recommended matches');
assert.ok(lowCibilMatch.rejectedLenders.length > 0, 'Lenders should reject low CIBIL');
assert.ok(lowCibilMatch.rejectedLenders[0].reasonCodes.includes('REASON_CIBIL_BELOW_THRESHOLD'));
assert.ok(lowCibilMatch.rejectedLenders[0].reasonCodes.includes('REASON_DPD_DELINQUENCY_DETECTED'));
console.log('  ✅ matchLenders low CIBIL & DPD delinquency rejection: PASS');

// 4. Insufficient Income Rejection
const lowIncomeApplicant = {
  fullName: 'Ramesh',
  monthlyIncome: 15000, // Below SBI min (25k) and HDFC min (30k)
  existingObligations: 0,
  requestedLoanAmount: 100000,
  requestedTenureMonths: 24,
  cibilScore: 750,
  dpdLast12Months: 0,
  ageYears: 25,
  employmentType: 'SALARIED',
  geography: 'MAHARASHTRA'
};

const lowIncomeMatch = matchLenders(lowIncomeApplicant, 'PERSONAL_LOAN', policies);
assert.strictEqual(lowIncomeMatch.bestMatchCount, 0);
assert.ok(lowIncomeMatch.rejectedLenders[0].reasonCodes.includes('REASON_INSUFFICIENT_INCOME'));
console.log('  ✅ matchLenders insufficient income rejection with exact reason code: PASS');

console.log('🎉 ALL UNIT TESTS FOR policy-engine PASSED SUCCESSFULLY!\n');
