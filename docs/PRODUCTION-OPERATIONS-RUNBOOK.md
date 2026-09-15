# AVANI LOAN SERVICES — PRODUCTION OPERATIONS RUNBOOK & CONTROLLED INTEGRATION ACTIVATION PLAN

> **Document Classification:** Operational Security & Controlled Activation Runbook
> **Status:** ACTIVE / ACCEPTED PRODUCTION RELEASE
> **Authoritative Baseline Release:** `production-2026-09-08`
> **Authoritative Commit:** `7c557aceec91b2c0b62dcb1e1c0e85e995828730`
> **Target Audience:** DevOps Engineers, System Administrators, Loan Operations Managers, Security Officers

---

## 1. Production Identity

| Identity Attribute | Authoritative Value | Verification Reference & Source |
| :--- | :--- | :--- |
| **Legal Entity & Brand** | **AVANI LOAN SERVICES** (Direct Selling Agent / Loan Advisory Partner) | Registered in Latur, Maharashtra (`VERIFIED IN REPOSITORY`) |
| **Authoritative GitHub Repository** | `https://github.com/avani-loan-services/avani-loan-services` | Remote: `origin` (`VERIFIED IN REPOSITORY`) |
| **Production Branch** | `main` | Protected, fast-forward / PR only (`VERIFIED IN REPOSITORY`) |
| **Current Production Git Tag** | `production-2026-09-08` | Annotated Tag: `9aebebe093a548f0989d9432e0ba731a649b23a7` (`VERIFIED IN REPOSITORY`) |
| **Production Release Commit** | `7c557aceec91b2c0b62dcb1e1c0e85e995828730` | Merged Pull Request #1 (`VERIFIED IN REPOSITORY`) |
| **Canonical Production URL** | `https://www.avanifinserv.com/` | Public TLS 1.3 / HTTP/2 (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE`) |
| **Apex Domain Redirection** | Apex domain redirects with HTTP 308 to the canonical www HTTPS domain (`https://avanifinserv.com/` ➔ HTTP 308 ➔ `https://www.avanifinserv.com/`) | HTTP 308 Permanent Redirect (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE`) |
| **Vercel Project Name** | `avani-loan-services` | Authoritative Production Project. Exact project ID is maintained in Vercel console and is not repository-authoritative. (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL CONSOLE`) |
| **Production Deployment Identity** | Verified against the accepted Vercel production deployment record for commit `7c557aceec91b2c0b62dcb1e1c0e85e995828730`. Exact Vercel deployment identifiers are maintained in the Vercel console and are not repository-authoritative. | State: `READY` (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL CONSOLE`) |

> [!CAUTION]
> **LEGACY PROJECT WARNING & HISTORICAL ISOLATION:**
> A legacy Vercel project named `avani-loan-service` (associated with legacy identifiers such as `prj_BtpgssjnKgpe81l955WsdHe4Jbwk`, `team_vUTeKhQxcSPYtztYtoLMWinO`, `avaniagrofoods1356-4705`, or `avani-loan-service-fy-26-27`) MUST NOT BE USED. Deploying to, querying, linking, or modifying that legacy project will violate regulatory and corporate domain separation boundaries. All production operations MUST occur strictly on the authoritative Vercel project `avani-loan-services`.

---

## 2. Production Safety Principles

All operations, updates, and maintenance activities on AVANI LOAN SERVICES must strictly adhere to the following 11 foundational safety principles:

1. **Controlled Git Workflow Only:** Production code must never be modified directly on servers, via web consoles, or without a controlled Git feature branch and pull request review.
2. **Deterministic Release Commit:** Every production release must correspond to a verified, unique, immutable Git commit SHA.
3. **Annotated Release Tagging:** Every accepted production release must receive an annotated Git tag with a clear description and release date (e.g., `production-YYYY-MM-DD`).
4. **Immutable Tag Integrity:** Never force-update (`git tag -f`, `git push -f --tags`) production tags. If a release changes, create a new tag.
5. **DNS Immutability:** Never modify DNS records (A, CNAME, TXT, MX) during normal application code releases. Domain cutover is an independent, isolated operation.
6. **Zero Secret Exposure:** Never display, log, print, commit, or transmit unmasked API keys, webhook secrets, database connection URIs, or authentication tokens.
7. **Strict `.env` File Hygiene:** Never commit `.env`, `.env.local`, `.env.production`, or credential files to Git repositories.
8. **Total Business Isolation:** Never mix, import, reference, or cross-wire AVANI LOAN SERVICES assets, databases, storage buckets, or domains with AVANI AGRO FOODS.
9. **Controlled Outbound Communication:** Real outbound communications (WhatsApp messages, SMS, emails, telecalling) require explicit step-by-step human activation; they must default to simulated/mock mode.
10. **Zero-Trust Document Vault:** Real customer loan application documents must be stored in secure, private directories behind cryptographically signed, expiring, revokable tokens with strict path traversal checks.
11. **Prohibited Credential Collection:** The system (including AI agents, chatbots, voice callers, and portal forms) must **NEVER** request, prompt for, log, or store sensitive financial authentication credentials, including OTPs, passwords, UPI PINs, ATM PINs, CVVs, card PINs, or banking credentials.

---

## 3. Release Workflow & Rollback Runbook

### 3.1 Standard Release Lifecycle

```text
    ┌────────────────────────────────────────┐
    │     Local Development & Validation     │
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Feature Branch (feature/<feature-name>)│
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Automated Tests & Forensic Regression │ (Calculators, Workflows, Schemas)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Agro Isolation & Secret Scan Gate     │ (Zero Agro strings, Zero leaked keys)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Vercel Ephemeral Preview Deployment   │ (Isolated preview URL)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Browser E2E & Visual Verification     │ (Desktop & Mobile responsive tests)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Human Operator Acceptance Sign-off   │ (Formal review)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Pull Request Review & Merge to main   │ (Merge commit on main)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Production Deployment to Custom Domain│ (www.avanifinserv.com)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Post-Deployment Forensic Acceptance   │ (HTTP 200, ETag, Route checks)
    └──────────────────┬─────────────────────┘
                       │
                       ▼
    ┌────────────────────────────────────────┐
    │  Annotated Git Production Tag Push     │ (production-YYYY-MM-DD)
    └────────────────────────────────────────┘
```

### 3.2 Controlled Rollback Procedure

If a critical flaw or SEV-1/SEV-2 incident is detected in production, follow this controlled rollback runbook:

```text
    ┌────────────────────────────────────────────────────────┐
    │  1. Identify Last Known-Good Production Release Tag     │ (e.g., production-2026-09-08)
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  2. Verify Commit SHA & Clean Working Tree             │ (git rev-parse 'production-2026-09-08^{commit}')
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  3. Create Rollback Branch (rollback/<tag-name>)        │ (git checkout -b rollback/...)
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  4. Revert Defective Commits via Git Revert or Clean PR │ (Do NOT force-push main)
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  5. Run Automated Forensic Tests & Security Audits     │ (Pass all gates)
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  6. Obtain Explicit Human Technical Sign-Off           │ (Rollback approval)
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  7. Merge Rollback PR to main & Trigger Vercel Deploy   │ (Rollback deployment)
    └──────────────────────────┬─────────────────────────────┘
                               │
                               ▼
    ┌────────────────────────────────────────────────────────┐
    │  8. Execute Production Acceptance Checklist             │ (Verify live recovery)
    └────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **NEVER FORCE PUSH:** Never run `git push -f origin main` to roll back code. Always roll back through a tracked git revert commit or controlled pull request to preserve audit history.

---

## 4. Controlled Integration Activation Matrix

| Integration Component | Current Operational State | Activation Prerequisite | Real-World Side Effect | Security & Implementation Status | Approval Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Website & Landing Pages** | **LIVE PRODUCTION** | Acceptance test passed on `www.avanifinserv.com` | Public visibility, client visits | `VERIFIED IN LIVE PRODUCTION` (HTTP 200) | Release Accepted (`production-2026-09-08`) |
| **Financial Calculators** | **LIVE PRODUCTION** | Mathematical validation (88/88 test vectors) | Instant client EMI & eligibility calculations | `VERIFIED IN LIVE PRODUCTION` (Client JS) | Release Accepted (`production-2026-09-08`) |
| **Lead Capture Engine** | **ACTIVE (Local / Memory)** | In-memory & JSON file persistence active | Writes to `central_leads.json`, generates `ALS-2026-XXXXXX` | `IMPLEMENTED IN CODE` (Atomic Deduplication) | Principal Architect |
| **Internal CRM Pipeline** | **STANDBY / ADVISOR-ONLY** | Stage transitions enforced, lost reasons mandatory | Internal status updates, follow-up scheduling | `IMPLEMENTED IN CODE` (9 Canonical Stages) | Lead Operations Lead |
| **Document Upload Vault** | **STANDBY / SECURE TOKEN** | SHA-256 token hashing, 15MB limit, MIME whitelist | Customer files saved to isolated server storage | `IMPLEMENTED IN CODE` (Zero-Trust Token Auth) | Security Officer |
| **Meta WhatsApp Cloud API** | **SIMULATION / TEST MODE** | Meta verified business phone, approved templates | Real WhatsApp messages sent to client mobile devices | `IMPLEMENTED IN CODE` (Mock Mode Active) | Managing Director / Compliance |
| **AiSensy Campaign API** | **SIMULATION / TEST MODE** | Active AiSensy subscription, campaign template approval | Automated broadcast/qualification messages to leads | `IMPLEMENTED IN CODE` (Mock Mode Active) | Managing Director |
| **HubSpot CRM API** | **SIMULATION / MOCK MODE** | Valid HubSpot Private App Token, property mapping | Creates or mutates contacts/deals in HubSpot CRM | `IMPLEMENTED IN CODE` (Mock Upsert Active) | CRM Administrator |
| **Google Sheets Sync** | **STANDBY / BUFFERED** | Service account credentials (`google-sheets-key.json`) | Appends rows to Google Sheets Master Lead Ledger | `IMPLEMENTED IN CODE` (Buffered Fallback) | Operations Manager |
| **Zapier Webhook Relay** | **SIMULATION / MOCK MODE** | Valid `ZAPIER_WEBHOOK_URL` in environment | Triggers external downstream Zapier automations | `IMPLEMENTED IN CODE` (Mock Relay Active) | Tech Lead |
| **OmniDM / VAPI AI Voice** | **SIMULATION / MOCK MODE** | Verified caller ID, approved regulatory script | Outbound phone calls dialed to borrower phones | `IMPLEMENTED IN CODE` (Simulation Active) | Managing Director & Legal |
| **Email Gateway / SMTP** | **DISABLED** | SPF, DKIM, DMARC verified on `avanifinserv.com` | Outbound transactional emails sent to clients | `IMPLEMENTED IN CODE` (Disabled by Default) | System Administrator |

---

## 5. Recommended Phased Activation Sequence

To prevent runaway automations, accidental spam, or data leakage, integrations MUST be activated strictly in this phased order:

```text
Phase 0 ───▶ Phase 1 ───▶ Phase 2 ───▶ Phase 3 ───▶ Phase 4 ───▶ Phase 5 ───▶ Phase 6 ───▶ Phase 7 ───▶ Phase 8
Website      Lead         Internal     Advisor      WhatsApp     Secure       CRM          AI Voice     Automated
Public       Capture      Pipeline     Review       Outbound     Docs         Progression  Calling      Follow-ups
```

### Phase 0 — Website & Public Interfaces (Completed & Accepted)
* Core static site, financial calculators, contact forms, loan product landing pages.
* Fully operational and accepted under tag `production-2026-09-08`. Status: `VERIFIED IN LIVE PRODUCTION`.

### Phase 1 — Lead Capture & Deduplication (Current Operational State)
* Activate and monitor web lead form submissions.
* Verify sequential monotonic ID generation (`ALS-2026-XXXXXX`).
* Confirm phone normalization (10 digits) and idempotency deduplication.
* Ensure duplicate submissions update `duplicateEvents` and increment `duplicateCount` without spawning duplicate pipeline entries. Status: `IMPLEMENTED IN CODE`.

### Phase 2 — Internal CRM State Machine
* Enable internal pipeline view for loan advisors across all 9 canonical stages.
* Verify that advisors can inspect incoming leads, review lead scores (10–100) and priority grades (`HOT`, `WARM`, `COLD`).
* All external outbound notification triggers remain switched off. Status: `IMPLEMENTED IN CODE`.

### Phase 3 — Human Advisor Review Gate
* **Mandatory Policy:** Every new lead must be reviewed by a human advisor (e.g., Sachin Shinde) before any automated external communication is scheduled.
* Verify borrower contact authenticity and filter spam or invalid phone numbers. Status: Operational Policy.

### Phase 4 — WhatsApp Outbound Messaging Activation
* **Prerequisites for Activation:**
  1. Meta Business Verification completed and WhatsApp Business Account (WABA) healthy (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE`).
  2. WhatsApp templates approved by Meta (Greeting, Qualification, Document Request, Status Updates).
  3. Webhook endpoint (`/api/whatsapp/webhook`) verified with valid token and challenge handshake.
  4. Opt-in terms and customer consent clearly documented on the website.
  5. Test recipient validation completed on internal phone numbers.
  6. Rate limiting (maximum 1 message per customer per event) verified.
