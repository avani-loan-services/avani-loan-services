// src/calculators/utils/calculations.js
// ─────────────────────────────────────────────────────────────────
// Core Financial Calculations Engine - Pure & Deterministic
// AVANI LOAN SERVICES Financial Calculator Suite
// ─────────────────────────────────────────────────────────────────

import { parseNumber } from './formatters.js';

// =================================================================
// 1. LOAN CALCULATORS
// =================================================================

/**
 * 1.1 EMI Calculator
 * Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEMI({ principal = 0, rate = 0, tenure = 0, tenureUnit = 'years' }) {
  const P = Math.max(0, parseNumber(principal));
  const annualRate = Math.max(0, parseNumber(rate));
  const rawTenure = Math.max(0, parseNumber(tenure));
  const n = tenureUnit === 'years' ? Math.round(rawTenure * 12) : Math.round(rawTenure);

  if (P === 0 || n === 0) {
    return {
      monthlyEmi: 0,
      principal: P,
      totalInterest: 0,
      totalRepayment: P,
      principalPercent: 100,
      interestPercent: 0,
      totalMonths: n,
    };
  }

  const r = annualRate / (12 * 100);

  let emi = 0;
  if (r === 0) {
    emi = P / n;
  } else {
    const factor = Math.pow(1 + r, n);
    emi = (P * r * factor) / (factor - 1);
  }

  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - P);
  const principalPercent = totalRepayment > 0 ? (P / totalRepayment) * 100 : 100;
  const interestPercent = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;

  return {
    monthlyEmi: emi,
    principal: P,
    totalInterest,
    totalRepayment,
    principalPercent,
    interestPercent,
    totalMonths: n,
  };
}

/**
 * Generate full monthly / yearly amortization schedule
 */
export function generateAmortizationSchedule({ principal = 0, rate = 0, tenure = 0, tenureUnit = 'years' }) {
  const { monthlyEmi, totalMonths, principal: P } = calculateEMI({ principal, rate, tenure, tenureUnit });
  if (P === 0 || totalMonths === 0 || monthlyEmi === 0) return { monthly: [], yearly: [] };

  const annualRate = parseNumber(rate);
  const r = annualRate / (12 * 100);

  let balance = P;
  const monthly = [];
  const yearlyMap = new Map();

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = r > 0 ? balance * r : 0;
    const principalPayment = Math.min(balance, monthlyEmi - interestPayment);
    balance = Math.max(0, balance - principalPayment);

    monthly.push({
      month: m,
      emi: monthlyEmi,
      principalPaid: principalPayment,
      interestPaid: interestPayment,
      closingBalance: balance,
    });

    const yearNumber = Math.ceil(m / 12);
    if (!yearlyMap.has(yearNumber)) {
      yearlyMap.set(yearNumber, {
        year: yearNumber,
        principalPaid: 0,
        interestPaid: 0,
        totalPaid: 0,
        closingBalance: balance,
      });
    }

    const y = yearlyMap.get(yearNumber);
    y.principalPaid += principalPayment;
    y.interestPaid += interestPayment;
    y.totalPaid += principalPayment + interestPayment;
    y.closingBalance = balance;
  }

  return {
    monthly,
    yearly: Array.from(yearlyMap.values()),
  };
}

/**
 * 1.2 Eligibility Calculator - FOIR Method
 */
export function calculateFOIREligibility({
  monthlyIncome = 0,
  existingEmi = 0,
  foirPercent = 50,
  rate = 10,
  tenureYears = 15,
}) {
  const income = Math.max(0, parseNumber(monthlyIncome));
  const obligations = Math.max(0, parseNumber(existingEmi));
  const foir = Math.min(100, Math.max(0, parseNumber(foirPercent, 50)));
  const annualRate = Math.max(0, parseNumber(rate, 10));
  const tenure = Math.max(0, parseNumber(tenureYears, 15));
  const n = tenure * 12;

  const maxPermissibleEmi = (income * foir) / 100;
  const availableEmi = Math.max(0, maxPermissibleEmi - obligations);

  let eligibleLoanAmount = 0;
  if (availableEmi > 0 && n > 0) {
    const r = annualRate / (12 * 100);
    if (r === 0) {
      eligibleLoanAmount = availableEmi * n;
    } else {
      const factor = Math.pow(1 + r, n);
      eligibleLoanAmount = availableEmi * ((factor - 1) / (r * factor));
    }
  }

  return {
    monthlyIncome: income,
    existingEmi: obligations,
    foirPercent: foir,
    maxPermissibleEmi,
    availableEmi,
    eligibleLoanAmount: Math.round(eligibleLoanAmount),
    tenureYears: tenure,
    rate: annualRate,
  };
}

