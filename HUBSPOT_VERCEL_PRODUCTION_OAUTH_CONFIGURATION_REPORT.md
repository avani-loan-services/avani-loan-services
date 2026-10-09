# AVANI LOAN SERVICES — VERCEL PRODUCTION HUBSPOT OAUTH CONFIGURATION FORENSIC REPORT

**Date:** 14 September 2026  
**Gate:** Vercel Production HubSpot OAuth Configuration Gate  
**Project:** AVANI LOAN SERVICES ONLY  
**Authoritative Local Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Authoritative GitHub Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main`  
**Authoritative Vercel Project:** `avani-loan-services` (Project ID: `prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`, Team: `avaniloanservicelatur-4088`)  
**Production Host:** [https://www.avanifinserv.com](https://www.avanifinserv.com/)  
**HubSpot Portal ID:** `244236573`  

---

## 1. Executive Verdict

### **FINAL CLASSIFICATION: BLOCKED**

This forensic verification gate evaluated the authoritative GitHub repository, live Vercel Production environment variables, and active HubSpot OAuth credentials.

Execution halted in strict compliance with the **Gate 1 and Gate 3 Stop Conditions**:
1. **Gate 1 Stop Condition (Code Not on `origin/main`):** While the HubSpot schema remediation in `src/utils/hubSpot.cjs` is fully implemented locally and passes all 17 unit tests and `npm run build`, it has **not yet been committed locally or pushed to `origin/main`**. GitHub `origin/main` remains at commit `e44455b` (which precedes even baseline `32be26e`). Per Gate 1 specification: *If the corrected code is not on authoritative origin/main, DO NOT deploy. Report exactly what is missing and STOP.*
2. **Gate 3 Stop Condition (Active OAuth Refresh Token Unavailable):** Vercel Production holds a stale legacy Client ID (`6390fa27...`) and a 4-day-old placeholder refresh token (`na2-99de-b4d2-4640-af6a-1b35de1eec48`). In the local `.env`, `HUBSPOT_REFRESH_TOKEN` currently contains a Private App PAT (`pat-na2-...`), not an OAuth refresh token. Per Gate 3 specification: *If a valid active OAuth refresh token is NOT available through the authorized configuration workflow, STOP rather than inventing or substituting credentials.*
3. **Controlled Deployment Suppressed:** In accordance with Gate 4, **no deployment was executed**. Production remains safely pinned to deployment `dpl_5XSAJLAXMAfTbQrLmPu3z6cDRnob`.

---

## 2. GitHub Commit Verification (Gate 1)

### Git Telemetry:
* **Branch:** `main` (tracked to `origin/main`)
* **Remote `origin/main` HEAD:** Commit `e44455b3aaa85dfe61a61ecb97e6a16da37d66cb` (`fix(crm): preserve monthlyIncomeRange in formatMasterRecord and googleSheetsMaster sync`)
* **Local `main` HEAD:** Commit `32be26eea389939787f49b7057962bd661e2f0b5` (`fix(hubspot): add monthly_income and avani_lead_id mappings to contact payload`) — **1 commit ahead of origin/main (unpushed)**.
* **Working Tree State:** `src/utils/hubSpot.cjs` contains the verified schema remediation, but is currently **unstaged / uncommitted** in both `avani-loan-services` and the local workspace.

### Remediation Verification in Local Working Tree:
* `loan_type__c` ➔ `loan_type`: **VERIFIED**
* `loan_amount` ➔ `loan_amount_required` (numeric): **VERIFIED**
* `monthly_income` ➔ `what_is_your_monthly_income` (exact range preserved): **VERIFIED**
* `avani_lead_id` ➔ `lead_id` (Applicant ID preserved): **VERIFIED**
* `source` removed from HubSpot payload: **VERIFIED**
* `hs_lead_status` normalized to `'NEW'`: **VERIFIED**
* Deterministic mapping for 7 allowed loan types: **VERIFIED**
* Numeric amount parser: **VERIFIED**
* `npm run build`: **PASS** (`✓ built in 45.31s`, exit code `0`)

### Gate 1 Summary Matrix:
| Requirement | Status | Detail |
| :--- | :---: | :--- |
| Remediation committed locally | **NO** | Uncommitted in working directory |
| Remediation present on authoritative `main` | **NO** | Local HEAD is `32be26e` (prior to schema fixes) |
| Remediation pushed to `origin/main` | **NO** | `origin/main` is at `e44455b` |
| Gate 1 Stop Condition Triggered | **YES** | **DEPLOYMENT BLOCKED** |

---

## 3. Vercel Project Identity

* **Project Name:** `avani-loan-services`
* **Project ID:** `prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`
* **Team Account:** `avaniloanservicelatur-4088` (Team: `team_uRG3GFsbbGb6mNxTQw60sCu0`)
* **Framework:** Vite
* **Production Alias:** `https://www.avanifinserv.com`
* **Active Production Deployment:** `dpl_5XSAJLAXMAfTbQrLmPu3z6cDRnob` (`https://avani-loan-services-lk88envgm-avani-loan-services.vercel.app`)