* Switch `PROVIDER_MODE=live` only for WhatsApp after written authorization. Current state: `IMPLEMENTED IN CODE` (Mock Mode Active).

### Phase 5 — Secure Document Collection Activation
* **Prerequisites for Activation:**
  1. Validate that the upload storage path (`uploads/leads/`) is strictly outside the public web root.
  2. Verify 32-byte cryptographic token generation, SHA-256 hash lookup, and 7-day TTL expiration.
  3. Validate file filtering (strictly PDF, JPG, PNG; max 15MB per file).
  4. Confirm directory traversal protections (`path.resolve` check against safe base path).
  5. Validate token revocation API (`/api/documents/portal/:token/revoke`).
* Current state: `IMPLEMENTED IN CODE`.

### Phase 6 — Controlled CRM Progression
* Authorize progression through the 9 canonical pipeline stages:
  `NEW_LEAD` ➔ `CONTACTED` ➔ `QUALIFIED` ➔ `DOCUMENTS_PENDING` ➔ `DOCUMENTS_RECEIVED` ➔ `SUBMITTED` ➔ `SANCTIONED` ➔ `DISBURSED` (or `CLOSED_LOST`).
* Enforce mandatory `lostReason` for any transition to `CLOSED_LOST`. Current state: `IMPLEMENTED IN CODE`.

