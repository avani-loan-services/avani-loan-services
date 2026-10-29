# AVANI LOAN SERVICES — CROSS-WORKSPACE INTEGRATION CONTRACTS
**Version:** 1.0.0  
**Effective Date:** 25 October 2026  
**Authoritative Core Systems:**
1. **Workspace 1:** `1-AVANI LOAN SERVICE FY 26-27` — Website & Primary Automation Layer
2. **Workspace 2:** `3-AVANI AI CRM` — Authoritative Master Lead Store & Dispatcher
3. **Workspace 3:** `4-AVANI LOAN AGENTS` — Product-Aware Lead Qualification & Handoff
4. **Workspace 4:** `5-AVAVI AI CALLING AGENT` — Voice Telecalling, Intent & Outcome Sync

---

## 1. Authoritative Master Lead Store Definition

**AVANI AI CRM (Workspace 2)** is the sole authoritative system of record for all lead entities, consent states, opt-out registries, campaign attributions, and interaction histories.
- No other workspace shall maintain an independent conflicting customer database.
- Workspaces 1, 3, and 4 communicate with AVANI AI CRM through the standardized contracts defined herein.

---

## 2. Standardized Event Envelope Schema

All cross-system events and messages transmitted across the four workspaces MUST adhere to the following canonical envelope:

```typescript
export interface AvaniEventEnvelope<T = Record<string, any>> {
  eventId: string;           // UUIDv4 format (e.g., "550e8400-e29b-41d4-a716-446655440000")
  eventType: 
    | 'WEBSITE_LEAD_SUBMISSION'
    | 'LOAN_AGENT_QUALIFIED'
    | 'CALL_OUTCOME_RECORDED'
    | 'WHATSAPP_STATUS_UPDATE'
    | 'CLICK_TRACKED'
    | 'CONSENT_UPDATE'
    | 'OPT_OUT_REQUEST';
  schemaVersion: '1.0.0';    // Strict semantic versioning
  sourceSystem: 
    | 'AVANI_WEBSITE'
    | 'AVANI_AI_CRM'
    | 'AVANI_LOAN_AGENTS'
    | 'AVANI_CALLING_AGENT'
    | 'META_LEAD_ADS'
    | 'AISENSY_OUTBOUND';
  timestamp: string;         // ISO-8601 UTC string (e.g., "2026-10-25T10:00:00.000Z")
  leadId: string;            // Canonical lead ID: "AVL-YYYYMMDD-XXXXXX"
  correlationId: string;     // Trace identifier: "CORR-XXXXXXXX-XXXX"
  idempotencyKey: string;    // Unique deduplication token
  payload: T;                // Data payload conforming to specific event contract
  processingStatus?: 'PENDING' | 'PROCESSED' | 'DUPLICATE_ABSORBED' | 'FAILED';
}
```

---

## 3. Standardized Product Categories & Advisor Routing

All workspaces MUST align on the following 8 official financial product categories and their assigned routing:

| Product Key | Display Name | Assigned Advisor / Team | Default AiSensy Template |
| :--- | :--- | :--- | :--- |
| `PERSONAL_LOAN` | Personal Loan | Sachin Shinde (Loan Advisory Team) | `personal_loan_welcome` |
| `BUSINESS_LOAN` | [[Business Loan](/services/business-loan)](/services/business-loan) | Sachin Shinde (Commercial Team) | `business_loan_welcome` |
| `DOCTOR_LOAN` | Doctor Loan | Sachin Shinde (Professional Lending Desk) | `doctor_loan_offer` |
| `HOME_LOAN` | [[Home Loan](/services/home-loan)](/services/home-loan) | Sachin Shinde (Mortgage & Housing Team) | `home_loan_welcome` |
| `MORTGAGE_LOAN` | Mortgage Loan (LAP) | Sachin Shinde (Mortgage & Housing Team) | `mortgage_loan_welcome` |
| `EDUCATION_LOAN_INDIA` | [Education Loan](/services/education-loan) (India) | Sachin Shinde (Education Finance Desk) | `education_loan_india_welcome` |
| `EDUCATION_LOAN_GLOBAL`| Education Loan (Global) | Sachin Shinde (Global Studies Desk) | `education_loan_global_welcome` |
| `SCHOOL_COLLEGE_FUNDING`| School & College Owners Funding | Sachin Shinde (Institutional Funding Desk) | `school_funding_welcome` |

---

## 4. Cross-Workspace API Contracts

