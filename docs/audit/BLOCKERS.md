# AVANI LOAN SERVICES — SYSTEM BLOCKERS & EXTERNAL DEPENDENCIES

**Document ID:** `ALS-DOC-BLOCKERS-2026-002`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. External & Commercial Blockers (Requiring Owner Action)

| Blocker ID | Domain | Dependency Description | Impact | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **BLK-001** | WhatsApp / Inbound | **AiSensy BASIC Tier Inbound Forwarding:** 0/0 webhooks; webhook creation restricted by plan tier. | Automated AI-driven WhatsApp reply parsing is not available on Basic Tier. | **Fallback Active:** Customer replies handled by human loan advisors through AiSensy Live Chat. Plan upgrade optional. |
| **BLK-002** | Telephony | **Exotel / Knowlarity Commercial SIP Trunk:** Commercial TRAI DLT registration and KYC verification. | Automated outbound phone calls cannot ring physical subscriber phones in India. | Submit Business PAN, GST, and Address Proof to Exotel/Knowlarity. |
| **BLK-003** | CRM | **HubSpot OAuth / Private App Re-authorization:** Live HubSpot Access Token expired or requires private app scope. | Live contact synchronization runs in verified mock mode. | Re-authorize HubSpot App or provide `HUBSPOT_ACCESS_TOKEN` in production `.env`. |
| **BLK-004** | Credit Bureau | **Direct Credit Bureau API (CIBIL / Experian):** Commercial bureau agreement and IP whitelisting. | Real-time CIBIL fetch cannot pull live consumer scores autonomously. | Maintain manual report upload or authorized third-party aggregator API integration. |

---

## 1.1 Scheduled Future Tasks

| Task ID | Scheduled Date | Provider | Task Scope | Status | Preconditions & Execution Protocol |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-2026-10-13-AISENSY** | **13 October 2026** | **AiSensy** | **Inbound Webhook Configuration & Verification:** Owner will supply live AiSensy webhook configuration details and plan capability verification. | **PENDING_OWNER_INPUT** | 1. Inspect supplied configuration and confirm project domain isolation (`avanifinserv.com`).<br>2. Confirm subscription tier supports inbound webhooks.<br>3. Inspect existing integration gateway and webhook handlers before modifying.<br>4. Validate request signatures or provider documented verification mechanism.<br>5. Add idempotency, replay protection, payload validation, rate limiting, safe logging, and retry/dead-letter handling.<br>6. Add unit, security, and regression tests using synthetic payloads.<br>7. Configure authorized hosted endpoint and secrets through secure provider interface.<br>8. Test using provider supported test mechanism or authorized test event.<br>9. Verify received-event evidence, deduplication, failure behavior, and downstream routing.<br>10. Update integration matrix, runbook, API credential inventory, and implementation status.<br>11. Deploy and perform post-deployment verification only after all checks pass.<br>12. Maintain Live Chat human advisor fallback until verified live. |

---

## 2. Non-Blockers (Independent & Verified Autonomous)

The following items are **fully autonomous, executable, and verified**:
- Pure mathematical calculation engine for FOIR, DTI, reducing balance EMI, and loan capacity.
- Versioned multi-lender policy matching engine (SBI, HDFC, ICICI, Bajaj, Tata).
- Document and statement parsing, bounce detection, and PII masking.
- DPDP Act consent gate and TRAI DND opt-in verification.
- Human review checkpoint enforcement (`systemSanctionAuthorized: false`).
- HubSpot Webhook Signature Version 3 verification and 5-minute replay window defense.
- Vite production build (2,146 modules, 27.26s).
- Live website availability across all critical routes (200 OK, SSL active).
- Master test suites execution (9 suites passed, 206 financial tool specifications passed, 0 failures).
