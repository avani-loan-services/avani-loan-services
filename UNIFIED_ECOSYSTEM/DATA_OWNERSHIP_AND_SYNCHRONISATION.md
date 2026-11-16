# Data Ownership and Synchronisation Specification

**Execution ID:** `TASK-11720`  
**Date:** 16 November 2026  

---

## 1. Synchronisation Topology (Hub-and-Spoke)

Project 1 (`1-AVANI LOAN SERVICE FY 26-27`) serves as the central orchestration bus (`src/services/ecosystemIntegrationRegistry.cjs` + `apps/integration-gateway/index.cjs`), connecting:
- **Project 1 (`avani_core_api`, `website_intake`, `portal_database`)** — Canonical system of record for portal users, builder partnerships, educational institutions, central customer IDs (`CUS-AVL-*`), workflow state, and audit ledgers.
- **Project 2 (`3-AVANI AI CRM` / `avani_ai_crm`)** — Lead lifecycle, WhatsApp/inbox conversations, attribution (`utm_*`), and follow-up pipeline.
- **Project 3 (`4-AVANI LOAN AGENTS` / `avani_loan_agents`)** — Trilingual (EN/HI/MR) AI loan qualification, FOIR checks, and document checklists across 8 official categories (`crmSync.ts` -> CRM).
- **Project 4 (`5-AVAVI AI CALLING AGENT` / `avavi_calling_agent`)** — Consent-gated outbound AI voice bridge, transcript PII redaction, and standardized call disposition mapping back to CRM/Portal.

## 2. Synchronisation Mechanics & Conflict Prevention

1. **Idempotency Lease Guard:** `syncCrossProjectEvent(eventType, payload, correlationId)` acquires a gateway lease via `gateway.acquireIdempotencyLease(idempKey)` where `idempKey = payload.idempotencyKey || "${eventType}:${phone}:${email}:${externalId}"`. Duplicate dispatches return `status: 200, duplicateSuppressed: true` without mutating state.
2. **Consent Propagation:** Outbound workflows (`WF-03`, `WF-05`, `WF-07`) and events (`call.initiation.requested`, `education.outreach.requested`, `communication.dispatch`) fail closed with `HTTP 403` unless `consent_status === 'Approved'` and `suppressed !== true` and `opt_out !== true`.
3. **Disposition-to-Consent Loopback:** A `call.completed` (or any event with `rawDisposition`) producing `OPTED_OUT` automatically updates `customerIdentityIndex.consentStatus = 'Opted_Out'`, blocking downstream outreach across all channels.
4. **Failure Recovery (`WF-08` & DLQ):** Transient synchronization failures enqueue payloads into `gateway.deadLetterQueue` and can be deterministically replayed via `POST /api/portal/integrations/dlq/:dlqId/replay`.
