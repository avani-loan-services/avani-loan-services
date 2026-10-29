# AVANI LOAN SERVICES — SECURITY, GOVERNANCE & APPROVALS AUDIT
**Evaluation & Migration Date:** 27 October 2026, 14:35 IST  
**Document Reference:** Version 1.2.0 (Enterprise Safety and Governance Protocol)  
**Classification:** Confidential — Internal Operational Policy  

---

## 1. Governance Boundary & Owner-Approval Protocol

Under the strict operational directive for AVANI LOAN SERVICES, the autonomous engineering agent operates under explicit separation between **Autonomous Engineering** and **Owner-Restricted Actions**:

### 1.1 Permitted Autonomous Actions
- Code authoring, refactoring, and integration adapter creation within authorized workspaces (`1-AVANI`, `3-AVANI`, `4-AVANI`, `5-AVAVI`).
- Running unit, mock, and sandbox integration test suites across all 4 repos.
- Diagnosing database connection, DNS, and TLS handshake failures without printing secrets.
- Redacting logs, enforcing PII masking (PAN, Aadhaar, OTP), and verifying DPDP consent contracts.
- Preparing checkout parameters (₹999/mo Pro Monthly) and inspecting official provider setup guides.
- Documenting findings, architecture, and generating forensic audit reports.

### 1.2 Strictly Restricted Actions (Mandatory Owner Approval & Presence Required)
The following operations are **LOCKED** and will not be performed without explicit written owner consent:

| # | Restricted Action | Risk Assessment & Justification | Operational Status |
|---|---|---|---|
| **1** | **Migrating or Disconnecting AiSensy Number** | Would immediately terminate active customer conversations and break live WhatsApp routing. | 🔴 **LOCKED** (Kept on AiSensy) |
| **2** | **Submitting WABA ID / Phone ID in ChatMitra** | Initiates Meta Cloud API OBO migration; irreversibly transfers number ownership. | 🔴 **LOCKED** (Manual forms bypassed) |
| **3** | **Granting Meta Partner Permissions (`4417989865156453`)** | Grants ChatMitra administrative control over AVANI Meta Business assets. | 🔴 **LOCKED** (No Meta permission changes) |
| **4** | **Submitting Payment / Card Details for ₹999 Upgrade** | Autonomous financial transactions violate payment safety charter. | 🔴 **LOCKED** (Razorpay prepared for owner) |
| **5** | **Requesting or Handling Meta 2FA PIN** | Two-factor PIN must remain strictly with the owner; never shared in chat, code, or logs. | 🔴 **LOCKED** (Security boundary enforced) |
| **6** | **Sending Messages to Real Customers** | Unsolicited or unapproved template broadcasts violate TRAI and Meta policies. | 🔴 **LOCKED** (Mock dispatches only) |
| **7** | **Launching Real Broadcast Campaigns** | Incurs Meta marketing charges and contacts customer database. | 🔴 **LOCKED** (Disabled in code & UI) |
| **8** | **Placing Real AI Voice Calls** | Telephony charges, TRAI time-of-day violations, and unannounced automated calls. | 🔴 **LOCKED** (Simulated bridge only) |
| **9** | **Enabling Broad MongoDB Network Access (`0.0.0.0/0`)** | Opens database port to global internet, increasing brute-force and breach risks. | 🔴 **LOCKED** (Explicitly prohibited) |
| **10** | **Live Production Cutover** | Shifts traffic before database unblocking and owner authorization. | 🔴 **LOCKED** (HOLD verdict active) |

---

## 2. Secret Management & Zero-Leakage Policy

### 2.1 Credential Protection Architecture
1. **Zero Hardcoded Secrets:** All code repositories (`1-AVANI LOAN SERVICE FY 26-27`, `3-AVANI AI CRM`, `4-AVANI LOAN AGENTS`, `5-AVAVI AI CALLING AGENT`) were scanned; zero raw credentials or database passwords exist in source files.
2. **Environment Variable Isolation:** Credentials are exclusively injected at runtime via platform environment managers (Vercel Production Environment, local `.env` files protected by `.gitignore`).
3. **No Secret Echoing:** Neither Antigravity logs, terminal command outputs, nor markdown reports expose raw secret values.

### 2.2 Configuration Keys and Secure Destinations

