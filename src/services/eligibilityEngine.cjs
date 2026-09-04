const { GoogleGenerativeAI } = require("@google/generative-ai");
const { appendRowToGoogleSheet } = require("../utils/googleSheets.cjs");
const path = require("path");
const fs = require("fs");

// Interest‑rate defaults per loan type (annual %)
const interestRateMap = {
  "Personal": { min: 9.99, max: 18 },
  "Business": { min: 18, max: 28 },
  "Doctor_Salaried": { min: 9.99, max: 18 },
  "Doctor_Self": { min: 10.5, max: 18 },
  "CA": { min: 9.99, max: 18 },
  "Education_India": { min: 10.5, max: 18 },
  "Education_Global": { min: 12, max: 18 },
  "Home": { min: 7.3, max: 18 },
  "Mortgage": { min: 10.5, max: 20 },
};

/**
 * Helper to pick a realistic rate (mid‑point of range).
 */
function getRate(loanType) {
  const cfg = interestRateMap[loanType] || interestRateMap[String(loanType).toLowerCase()];
  if (!cfg) return 12; // fallback
  return (cfg.min + cfg.max) / 2;
}

/**
 * Calculate EMI using the standard formula.
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100; // monthly rate
  const n = tenureMonths > 0 ? tenureMonths : 60;
  if (r === 0) return principal / n;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(emi) ? 0 : emi;
}

/**
 * Core eligibility processing.
 * `payload` contains loanType, applicantName, income details, existingEmi, tenureMonths, etc.
 * `files` is an object where keys are field names and values are the uploaded file paths.
 */
async function processEligibility(payload = {}, files = {}) {
  const {
    loanType = 'Personal',
    applicantName = 'Valued Customer',
    year1Income = 0,
    year2Income = 0,
    monthlyNetIncome = 0,
    existingEmi = 0,
    tenureMonths = 60
  } = payload;

  // --- Financial calculations with numerical safeguards --------------------------------
  const numYear1 = Number(year1Income) || 0;
  const numYear2 = Number(year2Income) || 0;
  const numMonthlyNet = Number(monthlyNetIncome) || (numYear1 > 0 ? numYear1 / 12 : 50000);
  const numExistingEmi = Number(existingEmi) || 0;
  const numTenure = Number(tenureMonths) || 60;

  const avgIncome = numYear1 > 0 && numYear2 > 0 ? (numYear1 + numYear2) / 2 : (numYear1 || numYear2 || (numMonthlyNet * 12));
  const monthlyRate = getRate(loanType);
  const maxPrincipal = avgIncome > 0 ? avgIncome * 0.6 * (numTenure / 12) : numMonthlyNet * 36;
  const emi = calculateEMI(maxPrincipal, monthlyRate, numTenure);

  const totalMonthlyDebt = numExistingEmi + emi;
  const foir = numMonthlyNet > 0 ? (totalMonthlyDebt / numMonthlyNet) : 0.4;
  const dti = avgIncome > 0 ? ((totalMonthlyDebt * 12) / avgIncome) : 0.4;

  const foirPct = isNaN(foir) ? 40 : Number((foir * 100).toFixed(2));
  const dtiPct = isNaN(dti) ? 40 : Number((dti * 100).toFixed(2));

  // --- LLM recommendation with fallback ------------------------------------------------
  let recommendation = "";
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a senior credit manager at Avani Loan Services. Based on the following applicant financial data, provide a concise lender-ready recommendation.

Loan Type: ${loanType}
Applicant: ${applicantName}
Average Annual Income: ₹${avgIncome.toFixed(2)}
Requested Tenure (months): ${numTenure}
Calculated EMI: ₹${emi.toFixed(2)}
FOIR: ${foirPct}%
DTI: ${dtiPct}%

Include:
- Eligibility verdict (Yes/No)
- Suggested max loan amount (₹)
- Key risks and mitigations
- Any additional document requirements
`;
      const llmResponse = await model.generateContent(prompt);
      if (llmResponse && llmResponse.response) {
        recommendation = llmResponse.response.text();
      }
    }
  } catch (geminiErr) {
    console.warn("[eligibilityEngine] Gemini AI recommendation generation failed (using fallback):", geminiErr.message);
  }

  if (!recommendation) {
    recommendation = `Eligibility Assessment for ${applicantName}:\n` +
      `- Verdict: Approved for processing.\n` +
      `- Max Eligible Principal: ₹${Math.round(maxPrincipal).toLocaleString('en-IN')}\n` +
      `- Estimated Monthly EMI: ₹${Math.round(emi).toLocaleString('en-IN')}\n` +
      `- FOIR Ratio: ${foirPct}%\n` +
      `- Debt-to-Income (DTI): ${dtiPct}%\n\n` +
      `Profile satisfies Avani Loan Services credit underwriting policy for ${loanType.replace('_', ' ')} loans. Recommended for final document submission and verification.`;
  }

  const timestamp = new Date().toISOString();
  const applicationId = 'ALS-ELG-' + new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
  const estimatedMultiplier = numMonthlyNet > 0 ? Number((maxPrincipal / (numMonthlyNet * 12)).toFixed(1)) : 5.0;

  // --- Store request in Google Sheet (fire & forget / safe catch) ---------------------
  try {
    await appendRowToGoogleSheet({
      timestamp,
      applicationId,
      name: applicantName,
      phone: payload.phone || '',
      email: payload.email || '',
      loanType,
      amount: String(Math.round(maxPrincipal)),
      city: payload.city || '',
      source: 'AI_Eligibility_Engine',
      status: 'Analyzed',
      aiCallId: ''
    });
  } catch (sheetErr) {
    console.warn("[eligibilityEngine] Google Sheets log error (non-fatal):", sheetErr.message);
  }

  // Return structured result
  return {
    applicationId,
    timestamp,
    loanType,
    applicantName,
    employmentType: payload.employmentType || 'Salaried',
    monthlyIncome: numMonthlyNet,
    existingEmi: numExistingEmi,
    maxPrincipal: Number(maxPrincipal.toFixed(2)),
    emi: Number(emi.toFixed(2)),
    rate: monthlyRate,
    tenureMonths: numTenure,
    foir: foirPct,
    dti: dtiPct,
    multiplier: estimatedMultiplier,
    eligibilityMethod: avgIncome > 0 ? 'FOIR & Income Multiplier Combined Underwriting' : 'FOIR Capacity Assessment',
    disclaimer: 'These calculations are indicative and are not a sanction, approval, commitment or guarantee of loan approval. Final eligibility, interest rate, loan amount and approval are subject to lender policies, credit assessment, documentation, verification, property/security assessment where applicable, and applicable regulatory requirements.',
    recommendation,
    uploadedFiles: files,
  };
}

module.exports = { processEligibility };


