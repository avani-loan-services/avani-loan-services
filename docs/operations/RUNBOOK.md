# AVANI LOAN SERVICES — CONSOLIDATED OPERATIONAL RUNBOOK

**Document ID:** `ALS-DOC-RUNBOOK-2026-003`  
**Execution Date:** 25 October 2026  
**Owner & Managing Director:** Sachin Shinde (`+91 72491 08474` / `+91 91756 35165`)  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Primary Execution Workspace:** `1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. Multi-Workspace Testing & Verification Commands

### Workspace 1: Website & Master Lending Calculators (`1-AVANI LOAN SERVICE FY 26-27`)
```powershell
cd "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27"

# Run master lending tests (10 suites, 211 specs including web intake & click tracker)
node scripts/runAllLendingTests.cjs

# Verify Vite production bundle
npm run build
```

### Workspace 2: AVANI AI CRM (`3-AVANI AI CRM`)
```powershell
cd "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\3-AVANI AI CRM"

# Run CRM lead intake, DPDP consent, and deduplication contract tests
node scripts/test_crm_lead_intake_contract.js
```

### Workspace 3: AVANI LOAN AGENTS (`4-AVANI LOAN AGENTS`)
```powershell
cd "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\4-AVANI LOAN AGENTS"

# Run advisor prompt contracts, 8 loan products, trilingual prompt, and CRM sync tests
node scripts/test_agent_advisor_contract.js
```

### Workspace 4: AVANI AI CALLING AGENT (`5-AVAVI AI CALLING AGENT`)
```powershell
cd "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\5-AVAVI AI CALLING AGENT"

# Run calling bridge contract, PII scrubber, test dialer, and disposition mapping
node test_calling_bridge.js
```

---

## 2. AiSensy Basic Tier Live Chat Operational Procedures

Since AiSensy Basic does not support inbound webhooks:
1. **Outbound Broadcasting:** Handled via AiSensy Campaign API v2 (`POST https://backend.aisensy.com/campaign/t1/api/v2`) or Meta Cloud API.
2. **Inbound Reply Handling:**
   - Human loan advisors log into `https://app.aisensy.com/projects/6a670f94d0c39f57eaa6799f/live-chat`.
   - Incoming WhatsApp chats appear in the shared inbox.
   - Advisors qualify inquiries using the approved document checklists in `docs/integrations/CROSS_WORKSPACE_CONTRACTS.md`.
3. **Escalations & High-Value Funding:**
   - Multi-crore business loans, institutional school/college funding, or complex credit cases are transferred directly to Sachin Shinde at `+91 72491 08474`.

---

## 3. Incident Management & Rollback Procedures

1. **Website Rollback:**
   - If a regression occurs on `https://www.avanifinserv.com/`, rollback the active deployment in the Vercel dashboard:
     `Project > Deployments > Select previous healthy deployment (dpl_JBwQUb6VvUj79UeT4K7xu7XMJp9K) > Promote to Production`.
2. **CRM Lead Intake Recovery:**
   - If CRM connectivity drops, `api/save-lead.js` returns a cached success response to avoid disrupting the user experience, while logging the lead for retry reconciliation.
3. **Emergency Suppression (Opt-Out):**
   - If a customer requests DND / Opt-Out via any channel, update `isOptedOut: true` in AVANI AI CRM to suppress all follow-ups immediately across chat, broadcast, and voice.

---

## 4. MongoDB Atlas Connectivity Diagnostics & Verification

1. **Non-Destructive Test Execution:**
   ```powershell
   cd "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\3-AVANI AI CRM"
   node test-mongo-connection.mjs
   ```
2. **Diagnostic Signatures:**
   - **`SSL alert number 80 (Internal Error)`**: The requesting client IP is not whitelisted in MongoDB Atlas Network Access. Log in to [cloud.mongodb.com](https://cloud.mongodb.com) > **Security > Network Access** and add the required IP address.
   - **`DNS_ERROR_RCODE_NAME_ERROR`**: Target domain does not exist. Ensure `MONGODB_URI` points to the active cluster `avani-dev-cluster.wmv4ncg.mongodb.net` and not the obsolete `mlcxcp.mongodb.net`.
3. **Database Failure Fallback Verification:**
   - Run `node scripts/test_crm_lead_intake_contract.js` to ensure the intake endpoint explicitly returns HTTP 503 `DATABASE_UNAVAILABLE` when the database is unreachable, preventing phantom lead records.
