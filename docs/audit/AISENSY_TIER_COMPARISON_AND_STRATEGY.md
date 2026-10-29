# AVANI LOAN SERVICES — AISENSY BASIC VS PRO VS PREMIUM FORENSIC COMPARISON & STRATEGY

**Document ID:** `ALS-DOC-AISENSY-TIER-2026-001`  
**Execution Date:** 25 October 2026  
**Business Entity:** AVANI LOAN SERVICES ([https://www.avanifinserv.com/](https://www.avanifinserv.com/))  
**Managing Director:** Sachin Shinde  
**Official Pricing Grounding:** [AiSensy Official Pricing (2026)](https://aisensy.com/pricing/)  
**Primary Account Dashboard:** [AiSensy Project Dashboard (Project ID: 6a670f94d0c39f57eaa6799f)](https://www.app.aisensy.com/projects/6a670f94d0c39f57eaa6799f/dashboard)  
**Authoritative WABA ID:** `1062614709598311` | **Official Sender:** `+91 72491 08474`  
**Current Active Plan:** `BASIC` (Quarterly active subscription)

---

## 1. Verified Official Pricing & Tier Structure (2026)

All figures below are grounded directly in official AiSensy product documentation, live web retrieval, and verified account configurations:

| Tier | Monthly Base Price | Billing Frequency | Included User Seats | Speed (msg/sec) | Audience Segmentation | Inbound Webhooks | Scheduling & Link Tracking | Native AI Chatbot |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Basic** | **₹1,500/mo** (+18% GST = ₹1,770) | Monthly / Quarterly (₹1,400/mo) / Annual | 1 Owner + 5 Agent Logins | 40 msg/sec (2,400/min) | 10 Tags, 5 Custom Attributes | **0 / 0 (Not Available)** | **Not Available** | Add-on (₹1,350 - ₹2,500/mo) |
| **Pro** | **₹3,200/mo** (+18% GST = ₹3,776) | Monthly / Quarterly / Annual | 1 Owner + 5 Agent Logins | 40 msg/sec (2,400/min) | 100 Tags, 20 Custom Attributes | **Included (Project Webhooks)** | **Included (Native Scheduler + Click Tracker)** | Add-on / Partial |
| **Premium / Enterprise** | **₹9,100/mo+** (Custom) | Annual / Custom SLA | Unlimited / Custom | 250 - 1,000 msg/sec | Unlimited Tags & Attributes | **Included (Custom Webhooks)** | **Included (Enterprise Analytics)** | Custom AI Agent flows |

*Note: In addition to the base subscription fee, Meta levies per-conversation charges (Marketing: ~₹0.86/convo, Utility: ~₹0.11/convo, Service/User-Initiated: ~₹0.34/convo, Authentication: ~₹0.11/convo for India).*

---

## 2. Comprehensive Capability & Alternative Comparison Matrix

| Capability | Basic (Verified) | Pro (Official) | Premium (Official) | Alternative in AVANI Stack | Verified Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WhatsApp Business Messaging** | Supported (WABA live, 40 msg/sec) | Supported (40 msg/sec) | Supported (250-1000 msg/sec) | Native AiSensy Outbound API + Meta Cloud API fallback | `VERIFIED_LIVE` |
| **Approved Template Messages** | Supported (Meta approved templates) | Supported | Supported | Verified approved templates (`Avani_Loan_Welcome`, `doctor_loan_offer`) | `VERIFIED_LIVE` |
| **API-Triggered Messages** | Supported via Campaign API v2 | Supported via Project API | Supported via Enterprise API | `POST https://backend.aisensy.com/campaign/t1/api/v2` in CRM | `VERIFIED_LIVE` |
| **Campaign Scheduling** | **Blocked on Basic** | Native Scheduler | Native Scheduler | **AVANI First-Party Scheduler:** CRM Cron Runner (`/api/cron`) dispatches at scheduled time | `IMPLEMENTED_IN_AVANI_STACK` |
| **Click Tracking** | **Blocked on Basic** | Native Click Tracker | Enterprise Click Tracker | **AVANI First-Party Click Tracker:** Secure short-redirect endpoint (`/r`) logging UTMs and clicks | `IMPLEMENTED_IN_AVANI_STACK` |
| **Campaign Analytics** | Limited (Basic delivery stats) | Campaign Budget Analytics | Deep BI Reporting | **AVANI AI CRM Reporting:** Real-time lead, conversion, source, and ROI dashboards | `IMPLEMENTED_IN_AVANI_STACK` |
| **Inbound Webhooks** | **Blocked (0/0 slots on Basic)** | Included (Project Webhooks) | Included (Enterprise Webhooks) | **Two-Tier Architecture:**<br>1. AiSensy Live Chat Inbox for human advisors<br>2. Direct Meta Webhook (`/api/meta-webhook`) for Meta Lead Ads | `PARTIAL_WITH_LIMITATIONS` |
| **WhatsApp Reply Synchronization** | Manual via Live Chat | Automated via Webhook | Automated via Webhook | AiSensy Live Chat web console monitored by Sachin Shinde & loan advisory team | `PARTIAL_WITH_LIMITATIONS` |
| **Delivery & Failure Events** | Supported via polling / API receipts | Supported via Webhook | Supported via Webhook | Outbound API response UUID tracking + DLQ retry mechanism | `SUPPORTED_EXTERNAL_INTEGRATION` |
| **AI WhatsApp Agent** | **Blocked (Requires ₹1,350/mo add-on)**| Add-on / Partial | Custom AI flows | **AVANI LOAN AGENTS:** Standalone trilingual AI service (Workspace 3) on Next.js + Google AI SDK | `IMPLEMENTED_IN_AVANI_STACK` |
| **Rule-Based Chatbot Flows** | **Blocked (Requires ₹2,500/mo add-on)**| Partial | Full Custom Builder | **AVANI LOAN AGENTS:** Deterministic eligibility and document checklist engine in code | `IMPLEMENTED_IN_AVANI_STACK` |
| **Meta Inbox Automation** | Not included | Not included | Custom CRM sync | Direct Meta Webhook (`/api/meta-webhook`) handles Facebook & Instagram Lead Ads | `SUPPORTED_EXTERNAL_INTEGRATION` |
| **CRM Lead Deduplication** | Plan-agnostic | Plan-agnostic | Plan-agnostic | **AVANI AI CRM:** Authoritative MongoDB index on phone number + correlation ID | `IMPLEMENTED_IN_AVANI_STACK` |
| **Consent & Opt-Out Controls** | Plan-agnostic | Plan-agnostic | Plan-agnostic | **Shared Integration Layer:** DPDP Act consent gate + `isOptedOut` suppression flag | `IMPLEMENTED_IN_AVANI_STACK` |
| **AI Telephone Calling** | **Not Included** | **Not Included** | **Not Included** | **AVANI AI Calling Agent (Workspace 4):** Vapi/Pipecat trilingual AI voice calling integration | `IMPLEMENTED_IN_AVANI_STACK` |
| **Usage Reporting** | Basic billing dashboard | Advanced cost dashboard | Enterprise analytics | **AVANI AI CRM:** Internal ledger tracking outbound messages, call duration, and API attempts | `IMPLEMENTED_IN_AVANI_STACK` |

---

## 3. Required Architectural Decision

The active production deployment **must start and operate on the existing AiSensy Basic subscription** (Quarterly plan) with zero unapproved subscription upgrades:

1. **Leverage Verified Basic Strengths:**
   - Use the verified high-throughput (40 msg/sec) Outbound Campaign API for immediate instant acknowledgements, loan inquiry notices, and document checklists.
   - Use the AiSensy Shared Live Chat Inbox for real-time customer replies with 5 human agent seats.
2. **Replicate Pro/Premium Features in AVANI Stack:**
   - **Scheduling:** Replicated via CRM cron/scheduled broadcast runner.
   - **Click Tracking:** Replicated via first-party redirect routes (`/r?c=...`) with UTM capture and duplicate click suppression.
   - **AI Chatbot & Qualification:** Replicated via AVANI LOAN AGENTS (`4-AVANI LOAN AGENTS`).
   - **AI Telecalling:** Handled by AVANI AI CALLING AGENT (`5-AVAVI AI CALLING AGENT`).
3. **Preserve Zero-Refactor Upgrade Path:**
   - Maintain the feature flag `AISENSY_INBOUND_WEBHOOK_ENABLED = false` in `.env`.
   - When the business decides to upgrade to AiSensy Pro or purchase the webhook add-on, toggling `AISENSY_INBOUND_WEBHOOK_ENABLED = true` instantly activates the pre-built, tested `whatsapp-webhook-worker` and `AgentEngine` with zero refactoring.
