# PHASE 5.3.29 — AVANI AI CRM TEST REPORT

**Project Scope:** AVANI AI CRM (integrated modules under `apps/*`, `src/config/envValidator.cjs`, `src/models/Lead.cjs`, `src/models/WebhookInbox.cjs`, `src/services/avaniAiAgent.cjs`, `tests/*`, `scripts/*`)  
**Environment:** `APP_MODE=test`, `PROVIDER_MODE=mock`, `DATABASE URI=mongodb://localhost:27017/avani_ai_crm_test`  
**Isolation Note:** Strict environment guard verified; zero AVANI LOAN SERVICES production data or external unrelated projects accessed.

---

## 1. Script Inspection & Execution Results

| Script | Exit Code | Passed | Failed | Skipped | Status | Observed Evidence |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `node scripts/test_environment_isolation.cjs` | `0` | 1 | 0 | 0 | **VERIFIED** | `validateEnvironmentIsolation()` passed for `APP_MODE=test` -> `avani_ai_crm_test` (`PROVIDER_MODE=mock`). |
| `node scripts/test_lead_idempotency.cjs` | `0` | 1 | 0 | 0 | **VERIFIED** | `Lead ID: AVL-20261112-000001, Duplicate Suppressed: true`. |
| `node scripts/test_webhook_replay.cjs` | `0` | 1 | 0 | 0 | **VERIFIED** | `First Insert: true, Second Insert Suppressed: true`. |
| `node scripts/test_ai_agent.cjs` | `0` | 1 | 0 | 0 | **VERIFIED** | `Language: Marathi, Profession: DOCTOR, Income: 100000`. |
| `node scripts/runAllLendingTests.cjs` | `0` | 10 suites | 0 | 0 | **VERIFIED** | All 10 child suites passed cleanly: FOIR/DTI (8), Policy Engine (5), Statement & PII API (4), HubSpot Signature V3 (7), Integration Gateway & DLQ (6), DPDP Consent & PII (3), 15-Domain E2E Workflow (3), Pure Financial Tools (`65` specs), Master Financial Matrix (`206` passed, `0` failed), Website & CRM Lead Intake (`5/5`). |

---

## 2. Limitations
- **VERIFIED WITH LIMITATIONS:** Test runs execute in `APP_MODE=test` / `PROVIDER_MODE=mock` against local/in-memory test fixtures rather than live MongoDB Atlas production data or live third-party provider webhooks (by design and safety policy).