/**
 * 1.3 Eligibility Calculator - Multiplier Method
 */
export function calculateMultiplierEligibility({
  income = 0,
  incomeType = 'monthly',
  multiplier = 60,
  existingEmi = 0,
  rate = 10,
  tenureYears = 15,
}) {
  const parsedIncome = Math.max(0, parseNumber(income));
  const mult = Math.max(0, parseNumber(multiplier, 60));
  const obligations = Math.max(0, parseNumber(existingEmi));
  const annualRate = Math.max(0, parseNumber(rate, 10));
  const tenure = Math.max(0, parseNumber(tenureYears, 15));
  const n = tenure * 12;

  const grossEligibleAmount = parsedIncome * mult;

  // Deduction in loan capacity due to existing EMI load
  let existingCapacityDeduction = 0;
  if (obligations > 0 && n > 0) {
    const r = annualRate / (12 * 100);
    if (r === 0) {
      existingCapacityDeduction = obligations * n;
    } else {
      const factor = Math.pow(1 + r, n);
      existingCapacityDeduction = obligations * ((factor - 1) / (r * factor));
    }
  }

  const netEligibleAmount = Math.max(0, Math.round(grossEligibleAmount - existingCapacityDeduction));
  const { monthlyEmi } = calculateEMI({ principal: netEligibleAmount, rate: annualRate, tenure, tenureUnit: 'years' });

  return {
    income: parsedIncome,
    incomeType,
    multiplier: mult,
    grossEligibleAmount: Math.round(grossEligibleAmount),
    existingCapacityDeduction: Math.round(existingCapacityDeduction),
    netEligibleAmount,
    estimatedMonthlyEmi: monthlyEmi,
  };
}

/**
 * 1.4 Outstanding Loan Calculator
 */
export function calculateOutstandingLoan({
  originalAmount = 0,
  rate = 0,
  originalTenureYears = 0,
  emi = 0,
  emisPaid = 0,
}) {
  const P = Math.max(0, parseNumber(originalAmount));
  const annualRate = Math.max(0, parseNumber(rate));
  const totalMonths = Math.round(Math.max(0, parseNumber(originalTenureYears)) * 12);
  const k = Math.min(totalMonths, Math.max(0, Math.round(parseNumber(emisPaid))));

  const calculated = calculateEMI({ principal: P, rate: annualRate, tenure: totalMonths, tenureUnit: 'months' });
  const monthlyEmi = parseNumber(emi) > 0 ? parseNumber(emi) : calculated.monthlyEmi;

  const r = annualRate / (12 * 100);

  let balance = P;
  let principalPaid = 0;
  let interestPaid = 0;

  for (let m = 1; m <= k; m++) {
    const interest = r > 0 ? balance * r : 0;
    const principal = Math.min(balance, monthlyEmi - interest);
    balance = Math.max(0, balance - principal);
    principalPaid += principal;
    interestPaid += interest;
  }

  const remainingTenure = Math.max(0, totalMonths - k);
  const remainingInterest = Math.max(0, (monthlyEmi * remainingTenure) - balance);

  return {
    originalAmount: P,
    monthlyEmi,
    emisPaid: k,
    outstandingPrincipal: Math.round(balance),
    totalPrincipalPaid: Math.round(principalPaid),
    totalInterestPaid: Math.round(interestPaid),
    remainingTenureMonths: remainingTenure,
    remainingInterest: Math.round(remainingInterest),
  };
}

/**
 * 1.5 Foreclosure Calculator
 */
