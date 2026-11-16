# INTEGRATION FAILURE AND RECOVERY RUNBOOK (2026-11-16)

1. **Automatic DLQ Capture:** Failed dispatches are enqueued via `IntegrationGateway.sendToDLQ(domain, payload, error, correlationId)` with `retries=0`, `status='QUEUED'`.
2. **Idempotency Lease:** `acquireIdempotencyLease(key, 60000)` prevents duplicate lead creation or duplicate webhook execution.
3. **Administrator Replay:** Authorized `Super Administrator` / `Administrator` inspects `/admin/integrations` and triggers `POST /api/portal/integrations/dlq/:dlqId/replay` (max `3` retries).
4. **Emergency STOP:** `POST /api/portal/dashboard/automation/emergency-stop` halts outbound marketing while preserving inbound enquiry capture.
