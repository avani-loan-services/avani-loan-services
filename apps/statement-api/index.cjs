// apps/statement-api/index.cjs
// ─────────────────────────────────────────────────────────────────
// Statement & Document Processing API — Normalizer & PII Scrubbing
// AVANI LOAN SERVICES — Autonomous Credit Underwriting Suite
// Version: 1.0.0 (DPDP Act 2023 & RBI Compliant PII Masking)
// ─────────────────────────────────────────────────────────────────

'use strict';

/**
 * Mask Indian PAN Card number (10 characters: 5 letters, 4 digits, 1 letter).
 * Output format: XXXXX1234X
 */
function maskPAN(pan) {
  if (!pan) return '';
  const clean = String(pan).trim().toUpperCase();
  if (clean.length !== 10) return clean.slice(0, 2) + '******' + clean.slice(-2);
  return 'XXXXX' + clean.slice(5, 9) + clean.slice(9);
}

/**
 * Mask Indian 12-digit Aadhaar number.
 * Output format: XXXXXXXX1234
 */
function maskAadhaar(aadhaar) {
  if (!aadhaar) return '';
  const clean = String(aadhaar).replace(/[^0-9]/g, '');
  if (clean.length < 4) return 'XXXXXXXXXXXX';
  return 'XXXXXXXX' + clean.slice(-4);
}

/**
 * Mask Bank Account Number.
 * Output format: XXXXXXXX1234
 */
function maskAccountNumber(acc) {
  if (!acc) return '';
  const clean = String(acc).replace(/[^0-9A-Za-z]/g, '');
  if (clean.length <= 4) return 'XXXX';
  return 'X'.repeat(Math.max(4, clean.length - 4)) + clean.slice(-4);
}

/**
 * Mask mobile phone number.
 * Output format: 9191****65
 */
function maskPhone(phone) {
  if (!phone) return '';
  const clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.length < 10) return clean;
  return clean.slice(0, 4) + '****' + clean.slice(-2);
}

/**
 * Scrub all sensitive PII from an arbitrary text or log string.
 */
function scrubPII(text) {
  if (typeof text !== 'string') return text;
  let scrubbed = text;
  // Mask 12 digit Aadhaar patterns: \b\d{4}\s?\d{4}\s?\d{4}\b
  scrubbed = scrubbed.replace(/\b\d{4}\s?\d{4}\s?(\d{4})\b/g, 'XXXXXXXX$1');
  // Mask PAN patterns: [A-Z]{5}[0-9]{4}[A-Z]
  scrubbed = scrubbed.replace(/\b[A-Z]{5}(\d{4}[A-Z])\b/gi, 'XXXXX$1');
  // Mask 10-12 digit phone numbers: (\+91|91)?[6-9]\d{9}
  scrubbed = scrubbed.replace(/\b(?:\+?91)?[6-9]\d{2}(\d{4})(\d{2})\b/g, '91XX****$2');
  return scrubbed;
}

/**
 * Detect dishonour, bounce or return transactions in narration text.
 */
const BOUNCE_KEYWORDS = [
  'RETURN', 'BOUNCE', 'DISHONOUR', 'INSUFFICIENT', 
  'ECS RETURN', 'NACH RETURN', 'CHQ RET', 'CHEQUE RETURN'
];

function isBounceTransaction(narration = '') {
  const upper = String(narration).toUpperCase();
  return BOUNCE_KEYWORDS.some(kw => upper.includes(kw));
}

/**
 * Detect salary credits in narration text.
 */
const SALARY_KEYWORDS = ['SALARY', 'SAL CR', 'PAYROLL', 'MONTHLY WAGES', 'NET PAY'];

function isSalaryCredit(narration = '', amount = 0) {
  if (amount <= 0) return false;
  const upper = String(narration).toUpperCase();
  return SALARY_KEYWORDS.some(kw => upper.includes(kw));
}

/**
 * Detect EMI or loan installment debits in narration text.
 */
