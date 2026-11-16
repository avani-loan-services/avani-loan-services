# AI Calling Integration Report (`5-AVAVI AI CALLING AGENT` — Project 4)

**Execution ID:** `TASK-11720`  
**Repository / Folder:** `5-AVAVI AI CALLING AGENT` (`https://github.com/avaniagrofoods/avani-calling-agent.git`, branch `main`)  
**Verified Commit SHA:** `a898738dd3c32d05b4e13f72d473c29916defd0d`  
**Date:** 16 November 2026  

---

## 1. Integration Scope & Runtime Bridge

Project 1 (`src/services/ecosystemIntegrationRegistry.cjs`) dynamically loads `5-AVAVI AI CALLING AGENT/calling-agent-bridge.js` via `loadCallingBridge()` (falling back safely if detached) and registers it as `avavi_calling_agent` (webhook `/api/vapi-callback`, env keys `VAPI_API_KEY`, `VAPI_ASSISTANT_ID`).

### 1.1 Transparent Voice Disclosures & Trilingual Product Scripts
- `VOICE_DISCLOSURES`: English (`en`), Marathi (`mr`), and Hindi (`hi`) automated AI voice identity disclosures identifying the call as an automated AI assistant from Avani Loan Services on behalf of founder **Sachin Shinde**.
- `TRILINGUAL_PRODUCT_SCRIPTS`: 24 scripts covering all 8 official product keys (`PERSONAL_LOAN`, `BUSINESS_LOAN`, `DOCTOR_LOAN`, `HOME_LOAN`, `MORTGAGE_LOAN`, `EDUCATION_LOAN_INDIA`, `EDUCATION_LOAN_GLOBAL`, `SCHOOL_COLLEGE_FUNDING`) x 3 languages (`en`, `mr`, `hi`).

### 1.2 Mandatory PII Redaction (`scrubPII`)
Redacts before transcript summaries are synced to Project 1 or Project 2:
- **Aadhaar (12 digits):** Replaced with `XXXXXXXX1234`
- **PAN (`[A-Z]{5}[0-9]{4}[A-Z]`):** Replaced with `XXXXX1234X`
- **Bank Account Numbers (9–18 digits):** Replaced with `XXXXXXXX1234`
- **OTPs & Passwords:** Replaced with `$1: [REDACTED]`

### 1.3 Disposition Mapping & Opt-Out Loopback (`mapCallDisposition`)
Standardizes raw voice outcomes into: `OPTED_OUT`, `NOT_INTERESTED`, `CALLBACK_REQUESTED`, `QUALIFIED_INTERESTED`, `UNANSWERED`, `INVALID_NUMBER`, `COMPLETED`. When `OPTED_OUT` is returned on `syncCrossProjectEvent()`, Project 1 updates `customerIdentityIndex` to `consentStatus = 'Opted_Out'`, blocking future calls/outreach (`WF-03` / `WF-05` / `WF-07`).

### 1.4 Human Escalation Routing
Configured in `HUMAN_ESCALATION`:
- **Officer:** `Sachin Shinde` (`Managing Director & Senior Loan Advisor`)
- **Phone:** `+91 72491 08474`
- **Email:** `enquiry@avanifinserv.com`

## 2. Verification Results

- **Bridge Contract & Safety Suite (`node test_calling_bridge.js`):** `8/8 PASS` (`P4_TEST_EXIT: 0`), run with `CallingAgentBridge({ mode: 'test_mode' })` (no real subscribers dialed).
- **Cross-Project E2E Suite (`test_four_project_ecosystem_e2e.test.cjs`):** Verified `HTTP 403` block when `consent_status === 'Pending_Request'` and verified `scrubSensitiveText()` + `mapCallingDisposition('interested_customer') -> QUALIFIED_INTERESTED` on `call.completed`.
