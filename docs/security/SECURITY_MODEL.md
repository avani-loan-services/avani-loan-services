# AVANI LOAN SERVICES — CONSOLIDATED SECURITY MODEL & FINANCIAL SAFETY

**Document ID:** `ALS-DOC-SEC-2026-003`  
**Execution Date:** 25 October 2026  
**Owner & Managing Director:** Sachin Shinde (`+91 72491 08474` / `+91 91756 35165`)  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Primary Execution Workspace:** `1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. Security Architecture Principles

1. **Two-Application Isolation Guarantee:**
   - Absolute logical, physical, and credential separation between AVANI LOAN SERVICES and AVANI AGRO FOODS.
   - Separate databases, separate encryption keys, separate Git remotes, and zero cross-project credential reuse.
2. **Digital Personal Data Protection (DPDP) Act 2023 Compliance:**
   - **Consent as a Hard Gate:** Lead intake routes (`api/save-lead.js` and CRM `/api/leads`) return HTTP 403 Forbidden if explicit consent is missing or denied.
   - **Opt-Out Immediate Suppression:** An opt-out signal (`isOptedOut: true`) halts all scheduled marketing, automated follow-ups, and AI calling immediately.
   - **Data Minimization:** Only minimal necessary contact and qualification fields are collected.
3. **Deterministic Financial Rules over Autonomous AI:**
   - LLMs are strictly forbidden from acting as credit authorities. Loan eligibility, FOIR ratios, and loan EMIs are derived exclusively through versioned mathematical algorithms.
   - Statutory regulatory guardrails prevent AI from guaranteeing loan sanctions, promising CIBIL score repair, or generating fake sanction letters.
4. **Mandatory Human Underwriting Gate:**
   - No loan sanction or lender commitment may be executed autonomously. Every application is held for human review by Managing Director Sachin Shinde and partner bank underwriters.
5. **PII Masking & Redaction Engine:**
   - PAN: Masked as `XXXXX1234X`.
   - Aadhaar: Masked as `XXXXXXXX1234`.
   - Bank Account Numbers: Masked as `XXXXXXXX1234`.
   - OTPs & Passwords: Strictly redacted from transcripts and call summaries as `[REDACTED]`.
6. **First-Party Click Tracking & Open-Redirect Defense:**
   - The `/r` tracking endpoint strictly validates redirect targets against an approved origin whitelist (`avanifinserv.com`, `wa.me`, `api.whatsapp.com`). Non-whitelisted destinations are rejected with HTTP 400 Bad Request.

---

## 2. Role-Based Access Control (RBAC)

| Role | Permitted Actions | Restrictions |
| :--- | :--- | :--- |
| **Applicant / Visitor** | Submit lead, upload KYC docs, view indicative calculations, request callbacks | Cannot view lender policy grids, internal credit scores, or other applicants |
| **Loan Advisor** | View qualified leads, review document checklists, conduct telecalling | Cannot authorize final sanction or edit underwriting algorithms |
| **Managing Director (Sachin Shinde)** | Review full underwriting dossier, override conditional checks, authorize lender submission | Actions permanently recorded in immutable audit ledger |
| **DevOps / System Admin** | Manage infrastructure, rotate credentials, trigger backups, triage DLQ | Zero access to unmasked customer KYC documents or raw bank accounts |

---

## 3. Secret Management & Storage Security

- Passwords, API tokens, and webhook secrets are NEVER bundled into Vite frontend code.
- Secrets reside strictly in `.env.production` on secure host environments (Vercel Project Settings).
- Uploaded bank statements and KYC files are stored in private, restricted-access storage vaults with pre-signed URLs expiring in 15 minutes.
