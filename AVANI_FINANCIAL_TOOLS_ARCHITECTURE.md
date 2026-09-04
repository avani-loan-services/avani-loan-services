# AVANI FINANCIAL TOOLS & LOAN ELIGIBILITY PLATFORM
## Technical Architecture & Design Document

**Organization:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Version:** 2.0.0 (Production)  
**Date:** 2026-08-20  
**Document Code:** ALS-ARCH-2026-001

---

## 1. System Architecture Overview

```
                          ┌─────────────────────────────────────┐
                          │         CLIENT APPLICATION          │
                          │        (React 19 / Vite SPA)        │
                          └──────────────────┬──────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
         [Public Website Routes]                    [Protected Financial Tools]
      /, /about, /loans, /services,               /financial-tools (or /calculators)
      /contact, /privacy, /cibil-check, etc.                       │
                       │                                           │
                       │                        ┌──────────────────┴──────────────────┐
                       │                        ▼                                     ▼
                       │               [Unauthenticated]                     [Authenticated]
                       │             /financial-tools/login             /financial-tools/dashboard
                       │                        │                       /financial-tools/loan/* (10)
                       │                        │ POST /login (Rate-Ltd) /financial-tools/investment/* (5)
                       │                        │ Password: Samarth@1356/financial-tools/other/* (5)
                       │                        ▼                       /financial-tools/eligibility
                       │             ┌──────────────────────┐           /financial-tools/documents
                       │             │  Express Server Auth  │           /financial-tools/admin
                       │             │  (HttpOnly JWT Cookie)│                        │
                       │             └──────────┬───────────┘                        │
                       │                        │ Set-Cookie                          │
                       │                        ▼                                     │
                       │             [Session Established] ───────────────────────────┘
                       │
                       ▼
         ┌────────────────────────────────────────────────────────────────────────┐
         │                          NODE / EXPRESS API                            │
         │  • /api/calculator-auth (Login, Verify, Logout, Rate Limit)            │
         │  • /api/eligibility (10-Step Assessment Engine & Document Parser)      │
         │  • /api/documents (Secure Upload Vault & Verification Review)          │
         │  • /api/crm & /api/lead (Idempotent Lead Creation: ALS-ELG-2026-XXXXXX) │
         └──────────────────────────────────┬─────────────────────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
      [Read-Only Parser]           [Database Layer]           [Third-Party Integrations]
      • pdf-parse (Native)         • MongoDB / Mongoose       • Meta WhatsApp API (+91-9175635165)
      • Tesseract.js (OCR)         • In-Memory Resilient DB   • Google Sheets Master Ledger
      • Field Extractor Pipeline   • Encrypted Document Vault • HubSpot CRM Sync Engine
```

---

## 2. Authentication & Session Security Flow

1. **User Navigation**: Visitor enters `/financial-tools` or any calculator URL.
2. **Client Route Guard (`CalculatorProtectedRoute`)**:
   - Queries `GET /api/calculator-auth/verify` with credentials (cookies).
   - If session is active and valid, renders the protected component.
   - If no valid session exists, redirects to `/financial-tools/login`.
