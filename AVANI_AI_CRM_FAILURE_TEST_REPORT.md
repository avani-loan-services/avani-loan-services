# AVANI AI CRM — FAILURE & NEGATIVE SEMANTICS TEST REPORT

**Document ID**: `AVANI_AI_CRM_FAILURE_TEST_REPORT.md`  
**Execution Timestamp**: 2026-08-11  
**Audit Rule**: All failure and negative test scenarios must result in SAFE FAILURE with explicit error tracking. Never convert failures into false success.

---

## 1. Negative Test Suite Results

| Test ID | Negative Test Scenario | Expected System Behavior | Actual System Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NEG-01** | Duplicate CSV Re-import | Resolve to existing Lead ID | Initial Lead `AVL-20260811-000001` updated; duplicate count = 1 | **PASS** |
| **NEG-02** | Webhook Payload Replay | Return HTTP 200, 0 secondary actions | Inbound 1 inserted, Inbound 2 suppressed (`duplicateSuppressed=true`) | **PASS** |
| **NEG-03** | Invalid Worker Secret | Return HTTP 401 Unauthorized | Missing/incorrect `x-worker-auth` header returns HTTP 401 | **PASS** |
| **NEG-04** | Unsupported Customer Message | Safe extraction fallback | AI processes message without crashing; returns clarification prompt | **PASS** |
| **NEG-05** | Missing Provider Credentials | Fail Closed in Production | Production mode returns `FAILED` status; does not report fake success | **PASS** |
| **NEG-06** | Malformed AI JSON Output | Schema Validation Failure | Falls back safely to deterministic regex/heuristic parser | **PASS** |
| **NEG-07** | Duplicate OmniDM Callback | Single Post-Call Message | Duplicate callback suppressed; 1 post-call WhatsApp dispatched | **PASS** |
| **NEG-08** | Duplicate HubSpot Sync | Single HubSpot Record | Request 1 creates object, Request 2 suppressed (`isDuplicateSuppressed=true`) | **PASS** |
| **NEG-09** | Duplicate Google Sheets Sync | Update Existing Row | Request 1 inserts Row 2, Request 2 updates Row 2 (0 new rows) | **PASS** |
| **NEG-10** | Duplicate Zapier Event | Suppress Duplicate Event | Request 1 dispatches, Request 2 suppressed via Application Event Ledger | **PASS** |
| **NEG-11** | Stale Worker Lease | Auto-recover expired lease | Expired 5-minute lease reclaimed by active worker | **PASS** |
| **NEG-12** | Database Offline Fallback | Graceful Isolated Storage | Logs database warning and switches safely to isolated unit storage | **PASS** |

---

## 2. Summary of Fail-Closed Guards Verified

- **Worker Authentication**: `x-worker-auth` validation enforced on all internal routes.
- **Deduplication Engine**: Webhook Inbox unique index on `eventId` prevents duplicate executions.
- **Production Guard**: Production mode terminates if test/staging database is connected.
