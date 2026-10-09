# AVANI LOAN SERVICES — HUBSPOT OAUTH RE-AUTHORIZATION AND VERCEL PRODUCTION CONFIGURATION REPORT

**Date:** 14 September 2026  
**Gate:** HubSpot OAuth Re-Authorization and Vercel Production Configuration Gate  
**Project:** AVANI LOAN SERVICES ONLY  
**Authoritative Local Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Authoritative GitHub Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main`  
**Authoritative Commit SHA:** `9dccba02e629762645595d360f4f97ff10b8e879`  
**Authoritative Vercel Project:** `avani-loan-services` (Team: `avaniloanservicelatur-4088`, Project ID: `prj_XK0cbiLQSd9YyZ5tDSps98T9WL2W`)  
**Production Domain:** [https://www.avanifinserv.com](https://www.avanifinserv.com/)  
**HubSpot Portal ID:** `244236573`  

---

## 1. OAuth Application Identity

* **Application Name:** `AVANI AI CRM`
* **App ID:** `41895712`
* **Client ID:** `14724c1b-c099-4ccf-baef-65c209212731`
* **Current Vercel Production Client ID:** `6390fa27-bd77-4151...` (Stale / legacy application reference)
* **Architecture:** OAuth 2.0 Authorization Code Grant + Refresh Token (`https://api.hubapi.com/oauth/v1/token`)

---

## 2. Portal ID

* **Authoritative Portal ID:** `244236573`
* **Account Name:** `AVANI LOAN SERVICE`
* **Account Type:** `STANDARD`
* **Data Hosting Location:** `na2`
* **Live API Confirmation:** Verified active via `GET https://api.hubapi.com/account-info/v3/details` (HTTP 200 OK)

---

## 3. OAuth Scopes

* **Requested Scopes:**
  1. `oauth`
  2. `crm.objects.contacts.read`
  3. `crm.objects.contacts.write`
* **Scope Scope Verification:** Exact scopes specified in the official HubSpot OAuth installation URL and verified available on portal `244236573`.

---

## 4. Redirect URI

* **Configured Redirect URI:** `https://www.avanifinserv.com/api/auth/hubspot/callback`
* **Route Implementation:** Handled by `src/routes/auth.cjs` on the live serverless production deployment.
* **Live Guard Verification:** `GET https://www.avanifinserv.com/api/auth/hubspot/callback` without `?code=` query parameter returns **HTTP 400 Bad Request** (`Missing code parameter`), confirming the endpoint is active and validating inbound parameters.

---

## 5. Authorization Result

* **Authorization URL Navigated:**  
  `https://app.hubspot.com/oauth/authorize?client_id=14724c1b-c099-4ccf-baef-65c209212731&redirect_uri=https://www.avanifinserv.com/api/auth/hubspot/callback&scope=oauth%20crm.objects.contacts.read%20crm.objects.contacts.write`
* **Redirect / Landing Target:** `https://app.hubspot.com/oauth-bridge?...` ("OAuth Bridge UI")
* **Flow State:** The official HubSpot OAuth Bridge was reached successfully. The interface presented user authentication prompts (*"Connecting your AVANI AI CRM account to HubSpot"* / *"Sign in to your HubSpot account"*).
* **Security Protocol Adherence:** Under the strict security rules governing this gate:
  - No inspection of browser cookies, saved passwords, Chrome Local State, or credential stores.
  - No user credential solicitation in chat.
  - No manual fabrication of authorization codes.
* **Result:** **FAIL / INCOMPLETE** (Flow cannot be completed autonomously; requires human portal login and consent grant).

---

## 6. Token Exchange Result

* **Authorization Code Issuance:** None (Awaiting human authentication on HubSpot OAuth Bridge).
* **Exchange Execution:** `https://api.hubapi.com/oauth/v1/token` exchange was not executed in this run.
* **Token Exchange Status:** **FAIL**

---

## 7. Refresh-Token Availability

* **Refresh-token received:** **NO**
* **Active OAuth Refresh Token Available:** **NO**  
  *(In strict accordance with Gate 3 and Gate 4 rules, the local Private App PAT was NOT substituted as an OAuth refresh token).*

---

## 8. Vercel Production Configuration Result

* **Action:** **HALTED (Zero Environment Mutations)**
* **Rationale:** Per Gate 4 rules: *"Only after Gate 3 succeeds, configure ONLY the authoritative AVANI LOAN SERVICES Vercel Production environment. If refresh token is not successfully obtained: STOP."*
* **Current Vercel Production State (Unchanged):**
  - `HUBSPOT_CLIENT_ID`: Stale (`6390fa27-bd77-4151...`)
  - `HUBSPOT_CLIENT_SECRET`: Stale `[MASKED]`
  - `HUBSPOT_REFRESH_TOKEN`: Stale placeholder (`na2-99de-b4d2-4640-af6a-1b35de1eec48`)
  - `HUBSPOT_REDIRECT_URI`: `https://www.avanifinserv.com/api/auth/hubspot/callback`
  - `HUBSPOT_PORTAL_ID`: Missing in Vercel (falls back to code default `'244236573'`)
  - `VITE_HUBSPOT_PORTAL_ID`: Missing in Vercel
  - `VITE_HUBSPOT_FORM_ID`: Missing in Vercel
  - `HUBSPOT_ACCESS_TOKEN`: Missing (Compliant — zero PAT tokens in production)
  - `HUBSPOT_PRIVATE_APP_TOKEN`: Missing (Compliant — zero PAT tokens in production)

---

## 9. Deployment ID

