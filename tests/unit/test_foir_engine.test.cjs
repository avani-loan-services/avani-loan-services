// tests/unit/test_foir_engine.test.cjs
// ─────────────────────────────────────────────────────────────────
// Unit Tests: Deterministic FOIR & DTI Engine
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const { calculateEMI, deriveMaxLoanFromEMI, calculateFOIR, calculateDTI } = require('../../apps/foir-engine/index.cjs');

console.log('🧪 RUNNING UNIT TESTS: apps/foir-engine');

// 1. EMI Calculation
const emi1 = calculateEMI({ principal: 1000000, annualRate: 10.5, tenureMonths: 60 });
assert.strictEqual(emi1, 21493.90, `Expected EMI 21493.90, got ${emi1}`);
console.log('  ✅ calculateEMI standard reducing balance: PASS');

const emiZero = calculateEMI({ principal: 0, annualRate: 10, tenureMonths: 60 });
assert.strictEqual(emiZero, 0);
console.log('  ✅ calculateEMI with zero principal: PASS');

// 2. Derive Max Loan
const maxLoan = deriveMaxLoanFromEMI({ availableEmi: 21493.90, annualRate: 10.5, tenureMonths: 60 });
assert.ok(Math.abs(maxLoan - 1000000) < 5, `Expected ~1000000, got ${maxLoan}`);
console.log('  ✅ deriveMaxLoanFromEMI inverse PV calculation: PASS');

// 3. Normal FOIR Calculation
const foir1 = calculateFOIR({
  verifiedMonthlyIncome: 100000,
  existingMonthlyObligations: 10000,
  proposedLoanAmount: 1000000,
  proposedAnnualRate: 10.5,
  proposedTenureMonths: 60,
  maxPermissibleFoirPercent: 50
});
assert.strictEqual(foir1.status, 'ELIGIBLE');
assert.strictEqual(foir1.isWithinPolicy, true);
assert.strictEqual(foir1.riskBand, 'PRIME');
assert.ok(foir1.foirPercent <= 40);
console.log('  ✅ calculateFOIR normal eligible case: PASS');

// 4. Stretched FOIR Calculation
const foirStretched = calculateFOIR({
  verifiedMonthlyIncome: 50000,
  existingMonthlyObligations: 20000,
  proposedLoanAmount: 500000,
  proposedAnnualRate: 12,
  proposedTenureMonths: 36,
  maxPermissibleFoirPercent: 50
});
assert.strictEqual(foirStretched.isWithinPolicy, false);
assert.strictEqual(foirStretched.status, 'FOIR_EXCEEDED');
console.log('  ✅ calculateFOIR boundary breach case: PASS');

// 5. Zero or Invalid Income Boundary
const foirInvalid = calculateFOIR({ verifiedMonthlyIncome: 0 });
assert.strictEqual(foirInvalid.status, 'REJECT_INVALID_INCOME');
assert.strictEqual(foirInvalid.foirPercent, null);
assert.strictEqual(foirInvalid.isWithinPolicy, false);
console.log('  ✅ calculateFOIR zero/invalid income rejection: PASS');

// 6. Negative Obligations Clamping
const foirNegative = calculateFOIR({
  verifiedMonthlyIncome: 60000,
  existingMonthlyObligations: -5000,
  proposedLoanAmount: 200000,
  proposedTenureMonths: 24
});
assert.strictEqual(foirNegative.existingMonthlyObligations, 0);
console.log('  ✅ calculateFOIR negative obligations clamping: PASS');

// 7. DTI Calculation
const dtiMonthly = calculateDTI({ income: 80000, totalDebt: 32000, maxDtiPercent: 45 });
assert.strictEqual(dtiMonthly.status, 'ACCEPTABLE');
assert.strictEqual(dtiMonthly.dtiPercent, 40);

const dtiExceeded = calculateDTI({ income: 50000, totalDebt: 30000, maxDtiPercent: 45 });
assert.strictEqual(dtiExceeded.status, 'DTI_EXCEEDED');
assert.strictEqual(dtiExceeded.dtiPercent, 60);
console.log('  ✅ calculateDTI monthly and exceeded cases: PASS');

console.log('🎉 ALL UNIT TESTS FOR foir-engine PASSED SUCCESSFULLY!\n');
