# AVANI LOAN SERVICES — AISENSY TO CHATMITRA MIGRATION READINESS & IMPLEMENTATION REPORT

**Document ID:** `ALS-MIG-AISENSY-CHATMITRA-2026-001`  
**Evaluation Date:** October 29, 2026  
**Primary Execution Root:** `c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Related CRM Root:** `c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\3-AVANI AI CRM` *(Sibling)*  
**Authoritative Business Entity:** AVANI LOAN SERVICES ([https://www.avanifinserv.com/](https://www.avanifinserv.com/))  
**Managing Director:** Sachin Shinde  
**Operational Verdict:** **HOLD — NOT AUTHORIZED FOR LIVE CUTOVER** (Code Adapters & Mock Tests: PASS | Infrastructure & External Prerequisites: BLOCKED)

---

## 1. Executive Summary & Migration Status

AVANI LOAN SERVICES currently relies on an active **AiSensy Basic** plan (Quarterly subscription) for its primary WhatsApp Business API messaging on `+91 72491 08474` (WABA ID: `1062614709598311`).

To evaluate potential operational cost savings, native inbound webhook automation, and unified lead qualification, a comprehensive engineering audit of the **ChatMitra Pro** platform was performed.

### 1.1 Decision Scorecard

| Evaluation Area | Current Status | Findings & Evidence |
| :--- | :---: | :--- |
| **Code Adapters & Architecture** | ✅ **100% PASS** | `aisensyAdapter.cjs`, `chatmitraProviderEngine.cjs`, and `whatsappProviderEngine.cjs` fully implemented and tested. |
| **Automated Mock Test Suite** | ✅ **100% PASS** | All 12/12 integration tests in `tests/integration/chatmitra_integration.test.cjs` passed with 0 live network calls. |
| **AiSensy Production Operations** | 🛡️ **100% PRESERVED** | Live AiSensy operations, 34 templates, and human advisory inbox remain untouched and operating normally. |
| **Single-BSP WhatsApp Constraint** | ⚠️ **ARCHITECTURAL BLOCKER** | Meta allows a phone number to be linked to only **ONE** BSP at a time. Registering on ChatMitra immediately disconnects AiSensy. |
| **External Subscription Approval** | ⏸️ **PREPARED / AWAITING PAYMENT** | ChatMitra Pro Monthly checkout (₹999 + 18% GST = ₹1,178.82) prepared; awaiting owner Razorpay payment. |
| **Meta Partner Assignment Approval** | ⏸️ **AWAITING OWNER APPROVAL** | Requires owner to grant access to ChatMitra Partner ID `4417989865156453` in Meta Business Manager. |
| **CRM Database Persistence (Gate C)** | 🚨 **BLOCKED** | MongoDB Atlas cluster currently unreachable/paused; zero production database mutations permitted. |
| **Live Migration Authorization** | 🚫 **NOT AUTHORIZED** | Live traffic cutover is strictly prohibited until all prerequisites and staging isolation are verified. |

---

## 2. Current-State Inventory (AiSensy Production Baseline)

### 2.1 AiSensy Account & WABA Configuration
- **Active Subscription:** AiSensy `BASIC` (Quarterly billing active).
- **Monthly Cost:** ₹1,500/month (+ 18% GST = ₹1,770/mo).
- **Official WABA ID:** `1062614709598311`
- **Phone Number ID:** `1147494668457940` (Official Sender: `+91 72491 08474`).
- **Approved Message Templates:** 34 templates active in Meta WhatsApp Manager (e.g., `Avani_Loan_Welcome`, `doctor_loan_offer`).
- **Throughput:** 40 messages/second (2,400 messages/minute).
- **User Seats:** 1 Owner + 5 Agent Logins (monitored by Sachin Shinde and loan advisory staff).

### 2.2 Integration Points & Architectural Scope
1. **Outbound API Integration:**
   - **Endpoint:** `POST https://backend.aisensy.com/campaign/t1/api/v2`
   - **Methodology:** Campaign-driven dispatch with parameters (`userName`, `campaignName`, `destination`, `templateParams`).
   - **Implementation:** [`src/services/aisensyAdapter.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/services/aisensyAdapter.cjs) and fallback branch in [`src/services/whatsappProviderEngine.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/services/whatsappProviderEngine.cjs).