* **Active Production Deployment ID:** `dpl_6qQG4buk7SAxz4Hf5QrAtc9RjTjP`
* **Deployment URL:** `https://avani-loan-services-gd8n6s12b-avani-loan-services.vercel.app`
* **Production Aliases:** `https://www.avanifinserv.com`, `https://avanifinserv.com`
* **Deployment Status:** `● Ready`
* **New Deployment Triggered:** **NO** (Suppressed per Gate 5 preconditions).

---

## 10. Deployment Commit

* **Commit SHA:** `9dccba02e629762645595d360f4f97ff10b8e879`
* **Commit Message:** `fix(hubspot): align contact payload with live portal schema`
* **Branch:** `main` (synchronized with `origin/main`)

---

## 11. Read-Only HubSpot Verification

* **Production Domain:** `GET https://www.avanifinserv.com` ➔ **HTTP 200 OK**
* **Callback Route:** `GET https://www.avanifinserv.com/api/auth/hubspot/callback` ➔ **HTTP 400 Bad Request** (`Missing code parameter`)
* **Portal Metadata:** `GET https://api.hubapi.com/account-info/v3/details` ➔ **HTTP 200 OK** (`portalId: 244236573`, `accountType: STANDARD`, `dataHostingLocation: na2`)
* **Contacts API Read:** `GET https://api.hubapi.com/crm/v3/objects/contacts?limit=1` ➔ **HTTP 200 OK** (Returned 1 contact record)
* **Serverless Token Refresh with Current Vercel Token:** Placeholder token cannot refresh against HubSpot OAuth endpoints.
* **CRM Object Mutation:** Zero contacts created. Zero contacts updated. Zero contacts deleted. Zero properties modified.

---

## 12. Mutation Ledger

```text
HubSpot contacts created:       0
HubSpot contacts updated:       0
HubSpot contacts deleted:       0
HubSpot properties modified:    0

Meta modified:                  NO
Google Sheets modified:         NO
MongoDB modified:               NO
AVANI AGRO FOODS touched:       NO

Vercel Production env modified: NO (Halted at Gate 3 Stop Condition)
Vercel Deployment executed:     NO (Retained active deployment dpl_6qQG4buk7SAxz4Hf5QrAtc9RjTjP)
```

---

## 13. Scope Isolation

* **AVANI AGRO FOODS:** **NOT TOUCHED** (Complete organizational and credential isolation).
* **Meta / Facebook / WhatsApp:** **NOT TOUCHED** (Zero API calls, zero campaign or webhook modifications).
* **Google Sheets:** **NOT TOUCHED** (Zero spreadsheet appends or updates).
* **MongoDB Atlas:** **NOT TOUCHED** (Zero database writes or alterations).
* **Credential Hygiene:** Zero tokens, passwords, secrets, OTPs, or authorization codes were printed, logged, committed, or exposed.

---

## 14. Remaining Blockers

1. **Human Interactive OAuth Grant on HubSpot Portal:**
   - The OAuth authorization URL (`https://app.hubspot.com/oauth/authorize?client_id=14724c1b-c099-4ccf-baef-65c209212731&redirect_uri=https://www.avanifinserv.com/api/auth/hubspot/callback&scope=oauth%20crm.objects.contacts.read%20crm.objects.contacts.write`) requires an authenticated user session in the browser to select portal `244236573` and click "Connect app".
2. **Vercel Production Environment Alignment:**
   - Once human authorization provides the authorized OAuth refresh token, Vercel Production requires the following variables:
     - `HUBSPOT_CLIENT_ID`: `14724c1b-c099-4ccf-baef-65c209212731`
     - `HUBSPOT_CLIENT_SECRET`: `[MASKED]`
     - `HUBSPOT_REFRESH_TOKEN`: `[AUTHORIZED_OAUTH_REFRESH_TOKEN]`
     - `HUBSPOT_PORTAL_ID`: `244236573`
     - `VITE_HUBSPOT_PORTAL_ID`: `244236573`
     - `VITE_HUBSPOT_FORM_ID`: `edde042c-3451-420a-a472-6a5c42cbdf98`

---

## 15. Exact Next Gate

**Next Gate:** `AVANI LOAN SERVICES — HUMAN HUBSPOT OAUTH CONSENT & PRODUCTION CREDENTIAL SYNC GATE`

### Actionable Steps for the Operator:
1. In your regular authenticated browser where you are logged into HubSpot Portal `244236573`:
   - Open:  
     `https://app.hubspot.com/oauth/authorize?client_id=14724c1b-c099-4ccf-baef-65c209212731&redirect_uri=https://www.avanifinserv.com/api/auth/hubspot/callback&scope=oauth%20crm.objects.contacts.read%20crm.objects.contacts.write`
   - Select portal **`244236573` (AVANI LOAN SERVICE)** and approve the scopes.
2. In the Vercel Dashboard for project `avani-loan-services` (or via Vercel CLI):
   - Set `HUBSPOT_CLIENT_ID` to `14724c1b-c099-4ccf-baef-65c209212731`.
   - Set `HUBSPOT_CLIENT_SECRET` to the active OAuth client secret.
   - Set `HUBSPOT_REFRESH_TOKEN` to the newly generated OAuth refresh token.
   - Set `HUBSPOT_PORTAL_ID` to `244236573`.
   - Set `VITE_HUBSPOT_PORTAL_ID` to `244236573`.
   - Set `VITE_HUBSPOT_FORM_ID` to `edde042c-3451-420a-a472-6a5c42cbdf98`.
3. Proceed to the subsequent redeployment and controlled synthetic write gate.

---

## FINAL VERDICT

```text
BLOCKED — HUBSPOT OAUTH AUTHORIZATION INCOMPLETE
```
