# AVANI LOAN SERVICES — HUBSPOT SCHEMA & OAUTH ARCHITECTURE READ-ONLY FORENSIC GATE REPORT

**Date:** 14 September 2026  
**Operating Mode:** Read-Only Forensic Verification Gate (Auto Mode)  
**Project:** AVANI LOAN SERVICES  
**Authoritative Local Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Authoritative GitHub Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main` (Baseline Commit `32be26eea389939787f49b7057962bd661e2f0b5`)  
**Authoritative Vercel Project:** `avani-loan-services` (`prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`)  
**Production Host:** [https://www.avanifinserv.com](https://www.avanifinserv.com/)  
**HubSpot Portal ID:** `244236573` (Standard Account, Region `na2`)

---

## 1. Executive Verdict

### **VERDICT: BLOCKED — REMEDIATION REQUIRED**

The forensic audit confirms that while the AVANI Central Lead Engine (`centralLeadEngine.cjs`), deduplication subsystem, and OAuth callback mechanics are functional, live end-to-end CRM synchronization from AVANI LOAN SERVICES to HubSpot Portal `244236573` is **BLOCKED** by three distinct root causes:

1. **Authentication Credential Drift:** Vercel Production contains legacy credentials from an earlier configuration (an old Client ID and un-synchronized refresh token placeholder), preventing the serverless production runtime from refreshing OAuth access tokens.
2. **Schema Property Mismatch:** Current application code (`src/utils/hubSpot.cjs`) attempts to populate custom fields that do not exist in HubSpot Portal `244236573` (`loan_type__c`, `loan_amount`, `monthly_income`, `avani_lead_id`, `source`), causing HTTP 400 `PROPERTY_DOESNT_EXIST`. Active native properties already exist in the portal (`loan_type`, `loan_amount_required`, `what_is_your_monthly_income`, `lead_id`).
3. **Enumeration Incompatibilities:** Property `hs_lead_status` strictly rejects lowercase/mixed-case display labels (`"New"` / `"Pending"`) and requires uppercase internal enumeration keys (`NEW`). Similarly, `loan_type` is an enumeration expecting internal option values (`business_loan`, `personal_salary_loan`, etc.).
4. **Synthetic Test Email Rejection:** HubSpot CRM validation rejected `.invalid` TLDs as `INVALID_EMAIL`. Controlled write tests must use an RFC 2606 compliant format (`@example.com`).

---

## 2. Authentication Architecture Verdict

### A1. Production Authentication Mode
* **Intended Architecture:** Standard **OAuth 2.0 Authorization Code Grant + Refresh Token**.
* **Trace Analysis:**
  - `src/routes/auth.cjs` exposes `/api/auth/hubspot/callback`, exchanging an authorization `code` via `POST https://api.hubapi.com/oauth/v1/token` with `grant_type: 'authorization_code'`.
  - In authoritative GitHub baseline `32be26e`, the callback validates the token exchange and alerts the operator to persist `HUBSPOT_REFRESH_TOKEN` into the secure serverless environment settings.
  - `src/utils/hubSpot.cjs` implements `getAccessToken()`, which checks an in-memory cache (`tokenExpiresAt = Date.now() + expires_in * 1000 - 5 * 60 * 1000`) and calls `POST https://api.hubapi.com/oauth/v1/token` with `grant_type: 'refresh_token'`.
  - The production application was designed exclusively for OAuth 2.0. It does not natively require Private App PATs in production.

### A2. Token Precedence
* **In Local Working Tree (`1-AVANI LOAN SERVICE FY 26-27`):**
  1. In-memory `accessToken` (if valid and not expired).
  2. Direct Private App token from `process.env.HUBSPOT_ACCESS_TOKEN` or `process.env.HUBSPOT_API_KEY` if prefixed with `pat-`.
  3. Re-reads `../../.env` for `HUBSPOT_REFRESH_TOKEN`.
  4. Returns `HUBSPOT_REFRESH_TOKEN` directly if prefixed with `pat-`.
  5. Validates that `HUBSPOT_REFRESH_TOKEN` is not empty or equal to placeholder `na2-99de-b4d2-4640-af6a-1b35de1eec48`.
  6. Executes OAuth refresh request via `axios.post('https://api.hubapi.com/oauth/v1/token')`.
  - **API Authorization Header:** `Bearer ${accessToken}`.
* **In Authoritative Repository Baseline (`avani-loan-services` @ `32be26e`):**
  1. In-memory `accessToken` (if valid and not expired).
  2. Re-reads `../../.env` for `HUBSPOT_REFRESH_TOKEN`.
  3. Validates that `HUBSPOT_REFRESH_TOKEN` is not empty or placeholder.
  4. Executes OAuth refresh request via `axios.post('https://api.hubapi.com/oauth/v1/token')`.
  - **API Authorization Header:** `Bearer ${accessToken}`.