2. **Inbound Webhook Status on Basic Tier:**
   - **Slots Available:** **0 / 0** on AiSensy Basic (Project webhooks require Pro at ₹3,200/mo or an enterprise add-on).
   - **Safety Setting:** Maintained `AISENSY_INBOUND_WEBHOOK_ENABLED = false`.
   - **Inbound Customer Replies:** Handled manually through the AiSensy Shared Live Chat Inbox web console.
   - **Meta Lead Ads:** Ingestion handled via direct Meta Webhook (`/api/whatsapp-webhook` / `/api/meta-webhook`) without routing through AiSensy.
3. **Delivery Status & Deduplication:**
   - Outbound message IDs recorded in `messageStatusLedger`.
   - Atomic idempotency handled via `WebhookInbox` (`registerWebhookEvent` with 5-minute lease locks).
4. **Active Environment Variables (Names Only — Values Protected):**
   - `AISENSY_API_KEY`
   - `AISENSY_API_URL`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `META_WEBHOOK_VERIFY_TOKEN`
   - `ACTIVE_WHATSAPP_PROVIDER` (defaults to `mock` or `aisensy`)

---

## 3. Comprehensive Capability Comparison: AiSensy Basic vs ChatMitra Pro

> [!WARNING]
> **Important Architectural Reality:**  
> ChatMitra is **NOT** a simple drop-in replacement for AiSensy. Switching providers requires migrating the phone number between Business Solution Providers (BSPs) on Meta's infrastructure, changing the API protocol from campaign-based to direct template/session API, and re-verifying Meta 2FA PINs.

| Capability / Dimension | AiSensy Basic (Current Baseline) | ChatMitra Pro (Proposed) | Architectural Impact & Comparison |
| :--- | :--- | :--- | :--- |
| **Base Monthly Cost** | ₹1,500/mo + GST (₹1,770) | **₹999/mo + GST (₹1,178.82)** | **Cost Reduction:** ChatMitra saves ~₹591/mo on base software fee. |
| **Allotted Monthly Credits** | Unlimited via WABA | **1,000 conversation credits/mo** | ChatMitra caps included usage; overage costs ₹0.20/credit. |
| **Outbound Template API** | Campaign API (`POST /campaign/t1/api/v2`) | Client API (`POST /v2/client/send_template`) | Protocol difference: ChatMitra requires structured `components` parameter mapping. Implemented in `chatmitraProviderEngine.cjs`. |
| **Inbound Webhooks** | **Blocked (0/0 slots on Basic)** | **Included (Full Webhook Support)** | **Major Upgrade:** ChatMitra enables automated 2-way bot qualification without human manual polling. |
| **Webhook Signature Verification** | N/A (Webhooks not supported on Basic) | **HMAC-SHA256 (`X-Webhook-Signature`)** | Verified in `verifyChatMitraWebhookSignature()` with timing-safe comparison. |
| **Session Messages (24h Window)** | Handled in live chat console | `POST /developer/api/send_message` | Free within 24h Meta customer-care window; ₹0.20 ChatMitra credit. |
| **Delivery Status Tracking (DLR)** | Basic delivery dashboard | Webhook `message.status.updated` (`delivered`, `read`, `failed`) | Automated state updates to CRM `Lead` and `messageStatusLedger`. |
| **Campaign Scheduling** | Blocked on Basic (AVANI built custom cron) | Native UI + API Scheduling | ChatMitra provides built-in scheduling in dashboard. |
| **Multi-Channel Social Inboxes** | Not included | **Not Supported** | ChatMitra Pro does **NOT** support Instagram DMs or Facebook Messenger (requires enterprise). |
| **AI Telephony / Voice Calling** | Not included | **Not Supported** | Neither provider offers voice. Voice is strictly handled by `5-AVAVI AI CALLING AGENT` (Vapi/Bland). |
| **Number Portability (Single-BSP Rule)** | Currently holds `+91 72491 08474` | Requires Meta Partner assignment | **High Risk:** Re-assigning to ChatMitra instantly revokes AiSensy access. |

---

## 4. Required Code & Configuration Changes

The code changes required for ChatMitra support have already been created in a non-destructive manner:

1. **`src/services/chatmitraProviderEngine.cjs`:**
   - Dedicated provider engine with mock mode safety gate.
   - Handles template dispatch (`/v2/client/send_template`) and session dispatch (`/developer/api/send_message`).
   - Timing-safe HMAC-SHA256 webhook signature verifier (`verifyChatMitraWebhookSignature`).
