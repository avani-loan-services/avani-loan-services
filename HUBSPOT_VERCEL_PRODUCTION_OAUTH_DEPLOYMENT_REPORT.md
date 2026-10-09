# AVANI LOAN SERVICES — VERCEL PRODUCTION HUBSPOT OAUTH DEPLOYMENT REPORT

**Date:** 14 September 2026  
**Gate:** Vercel Production HubSpot OAuth Configuration + Controlled Deployment Gate  
**Project:** AVANI LOAN SERVICES ONLY  
**Authoritative Local Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Authoritative GitHub Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main`  
**Authoritative Commit SHA:** `9dccba02e629762645595d360f4f97ff10b8e879`  
**Authoritative Vercel Project:** `avani-loan-services` (Project ID: `prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`, Team: `avaniloanservicelatur-4088`)  
**Production Host:** [https://www.avanifinserv.com](https://www.avanifinserv.com/)  
**HubSpot Portal ID:** `244236573`  

---

## 1. Executive Verdict

### **FINAL CLASSIFICATION: BLOCKED — OAUTH CREDENTIALS UNAVAILABLE**

### Summary:
* **Code Deployment (Gate 2 & Gate 6):** **PASS**. The authoritative GitHub commit `9dccba02e629762645595d360f4f97ff10b8e879` (`fix(hubspot): align contact payload with live portal schema`) was synchronized on `origin/main` and successfully built into production deployment `dpl_6qQG4buk7SAxz4Hf5QrAtc9RjTjP` (Status: `● Ready`). Production now serves the corrected contact payload mappings (`loan_type`, `loan_amount_required`, `what_is_your_monthly_income`, `lead_id`, uppercase `NEW`, source removed).
* **Vercel Production Credentials (Gate 3 & Gate 4):** **BLOCKED**. In accordance with Gate 4 rules, production must strictly use OAuth 2.0 Authorization Code Grant + Refresh Token architecture (zero PAT fallback). While Vercel Production contains the legacy Client ID `6390fa27...` and a placeholder refresh token (`na2-99de-b4d2-4640-af6a-1b35de1eec48`), the active authorized OAuth refresh token is **not available in environment configuration**. The local developer token is a Private App PAT (`pat-na2-...`), which the security protocol strictly prohibits from being substituted as an OAuth refresh token.
* **Gate 4 Stop Condition Applied:** Per the directive: *If valid active OAuth credentials are unavailable: BLOCKED — OAUTH CREDENTIALS UNAVAILABLE. Do NOT invent a token. Do NOT substitute a PAT.* Vercel environment variables were left unmutated to prevent credential corruption.

---

## 2. GitHub Commit Verification

* **Repository:** `avani-loan-services/avani-loan-services`
* **Local HEAD:** `9dccba02e629762645595d360f4f97ff10b8e879`
* **Remote `origin/main`:** `9dccba02e629762645595d360f4f97ff10b8e879` (Identical)
* **Commit Message:** `fix(hubspot): align contact payload with live portal schema`
* **Files Changed:** `src/utils/hubSpot.cjs` (+117, -16)
* **Status:** Clean working tree, zero drift.

---

## 3. Vercel Project Identity

* **Team Name:** `AVANI LOAN SERVICES` (`avaniloanservicelatur-4088`)
* **Project Name:** `avani-loan-services`
* **Project ID:** `prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`
* **Framework:** Vite
* **Production Aliases:**
  - `https://www.avanifinserv.com`
  - `https://avanifinserv.com`
  - `https://avani-loan-services-nine.vercel.app`
  - `https://avani-loan-services-avani-loan-services.vercel.app`
  - `https://avani-loan-services-git-main-avani-loan-services.vercel.app`

---

## 4. Production Deployment Ledger

| Deployment Attribute | Previous Deployment | Active New Production Deployment |
| :--- | :--- | :--- |
| **Deployment ID** | `dpl_5XSAJLAXMAfTbQrLmPu3z6cDRnob` | **`dpl_6qQG4buk7SAxz4Hf5QrAtc9RjTjP`** |
| **Commit SHA** | `e44455b3aaa85dfe61a61ecb97e6a16da37d66cb` | **`9dccba02e629762645595d360f4f97ff10b8e879`** |
| **Commit Message** | `fix(crm): preserve monthlyIncomeRange...` | `fix(hubspot): align contact payload with live portal schema` |
| **Deployment URL** | `https://avani-loan-services-lk88envgm-avani-loan-services.vercel.app` | `https://avani-loan-services-gd8n6s12b-avani-loan-services.vercel.app` |
| **Created Timestamp**| Sun Sep 13 2026 18:53:07 IST | **Mon Sep 14 2026 18:22:24 IST** |
| **Build Duration** | 47s | **40s** |
| **State** | Superseded | **● Ready (Production Active)** |

---

## 5. HubSpot OAuth Application Identity

* **Developer App Name:** `AVANI AI CRM`
* **HubSpot App ID:** `41895712`
* **Active Target Client ID:** `14724c1b-c099-4ccf-baef-65c209212731`
* **Vercel Current Client ID:** `6390fa27-bd77-4151-9311-fc2fb50b91d2` (Legacy setup from 4d ago)
* **Architecture:** OAuth 2.0 Authorization Code Grant (`/api/auth/hubspot/callback`) + Refresh Token (`https://api.hubapi.com/oauth/v1/token`)

---

