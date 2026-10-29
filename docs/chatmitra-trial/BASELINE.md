# AVANI LOAN SERVICES — CHATMITRA PRO ONE-MONTH PRODUCTION MIGRATION BASELINE
**Evaluation & Migration Date:** 27 October 2026, 14:35 IST  
**Account Evaluation Scope:** ChatMitra Pro One-Month Evaluation & Controlled Production Test  
**Last Verified Timestamp:** 27 October 2026, 14:35 IST  
**Primary Objective:** Autonomous execution, database unblocking, provider cutover preparation, test verification, and forensic sign-off across AVANI LOAN SERVICES platforms.  
**Current Operational Decision:** HOLD — SANDBOX ONLY; PERSISTENCE & CUTOVER SECURITY GATES BLOCKED PENDING OWNER ACTION  

---

## 1. Executive Summary & Verified Account Parameters

AVANI LOAN SERVICES has evaluated **ChatMitra Pro** as a prospective WhatsApp Business Solution Provider (BSP) for a controlled one-month production test alongside the existing production provider, **AiSensy**.

| Parameter | Verified Live Setting | Verification Source |
| :--- | :--- | :--- |
| **Subscription Plan** | Pro Trial (15 Days) Active; 1-Month Pro Upgrade Prepared | ChatMitra Dashboard (`https://app.chatmitra.com/billing-and-payments`) |
| **Trial Start Date** | 26 October 2026, 09:17 AM IST | Authenticated Account Profile |
| **Trial Expiry Date** | 10 November 2026, 09:17 AM IST (13 days, 18 hours remaining) | Authenticated Account Profile |
| **One-Month Pro Price** | **₹999 / month** (+ applicable GST) | Live Billing Portal (`/billing-and-payments` Monthly Plan) |
| **Monthly Pro Plan Includes**| **1,000 free Messaging credits / month**; Developer API Access; Webhooks; AI Chatbot; 100 Tags; 20 Attributes | Live Billing Portal Comparison Table |
| **Checkout Status** | Razorpay Modal Prepared (`Total: ₹999`); awaiting owner payment completion | Live Razorpay iFrame (`api.razorpay.com/v1/checkout`) |
| **Current Available Credits**| **100 Conversation Credits** | Live Account Dashboard (`https://app.chatmitra.com/dashboard`) |
| **Credits Consumed** | **0 / 100 Credits** | Zero live outbound calls triggered; 100% mock/sandbox isolation |
| **Platform Charge** | ₹0.20 per conversation credit | ChatMitra Developer Pricing Schedule |
| **Meta Pass-Through Charges** | Standard Meta Cloud API Rate Card for India | Marketing: ~₹0.85; Utility: ~₹0.15; Service: Free within 24h window |
| **ChatMitra Partner ID** | `4417989865156453` (Setup Guide) / `441798986516543` | Live Onboarding Setup Modal (`uid=11_7`) |
| **WABA Connection Mode** | Manual Setup (WABA ID + Phone Number ID) | `https://app.chatmitra.com/dashboard` (`uid=10_40`) |
| **Templates Approved** | 0 custom templates approved (WABA not yet connected to ChatMitra) | `https://app.chatmitra.com/template-message` |

---

## 2. Authoritative Provider API & Webhook Contract Audit

Following direct inspection of authoritative ChatMitra developer documentation and live platform dashboard:

### 2.1 Outbound Endpoints & Schemas
1. **Template Messaging:**
   - **Endpoint:** `POST https://api.chatmitra.com/v2/client/send_template`
   - **Auth:** `Authorization: Bearer <API_KEY>` (e.g. `aa61b02a34b7••••••••`)
   - **Payload:**
     ```json
     {
       "templateName": "avani_loan_welcome",
       "language": "en",
       "phoneNumber": "919876543210",
       "components": [{ "type": "body", "parameters": [{ "type": "text", "text": "Dr. Sachin" }] }]
     }
     ```
   - **Response:** HTTP 200 `{ "messageId": "...", "creditsUsed": 1 }`