---

## 4. Environment-Variable Presence & Status (Gate 2)

Audited via `npx vercel env ls production` on the authoritative Vercel project:

| Variable Name | Consumer in Code | Vercel Prod Status | Value Analysis | Alignment Status |
| :--- | :--- | :---: | :--- | :---: |
| **`HUBSPOT_CLIENT_ID`** | `src/routes/auth.cjs`, `src/utils/hubSpot.cjs` | **PRESENT** | Legacy Client ID `6390fa27-bd77-4151...` (4 days old) | **MISMATCH (STALE)** |
| **`HUBSPOT_CLIENT_SECRET`** | `src/routes/auth.cjs`, `src/utils/hubspotSignature.cjs` | **PRESENT [MASKED]** | Encrypted value (4 days old) | **STALE** |
| **`HUBSPOT_REFRESH_TOKEN`** | `src/utils/hubSpot.cjs` | **PRESENT [MASKED]** | Placeholder `na2-99de-b4d2-4640-af6a-1b35de1eec48` | **STALE PLACEHOLDER** |
| **`HUBSPOT_REDIRECT_URI`** | `src/routes/auth.cjs` | **PRESENT** | `https://www.avanifinserv.com/api/auth/hubspot/callback` | **VALID** |
| **`HUBSPOT_PORTAL_ID`** | `src/routes/crm.cjs` | **MISSING** | Missing; falls back to code default `'244236573'` | **MISSING IN VERCEL** |
| **`VITE_HUBSPOT_PORTAL_ID`** | `src/components/HubspotLeadForm.jsx` | **MISSING** | Missing; falls back to code default `'244236573'` | **MISSING IN VERCEL** |
| **`VITE_HUBSPOT_FORM_ID`** | `src/components/HubspotLeadForm.jsx` | **MISSING** | Missing; falls back to code default `'edde042c...'` | **MISSING IN VERCEL** |
| **`HUBSPOT_ACCESS_TOKEN`** | None (OAuth architecture) | **MISSING** | Correctly omitted from production | **COMPLIANT** |
| **`HUBSPOT_PRIVATE_APP_TOKEN`**| None (OAuth architecture) | **MISSING** | Correctly omitted from production | **COMPLIANT** |

---

## 5. OAuth Application Identity

* **Configured in Vercel Production:** Legacy Client ID `6390fa27-bd77-4151-9311-fc2fb50b91d2`.
* **Authorized Developer App (Portal 244236573):** Developer App `AVANI AI CRM` (App ID `41895712`, Client ID `14724c1b-c099-4ccf-baef-65c209212731`).
* **Authentication Architecture:** OAuth 2.0 Authorization Code Grant (`/api/auth/hubspot/callback`) + Refresh Token (`https://api.hubapi.com/oauth/v1/token`).
* **Finding:** Vercel Production is bound to an older, unaligned application identity.

---

