# Automation Workflow Acceptance Report (`WF-01` .. `WF-08`)

**Execution ID:** `TASK-11720`  
**Registry Implementation:** `src/services/ecosystemIntegrationRegistry.cjs` (`WORKFLOW_DEFS`)  
**Control API:** `POST /api/portal/integrations/workflows/:workflowId/toggle`  
**Date:** 16 November 2026  

---

## 1. Workflow Definitions & Guardrail Verification

| Workflow ID | Version | Name | Trigger Event | Guardrail / Preconditions | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `WF-01` | `1.0.0` | Website Lead Capture | `enquiry.received` | `valid_phone_or_email`, `not_duplicate_lease` | Project 1 + Project 2 | Verified (E2E) |
| `WF-02` | `1.0.0` | AI Lead Qualification | `lead.qualification.requested` | `no_autonomous_sanction_or_rate_guarantee` (`403` on violation) | Project 3 | Verified (E2E) |
| `WF-03` | `1.0.0` | AI Calling Integration | `call.initiation.requested` | `consent_status === 'Approved'`, not opted out/suppressed, valid calling window | Project 4 | Verified (E2E) |
| `WF-04` | `1.0.0` | Builder Partnerships | `builder.outreach.requested` | `official_channel_verified` | Module A (Builders) | Registered |
| `WF-05` | `1.0.0` | Education Institutional Funding | `education.outreach.requested` | `consent_status === 'Approved'`, not opted out | Module B (Education) | Registered (`executeConsentGatedWorkflow` normalized `WF-C-EDUCATION` -> `WF-05`) |
| `WF-06` | `1.0.0` | Loan Application Coordination | `application.submitted` | `foir_calculated`, `checklist_verified` | Underwriting Desk | Registered |
| `WF-07` | `1.0.0` | Communication Synchronisation | `communication.dispatch` | `consent_status === 'Approved'`, not opted out, `stop_switch_inactive` | Communication Hub | Registered (`executeConsentGatedWorkflow` normalized `WF-E-COMMUNICATION` -> `WF-07`) |
| `WF-08` | `1.0.0` | Integration Error Recovery | `integration.failed` | `retries < max_retries`, DLQ + replay | Integration Gateway | Verified Pause/Resume & DLQ Replay (E2E) |

## 2. Operator Controls & Consent Gate Proof

- **Pause/Resume Controls:** `WF-08` pause (`enabled: false`) and resume (`enabled: true`) verified via `POST /api/portal/integrations/workflows/WF-08/toggle` returning `HTTP 200` with audit entries recorded to `gateway.auditLedger` (`PAUSE_WORKFLOW`, `ENABLE_WORKFLOW`).
- **Paused Workflow Fail-Closed:** `executeConsentGatedWorkflow()` returns `HTTP 409` (`WORKFLOW_PAUSED`) if `!rt.enabled`.
- **Consent Gate Fail-Closed:** `WF-03`, `WF-05`, and `WF-07` return `HTTP 403` (`BLOCKED_CONSENT_GATE`) if `consent_status !== 'Approved'` or `suppressed === true` or `opt_out === true`.