### A3. Private App Fallback
* **Status:** Uncommitted local testing patch in `1-AVANI LOAN SERVICE FY 26-27/src/utils/hubSpot.cjs`.
* **Verdict:** **NOT REQUIRED / OBSOLETE FOR PRODUCTION OAUTH**.
* **Forensic Justification:**
  - This bypass was introduced solely for local offline testing with a developer PAT to prevent HTTP 400 errors from sending a PAT to the OAuth refresh endpoint.
  - It is completely absent from GitHub `main` (`32be26e`) and does not exist in the Vercel production build.
  - Once standard OAuth credentials and refresh tokens are properly synchronized in Vercel Production, this local fallback is unnecessary.

### A4. OAuth Application Identity Discrepancy
* **Configured in Vercel Production:** Legacy Client ID `6390fa27-bd77-4151-9311-fc2fb50b91d2` (configured ~10 September 2026).
* **Authorized Developer App (Image 3):** Developer App `AVANI AI CRM` (App ID `41895712`) with Client ID `14724c1b-c099-4ccf-baef-65c209212731`.
* **Private App (Image 4):** Private App ID `52495852` with bearer access token (`pat-na2-...`).
* **Verdict:**
  - The newly authorized browser callback (Image 1) generated an authorization code against Client ID `14724c1b-c099-4ccf-baef-65c209212731`.
  - The two Client IDs represent **two separate HubSpot application entities**.
  - The Private App (`52495852`) is an entirely distinct authentication entity from the Public OAuth App (`41895712`).
  - There is **no legitimate reason** for production to continue using the legacy Client ID `6390fa27...`. Vercel Production must be aligned with `14724c1b-c099-4ccf-baef-65c209212731`.

---

## 3. Vercel Production Configuration Matrix

**Target:** Authoritative Vercel Project `avani-loan-services` (`prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`)  
**Scope:** Production Environment Variables (Secrets MASKED)

| Variable Name | Consumer in Code | Vercel Prod Status | Value Integrity / Note | Production Required? |
| :--- | :--- | :---: | :--- | :---: |
| **`HUBSPOT_CLIENT_ID`** | `src/routes/auth.cjs`, `src/utils/hubSpot.cjs` | **PRESENT (MISMATCH)** | Set to legacy ID `6390fa27...`; needs active `14724c1b...` | **YES** |
| **`HUBSPOT_CLIENT_SECRET`** | `src/routes/auth.cjs`, `src/utils/hubspotSignature.cjs` | **PRESENT [MASKED]** | Encrypted value from legacy setup; needs alignment | **YES** |
| **`HUBSPOT_REFRESH_TOKEN`** | `src/utils/hubSpot.cjs` | **PRESENT (STALE)** | Holds placeholder `na2-99de-b4d2-4640-af6a-1b35de1eec48` | **YES** |
| **`HUBSPOT_REDIRECT_URI`** | `src/routes/auth.cjs` | **PRESENT** | `https://www.avanifinserv.com/api/auth/hubspot/callback` | **YES** |
| **`HUBSPOT_PORTAL_ID`** | `src/routes/crm.cjs` | **MISSING** | Missing; falls back to code default `'244236573'` | **YES** |
| **`VITE_HUBSPOT_PORTAL_ID`** | `src/components/HubspotLeadForm.jsx` | **MISSING** | Missing; falls back to code default `'244236573'` | **RECOMMENDED** |
| **`VITE_HUBSPOT_FORM_ID`** | `src/components/HubspotLeadForm.jsx` | **MISSING** | Missing; falls back to default form GUID | **RECOMMENDED** |
| **`HUBSPOT_ACCESS_TOKEN`** | None in production code | **MISSING** | Not expected in standard OAuth architecture | **NO** |
| **`HUBSPOT_PRIVATE_APP_TOKEN`** | None in production code | **MISSING** | Not expected in standard OAuth architecture | **NO** |

**Production Mode Classification:** **Hybrid / Ambiguous (Stale OAuth Credentials)**.

---

## 4. HubSpot Contact Schema Matrix

Inspected live against HubSpot Portal `244236573` via read-only CRM Properties API (`GET /crm/v3/properties/contacts/{name}`).

