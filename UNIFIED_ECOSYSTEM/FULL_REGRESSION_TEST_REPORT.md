# Full Regression Test Report (All Four Projects)

**Execution ID:** `TASK-11720`  
**Date:** 16 November 2026  

---

## 1. Project 1 (`1-AVANI LOAN SERVICE FY 26-27`) — Post-Final-Edit Verification

All Project 1 checks were executed **after** the final remediations to `src/server.cjs` and `index.html`:

| Check | Command | Observed Output Summary | Exit Code |
| :--- | :--- | :--- | :---: |
| **Node Test Runner (11 Suites)** | `node --test tests/**/*.test.*` | `tests 11`, `pass 11`, `fail 0`, `skipped 0`, duration `7265.87 ms` | `0` |
| **ChatMitra Integration** | Included in `node --test` | `12 / 12 TESTS PASSED (100%)` | `0` |
| **Ecosystem Integrations** | Included in `node --test` | Auth, RBAC, zero-secret-leak, consent gate, DLQ replay PASS | `0` |
| **4-Project Ecosystem E2E** | `test_four_project_ecosystem_e2e.test.cjs` | All cross-project checks PASS (Projects 1–4) | `0` |
| **Integration Gateway** | `test_integration_gateway.test.cjs` | Correlation ID, idempotency lease, HubSpot, DLQ replay PASS | `0` |
| **Website CRM Intake** | `test_website_crm_intake.test.cjs` | `5/5` PASS | `0` |
| **PII & Consent Security** | `test_pii_and_consent.test.cjs` | Consent gate, PAN/Aadhaar masking, TRAI DND PASS | `0` |
| **FOIR Engine Unit Tests** | `test_foir_engine.test.cjs` | All 8 FOIR / EMI / DTI tests PASS | `0` |
| **HubSpot Signature V3** | `test_hubspot_signature.test.cjs` | All 7 signature & replay tests PASS | `0` |
| **Policy Engine Unit Tests** | `test_policy_engine.test.cjs` | 5 policies & lender matching tests PASS | `0` |
| **Statement API Unit Tests** | `test_statement_api.test.cjs` | PII masking, classification, normalization PASS | `0` |
| **15-Domain Loan Workflows** | `test_loan_workflows.test.cjs` | Doctor, Salaried Engineer, Business loan workflows PASS | `0` |
| **Master Forensic Suite** | `npm.cmd run forensic:test` | `TEST_RUN_ID: AVANI-E2E-20261116-808C` — Phases 1–8 PASS | `0` |
| **ESLint (`src/`)** | `node ./node_modules/eslint/bin/eslint.js src` | `0 errors`, `51` pre-existing warnings | `0` |
| **Production Build (`vite`)** | `npm.cmd run build` | `prebuild` (7 service pages + sitemap + robots) + `vite build` (`2161 modules`, `29.20s`) | `0` |
| **Local Express `/api/*` 404 Check** | `node -e` against `src/server.cjs` | `/api/nonexistent` -> `404 {"success":false,"error":"API endpoint not found"}`; `/api/health` -> `200` | `0` |

## 2. Projects 2, 3 & 4 — Contract & Bridge Verification (`task-11739`)

| Project | Command | Observed Result | Exit Code |
| :--- | :--- | :--- | :---: |
| **Project 2 (`3-AVANI AI CRM`)** | `node --test tests/test_cp28_remediation_contracts.test.cjs` | `pass 1, fail 0` (`4/4` sub-checks PASS) | `0` |
| **Project 3 (`4-AVANI LOAN AGENTS`)** | `node scripts/test_agent_advisor_contract.js` | `4/4 PASS` (8 categories, EN/HI/MR, 4 guardrails, CRM sync, eligibility) | `0` |
| **Project 4 (`5-AVAVI AI CALLING AGENT`)** | `node test_calling_bridge.js` | `8/8 PASS` (`test_mode`, EN/MR/HI scripts, PII redaction, disposition map) | `0` |
