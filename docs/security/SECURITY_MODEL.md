# AVANI LOAN SERVICES — SECURITY ARCHITECTURE & MODEL

**Document ID:** `ALS-DOC-SEC-2026-001`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES  
**Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. Security Architecture Principles

1. **Two-Application Isolation Guarantee:**
   - Total logical, physical, and credential separation between AVANI LOAN SERVICES and AVANI AGRO FOODS.
   - Separate databases, separate encryption keys, separate Git remotes, and separate external provider accounts.
2. **Zero-Trust Network & Data Boundary:**
   - All inbound webhooks (Meta, AiSensy, HubSpot) require HMAC-SHA256 signature verification or Bearer token validation.
   - Internal micro-services communicate over private Docker network or TLS.
3. **Deterministic Financial Rules over Autonomous AI:**
   - LLMs are strictly forbidden from acting as credit authorities. Credit decisions, FOIR ratios, and loan eligibility are derived exclusively through versioned mathematical algorithms.
4. **Mandatory Human Underwriting Gate:**
   - No loan sanction or lender commitment may be executed autonomously. Every matched application is held in `PENDING_HUMAN_UNDERWRITER_APPROVAL` until certified by authorized personnel.

---

## 2. Role-Based Access Control (RBAC)

| Role | Permitted Actions | Restrictions |
| :--- | :--- | :--- |
| **Applicant / Visitor** | Submit lead, upload KYC docs, view indicative calculations, request callbacks | Cannot view lender policy grids, internal credit scores, or other applicants |
| **Loan Advisor** | View qualified leads, review document checklists, conduct telecalling | Cannot authorize final sanction or edit underwriting algorithms |
| **Principal Underwriter (Sachin Shinde)** | Review full underwriting dossier, override conditional checks, authorize lender submission | Actions permanently recorded in immutable audit ledger |
| **DevOps / System Admin** | Manage infrastructure, rotate credentials, trigger backups, triage DLQ | Zero access to unmasked customer KYC documents or raw bank accounts |

---

## 3. Secret Management & Storage Security

- **Client-Side Secrecy:** Passwords, API tokens, and webhook secrets are NEVER bundled into Vite frontend code.
- **Environment Isolation:** Secrets reside strictly in `.env.production` on secure host environments; template variables are defined in `.env.example`.
- **Object Storage Security:** Uploaded bank statements and KYC files are stored in private, restricted-access storage vaults with pre-signed URLs expiring in 15 minutes.