export function calculateForeclosure({
  outstandingPrincipal = 0,
  foreclosureChargePercent = 2,
  gstPercent = 18,
  otherCharges = 0,
}) {
  const principal = Math.max(0, parseNumber(outstandingPrincipal));
  const chargeRate = Math.max(0, parseNumber(foreclosureChargePercent));
  const gstRate = Math.max(0, parseNumber(gstPercent));
  const extras = Math.max(0, parseNumber(otherCharges));

  const foreclosureFee = (principal * chargeRate) / 100;
  const gstOnFee = (foreclosureFee * gstRate) / 100;
  const totalSettlement = principal + foreclosureFee + gstOnFee + extras;

  return {
    outstandingPrincipal: principal,
    foreclosureChargePercent: chargeRate,
    foreclosureFee,
    gstPercent: gstRate,
    gstAmount: gstOnFee,
    otherCharges: extras,
    totalSettlementAmount: totalSettlement,
  };
}

/**
 * 1.6 Overdraft Calculator
 */
export function calculateOverdraft({
  sanctionedLimit = 0,
  amountUtilized = 0,
  rate = 12,
  daysUtilized = 30,
  otherCharges = 0,
}) {
  const limit = Math.max(0, parseNumber(sanctionedLimit));
  const utilized = Math.min(limit > 0 ? limit : Infinity, Math.max(0, parseNumber(amountUtilized)));
  const annualRate = Math.max(0, parseNumber(rate));
  const days = Math.max(0, parseNumber(daysUtilized));
  const charges = Math.max(0, parseNumber(otherCharges));

  const availableLimit = Math.max(0, limit - utilized);
  const estimatedInterest = (utilized * (annualRate / 100) * days) / 365;
  const totalCost = estimatedInterest + charges;

  return {
    sanctionedLimit: limit,
    amountUtilized: utilized,
    availableLimit,
    rate: annualRate,
    daysUtilized: days,
    estimatedInterest,
    otherCharges: charges,
    totalEstimatedCost: totalCost,
  };
}

/**
 * 1.7 Loan Comparison Calculator
 */
export function calculateLoanComparison({ loanA = {}, loanB = {} }) {
  const calcSingle = (loan) => {
    const amount = Math.max(0, parseNumber(loan.amount));
    const rate = Math.max(0, parseNumber(loan.rate));
    const tenureYears = Math.max(0, parseNumber(loan.tenureYears));
    const feePercent = Math.max(0, parseNumber(loan.processingFeePercent));
    const flatFee = Math.max(0, parseNumber(loan.processingFeeFlat));
    const otherCharges = Math.max(0, parseNumber(loan.otherCharges));

    const { monthlyEmi, totalInterest, totalRepayment } = calculateEMI({
      principal: amount,
      rate,
      tenure: tenureYears,
      tenureUnit: 'years',
    });

    const totalProcessingFee = (amount * feePercent) / 100 + flatFee;
    const totalCost = totalRepayment + totalProcessingFee + otherCharges;

    return {
      amount,
      rate,
      tenureYears,
      monthlyEmi,
      totalInterest,
      totalProcessingFee,
      otherCharges,
      totalCost,
    };
  };

  const a = calcSingle(loanA);
  const b = calcSingle(loanB);

  const emiDiff = Math.abs(a.monthlyEmi - b.monthlyEmi);
  const interestDiff = Math.abs(a.totalInterest - b.totalInterest);
  const totalCostDiff = Math.abs(a.totalCost - b.totalCost);

  let betterLoan = 'Equal';
  if (a.totalCost < b.totalCost) betterLoan = 'Loan A';
  else if (b.totalCost < a.totalCost) betterLoan = 'Loan B';

  return {
    loanA: a,
    loanB: b,
    emiDifference: emiDiff,
    interestDifference: interestDiff,
    totalCostDifference: totalCostDiff,
    betterLoan,
  };
}

/**
 * 1.8 Prepayment Calculator
 */
