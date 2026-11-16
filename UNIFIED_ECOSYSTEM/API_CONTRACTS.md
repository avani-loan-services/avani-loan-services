# API CONTRACTS REFERENCE (ALIAS — SEE CROSS_PROJECT_API_CONTRACTS.md)

All 4 projects communicate via `/api/portal/integrations/cross-project/event` and provider webhooks under strict RBAC, idempotency leases, consent verification (`Pending_Request` / `Opted_Out` -> HTTP `403`), and regulatory guardrails (autonomous approval/rate guarantee attempts -> HTTP `403`).