const EMI_KEYWORDS = ['EMI', 'LOAN', 'ACH DEBIT', 'NACH DEBIT', 'ECS DEBIT', 'BAJAJ FIN', 'HDFC LOAN'];

function isEmiDebit(narration = '', amount = 0) {
  if (amount <= 0) return false;
  const upper = String(narration).toUpperCase();
  return EMI_KEYWORDS.some(kw => upper.includes(kw));
}

/**
 * Normalize and scrub a list of raw bank statement transactions.
 * 
 * @param {Array<Object>} transactions
 * @param {Object} accountMeta
 * @returns {Object} Scrubbed analytics summary and normalized transactions
 */
function normalizeStatement(transactions = [], accountMeta = {}) {
  const normalized = [];
  let totalCredits = 0;
  let totalDebits = 0;
  let bounceCount = 0;
  const salaryCredits = [];
  const emiDebits = [];
  const monthlyBuckets = {};

  transactions.forEach((tx, idx) => {
    const rawDate = tx.date || new Date().toISOString().slice(0, 10);
    const dateStr = String(rawDate).slice(0, 10);
    const monthKey = dateStr.slice(0, 7); // YYYY-MM
    const narration = String(tx.narration || '').trim();
    const credit = Math.max(0, Number(tx.credit) || 0);
    const debit = Math.max(0, Number(tx.debit) || 0);
    const balance = Number(tx.balance) || 0;

    const isBounce = isBounceTransaction(narration);
    if (isBounce) bounceCount++;

    const isSalary = isSalaryCredit(narration, credit);
    if (isSalary) salaryCredits.push({ date: dateStr, amount: credit, narration: scrubPII(narration) });

    const isEmi = isEmiDebit(narration, debit);
    if (isEmi) emiDebits.push({ date: dateStr, amount: debit, narration: scrubPII(narration) });

    totalCredits += credit;
    totalDebits += debit;

    if (!monthlyBuckets[monthKey]) {
      monthlyBuckets[monthKey] = { credits: 0, debits: 0, count: 0, balances: [] };
    }
    monthlyBuckets[monthKey].credits += credit;
    monthlyBuckets[monthKey].debits += debit;
    monthlyBuckets[monthKey].count += 1;
    monthlyBuckets[monthKey].balances.push(balance);

    normalized.push({
      txId: `TX-${idx + 1}`,
      date: dateStr,
      narration: scrubPII(narration),
      credit,
      debit,
      balance,
      isBounce,
      isSalary,
      isEmi
    });
  });

  const monthKeys = Object.keys(monthlyBuckets);
  const monthCount = monthKeys.length || 1;
  const avgMonthlyCredits = Number((totalCredits / monthCount).toFixed(2));
  const avgMonthlyDebits = Number((totalDebits / monthCount).toFixed(2));

  // Inferred verified monthly salary (average of detected salary credits or avg credit)
  const estimatedSalary = salaryCredits.length > 0 
    ? Number((salaryCredits.reduce((acc, s) => acc + s.amount, 0) / salaryCredits.length).toFixed(2))
    : avgMonthlyCredits;

  return {
    accountNumberMasked: maskAccountNumber(accountMeta.accountNumber),
    bankName: accountMeta.bankName || 'Unknown Bank',
    periodMonths: monthCount,
    totalTransactions: normalized.length,
    totalCredits: Number(totalCredits.toFixed(2)),
    totalDebits: Number(totalDebits.toFixed(2)),
    avgMonthlyCredits,
    avgMonthlyDebits,
    estimatedSalaryIncome: estimatedSalary,
    detectedSalaryCreditsCount: salaryCredits.length,
    detectedEmiDebitsCount: emiDebits.length,
    bounceCount,
    hasSevereBounceHistory: bounceCount >= 2,
    monthlyBreakdown: monthlyBuckets,
    transactions: normalized
  };
}

module.exports = {
  maskPAN,
  maskAadhaar,
  maskAccountNumber,
  maskPhone,
  scrubPII,
  isBounceTransaction,
  isSalaryCredit,
  isEmiDebit,
  normalizeStatement
};