export function calculatePrepayment({
  outstandingPrincipal = 0,
  rate = 0,
  remainingTenureMonths = 0,
  currentEmi = 0,
  prepaymentAmount = 0,
  option = 'reduce_tenure', // 'reduce_tenure' or 'reduce_emi'
}) {
  const P = Math.max(0, parseNumber(outstandingPrincipal));
  const annualRate = Math.max(0, parseNumber(rate));
  const n = Math.max(0, Math.round(parseNumber(remainingTenureMonths)));
  const lumpSum = Math.min(P, Math.max(0, parseNumber(prepaymentAmount)));

  const baseline = calculateEMI({ principal: P, rate: annualRate, tenure: n, tenureUnit: 'months' });
  const emi = parseNumber(currentEmi) > 0 ? parseNumber(currentEmi) : baseline.monthlyEmi;

  const originalTotalInterest = Math.max(0, (emi * n) - P);
  const newPrincipal = Math.max(0, P - lumpSum);

  const r = annualRate / (12 * 100);

  if (newPrincipal === 0) {
    return {
      withoutPrepayment: {
        outstandingPrincipal: P,
        monthlyEmi: emi,
        remainingTenureMonths: n,
        totalInterest: originalTotalInterest,
        totalCost: P + originalTotalInterest,
      },
      withPrepayment: {
        newPrincipal: 0,
        monthlyEmi: 0,
        newTenureMonths: 0,
        totalInterest: 0,
        totalCost: lumpSum,
      },
      interestSaved: originalTotalInterest,
      tenureSavedMonths: n,
      monthlyEmiSaved: emi,
      prepaymentAmount: lumpSum,
      option,
    };
  }

  if (option === 'reduce_tenure') {
    // Keep same monthly EMI, reduce tenure
    let newMonths = 0;
    if (r === 0) {
      newMonths = Math.ceil(newPrincipal / emi);
    } else {
      const top = Math.log(emi / (emi - newPrincipal * r));
      const bottom = Math.log(1 + r);
      newMonths = Math.ceil(top / bottom);
    }

    const newTotalInterest = Math.max(0, (emi * newMonths) - newPrincipal);
    const interestSaved = Math.max(0, originalTotalInterest - newTotalInterest);
    const tenureSavedMonths = Math.max(0, n - newMonths);

    return {
      withoutPrepayment: {
        outstandingPrincipal: P,
        monthlyEmi: emi,
        remainingTenureMonths: n,
        totalInterest: originalTotalInterest,
        totalCost: P + originalTotalInterest,
      },
      withPrepayment: {
        newPrincipal,
        monthlyEmi: emi,
        newTenureMonths: newMonths,
        totalInterest: newTotalInterest,
        totalCost: newPrincipal + newTotalInterest + lumpSum,
      },
      interestSaved,
      tenureSavedMonths,
      monthlyEmiSaved: 0,
      prepaymentAmount: lumpSum,
      option,
    };
  } else {
    // Option: 'reduce_emi' - Keep same tenure, reduce monthly EMI
    const newCalc = calculateEMI({ principal: newPrincipal, rate: annualRate, tenure: n, tenureUnit: 'months' });
    const newEmi = newCalc.monthlyEmi;
    const newTotalInterest = Math.max(0, (newEmi * n) - newPrincipal);
    const interestSaved = Math.max(0, originalTotalInterest - newTotalInterest);
    const monthlyEmiSaved = Math.max(0, emi - newEmi);

    return {
      withoutPrepayment: {
        outstandingPrincipal: P,
        monthlyEmi: emi,
        remainingTenureMonths: n,
        totalInterest: originalTotalInterest,
        totalCost: P + originalTotalInterest,
      },
      withPrepayment: {
        newPrincipal,
        monthlyEmi: newEmi,
        newTenureMonths: n,
        totalInterest: newTotalInterest,
        totalCost: newPrincipal + newTotalInterest + lumpSum,
      },
      interestSaved,
      tenureSavedMonths: 0,
      monthlyEmiSaved,
      prepaymentAmount: lumpSum,
      option,
    };
  }
}

/**
 * 1.9 Rate Change Calculator
 */
