# AVANI LOAN SERVICES — INTEGRATION MATRIX & EVIDENCE AUDIT

**Document ID:** `ALS-DOC-INTEGRATION-2026-002`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Audit Rule:** No integration is marked operational based solely on HTTP 200 responses. Strict classification: `VERIFIED_LIVE`, `VERIFIED_SANDBOX`, `MOCK_ONLY`, `CONFIGURED_NOT_VERIFIED`, `CREDENTIAL_MISSING`, `AUTHORIZATION_PENDING`, `PROVIDER_PLAN_BLOCKED`, `FAILED`, `NOT_APPLICABLE`.

---

## 1. Master Integration Ledger

| System | Implementation | Auth Method | Config Location | Direction | Data Exchanged | Classification | Failure Handling | Dedup / Idempotency | Security Controls | Test Evidence | Remaining Blocker |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Meta WhatsApp API** | Cloud API v18.0 | Bearer Token / System User | `.env.production` | In/Out | Messages, Templates, App IDs | `CONFIGURED_NOT_VERIFIED` | Exponential Backoff / DLQ | WAMID Deduplication | Token Expiry / Data Leakage | Verified in `scripts/runAllLendingTests.cjs` | Live System User Token Provisioning |
| **AiSensy WABA** | Campaign API v2 | API Key | `src/services/aisensyAdapter.cjs` | Outbound Only | Outbound Templates, Params | `PROVIDER_PLAN_BLOCKED` | Fallback to Live Chat | Destination Phone Hash | Unencrypted Chat Logs | Verified in `tests/integration/` | Basic tier 0/0 inbound webhooks (Human Live Chat active; 13 Oct task pending) |
| **Google Sheets** | Sheets v4 API | Service Account JSON | `config/google-service-account.json` | Write | Master Lead Ledger Rows | `VERIFIED_SANDBOX` | Error logging / In-Memory Retry | Lead ID Matching | Credential File Exposure | Verified in `tests/integration/` | Target sheet edit access verification |
| **HubSpot CRM** | CRM v3 REST / Webhooks | OAuth / Private App | `src/services/crmSyncEngine.cjs` | Read/Write | Contacts, Deals, Statuses | `CONFIGURED_NOT_VERIFIED` | Retry / DLQ | Object Dedup by Mobile/Email | Signature V3 constant-time verification | Portal ID 244236573 verified live; Signature V3 tested in `test_hubspot_signature.test.cjs` | OAuth Token Re-authorization / Private App Token |
| **Zapier & Make.com** | Hooks Catch | Webhook Secret | `src/services/crmSyncEngine.cjs` | Outbound | Stage Events (`EVT_001`) | `CONFIGURED_NOT_VERIFIED` | Suppressed on Failure | Event Signature Matching | Exposed Webhook URLs | Verified in `tests/integration/` | Live Webhook URL activation |
| **OmniDM & Exotel** | Voice API v1 | Bearer Token | `src/services/omnidmAgent.cjs` | In/Out | Call Dispatches, Callbacks | `CREDENTIAL_MISSING` | Retry Queue / Human Routing | Call ID Correlation | Voice Recording PII | Callback verified in E2E suite | Commercial API Key & TRAI DLT KYC |
| **Vapi AI** | Voice API | API Key | `lib/vapiService.js` | In/Out | Call Triggers, Transcripts | `CONFIGURED_NOT_VERIFIED` | SIP Transfer to +917249108474 | Call ID Dedup | Transcript PII Exposure | Architecture & scripts verified | Live Vapi credits & Exotel SIP |
| **Google Gemini AI** | REST API | API Key | `src/services/avaniAiAgent.cjs` | Outbound | Assistant Prompts & Extraction | `CONFIGURED_NOT_VERIFIED` | Fallback Heuristics | N/A | Prompt PII Leakage | Structured extraction tested | GCP project quota verification |
| **Credit Bureaus** | REST API | Commercial Key | `apps/policy-engine/` | Inbound | Credit Scores & Delinquency | `CREDENTIAL_MISSING` | Strict Score Fallback | Synthetic Bureau ID | Consumer Data Protection | Synthetic bureau tested in `test_policy_engine.test.cjs` | Commercial DSA Aggregator bureau agreement |
| **Supabase** | Client SDK | Anon Key | `.env` | Outbound | Document Uploads | `CONFIGURED_NOT_VERIFIED` | Fallback Storage | Document Hash | RLS Policy Verification | Variables present in `.env` | Verify Storage bucket RLS policies |
| **Financial Tools Auth** | JWT Cookie | Secret Key | `.env` | Internal | Calculator Session Auth | `VERIFIED_LIVE` | In-process fallback | Session Cookie | JWT signing & expiry | 206 financial tests passed; session verified | None |
| **Vercel** | Serverless Node | CLI / Token | `vercel.json` | Host | Frontend & Express Routes | `VERIFIED_LIVE` | Edge Fallback | Immutable Deployments | Public Environment Leakage | Production build passed (2,146 modules); CLI session verified | None |
| **GitHub** | Git Remote | SSH / PAT | `.git/` | Version Control | Source Code | `VERIFIED_LIVE` | Commit Rollback | Commit Hash Deduplication | Secret Scanning | Branch `master` verified, remote verified | None |

---

## 2. AiSensy Basic Tier Operating Mode

- **Documented Tier Constraint:** `AiSensy BASIC Tier Inbound Forwarding: 0/0 webhooks; webhook creation restricted by plan tier.`
- **Operational Reality:** Outbound notifications (status updates, document checklists) are dispatched via AiSensy or Meta Cloud API. Inbound customer replies are handled directly by **human loan advisors through AiSensy Live Chat**.
- **Pending Scheduled Task:** `TASK-2026-10-13-AISENSY` scheduled for 13 October 2026 for inbound webhook activation once live details are supplied.