## 6. Portal ID Verification

* **Target Portal ID:** `244236573`
* **Account Type:** `STANDARD` (Data hosting: `na2`)
* **Status:** Verified live via `GET https://api.hubapi.com/account-info/v3/details`.

---

## 7. Redirect URI Verification

* **Target Redirect URI:** `https://www.avanifinserv.com/api/auth/hubspot/callback`
* **Live Route Status:** `GET https://www.avanifinserv.com/api/auth/hubspot/callback` returns **HTTP 400 Bad Request (`Missing code parameter`)**.
* **Finding:** Route is live, publicly reachable, and actively guarded by `src/routes/auth.cjs`.

---

## 8. Required Production Variable Status

| Variable Name | Required Value / Type | Current Vercel Prod Status | Current State / Action Required |
| :--- | :--- | :---: | :--- |
| **`HUBSPOT_CLIENT_ID`** | `14724c1b-c099-4ccf-baef-65c209212731` | **PRESENT** | Stale: holds legacy `6390fa27...`; requires update |
| **`HUBSPOT_CLIENT_SECRET`** | Active OAuth App Secret | **PRESENT [MASKED]** | Stale: holds 4d-old secret; requires update |
| **`HUBSPOT_REFRESH_TOKEN`** | Active OAuth Refresh Token | **PRESENT [MASKED]** | Stale placeholder: `na2-99de-b4d2-4640-af6a-1b35de1eec48` |
| **`HUBSPOT_REDIRECT_URI`** | `https://www.avanifinserv.com/api/auth/hubspot/callback` | **PRESENT** | Valid and matched |
| **`HUBSPOT_PORTAL_ID`** | `244236573` | **MISSING** | Missing in Vercel (code falls back to `'244236573'`) |
| **`VITE_HUBSPOT_PORTAL_ID`**| `244236573` | **MISSING** | Missing in Vercel (code falls back to `'244236573'`) |
| **`VITE_HUBSPOT_FORM_ID`** | `edde042c-3451-420a-a472-6a5c42cbdf98` | **MISSING** | Missing in Vercel (code falls back to default) |
| **`HUBSPOT_ACCESS_TOKEN`** | *Prohibited* | **MISSING** | Compliant (Zero PAT tokens in production) |
| **`HUBSPOT_PRIVATE_APP_TOKEN`**| *Prohibited* | **MISSING** | Compliant (Zero PAT tokens in production) |

---

## 9. Read-Only HubSpot Verification

* **Production Root:** `GET https://www.avanifinserv.com` ➔ **HTTP 200 OK**
* **OAuth Callback Route:** `GET https://www.avanifinserv.com/api/auth/hubspot/callback` ➔ **HTTP 400 Bad Request** (`Missing code parameter`)
* **CRM Contacts API Read:** `GET https://api.hubapi.com/crm/v3/objects/contacts?limit=1` ➔ **HTTP 200 OK** (Returned 1 contact record)
* **CRM Object Mutation:** Zero contacts created, modified, or deleted.

---

## 10. Mutation Ledger

```text
HubSpot contacts created:    0
HubSpot contacts updated:    0
HubSpot contacts deleted:    0
HubSpot properties changed:  0
Meta / Facebook modified:    NO
Google Sheets modified:      NO
MongoDB modified:            NO
AVANI AGRO FOODS touched:    NO

Vercel Changes:
- Deployed authoritative commit: 9dccba02e629762645595d360f4f97ff10b8e879
- Deployment ID: dpl_6qQG4buk7SAxz4Hf5QrAtc9RjTjP
- Production Status: Ready
- Environment variables modified: NO (Halted per Gate 4)
```

---

## 11. Scope-Isolation Verification

* **AVANI AGRO FOODS:** **NOT TOUCHED** (Zero access, zero references, total isolation).
* **Meta / Facebook / WhatsApp:** **NOT TOUCHED**.
* **Google Sheets:** **NOT TOUCHED**.
* **MongoDB:** **NOT TOUCHED**.
* **Credential Hygiene:** No access tokens, refresh tokens, client secrets, PATs, passwords, OTPs, or cookies were logged, printed, or exposed.

---

## 12. Remaining Blockers

1. **OAuth Refresh Token Synchronization:**
   - Vercel Production environment variable `HUBSPOT_REFRESH_TOKEN` contains the placeholder `na2-99de-b4d2-4640-af6a-1b35de1eec48`.
   - The developer environment holds a Private App token (`pat-na2-...`), which cannot be used as an OAuth refresh token.
   - A legitimate OAuth refresh token (`grant_type: 'refresh_token'`) from Developer App `AVANI AI CRM` (`14724c1b-c099-4ccf-baef-65c209212731`) must be entered into Vercel Project Settings alongside matching `HUBSPOT_CLIENT_SECRET`.

---

## 13. Exact Next Gate

**Next Gate:** `AVANI LOAN SERVICES — HUBSPOT OAUTH REFRESH TOKEN PROVISIONING & FINAL INTEGRATION GATE`

Preconditions to clear:
1. Operator inputs the authenticated OAuth refresh token into Vercel Production settings.
2. Align `HUBSPOT_CLIENT_ID` to `14724c1b-c099-4ccf-baef-65c209212731` and set `HUBSPOT_PORTAL_ID` to `244236573`.
3. Re-audit environment variables via Vercel CLI.
4. Proceed to human-authorized synthetic lead write test.
