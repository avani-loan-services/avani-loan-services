# INTEGRATION SECURITY AUDIT (2026-11-16)

- **Authentication & RBAC:** `/api/portal/integrations` enforces `requirePortalAuth` (`401` unauthenticated) and `requireRole('Super Administrator', 'Administrator')` + `requirePortalCsrf` on all state-changing endpoints (`403` for `Read-Only Analyst`).
- **Zero-Secret-Leakage:** Registry inspects `Boolean(process.env[k])` only; `test_ecosystem_integrations.test.cjs` asserts zero MongoDB URIs, private keys, or API keys in API responses.
- **Consent & Suppression:** `WF-C-EDUCATION` and `WF-E-COMMUNICATION` reject `Pending_Request` and `Opted_Out` with `403 BLOCKED_CONSENT_GATE`.
- **Webhook & Replay Protection:** HubSpot V3 signature + timestamp replay (`7/7` PASS), ChatMitra HMAC-SHA256 + idempotency (`12/12` PASS), DLQ max-3-retries.