## 6. Portal ID Verification

* **Configured Target:** Portal ID `244236573`
* **Live API Verification:** `GET https://api.hubapi.com/account-info/v3/details`
  - Portal ID: `244236573`
  - Account Type: `STANDARD`
  - Data Hosting Location: `na2`
* **Verification Status:** **PASS (Confirmed Active)**

---

## 7. Redirect URI Verification

* **Configured URI:** `https://www.avanifinserv.com/api/auth/hubspot/callback`
* **Route Implementation:** Handled by `src/routes/auth.cjs` mounted at `/api/auth` via `vercel.json` rewrites.
* **Live Endpoint Reachability:** `GET https://www.avanifinserv.com/api/auth/hubspot/callback` returns **HTTP 400 (`Missing code parameter`)**, confirming the route is active and validating inbound requests.

---

## 8. Deployment ID and Commit SHA

* **Deployment Attempted:** **NO (Blocked by Gate 1 & Gate 3 stop conditions)**.
* **Active Production Deployment ID:** `dpl_5XSAJLAXMAfTbQrLmPu3z6cDRnob`
* **Active Production Commit SHA:** `e44455b3aaa85dfe61a61ecb97e6a16da37d66cb`
* **Deployment Status:** `● Ready` (Active since Sun Sep 13 2026 18:53:07 IST)

---

## 9. Read-Only HubSpot API Verification

* **Callback Route Check:** `GET /api/auth/hubspot/callback` ➔ **HTTP 400 Bad Request** (`Missing code parameter`).
* **CRM Read Check:** `GET https://api.hubapi.com/crm/v3/objects/contacts?limit=1` ➔ **HTTP 200 OK** (Returned 1 existing contact record).
* **Mutation Check:** **Zero contacts created, modified, or deleted.** Zero property modifications.

---

## 10. Mutation Ledger

```text
GitHub commits created:      0
GitHub pushes executed:      0
Vercel production deployed:  NO
Vercel environment updated:  NO
HubSpot contacts created:    0
HubSpot contacts updated:    0
HubSpot properties created:  0
Meta campaigns modified:     0
Google Sheets modified:      0
MongoDB modified:            0
```

---

## 11. Scope-Isolation Verification

* **AVANI AGRO FOODS:** **NOT TOUCHED** (Zero access, zero references, isolated).
* **Meta / Facebook / WhatsApp:** **NOT TOUCHED**.
* **Google Sheets:** **NOT TOUCHED**.
* **MongoDB:** **NOT TOUCHED**.
* **DNS & Webhooks:** **NOT TOUCHED**.
* **Secret Protection:** Zero client secrets, refresh tokens, access tokens, PATs, or passwords printed or exposed.

---

## 12. Remaining Blockers

1. **GitHub Commit & Push Blocker:**
   - The code remediation in `src/utils/hubSpot.cjs` must be committed to `main` and pushed to `origin/main` in `avani-loan-services/avani-loan-services` before Vercel can build it.
2. **OAuth Refresh Token Provisioning Blocker:**
   - A valid OAuth refresh token from the browser authorization flow must be synchronized into Vercel Production environment variable `HUBSPOT_REFRESH_TOKEN`.
   - Vercel Production variables `HUBSPOT_CLIENT_ID` (`14724c1b...`), `HUBSPOT_CLIENT_SECRET`, and `HUBSPOT_PORTAL_ID` (`244236573`) must be updated in tandem.

---

## 13. Exact Next Gate

**Next Gate:** `AVANI LOAN SERVICES — GITHUB COMMIT, VERCEL CREDENTIAL SYNC & CONTROLLED DEPLOYMENT GATE`

Preconditions for the next gate:
1. Human authorization to commit and push the verified `src/utils/hubSpot.cjs` schema fix to `avani-loan-services` on `main`.
2. Provisioning the active authorized OAuth refresh token into Vercel Production.
3. Triggering a controlled production deployment from the updated `main` commit.
4. Rerunning read-only verification before any synthetic lead write test.