2. **Session Messaging (Inbound Customer Replies within 24 Hours):**
   - **Endpoint:** `POST https://backend.chatmitra.com/developer/api/send_message`
   - **Auth:** `Authorization: Bearer <API_KEY>`
   - **Payload:**
     ```json
     {
       "recipient_mobile_number": "919876543210",
       "messages": [{ "kind": "raw", "payload": { "type": "text", "text": { "body": "..." } } }]
     }
     ```

### 2.2 Inbound Webhook Specification & Security
- **Official Signature Header:** `X-Webhook-Signature`
- **Algorithm:** Plain hexadecimal `HMAC-SHA256` of raw request body (without `sha256=` prefix). Legacy `sha256=` format supported backwards-compatibly.
- **Supported Event Types:**
  - `message.received`: Customer inbound message (text, quick-reply, media).
  - `message.sent`: Outbound message accepted by gateway.
  - `message.status.updated`: Delivery receipts (`delivered`, `read`, `failed`).
- **Idempotency & Processing:** Two-tier architecture with `WebhookInbox` deduplication and background worker (`/api/whatsapp-webhook-worker`).

---

## 3. AiSensy Configuration Inventory & Number Migration Analysis

### 3.1 AiSensy Baseline Configuration Inventory
To guarantee 100% preservation and instant rollback capability:
- **Business Entity:** AVANI LOAN SERVICES (`https://www.avanifinserv.com`)
- **Authorized Manager:** Sachin Shinde
- **Active Provider:** AiSensy (WABA Cloud API integration)
- **Active Subscription:** `BASIC` (Quarterly subscription, ₹1,500/mo + GST)
- **Production Number:** `+91 72491 08474`
- **WABA ID:** `1062614709598311` (or `1147494668457940`)
- **AiSensy Project ID:** `6a670f94d0c39f57eaa6799f` (or `6a670f94d0c39f57eaa6799a`)
- **Approved Message Templates:** 34 templates in AiSensy library (`Avani_Loan_Welcome`, `doctor_loan_offer`, `doctor_loan_intro_v2`, etc.)
- **Outbound Dispatch Endpoint:** `POST https://backend.aisensy.com/campaign/t1/api/v2`
- **Inbound Ingestion:** AiSensy Live Chat Inbox (5 human agent seats)
- **Lead Source Mappings:** Website contact forms (`/api/save-lead`), CRM upload (`/api/leads`), Google Sheets sync, Zapier webhooks.
- **Opt-Out & Suppression:** Handled via `Lead.isOptedOut` and `Lead.status = 'OPTED_OUT'` on keywords `STOP`, `UNSUBSCRIBE`, `थांबवा`, `रोकें`.

### 3.2 Meta Cloud API Single-BSP & Cutover Constraint
1. **Single Registration Rule:** Meta Cloud API strictly allows only **one active Business Solution Provider (BSP) or WABA registration per phone number** at any time.
2. **Coexistence Status:** Concurrent multi-BSP operation on the *same physical number* is **architecturally impossible**.
3. **Migration Consequence:** In Meta Business Manager, assigning ChatMitra Partner ID `4417989865156453` and entering WABA ID + Phone Number ID into ChatMitra transfers OBO registration and **immediately disconnects AiSensy**, breaking live operations.
4. **Preservation Mandate:** AiSensy configuration, credentials, and templates remain 100% untouched. No cutover action has been performed.

---

## 4. CRM Infrastructure & Database Persistence Baseline

