// tests/unit/test_statement_api.test.cjs
// ─────────────────────────────────────────────────────────────────
// Unit Tests: Statement Normalizer & DPDP Act PII Masking
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const {
  maskPAN,
  maskAadhaar,
  maskAccountNumber,
  maskPhone,
  scrubPII,
  isBounceTransaction,
  isSalaryCredit,
  isEmiDebit,
  normalizeStatement
} = require('../../apps/statement-api/index.cjs');

console.log('🧪 RUNNING UNIT TESTS: apps/statement-api');

// 1. PII Masking
assert.strictEqual(maskPAN('ABCDE1234F'), 'XXXXX1234F');
assert.strictEqual(maskAadhaar('999988887777'), 'XXXXXXXX7777');
assert.strictEqual(maskAccountNumber('100200300400'), 'XXXXXXXX0400');
assert.strictEqual(maskPhone('919876543210'), '9198****10');
console.log('  ✅ Individual PII masking functions (PAN, Aadhaar, Account, Phone): PASS');

// 2. Global Log Scrubber
const sampleLog = 'Applicant PAN is ABCDE1234F, Aadhaar is 999988887777, Phone is 919876543210.';
const scrubbed = scrubPII(sampleLog);
assert.ok(!scrubbed.includes('ABCDE1234F'));
assert.ok(!scrubbed.includes('999988887777'));
assert.ok(!scrubbed.includes('919876543210'));
console.log('  ✅ scrubPII global text regex scrubbing: PASS');

// 3. Narration Classifiers
assert.strictEqual(isBounceTransaction('ECS RETURN INSUFFICIENT FUNDS'), true);
assert.strictEqual(isBounceTransaction('REGULAR GROCERY DEBIT'), false);
assert.strictEqual(isSalaryCredit('COMPANY PAYROLL SALARY CR AUG', 50000), true);
assert.strictEqual(isSalaryCredit('CASH DEPOSIT', 5000), false);
assert.strictEqual(isEmiDebit('HDFC AUTO LOAN EMI DEBIT', 15000), true);
console.log('  ✅ Bounce, Salary, and EMI transaction classification: PASS');

// 4. Statement Normalization
const rawTransactions = [
  { date: '2026-08-01', narration: 'INFOSYS SALARY CR', credit: 75000, debit: 0, balance: 80000 },
  { date: '2026-08-05', narration: 'HDFC HOME LOAN EMI', credit: 0, debit: 22000, balance: 58000 },
  { date: '2026-08-10', narration: 'ECS RETURN CHARGES INSUFFICIENT', credit: 0, debit: 500, balance: 57500 },
  { date: '2026-08-15', narration: 'GROCERY SHOPPING', credit: 0, debit: 4500, balance: 53000 }
];

const normalized = normalizeStatement(rawTransactions, {
  accountNumber: '123456789012',
  bankName: 'HDFC Bank'
});

assert.strictEqual(normalized.totalTransactions, 4);
assert.strictEqual(normalized.totalCredits, 75000);
assert.strictEqual(normalized.totalDebits, 27000);
assert.strictEqual(normalized.bounceCount, 1);
assert.strictEqual(normalized.detectedSalaryCreditsCount, 1);
assert.strictEqual(normalized.accountNumberMasked, 'XXXXXXXX9012');
assert.strictEqual(normalized.hasSevereBounceHistory, false);
console.log('  ✅ normalizeStatement aggregation, balance checks & masking: PASS');

console.log('🎉 ALL UNIT TESTS FOR statement-api PASSED SUCCESSFULLY!\n');