2. **`src/services/whatsappProviderEngine.cjs`:**
   - Multi-provider router with priority fallback:
     1. Mock mode (`PROVIDER_MODE=mock`)
     2. Meta Cloud API (`META_WHATSAPP_TOKEN`)
     3. AiSensy (`AISENSY_API_KEY`)
     4. ChatMitra (`CHATMITRA_API_KEY` or `ACTIVE_WHATSAPP_PROVIDER=chatmitra`)
3. **Environment Configuration Requirements (To be added only when authorized):**
   ```env
   # Provider Selection Flag
   ACTIVE_WHATSAPP_PROVIDER=chatmitra
   
   # ChatMitra Pro Credentials
   CHATMITRA_API_KEY=<SECURE_BEARER_TOKEN>
   CHATMITRA_WEBHOOK_SECRET=<SECURE_WEBHOOK_SECRET>
   ```

---

## 5. Controlled Test Plan (Mocks & Dedicated Test Numbers)

To eliminate any risk to real loan customers, testing must proceed through 3 strict stages:

```
[Stage 1: In-Memory Mocks (PASS)] 
  └── Zero network calls, 12/12 tests passing, Ledger verified.
        │
        ▼
[Stage 2: Staging Test Mobile Number (PENDING AUTHORIZATION)]
  └── Never use real customer numbers.
  └── Use dedicated owner test SIM (+91 72491 08474 test partition or secondary test SIM).
  └── Dispatch single test template: "Avani_Loan_Welcome".
  └── Verify delivery receipt callback (DELIVERED, READ).
        │
        ▼
[Stage 3: Controlled Production Cutover (BLOCKED / HOLD)]
  └── Off-hours maintenance window (e.g., Sunday 10:00 PM – 11:00 PM IST).
  └── Owner Meta Partner assignment + 2FA PIN verification.
  └── Full rollback verification before traffic cutover.
```

---

## 6. Comprehensive AiSensy Rollback Plan (< 5 Minutes)

If a live migration to ChatMitra is ever attempted and fails, the following rollback procedure restores AiSensy production operations within 5 minutes:

1. **Meta Business Manager Partner Reassignment:**
   - Log in to [Meta Business Manager](https://business.facebook.com/).
   - Navigate to **Business Settings → WhatsApp Accounts → `1062614709598311`**.
   - Under **Partners**, revoke ChatMitra Partner ID `4417989865156453` and assign Full Control back to AiSensy.
2. **Phone Number Re-Verification:**
   - In Meta WhatsApp Manager -> Phone Numbers, click **Verify** on `+91 72491 08474`.
   - Submit the 6-digit SMS/Voice OTP received on the registered device.
3. **Application Configuration Reversion:**
   - In `.env` / Vercel Environment Variables, set:
     ```env
     ACTIVE_WHATSAPP_PROVIDER=aisensy
     ```
   - Restart or redeploy the application.
4. **Post-Rollback Verification:**
   - Dispatch a test template via AiSensy live chat console.
   - Confirm delivery to the test mobile within 30 seconds.

---

## 7. External Dependencies & Required Owner Approvals

Before any live migration could be authorized, the owner must complete:

1. **Owner Approval 1 — Complete ChatMitra Pro Monthly Purchase:**
   - Log in to [ChatMitra Billing Dashboard](https://app.chatmitra.com/billing-and-payments).
   - Complete the prepared ₹999 + GST Razorpay checkout.
2. **Owner Approval 2 — Meta Business Manager Partner Assignment:**
   - Grant WABA access to ChatMitra Partner ID `4417989865156453`.
3. **Owner Approval 3 — Meta 2FA PIN Provisioning:**
   - Enter the Meta two-factor authentication PIN when prompted in the vendor portal.
4. **Owner Approval 4 — Off-Hours Maintenance Window Authorization:**
   - Explicit written scheduling of a low-traffic window to prevent lead drop-off during DNS/BSP propagation.

---

## 8. Final Operational Verdict

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FINAL OPERATIONAL VERDICT                       │
├────────────────────────────────────────────────────────────────────────┤
│                                 HOLD                                   │
│  - Code Adapters & Architecture: 100% COMPLETE                         │
│  - Automated Test Suites: 100% PASS (12/12 Mock Tests)                 │
│  - Existing AiSensy Production Operations: 100% PRESERVED & PROTECTED  │
│  - Live WhatsApp Number Migration: NOT AUTHORIZED FOR LIVE CUTOVER     │
│  - Staging Isolation & Database Persistence: GATE 5 HOLD / GATE C BLOCKED │
└────────────────────────────────────────────────────────────────────────┘
```

**Certification:** Zero real customer communications sent; zero production database mutations; zero unauthorized recurring subscriptions.
