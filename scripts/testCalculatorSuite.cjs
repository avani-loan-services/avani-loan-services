// scripts/testCalculatorSuite.cjs
// ─────────────────────────────────────────────────────────────────
// Automated Mathematical Unit Test Suite for AVANI Financial Calculators
// Validates all 20 calculators, benchmarks, and edge cases
// ─────────────────────────────────────────────────────────────────

const assert = require('assert');

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 RUNNING FINANCIAL CALCULATOR SUITE UNIT TESTS');
  console.log('═══════════════════════════════════════════════════════\n');

  const {
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
    calculateCashDenominations
  } = await import('../src/calculators/utils/calculations.js');

  const {
    formatINR,
    formatNumber,
    numberToIndianWords
  } = await import('../src/calculators/utils/formatters.js');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // ── 1. EMI Calculator Benchmark ─────────────────────────────────
  test('1.1 EMI Benchmark: ₹10,00,000 @ 10% for 5 years', () => {
    const res = calculateEMI({ principal: 1000000, rate: 10, tenure: 5, tenureUnit: 'years' });
    // Standard EMI formula gives 21247.04
    assert.strictEqual(Math.round(res.monthlyEmi), 21247);
    assert.strictEqual(Math.round(res.totalRepayment), 1274823);
    assert.strictEqual(Math.round(res.totalInterest), 274823);
    assert.strictEqual(res.totalMonths, 60);
  });

  test('1.1.2 EMI Amortization Schedule', () => {
    const sched = generateAmortizationSchedule({ principal: 100000, rate: 12, tenure: 1, tenureUnit: 'years' });
    assert.strictEqual(sched.monthly.length, 12);
    assert.strictEqual(sched.yearly.length, 1);
    assert.strictEqual(Math.round(sched.monthly[11].closingBalance), 0);
  });

  // ── 2. FOIR Eligibility ──────────────────────────────────────────
  test('1.2 FOIR Eligibility: Net ₹1,00,000, EMI ₹20,000, FOIR 50%', () => {
    const res = calculateFOIREligibility({
      monthlyIncome: 100000,
      existingEmi: 20000,
      foirPercent: 50,
      rate: 10,
      tenureYears: 15
    });
    assert.strictEqual(res.maxPermissibleEmi, 50000);
    assert.strictEqual(res.availableEmi, 30000);
    assert.ok(res.eligibleLoanAmount > 2700000 && res.eligibleLoanAmount < 2900000);
  });

  // ── 3. Multiplier Eligibility ────────────────────────────────────
  test('1.3 Multiplier Eligibility: Income ₹50,000, Multiplier 60x', () => {
    const res = calculateMultiplierEligibility({
      income: 50000,
      multiplier: 60,
      existingEmi: 0,
      rate: 10,
      tenureYears: 15
    });
    assert.strictEqual(res.grossEligibleAmount, 3000000);
    assert.strictEqual(res.netEligibleAmount, 3000000);
  });

  // ── 4. Outstanding Loan ──────────────────────────────────────────
  test('1.4 Outstanding Loan: ₹10,00,000, 10%, 5 years after 24 EMIs', () => {
    const res = calculateOutstandingLoan({
      originalAmount: 1000000,
      rate: 10,
      originalTenureYears: 5,
      emisPaid: 24
    });
    assert.ok(res.outstandingPrincipal > 650000 && res.outstandingPrincipal < 700000);
    assert.strictEqual(res.remainingTenureMonths, 36);
  });

  // ── 5. Foreclosure Calculator ───────────────────────────────────
  test('1.5 Foreclosure: ₹5,00,000 @ 2% fee + 18% GST', () => {
    const res = calculateForeclosure({
      outstandingPrincipal: 500000,
      foreclosureChargePercent: 2,
      gstPercent: 18,
      otherCharges: 500
    });
    assert.strictEqual(res.foreclosureFee, 10000);
    assert.strictEqual(res.gstAmount, 1800);
    assert.strictEqual(res.totalSettlementAmount, 512300);
  });

  // ── 6. Overdraft Calculator ─────────────────────────────────────
  test('1.6 Overdraft: Limit ₹10L, Utilized ₹4L @ 12% for 30 days', () => {
    const res = calculateOverdraft({
      sanctionedLimit: 1000000,
      amountUtilized: 400000,
      rate: 12,
      daysUtilized: 30,
      otherCharges: 0
    });
    assert.strictEqual(res.availableLimit, 600000);
    assert.strictEqual(Math.round(res.estimatedInterest), Math.round((400000 * 0.12 * 30) / 365));
  });

  // ── 7. Loan Comparison ──────────────────────────────────────────
  test('1.7 Loan Comparison: Loan A vs Loan B', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 1000000, rate: 9.5, tenureYears: 5, processingFeePercent: 1, processingFeeFlat: 0, otherCharges: 0 },
      loanB: { amount: 1000000, rate: 10.5, tenureYears: 5, processingFeePercent: 0.5, processingFeeFlat: 0, otherCharges: 0 }
    });
    assert.strictEqual(res.betterLoan, 'Loan A');
    assert.ok(res.totalCostDifference > 0);
  });

  // ── 8. Prepayment Calculator ────────────────────────────────────
  test('1.8 Prepayment: ₹10L @ 10%, 48m left, ₹2L lump sum', () => {
    const resTenure = calculatePrepayment({
      outstandingPrincipal: 1000000,
      rate: 10,
      remainingTenureMonths: 48,
      prepaymentAmount: 200000,
      option: 'reduce_tenure'
    });
    assert.ok(resTenure.interestSaved > 0);
    assert.ok(resTenure.tenureSavedMonths > 0);

    const resEmi = calculatePrepayment({
      outstandingPrincipal: 1000000,
      rate: 10,
      remainingTenureMonths: 48,
      prepaymentAmount: 200000,
      option: 'reduce_emi'
    });
    assert.ok(resEmi.monthlyEmiSaved > 0);
  });

  // ── 9. Rate Change Calculator ───────────────────────────────────
  test('1.9 Rate Change: ₹10L from 10% to 11% for 48m', () => {
    const res = calculateRateChange({
      outstandingPrincipal: 1000000,
      currentRate: 10,
      newRate: 11,
      remainingTenureMonths: 48
    });
    assert.ok(res.emiDifference > 0);
    assert.ok(res.interestDifference > 0);
  });

  // ── 10. GST on Interest ─────────────────────────────────────────
  test('1.10 GST on Interest: ₹10,000 @ 18%', () => {
    const res = calculateGSTOnInterest({ baseAmount: 10000, gstRate: 18 });
    assert.strictEqual(res.gstAmount, 1800);
    assert.strictEqual(res.totalAmount, 11800);
    assert.strictEqual(res.cgstAmount, 900);
    assert.strictEqual(res.sgstAmount, 900);
  });

  // ── 11. FD Calculator ───────────────────────────────────────────
  test('2.1 FD: ₹1,00,000 @ 7% for 12 months quarterly', () => {
    const res = calculateFD({ principal: 100000, rate: 7, tenureMonths: 12, compoundingFrequency: 'quarterly' });
    assert.strictEqual(Math.round(res.maturityAmount), 107186);
    assert.strictEqual(Math.round(res.interestEarned), 7186);
  });

  // ── 12. RD Calculator ───────────────────────────────────────────
  test('2.2 RD: ₹5,000/mo @ 7% for 12 months', () => {
    const res = calculateRD({ monthlyDeposit: 5000, rate: 7, tenureMonths: 12 });
    assert.strictEqual(res.totalDeposit, 60000);
    assert.ok(res.interestEarned > 2200 && res.interestEarned < 2400);
  });

  // ── 13. SIP Calculator ──────────────────────────────────────────
  test('2.3 SIP: ₹10,000/month @ 12% for 5 years', () => {
    const res = calculateSIP({ monthlyInvestment: 10000, rate: 12, tenureYears: 5 });
    assert.strictEqual(res.totalInvestment, 600000);
    assert.strictEqual(Math.round(res.maturityValue), 824864);
    assert.strictEqual(Math.round(res.estimatedReturns), 224864);
  });

  // ── 14. Interest Calculator (Simple & Compound) ─────────────────
  test('2.4 Simple Interest: ₹1,00,000 @ 10% for 2 years', () => {
    const res = calculateInterest({ principal: 100000, rate: 10, timeYears: 2, isCompound: false });
    assert.strictEqual(res.interest, 20000);
    assert.strictEqual(res.finalAmount, 120000);
  });

  test('2.4 Compound Interest: ₹1,00,000 @ 10% for 2 years (Annual)', () => {
    const res = calculateInterest({ principal: 100000, rate: 10, timeYears: 2, isCompound: true, compoundingFrequency: 'yearly' });
    assert.strictEqual(res.interest, 21000);
    assert.strictEqual(res.finalAmount, 121000);
  });

  // ── 15. PPF Calculator ──────────────────────────────────────────
  test('2.5 PPF: ₹1,50,000/year @ 7.1% for 15 years', () => {
    const res = calculatePPF({ initialAmount: 0, annualContribution: 150000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.totalContribution, 2250000);
    assert.ok(res.maturityAmount > 4000000);
    assert.strictEqual(res.yearlySchedule.length, 15);
  });

  // ── 16. GST Calculator ──────────────────────────────────────────
  test('3.1 GST: ₹1,000 @ 18% Add & Remove', () => {
    const resAdd = calculateGST({ amount: 1000, gstRate: 18, mode: 'add' });
    assert.strictEqual(resAdd.gstAmount, 180);
    assert.strictEqual(resAdd.finalAmount, 1180);

    const resRemove = calculateGST({ amount: 1180, gstRate: 18, mode: 'remove' });
    assert.strictEqual(Math.round(resRemove.baseAmount), 1000);
    assert.strictEqual(Math.round(resRemove.gstAmount), 180);
  });

  // ── 17. Profit Calculator ───────────────────────────────────────
  test('3.2 Profit: CP ₹800, SP ₹1,000', () => {
    const res = calculateProfitLoss({ costPrice: 800, sellingPrice: 1000 });
    assert.strictEqual(res.isProfit, true);
    assert.strictEqual(res.amount, 200);
    assert.strictEqual(res.profitLossPercent, 25);
    assert.strictEqual(res.marginPercent, 20);
  });

  // ── 18. Discount Calculator ─────────────────────────────────────
  test('3.3 Discount: ₹1,000 @ 10%', () => {
    const res = calculateDiscount({ originalPrice: 1000, discountPercent: 10, mode: 'percent' });
    assert.strictEqual(res.discountAmount, 100);
    assert.strictEqual(res.finalPrice, 900);
  });

  // ── 19. Cash Note Counter ───────────────────────────────────────
  test('3.4 Cash Note Counter: 500 x 10 = ₹5,000', () => {
    const res = calculateCashDenominations({ quantities: { 500: 10, 200: 5, 100: 20 } });
    assert.strictEqual(res.totalNotes, 35);
    assert.strictEqual(res.grandTotal, 8000);
  });

  // ── 20. Indian Number to Words ──────────────────────────────────
  test('3.5 Number to Words: Standard Test Cases', () => {
    assert.strictEqual(numberToIndianWords(1250), 'One Thousand Two Hundred Fifty Rupees Only');
    assert.strictEqual(numberToIndianWords(125000), 'One Lakh Twenty Five Thousand Rupees Only');
    assert.strictEqual(numberToIndianWords(1250000), 'Twelve Lakh Fifty Thousand Rupees Only');
    assert.strictEqual(numberToIndianWords(10000000), 'One Crore Rupees Only');
    assert.strictEqual(numberToIndianWords(1250.50), 'One Thousand Two Hundred Fifty Rupees and Fifty Paise Only');
    assert.strictEqual(numberToIndianWords(0), 'Zero Rupees Only');
  });

  // ── Edge Cases ──────────────────────────────────────────────────
  test('Edge Cases: Zero & Negatives', () => {
    const zeroEmi = calculateEMI({ principal: 0, rate: 0, tenure: 0 });
    assert.strictEqual(zeroEmi.monthlyEmi, 0);

    const zeroRateEmi = calculateEMI({ principal: 120000, rate: 0, tenure: 1, tenureUnit: 'years' });
    assert.strictEqual(zeroRateEmi.monthlyEmi, 10000);
    assert.strictEqual(zeroRateEmi.totalInterest, 0);

    const negEmi = calculateEMI({ principal: -5000, rate: -5, tenure: -1 });
    assert.strictEqual(negEmi.monthlyEmi, 0);
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
