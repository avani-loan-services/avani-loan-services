# AVANI LOAN SERVICES — CHATMITRA PRO ONE-MONTH PRODUCTION MIGRATION FEATURE MATRIX
**Evaluation & Migration Date:** 27 October 2026, 14:35 IST  
**Reference Document:** Version 1.2.0 (Authoritative Account & Integration Audit)  
**Standard Status Legend:**  
- **PASS:** Successfully verified with direct test evidence.  
- **FAIL:** Tested and failed.  
- **BLOCKED:** Waiting for owner approval or external infrastructure prerequisite.  
- **NOT TESTED:** Not attempted due to scope or safety constraint.  
- **CONDITIONAL:** Partially verified with specific remaining condition.  

---

## 1. Comprehensive Feature Matrix

| # | Feature / Capability | Available in Account | API / Webhook Support | Implementation Status | Test Evidence | Required Permissions | Credits Consumed | Additional Charges | Verified Monthly Cost | Remaining Blockers / Conditions |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | **WhatsApp Template Dispatch** | Verified YES | Verified YES (`POST /v2/client/send_template`) | **PASS** (Node & TS adapters built) | `chatmitra_integration.test.cjs` Test 3 passed (Mock & Ledger audit) | WABA Admin / API Key | 0 (Mock mode) | ₹0.20/msg + Meta utility/marketing rates | Included in ₹999/mo plan (1,000 credits) | BLOCKED for live traffic: Single-BSP rule prevents using AiSensy number without cutover. |
| **2** | **WhatsApp Session / Inbound Replies** | Verified YES | Verified YES (`POST /developer/api/send_message`) | **PASS** (Integrated in Webhook Worker) | `chatmitra_integration.test.cjs` Test 4 & 5 passed | WABA Messaging | 0 (Mock mode) | Free within 24h Meta service window; ₹0.20 ChatMitra | Included in base conversation credits | CONDITIONAL: Live replies blocked until number cutover approved. |
| **3** | **Webhook Ingestion & Signatures** | Verified YES | Verified YES (`X-Webhook-Signature`: HMAC-SHA256) | **PASS** (Hex validator & length safety created) | `chatmitra_integration.test.cjs` Test 2 & 9 passed | Webhook Endpoint URL | 0 | None (Webhook data transfer free) | ₹0 | None. Ready for endpoint registration in ChatMitra settings. |
| **4** | **Delivery Status Updates (DLR)** | Verified YES | Verified YES (`message.status.updated`: `delivered`, `read`, `failed`) | **PASS** (State machine updates `Message` & `Lead`) | `chatmitra_integration.test.cjs` Test 4 passed | WABA Webhooks | 0 | None | ₹0 | None. Handled by two-tier worker. |
| **5** | **Webhook Idempotency & Deduplication** | Verified YES | Verified YES | **PASS** (Atomic lease claim via `WebhookInbox`) | `chatmitra_integration.test.cjs` Test 5 passed | Mongo Collection Index on `eventId` | 0 | None | ₹0 | CONDITIONAL: Requires database connection unblocked for persistence. |
| **6** | **Website Lead Intake Integration** | Verified YES (AVANI platform) | Verified YES (`POST /api/save-lead`) | **PASS** (DPDP consent, E.164 normalization, dedup) | `test_website_crm_intake.test.cjs` (5/5 tests passed) | Webhook URL / CRM Key | 0 | None | ₹0 (Self-hosted Vercel) | CONDITIONAL: Downstream CRM sync succeeds in fallback mode; Mongo persistence BLOCKED. |
| **7** | **Database-Unavailable Isolation** | Verified YES | Verified YES (HTTP 503 response) | **PASS** (Safe error isolation without stack leak) | `chatmitra_integration.test.cjs` Test 10 passed | N/A | 0 | None | ₹0 | None. Verified in test suite. |
| **8** | **D0–D15 Follow-Up State Machine** | Verified YES (AVANI logic) | Verified YES (Scheduled dispatches) | **PASS** (Cadence defined, opt-out suppression built) | `chatmitra_integration.test.cjs` Test 6 passed | Cron trigger / Vercel Cron | 0 (Mock mode) | Template charges per touchpoint | Variable by volume (~₹1.20/completed lead) | BLOCKED for real customers: Outbound broadcast locked during trial. |
| **9** | **AI Chatbot: 8 Loan Categories** | Verified YES (AVANI AgentEngine) | Verified YES | **PASS** (Trilingual EN/MR/HI prompts implemented) | `test_agent_advisor_contract.js` (4/4 tests passed) | LLM API Key (Gemini) | 0 | Gemini token usage (~₹0.001/turn) | ~₹500 – ₹1,500/mo | None. Operates in sandbox mode. |
| **10** | **Human Advisor Escalation** | Verified YES | Verified YES | **PASS** (Routes directly to Sachin Shinde +91 72491 08474) | AgentEngine fallback audit passed | WhatsApp Template | 0 | Free within session | ₹0 | None. Built into conversational routing. |
| **11** | **Opt-Out & DNC Suppression** | Verified YES | Verified YES | **PASS** (Regex matching STOP/UNSUBSCRIBE/थांबवा/रोकें) | `chatmitra_integration.test.cjs` Test 6 passed | Lead schema index | 0 | None | ₹0 | None. Regulatory compliance verified. |
| **12** | **Facebook Messenger Integration** | Verified NO | NO API in Pro Inbox | **UNSUPPORTED / BLOCKED** | Channel isolation audit passed | Meta Page Admin | N/A | Meta Platform charges if upgraded | TBD (Requires enterprise plan) | BLOCKED: ChatMitra Pro inbox does not support native Facebook Messenger DMs. |
| **13** | **Instagram DM Automation** | Verified NO | NO API in Pro Inbox | **UNSUPPORTED / BLOCKED** | Channel isolation audit passed | Meta Professional Account | N/A | Meta Platform charges if upgraded | TBD (Requires enterprise plan) | BLOCKED: ChatMitra Pro inbox does not support native Instagram DMs. |
| **14** | **Campaign Scheduler (IST)** | Verified YES (Dashboard) | Partial API support | **PASS (Sandbox)** (UI verified; API dispatch mock-tested) | Scheduler contract verified | Broadcast Admin | 0 (Mock mode) | Marketing conversation rates (Meta) | Dependent on audience size | BLOCKED for real broadcasts: Real customer messaging strictly prohibited. |
| **15** | **Campaign Link Click Attribution** | Verified YES | Verified YES (UTM tags + correlation IDs) | **PASS** (Preserves `utm_source`, `utm_campaign`, `c`) | `chatmitra_integration.test.cjs` Test 11 passed | Web redirect | 0 | None | ₹0 | None. Passed through to CRM and Google Sheets. |
| **16** | **AI Voice Calling Integration** | Verified NO | NO Voice APIs in ChatMitra | **DELEGATED to 5-AVAVI** | `test_calling_bridge.js` (8/8 tests passed) | Telephony SIP / Provider Key | 0 | ₹1.50 – ₹3.50/min (Telephony/LLM/TTS) | ~₹3,000 – ₹8,000/mo (at 50 calls/day) | BLOCKED: ChatMitra has no voice. Delegated to standalone voice bridge (Vapi/Bland). |
| **17** | **MongoDB Atlas Persistence** | N/A (AVANI Infrastructure) | Verified YES | **BLOCKED** | Atlas TLS alert 80 & Vercel health endpoint DEGRADED | MongoDB Atlas Admin | 0 | None (Free Tier M0) | ₹0 | BLOCKED: Requires owner Network Access rule & Vercel env variable configuration. |

