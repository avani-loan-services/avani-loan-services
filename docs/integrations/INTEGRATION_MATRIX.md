# AVANI LOAN SERVICES — CONSOLIDATED INTEGRATION MATRIX

**Document ID:** `ALS-DOC-INTEGRATION-2026-003`  
**Execution Date:** 25 October 2026  
**Owner & Managing Director:** Sachin Shinde (`+91 72491 08474` / `+91 91756 35165`)  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Primary Execution Workspace:** `1-AVANI LOAN SERVICE FY 26-27`  
**Classification Rules:** `PASS — VERIFIED IN PRODUCTION`, `PASS — LOCAL TESTS ONLY`, `PASS — INTERNAL IMPLEMENTATION ONLY`, `CONDITIONAL — EXTERNAL DEPENDENCY`, `BLOCKED — OWNER ACTION REQUIRED`, `NOT TESTED`.

---

## 1. Master Inter-Workspace & External Integration Matrix

| Interface / Integration | Source | Target | Data Exchanged | Classification | Evidence & Test Suite | Fallback Mode |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Contract A: Web-to-CRM Intake** | Workspace 1 (`api/save-lead.js`) | Workspace 2 (`/api/leads`) | Canonical Lead (`leadId`, phone, loanType, DPDP consent, UTM) | **`PASS — LOCAL TESTS ONLY`** | 5/5 passed in `test_website_crm_intake.test.cjs`; 6/6 passed in `test_crm_lead_intake_contract.js` | Local logging & in-memory cache |
| **Contract B: Click Tracker & Attribution** | External Ad / WhatsApp | Workspace 1 (`/r`) | Campaign ID, UTM params, Destination URL | **`PASS — LOCAL TESTS ONLY`** | Tested in `test_website_crm_intake.test.cjs` with open-redirect defenses | Fallback to direct URL |
| **Contract C: Loan Agents-to-CRM** | Workspace 3 (`crmSync.ts`) | Workspace 2 (`/api/leads`) | Qualified Lead, 8 products, language, checklist status | **`PASS — LOCAL TESTS ONLY`** | 4/4 passed in `test_agent_advisor_contract.js` | Local database logging |
| **Contract D: Voice Calling-to-CRM** | Workspace 4 (`calling-agent-bridge.js`)| Workspace 2 (`/api/leads`) | Scrubbed Call Disposition (`mapCallDisposition`), redacted summary | **`PASS — LOCAL TESTS ONLY`** | 8/8 passed in `test_calling_bridge.js` | Human advisor phone contact (+91 72491 08474) |
| **AiSensy WABA Outbound** | Workspace 1 / CRM | AiSensy API v2 | Outbound templates, applicant name, loan type | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | WABA ID `1062614709598311` verified active | Meta Cloud API or direct SMS |
| **AiSensy Inbound Webhooks** | AiSensy | Integration Gateway | Inbound customer replies | **`BLOCKED — OWNER ACTION REQUIRED`** | Verified Basic plan has `0/0 inbound webhook slots` | **ACTIVE:** Human loan advisors monitor AiSensy Shared Live Chat Inbox (5 agent seats) |
| **Meta WhatsApp Cloud API** | Workspace 1 | Meta Graph API v18.0 | Approved WhatsApp Business Templates | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Graph endpoint structured in gateway | AiSensy Outbound Campaign API v2 |
| **First-Party Calculators** | Browser | React / SPA Engine | Loan principal, tenure, ROI, reducing balance EMI | **`PASS — LOCAL TESTS ONLY`** | 206/206 specs passed in `runAllLendingTests.cjs`; zero LLM math | Pure deterministic code |
| **Production Website Hosting** | Vercel | End Users | Static assets, SSR service routes, calculator tools | **`PASS — VERIFIED IN PRODUCTION`** | 8/8 routes HTTP 200 OK on `https://www.avanifinserv.com/` | Immutable Vercel edge deployment |
| **Voice AI Provider (Vapi / Bland)**| Workspace 4 | Voice SIP / WebRTC | Trilingual prompts, voice streams, transcribed text | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Simulated test mode verified in `test_calling_bridge.js` | Direct phone call from Sachin Shinde (+91 72491 08474) |
| **HubSpot CRM (Secondary)** | Workspace 1 / 3 | HubSpot API v3 | Secondary contact backup & pipeline sync | **`CONDITIONAL — EXTERNAL DEPENDENCY`** | Portal ID 244236573 verified; Signature V3 tested | Primary authoritative store is AVANI AI CRM |

---

## 2. AiSensy Basic Tier Operational Protocol

Because AiSensy Basic does not include inbound webhook forwarding:
1. Outbound notifications (loan acknowledgement, document checklists, appointment reminders) are dispatched via AiSensy Campaign API v2 or direct Meta Cloud API.
2. Inbound customer messages appear in the **AiSensy Live Chat Inbox**.
3. Up to 5 human loan advisors log in to `https://app.aisensy.com/` to converse with applicants.
4. When an advisor qualifies an applicant, they log the lead directly in AVANI AI CRM or initiate an AI Calling test workflow.
