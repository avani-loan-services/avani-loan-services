# AVANI LOAN SERVICES — CHATMITRA PRO ONE-MONTH PRODUCTION MIGRATION PLAN
**Evaluation & Migration Date:** 27 October 2026, 14:35 IST  
**Document Reference:** Version 1.2.0 (Autonomous Execution & Provider Migration Architecture)  
**Target Repositories:**  
- `1-AVANI LOAN SERVICE FY 26-27`  
- `3-AVANI AI CRM`  
- `4-AVANI LOAN AGENTS`  
- `5-AVAVI AI CALLING AGENT`  

---

## 1. System Architecture & Dual-Provider Design

Due to Meta Cloud API constraints preventing multi-BSP coexistence on a single phone number, AVANI LOAN SERVICES maintains a **Decoupled Dual-Provider Architecture**:

```
 [Website Leads: avanifinserv.com]
                 │
                 ▼
     [POST /api/save-lead]  ─── (DPDP Consent + Deduplication)
                 │
                 ▼
   [AVANI AI CRM: POST /api/leads] ── (Canonical Normalization & Audit)
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[AiSensy Engine]      [ChatMitra Engine]
(Current Live Active) (Pro 1-Mo Target Engine)
- +91 72491 08474     - Authoritative REST Schemas
- Preserved for       - Ledger Audit Tracing
  Instant Rollback    - X-Webhook-Signature Validation
```

### 1.1 Core Architectural Principles
1. **Zero Production Interruption:** The live AiSensy integration remains fully active on `+91 72491 08474` until all pre-cutover verification gates and owner approval are met.
2. **Authoritative Provider Endpoints:**
   - **Template Messages:** `POST https://api.chatmitra.com/v2/client/send_template`
   - **Session Messages:** `POST https://backend.chatmitra.com/developer/api/send_message`
3. **Safety Gate Enforcement:** When `PROVIDER_MODE=mock` or `APP_MODE=test`, outbound calls bypass external network gateways, record simulated acceptance to `ProviderLedger`, and generate structured tracking IDs (`CM-MOCK-*`).

---

## 2. End-to-End Lead Intake & Handoff Pipeline

### 2.1 Step 1: Website Lead Capture (`POST /api/save-lead`)
- **Location:** `1-AVANI LOAN SERVICE FY 26-27/api/save-lead.js`
- **Validation Rules:**
  - Phone normalized to Indian E.164 format (`+91` + 10 digits starting with 6–9).
  - Loan category mapped to 8 canonical types.
  - DPDP Act consent verified (`consentStatus: 'GRANTED'`).
  - In-memory 30-second deduplication cache prevents rapid-fire duplicate submissions.
  - Generates immutable correlation ID (`CORR-WEB-*`) and lead ID (`AVL-YYYYMMDD-XXXXXX`).

### 2.2 Step 2: CRM Intake (`POST /api/leads`)
- **Location:** `3-AVANI AI CRM/src/app/api/leads/route.ts`
- **Behavior:**
  - Authenticates via `x-api-key`.
  - Performs atomic upsert on normalized mobile number to avoid duplicate lead creation.
  - If database is offline, responds with HTTP 503 `DATABASE_UNAVAILABLE` to trigger upstream queuing without dropping lead data.

### 2.3 Step 3: Outbound Provider Dispatch
- **Modules:**
  - Node.js: `1-AVANI LOAN SERVICE FY 26-27/src/services/chatmitraProviderEngine.cjs`
  - Next.js TypeScript: `3-AVANI AI CRM/src/lib/chatmitra.ts`
- **Payload Specifications:**
  - Template payload maps variables to `components.parameters`.
  - Session payload sends raw text structure under `messages.payload`.

---

## 3. Two-Tier Webhook Ingestion & Worker Flow

To prevent webhook dropouts under Meta/ChatMitra delivery spikes, AVANI AI CRM utilizes a **Two-Tier Architecture**:

