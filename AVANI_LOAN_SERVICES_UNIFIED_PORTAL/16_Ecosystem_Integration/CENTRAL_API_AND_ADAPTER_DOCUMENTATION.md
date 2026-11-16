# CENTRAL API AND ADAPTER DOCUMENTATION (2026-11-16)

## Endpoints (`src/routes/portalIntegrationsRoutes.cjs` -> `/api/portal/integrations`)
- `GET /` (`requirePortalAuth`): Returns masked provider registry, workflow list, DLQ items, and recent ledger entries (zero secrets).
- `GET /health` (`requirePortalAuth`): Returns gateway mode, provider counts, pending DLQ count, and ledger size.
- `POST /:providerId/test-connection` (`Super Administrator` / `Administrator`, CSRF): Executes safe connection check and logs to `admin_audit_logs`.
- `POST /:providerId/toggle` (`Super Administrator` / `Administrator`, CSRF): Enables/disables provider in runtime registry.
- `POST /workflows/:workflowId/toggle` (`Super Administrator` / `Administrator`, CSRF): Enables/pauses workflow.
- `POST /dlq/:dlqId/replay` (`Super Administrator` / `Administrator`, CSRF): Replays failed DLQ item via `IntegrationGateway.replayDLQ`.