| Property Name | Exists in Portal? | Internal Name | Type | Field Type | Writable? | Allowed Values / Enumeration Options | Current Code Status |
| :--- | :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **First Name** | **YES** | `firstname` | string | text | **YES** | Free text | Correct (`firstname`) |
| **Last Name** | **YES** | `lastname` | string | text | **YES** | Free text | Correct (`lastname`) |
| **Email** | **YES** | `email` | string | text | **YES** | Valid email address syntax | Correct (`email`) |
| **Phone** | **YES** | `phone` | string | phonenumber | **YES** | Valid phone number | Correct (`phone`) |
| **City** | **YES** | `city` | string | text | **YES** | Free text | Correct (`city`) |
| **Loan Type (Custom)** | **NO** | `loan_type__c` | — | — | — | **HTTP 404 Not Found** | **INCORRECT** |
| **Loan Amount (Custom)**| **NO** | `loan_amount` | — | — | — | **HTTP 404 Not Found** | **INCORRECT** |
| **Monthly Income (Custom)**| **NO** | `monthly_income` | — | — | — | **HTTP 404 Not Found** | **INCORRECT** |
| **Avani Lead ID (Custom)**| **NO** | `avani_lead_id` | — | — | — | **HTTP 404 Not Found** | **INCORRECT** |
| **Source (Custom)** | **NO** | `source` | — | — | — | **HTTP 404 Not Found** | **INCORRECT** |
| **Lead Status** | **YES** | `hs_lead_status` | enumeration | radio | **YES** | `NEW`, `OPEN`, `IN_PROGRESS`, `OPEN_DEAL`, `UNQUALIFIED`, `ATTEMPTED_TO_CONTACT`, `CONNECTED`, `BAD_TIMING` | **INCORRECT CASING** (Sends `'New'` / `'Pending'`) |
| **Lead ID (Portal)** | **YES** | `lead_id` | string | text | **YES** | Free text (Label: "Lead ID") | Not referenced in current code |
| **Loan Type (Portal)** | **YES** | `loan_type` | enumeration | select | **YES** | `personal_salary_loan`, `business_loan`, `doctor_loan`, `home_loan`, `mortgage_loan`, `education_loan_india`, `education_loan_global` | Not referenced in current code |
| **Loan Amount Req.** | **YES** | `loan_amount_required` | number | number | **YES** | Numeric value (Label: "Loan amount required") | Not referenced in current code |
| **Monthly Income (Portal)**| **YES** | `what_is_your_monthly_income` | string | text | **YES** | Free text (Label: "What is your monthly income?") | Not referenced in current code |

---

## 5. Authoritative AVANI Mapping Matrix

Authoritative alignment between AVANI lead payload fields and verified active HubSpot properties:

| AVANI Field | Current Code Property | HubSpot Actual Property | Data Transformation Required | Confidence |
| :--- | :--- | :--- | :--- | :---: |
| **Full Name / First** | `firstname` | `firstname` | Extract first name token: `(name \|\| '').split(' ')[0]` | **100%** |
| **Last Name** | `lastname` | `lastname` | Extract remaining tokens: `(name \|\| '').split(' ').slice(1).join(' ')` | **100%** |
| **Mobile Number** | `phone` | `phone` | Direct mapping (normalized 10-digit or E.164 string) | **100%** |
| **Email Address** | `email` | `email` | Direct mapping (must use valid TLD; reject `.invalid`) | **100%** |
| **City** | `city` | `city` | Direct mapping | **100%** |
| **Loan Product** | `loan_type__c` | `loan_type` | Map display string to internal enum: <br>• [[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan) ➔ `business_loan`<br>• Personal / [[[[[[[[[[[[[[Salary Loan](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan) ➔ `personal_salary_loan`<br>• Doctor Loan ➔ `doctor_loan`<br>• [[[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan) ➔ `home_loan`<br>• Mortgage Loan ➔ `mortgage_loan`<br>• [Education Loan](/services/education-loan) (India) ➔ `education_loan_india`<br>• Education Loan (Global) ➔ `education_loan_global` | **100%** |
| **Required Amount** | `loan_amount` | `loan_amount_required` | Parse numeric value: `Number(meta.amount \|\| 0)` | **100%** |
| **Monthly Income** | `monthly_income` | `what_is_your_monthly_income` | Direct string mapping: `meta.monthlyIncomeRange \|\| meta.monthlyIncome` | **100%** |
| **Applicant ID** | `avani_lead_id` | `lead_id` | Direct string mapping: `meta.leadId \|\| meta.avaniLeadId` | **100%** |
| **Lead Source** | `source` | *Omit / Custom* | Custom property `source` does not exist in portal. Omit from contacts payload or create `source` custom text field in portal. | **100%** |
| **Lead Status** | `hs_lead_status` | `hs_lead_status` | Map incoming status to uppercase enum: <br>`'New'` / `'Pending'` ➔ `'NEW'` | **100%** |

---

## 6. Required Remediation

### CONFIGURATION REMEDIATION (Vercel Production Settings)
1. **Update `HUBSPOT_CLIENT_ID`:** Set to `14724c1b-c099-4ccf-baef-65c209212731` in Vercel Production.
2. **Update `HUBSPOT_CLIENT_SECRET`:** Set to matching client secret `[MASKED]` from Developer App `41895712`.
3. **Update `HUBSPOT_REFRESH_TOKEN`:** Set to active refresh token generated during browser authorization.
4. **Set `HUBSPOT_PORTAL_ID`:** Explicitly set to `244236573` in Vercel Production.
5. **Verify `HUBSPOT_REDIRECT_URI`:** Ensure exact URI matches `https://www.avanifinserv.com/api/auth/hubspot/callback`.

### CODE REMEDIATION (`src/utils/hubSpot.cjs`)
1. **Update Property Names:** Replace non-existent custom properties with portal-native properties:
   - `loan_type__c` ➔ `loan_type`
   - `loan_amount` ➔ `loan_amount_required`
   - `monthly_income` ➔ `what_is_your_monthly_income`
   - `avani_lead_id` ➔ `lead_id`
   - Remove `source` (or map to valid portal property).
2. **Implement Enumeration Normalizers:**
   - Map `meta.loanType` to valid `loan_type` options (`business_loan`, etc.).
   - Normalize `hs_lead_status` to strictly uppercase values (`NEW`, `OPEN`, `IN_PROGRESS`, etc.), defaulting to `'NEW'`.
   - Ensure `loan_amount_required` is sanitized to a number.

---

## 7. Controlled Write Preconditions

Before executing another controlled synthetic write test (Gate 3 rerun), all of the following conditions must be satisfied:
1. [ ] Vercel Production environment variables updated and redeployed.
2. [ ] `src/utils/hubSpot.cjs` property mapping and enumeration logic aligned with Portal `244236573` schema.
3. [ ] Code changes committed and pushed to GitHub `main` (`avani-loan-services/avani-loan-services`).
4. [ ] Synthetic lead payload updated to use an RFC 2606 compliant email address (e.g. `avani-test-20260914@example.com`).
5. [ ] Prior synthetic contact confirmed absent (`HTTP 404`) in HubSpot Portal `244236573`.

---

## 8. Security Findings

* **Zero Secret Exposure:** No access tokens, refresh tokens, client secrets, Private App tokens, authorization codes, or user passwords were leaked or printed in plaintext during this gate.
* **Timing-Safe Verifier Verified:** `src/utils/hubspotSignature.cjs` correctly utilizes `crypto.timingSafeEqual` and enforces a strict 5-minute replay window for incoming HubSpot webhooks.
* **Environment Isolation Maintained:** Local environment settings and secrets were isolated from production.

---

## 9. Scope Isolation Audit

Explicit confirmation of zero external mutations during this gate:
* **AVANI AGRO FOODS:** **NOT TOUCHED** (Zero references, zero network calls).
* **Meta / Facebook / WhatsApp:** **NOT TOUCHED** (Zero campaigns, zero spend, zero API calls).
* **Google Sheets:** **NOT TOUCHED** (Zero rows appended or modified).
* **MongoDB:** **NOT TOUCHED** (Zero documents inserted, updated, or deleted).
* **Production Application Code:** **NOT MODIFIED** (Zero lines changed in source files).
* **Vercel Production Configuration:** **NOT MODIFIED** (Zero environment variables added, changed, or deleted).
* **HubSpot CRM Records:** **NOT MODIFIED** (Zero contacts, properties, or records created, updated, or deleted).

---

## 10. Verification Evidence Log

* **Workspace Path:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`
* **Git Status:** Clean baseline verified at commit `32be26eea389939787f49b7057962bd661e2f0b5`.
* **API Endpoints Queried (Read-Only):**
  - `GET https://api.hubapi.com/account-info/v3/details` ➔ HTTP 200 OK (Portal `244236573`, `STANDARD`, `na2`)
  - `GET https://api.hubapi.com/crm/v3/properties/contacts/{property_name}` ➔ HTTP 200 OK for standard properties & portal fields (`lead_id`, `loan_type`, `loan_amount_required`, `what_is_your_monthly_income`, `hs_lead_status`); HTTP 404 for obsolete code fields (`loan_type__c`, `loan_amount`, `monthly_income`, `avani_lead_id`, `source`).
* **Source Files Inspected (Read-Only):**
  - `src/routes/auth.cjs`
  - `src/utils/hubSpot.cjs`
  - `src/utils/hubspotSignature.cjs`
  - `src/routes/crm.cjs`
  - `src/server.cjs`
  - `vercel.json`
  - `.env.example`