```
[Inbound Webhook: POST /api/whatsapp-webhook]
                 │
                 ├── 1. Signature Verification (X-Webhook-Signature: HMAC-SHA256)
                 ├── 2. Fast DB Write to WebhookInbox (Status: 'RECEIVED')
                 ├── 3. Return HTTP 200 OK (< 200ms)
                 └── 4. Trigger Worker via waitUntil (Non-blocking)
                                   │
                                   ▼
          [Worker: POST /api/whatsapp-webhook-worker]
                                   │
                 ├── 1. Atomic Lease Claim (Distributed Lock)
                 ├── 2. Deduplication check on eventId
                 ├── 3. Parse Event (message.received or message.status.updated)
                 ├── 4. Update Message / Lead Records
                 ├── 5. Trigger AI Chatbot Response or Advisor Handoff
                 └── 6. Mark WebhookInbox as 'COMPLETED'
```

---

## 4. D0–D15 Automated Follow-Up Workflow State Machine

The follow-up cadence provides structured, consent-abiding touchpoints across the evaluation period:

```
  ┌────────────────────────────────────────────────────────┐
  │ [D0] Acknowledgement & Immediate Consent Confirmation  │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ [D1] Eligibility & Pre-Qualification Overview          │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ [D3] Specific Product Features & Interest Guidance     │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ [D7] Follow-up Reminder & Document Readiness           │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ [D10] Document Checklist Submission Prompt             │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ [D15] Final Review / Direct Advisor Handoff            │
  └────────────────────────────────────────────────────────┘
```

### 4.1 Touchpoint Specifications
| Day | Stage Key | Template Name | Mandatory Condition |
| :--- | :--- | :--- | :--- |
| **D0** | `ACK_WELCOME` | `avani_welcome_ack` | Valid DPDP consent captured |
| **D1** | `ELIGIBILITY_INFO` | `avani_eligibility_criteria` | Lead not closed or opted out |
| **D3** | `PRODUCT_DETAILS` | `avani_product_details` | Lead status remains ACTIVE |
| **D7** | `REMINDER_CHECKIN`| `avani_loan_status_check` | No customer reply received yet |
| **D10**| `DOCS_CHECKLIST` | `avani_doctor_checklist` | Loan category requires docs |
| **D15**| `FINAL_FOLLOWUP` | `avani_human_advisor_connect`| Direct escalation to Sachin Shinde |

### 4.2 Opt-Out Suppression Rules
- **Triggers:** Inbound messages matching: `STOP`, `UNSUBSCRIBE`, `CANCEL`, `थांबवा` (Marathi), `रोकें` (Hindi), `बंद करा`, `नको`.
- **Execution:**
  1. Lead status set to `OPTED_OUT`, `isOptedOut = true`, `consentStatus: 'WITHDRAWN'`.
  2. All scheduled pending messages canceled immediately via `FollowUpEngine.cancelPendingFollowUps`.
  3. Single opt-out confirmation sent.
  4. Permanent suppression against all future automated dispatches.

---

## 5. Production Number Cutover & Rollback Runbook

### 5.1 Cutover Prerequisites Gate
Before cutover can be initiated:
1. **Persistence Gate Unblocked:** MongoDB Atlas Network Access configured; synthetic write/read-back PASS.
2. **One-Month Plan Checkout Completed:** Owner completes payment for ChatMitra Pro 1-Month (₹999 + GST).
3. **Owner Authorization for Number Migration:** Explicit owner presence to handle Meta Business Manager partner assignment and 2FA challenge.