3. **Authentication Request (`POST /api/calculator-auth/login`)**:
   - Input: Security access password (Initial: `Samarth@1356`).
   - Rate Limiter: Enforces maximum 10 login attempts per 15 minutes per IP.
   - Verification: Compares password against `process.env.CALCULATOR_ACCESS_PASSWORD` or bcrypt hash `process.env.FINANCIAL_TOOLS_PASSWORD_HASH`.
   - Response: Generates signed JWT (`scope: 'calculator_suite'`) and writes `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookie (`avani_calc_session`, 8-hour expiry).
4. **Zero Client Secret Policy**: Password is never stored in browser memory, bundles, or client variables.

---

## 3. Pure Calculator Calculation Engine (`src/calculators/utils/calculations.js`)
All calculations are pure, deterministic, unit-tested functions:

- **Loan Calculators (10)**:
  1. `calculateEMI`: Standard reducing balance $EMI = P \cdot r \cdot (1+r)^n / ((1+r)^n - 1)$.
  2. `generateAmortizationSchedule`: Detailed monthly installment breakdown and yearly aggregates.
  3. `calculateFOIREligibility`: Fixed Obligation to Income Ratio loan capacity derivation.
  4. `calculateMultiplierEligibility`: Salary/business income multiplier with existing obligation deductions.
  5. `calculateOutstandingLoan`: Principal/interest paid and remaining balances after $k$ installments.
  6. `calculateForeclosure`: Pre-closure fees, GST (18%), penalties, and net interest saved.
  7. `calculateOverdraft`: Utilized limit daily interest, monthly estimates, and total credit cost.
  8. `calculateLoanComparison`: Side-by-side cost delta and winner determination for Loan A vs Loan B.
  9. `calculatePrepayment`: Lump-sum part-payment benefits (Reduce Tenure vs Reduce EMI).
  10. `calculateRateChange`: Floating rate fluctuation impact on EMI vs Tenure.
  11. `calculateGSTOnInterest`: Processing charges tax calculation with CGST/SGST breakdown.

- **Investment Calculators (5)**:
  12. `calculateFD`: Compound interest $A = P \cdot (1 + r/n)^{nt}$ across monthly/quarterly/half-yearly/yearly compounding.
  13. `calculateRD`: Recurring monthly deposits compounded quarterly using Indian banking standards.
  14. `calculateSIP`: Wealth accumulation from systematic monthly mutual fund investments.
  15. `calculateInterest`: Dual-mode Simple Interest ($I = P \cdot R \cdot T / 100$) and Compound Interest.
  16. `calculatePPF`: 15-year Public Provident Fund schedule with statutory annual caps and tax-free interest.

- **Other Financial Tools (5)**:
  17. `calculateGST`: Standard Add GST and Remove GST (reverse computation).
  18. `calculateProfitLoss`: Cost price vs selling price, profit/loss amount, profit %, and margin %.
  19. `calculateDiscount`: Flat and percentage discount calculations with net savings.
  20. `calculateCashDenominations`: Indian currency denomination counter (₹500, ₹200, ₹100, ₹50, ₹20, ₹10, custom).
  21. `numberToIndianWords`: Formatting INR amounts into formal Indian text (Lakhs, Crores, Rupees & Paise).

---

## 4. Document Extraction & Verification Review Pipeline

```
  [Customer Uploads PDF / JPG / PNG]
                 │
                 ▼
    [Private Multer Storage Vault] ─── (Source file saved as READ-ONLY immutable record)
                 │
                 ▼
    [Automated Text & OCR Extraction Engine]
    ├── Native PDF Text Stream (pdf-parse)
    └── High-Resolution OCR (tesseract.js fallback for scans & photos)
                 │
                 ▼
    [Document Field Classifier]
    ├── Bank Statements: Bank Name, Masked Account #, Average Balance, Salary Credits, EMI Debits
    ├── Loan Statements: Lender, Original Principal, Outstanding Balance, Interest Rate, Remaining EMIs
    └── Salary Slips / ITR: Gross Pay, Net Pay, PAN, Aadhaar (Masked)
                 │
                 ▼
    [Document Review & Verification Screen]
    ├── Displays extracted values with confidence indicators
    ├── Allows user to confirm or edit field values
    └── User clicks "Confirm & Calculate Eligibility"
                 │
                 ▼
    [Reusable Eligibility Underwriting Engine]
```

---

## 5. 10-Step Eligibility Assessment Flow
1. **Product Selection**: Choose from 9 specialized loan products.
2. **Applicant Profile**: Salaried, Self-employed, Business owner, Professional, Student, Institution.
3. **Personal Information**: Name, Mobile, Email, City.
4. **Income Details**: Net take-home, gross salary, or annual ITR income.
5. **Existing Obligations**: Current monthly EMIs and loan commitments.
6. **Document Upload**: Multi-file secure upload (PDF / JPG / PNG).
7. **Automated Extraction**: Server parses key financial indicators.
8. **Applicant Verification**: Review & edit extracted numbers.
9. **Eligibility Execution**: Multiplier + FOIR + Product rules.
10. **Result & Action**: Indicative result, Application ID (`ALS-ELG-2026-XXXXXX`), WhatsApp CTA (`+91-9175635165`), and PDF print/download.

---

## 6. Regulatory Disclaimers & Fair Lending Compliance
All outputs display standard banking disclaimers:
> *"These calculations are indicative and do not constitute a formal loan sanction or approval guarantee. Final eligibility, loan amount, interest rates, and approval are subject to lender policies, comprehensive credit assessment, physical/digital document verification, property valuation, and statutory regulations."*