export function calculateRateChange({
  outstandingPrincipal = 0,
  currentRate = 0,
  newRate = 0,
  remainingTenureMonths = 0,
  currentEmi = 0,
}) {
  const P = Math.max(0, parseNumber(outstandingPrincipal));
  const currRate = Math.max(0, parseNumber(currentRate));
  const nextRate = Math.max(0, parseNumber(newRate));
  const n = Math.max(0, Math.round(parseNumber(remainingTenureMonths)));

  const currentCalc = calculateEMI({ principal: P, rate: currRate, tenure: n, tenureUnit: 'months' });
  const currEmi = parseNumber(currentEmi) > 0 ? parseNumber(currentEmi) : currentCalc.monthlyEmi;
  const currentTotalInterest = Math.max(0, (currEmi * n) - P);

  // Scenario 1: Same tenure, revised EMI
  const newCalc = calculateEMI({ principal: P, rate: nextRate, tenure: n, tenureUnit: 'months' });
  const newEmi = newCalc.monthlyEmi;
  const newTotalInterest = Math.max(0, (newEmi * n) - P);

  const emiDifference = newEmi - currEmi;
  const interestDifference = newTotalInterest - currentTotalInterest;

  // Scenario 2: Same EMI, revised tenure
  let revisedTenureMonths = n;
  const rNext = nextRate / (12 * 100);
  if (rNext > 0 && currEmi > P * rNext) {
    const top = Math.log(currEmi / (currEmi - P * rNext));
    const bottom = Math.log(1 + rNext);
    revisedTenureMonths = Math.ceil(top / bottom);
  }

  return {
    outstandingPrincipal: P,
    currentRate: currRate,
    newRate: nextRate,
    remainingTenureMonths: n,
    currentEmi: currEmi,
    currentTotalInterest,
    newEmi,
    newTotalInterest,
    emiDifference,
    interestDifference,
    revisedTenureMonths,
    tenureDifferenceMonths: revisedTenureMonths - n,
  };
}

/**
 * 1.10 GST on Interest / Charges Calculator
 */
export function calculateGSTOnInterest({ baseAmount = 0, gstRate = 18 }) {
  const base = Math.max(0, parseNumber(baseAmount));
  const rate = Math.max(0, parseNumber(gstRate));
  const gst = (base * rate) / 100;
  const total = base + gst;

  return {
    baseAmount: base,
    gstRate: rate,
    gstAmount: gst,
    cgstAmount: gst / 2,
    sgstAmount: gst / 2,
    totalAmount: total,
  };
}

// =================================================================
// 2. INVESTMENT CALCULATORS
// =================================================================

/**
 * 2.1 Fixed Deposit (FD) Calculator
 * A = P * (1 + r/n)^(n*t)
 */
export function calculateFD({
  principal = 0,
  rate = 0,
  tenureMonths = 0,
  compoundingFrequency = 'quarterly', // 'monthly'=12, 'quarterly'=4, 'half_yearly'=2, 'yearly'=1
}) {
  const P = Math.max(0, parseNumber(principal));
  const annualRate = Math.max(0, parseNumber(rate));
  const months = Math.max(0, parseNumber(tenureMonths));
  const t = months / 12;

  const freqMap = {
    monthly: 12,
    quarterly: 4,
    half_yearly: 2,
    yearly: 1,
  };
  const n = freqMap[compoundingFrequency] || 4;

  let maturityAmount = P;
  if (P > 0 && t > 0) {
    if (annualRate === 0) {
      maturityAmount = P;
    } else {
      const r = annualRate / 100;
      maturityAmount = P * Math.pow(1 + r / n, n * t);
    }
  }

  const interestEarned = Math.max(0, maturityAmount - P);

  return {
    principal: P,
    rate: annualRate,
    tenureMonths: months,
    compoundingFrequency,
    maturityAmount,
    interestEarned,
  };
}

/**
 * 2.2 Recurring Deposit (RD) Calculator
 * Standard Indian quarterly compounding
 */
