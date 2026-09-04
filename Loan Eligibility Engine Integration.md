# Loan Eligibility Engine Integration

## Goal
Implement a full‑featured AI‑driven loan eligibility engine as described in the **MASTER PROFESSIONAL PROMPT**. The engine will:
- Collect required applicant information and uploaded documents.
- Validate documents per loan product.
- Perform financial calculations (FOIR, DTI, EMI, LTV, etc.) using the provided interest‑rate defaults.
- Call the Gemini LLM (API key provided) for supplemental analysis and recommendation generation.
- Append each request as a new row in the Google Sheet (environment variable `GOOGLE_SHEETS_ID`).
- Store uploaded files locally under `uploads/`.
- Keep the Google service‑account JSON in the environment variable `GOOGLE_SERVICE_ACCOUNT_JSON`.
- Deploy automatically to Vercel and push changes to GitHub.

## User Review Required
> **[IMPORTANT]** This change introduces new dependencies (`multer`, `@google/generative-ai`, `dotenv`) and new server‑side API routes. It also modifies environment‑variable handling for Google credentials. Ensure your deployment environment (Vercel) has the following variables set:
> - `GOOGLE_SHEETS_ID`
> - `GOOGLE_SERVICE_ACCOUNT_JSON` (full JSON string)
> - `GEMINI_API_KEY` (the provided key)
> - Any other existing env vars required by the app.

## Open Questions
> **[NONE]** – All required information was supplied in the latest user request.

## Proposed Changes
---
### Backend Services
#### [NEW] src/services/eligibilityEngine.cjs
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSheetsService } from "../utils/googleSheets.cjs";
import path from "path";
import fs from "fs";

// Interest‑rate defaults per loan type (annual %)
const interestRateMap = {
  "personal": { min: 9.99, max: 18 },
  "business_unsecured": { min: 18, max: 28 },
  "doctor_salaried": { min: 9.99, max: 18 },
  "doctor_self": { min: 10.5, max: 18 },
  "ca": { min: 9.99, max: 18 },
  "education_unsecured": { min: 10.5, max: 18 },
  "education_secured": { min: 12, max: 18 },
  "home": { min: 7.3, max: 18 },
  "mortgage": { min: 10.5, max: 20 },
};

/**
 * Helper to pick a realistic rate (mid‑point of range).
 */
function getRate(loanType) {
  const cfg = interestRateMap[loanType];
  if (!cfg) return 12; // fallback
  return (cfg.min + cfg.max) / 2;
}

/**
 * Calculate EMI using the standard formula.
 */
function calculateEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100; // monthly rate
  const n = tenureMonths;
  if (r === 0) return principal / n;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi;
}

/**
 * Core eligibility processing.
 * `payload` contains loanType, applicantName, income details, existingEmi, tenureMonths, etc.
 * `files` is an object where keys are field names and values are the uploaded file paths.
 */