### Phase 7 — AI Voice Telecalling Activation (OmniDM / VAPI)
* **Prerequisites for Activation:**
  1. Human handoff protocol tested and confirmed functional.
  2. Regulatory compliance script verified (prohibiting requests for PINs, OTPs, CVVs, passwords).
  3. Explicit borrower opt-in policy active on forms.
  4. Outbound call schedule constrained to standard business hours (10:00 AM – 6:00 PM IST).
  5. Switch `VOICE_TEST_MODE=false` only after successful live test calls to internal team numbers.
* Current state: `IMPLEMENTED IN CODE` (Simulation Mode Active).

### Phase 8 — Automated Drip Follow-ups & Downstream Sync
* Activate downstream CRM synchronization (HubSpot, Google Sheets, Zapier) and recurring follow-up reminders last, once all preceding stages operate error-free. Current state: `IMPLEMENTED IN CODE` (Mock Upsert Active).

---

## 6. Emergency Stop Procedures

If any unintended or abnormal behavior is detected, execute the immediate stop procedure:

```text
    ┌──────────────────────────────────────────────┐
    │                   1. STOP                    │ Halt active processes immediately
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │        2. Disable Affected Integration       │ Set feature flag / provider mode to mock
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │               3. Preserve Logs               │ Retain runtime, server, and ledger logs
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           4. Do Not Delete Evidence          │ Never wipe databases or audit records
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │    5. Identify Last Known-Good Release       │ Refer to production-2026-09-08
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │          6. Perform Forensic Audit           │ Trace correlation ID and error source
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │        7. Obtain Human Sign-off              │ Formal clearance to patch or revert
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │       8. Controlled Fix & Re-validation      │ Deploy through standard release workflow
    └──────────────────────────────────────────────┘
```

### Specific Trigger Response Matrix

| Emergency Trigger | Immediate Containment Action | Variable / Service to Kill | Status & Scope |
| :--- | :--- | :--- | :--- |
| **Duplicate WhatsApp Messages** | Set `PROVIDER_MODE=mock` in environment. Restart worker. | `PROVIDER_MODE` | `IMPLEMENTED IN CODE` |
| **Incorrect Recipient / Misdirected Msg** | Immediately invalidate outbound message queue. Check phone normalization. | Meta Cloud API Token revoke | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **Unexpected CRM Mutations** | Disable downstream webhook relays. Revoke HubSpot API key. | `HUBSPOT_API_KEY`, `ZAPIER_WEBHOOK_URL` | `IMPLEMENTED IN CODE` |
| **Unauthorized Document Access** | Revoke compromised portal tokens via revocation API. Rotate master secret. | Invalidate token in `central_leads.json` | `IMPLEMENTED IN CODE` |
| **Unexpected Outbound Telecalling** | Set `VOICE_TEST_MODE=true` and remove `OMNIDM_API_KEY`. | `VOICE_TEST_MODE=true` | `IMPLEMENTED IN CODE` |
| **Webhook Loop / Request Storm** | Reject incoming webhook requests via invalidating `META_WEBHOOK_VERIFY_TOKEN`. | Invalidate webhook secret | `IMPLEMENTED IN CODE` |
| **Secret / Credential Exposure** | Immediately revoke exposed key at provider (Meta, HubSpot, Vercel). Rotate key. | Provider Security Console | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **AVANI AGRO FOODS Contamination** | Immediately isolate deployment, inspect git diff, verify domain routing. | Vercel Project unlink | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **DNS Record Drift or Tampering** | Re-assert authoritative nameservers and records from Hostinger DNS backup. | DNS Provider Console | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |

---

## 7. Monitoring & Operational Checklist

### Daily Operational Checks (Morning & Evening)
- [ ] **Website Availability:** Verify HTTP 200 on `https://www.avanifinserv.com/` and HTTP 308 redirect from apex domain to canonical www HTTPS domain. (`VERIFIED IN LIVE PRODUCTION`)
- [ ] **Lead Ingestion Health:** Review `central_leads.json` / in-memory store for newly ingested leads. Verify sequential `ALS-2026-XXXXXX` numbering. (`IMPLEMENTED IN CODE`)
- [ ] **Duplicate Lead Rate:** Inspect duplicate counts. Verify duplicate events are recorded without duplicate pipeline entries. (`IMPLEMENTED IN CODE`)
- [ ] **CRM Error Logs:** Check server console logs for unhandled exceptions or failed stage transitions. (`IMPLEMENTED IN CODE`)
- [ ] **Document Upload Activity:** Verify that uploaded documents conform to allowed extensions (`.pdf`, `.jpg`, `.png`) and size limits (<15MB). (`IMPLEMENTED IN CODE`)
- [ ] **Outbound Safeguard Check:** Confirm that zero unauthorized real WhatsApp messages or voice calls occurred (`REAL SENDS = 0`). (`IMPLEMENTED IN CODE`)

### Weekly Operational Checks
- [ ] **Pipeline Stage Audit:** Review leads in `DOCUMENTS_PENDING` and verify reminder scheduling across all 9 canonical stages.
- [ ] **Webhook Inbox Audit:** Inspect `WebhookInbox` for unprocessed leases or stuck worker locks.
- [ ] **Token Expiration Verification:** Ensure document portal tokens older than 7 days have transitioned to expired.
- [ ] **Storage Utilization:** Monitor disk space on `uploads/leads/`.
- [ ] **Provider Ledger Review:** Audit `ProviderLedger` records to verify test run IDs and correlation IDs.

