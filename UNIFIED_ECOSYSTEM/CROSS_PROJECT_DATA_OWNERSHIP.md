# Cross-Project Data Ownership Matrix

**Execution ID:** `TASK-11720`  
**Date:** 16 November 2026  

---

## 1. Domain Authoritative Owners

| Data Domain | Authoritative Owner | Read / Write Consumers | Conflict & Guardrail Rule |
| :--- | :--- | :--- | :--- |
| **Canonical Identity (`CUS-AVL-*`) & External ID Map** | Project 1 (`ecosystemIntegrationRegistry.cjs`) | Projects 1, 2, 3, 4 | Deterministic SHA-256 of normalized 10-digit phone + lowercase email; one ID per person across projects |
| **Portal Auth, Sessions, 6-Role RBAC & Audit Ledger** | Project 1 (`portalAuthService.cjs`, `portalDatabase.cjs`) | Project 1 Admin UI & APIs | Strict 6-role RBAC (`Super Administrator` .. `Read-Only Analyst`), 8h JWT + server session check |
| **Builder Partnerships (Module A) & 100-Pt Scoring** | Project 1 | Project 1 (`/api/portal/builder/*`) | Verified official channel gate (`WF-04`) |
| **Education Institutions (Module B) & Outreach Logs** | Project 1 | Project 1 (`/api/portal/education/*`) | Strictly blocked if `consent_status !== 'Approved'` (`WF-05`) |
| **CRM Lead Pipeline, Inbox & UTM Attribution** | Project 2 (`3-AVANI AI CRM`) | Project 1 (sync bus), Project 3 (`crmSync.ts`), Project 4 | Deduplicated via `idempotencyKey` (`Lead.ts`, `/api/public/enquiry`) |
| **Trilingual Loan Eligibility & Checklist Advisories** | Project 3 (`4-AVANI LOAN AGENTS`) | Project 1 (`WF-02`), Project 2 (`crmSync.ts`) | **Advisory-only:** `autonomousApproval` / `guaranteedRate` strictly blocked (`HTTP 403`) |
| **Voice Scripts, PII Redaction & Call Dispositions** | Project 4 (`5-AVAVI AI CALLING AGENT`) | Project 1 (`WF-03`), Project 2 (CRM state) | `scrubPII()` redacts PAN/Aadhaar/Bank/OTP/Password prior to storage |
| **Integration Toggle, Workflow State & DLQ** | Project 1 (`IntegrationGateway`) | Super Administrator / Administrator | Pause/resume & DLQ replay logged to `auditLedger` |
