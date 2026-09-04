// scripts/testMasterFinancialTools.cjs
// ─────────────────────────────────────────────────────────────────
// Master Automated Test Suite for AVANI Financial Tools Platform
// Comprehensive test matrix: >= 5 normal, >= 3 edge, >= 2 invalid cases per tool
// ─────────────────────────────────────────────────────────────────

const assert = require('assert');

async function runMasterTestSuite() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  AVANI LOAN SERVICES — FINANCIAL TOOLS MASTER VALIDATION SUITE   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

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
    formatPercent,
    numberToIndianWords,
    parseNumber
  } = await import('../src/calculators/utils/formatters.js');

  const {
    validateNumber,
    validateLoanAmount,
    validateInterestRate,
    validateTenure,
    validateFOIR
  } = await import('../src/calculators/utils/validation.js');

  let passed = 0;
  let failed = 0;

  function runCase(name, fn) {
    try {
      fn();
      passed++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Details: ${err.message}`);
    }
  }

  // =================================================================
  // 1. EMI CALCULATOR TEST MATRIX
  // =================================================================
  console.log('\n[1.1 EMI CALCULATOR]');
  // Normal Cases (5)
  runCase('EMI Normal 1: ₹10L @ 10% for 5 yrs (Annual)', () => {
    const res = calculateEMI({ principal: 1000000, rate: 10, tenure: 5, tenureUnit: 'years' });
    assert.strictEqual(Math.round(res.monthlyEmi), 21247);
    assert.strictEqual(Math.round(res.totalRepayment), 1274823);
    assert.strictEqual(res.totalMonths, 60);
  });
  runCase('EMI Normal 2: ₹25L @ 8.5% for 20 yrs (Home Loan)', () => {
    const res = calculateEMI({ principal: 2500000, rate: 8.5, tenure: 20, tenureUnit: 'years' });
    assert.strictEqual(Math.round(res.monthlyEmi), 21696);
    assert.strictEqual(res.totalMonths, 240);
  });
  runCase('EMI Normal 3: ₹5L @ 12% for 36 months', () => {
    const res = calculateEMI({ principal: 500000, rate: 12, tenure: 36, tenureUnit: 'months' });
    assert.strictEqual(Math.round(res.monthlyEmi), 16607);
    assert.strictEqual(res.totalMonths, 36);
  });
  runCase('EMI Normal 4: ₹1L @ 14% for 1 yr', () => {
    const res = calculateEMI({ principal: 100000, rate: 14, tenure: 1, tenureUnit: 'years' });
    assert.strictEqual(Math.round(res.monthlyEmi), 8979);
  });
  runCase('EMI Normal 5: ₹50L @ 9% for 15 yrs', () => {
    const res = calculateEMI({ principal: 5000000, rate: 9, tenure: 15, tenureUnit: 'years' });
    assert.strictEqual(Math.round(res.monthlyEmi), 50713);
  });
  // Edge Cases (3)
  runCase('EMI Edge 1: Zero interest rate (0%)', () => {
    const res = calculateEMI({ principal: 120000, rate: 0, tenure: 1, tenureUnit: 'years' });
    assert.strictEqual(res.monthlyEmi, 10000);
    assert.strictEqual(res.totalInterest, 0);
  });
  runCase('EMI Edge 2: High loan amount ₹10 Crores @ 8% for 30 yrs', () => {
    const res = calculateEMI({ principal: 100000000, rate: 8, tenure: 30, tenureUnit: 'years' });
    assert.strictEqual(Math.round(res.monthlyEmi), 733765);
  });
  runCase('EMI Edge 3: 1 Month tenure', () => {
    const res = calculateEMI({ principal: 10000, rate: 12, tenure: 1, tenureUnit: 'months' });
    assert.strictEqual(Math.round(res.monthlyEmi), 10100);
  });
  // Invalid Cases (2)
  runCase('EMI Invalid 1: Negative principal & rate', () => {
    const res = calculateEMI({ principal: -50000, rate: -5, tenure: -2 });
    assert.strictEqual(res.monthlyEmi, 0);
  });
  runCase('EMI Invalid 2: Zero tenure', () => {
    const res = calculateEMI({ principal: 100000, rate: 10, tenure: 0 });
    assert.strictEqual(res.monthlyEmi, 0);
  });

  // =================================================================
  // 2. FOIR ELIGIBILITY CALCULATOR
  // =================================================================
  console.log('\n[1.2 FOIR ELIGIBILITY CALCULATOR]');
  runCase('FOIR Normal 1: ₹1,00,000 income, ₹20,000 EMI, 50% FOIR', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 100000, existingEmi: 20000, foirPercent: 50, rate: 10, tenureYears: 15 });
    assert.strictEqual(res.maxPermissibleEmi, 50000);
    assert.strictEqual(res.availableEmi, 30000);
    assert.ok(res.eligibleLoanAmount > 2700000 && res.eligibleLoanAmount < 2900000);
  });
  runCase('FOIR Normal 2: ₹50,000 income, 0 EMI, 40% FOIR', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 50000, existingEmi: 0, foirPercent: 40, rate: 9.5, tenureYears: 10 });
    assert.strictEqual(res.maxPermissibleEmi, 20000);
    assert.strictEqual(res.availableEmi, 20000);
  });
  runCase('FOIR Normal 3: ₹2,00,000 income, ₹50,000 EMI, 60% FOIR', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 200000, existingEmi: 50000, foirPercent: 60, rate: 8.5, tenureYears: 20 });
    assert.strictEqual(res.maxPermissibleEmi, 120000);
    assert.strictEqual(res.availableEmi, 70000);
  });
  runCase('FOIR Normal 4: ₹75,000 income, ₹15,000 EMI, 50% FOIR @ 10.5%', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 75000, existingEmi: 15000, foirPercent: 50, rate: 10.5, tenureYears: 5 });
    assert.strictEqual(res.availableEmi, 22500);
  });
  runCase('FOIR Normal 5: ₹30,000 income, ₹5,000 EMI, 50% FOIR', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 30000, existingEmi: 5000, foirPercent: 50, rate: 12, tenureYears: 5 });
    assert.strictEqual(res.availableEmi, 10000);
  });
  runCase('FOIR Edge 1: Existing EMI exceeds Max FOIR', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 50000, existingEmi: 30000, foirPercent: 50, rate: 10, tenureYears: 10 });
    assert.strictEqual(res.availableEmi, 0);
    assert.strictEqual(res.eligibleLoanAmount, 0);
  });
  runCase('FOIR Edge 2: 100% FOIR allowance', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 100000, existingEmi: 0, foirPercent: 100, rate: 10, tenureYears: 5 });
    assert.strictEqual(res.availableEmi, 100000);
  });
  runCase('FOIR Edge 3: 0% Interest FOIR', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 100000, existingEmi: 0, foirPercent: 50, rate: 0, tenureYears: 10 });
    assert.strictEqual(res.eligibleLoanAmount, 50000 * 120);
  });
  runCase('FOIR Invalid 1: Negative income', () => {
    const res = calculateFOIREligibility({ monthlyIncome: -10000 });
    assert.strictEqual(res.eligibleLoanAmount, 0);
  });
  runCase('FOIR Invalid 2: Zero tenure', () => {
    const res = calculateFOIREligibility({ monthlyIncome: 50000, tenureYears: 0 });
    assert.strictEqual(res.eligibleLoanAmount, 0);
  });

  // =================================================================
  // 3. MULTIPLIER ELIGIBILITY CALCULATOR
  // =================================================================
  console.log('\n[1.3 MULTIPLIER ELIGIBILITY CALCULATOR]');
  runCase('Multiplier Normal 1: ₹50,000/mo, 60x multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 50000, multiplier: 60, existingEmi: 0, rate: 10, tenureYears: 15 });
    assert.strictEqual(res.grossEligibleAmount, 3000000);
    assert.strictEqual(res.netEligibleAmount, 3000000);
  });
  runCase('Multiplier Normal 2: ₹1,00,000/mo, 72x multiplier, ₹10k EMI', () => {
    const res = calculateMultiplierEligibility({ income: 100000, multiplier: 72, existingEmi: 10000, rate: 10, tenureYears: 15 });
    assert.strictEqual(res.grossEligibleAmount, 7200000);
    assert.ok(res.netEligibleAmount < 7200000);
  });
  runCase('Multiplier Normal 3: Annual ₹12L, 5x multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 1200000, incomeType: 'annual', multiplier: 5, existingEmi: 0, rate: 9, tenureYears: 10 });
    assert.strictEqual(res.grossEligibleAmount, 6000000);
  });
  runCase('Multiplier Normal 4: ₹35,000/mo, 48x multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 35000, multiplier: 48, existingEmi: 0, rate: 11, tenureYears: 5 });
    assert.strictEqual(res.grossEligibleAmount, 1680000);
  });
  runCase('Multiplier Normal 5: ₹2,50,000/mo, 80x multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 250000, multiplier: 80, existingEmi: 0, rate: 8.5, tenureYears: 20 });
    assert.strictEqual(res.grossEligibleAmount, 20000000);
  });
  runCase('Multiplier Edge 1: High obligations wipe out multiplier eligibility', () => {
    const res = calculateMultiplierEligibility({ income: 50000, multiplier: 20, existingEmi: 60000, rate: 10, tenureYears: 5 });
    assert.strictEqual(res.netEligibleAmount, 0);
  });
  runCase('Multiplier Edge 2: 1x Multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 100000, multiplier: 1, existingEmi: 0 });
    assert.strictEqual(res.grossEligibleAmount, 100000);
  });
  runCase('Multiplier Edge 3: 120x Multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 100000, multiplier: 120, existingEmi: 0 });
    assert.strictEqual(res.grossEligibleAmount, 12000000);
  });
  runCase('Multiplier Invalid 1: Negative income', () => {
    const res = calculateMultiplierEligibility({ income: -50000 });
    assert.strictEqual(res.grossEligibleAmount, 0);
  });
  runCase('Multiplier Invalid 2: Zero multiplier', () => {
    const res = calculateMultiplierEligibility({ income: 50000, multiplier: 0 });
    assert.strictEqual(res.grossEligibleAmount, 0);
  });

  // =================================================================
  // 4. OUTSTANDING LOAN CALCULATOR
  // =================================================================
  console.log('\n[1.4 OUTSTANDING LOAN CALCULATOR]');
  runCase('Outstanding Normal 1: ₹10L, 10%, 5 yrs after 24 EMIs', () => {
    const res = calculateOutstandingLoan({ originalAmount: 1000000, rate: 10, originalTenureYears: 5, emisPaid: 24 });
    assert.ok(res.outstandingPrincipal > 650000 && res.outstandingPrincipal < 700000);
    assert.strictEqual(res.remainingTenureMonths, 36);
  });
  runCase('Outstanding Normal 2: ₹20L, 8.5%, 20 yrs after 60 EMIs', () => {
    const res = calculateOutstandingLoan({ originalAmount: 2000000, rate: 8.5, originalTenureYears: 20, emisPaid: 60 });
    assert.strictEqual(res.remainingTenureMonths, 180);
  });
  runCase('Outstanding Normal 3: ₹5L, 12%, 3 yrs after 12 EMIs', () => {
    const res = calculateOutstandingLoan({ originalAmount: 500000, rate: 12, originalTenureYears: 3, emisPaid: 12 });
    assert.strictEqual(res.remainingTenureMonths, 24);
  });
  runCase('Outstanding Normal 4: ₹1L, 14%, 1 yr after 6 EMIs', () => {
    const res = calculateOutstandingLoan({ originalAmount: 100000, rate: 14, originalTenureYears: 1, emisPaid: 6 });
    assert.strictEqual(res.remainingTenureMonths, 6);
  });
  runCase('Outstanding Normal 5: ₹15L, 9%, 10 yrs after 36 EMIs', () => {
    const res = calculateOutstandingLoan({ originalAmount: 1500000, rate: 9, originalTenureYears: 10, emisPaid: 36 });
    assert.strictEqual(res.remainingTenureMonths, 84);
  });
  runCase('Outstanding Edge 1: 0 EMIs paid', () => {
    const res = calculateOutstandingLoan({ originalAmount: 1000000, rate: 10, originalTenureYears: 5, emisPaid: 0 });
    assert.strictEqual(res.outstandingPrincipal, 1000000);
    assert.strictEqual(res.remainingTenureMonths, 60);
  });
  runCase('Outstanding Edge 2: All EMIs paid', () => {
    const res = calculateOutstandingLoan({ originalAmount: 1000000, rate: 10, originalTenureYears: 5, emisPaid: 60 });
    assert.strictEqual(res.outstandingPrincipal, 0);
    assert.strictEqual(res.remainingTenureMonths, 0);
  });
  runCase('Outstanding Edge 3: 0% Interest', () => {
    const res = calculateOutstandingLoan({ originalAmount: 120000, rate: 0, originalTenureYears: 1, emisPaid: 6 });
    assert.strictEqual(res.outstandingPrincipal, 60000);
  });
  runCase('Outstanding Invalid 1: EMIs paid exceeds total tenure', () => {
    const res = calculateOutstandingLoan({ originalAmount: 1000000, rate: 10, originalTenureYears: 5, emisPaid: 100 });
    assert.strictEqual(res.remainingTenureMonths, 0);
  });
  runCase('Outstanding Invalid 2: Negative amount', () => {
    const res = calculateOutstandingLoan({ originalAmount: -10000 });
    assert.strictEqual(res.outstandingPrincipal, 0);
  });

  // =================================================================
  // 5. FORECLOSURE CALCULATOR
  // =================================================================
  console.log('\n[1.5 FORECLOSURE CALCULATOR]');
  runCase('Foreclosure Normal 1: ₹5L @ 2% fee + 18% GST', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 500000, foreclosureChargePercent: 2, gstPercent: 18, otherCharges: 500 });
    assert.strictEqual(res.foreclosureFee, 10000);
    assert.strictEqual(res.gstAmount, 1800);
    assert.strictEqual(res.totalSettlementAmount, 512300);
  });
  runCase('Foreclosure Normal 2: ₹10L @ 3% fee + 18% GST', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 1000000, foreclosureChargePercent: 3, gstPercent: 18 });
    assert.strictEqual(res.foreclosureFee, 30000);
    assert.strictEqual(res.gstAmount, 5400);
    assert.strictEqual(res.totalSettlementAmount, 1035400);
  });
  runCase('Foreclosure Normal 3: ₹2L @ 1% fee', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 200000, foreclosureChargePercent: 1, gstPercent: 18 });
    assert.strictEqual(res.foreclosureFee, 2000);
    assert.strictEqual(res.gstAmount, 360);
  });
  runCase('Foreclosure Normal 4: ₹50L @ 2.5% fee', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 5000000, foreclosureChargePercent: 2.5, gstPercent: 18 });
    assert.strictEqual(res.foreclosureFee, 125000);
  });
  runCase('Foreclosure Normal 5: ₹8L @ 2% + ₹1000 penalties', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 800000, foreclosureChargePercent: 2, gstPercent: 18, otherCharges: 1000 });
    assert.strictEqual(res.totalSettlementAmount, 800000 + 16000 + 2880 + 1000);
  });
  runCase('Foreclosure Edge 1: 0% Foreclosure Charge (Floating rate home loan)', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 1000000, foreclosureChargePercent: 0, gstPercent: 18 });
    assert.strictEqual(res.foreclosureFee, 0);
    assert.strictEqual(res.gstAmount, 0);
    assert.strictEqual(res.totalSettlementAmount, 1000000);
  });
  runCase('Foreclosure Edge 2: 0% GST', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 100000, foreclosureChargePercent: 2, gstPercent: 0 });
    assert.strictEqual(res.gstAmount, 0);
    assert.strictEqual(res.totalSettlementAmount, 102000);
  });
  runCase('Foreclosure Edge 3: ₹1 Cr Principal', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 10000000, foreclosureChargePercent: 2, gstPercent: 18 });
    assert.strictEqual(res.foreclosureFee, 200000);
  });
  runCase('Foreclosure Invalid 1: Negative principal', () => {
    const res = calculateForeclosure({ outstandingPrincipal: -50000 });
    assert.strictEqual(res.totalSettlementAmount, 0);
  });
  runCase('Foreclosure Invalid 2: Negative fee %', () => {
    const res = calculateForeclosure({ outstandingPrincipal: 100000, foreclosureChargePercent: -5 });
    assert.strictEqual(res.foreclosureFee, 0);
  });

  // =================================================================
  // 6. OVERDRAFT CALCULATOR
  // =================================================================
  console.log('\n[1.6 OVERDRAFT CALCULATOR]');
  runCase('Overdraft Normal 1: Limit ₹10L, Utilized ₹4L @ 12% for 30 days', () => {
    const res = calculateOverdraft({ sanctionedLimit: 1000000, amountUtilized: 400000, rate: 12, daysUtilized: 30 });
    assert.strictEqual(res.availableLimit, 600000);
    assert.strictEqual(Math.round(res.estimatedInterest), Math.round((400000 * 0.12 * 30) / 365));
  });
  runCase('Overdraft Normal 2: Limit ₹5L, Utilized ₹2L @ 14% for 15 days', () => {
    const res = calculateOverdraft({ sanctionedLimit: 500000, amountUtilized: 200000, rate: 14, daysUtilized: 15 });
    assert.strictEqual(res.availableLimit, 300000);
  });
  runCase('Overdraft Normal 3: Limit ₹20L, Utilized ₹10L @ 10% for 365 days', () => {
    const res = calculateOverdraft({ sanctionedLimit: 2000000, amountUtilized: 1000000, rate: 10, daysUtilized: 365 });
    assert.strictEqual(Math.round(res.estimatedInterest), 100000);
  });
  runCase('Overdraft Normal 4: Limit ₹2L, Utilized ₹50k @ 15% for 60 days', () => {
    const res = calculateOverdraft({ sanctionedLimit: 200000, amountUtilized: 50000, rate: 15, daysUtilized: 60 });
    assert.strictEqual(res.availableLimit, 150000);
  });
  runCase('Overdraft Normal 5: Limit ₹50L, Utilized ₹25L @ 11% + ₹2000 processing', () => {
    const res = calculateOverdraft({ sanctionedLimit: 5000000, amountUtilized: 2500000, rate: 11, daysUtilized: 30, otherCharges: 2000 });
    assert.ok(res.totalEstimatedCost > 2000);
  });
  runCase('Overdraft Edge 1: 0 Utilized', () => {
    const res = calculateOverdraft({ sanctionedLimit: 1000000, amountUtilized: 0 });
    assert.strictEqual(res.estimatedInterest, 0);
    assert.strictEqual(res.availableLimit, 1000000);
  });
  runCase('Overdraft Edge 2: 100% Utilized', () => {
    const res = calculateOverdraft({ sanctionedLimit: 500000, amountUtilized: 500000 });
    assert.strictEqual(res.availableLimit, 0);
  });
  runCase('Overdraft Edge 3: 1 Day Utilization', () => {
    const res = calculateOverdraft({ sanctionedLimit: 1000000, amountUtilized: 1000000, rate: 12, daysUtilized: 1 });
    assert.strictEqual(Math.round(res.estimatedInterest), Math.round(120000 / 365));
  });
  runCase('Overdraft Invalid 1: Negative limit', () => {
    const res = calculateOverdraft({ sanctionedLimit: -50000 });
    assert.strictEqual(res.sanctionedLimit, 0);
  });
  runCase('Overdraft Invalid 2: Negative days', () => {
    const res = calculateOverdraft({ sanctionedLimit: 100000, amountUtilized: 50000, daysUtilized: -10 });
    assert.strictEqual(res.estimatedInterest, 0);
  });

  // =================================================================
  // 7. LOAN COMPARISON CALCULATOR
  // =================================================================
  console.log('\n[1.7 LOAN COMPARISON CALCULATOR]');
  runCase('Compare Normal 1: Loan A (9.5%) vs Loan B (10.5%) for 5 yrs', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 1000000, rate: 9.5, tenureYears: 5, processingFeePercent: 1, processingFeeFlat: 0, otherCharges: 0 },
      loanB: { amount: 1000000, rate: 10.5, tenureYears: 5, processingFeePercent: 0.5, processingFeeFlat: 0, otherCharges: 0 }
    });
    assert.strictEqual(res.betterLoan, 'Loan A');
    assert.ok(res.totalCostDifference > 0);
  });
  runCase('Compare Normal 2: Loan A (higher fee, lower rate) vs Loan B', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 2000000, rate: 8.5, tenureYears: 15, processingFeePercent: 2, processingFeeFlat: 0, otherCharges: 0 },
      loanB: { amount: 2000000, rate: 9.5, tenureYears: 15, processingFeePercent: 0.5, processingFeeFlat: 0, otherCharges: 0 }
    });
    assert.strictEqual(res.betterLoan, 'Loan A');
  });
  runCase('Compare Normal 3: Identical Loans', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 500000, rate: 10, tenureYears: 3, processingFeePercent: 1 },
      loanB: { amount: 500000, rate: 10, tenureYears: 3, processingFeePercent: 1 }
    });
    assert.strictEqual(res.betterLoan, 'Equal');
    assert.strictEqual(res.totalCostDifference, 0);
  });
  runCase('Compare Normal 4: Short vs Long Tenure comparison', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 1000000, rate: 10, tenureYears: 3 },
      loanB: { amount: 1000000, rate: 10, tenureYears: 5 }
    });
    assert.strictEqual(res.betterLoan, 'Loan A');
  });
  runCase('Compare Normal 5: Loan B with zero processing fee', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 1000000, rate: 10, tenureYears: 5, processingFeePercent: 2 },
      loanB: { amount: 1000000, rate: 10, tenureYears: 5, processingFeePercent: 0 }
    });
    assert.strictEqual(res.betterLoan, 'Loan B');
  });
  runCase('Compare Edge 1: 0% Interest on Loan A', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 100000, rate: 0, tenureYears: 1 },
      loanB: { amount: 100000, rate: 10, tenureYears: 1 }
    });
    assert.strictEqual(res.betterLoan, 'Loan A');
  });
  runCase('Compare Edge 2: Zero Principal', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 0, rate: 10, tenureYears: 5 },
      loanB: { amount: 0, rate: 10, tenureYears: 5 }
    });
    assert.strictEqual(res.betterLoan, 'Equal');
  });
  runCase('Compare Edge 3: Large Flat Fee difference', () => {
    const res = calculateLoanComparison({
      loanA: { amount: 500000, rate: 10, tenureYears: 2, processingFeeFlat: 50000 },
      loanB: { amount: 500000, rate: 11, tenureYears: 2, processingFeeFlat: 0 }
    });
    assert.strictEqual(res.betterLoan, 'Loan B');
  });
  runCase('Compare Invalid 1: Empty objects', () => {
    const res = calculateLoanComparison({ loanA: {}, loanB: {} });
    assert.strictEqual(res.betterLoan, 'Equal');
  });
  runCase('Compare Invalid 2: Negative amounts', () => {
    const res = calculateLoanComparison({ loanA: { amount: -500 }, loanB: { amount: -500 } });
    assert.strictEqual(res.betterLoan, 'Equal');
  });

  // =================================================================
  // 8. PREPAYMENT CALCULATOR
  // =================================================================
  console.log('\n[1.8 PREPAYMENT CALCULATOR]');
  runCase('Prepayment Normal 1: ₹10L @ 10%, 48m left, ₹2L lump sum (reduce tenure)', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 1000000, rate: 10, remainingTenureMonths: 48, prepaymentAmount: 200000, option: 'reduce_tenure' });
    assert.ok(res.interestSaved > 0);
    assert.ok(res.tenureSavedMonths > 0);
  });
  runCase('Prepayment Normal 2: ₹10L @ 10%, 48m left, ₹2L lump sum (reduce EMI)', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 1000000, rate: 10, remainingTenureMonths: 48, prepaymentAmount: 200000, option: 'reduce_emi' });
    assert.ok(res.interestSaved > 0);
    assert.ok(res.monthlyEmiSaved > 0);
  });
  runCase('Prepayment Normal 3: ₹25L @ 8.5%, 180m left, ₹5L lump sum', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 2500000, rate: 8.5, remainingTenureMonths: 180, prepaymentAmount: 500000, option: 'reduce_tenure' });
    assert.ok(res.interestSaved > 100000);
  });
  runCase('Prepayment Normal 4: ₹5L @ 12%, 24m left, ₹1L lump sum', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 500000, rate: 12, remainingTenureMonths: 24, prepaymentAmount: 100000, option: 'reduce_emi' });
    assert.ok(res.monthlyEmiSaved > 0);
  });
  runCase('Prepayment Normal 5: ₹2L @ 14%, 12m left, ₹50k lump sum', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 200000, rate: 14, remainingTenureMonths: 12, prepaymentAmount: 50000, option: 'reduce_tenure' });
    assert.ok(res.tenureSavedMonths >= 2);
  });
  runCase('Prepayment Edge 1: 100% Prepayment (Full Foreclosure)', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 500000, rate: 10, remainingTenureMonths: 24, prepaymentAmount: 500000 });
    assert.strictEqual(res.withPrepayment.newPrincipal, 0);
    assert.strictEqual(res.tenureSavedMonths, 24);
  });
  runCase('Prepayment Edge 2: ₹0 Prepayment', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 500000, rate: 10, remainingTenureMonths: 24, prepaymentAmount: 0 });
    assert.strictEqual(res.interestSaved, 0);
    assert.strictEqual(res.tenureSavedMonths, 0);
  });
  runCase('Prepayment Edge 3: 0% Interest loan prepayment', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 120000, rate: 0, remainingTenureMonths: 12, prepaymentAmount: 60000, option: 'reduce_tenure' });
    assert.strictEqual(res.tenureSavedMonths, 6);
  });
  runCase('Prepayment Invalid 1: Prepayment exceeds outstanding balance', () => {
    const res = calculatePrepayment({ outstandingPrincipal: 100000, prepaymentAmount: 200000, rate: 10, remainingTenureMonths: 12 });
    assert.strictEqual(res.withPrepayment.newPrincipal, 0);
  });
  runCase('Prepayment Invalid 2: Negative values', () => {
    const res = calculatePrepayment({ outstandingPrincipal: -10000, prepaymentAmount: -5000 });
    assert.strictEqual(res.interestSaved, 0);
  });

  // =================================================================
  // 9. RATE CHANGE CALCULATOR
  // =================================================================
  console.log('\n[1.9 RATE CHANGE CALCULATOR]');
  runCase('Rate Change Normal 1: ₹10L from 10% to 11% for 48m', () => {
    const res = calculateRateChange({ outstandingPrincipal: 1000000, currentRate: 10, newRate: 11, remainingTenureMonths: 48 });
    assert.ok(res.emiDifference > 0);
    assert.ok(res.interestDifference > 0);
  });
  runCase('Rate Change Normal 2: ₹25L from 9% to 8% (rate cut)', () => {
    const res = calculateRateChange({ outstandingPrincipal: 2500000, currentRate: 9, newRate: 8, remainingTenureMonths: 120 });
    assert.ok(res.emiDifference < 0);
    assert.ok(res.interestDifference < 0);
  });
  runCase('Rate Change Normal 3: ₹5L from 12% to 13.5%', () => {
    const res = calculateRateChange({ outstandingPrincipal: 500000, currentRate: 12, newRate: 13.5, remainingTenureMonths: 36 });
    assert.ok(res.emiDifference > 0);
  });
  runCase('Rate Change Normal 4: ₹50L from 8.5% to 9.25% for 240m', () => {
    const res = calculateRateChange({ outstandingPrincipal: 5000000, currentRate: 8.5, newRate: 9.25, remainingTenureMonths: 240 });
    assert.ok(res.revisedTenureMonths > 240);
  });
  runCase('Rate Change Normal 5: ₹2L from 14% to 12%', () => {
    const res = calculateRateChange({ outstandingPrincipal: 200000, currentRate: 14, newRate: 12, remainingTenureMonths: 24 });
    assert.ok(res.emiDifference < 0);
  });
  runCase('Rate Change Edge 1: Identical current and new rate', () => {
    const res = calculateRateChange({ outstandingPrincipal: 1000000, currentRate: 10, newRate: 10, remainingTenureMonths: 48 });
    assert.strictEqual(Math.round(res.emiDifference), 0);
    assert.strictEqual(Math.round(res.interestDifference), 0);
  });
  runCase('Rate Change Edge 2: Massive rate hike', () => {
    const res = calculateRateChange({ outstandingPrincipal: 100000, currentRate: 10, newRate: 25, remainingTenureMonths: 12 });
    assert.ok(res.emiDifference > 500);
  });
  runCase('Rate Change Edge 3: 0% Current Rate', () => {
    const res = calculateRateChange({ outstandingPrincipal: 120000, currentRate: 0, newRate: 10, remainingTenureMonths: 12 });
    assert.ok(res.emiDifference > 0);
  });
  runCase('Rate Change Invalid 1: Negative principal', () => {
    const res = calculateRateChange({ outstandingPrincipal: -5000 });
    assert.strictEqual(res.outstandingPrincipal, 0);
  });
  runCase('Rate Change Invalid 2: Zero remaining tenure', () => {
    const res = calculateRateChange({ outstandingPrincipal: 100000, remainingTenureMonths: 0 });
    assert.strictEqual(res.remainingTenureMonths, 0);
  });

  // =================================================================
  // 10. GST ON INTEREST & CHARGES
  // =================================================================
  console.log('\n[1.10 GST ON INTEREST & CHARGES]');
  runCase('GST Interest Normal 1: ₹10,000 @ 18%', () => {
    const res = calculateGSTOnInterest({ baseAmount: 10000, gstRate: 18 });
    assert.strictEqual(res.gstAmount, 1800);
    assert.strictEqual(res.totalAmount, 11800);
    assert.strictEqual(res.cgstAmount, 900);
    assert.strictEqual(res.sgstAmount, 900);
  });
  runCase('GST Interest Normal 2: ₹5,000 @ 18%', () => {
    const res = calculateGSTOnInterest({ baseAmount: 5000, gstRate: 18 });
    assert.strictEqual(res.gstAmount, 900);
    assert.strictEqual(res.totalAmount, 5900);
  });
  runCase('GST Interest Normal 3: ₹25,000 @ 18%', () => {
    const res = calculateGSTOnInterest({ baseAmount: 25000, gstRate: 18 });
    assert.strictEqual(res.gstAmount, 4500);
  });
  runCase('GST Interest Normal 4: ₹1,000 @ 18%', () => {
    const res = calculateGSTOnInterest({ baseAmount: 1000, gstRate: 18 });
    assert.strictEqual(res.gstAmount, 180);
  });
  runCase('GST Interest Normal 5: ₹50,000 @ 18%', () => {
    const res = calculateGSTOnInterest({ baseAmount: 50000, gstRate: 18 });
    assert.strictEqual(res.gstAmount, 9000);
  });
  runCase('GST Interest Edge 1: 0% GST rate', () => {
    const res = calculateGSTOnInterest({ baseAmount: 10000, gstRate: 0 });
    assert.strictEqual(res.gstAmount, 0);
    assert.strictEqual(res.totalAmount, 10000);
  });
  runCase('GST Interest Edge 2: 28% GST rate', () => {
    const res = calculateGSTOnInterest({ baseAmount: 10000, gstRate: 28 });
    assert.strictEqual(res.gstAmount, 2800);
  });
  runCase('GST Interest Edge 3: Decimal base fee ₹1,234.50', () => {
    const res = calculateGSTOnInterest({ baseAmount: 1234.50, gstRate: 18 });
    assert.strictEqual(Number(res.gstAmount.toFixed(2)), 222.21);
  });
  runCase('GST Interest Invalid 1: Negative fee', () => {
    const res = calculateGSTOnInterest({ baseAmount: -1000 });
    assert.strictEqual(res.totalAmount, 0);
  });
  runCase('GST Interest Invalid 2: Negative GST rate', () => {
    const res = calculateGSTOnInterest({ baseAmount: 1000, gstRate: -18 });
    assert.strictEqual(res.gstAmount, 0);
  });

  // =================================================================
  // 11. FD CALCULATOR
  // =================================================================
  console.log('\n[2.1 FD CALCULATOR]');
  runCase('FD Normal 1: ₹1,00,000 @ 7% for 12m (quarterly)', () => {
    const res = calculateFD({ principal: 100000, rate: 7, tenureMonths: 12, compoundingFrequency: 'quarterly' });
    assert.strictEqual(Math.round(res.maturityAmount), 107186);
    assert.strictEqual(Math.round(res.interestEarned), 7186);
  });
  runCase('FD Normal 2: ₹5,00,000 @ 7.5% for 36m (quarterly)', () => {
    const res = calculateFD({ principal: 500000, rate: 7.5, tenureMonths: 36, compoundingFrequency: 'quarterly' });
    assert.ok(res.maturityAmount > 600000);
  });
  runCase('FD Normal 3: ₹50,000 @ 6.5% for 6m (half_yearly)', () => {
    const res = calculateFD({ principal: 50000, rate: 6.5, tenureMonths: 6, compoundingFrequency: 'half_yearly' });
    assert.strictEqual(Math.round(res.maturityAmount), 51625);
  });
  runCase('FD Normal 4: ₹10L @ 8% for 60m (yearly)', () => {
    const res = calculateFD({ principal: 1000000, rate: 8, tenureMonths: 60, compoundingFrequency: 'yearly' });
    assert.strictEqual(Math.round(res.maturityAmount), 1469328);
  });
  runCase('FD Normal 5: ₹2L @ 7.25% for 24m (monthly)', () => {
    const res = calculateFD({ principal: 200000, rate: 7.25, tenureMonths: 24, compoundingFrequency: 'monthly' });
    assert.ok(res.maturityAmount > 230000);
  });
  runCase('FD Edge 1: 0% Interest Rate', () => {
    const res = calculateFD({ principal: 100000, rate: 0, tenureMonths: 12 });
    assert.strictEqual(res.maturityAmount, 100000);
    assert.strictEqual(res.interestEarned, 0);
  });
  runCase('FD Edge 2: 1 Month tenure', () => {
    const res = calculateFD({ principal: 100000, rate: 12, tenureMonths: 1, compoundingFrequency: 'monthly' });
    assert.strictEqual(Math.round(res.maturityAmount), 101000);
  });
  runCase('FD Edge 3: Large amount ₹1 Crore', () => {
    const res = calculateFD({ principal: 10000000, rate: 7, tenureMonths: 12 });
    assert.strictEqual(Math.round(res.maturityAmount), 10718590);
  });
  runCase('FD Invalid 1: Negative principal', () => {
    const res = calculateFD({ principal: -5000 });
    assert.strictEqual(res.maturityAmount, 0);
  });
  runCase('FD Invalid 2: Zero months tenure', () => {
    const res = calculateFD({ principal: 100000, tenureMonths: 0 });
    assert.strictEqual(res.maturityAmount, 100000);
  });

  // =================================================================
  // 12. RD CALCULATOR
  // =================================================================
  console.log('\n[2.2 RD CALCULATOR]');
  runCase('RD Normal 1: ₹5,000/mo @ 7% for 12m', () => {
    const res = calculateRD({ monthlyDeposit: 5000, rate: 7, tenureMonths: 12 });
    assert.strictEqual(res.totalDeposit, 60000);
    assert.ok(res.interestEarned > 2200 && res.interestEarned < 2400);
  });
  runCase('RD Normal 2: ₹10,000/mo @ 6.8% for 24m', () => {
    const res = calculateRD({ monthlyDeposit: 10000, rate: 6.8, tenureMonths: 24 });
    assert.strictEqual(res.totalDeposit, 240000);
    assert.ok(res.interestEarned > 17000);
  });
  runCase('RD Normal 3: ₹2,000/mo @ 7.5% for 36m', () => {
    const res = calculateRD({ monthlyDeposit: 2000, rate: 7.5, tenureMonths: 36 });
    assert.strictEqual(res.totalDeposit, 72000);
  });
  runCase('RD Normal 4: ₹25,000/mo @ 7.1% for 60m', () => {
    const res = calculateRD({ monthlyDeposit: 25000, rate: 7.1, tenureMonths: 60 });
    assert.strictEqual(res.totalDeposit, 1500000);
  });
  runCase('RD Normal 5: ₹1,000/mo @ 6% for 6m', () => {
    const res = calculateRD({ monthlyDeposit: 1000, rate: 6, tenureMonths: 6 });
    assert.strictEqual(res.totalDeposit, 6000);
  });
  runCase('RD Edge 1: 0% Interest rate', () => {
    const res = calculateRD({ monthlyDeposit: 5000, rate: 0, tenureMonths: 12 });
    assert.strictEqual(res.maturityAmount, 60000);
    assert.strictEqual(res.interestEarned, 0);
  });
  runCase('RD Edge 2: 1 Month RD', () => {
    const res = calculateRD({ monthlyDeposit: 5000, rate: 12, tenureMonths: 1 });
    assert.strictEqual(res.totalDeposit, 5000);
  });
  runCase('RD Edge 3: 120 Months (10 yrs)', () => {
    const res = calculateRD({ monthlyDeposit: 5000, rate: 7, tenureMonths: 120 });
    assert.strictEqual(res.totalDeposit, 600000);
  });
  runCase('RD Invalid 1: Negative deposit', () => {
    const res = calculateRD({ monthlyDeposit: -500 });
    assert.strictEqual(res.totalDeposit, 0);
  });
  runCase('RD Invalid 2: Zero tenure', () => {
    const res = calculateRD({ monthlyDeposit: 5000, tenureMonths: 0 });
    assert.strictEqual(res.totalDeposit, 0);
  });

  // =================================================================
  // 13. SIP CALCULATOR
  // =================================================================
  console.log('\n[2.3 SIP CALCULATOR]');
  runCase('SIP Normal 1: ₹10,000/mo @ 12% for 5 yrs', () => {
    const res = calculateSIP({ monthlyInvestment: 10000, rate: 12, tenureYears: 5 });
    assert.strictEqual(res.totalInvestment, 600000);
    assert.strictEqual(Math.round(res.maturityValue), 824864);
    assert.strictEqual(Math.round(res.estimatedReturns), 224864);
  });
  runCase('SIP Normal 2: ₹5,000/mo @ 15% for 10 yrs', () => {
    const res = calculateSIP({ monthlyInvestment: 5000, rate: 15, tenureYears: 10 });
    assert.strictEqual(res.totalInvestment, 600000);
    assert.strictEqual(Math.round(res.maturityValue), 1393286);
  });
  runCase('SIP Normal 3: ₹20,000/mo @ 12% for 20 yrs', () => {
    const res = calculateSIP({ monthlyInvestment: 20000, rate: 12, tenureYears: 20 });
    assert.strictEqual(res.totalInvestment, 4800000);
    assert.ok(Math.abs(res.maturityValue - 19982959) < 2);
  });
  runCase('SIP Normal 4: ₹1,000/mo @ 10% for 3 yrs', () => {
    const res = calculateSIP({ monthlyInvestment: 1000, rate: 10, tenureYears: 3 });
    assert.strictEqual(res.totalInvestment, 36000);
  });
  runCase('SIP Normal 5: ₹50,000/mo @ 14% for 15 yrs', () => {
    const res = calculateSIP({ monthlyInvestment: 50000, rate: 14, tenureYears: 15 });
    assert.ok(res.maturityValue > 30000000);
  });
  runCase('SIP Edge 1: 0% Expected Return', () => {
    const res = calculateSIP({ monthlyInvestment: 10000, rate: 0, tenureYears: 5 });
    assert.strictEqual(res.maturityValue, 600000);
    assert.strictEqual(res.estimatedReturns, 0);
  });
  runCase('SIP Edge 2: 1 Year tenure', () => {
    const res = calculateSIP({ monthlyInvestment: 10000, rate: 12, tenureYears: 1 });
    assert.strictEqual(res.totalInvestment, 120000);
  });
  runCase('SIP Edge 3: 30 Years tenure', () => {
    const res = calculateSIP({ monthlyInvestment: 10000, rate: 12, tenureYears: 30 });
    assert.ok(res.maturityValue > 30000000);
  });
  runCase('SIP Invalid 1: Negative investment', () => {
    const res = calculateSIP({ monthlyInvestment: -1000 });
    assert.strictEqual(res.totalInvestment, 0);
  });
  runCase('SIP Invalid 2: Zero years', () => {
    const res = calculateSIP({ monthlyInvestment: 5000, tenureYears: 0 });
    assert.strictEqual(res.totalInvestment, 0);
  });

  // =================================================================
  // 14. INTEREST CALCULATOR (SI & CI)
  // =================================================================
  console.log('\n[2.4 INTEREST CALCULATOR]');
  runCase('Interest Normal 1: SI ₹1,00,000 @ 10% for 2 yrs', () => {
    const res = calculateInterest({ principal: 100000, rate: 10, timeYears: 2, isCompound: false });
    assert.strictEqual(res.interest, 20000);
    assert.strictEqual(res.finalAmount, 120000);
  });
  runCase('Interest Normal 2: CI ₹1,00,000 @ 10% for 2 yrs (Annual)', () => {
    const res = calculateInterest({ principal: 100000, rate: 10, timeYears: 2, isCompound: true, compoundingFrequency: 'yearly' });
    assert.strictEqual(res.interest, 21000);
    assert.strictEqual(res.finalAmount, 121000);
  });
  runCase('Interest Normal 3: SI ₹50,000 @ 8% for 5 yrs', () => {
    const res = calculateInterest({ principal: 50000, rate: 8, timeYears: 5, isCompound: false });
    assert.strictEqual(res.interest, 20000);
  });
  runCase('Interest Normal 4: CI ₹50,000 @ 8% for 5 yrs (Quarterly)', () => {
    const res = calculateInterest({ principal: 50000, rate: 8, timeYears: 5, isCompound: true, compoundingFrequency: 'quarterly' });
    assert.ok(res.interest > 24000);
  });
  runCase('Interest Normal 5: SI ₹2L @ 12% for 1.5 yrs', () => {
    const res = calculateInterest({ principal: 200000, rate: 12, timeYears: 1.5, isCompound: false });
    assert.strictEqual(res.interest, 36000);
  });
  runCase('Interest Edge 1: 0% Interest rate', () => {
    const res = calculateInterest({ principal: 100000, rate: 0, timeYears: 5 });
    assert.strictEqual(res.interest, 0);
    assert.strictEqual(res.finalAmount, 100000);
  });
  runCase('Interest Edge 2: 0 Time', () => {
    const res = calculateInterest({ principal: 100000, rate: 10, timeYears: 0 });
    assert.strictEqual(res.interest, 0);
  });
  runCase('Interest Edge 3: Monthly compounding CI', () => {
    const res = calculateInterest({ principal: 100000, rate: 12, timeYears: 1, isCompound: true, compoundingFrequency: 'monthly' });
    assert.ok(res.interest > 12000);
  });
  runCase('Interest Invalid 1: Negative principal', () => {
    const res = calculateInterest({ principal: -1000 });
    assert.strictEqual(res.finalAmount, 0);
  });
  runCase('Interest Invalid 2: Negative rate', () => {
    const res = calculateInterest({ principal: 100000, rate: -5 });
    assert.strictEqual(res.interest, 0);
  });

  // =================================================================
  // 15. PPF CALCULATOR
  // =================================================================
  console.log('\n[2.5 PPF CALCULATOR]');
  runCase('PPF Normal 1: ₹1,50,000/yr @ 7.1% for 15 yrs', () => {
    const res = calculatePPF({ initialAmount: 0, annualContribution: 150000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.totalContribution, 2250000);
    assert.ok(res.maturityAmount > 4000000);
    assert.strictEqual(res.yearlySchedule.length, 15);
  });
  runCase('PPF Normal 2: ₹50,000/yr @ 7.1% for 15 yrs', () => {
    const res = calculatePPF({ annualContribution: 50000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.totalContribution, 750000);
    assert.ok(res.maturityAmount > 1300000);
  });
  runCase('PPF Normal 3: ₹1,00,000/yr @ 7.1% for 15 yrs', () => {
    const res = calculatePPF({ annualContribution: 100000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.totalContribution, 1500000);
  });
  runCase('PPF Normal 4: ₹10,000/yr @ 7.1% for 15 yrs', () => {
    const res = calculatePPF({ annualContribution: 10000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.totalContribution, 150000);
  });
  runCase('PPF Normal 5: ₹1.5L/yr + Initial ₹50k', () => {
    const res = calculatePPF({ initialAmount: 50000, annualContribution: 150000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.totalContribution, 2300000);
  });
  runCase('PPF Edge 1: Statutory ₹1,50,000 Annual Cap Clamping', () => {
    const res = calculatePPF({ annualContribution: 200000, rate: 7.1, tenureYears: 15 });
    assert.strictEqual(res.annualContribution, 150000);
  });
  runCase('PPF Edge 2: 20 Years Extended PPF', () => {
    const res = calculatePPF({ annualContribution: 150000, rate: 7.1, tenureYears: 20 });
    assert.strictEqual(res.yearlySchedule.length, 20);
  });
  runCase('PPF Edge 3: 0% Interest Rate', () => {
    const res = calculatePPF({ annualContribution: 100000, rate: 0, tenureYears: 15 });
    assert.strictEqual(res.maturityAmount, 1500000);
  });
  runCase('PPF Invalid 1: Negative contribution', () => {
    const res = calculatePPF({ annualContribution: -5000 });
    assert.strictEqual(res.totalContribution, 0);
  });
  runCase('PPF Invalid 2: Zero years', () => {
    const res = calculatePPF({ annualContribution: 100000, tenureYears: 0 });
    assert.strictEqual(res.tenureYears, 1);
  });

  // =================================================================
  // 16. GST CALCULATOR (ADD / REMOVE)
  // =================================================================
  console.log('\n[3.1 GST CALCULATOR]');
  runCase('GST Normal 1: Add 18% to ₹1,000', () => {
    const res = calculateGST({ amount: 1000, gstRate: 18, mode: 'add' });
    assert.strictEqual(res.gstAmount, 180);
    assert.strictEqual(res.finalAmount, 1180);
  });
  runCase('GST Normal 2: Remove 18% from ₹1,180', () => {
    const res = calculateGST({ amount: 1180, gstRate: 18, mode: 'remove' });
    assert.strictEqual(Math.round(res.baseAmount), 1000);
    assert.strictEqual(Math.round(res.gstAmount), 180);
  });
  runCase('GST Normal 3: Add 5% to ₹10,000', () => {
    const res = calculateGST({ amount: 10000, gstRate: 5, mode: 'add' });
    assert.strictEqual(res.gstAmount, 500);
    assert.strictEqual(res.finalAmount, 10500);
  });
  runCase('GST Normal 4: Add 12% to ₹5,000', () => {
    const res = calculateGST({ amount: 5000, gstRate: 12, mode: 'add' });
    assert.strictEqual(res.gstAmount, 600);
  });
  runCase('GST Normal 5: Add 28% to ₹1,00,000', () => {
    const res = calculateGST({ amount: 100000, gstRate: 28, mode: 'add' });
    assert.strictEqual(res.gstAmount, 28000);
    assert.strictEqual(res.finalAmount, 128000);
  });
  runCase('GST Edge 1: 0% GST', () => {
    const res = calculateGST({ amount: 5000, gstRate: 0, mode: 'add' });
    assert.strictEqual(res.gstAmount, 0);
    assert.strictEqual(res.finalAmount, 5000);
  });
  runCase('GST Edge 2: Remove 28% from ₹12,800', () => {
    const res = calculateGST({ amount: 12800, gstRate: 28, mode: 'remove' });
    assert.strictEqual(Math.round(res.baseAmount), 10000);
  });
  runCase('GST Edge 3: Decimal Amount ₹999.99', () => {
    const res = calculateGST({ amount: 999.99, gstRate: 18, mode: 'add' });
    assert.ok(res.finalAmount > 1179);
  });
  runCase('GST Invalid 1: Negative amount', () => {
    const res = calculateGST({ amount: -1000, gstRate: 18 });
    assert.strictEqual(res.finalAmount, 0);
  });
  runCase('GST Invalid 2: Negative rate', () => {
    const res = calculateGST({ amount: 1000, gstRate: -18 });
    assert.strictEqual(res.gstAmount, 0);
  });

  // =================================================================
  // 17. PROFIT & MARGIN CALCULATOR
  // =================================================================
  console.log('\n[3.2 PROFIT & MARGIN CALCULATOR]');
  runCase('Profit Normal 1: CP ₹800, SP ₹1,000 -> Profit ₹200 (25%), Margin 20%', () => {
    const res = calculateProfitLoss({ costPrice: 800, sellingPrice: 1000 });
    assert.strictEqual(res.isProfit, true);
    assert.strictEqual(res.amount, 200);
    assert.strictEqual(res.profitLossPercent, 25);
    assert.strictEqual(res.marginPercent, 20);
  });
  runCase('Profit Normal 2: CP ₹1,000, SP ₹800 -> Loss ₹200 (20%)', () => {
    const res = calculateProfitLoss({ costPrice: 1000, sellingPrice: 800 });
    assert.strictEqual(res.isProfit, false);
    assert.strictEqual(res.amount, 200);
    assert.strictEqual(res.profitLossPercent, 20);
  });
  runCase('Profit Normal 3: CP ₹500, SP ₹750 -> Profit 50%, Margin 33.33%', () => {
    const res = calculateProfitLoss({ costPrice: 500, sellingPrice: 750 });
    assert.strictEqual(res.profitLossPercent, 50);
  });
  runCase('Profit Normal 4: CP ₹100, SP ₹200 -> Profit 100%, Margin 50%', () => {
    const res = calculateProfitLoss({ costPrice: 100, sellingPrice: 200 });
    assert.strictEqual(res.profitLossPercent, 100);
    assert.strictEqual(res.marginPercent, 50);
  });
  runCase('Profit Normal 5: CP ₹10,000, SP ₹15,000', () => {
    const res = calculateProfitLoss({ costPrice: 10000, sellingPrice: 15000 });
    assert.strictEqual(res.amount, 5000);
  });
  runCase('Profit Edge 1: Breakeven CP = SP (₹500)', () => {
    const res = calculateProfitLoss({ costPrice: 500, sellingPrice: 500 });
    assert.strictEqual(res.amount, 0);
    assert.strictEqual(res.profitLossPercent, 0);
  });
  runCase('Profit Edge 2: SP = 0 (100% loss)', () => {
    const res = calculateProfitLoss({ costPrice: 500, sellingPrice: 0 });
    assert.strictEqual(res.isProfit, false);
    assert.strictEqual(res.amount, 500);
    assert.strictEqual(res.profitLossPercent, 100);
  });
  runCase('Profit Edge 3: Large values ₹1 Cr CP, ₹1.5 Cr SP', () => {
    const res = calculateProfitLoss({ costPrice: 10000000, sellingPrice: 15000000 });
    assert.strictEqual(res.amount, 5000000);
  });
  runCase('Profit Invalid 1: Negative CP', () => {
    const res = calculateProfitLoss({ costPrice: -100, sellingPrice: 200 });
    assert.strictEqual(res.costPrice, 0);
  });
  runCase('Profit Invalid 2: Both 0', () => {
    const res = calculateProfitLoss({ costPrice: 0, sellingPrice: 0 });
    assert.strictEqual(res.amount, 0);
  });

  // =================================================================
  // 18. DISCOUNT CALCULATOR
  // =================================================================
  console.log('\n[3.3 DISCOUNT CALCULATOR]');
  runCase('Discount Normal 1: ₹1,000 @ 10% -> Final ₹900', () => {
    const res = calculateDiscount({ originalPrice: 1000, discountPercent: 10, mode: 'percent' });
    assert.strictEqual(res.discountAmount, 100);
    assert.strictEqual(res.finalPrice, 900);
  });
  runCase('Discount Normal 2: Flat ₹200 off on ₹1,000', () => {
    const res = calculateDiscount({ originalPrice: 1000, flatDiscount: 200, mode: 'flat' });
    assert.strictEqual(res.discountAmount, 200);
    assert.strictEqual(res.finalPrice, 800);
  });
  runCase('Discount Normal 3: ₹5,000 @ 25% discount', () => {
    const res = calculateDiscount({ originalPrice: 5000, discountPercent: 25, mode: 'percent' });
    assert.strictEqual(res.discountAmount, 1250);
    assert.strictEqual(res.finalPrice, 3750);
  });
  runCase('Discount Normal 4: ₹2,500 @ 50% off', () => {
    const res = calculateDiscount({ originalPrice: 2500, discountPercent: 50, mode: 'percent' });
    assert.strictEqual(res.finalPrice, 1250);
  });
  runCase('Discount Normal 5: ₹10,000 @ 15% discount', () => {
    const res = calculateDiscount({ originalPrice: 10000, discountPercent: 15, mode: 'percent' });
    assert.strictEqual(res.discountAmount, 1500);
  });
  runCase('Discount Edge 1: 0% discount', () => {
    const res = calculateDiscount({ originalPrice: 1000, discountPercent: 0, mode: 'percent' });
    assert.strictEqual(res.finalPrice, 1000);
    assert.strictEqual(res.discountAmount, 0);
  });
  runCase('Discount Edge 2: 100% discount (Free)', () => {
    const res = calculateDiscount({ originalPrice: 1000, discountPercent: 100, mode: 'percent' });
    assert.strictEqual(res.finalPrice, 0);
    assert.strictEqual(res.discountAmount, 1000);
  });
  runCase('Discount Edge 3: Flat discount equals price', () => {
    const res = calculateDiscount({ originalPrice: 500, flatDiscount: 500, mode: 'flat' });
    assert.strictEqual(res.finalPrice, 0);
  });
  runCase('Discount Invalid 1: Flat discount exceeds price', () => {
    const res = calculateDiscount({ originalPrice: 500, flatDiscount: 800, mode: 'flat' });
    assert.strictEqual(res.finalPrice, 0);
    assert.strictEqual(res.discountAmount, 500);
  });
  runCase('Discount Invalid 2: Negative price', () => {
    const res = calculateDiscount({ originalPrice: -500, discountPercent: 10 });
    assert.strictEqual(res.finalPrice, 0);
  });

  // =================================================================
  // 19. CASH NOTE COUNTER
  // =================================================================
  console.log('\n[3.4 CASH NOTE COUNTER]');
  runCase('Cash Counter Normal 1: 500x10 + 200x5 + 100x20 = ₹8,000', () => {
    const res = calculateCashDenominations({ quantities: { 500: 10, 200: 5, 100: 20 } });
    assert.strictEqual(res.totalNotes, 35);
    assert.strictEqual(res.grandTotal, 8000);
  });
  runCase('Cash Counter Normal 2: 500x100 = ₹50,000', () => {
    const res = calculateCashDenominations({ quantities: { 500: 100 } });
    assert.strictEqual(res.grandTotal, 50000);
    assert.strictEqual(res.totalNotes, 100);
  });
  runCase('Cash Counter Normal 3: 50x10 + 20x20 + 10x50 = ₹1,400', () => {
    const res = calculateCashDenominations({ quantities: { 50: 10, 20: 20, 10: 50 } });
    assert.strictEqual(res.grandTotal, 1400);
  });
  runCase('Cash Counter Normal 4: Single note of each Indian denomination', () => {
    const res = calculateCashDenominations({ quantities: { 500: 1, 200: 1, 100: 1, 50: 1, 20: 1, 10: 1 } });
    assert.strictEqual(res.grandTotal, 880);
    assert.strictEqual(res.totalNotes, 6);
  });
  runCase('Cash Counter Normal 5: 200x50 = ₹10,000', () => {
    const res = calculateCashDenominations({ quantities: { 200: 50 } });
    assert.strictEqual(res.grandTotal, 10000);
  });
  runCase('Cash Counter Edge 1: Zero notes entered', () => {
    const res = calculateCashDenominations({ quantities: {} });
    assert.strictEqual(res.grandTotal, 0);
    assert.strictEqual(res.totalNotes, 0);
  });
  runCase('Cash Counter Edge 2: 1,000 notes of ₹500', () => {
    const res = calculateCashDenominations({ quantities: { 500: 1000 } });
    assert.strictEqual(res.grandTotal, 500000);
  });
  runCase('Cash Counter Edge 3: Custom denomination handling', () => {
    const res = calculateCashDenominations({ quantities: { 500: 2, 200: 1 } });
    assert.strictEqual(res.grandTotal, 1200);
  });
  runCase('Cash Counter Invalid 1: Negative quantities clamped to 0', () => {
    const res = calculateCashDenominations({ quantities: { 500: -10, 100: 5 } });
    assert.strictEqual(res.grandTotal, 500);
  });
  runCase('Cash Counter Invalid 2: String non-numeric values', () => {
    const res = calculateCashDenominations({ quantities: { 500: 'abc', 100: '2' } });
    assert.strictEqual(res.grandTotal, 200);
  });

  // =================================================================
  // 20. INDIAN NUMBER TO WORDS CONVERTER
  // =================================================================
  console.log('\n[3.5 INDIAN NUMBER TO WORDS CONVERTER]');
  runCase('Words Normal 1: ₹1,250', () => {
    assert.strictEqual(numberToIndianWords(1250), 'One Thousand Two Hundred Fifty Rupees Only');
  });
  runCase('Words Normal 2: ₹1,25,000', () => {
    assert.strictEqual(numberToIndianWords(125000), 'One Lakh Twenty Five Thousand Rupees Only');
  });
  runCase('Words Normal 3: ₹12,50,000', () => {
    assert.strictEqual(numberToIndianWords(1250000), 'Twelve Lakh Fifty Thousand Rupees Only');
  });
  runCase('Words Normal 4: ₹1,00,00,000 (1 Crore)', () => {
    assert.strictEqual(numberToIndianWords(10000000), 'One Crore Rupees Only');
  });
  runCase('Words Normal 5: ₹1,250.50 (with Paise)', () => {
    assert.strictEqual(numberToIndianWords(1250.50), 'One Thousand Two Hundred Fifty Rupees and Fifty Paise Only');
  });
  runCase('Words Edge 1: ₹0', () => {
    assert.strictEqual(numberToIndianWords(0), 'Zero Rupees Only');
  });
  runCase('Words Edge 2: Single Rupee ₹1', () => {
    assert.strictEqual(numberToIndianWords(1), 'One Rupee Only');
  });
  runCase('Words Edge 3: Large Crores ₹25,75,40,250', () => {
    const text = numberToIndianWords(257540250);
    assert.ok(text.includes('Twenty Five Crore'));
    assert.ok(text.includes('Seventy Five Lakh'));
  });
  runCase('Words Invalid 1: Negative number representation', () => {
    assert.strictEqual(numberToIndianWords(-500), 'Minus Five Hundred Rupees Only');
  });
  runCase('Words Invalid 2: Non-numeric string', () => {
    assert.strictEqual(numberToIndianWords('invalid'), 'Zero Rupees Only');
  });

  // =================================================================
  // VALIDATION & FORMATTERS SUITE
  // =================================================================
  console.log('\n[4. VALIDATION & FORMATTING UTILITIES]');
  runCase('Validation 1: validateLoanAmount range checking', () => {
    assert.strictEqual(validateLoanAmount('1000000'), null);
    assert.ok(validateLoanAmount('-500') !== null);
  });
  runCase('Validation 2: validateInterestRate range checking', () => {
    assert.strictEqual(validateInterestRate('10.5'), null);
    assert.ok(validateInterestRate('105') !== null);
  });
  runCase('Validation 3: validateTenure boundary enforcement', () => {
    assert.strictEqual(validateTenure('5', 'years'), null);
    assert.strictEqual(validateTenure('60', 'months'), null);
    assert.ok(validateTenure('0', 'years') !== null);
  });
  runCase('Validation 4: validateFOIR 0-100% enforcement', () => {
    assert.strictEqual(validateFOIR('50'), null);
    assert.ok(validateFOIR('150') !== null);
  });
  runCase('Formatter 1: formatINR formatting', () => {
    assert.strictEqual(formatINR(1250000), '₹12,50,000');
    assert.strictEqual(formatINR(0), '₹0');
  });
  runCase('Formatter 2: formatPercent formatting', () => {
    assert.strictEqual(formatPercent(10.5), '10.5%');
  });

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(`  MASTER VALIDATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterTestSuite();