| Environment Variable Name | Intended Platform | Purpose | Current Configuration Status |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Vercel (`avani-ai-crm`) | Production Atlas Connection String | **BLOCKED (Requires Atlas IP whitelisting)** |
| `CHATMITRA_API_KEY` | Vercel (`avani-ai-crm`) & Website | Bearer token for ChatMitra REST API | Configured in test environment |
| `CHATMITRA_WEBHOOK_SECRET` | Vercel (`avani-ai-crm`) | HMAC-SHA256 signature validation key | Configured in test environment |
| `INTERNAL_WORKER_SECRET` | Vercel (`avani-ai-crm`) | Auth token between Webhook and Worker | Configured in production |
| `CRM_API_KEY` | Vercel (`avani-ai-crm`) & Website | Inter-service lead ingestion authentication | Configured in production |
| `PROVIDER_MODE` | Vercel & Website | Toggle: `'mock'` (safe) vs `'live'` (real) | Set to `'mock'` (Active Safety Gate) |

---

## 3. Data Privacy (DPDP Act 2023) & Customer Protection

AVANI LOAN SERVICES adheres strictly to the **Digital Personal Data Protection (DPDP) Act 2023**:

1. **Explicit Consent Verification:**
   - Every lead ingestion route (`/api/save-lead`, `/api/leads`) enforces `consentStatus: 'GRANTED'`.
   - Submissions with missing or denied consent are rejected with HTTP 403 Forbidden.
2. **Opt-Out & Unsubscribe Handling:**
   - Inbound keywords `STOP`, `UNSUBSCRIBE`, `CANCEL`, `थांबवा` (Marathi), `रोकें` (Hindi), `बंद करा`, `नको` trigger immediate status transition to `OPTED_OUT`.
   - All pending follow-ups are purged instantly.
   - Confirmation is delivered, and no further marketing or follow-up communications are permitted.
3. **Synthetic Test Data Mandate:**
   - All test executions utilize purely synthetic identities (`Dr. Sachin Test`, `Dr. सचिन देशमुख`, phone `+919175635165`, lead ID prefix `AVL-SYNTH-*`).
   - Zero real customer records are used in testing.
4. **Automated PII Redaction:**
   - Outbound voice and messaging logs automatically scrub PAN cards (`[A-Z]{5}[0-9]{4}[A-Z]`), Aadhaar numbers (`\d{4}\s?\d{4}\s?\d{4}`), bank accounts, passwords, and OTPs.

---

## 4. Remediation Steps for Blocked Database Persistence

> [!IMPORTANT]
> **Vercel Egress Architecture Notice:**
> The current developer workstation IP is `110.227.7.63`.
> Adding `110.227.7.63` to MongoDB Atlas enables workstation testing but does **NOT** resolve Vercel production serverless egress.
> Vercel functions run in AWS dynamic IP pools (`iad1` / us-east-1). Broadening access to `0.0.0.0/0` is strictly prohibited without owner sign-off.

### Secure Remediation Path:
1. **Configure Developer Workstation IP in Atlas:**
   - Log into [cloud.mongodb.com](https://cloud.mongodb.com).
   - Navigate to **Security** → **Network Access** → **Add IP Address**.
   - Add current workstation IP: `110.227.7.63/32` (Comment: `Workstation Sachin Shinde`).
2. **Configure Vercel Serverless Access (Narrowest Supported Option):**
   - In Atlas Network Access, add the approved AWS us-east-1 CIDR blocks for Vercel serverless compute, OR if approved by owner as an accepted controlled risk for Free Tier, add temporary access with strong password & TLS enforcement.
3. **Verify Production `MONGODB_URI` in Vercel:**
   - Access **Vercel Dashboard** → `avani-ai-crm` → **Settings** → **Environment Variables**.
   - Ensure `MONGODB_URI` is populated for **Production** using the secure MongoDB Atlas connection string (`mongodb+srv://.../avani_ai_crm_prod`).
4. **Synthetic Gate Verification:**
   - Run `node scratch/test_prod_synthetic_gate.cjs` or execute a single test lead.
   - The persistence gate will update from **BLOCKED** to **PASS** only after the synthetic test lead writes and reads back successfully from Atlas.

---

## 5. Rollback & Emergency Contingency Procedures

| Failure Scenario | Emergency Action | Rollback Time |
| :--- | :--- | :--- |
| **ChatMitra API Outage** | Dual-adapter automatically diverts to AiSensy fallback queue. | Instant (< 1s) |
| **Accidental Live Dispatch** | Set `PROVIDER_MODE=mock` in Vercel environment variables and redeploy. | < 60 seconds |
| **Number Cutover Failure** | Re-assign AiSensy partner ID in Meta Business Manager and re-link project `6a670f94d0c39f57eaa6799f`. | < 5 minutes |
| **Webhook Delivery Spikes** | Two-tier worker uses `waitUntil` and atomic lease locking; database throttles queue safely. | Automatic |
| **Trial / Subscription End** | Trial terminates without unexpected billing impact. AiSensy remains unaffected. | Zero downtime |

