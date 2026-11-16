# Cross-Project Event Catalog

**Execution ID:** `TASK-11720`  
**Ingress Endpoint:** `POST /api/portal/integrations/cross-project/event`  
**Dispatcher:** `syncCrossProjectEvent(eventType, payload, correlationId)` in `src/services/ecosystemIntegrationRegistry.cjs`  
**Date:** 16 November 2026  

---

## 1. Registered Cross-Project Events & Workflows

| Event Type | Workflow ID | Owner / Source | Enforcement Gates | Resulting State / Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| `enquiry.received` | `WF-01` | Project 1 -> Project 2 | Idempotency lease (`acquireIdempotencyLease`) | Generates `CUS-AVL-*`, maps `externalIds`, records `SYNCHRONIZED` in `auditLedger` |
| `lead.qualification.requested` | `WF-02` | Project 3 (`4-AVANI LOAN AGENTS`) | Regulatory guardrail: `403` on `autonomousApproval: true` or `guaranteedRate: true` | Classifies 1 of 8 official categories, escalates to human advisor |
| `call.initiation.requested` | `WF-03` | Project 4 (`5-AVAVI AI CALLING AGENT`) | Consent gate: `403` unless `consent_status === 'Approved'` and not suppressed/opted-out | Triggers `CallingAgentBridge` in `mock` or authorized live mode |
| `call.completed` | `WF-03` | Project 4 -> Project 1 & 2 | `scrubSensitiveText()` + `mapCallingDisposition()` | Masks PAN/Aadhaar/Bank/OTP/Pwd; maps `OPTED_OUT` -> sets `consentStatus = 'Opted_Out'` |
| `builder.outreach.requested` | `WF-04` | Module A (Builders) | `official_channel_verified` | Updates 100-pt builder partnership pipeline |
| `education.outreach.requested` | `WF-05` | Module B (Education) | Consent gate (`consent_status === 'Approved'`, not opted out/suppressed) | Dispatches approved template and logs consent audit |
| `application.submitted` | `WF-06` | Underwriting Desk | `foir_calculated`, `checklist_verified` | Coordinates human lender review |
| `communication.dispatch` | `WF-07` | Communication Hub | Consent gate (`consent_status === 'Approved'`, `stop_switch_inactive`) | Dispatches via WhatsApp/Twilio/SMTP adapter or mock gateway |
| `integration.failed` | `WF-08` | Integration Gateway | `retries < max_retries` | Enqueues payload in `deadLetterQueue` for `POST .../dlq/:dlqId/replay` |

## 2. Standard Event Envelope & Audit Fields

Every committed event appended to `crossProjectEvents` includes:
- `eventId` (`EVT-<timestamp>-<rand>`)
- `eventType`, `correlationId`, `sourceProject`, `targetProject`
- `centralCustomerId` (`CUS-AVL-*`)
- `scrubbedSummary` (PII-redacted)
- `disposition` (standardized via `mapCallingDisposition`)
- `timestamp` (UTC ISO-8601)
