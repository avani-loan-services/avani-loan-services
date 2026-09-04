// scripts/test-calculators.js
// ─────────────────────────────────────────────────────────────────
// Comprehensive Automated Unit Test Suite for All 20 Financial Calculators
// Tests exact formulas, precision, edge cases, and Indian currency words
// ─────────────────────────────────────────────────────────────────

import {
  calculateEMI,
  generateAmortizationSchedule,
  calculateFOIREligibility,
  calculateMultiplierEligibility,
  calculateOutstandingLoan,
  calculateForeclosure,
  calculateOverdraft,
  calculateLoanComparison,
  calculatePrepayment,
  calculateRateChange,
  calculateGSTOnInterest,
  calculateFD,
  calculateRD,
  calculateSIP,
  calculateInterest,
  calculatePPF,
  calculateGST,
  calculateProfitLoss,
  calculateDiscount,
  calculateCashDenominations,
} from '../src/calculators/utils/calculations.js';

import {
  formatINR,
  formatNumber,
  formatPercent,
  numberToIndianWords,
} from '../src/calculators/utils/formatters.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function assertClose(actual, expected, tolerance = 1.0, message = '') {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passed++;
    console.log(`  ✅ PASS: ${message} (Actual: ${actual}, Expected: ${expected})`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message} (Actual: ${actual}, Expected: ${expected}, Diff: ${diff})`);
  }
}

console.log('====================================================');
console.log('🧪 RUNNING FINANCIAL CALCULATOR SUITE TEST MATRIX');
console.log('====================================================\n');

// ── 1. LOAN CALCULATORS ──────────────────────────────────────────

console.log('--- 1.1 EMI Calculator ---');
// ₹10,00,000 @ 10% for 5 years => EMI = ₹21,247.04 (approx ₹21,247)
const emiResult = calculateEMI({ principal: 1000000, rate: 10, tenure: 5, tenureUnit: 'years' });
assertClose(emiResult.monthlyEmi, 21247.04, 2.0, 'EMI for 10L @ 10% 5Y');
assertClose(emiResult.totalRepayment, 1274823, 10.0, 'Total Repayment for 10L @ 10% 5Y');
assertClose(emiResult.totalInterest, 274823, 10.0, 'Total Interest for 10L @ 10% 5Y');

// Edge case: 0% interest
const emiZeroRate = calculateEMI({ principal: 120000, rate: 0, tenure: 1, tenureUnit: 'years' });
assertClose(emiZeroRate.monthlyEmi, 10000, 0.01, '0% rate EMI');

// Amortization schedule
const sched = generateAmortizationSchedule({ principal: 100000, rate: 10, tenure: 1, tenureUnit: 'years' });
assert(sched.monthly.length === 12, 'Amortization schedule has 12 months for 1 year tenure');
assert(sched.yearly.length === 1, 'Amortization schedule has 1 year summary');
assertClose(sched.monthly[11].closingBalance, 0, 1.0, 'Final closing balance is approx 0');

console.log('\n--- 1.2 FOIR Eligibility Calculator ---');
// Net income 50,000, FOIR 50% = Max EMI 25,000, Existing EMI 5,000 => Available EMI 20,000
const foirRes = calculateFOIREligibility({
  monthlyIncome: 50000,
  existingEmi: 5000,
  foirPercent: 50,
  rate: 10,
  tenureYears: 15,
});
assertClose(foirRes.maxPermissibleEmi, 25000, 0.01, 'Max Permissible EMI');
assertClose(foirRes.availableEmi, 20000, 0.01, 'Available EMI');
assert(foirRes.eligibleLoanAmount > 1800000 && foirRes.eligibleLoanAmount < 1900000, 'Eligible Loan Amount in expected range (~18.6L)');

console.log('\n--- 1.3 Multiplier Eligibility Calculator ---');
// Income 60,000, Multiplier 60 => Gross 36,00,000
const multRes = calculateMultiplierEligibility({
  income: 60000,
  incomeType: 'monthly',
  multiplier: 60,
  existingEmi: 0,
  rate: 10,
  tenureYears: 15,
});
assert(multRes.grossEligibleAmount === 3600000, 'Gross eligible is 60k x 60 = 36L');
assert(multRes.netEligibleAmount === 3600000, 'Net eligible equals gross when no existing EMI');

console.log('\n--- 1.4 Outstanding Loan Calculator ---');
const outRes = calculateOutstandingLoan({
  originalAmount: 1000000,
  rate: 10,
  originalTenureYears: 5,
  emisPaid: 12,
});
assert(outRes.outstandingPrincipal < 1000000 && outRes.outstandingPrincipal > 800000, 'Outstanding Principal after 1 yr is reduced');
assert(outRes.remainingTenureMonths === 48, 'Remaining tenure is 48 months');

console.log('\n--- 1.5 Foreclosure Calculator ---');
// Principal 5,00,000, Charge 2% = 10,000, GST 18% = 1,800, Other 500 => Total 5,12,300
const foreRes = calculateForeclosure({
  outstandingPrincipal: 500000,
  foreclosureChargePercent: 2,
  gstPercent: 18,
  otherCharges: 500,
});
assertClose(foreRes.foreclosureFee, 10000, 0.01, 'Foreclosure Fee');
assertClose(foreRes.gstAmount, 1800, 0.01, 'GST on Fee');
assertClose(foreRes.totalSettlementAmount, 512300, 0.01, 'Total Settlement Amount');

console.log('\n--- 1.6 Overdraft Calculator ---');
// Sanctioned 10L, Utilized 2L, Rate 12%, Days 30 => Interest = 200000 * 0.12 * 30 / 365 = 1972.60
const odRes = calculateOverdraft({
  sanctionedLimit: 1000000,
  amountUtilized: 200000,
  rate: 12,
  daysUtilized: 30,
  otherCharges: 100,
});
assertClose(odRes.availableLimit, 800000, 0.01, 'Available OD Limit');
assertClose(odRes.estimatedInterest, 1972.60, 1.0, 'Estimated OD Interest');
assertClose(odRes.totalEstimatedCost, 2072.60, 1.0, 'Total OD Cost');

console.log('\n--- 1.7 Loan Comparison Calculator ---');
const compRes = calculateLoanComparison({
  loanA: { amount: 1000000, rate: 9.5, tenureYears: 5, processingFeePercent: 1, processingFeeFlat: 0, otherCharges: 0 },
  loanB: { amount: 1000000, rate: 10.5, tenureYears: 5, processingFeePercent: 0.5, processingFeeFlat: 0, otherCharges: 0 },
});
assert(compRes.betterLoan === 'Loan A', 'Loan A is identified as better due to lower total interest/cost');
assert(compRes.totalCostDifference > 0, 'Cost difference is positive');

console.log('\n--- 1.8 Prepayment Calculator ---');
const prepayTenure = calculatePrepayment({
  outstandingPrincipal: 1000000,
  rate: 10,
  remainingTenureMonths: 60,
  prepaymentAmount: 200000,
  option: 'reduce_tenure',
});
assert(prepayTenure.tenureSavedMonths > 0, 'Tenure saved is positive when reducing tenure');
assert(prepayTenure.interestSaved > 0, 'Interest saved is positive');

const prepayEmi = calculatePrepayment({
  outstandingPrincipal: 1000000,
  rate: 10,
  remainingTenureMonths: 60,
  prepaymentAmount: 200000,
  option: 'reduce_emi',
});
assert(prepayEmi.monthlyEmiSaved > 0, 'Monthly EMI is reduced in reduce_emi mode');

console.log('\n--- 1.9 Rate Change Calculator ---');
const rateChange = calculateRateChange({
  outstandingPrincipal: 1000000,
  currentRate: 10,
  newRate: 11,
  remainingTenureMonths: 60,
});
assert(rateChange.emiDifference > 0, 'EMI increases when rate increases');
assert(rateChange.interestDifference > 0, 'Total interest increases when rate increases');

console.log('\n--- 1.10 GST on Interest / Charges Calculator ---');
const gstInt = calculateGSTOnInterest({ baseAmount: 1000, gstRate: 18 });
assertClose(gstInt.gstAmount, 180, 0.01, 'GST Amount is ₹180 on ₹1000 @ 18%');
assertClose(gstInt.cgstAmount, 90, 0.01, 'CGST is ₹90');
assertClose(gstInt.sgstAmount, 90, 0.01, 'SGST is ₹90');
assertClose(gstInt.totalAmount, 1180, 0.01, 'Total Amount is ₹1180');

// ── 2. INVESTMENT CALCULATORS ────────────────────────────────────

console.log('\n--- 2.1 FD Calculator ---');
// ₹1,00,000 @ 8% for 12 months (1 yr) compounded quarterly
// A = 100000 * (1 + 0.08/4)^4 = 100000 * (1.02)^4 = 108243.22
const fdRes = calculateFD({
  principal: 100000,
  rate: 8,
  tenureMonths: 12,
  compoundingFrequency: 'quarterly',
});
assertClose(fdRes.maturityAmount, 108243.22, 1.0, 'FD Maturity with quarterly compounding');
assertClose(fdRes.interestEarned, 8243.22, 1.0, 'FD Interest Earned');

console.log('\n--- 2.2 RD Calculator ---');
// Monthly deposit 5000, 8%, 12 months
const rdRes = calculateRD({
  monthlyDeposit: 5000,
  rate: 8,
  tenureMonths: 12,
});
assert(rdRes.totalDeposit === 60000, 'Total RD deposit is ₹60,000');
assert(rdRes.maturityAmount > 62000, 'RD maturity is greater than total deposit with interest');

console.log('\n--- 2.3 SIP Calculator ---');
// ₹10,000 / month, 12% p.a., 5 years
// Total Investment = 10000 * 60 = 6,00,000
// Expected Value approx ₹8,24,864
const sipRes = calculateSIP({
  monthlyInvestment: 10000,
  rate: 12,
  tenureYears: 5,
});
assert(sipRes.totalInvestment === 600000, 'SIP Total Investment is 6L');
assertClose(sipRes.maturityValue, 824864, 50.0, 'SIP Maturity Value (~8.24L)');
assertClose(sipRes.estimatedReturns, 224864, 50.0, 'SIP Estimated Returns (~2.24L)');

console.log('\n--- 2.4 Interest Calculator (SI & CI) ---');
// Simple Interest: 1,00,000 @ 10% for 2 years => SI = 20,000, Final = 1,20,000
const siRes = calculateInterest({ principal: 100000, rate: 10, timeYears: 2, isCompound: false });
assertClose(siRes.interest, 20000, 0.01, 'Simple Interest is ₹20,000');
assertClose(siRes.finalAmount, 120000, 0.01, 'SI Final Amount is ₹1,20,000');

// Compound Interest: 1,00,000 @ 10% for 2 years compounded yearly => CI = 21,000, Final = 1,21,000
const ciRes = calculateInterest({ principal: 100000, rate: 10, timeYears: 2, isCompound: true, compoundingFrequency: 'yearly' });
assertClose(ciRes.interest, 21000, 0.01, 'Compound Interest is ₹21,000');
assertClose(ciRes.finalAmount, 121000, 0.01, 'CI Final Amount is ₹1,21,000');

console.log('\n--- 2.5 PPF Calculator ---');
// 1,50,000 annual contribution, 7.1% rate, 15 years
const ppfRes = calculatePPF({
  initialAmount: 0,
  annualContribution: 150000,
  rate: 7.1,
  tenureYears: 15,
});
assert(ppfRes.totalContribution === 2250000, 'PPF total contribution for 15 yrs is 22.5L');
assert(ppfRes.maturityAmount > 4000000, 'PPF maturity amount exceeds 40L (~40.68L)');
assert(ppfRes.yearlySchedule.length === 15, 'PPF generates 15-year table');

// ── 3. OTHER FINANCIAL TOOLS ────────────────────────────────────

console.log('\n--- 3.1 GST Calculator ---');
// Add GST: 1000 @ 18% => Base 1000, GST 180, Final 1180
const gstAdd = calculateGST({ amount: 1000, gstRate: 18, mode: 'add' });
assertClose(gstAdd.baseAmount, 1000, 0.01, 'GST Add Base');
assertClose(gstAdd.gstAmount, 180, 0.01, 'GST Add GST Amount');
assertClose(gstAdd.finalAmount, 1180, 0.01, 'GST Add Final Amount');

// Remove GST: 1180 @ 18% => Base 1000, GST 180, Final 1180
const gstRem = calculateGST({ amount: 1180, gstRate: 18, mode: 'remove' });
assertClose(gstRem.baseAmount, 1000, 0.01, 'GST Remove Base');
assertClose(gstRem.gstAmount, 180, 0.01, 'GST Remove GST Amount');
assertClose(gstRem.finalAmount, 1180, 0.01, 'GST Remove Final Amount');

console.log('\n--- 3.2 Profit & Margin Calculator ---');
// CP 800, SP 1000 => Profit 200, Profit% 25%, Margin% 20%
const profRes = calculateProfitLoss({ costPrice: 800, sellingPrice: 1000 });
assert(profRes.isProfit === true, 'Is Profit');
assertClose(profRes.amount, 200, 0.01, 'Profit Amount');
assertClose(profRes.profitLossPercent, 25, 0.01, 'Profit % on CP is 25%');
assertClose(profRes.marginPercent, 20, 0.01, 'Margin % on SP is 20%');

console.log('\n--- 3.3 Discount Calculator ---');
// 1000 @ 10% discount => Saved 100, Final 900
const discRes = calculateDiscount({ originalPrice: 1000, discountPercent: 10, mode: 'percent' });
assertClose(discRes.amountSaved, 100, 0.01, 'Discount Amount Saved');
assertClose(discRes.finalPrice, 900, 0.01, 'Final Price after Discount');

console.log('\n--- 3.4 Cash Note Counter ---');
const cashRes = calculateCashDenominations({
  quantities: {
    2000: 2,  // 4000
    500: 10,  // 5000
    200: 5,   // 1000
    100: 10,  // 1000
    50: 4,    // 200
  }
});
assert(cashRes.totalNotes === 31, 'Total notes count is 31');
assert(cashRes.grandTotal === 11200, 'Grand total cash amount is ₹11,200');

console.log('\n--- 3.5 Amount to Indian Words ---');
assert(numberToIndianWords(1250) === 'One Thousand Two Hundred Fifty Rupees Only', '1,250 to words');
assert(numberToIndianWords(125000) === 'One Lakh Twenty Five Thousand Rupees Only', '1,25,000 to words');
assert(numberToIndianWords(1250000) === 'Twelve Lakh Fifty Thousand Rupees Only', '12,50,000 to words');
assert(numberToIndianWords(10000000) === 'One Crore Rupees Only', '1,00,00,000 to words');
assert(numberToIndianWords(1250.50) === 'One Thousand Two Hundred Fifty Rupees and Fifty Paise Only', '1,250.50 to words');
assert(numberToIndianWords(0) === 'Zero Rupees Only', '0 to words');

console.log('\n====================================================');
console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