export async function processEligibility(payload, files) {
  const { loanType, applicantName, year1Income, year2Income, monthlyNetIncome, existingEmi, tenureMonths } = payload;

  // --- Simple financial calculations -------------------------------------------------
  const avgIncome = (Number(year1Income) + Number(year2Income)) / 2;
  const monthlyRate = getRate(loanType);
  const maxPrincipal = avgIncome * 12 * 0.6; // arbitrary rule: up to 60% of annual avg income
  const emi = calculateEMI(maxPrincipal, monthlyRate, Number(tenureMonths));

  const foir = (existingEmi + emi) / monthlyNetIncome; // fraction of income used for repayments
  const dti = (existingEmi + emi) / avgIncome; // annual debt‑to‑income

  // --- LLM recommendation ----------------------------------------------------------
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `You are a senior credit manager. Based on the following data, provide a concise lender‑ready recommendation.

Loan Type: ${loanType}
Applicant: ${applicantName}
Average Annual Income: ${avgIncome}
Requested Tenure (months): ${tenureMonths}
Calculated EMI: ${emi.toFixed(2)}
FOIR: ${(foir * 100).toFixed(2)} %
DTI: ${(dti * 100).toFixed(2)} %

Include:
- Eligibility verdict (Yes/No)
- Suggested loan amount (₹)
- Key risks and mitigations
- Any additional document requirements
`;
  const llmResponse = await model.generateContent(prompt);
  const recommendation = llmResponse.response.text();

  // --- Store request in Google Sheet ------------------------------------------------
  const sheets = await getSheetsService();
  const timestamp = new Date().toISOString();
  await sheets.appendRowToGoogleSheet([
    timestamp,
    loanType,
    applicantName,
    maxPrincipal.toFixed(2),
    emi.toFixed(2),
    (foir * 100).toFixed(2),
    (dti * 100).toFixed(2),
    recommendation.replace(/\n/g, " ")
  ]);

  // Return structured result
  return {
    timestamp,
    loanType,
    applicantName,
    maxPrincipal: Number(maxPrincipal.toFixed(2)),
    emi: Number(emi.toFixed(2)),
    foir: Number((foir * 100).toFixed(2)),
    dti: Number((dti * 100).toFixed(2)),
    recommendation,
    uploadedFiles: files,
  };
}
```
---
### API Route
#### [MODIFY] src/routes/eligibility.cjs
```diff
@@
-import { getSheetsService } from "../utils/googleSheets.cjs";
+import { getSheetsService } from "../utils/googleSheets.cjs";
+import { processEligibility } from "../services/eligibilityEngine.cjs";
+import multer from "multer";
+import path from "path";
+
+// Multer setup – store files under ./uploads (will be created if missing)
+const upload = multer({ dest: path.resolve(process.cwd(), "uploads") });
@@
-// Existing GET health endpoint …
+// Existing GET health endpoint …
@@
-// Existing POST /calculate endpoint (if any) – replace with new logic
+// New POST endpoint for loan eligibility calculation
+router.post(
+  "/calculate",
+  upload.fields([
+    { name: "itrYear1", maxCount: 1 },
+    { name: "itrYear2", maxCount: 1 },
+    { name: "bankStatements", maxCount: 5 },
+    { name: "otherDocs", maxCount: 5 },
+  ]),
+  async (req, res) => {
+    try {
+      const payload = JSON.parse(req.body.payload);
+      const files = {};
+      for (const [key, arr] of Object.entries(req.files || {})) {
+        files[key] = arr.map((f) => f.path);
+      }
+      const result = await processEligibility(payload, files);
+      res.json({ success: true, data: result });
+    } catch (e) {
+      console.error(e);
+      res.status(500).json({ success: false, error: e.message });
+    }
+  }
+);
``` 
---
### Front‑end (Optional – placeholder UI)
#### [NEW] src/pages/Eligibility.jsx
> A minimal React component that collects the required fields, uploads files, and posts to `/api/eligibility/calculate`. It displays the returned recommendation.
---
### .gitignore
#### [MODIFY] .gitignore
```diff
@@
 config/*.json
+uploads/
```
---
### Environment
Ensure `.env.local` (or Vercel env) contains:
```
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_JSON={...full‑json...}
GEMINI_API_KEY=your_gemini_api_key_here
```
---
## Verification Plan
**Automated Tests**
- Run `npm run dev` and issue a `curl` POST with a sample JSON payload and dummy files; expect HTTP 200 and a JSON body containing `recommendation`.
- Call the health endpoint (`GET /api/eligibility/health`) locally and on the live URL after Vercel deployment; both should return status 200.

**Manual Verification**
- Open the UI page, submit a dummy eligibility request, verify that the response matches the calculated values and that a new row appears in the Google Sheet.
- Check Vercel logs for any authentication errors regarding Google Sheets or Gemini.

---
**Next Step**
Await your approval to apply the above changes and execute the full implementation (install dependencies, create files, run tests, commit, push, and deploy to Vercel).
