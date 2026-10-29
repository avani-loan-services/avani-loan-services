# AVANI LOAN SERVICES — API & CREDENTIAL READINESS INVENTORY

**Document ID:** `ALS-DOC-CREDS-2026-003`  
**Execution Date:** 25 October 2026  
**Owner & Managing Director:** Sachin Shinde (`+91 72491 08474` / `+91 91756 35165`)  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Primary Execution Workspace:** `1-AVANI LOAN SERVICE FY 26-27`  
**Security Policy:** Strict least-privilege inventory. Never log, print, or commit raw secret tokens.

---

## 1. Multi-Workspace Credential Inventory

| Workspace | Service / Provider | Environment Variable Name | Status | Purpose | Fallback / Mitigation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Workspace 1** | Meta WhatsApp Cloud API | `META_WHATSAPP_TOKEN` | **`BLOCKED — OWNER ACTION REQUIRED`** | Direct outbound template messages | Fallback to AiSensy Campaign API v2 |
| **Workspace 1** | Meta Phone Number ID | `META_PHONE_NUMBER_ID` | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Meta Cloud API sender identification | Basic tier WABA ID active |
| **Workspace 1** | AiSensy API Key | `AISENSY_API_KEY` | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Outbound template broadcasts | Tested via synthetic payload |
| **Workspace 1** | HubSpot Access Token | `HUBSPOT_ACCESS_TOKEN` | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Secondary CRM deal synchronization | Primary authoritative store is AVANI AI CRM |
| **Workspace 1** | Google Service Account | `GOOGLE_SERVICE_ACCOUNT_JSON` | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Master sheet backup row logging | File structure present |
| **Workspace 2** | AVANI AI CRM URL | `AVANI_CRM_URL` | **`PASS — LOCAL TESTS ONLY`** | Inter-workspace CRM API endpoint | Defaults to `https://avani-ai-crm.vercel.app` |
| **Workspace 2** | CRM API Key | `CRM_API_KEY` | **`PASS — LOCAL TESTS ONLY`** | Service-to-service intake authorization | Verified in synthetic contract tests |
| **Workspace 2** | MongoDB Atlas URI | `MONGODB_URI` | **`BLOCKED — OWNER ACTION REQUIRED`** | Authoritative master lead persistence | Active cluster configured; requires Atlas Network Access IP whitelisting to clear TLS Alert 80; returns HTTP 503 safely |
| **Workspace 3** | Gemini AI API Key | `GEMINI_API_KEY` | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Trilingual conversational intelligence | Pre-rendered product FAQ fallback active |
| **Workspace 4** | Vapi AI Private Key | `VAPI_PRIVATE_KEY` | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | AI voice telecalling synthesis | Synthetic test caller active |
| **Workspace 4** | Bland AI API Key | `BLAND_API_KEY` | **`BLOCKED — OWNER ACTION REQUIRED`** | Alternative voice synthesis engine | Architecture documented in bridge |
| **Workspace 4** | SIP Trunk Password | `SIP_TRUNK_PASSWORD` | **`BLOCKED — OWNER ACTION REQUIRED`** | Indian PSTN physical phone connection | Safe human escalation to Sachin Shinde active |

---

## 2. Secrets Management Best Practices

1. All production secrets must be configured via **Vercel Project Settings > Environment Variables** or secure cloud secret managers.
2. `.env` and `.env.local` files are strictly added to `.gitignore` across all four workspaces.
3. No secret values are stored in Git history or markdown documentation.