### 5.2 Step-by-Step Cutover Execution Procedure
1. **Maintenance Notice:** Post 15-minute maintenance window advisory if needed.
2. **Meta Business Manager Partner Assignment:**
   - Log into [business.facebook.com](https://business.facebook.com).
   - Navigate to **Business Settings** → **WhatsApp Accounts** → Select AVANI WABA (`1062614709598311`).
   - Click **Assign Partner**.
   - Enter ChatMitra Partner ID: `4417989865156453` (or `441798986516543`).
   - Grant **Full Access (Everything)** and confirm.
3. **ChatMitra Number Registration:**
   - On `https://app.chatmitra.com/dashboard`, enter:
     - WhatsApp Business Account ID: `1062614709598311`
     - Phone Number ID: `1147494668457940`
   - Click **Connect**.
4. **Meta 2FA Verification:**
   - Complete 2FA PIN challenge directly in Meta portal / SMS. (Never share PIN in chat or logs).
5. **Template Synchronization:**
   - On `https://app.chatmitra.com/template-message`, click **Sync Templates** to import existing approved templates.
6. **Webhook Registration:**
   - In ChatMitra Settings → Webhooks, set endpoint URL to: `https://avani-ai-crm.vercel.app/api/whatsapp-webhook`.
   - Copy Webhook Secret and set in Vercel `CHATMITRA_WEBHOOK_SECRET`.
7. **Switch CRM Provider Flag:**
   - In Vercel Environment Variables, set `ACTIVE_WHATSAPP_PROVIDER=chatmitra` and `PROVIDER_MODE=live`.

### 5.3 Emergency Rollback Runbook (< 5 Minutes)
If message delivery fails, webhook synchronization halts, or provider errors occur:
1. **Revert Provider Route:** Set `ACTIVE_WHATSAPP_PROVIDER=aisensy` in Vercel environment variables.
2. **Re-link AiSensy Partner:** In Meta Business Manager, re-assign AiSensy Partner ID or re-authorize AiSensy Project `6a670f94d0c39f57eaa6799f`.
3. **Restart Inbound Flow:** AiSensy Live Chat console resumes real-time customer routing instantly.
4. **Zero Data Loss:** All inbound webhooks during the transition are retained in `WebhookInbox` with status tracking.

---

## 6. Social Channels & AI Voice Calling Scope

### 6.1 Facebook Messenger & Instagram DM
- **Finding:** ChatMitra Pro does not include native social inbox API access for Instagram DM or Facebook Messenger.
- **Resolution:** Keep status as **UNSUPPORTED / BLOCKED** in ChatMitra. Social ads redirect via Click-to-WhatsApp URLs (`https://wa.me/917249108474?text=...`).

### 6.2 AI Voice Calling
- **Finding:** ChatMitra is strictly a text-based WhatsApp platform and provides zero voice calling APIs.
- **Resolution:** Trilingual voice AI testing is executed autonomously within `5-AVAVI AI CALLING AGENT` via `calling-agent-bridge.js`. Synthetic contracts verified for Vapi, Bland, and Pipecat architectures (8/8 tests pass).

---

## 7. Migration Timeline & Current Gate Status

| Milestone Date | Phase | Focus Areas | Current Gate Status |
| :--- | :--- | :--- | :--- |
| **26 Oct 2026** | **Phase 1: Discovery & Baseline** | Account profile audit, credit check (100), single-BSP analysis, Vercel health check. | **PASS** |
| **26–27 Oct 2026** | **Phase 2: Verified Adapter Build**| Authoritative endpoints integration, safe signature buffer comparison, 12-test suite. | **PASS** |
| **27 Oct 2026** | **Phase 3: Synthetic Validation** | 12/12 ChatMitra tests, 8/8 Forensic regression tests, 8/8 Voice tests passed. | **PASS** |
| **27 Oct 2026** | **Phase 4: 1-Month Pro Plan Preparation**| Checkout prepared on Razorpay (₹999); awaiting owner payment action. | **AWAITING OWNER CHECKOUT** |
| **27 Oct 2026** | **Phase 5: Persistence Remediation**| Atlas Network Access configuration & Vercel production `MONGODB_URI` connection. | **BLOCKED (Owner Action)** |
| **Cutover Gate** | **Phase 6: Production Cutover** | Meta Partner assignment (`4417989865156453`), 2FA PIN, and controlled owner test dispatch. | **HOLD (Pending Persistence & Checkout)** |

