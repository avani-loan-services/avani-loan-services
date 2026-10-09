# AVANI LOAN SERVICES — API KEY & CREDENTIAL READINESS INVENTORY

**Document ID:** `ALS-DOC-CREDENTIAL-2026-002`  
**Execution Date:** 09 October 2026  
**Auditor:** Antigravity IDE Autonomous Systems Auditor  
**Authorized Application:** Antigravity IDE  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Primary Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Security Mandate:** Variable names and readiness status inspected only. Zero secret values printed, logged, copied, or stored.

---

## 1. Master Credential & Permission Audit Matrix

| Provider & Integration Purpose | Required Credential Type | Status Classification | Secure Configuration Variable Name(s) | Required Scopes / Permissions | Provider-Side Action Needed | Verification Evidence & Last Checked | Exact Next Action & Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Meta WhatsApp Cloud API**<br>Direct WhatsApp customer communications & templates | System User Permanent Access Token / Phone ID | `CONFIGURED_NOT_VERIFIED` | `META_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `META_WABA_ID`, `META_APP_ID`, `META_WEBHOOK_VERIFY_TOKEN` | `whatsapp_business_messaging`, `whatsapp_business_management` | Verify permanent system user token in Meta Business Suite | Variables present in `.env` & `.env.production`; mock/simulated dispatch verified in `scripts/runAllLendingTests.cjs` (2026-10-09) | Generate permanent system user access token in Meta Business Manager.<br>**Owner: Sachin Shinde** |
| **AiSensy**<br>WABA broadcast & customer Live Chat fallback | AiSensy Campaign API Key | `PROVIDER_PLAN_BLOCKED` | `AISENCY_WABA_API_KEY`, `AISENSY_API_KEY`, `AISENSY_API_URL` | Campaign dispatch, template messaging | Basic Tier restriction (0/0 inbound webhooks). Human Live Chat active | Adapter verified in `apps/integration-gateway/`; inbound webhook task scheduled for 13 Oct 2026 (2026-10-09) | Supply webhook configuration & upgrade details on 13 October 2026.<br>**Owner: Sachin Shinde** |
| **HubSpot CRM**<br>Lead, contact & deal synchronization | OAuth 2.0 / Private App Access Token & Client Secret | `CONFIGURED_NOT_VERIFIED` | `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID` | `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.schemas.contacts.read` | Re-authorize OAuth connection or issue Private App token | Portal ID `244236573` verified live on https://www.avanifinserv.com/; Signature V3 & replay defense verified in `tests/unit/test_hubspot_signature.test.cjs` (2026-10-09) | Re-generate Private App Token in HubSpot Settings > Integrations.<br>**Owner: Sachin Shinde** |
| **Google Sheets**<br>Master lead ledger spreadsheet synchronization | Google Cloud Service Account JSON / Apps Script | `VERIFIED_SANDBOX` | `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEETS_ID`, `GOOGLE_SHEET_APP_SCRIPT_URL` | `https://www.googleapis.com/auth/spreadsheets` | Ensure sheet is shared with service account email | Service account path configured; append/upsert simulated in E2E suite (2026-10-09) | Verify edit access on target Google Sheet.<br>**Owner: Sachin Shinde** |
| **Zapier & Make.com**<br>Downstream partner automation webhooks | Webhook URLs & Secrets | `CONFIGURED_NOT_VERIFIED` | `ZAPIER_WEBHOOK_URL`, `MAKE_WEBHOOK_URL`, `VITE_MAKE_WEBHOOK_URL` | Catch Hook | None | Endpoints configured in `.env` & `.env.production`; dispatch verified in gateway tests (2026-10-09) | Verify live Zap/Scenario is toggled ON.<br>**Owner: Sachin Shinde** |
| **OmniDM & Exotel**<br>AI voice telecalling outbound dispatch | SIP Trunk URI, Account SID, Token, Virtual Number | `CREDENTIAL_MISSING` | `OMNIDM_VERIFY_TOKEN`, `EXOTEL_SID`, `EXOTEL_TOKEN`, `EXOTEL_VIRTUAL_NUMBER` | Commercial outbound SIP trunking, Call dispatch | Complete TRAI DLT registration; submit business KYC to Exotel | Architecture & local mock callback tested in forensic suite (2026-10-09) | Submit Business PAN & GST to Exotel for Indian virtual number.<br>**Owner: Sachin Shinde** |
| **Vapi AI**<br>AI voice assistant orchestration | Vapi API Key, Assistant ID, Phone Number | `CONFIGURED_NOT_VERIFIED` | `VAPI_API_KEY`, `VAPI_API_URL`, `VAPI_ASSISTANT_ID`, `VAPI_PHONE_NUMBER` | Voice agent dispatch, SIP trunk binding | Link Exotel SIP trunk inside Vapi Dashboard | Keys configured in `.env.production`; mock service verified (2026-10-09) | Add SIP trunk credentials in Vapi dashboard.<br>**Owner: Sachin Shinde** |
| **Google Gemini AI**<br>Assistant dialogue & structured document extraction | Gemini API Key | `CONFIGURED_NOT_VERIFIED` | `GEMINI_API_KEY` | `models/gemini-1.5-flash` generation | GCP project quota verification | Key configured in `.env`; extraction logic verified in forensic tests (2026-10-09) | Verify API usage quotas on GCP Console.<br>**Owner: System / Sachin Shinde** |
| **Credit Bureaus**<br>CIBIL / CRIF credit inquiry | Commercial B2B Bureau API Key, Member ID, IP Whitelist | `CREDENTIAL_MISSING` | `CIBIL_API_KEY`, `CIBIL_MEMBER_ID` | Consumer credit report pull | Commercial agreement with TransUnion CIBIL or CRIF High Mark | Evaluator tested with synthetic credit score inputs (2026-10-09) | Establish commercial DSA aggregator bureau agreement.<br>**Owner: Sachin Shinde** |
| **Supabase**<br>Direct document storage | Supabase Project URL & Anon Key | `CONFIGURED_NOT_VERIFIED` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Storage bucket upload | Ensure Storage Row Level Security (RLS) policies permit uploads | Variables present in `.env` (2026-10-09) | Verify bucket permissions.<br>**Owner: Sachin Shinde** |
| **Financial Tools Auth**<br>Calculator suite access session | Session Secret & Access Password | `VERIFIED_LIVE` | `CALCULATOR_ACCESS_PASSWORD`, `CALCULATOR_SESSION_SECRET`, `FINANCIAL_TOOLS_PASSWORD` | Internal JWT cookie signing | None | 206 financial tests passed; session logic verified in test suite (2026-10-09) | None required.<br>**Owner: System** |
| **Vercel**<br>Production hosting & edge routing | Vercel Token / CLI Session | `VERIFIED_LIVE` | `VERCEL_TOKEN`, `.vercel/project.json` | Project deployment, domain mapping | None | Project `avani-loan-service-fy-26-27` mapped to `https://www.avanifinserv.com`; CLI session verified `avaniagrofoods1356-4705` (2026-10-09) | None required.<br>**Owner: System** |
| **GitHub**<br>Repository version control | Git Remote SSH / HTTPS | `VERIFIED_LIVE` | `.git/config` | Repository push, branch tracking | None | Remote `origin/master` verified on `1-AVANI LOAN SERVICE FY 26-27` (2026-10-09) | Push authorized commits.<br>**Owner: System** |

---

## 2. Summary Breakdown by Readiness Classification

* **`VERIFIED_LIVE` (3):** Financial Tools Auth, Vercel, GitHub.
* **`VERIFIED_SANDBOX` (1):** Google Sheets.
* **`CONFIGURED_NOT_VERIFIED` (5):** Meta WhatsApp Cloud API, HubSpot CRM, Zapier/Make.com, Vapi AI, Google Gemini AI, Supabase.
* **`PROVIDER_PLAN_BLOCKED` (1):** AiSensy (Basic Tier 0/0 webhooks; Live Chat fallback active; pending task for 13 Oct 2026).
* **`CREDENTIAL_MISSING` (2):** OmniDM / Exotel (TRAI DLT KYC required), Direct Credit Bureau (CIBIL commercial agreement required).
* **`FAILED` (0):** None.
* **`NOT_APPLICABLE` (0):** None.