### Contract A: Website ➔ CRM Lead Intake
- **Endpoint:** `POST https://avani-ai-crm.vercel.app/api/leads`
- **Authentication:** Header `x-api-key: ${CRM_API_KEY}` or Bearer token
- **Headers:** `Content-Type: application/json`, `X-Idempotency-Key: <unique-key>`, `X-Correlation-Id: <corr-id>`
- **Request Payload:**
```json
{
  "name": "Rajesh Sharma",
  "phone": "+919876543210",
  "email": "rajesh@example.com",
  "city": "Latur",
  "state": "Maharashtra",
  "loanType": "PERSONAL_LOAN",
  "requestedAmount": 500000,
  "monthlyIncome": 45000,
  "employmentType": "Salaried",
  "preferredLanguage": "Marathi",
  "leadSource": "WEBSITE",
  "utmSource": "google_ads",
  "utmMedium": "cpc",
  "utmCampaign": "diwali_personal_loan_2026",
  "consentStatus": "GRANTED",
  "consentPurpose": "LOAN_ELIGIBILITY_PROCESSING",
  "consentTimestamp": "2026-10-25T10:00:00.000Z",
  "idempotencyKey": "IDEMP-WEB-17866990001"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "leadId": "AVL-20261025-000101",
  "status": "NEW",
  "assignedAdvisor": "Sachin Shinde",
  "acknowledged": true,
  "idempotencyHit": false
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing mandatory fields (`name`, `phone`, `loanType`) or invalid 10-digit Indian mobile.
  - `403 Forbidden`: `consentStatus !== "GRANTED"`.
  - `401 Unauthorized`: Invalid or missing `x-api-key`.
  - `409 Conflict`: Duplicate request absorbed safely.

---

### Contract B: Loan Agents ➔ CRM Qualification Handoff
- **Endpoint:** `POST https://avani-ai-crm.vercel.app/api/leads` (or `/api/incoming-lead`)
- **Trigger:** When AVANI LOAN AGENTS assistant (`Workspace 3`) finishes step-by-step chat qualification.
- **Payload:**
```json
{
  "phone": "+919876543210",
  "name": "Dr. Ananya Kulkarni",
  "loanType": "DOCTOR_LOAN",
  "requestedAmount": 2500000,
  "monthlyIncome": 120000,
  "employmentType": "Doctor / Medical Professional",
  "profession": "BDS Clinic Owner",
  "city": "Pune",
  "status": "DOCUMENTS_PENDING",
  "aiAgentStatus": "DOCUMENT_GUIDANCE",
  "leadSource": "AVANI_LOAN_AGENTS_CHAT",
  "eligibilityStatus": "Qualified",
  "eligibilityReason": "Annual income exceeds ₹14L threshold; doctor checklist provided",
  "preferredLanguage": "Marathi"
}
```

---

### Contract C: AI Calling Agent ➔ CRM Outcome Synchronization
- **Endpoint:** `POST https://avani-ai-crm.vercel.app/api/vapi-webhook`
- **Trigger:** Upon voice call termination by Voice-AI provider (Vapi / Bland / Pipecat).
- **Standardized Call Payload:**
```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "CALL_VAPI_987654",
      "status": "ended",
      "customer": { "number": "+919876543210", "name": "Suresh Patil" },
      "durationSeconds": 142,
      "disposition": "QUALIFIED_INTERESTED",
      "summary": "Customer confirmed interest in Business Loan for shop expansion. Requested WhatsApp document checklist.",
      "recordingUrl": "https://provider.storage/call-987654.mp3"
    },
    "analysis": {
      "structuredData": {
        "loanType": "BUSINESS_LOAN",
        "requestedAmount": 1000000,
        "isInterested": true,
        "callbackRequested": false,
        "optOutRequested": false,
        "languageSpoken": "mr-IN"
      }
    }
  }
}
```

---

### Contract D: First-Party Click Tracking & Attribution
- **Endpoint:** `GET https://www.avanifinserv.com/r`
- **Query Parameters:**
  - `c`: Campaign ID (e.g. `c=BL_FESTIVE_2026`)
  - `utm_source`: `whatsapp` | `meta` | `sms`
  - `utm_medium`: `broadcast` | `ad` | `agent`
  - `utm_campaign`: Campaign slug
  - `dest`: Base64-encoded or URI-encoded target application URL
- **Behavior:**
  1. Validates `dest` domain (must be `avanifinserv.com` or authorized AVANI subdomain).
  2. Logs click event (timestamp, campaign, IP hash, user agent hash) to CRM or gateway event queue.
  3. Returns HTTP 302 Redirect to destination URL with retained UTM parameters.

---

## 5. Security, PII Masking & Financial Safeguards

1. **Least Privilege & Data Minimization:** Never store or log unmasked PAN, Aadhaar, bank credentials, OTPs, or credit scores in plain text.
2. **Deterministic Masking:**
   - PAN: `XXXXX1234X`
   - Aadhaar: `XXXXXXXX1234`
   - Account Number: `XXXXXXXX1234`
   - Phone: `9198****10`
3. **No Autonomous Financial Commitments:**
   - AI Agents (Chat and Voice) MUST clearly disclose: *"Indicative eligibility is subject to credit bureau verification, formal lender underwriting, and document assessment."*
   - Agents shall NEVER guarantee sanction, promise CIBIL repair, or emit fake sanction letters.