### Monthly Operational Checks
- [ ] **Credential Rotation Review:** Audit age of Vercel tokens, Meta tokens, and API secrets (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE`).
- [ ] **Template Compliance Audit:** Review Meta and AiSensy WhatsApp templates against current banking/DSA guidelines.
- [ ] **DNS & SSL Certificate Health:** Check SSL/TLS certificate validity dates on `avanifinserv.com` (`EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE`).
- [ ] **Rollback Readiness Verification:** Verify local checkout ability to tag `production-2026-09-08` (`VERIFIED IN REPOSITORY`).
- [ ] **Cross-Business Isolation Audit:** Perform ripgrep scan across codebase to ensure zero references to agricultural commodities (`VERIFIED IN REPOSITORY`).

---

## 8. Incident Severity Classification

| Severity Level | Definition | Response Time | Required Actions & Escalation |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Data breach, customer PII exposure, unauthorized document leakage, mass outbound spam messaging, unauthorized calls, production site down, Agro Foods cross-contamination. | **Immediate (<15 min)** | 1. Activate Emergency Stop.<br>2. Notify Managing Director & Tech Lead.<br>3. Preserve server logs and forensic evidence.<br>4. Revert to `production-2026-09-08` if code-related.<br>5. Execute root cause analysis. |
| **SEV-2 (Major)** | Integration failure, duplicate message sending to individual clients, CRM pipeline sync failure, document upload failing for all users. | **< 1 hour** | 1. Disable affected integration to mock mode.<br>2. Investigate API ledger and error payloads.<br>3. Apply patch on feature branch, test, and release. |
| **SEV-3 (Moderate)** | Single lead ingestion error, isolated webhook timeout, non-blocking UI styling glitch, individual portal token issue. | **< 4 hours** | 1. Review specific lead record in `central_leads.json`.<br>2. Issue manual token or re-queue lead via CRM admin. |
| **SEV-4 (Minor)** | Cosmetic documentation typos, minor formatting inconsistencies, non-critical log verbosity. | **Next Release Cycle** | Log task for standard release sprint. |

---

## 9. Customer Data Protection & Prohibited Data Collection Rules

### 9.1 Data Minimization & Legitimate Interest
AVANI LOAN SERVICES collects only the minimal customer information strictly required for loan eligibility assessment, credit underwriting consultation, and lender file submission.

### 9.2 Absolutely Prohibited Data Collection
Under no circumstances shall any portal, form, AI agent, WhatsApp conversation, telecalling agent, or employee request, store, or process:
* **One-Time Passwords (OTP)** (Net-banking, Aadhaar, UPI, or SMS OTPs)
* **Internet Banking Passwords or Login Credentials**
* **UPI PINs or MPINs**
* **ATM / Debit Card PINs**
* **Credit / Debit Card CVV Numbers**
* **Full 16-Digit Card Numbers with Expiry and CVV**
* **Biometric Authentication Credentials**

> **Status:** `IMPLEMENTED IN CODE` (Regulatory prompt disclaimer active; zero credential fields in models or schemas).

### 9.3 Secure Loan Document Handling Guidelines
* Documents must be uploaded exclusively through the authenticated customer portal (`/api/documents/portal/:token`).
* Files must be validated for MIME type (`application/pdf`, `image/jpeg`, `image/png`) and extension (`.pdf`, `.jpg`, `.jpeg`, `.png`).
* Files must be stored outside public web directories with access gated by token authorization.
* Filenames must be sanitized to strip special characters and directory traversal markers (`../`, `..\\`).
* Download streams must enforce `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-cache`, and `Content-Disposition: attachment`.

> **Status:** `IMPLEMENTED IN CODE` (Enforced via Multer storage configuration and stream handlers).

---

## 10. WhatsApp Operating Standard Operating Procedure (SOP)

```text
    ┌──────────────────────────────────────────────┐
    │              1. Lead Received                │ Ingested via website form or Meta Ad
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           2. Phone Normalization             │ Stripped to 10-digit standard (e.g., 98XXXXXXXX)
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           3. Atomic Deduplication            │ Match against existing leads / idempotency key
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │       4. Human Review & Verification         │ Loan advisor approves lead for contact
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │     5. Approved Template Message Sent        │ Meta-approved greeting template dispatched
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │        6. Customer Interactive Reply         │ Customer selects loan type / responds
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │     7. Qualification & Document Request      │ Dynamic questions asked; upload link sent
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │          8. Human Advisor Handoff            │ Senior advisor takes over conversation
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │              9. CRM Stage Update             │ Timeline recorded; stage updated
    └──────────────────────────────────────────────┘
```

* **Duplicate Message Prevention:** Outbound message ledger (`messageStatusLedger`) tracks dispatch status (`API_ACCEPTED`, `SENT`, `DELIVERED`, `READ`). Repeated triggers within 15 minutes for the same lead are rejected. (`IMPLEMENTED IN CODE`)
* **Current Operational State:** `PROVIDER_MODE=mock`. Zero live messages sent during this release.

---

## 11. AI Voice Telecalling SOP (OmniDM / VAPI)

```text
    ┌──────────────────────────────────────────────┐
    │              1. Eligible Lead                │ Status = QUALIFIED or CONTACTED
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │         2. Human-Approved Trigger            │ Advisor explicitly approves telecalling attempt
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │        3. Consent & Schedule Window          │ Business hours verified (10:00 - 18:00 IST)
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           4. AI Voice Call Outbound          │ Strict regulatory script initiated
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │        5. Zero-Sensitive Credentials         │ System disclaims DSA status; asks zero OTPs
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │          6. Automated Qualification          │ Collects employment, income, property info
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │          7. Advisor Handoff Task             │ Automatically schedules CRM call-back task
    └──────────────────────────────────────────────┘
```

* **Current Operational State:** `VOICE_TEST_MODE=true`. Zero real outbound calls made. (`IMPLEMENTED IN CODE`)

---

## 12. Secure Document Collection SOP

```text
    ┌──────────────────────────────────────────────┐
    │             1. Lead Qualified                │ Loan product & profile determined
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │        2. Generate Checklist & Token         │ 32-byte crypto token; 7-day expiration
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           3. Customer Accesses Portal        │ Token SHA-256 verified against database
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │             4. File Upload & Filter          │ PDF, JPG, PNG only; max 15MB
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           5. Storage in Private Vault        │ Stored outside web root with clean filenames
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │         6. Advisor Review & Verification     │ Advisor marks ACCEPTED or REUPLOAD_REQUIRED
    └──────────────────────┬───────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────┐
    │           7. Token Revocation / Expiry       │ Revoked upon completion or after 7 days
    └──────────────────────────────────────────────┘
```

* **Security Controls Architecture:**
  - Token hashing: SHA-256 (`hashToken()`). (`IMPLEMENTED IN CODE`)
  - Strict MIME whitelist: `application/pdf`, `image/jpeg`, `image/png`. (`IMPLEMENTED IN CODE`)
  - Max file size: 15 MB. (`IMPLEMENTED IN CODE`)
  - Path traversal check: `resolvedPath.startsWith(safeBasePath)` enforcement. (`IMPLEMENTED IN CODE`)
  - Revocation: Dedicated `/api/documents/portal/:token/revoke` endpoint. (`IMPLEMENTED IN CODE`)

---

## 13. Production Rollback Runbook (Baseline Reference)

In the event of an emergency requiring immediate restoration of the known-good production state, use this authoritative reference:

* **Known-Good Git Tag:** `production-2026-09-08` (`VERIFIED IN REPOSITORY`)
* **Known-Good Commit SHA:** `7c557aceec91b2c0b62dcb1e1c0e85e995828730` (`VERIFIED IN REPOSITORY`)
* **Peeled Tag Reference:** `refs/tags/production-2026-09-08^{}` ➔ `7c557aceec91b2c0b62dcb1e1c0e85e995828730` (`VERIFIED IN REPOSITORY`)

### Step-by-Step Restoration Commands:
```bash
# 1. Fetch tags and verify repository state
git fetch origin --tags
git checkout main
git pull origin main

# 2. Verify target rollback commit matches known-good SHA (Syntactically safe)
git rev-parse 'production-2026-09-08^{commit}'
# Expected output: 7c557aceec91b2c0b62dcb1e1c0e85e995828730

# 3. Create controlled rollback branch
git checkout -b rollback/restore-production-2026-09-08 7c557aceec91b2c0b62dcb1e1c0e85e995828730

# 4. Verify local clean build and tests
npm run test:run

# 5. Open Pull Request to main, obtain review, and merge
```

---

## 14. Production Change Control Framework

Every future modification to AVANI LOAN SERVICES must document and fulfill the following change control criteria prior to production deployment:

1. **Clear Business Objective:** Explicit user story or regulatory requirement.
2. **Affected Files Inventory:** Specific list of files created, modified, or deleted.
3. **Risk Assessment:** Low / Medium / High assessment with failure mode analysis.
4. **Automated Test Coverage:** Unit, integration, and regression test results attached.
5. **Security & Data Protection Audit:** Zero secrets committed, zero unmasked PII logged.
6. **Agro Foods Isolation Verification:** Ripgrep check confirming zero cross-business contamination.
7. **Preview Environment Sign-off:** Ephemeral Vercel preview verified on desktop and mobile browsers.
8. **Human Acceptance:** Written sign-off from authorized technical lead.
9. **Peer-Reviewed Pull Request:** Merged into `main` with squash or merge commit.
10. **Annotated Production Tag:** New tag generated upon post-deployment verification.

---

## 15. AVANI AGRO FOODS Isolation Gate (Mandatory Pre-Deployment)

Every production release MUST pass this 12-point isolation gate. If ANY check fails, the deployment MUST BE HALTED immediately:

```text
[ ] 1. Repository correct? (https://github.com/avani-loan-services/avani-loan-services)  [PASS / FAIL]
[ ] 2. Vercel team correct? (Authoritative AVANI LOAN SERVICES workspace)                 [PASS / FAIL]
[ ] 3. Vercel project correct? (avani-loan-services)                                      [PASS / FAIL]
[ ] 4. GitHub repository remote correct? (avani-loan-services/avani-loan-services)        [PASS / FAIL]
[ ] 5. Environment variables correct? (Zero AGRO credentials or database URIs)          [PASS / FAIL]
[ ] 6. Domain correct? (www.avanifinserv.com / avanifinserv.com)                          [PASS / FAIL]
[ ] 7. Database correct? (Separate Mongo/Memory store; zero agro collections)             [PASS / FAIL]
[ ] 8. Storage correct? (Isolated /uploads/leads/ directory; zero agro buckets)           [PASS / FAIL]
[ ] 9. Webhooks correct? (Configured strictly for avani-loan-services endpoints)          [PASS / FAIL]
[ ] 10. CRM correct? (Avani Loan Services pipeline; Sachin Shinde advisory)              [PASS / FAIL]
[ ] 11. WhatsApp correct? (Avani Loan Services WABA ID & templates)                       [PASS / FAIL]
[ ] 12. No Agro references introduced? (Ripgrep search for agro strings = 0 matches)      [PASS / FAIL]
```

> **GATE RULE:** If any item is marked `FAIL`, **STOP IMMEDIATELY — DO NOT DEPLOY**.

---

## 16. Production Acceptance Checklist (Reusable)

Use this checklist to certify production deployments:

| Acceptance Criterion | Verification Method | Result | Notes | Source Verification |
| :--- | :--- | :--- | :--- | :--- |
| **1. Deployment Identity** | Verify Vercel project name & accepted commit | PASS | Project: `avani-loan-services`, Commit: `7c557aceec91b2c0b62dcb1e1c0e85e995828730`. Deployment identifiers maintained in Vercel console. | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL CONSOLE` |
| **2. Release Commit SHA** | Match Vercel commit SHA with `git rev-parse HEAD` | PASS | `7c557aceec91b2c0b62dcb1e1c0e85e995828730` | `VERIFIED IN REPOSITORY` |
| **3. Production Domain** | Curl `https://www.avanifinserv.com/` | PASS | Returns HTTP 200 | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **4. Apex Redirection** | Curl apex domain (`https://avanifinserv.com/`) | PASS | Apex domain redirects with HTTP 308 to the canonical www HTTPS domain | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **5. TLS / SSL Security** | Check TLS certificate validity and issuer | PASS | Active valid SSL certificate | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **6. Critical Navigation** | Verify `/`, `/personal-loan`, `/business-loan`, `/calculators`, `/contact` | PASS | All return HTTP 200 | `VERIFIED IN LIVE PRODUCTION` |
| **7. Browser Runtime** | Chrome DevTools console audit (desktop & mobile) | PASS | Zero runtime JavaScript exceptions | `VERIFIED IN LIVE PRODUCTION` |
| **8. Lead Capture Engine** | Test local lead form submission | PASS | Generates sequential monotonic ID (`ALS-2026-XXXXXX`) | `IMPLEMENTED IN CODE` |
| **9. Qualification Engine** | Test 11 loan product evaluation schemas | PASS | HOT / WARM / COLD grading verified across all 11 products | `IMPLEMENTED IN CODE` |
| **10. CRM Pipeline** | Test 9 stage transitions and mandatory lost reasons | PASS | Invalid transitions blocked; lostReason enforced | `IMPLEMENTED IN CODE` |
| **11. Document Vault** | Test token generation, MIME filter, path traversal | PASS | Traversal blocked, token expiring verified | `IMPLEMENTED IN CODE` |
| **12. WhatsApp Safeguard** | Confirm mock mode active (`PROVIDER_MODE=mock`) | PASS | Zero live messages sent | `IMPLEMENTED IN CODE` |
| **13. AI Voice Safeguard** | Confirm test mode active (`VOICE_TEST_MODE=true`) | PASS | Zero outbound calls dialed | `IMPLEMENTED IN CODE` |
| **14. Downstream Sync** | Confirm mock execution for HubSpot & Zapier | PASS | Zero real records mutated | `IMPLEMENTED IN CODE` |
| **15. DNS Stability** | Query authoritative nameservers for A/CNAME records | PASS | Pointing correctly to Vercel | `EXTERNAL PRODUCTION VALUE — VERIFY IN VERCEL/DNS/PROVIDER CONSOLE` |
| **16. Agro Isolation** | Ripgrep scan for cross-contamination | PASS | Zero matches across source files | `VERIFIED IN REPOSITORY` |

---

## 17. Current Production Status Record

```text
===================================================================
AVANI LOAN SERVICES — AUTHORITATIVE PRODUCTION STATUS
===================================================================

PRODUCTION STATUS:
ACCEPTED

CURRENT RELEASE:
production-2026-09-08

CURRENT COMMIT:
7c557aceec91b2c0b62dcb1e1c0e85e995828730

CANONICAL URL:
https://www.avanifinserv.com/

APEX DOMAIN:
Apex domain redirects with HTTP 308 to canonical www HTTPS domain (https://www.avanifinserv.com/)

VERCEL PROJECT:
avani-loan-services (Project identifiers maintained in Vercel console; not repository-authoritative)

LIVE EXTERNAL COMMUNICATION:
NOT ACTIVATED BY THIS TASK

REAL WHATSAPP SENDS:
0

REAL OUTBOUND VOICE CALLS:
0

REAL CRM MUTATIONS:
0

REAL EMAIL SENDS:
0

DOCUMENTATION VERSION:
1.2.0 (Production Operations Runbook & Controlled Activation Plan)

VERIFICATION COMPLETED AT:
2026-09-09T14:30:00+05:30
===================================================================
```

---

## 18. Repository Architecture Verification & Forensic Claims Ledger

This section documents the exact, code-derived forensic verification of all architectural claims against the source code in repository `https://github.com/avani-loan-services/avani-loan-services`.

### 18.1 Authoritative Canonical Loan Product Registry (11 Products)

Verified directly in `src/services/loanQualificationEngine.cjs` (`LOAN_PRODUCTS` enum):

| # | Product Code | Canonical Name / Description | Schema Key | Verification Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | `PERSONAL_LOAN` | Personal / [salary loan](/services/salary-loan) | `QUALIFICATION_SCHEMAS.PERSONAL_LOAN` | `VERIFIED IN REPOSITORY` |
| 2 | `BUSINESS_LOAN` | [business loan](/services/business-loan) (SME / Commercial) | `QUALIFICATION_SCHEMAS.BUSINESS_LOAN` | `VERIFIED IN REPOSITORY` |
| 3 | `DOCTOR_LOAN` | Doctor Professional Loan | `QUALIFICATION_SCHEMAS.DOCTOR_LOAN` | `VERIFIED IN REPOSITORY` |
| 4 | `CA_LOAN` | Chartered Accountant / Professional Loan | `QUALIFICATION_SCHEMAS.CA_LOAN` | `VERIFIED IN REPOSITORY` |
| 5 | `HOME_LOAN` | [home loan](/services/home-loan) & Housing Finance | `QUALIFICATION_SCHEMAS.HOME_LOAN` | `VERIFIED IN REPOSITORY` |
| 6 | `MORTGAGE_LOAN` | Mortgage Loan / Loan Against Property (LAP) | `QUALIFICATION_SCHEMAS.MORTGAGE_LOAN` | `VERIFIED IN REPOSITORY` |
| 7 | `EDUCATION_LOAN_INDIA` | [Education Loan](/services/education-loan) — Domestic (India) | `QUALIFICATION_SCHEMAS.EDUCATION_LOAN_INDIA` | `VERIFIED IN REPOSITORY` |
| 8 | `EDUCATION_LOAN_GLOBAL` | [Education Loan](/services/education-loan) — Global / Overseas | `QUALIFICATION_SCHEMAS.EDUCATION_LOAN_GLOBAL` | `VERIFIED IN REPOSITORY` |
| 9 | `SCHOOL_FUNDING` | School Infrastructure & Institutional Funding | `QUALIFICATION_SCHEMAS.SCHOOL_FUNDING` | `VERIFIED IN REPOSITORY` |
| 10 | `COLLEGE_FUNDING` | College & Higher Education Institutional Funding | `QUALIFICATION_SCHEMAS.COLLEGE_FUNDING` | `VERIFIED IN REPOSITORY` |
| 11 | `CIBIL_CONSULTATION` | CIBIL Repair & Credit Score Consultation | `QUALIFICATION_SCHEMAS.CIBIL_CONSULTATION` | `VERIFIED IN REPOSITORY` |

> **Authoritative Product Count:** Exactly **11 canonical loan products**.

### 18.2 Authoritative CRM Pipeline Lifecycle (9 Canonical Stages)

Verified directly in `src/services/crmPipelineEngine.cjs` (`PIPELINE_STAGES` array & `ALLOWED_TRANSITIONS` matrix):

| # | Pipeline Stage | Permitted Forward Transitions | Stage Classification | Verification Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | `NEW_LEAD` | `CONTACTED`, `QUALIFIED`, `CLOSED_LOST` | Initial Ingestion Stage | `VERIFIED IN REPOSITORY` |
| 2 | `CONTACTED` | `QUALIFIED`, `DOCUMENTS_PENDING`, `CLOSED_LOST` | Engagement Stage | `VERIFIED IN REPOSITORY` |
| 3 | `QUALIFIED` | `DOCUMENTS_PENDING`, `SUBMITTED`, `CLOSED_LOST` | Assessment Stage | `VERIFIED IN REPOSITORY` |
| 4 | `DOCUMENTS_PENDING` | `DOCUMENTS_RECEIVED`, `CLOSED_LOST` | Collection Stage | `VERIFIED IN REPOSITORY` |
| 5 | `DOCUMENTS_RECEIVED` | `SUBMITTED`, `DOCUMENTS_PENDING`, `CLOSED_LOST` | Review Stage | `VERIFIED IN REPOSITORY` |
| 6 | `SUBMITTED` | `SANCTIONED`, `DOCUMENTS_PENDING`, `CLOSED_LOST` | Underwriting Submission Stage | `VERIFIED IN REPOSITORY` |
| 7 | `SANCTIONED` | `DISBURSED`, `CLOSED_LOST` | Credit Approval Stage | `VERIFIED IN REPOSITORY` |
| 8 | `DISBURSED` | *None* (Terminal Successful Fulfillment Stage) | Terminal Success | `VERIFIED IN REPOSITORY` |
| 9 | `CLOSED_LOST` | `NEW_LEAD`, `CONTACTED` (Controlled Reopening Allowed) | Terminal Lost (Mandatory `lostReason`) | `VERIFIED IN REPOSITORY` |

> **Authoritative Stage Count:** Exactly **9 canonical stages**. Notice that `DISBURSED` (terminal success) and `CLOSED_LOST` (terminal lost with mandatory `lostReason`) are separate, independent stages.

### 18.3 Comprehensive Code-Derived Claims Verification Ledger

| Domain | Architectural Claim | Implementation Source | Code Evidence | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Lead Engine** | Sequential monotonic Lead ID format (`ALS-2026-XXXXXX`) | `src/services/centralLeadEngine.cjs` | `generateLeadId()` scans existing leads, increments `maxSeq + 1`, zero-pads to 6 digits | `VERIFIED IN REPOSITORY` |
| **Lead Engine** | Phone number 10-digit normalization | `src/services/centralLeadEngine.cjs` | `normalizeMobile()` strips non-digits, slices last 10 characters | `VERIFIED IN REPOSITORY` |
| **Lead Engine** | Idempotency & deduplication | `src/models/Lead.cjs`, `src/services/centralLeadEngine.cjs` | Matches `idempotencyKey` first, then normalized mobile | `VERIFIED IN REPOSITORY` |
| **Lead Engine** | Duplicate event tracking | `src/services/centralLeadEngine.cjs` | Appends `{ timestamp, source, campaign, correlationId, idempotencyKey }` to `duplicateEvents`, increments `duplicateCount` | `VERIFIED IN REPOSITORY` |
| **Qualification** | Deterministic score range (10–100) | `src/services/loanQualificationEngine.cjs` | `leadScore = Math.min(100, Math.max(10, leadScore))` | `VERIFIED IN REPOSITORY` |
| **Qualification** | Priority grading thresholds | `src/services/loanQualificationEngine.cjs` | `>=70` ➔ `HOT`, `>=45` ➔ `WARM`, `<45` ➔ `COLD` | `VERIFIED IN REPOSITORY` |
| **Qualification** | FOIR / DTI ratio capability scoring | `src/services/loanQualificationEngine.cjs` | `<=0.3` ➔ 35 pts, `<=0.5` ➔ 25 pts, `<=0.7` ➔ 18 pts, `>0.7` ➔ 8 pts | `VERIFIED IN REPOSITORY` |
| **Qualification** | Qualification status outputs | `src/services/loanQualificationEngine.cjs` | `QUALIFIED_FOR_REVIEW`, `INFORMATION_PENDING`, `REVIEW_REQUIRED`, `NOT_READY` | `VERIFIED IN REPOSITORY` |
| **CRM Engine** | Mandatory `lostReason` for `CLOSED_LOST` | `src/services/crmPipelineEngine.cjs` | Throws error if `targetStage === 'CLOSED_LOST'` without `options.reason` or `options.lostReason` | `VERIFIED IN REPOSITORY` |
| **CRM Engine** | Follow-up task scheduling | `src/services/crmPipelineEngine.cjs` | `scheduleFollowUp()` creates `FU-<timestamp>-<rand>`, assigns `dueDate`, updates `nextFollowUp` | `VERIFIED IN REPOSITORY` |
| **WhatsApp** | Provider mode switching (live vs mock) | `src/services/whatsappProviderEngine.cjs` | Defaults to mock if `PROVIDER_MODE === 'mock'` or keys absent | `VERIFIED IN REPOSITORY` |
| **WhatsApp** | Outbound message lifecycle statuses | `src/services/whatsappProviderEngine.cjs` | `API_ACCEPTED`, `SENT`, `DELIVERED`, `READ`, `REPLIED`, `FAILED`, `UNKNOWN` | `VERIFIED IN REPOSITORY` |
| **WhatsApp** | Duplicate message suppression | `src/models/WebhookInbox.cjs`, `src/routes/whatsappWebhookController.cjs` | Webhook atomic inbox checks `registerWebhookEvent`, suppresses duplicates | `VERIFIED IN REPOSITORY` |
| **Document Vault**| 32-byte cryptographic portal token | `src/services/centralLeadEngine.cjs` | `crypto.randomBytes(32).toString('hex')` | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Token hashing via SHA-256 | `src/services/centralLeadEngine.cjs` | `crypto.createHash('sha256').update(token).digest('hex')` | `VERIFIED IN REPOSITORY` |
| **Document Vault**| 7-day token expiration TTL | `src/services/centralLeadEngine.cjs` | `portalTokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000` | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Token revocation endpoint | `src/routes/documentPortalRoutes.cjs` | `/api/documents/portal/:token/revoke` calls `revokePortalToken()` | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Strict MIME type whitelist | `src/routes/documentPortalRoutes.cjs` | `ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])` | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Strict file extension whitelist | `src/routes/documentPortalRoutes.cjs` | `ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png'])` | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Max file size limit | `src/routes/documentPortalRoutes.cjs` | Multer limit `fileSize: 15 * 1024 * 1024` (15 MB) | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Directory traversal / IDOR prevention | `src/routes/documentPortalRoutes.cjs` | `resolvedPath.startsWith(safeBasePath)` enforcement | `VERIFIED IN REPOSITORY` |
| **Document Vault**| Private download streaming headers | `src/routes/documentPortalRoutes.cjs` | `nosniff`, `private, no-cache, no-store`, `attachment` disposition | `VERIFIED IN REPOSITORY` |
| **AI Voice Engine**| Safe simulation mode check | `src/services/aiVoiceWorkflowEngine.cjs` | `isVoiceTestMode()` verifies `VOICE_TEST_MODE`, `NODE_ENV`, or absent API key | `VERIFIED IN REPOSITORY` |
| **AI Voice Engine**| Regulatory non-banking disclosure | `src/services/aiVoiceWorkflowEngine.cjs` | Explicitly disclaims DSA partner status; zero OTP / PIN collection | `VERIFIED IN REPOSITORY` |
| **AI Voice Engine**| Automated advisor handoff | `src/services/aiVoiceWorkflowEngine.cjs` | Calls `scheduleFollowUp()` for advisor review upon simulation completion | `VERIFIED IN REPOSITORY` |
| **Downstream Sync**| HubSpot deterministic upsert & mock | `src/services/crmSyncEngine.cjs` | `syncLeadToHubSpot()` checks `PROVIDER_MODE`, maps `lead_id` property | `VERIFIED IN REPOSITORY` |
| **Downstream Sync**| Google Sheets idempotent update/insert | `src/services/crmSyncEngine.cjs` | `syncLeadToGoogleSheets()` maintains `rowIndex`, updates or appends | `VERIFIED IN REPOSITORY` |
| **Downstream Sync**| Zapier event deduplication | `src/services/crmSyncEngine.cjs` | `syncedEventsLedger` suppresses duplicate `ZAPIER_<leadId>_<eventId>` | `VERIFIED IN REPOSITORY` |
