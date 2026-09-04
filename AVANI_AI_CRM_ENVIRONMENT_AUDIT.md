# AVANI AI CRM — ENVIRONMENT AUDIT & CREDENTIAL MATRIX

**Document ID**: `AVANI_AI_CRM_ENVIRONMENT_AUDIT.md`  
**Execution Timestamp**: 2026-08-11  
**Audit Purpose**: Complete forensic audit of environment variables, database targets, provider modes, and security isolation.

---

## 1. Environment Variable Forensic Audit Matrix

| Variable Name | Present? | Active Environment | Expected Purpose | Validation & Safety Check | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `APP_MODE` | Yes | Local (`test`) | System Execution Mode | Set to `test`. Enforces crash guard if prod DB is targeted | **PASS** |
| `PROVIDER_MODE` | Yes | Local (`mock`) | Provider Dispatch Mode | Set to `mock`. Prevents accidental live messaging during testing | **PASS** |
| `MONGODB_URI` | Yes | Local (`avani_ai_crm_test`) | Primary Database | Points to `mongodb://localhost:27017/avani_ai_crm_test` (In-memory fallback active) | **PASS** |
| `INTERNAL_WORKER_SECRET` | Yes | Local / Staging | Worker Authentication | Middleware `x-worker-auth` verified (401 on missing/invalid secret) | **PASS** |
| `META_WEBHOOK_VERIFY_TOKEN` | Yes | Local / Production | Webhook Verification | Endpoint `/api/whatsapp-webhook` GET subscriber challenge verified | **PASS** |
| `WHATSAPP_PHONE_NUMBER_ID` | Missing | Local `.env` | Meta WhatsApp Phone ID | Missing in local `.env`. Default fallback `2049842548930849` used | **UNVERIFIED** |
| `AISENSY_API_KEY` | Missing | Local `.env` | AiSensy Campaign API | Missing in local `.env`. Fail-closed active in production mode | **UNVERIFIED** |
| `OMNIDM_API_KEY` | Missing | Local `.env` | OmniDM Voice Call API | Missing in local `.env`. Fail-closed active in production mode | **UNVERIFIED** |
| `OMNIDM_AGENT_ID` | Missing | Local `.env` | OmniDM AI Agent ID | Missing in local `.env`. Mock Call ID generated during test | **UNVERIFIED** |
| `GEMINI_API_KEY` | Present | Local / Production | AI Entity Extractor | Validated key present (`AQ.Ab8RN6J...`). Schema parser active | **PASS** |
| `HUBSPOT_API_KEY` | Placeholder | Local `.env` | HubSpot CRM Sync | Set to `YOUR_HUBSPOT_API_KEY`. Mock idempotency active | **UNVERIFIED** |
| `ZAPIER_WEBHOOK_URL` | Present | Local / Production | Zapier Webhook Dispatch | Present (`https://hooks.zapier.com/hooks/catch/27857507/...`) | **PASS** |
| `GOOGLE_SHEETS_ID` | Present | Local / Production | Google Sheet Sync | Present (`1rtLbnT1jTv2U_nEbbNu8C9tn1kyKnEMfp1bY8noib2E`) | **PASS** |

---

## 2. Stale & Contaminated Variable Audit

1. **Vapi Legacy Variables**:
   - `VAPI_API_KEY`, `VAPI_ASSISTANT_ID`, `VAPI_PHONE_NUMBER` found in `.env.production`.
   - **Recommendation**: Archive legacy Vapi variables to avoid confusion with OmniDM voice calling engine.

2. **Database Cross-Contamination Check**:
   - `avani_ai_crm_prod` is NOT present in local `.env`.
   - Hard safety startup guard `validateEnvironmentIsolation()` active. Zero production database touchpoints detected.

3. **Frontend API URL**:
   - `VITE_BACKEND_URL` set to `https://www.avanifinserv.com/api`.
   - Webhook callback router mounted on `/api/whatsapp-webhook`.
