# AVANI LOAN SERVICES — CHANGE CONTROL POLICY & DIRECTORY
**Project:** AVANI FINANCIAL TOOLS & LOAN ELIGIBILITY PLATFORM  
**Date:** 2026-08-20  
**Document Code:** ALS-CC-2026-001  
**Scope:** Avani Loan Services (avanifinserv.com)

---

## 1. Change Control Principles
1. **Extend, Don't Destroy**: All existing features, database collections, and routes of Avani Loan Services represent the immutable production baseline.
2. **Strict Business Isolation**: Avani Agro Foods remains 100% separate. No cross-business imports, references, shared databases, or asset modifications.
3. **Isolated Modular Architecture**: All new capabilities (20 calculators, document analysis, multi-step eligibility engine, report generation) reside in dedicated modules under `/financial-tools` and `src/calculators/` / `src/financial-tools/`.
4. **Server-Enforced Password Protection**: All calculator pages and document uploads are protected behind server-side authentication using password `Samarth@1356` with HttpOnly session cookies.
5. **No Client Secret Exposure**: Plaintext passwords or secrets are strictly prohibited from client-side bundles, HTML, or localStorage.
6. **Independent Rollback**: The feature is independently controllable via environment configuration (`FINANCIAL_TOOLS_ENABLED=true/false`).

---

## 2. Directory & Route Namespace Mapping

| Namespace / Route | Module Purpose | Access Control | Status |
|---|---|---|---|
| `/financial-tools` | Central Financial Intelligence Dashboard | Protected (Session Gate) | NEW / EXTENSION |
| `/financial-tools/login` | Server-Side Authentication Screen | Public (Rate Limited) | NEW |
| `/financial-tools/loan/*` (10 tools) | EMI, FOIR, Multiplier, Outstanding, Foreclosure, Overdraft, Compare, Prepayment, Rate Change, GST Interest | Protected | NEW / EXTENSION |
| `/financial-tools/investment/*` (5 tools) | FD, RD, SIP, Interest (SI/CI), PPF | Protected | NEW / EXTENSION |
| `/financial-tools/other/*` (5 tools) | GST, Profit/Margin, Discount, Cash Counter, Amount to Words | Protected | NEW / EXTENSION |
| `/financial-tools/eligibility` | 10-Step Eligibility Assessment & Document Extraction Flow | Protected | NEW / EXTENSION |
| `/financial-tools/documents` | Secure Document Upload & Verification Vault | Protected | NEW / EXTENSION |
| `/financial-tools/services` | 9 Specialized Loan Products & Criteria | Protected | NEW / EXTENSION |
| `/financial-tools/admin` | Admin Underwriting Config & Lead Management | Protected (Admin Token) | NEW / EXTENSION |
| `/calculators/*` | Legacy Compatibility Aliases | Mapped to `/financial-tools/*` | PRESERVED |
| `/` & all public routes | Homepage, Loans, About, Contact, Services, Blog, CIBIL, etc. | Public | UNCHANGED |
| `/api/calculator-auth/*` | Server-Side Password Verification & Session Controller | Server API (Rate Limited) | ACTIVE |

---

## 3. Files Permitted for Creation / Extension
- `src/routes/calculatorAuth.cjs` (Server authentication & JWT HttpOnly cookie controller)
- `src/calculators/auth/` (Auth Context & Protected Route Guards)
- `src/calculators/utils/` (`calculations.js`, `formatters.js`, `validation.js`)
- `src/calculators/pages/` (All 20 individual calculator pages + Dashboard + Login + Admin)
- `src/calculators/components/` (`CalculatorShell`, `AmortizationTable`, `ExploreServices`, `DocumentReviewBox`)
- `src/calculators/styles/calculators.css` (Curated Vanilla CSS design system)
- `src/pages/Eligibility.jsx` & `src/components/PasswordGate.jsx` (Secured with server-side validation)
- `src/App.jsx` (Registering `/financial-tools/*` routes & backward-compatible `/calculators/*` mapping)
- `scripts/testCalculatorSuite.cjs` & `scripts/testMasterFinancialTools.cjs` (Automated unit & integration test suites)

---

## 4. Files Intentionally Untouched
- All third-party CRM routes (`src/routes/crm.cjs`, `src/services/crmSyncEngine.cjs`)
- All WhatsApp webhook controllers (`src/routes/whatsappWebhookController.cjs`, `src/routes/whatsapp.cjs`)
- All existing public page layouts and static assets (`src/pages/Home.jsx`, `src/pages/About.jsx`, `src/pages/Contact.jsx`, `src/pages/Privacy.jsx`, `src/pages/Catalog.jsx`)
- All database collections belonging to other services.

---

## 5. Rollback Procedure
If any operational rollback is requested:
1. Set `FINANCIAL_TOOLS_ENABLED=false` in the server environment.
2. The server middleware will cleanly redirect `/financial-tools` to the main maintenance notice or standard loan page without affecting any core website functionality.
3. No destructive database drops or migrations are required.