export function calculateRD({
  monthlyDeposit = 0,
  rate = 0,
  tenureMonths = 0,
}) {
  const P = Math.max(0, parseNumber(monthlyDeposit));
  const annualRate = Math.max(0, parseNumber(rate));
  const N = Math.max(0, Math.round(parseNumber(tenureMonths)));

  const totalDeposit = P * N;
  let maturityAmount = totalDeposit;

  if (P > 0 && N > 0 && annualRate > 0) {
    const r = annualRate / 100;
    // Monthly deposit compounded quarterly: each installment deposits for remaining months
    let sum = 0;
    for (let k = 1; k <= N; k++) {
      const remainingYears = (N - k + 1) / 12;
      sum += P * Math.pow(1 + r / 4, 4 * remainingYears);
    }
    maturityAmount = sum;
  }

  const interestEarned = Math.max(0, maturityAmount - totalDeposit);

  return {
    monthlyDeposit: P,
    rate: annualRate,
    tenureMonths: N,
    totalDeposit,
    maturityAmount,
    interestEarned,
  };
}

/**
 * 2.3 SIP Calculator
 * M = P * ((1+i)^n - 1) / i * (1+i)
 */
export function calculateSIP({
  monthlyInvestment = 0,
  rate = 12,
  tenureYears = 5,
}) {
  const P = Math.max(0, parseNumber(monthlyInvestment));
  const annualRate = Math.max(0, parseNumber(rate));
  const years = Math.max(0, parseNumber(tenureYears));
  const n = Math.round(years * 12);

  const totalInvestment = P * n;

  if (P === 0 || n === 0) {
    return {
      monthlyInvestment: P,
      expectedReturnRate: annualRate,
      tenureYears: years,
      totalInvestment,
      estimatedReturns: 0,
      maturityValue: totalInvestment,
      investmentPercent: 100,
      returnsPercent: 0,
    };
  }

  const i = annualRate / (12 * 100);
  let maturityValue = totalInvestment;

  if (i > 0) {
    maturityValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }

  const estimatedReturns = Math.max(0, maturityValue - totalInvestment);
  const investmentPercent = maturityValue > 0 ? (totalInvestment / maturityValue) * 100 : 100;
  const returnsPercent = maturityValue > 0 ? (estimatedReturns / maturityValue) * 100 : 0;

  return {
    monthlyInvestment: P,
    expectedReturnRate: annualRate,
    tenureYears: years,
    totalInvestment,
    estimatedReturns,
    maturityValue,
    investmentPercent,
    returnsPercent,
  };
}

/**
 * 2.4 Interest Calculator (Simple & Compound)
 */
export function calculateInterest({
  principal = 0,
  rate = 0,
  timeYears = 0,
  isCompound = false,
  compoundingFrequency = 'yearly',
}) {
  const P = Math.max(0, parseNumber(principal));
  const R = Math.max(0, parseNumber(rate));
  const T = Math.max(0, parseNumber(timeYears));

  let interest = 0;
  let finalAmount = P;

  if (!isCompound) {
    interest = (P * R * T) / 100;
    finalAmount = P + interest;
  } else {
    const freqMap = {
      monthly: 12,
      quarterly: 4,
      half_yearly: 2,
      yearly: 1,
    };
    const n = freqMap[compoundingFrequency] || 1;
    const r = R / 100;
    const rawFinal = P * Math.pow(1 + r / n, n * T);
    finalAmount = Math.round((rawFinal + Number.EPSILON) * 100) / 100;
    interest = Math.max(0, Math.round((finalAmount - P + Number.EPSILON) * 100) / 100);
  }

  return {
    principal: P,
    rate: R,
    timeYears: T,
    isCompound,
    compoundingFrequency,
    interest,
    finalAmount,
  };
}

/**
 * 2.5 Public Provident Fund (PPF) Calculator
 */
export function calculatePPF({
  initialAmount = 0,
  annualContribution = 0,
  rate = 7.1,
  tenureYears = 15,
}) {
  const opening = Math.max(0, parseNumber(initialAmount));
  const annual = Math.min(150000, Math.max(0, parseNumber(annualContribution)));
  const annualRate = Math.max(0, parseNumber(rate, 7.1));
  const years = Math.max(1, Math.round(parseNumber(tenureYears, 15)));

  let balance = opening;
  let totalContribution = opening;
  const yearlySchedule = [];

  for (let y = 1; y <= years; y++) {
    const contributionThisYear = annual;
    const openingBal = balance;
    balance += contributionThisYear;
    totalContribution += contributionThisYear;

    const interestThisYear = (balance * annualRate) / 100;
    balance += interestThisYear;

    yearlySchedule.push({
      year: y,
      openingBalance: openingBal,
      deposited: contributionThisYear,
      interestEarned: interestThisYear,
      closingBalance: balance,
    });
  }

  const totalInterest = Math.max(0, balance - totalContribution);

  return {
    initialAmount: opening,
    annualContribution: annual,
    rate: annualRate,
    tenureYears: years,
    totalContribution,
    estimatedInterest: totalInterest,
    maturityAmount: balance,
    yearlySchedule,
  };
}