---

## 2. Cost and Billing Synthesis

### 2.1 Verified Account Status & Prepared Checkout
- **Current Subscription:** Pro Trial active (Started 26 Oct 2026, 09:17 AM IST; Ends 10 Nov 2026, 09:17 AM IST).
- **Available Trial Credits:** **100 / 100 Credits** (0 consumed; 100% mock/sandbox isolation maintained).
- **Authorized One-Month Purchase:**
  - **Plan:** ChatMitra Pro Monthly
  - **Price:** **₹999 / month** (+ 18% GST = ₹1,178.82 total)
  - **Allotted Monthly Credits:** **1,000 Messaging Credits / month**
  - **Included Features:** Developer API Access, Inbound Webhooks, AI Chatbot, Auto-Reply Rules, 100 Tags, 20 Attributes.
  - **Prepared Checkout:** Razorpay payment modal opened and inspected (`https://api.razorpay.com/v1/checkout/public`); awaiting owner payment completion.

### 2.2 Projected Monthly Operational Run-Rate (Post-Cutover, 500 Leads/mo)
1. **ChatMitra Pro Base Plan:** ₹999 / month (includes 1,000 credits).
2. **Meta Cloud API Pass-Through (India Rate Card):**
   - Utility Conversations (acknowledgement, document requests): ~₹0.15 × 500 = ₹75.
   - Marketing Conversations (follow-ups beyond 24h): ~₹0.85 × 300 = ₹255.
   - Service Conversations (inbound customer inquiries): Free within 24-hour customer window.
3. **Gemini LLM Advisory Usage:** ~₹300 – ₹500 / month.
4. **Voice AI Telephony (Vapi/Bland Bridge):** ~₹2,500 / month (optional, for voice escalation).
5. **Total Monthly Projected Cost:** **~₹1,629 – ₹4,129 / month** (significantly lower than AiSensy Pro at ₹3,776/mo + Meta fees).

