# AUTOMATION WORKFLOW CATALOG (2026-11-16)

| Workflow ID | Name | Trigger | Guardrails |
|---|---|---|---|
| `WF-A-ENQUIRY` | New Customer Enquiry Intake | `enquiry.received` | Valid phone/email + idempotency lease |
| `WF-B-BUILDER` | Builder Partnership Qualification | `builder.created` | Official channel present |
| `WF-C-EDUCATION` | Education Institutional Funding & Consent Gate | `education.outreach.requested` | `consent_status === Approved` & not opted out (`403` otherwise) |
| `WF-D-APPLICATION` | Loan Application & Lender Coordination | `application.submitted` | FOIR + checklist verified |
| `WF-E-COMMUNICATION` | Approved Customer Communication | `communication.dispatch` | Consent verified + STOP switch inactive (`403` otherwise) |
| `WF-F-DLQ-RECOVERY` | Integration Failure & DLQ Recovery | `integration.failed` | Max 3 retries + admin audit log |
