# AVANI LOAN SERVICES — CONSOLIDATED BLOCKERS & APPROVAL GATES

**Document ID:** `ALS-DOC-BLOCKERS-2026-003`  
**Execution Date:** 25 October 2026  
**Owner & Managing Director:** Sachin Shinde (`+91 72491 08474` / `+91 91756 35165`)  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Primary Execution Workspace:** `1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. Commercial & Provider Blockers (Requiring Business Decisions)

| Blocker ID | Domain | Provider / Service | Blocker Description | Classification | Business Impact | Approved Fallback / Mitigation | Action Required from Sachin Shinde |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BLK-001** | WhatsApp Inbound | **AiSensy Basic Tier** | Current Basic plan has `0/0 inbound webhook slots`. Outbound templates work, but inbound webhooks cannot be created without plan upgrade. | **`BLOCKED — OWNER ACTION REQUIRED`** | Inbound customer replies cannot trigger automated serverless webhooks. | **ACTIVE:** Human loan advisors monitor the AiSensy Shared Live Chat Inbox (5 agent seats). | Maintain Live Chat fallback OR upgrade to AiSensy Pro (₹3,200/mo). Do NOT purchase without approval. |
| **BLK-002** | Voice AI Calling | **Exotel / Knowlarity / Vapi** | Calling physical subscriber phones in India requires commercial TRAI DLT registration and verified SIP trunk. | **`BLOCKED — OWNER ACTION REQUIRED`** | Voice calling agent operates strictly in test mode (`SIM-CALL-...`) and WebRTC preview. | **ACTIVE:** Test-mode dialer with simulated disclosures and CRM outcome logging. | Complete TRAI DLT entity registration with business PAN and GST when ready for live telephony. |
| **BLK-003** | Cloud Database | **MongoDB Atlas** | Active cluster `avani-dev-cluster.wmv4ncg.mongodb.net` reachable over port 27017, but TLS handshake fails with `SSL alert number 80` (Internal Error) due to Atlas Network Access IP restriction. Old `.env.local` pointed to non-existent domain `mlcxcp.mongodb.net` (now corrected). In Vercel, `MONGODB_URI` exists in Project `avani-ai-crm` but requires Atlas IP whitelisting. | **`BLOCKED — OWNER ACTION REQUIRED`** | AVANI AI CRM returns explicit HTTP 503 `DATABASE_UNAVAILABLE` to prevent unpersisted lead creation. | **ACTIVE:** Hardened HTTP 503 failure response (`DATABASE_UNAVAILABLE`) stops phantom lead intake. | 1. In MongoDB Atlas console ([cloud.mongodb.com](https://cloud.mongodb.com)), navigate to **Security > Network Access** and add the required IP access rule for Vercel/Office.<br>2. In Vercel Project `avani-ai-crm`, update `MONGODB_URI` with the active cluster URI for `avani_ai_crm_prod`. |
| **BLK-004** | AI Conversational LLM | **Google Gemini API** | Production API key quota verification. | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | AVANI LOAN AGENTS falls back to pre-rendered FAQ responses when key is empty. | **ACTIVE:** Standardized fallback dialogue covering all 8 products and human advisor contact. | Add `GEMINI_API_KEY` to Workspace 3 `.env.local` for dynamic AI generation. |

---

## 2. Actions That Must NOT Be Taken Without Explicit Approval

1. **NO Subscription Purchases:** Do not upgrade AiSensy or purchase additional add-on modules.
2. **NO Telephony Purchases:** Do not purchase phone numbers, SIP minutes, or Vapi concurrency limits.
3. **NO Real Customer Communications:** Never trigger campaigns, SMS, or voice calls to real consumer phone numbers during automated testing.
4. **NO Data Deletion:** Never delete customer records from CRM or production databases.
5. **NO Production Token Fabrications:** Never simulate or fake external API credentials.