### 4.1 Production Vercel Deployment Audit
- **Vercel Project:** `avani-ai-crm` (`prj_P8s8y3a5Gge8EzAab0Fa10cHewgQ`)
- **Live Health Endpoint Check (`27 Oct 2026, 14:11 IST`):**
  - URL: `https://avani-ai-crm.vercel.app/api/health`
  - Response: HTTP 200
    ```json
    {
      "status": "DEGRADED",
      "timestamp": "2026-10-27T08:41:00.642Z",
      "service": "AVANI LOAN SERVICES — AVANI AI CRM",
      "environment": { "appMode": "production", "providerMode": "production" },
      "integrations": {
        "database": { "status": "BLOCKED", "error": "Connection readyState != 1" },
        "metaWaba": { "status": "HEALTHY", "phoneNumberId": "1147494668457940", "resolvedSenderNumber": "+91 72491 08474" },
        "avaniAiAgent": { "status": "HEALTHY" }
      }
    }
    ```
- **Live Leads Route Check (`27 Oct 2026, 14:34 IST`):**
  - URL: `https://avani-ai-crm.vercel.app/api/leads`
  - Response: HTTP 500
  - Error: `Cannot call leads.find() before initial connection is complete if bufferCommands = false.`
- **Vercel Execution Region:** Header `x-vercel-id: bom1::iad1::...` confirms routing through Mumbai edge (`bom1`) to serverless compute execution at **Washington, D.C. / AWS us-east-1 (`iad1`)**.

### 4.2 Database Root Cause Analysis & Security Gate
1. **Atlas Cluster Connection:** `avani-dev-cluster.wmv4ncg.mongodb.net` (shards `ac-dhzeenm-shard-00-00/01/02` at IPs `159.41.181.40`, `159.41.181.55`, `159.41.181.67` in AWS ap-south-1 Mumbai) drops TLS connections with `SSL alert number 80: Internal Error` because requesting IPs are not on the Atlas Network Access list.
2. **Dynamic Workstation IP:** Current developer workstation IP is `110.227.7.63`.
3. **Serverless Egress Realities:** Whitelisting workstation IP `110.227.7.63` does **NOT** enable Vercel production serverless egress, as Vercel functions execute across dynamic AWS IP ranges in `iad1` (us-east-1).
4. **Security Constraints:**
   - Enabling `0.0.0.0/0` in MongoDB Atlas is strictly forbidden by policy.
   - Enabling paid networking (VPC Peering, PrivateLink) or paid clusters (M10+) is prohibited without owner authorization.
   - Atlas Free (M0) only supports IP Access Lists.
5. **Persistence Gate Status:** **BLOCKED**. Will remain `BLOCKED` until a verified synthetic record is successfully written to and read back from Atlas.

---

## 5. Multi-Channel Scope Evaluation

| Channel | Requested Capability | ChatMitra Pro Availability | Architectural Evaluation |
| :--- | :--- | :--- | :--- |
| **WhatsApp** | Templates, sessions, webhooks, DLR | Verified YES | **PASS (Sandbox)** — Adapter built, tested & verified |
| **Facebook Messenger** | Social DM inbox & lead capture | Verified NO | **UNSUPPORTED** — Click-to-WA ads only |
| **Instagram DM** | Inbound DM automation | Verified NO | **UNSUPPORTED** — Click-to-WA ads only |
| **Campaign Scheduler** | IST scheduled broadcasts | Verified YES (UI) | **PASS (Sandbox)** — Mock-tested; real broadcasts locked |
| **Click Tracking** | UTM token attribution | Verified YES | **PASS** — Integrated in `save-lead.js` & CRM |
| **AI Voice Calling** | Outbound/inbound trilingual telephony | Verified NO | **DELEGATED to 5-AVAVI** — Handled via Vapi/Bland bridge (8/8 pass) |

---

## 6. Authorized Workspaces & Project Isolation

All work is strictly confined to:
- `c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`
- `c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\3-AVANI AI CRM`
- `c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\4-AVANI LOAN AGENTS`
- `c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\5-AVAVI AI CALLING AGENT`

Zero modifications have been made to `AVANI_AGRO_INTELLIGENCE`, `AVANI AGRO FOODS`, or unrelated workspaces.