// =================================================================
// 3. OTHER FINANCIAL TOOLS
// =================================================================

/**
 * 3.1 GST Calculator (Add / Remove GST)
 */
export function calculateGST({
  amount = 0,
  gstRate = 18,
  mode = 'add', // 'add' or 'remove'
}) {
  const amt = Math.max(0, parseNumber(amount));
  const rate = Math.max(0, parseNumber(gstRate));

  let baseAmount = 0;
  let gstAmount = 0;
  let finalAmount = 0;

  if (mode === 'add') {
    baseAmount = amt;
    gstAmount = (amt * rate) / 100;
    finalAmount = baseAmount + gstAmount;
  } else {
    // mode: 'remove'
    finalAmount = amt;
    baseAmount = amt / (1 + rate / 100);
    gstAmount = finalAmount - baseAmount;
  }

  return {
    amount: amt,
    gstRate: rate,
    mode,
    baseAmount,
    gstAmount,
    cgstAmount: gstAmount / 2,
    sgstAmount: gstAmount / 2,
    finalAmount,
  };
}

/**
 * 3.2 Profit & Margin Calculator
 */
export function calculateProfitLoss({
  costPrice = 0,
  sellingPrice = 0,
}) {
  const cp = Math.max(0, parseNumber(costPrice));
  const sp = Math.max(0, parseNumber(sellingPrice));

  const diff = sp - cp;
  const isProfit = diff >= 0;
  const amount = Math.abs(diff);

  const profitLossPercent = cp > 0 ? Math.abs((diff / cp) * 100) : 0;
  const marginPercent = sp > 0 ? Math.abs((diff / sp) * 100) : 0;
  const signedProfitPercent = cp > 0 ? (diff / cp) * 100 : 0;

  return {
    costPrice: cp,
    sellingPrice: sp,
    isProfit,
    type: isProfit ? 'Profit' : 'Loss',
    amount,
    profitLossPercent,
    marginPercent,
    signedProfitPercent,
  };
}

/**
 * 3.3 Discount Calculator
 */
export function calculateDiscount({
  originalPrice = 0,
  discountPercent = 0,
  discountAmount = 0,
  flatDiscount = 0,
  mode = 'percent', // 'percent', 'amount', or 'flat'
}) {
  const price = Math.max(0, parseNumber(originalPrice));

  let discAmt = 0;
  let discPct = 0;

  const rawFlat = parseNumber(flatDiscount) || parseNumber(discountAmount);

  if (mode === 'percent') {
    discPct = Math.min(100, Math.max(0, parseNumber(discountPercent)));
    discAmt = (price * discPct) / 100;
  } else {
    discAmt = Math.min(price, Math.max(0, rawFlat));
    discPct = price > 0 ? (discAmt / price) * 100 : 0;
  }

  const finalPrice = Math.max(0, price - discAmt);

  return {
    originalPrice: price,
    discountPercent: discPct,
    discountAmount: discAmt,
    flatDiscount: discAmt,
    finalPrice,
    amountSaved: discAmt,
    mode,
  };
}

/**
 * 3.4 Cash Note Counter (Denomination Calculator)
 */
export function calculateCashDenominations({ quantities = {} }) {
  const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

  let totalNotes = 0;
  let grandTotal = 0;

  const breakdown = denominations.map((denom) => {
    const qty = Math.max(0, Math.round(parseNumber(quantities[denom], 0)));
    const total = denom * qty;
    totalNotes += qty;
    grandTotal += total;
    return {
      denomination: denom,
      quantity: qty,
      total,
    };
  });

  return {
    breakdown,
    totalNotes,
    grandTotal,
  };
}
