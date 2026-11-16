# CROSS-PROJECT API CONTRACTS (2026-11-16)

| Service | Route / Base | Auth | Idempotency / Retry | Health |
|---|---|---|---|---|
| **Project 1 Portal API** | `/api/portal/*` (`src/server.cjs`) | JWT + `sessionId` (`requirePortalAuth`) + `requirePortalCsrf` + RBAC | Gateway lease (60s TTL) + DLQ max 3 | `GET /health` |
| **Cross-Project Event Bus** | `POST /api/portal/integrations/cross-project/event` | `requirePortalAuth` + `requirePortalCsrf` + role check | `payload.idempotencyKey` (`duplicateSuppressed`) | `GET /api/portal/integrations/health` |
| **Project 2 CRM Intake** | `POST /api/crm/webhook` (`3-AVANI AI CRM`) | Signed HMAC / bearer | Deduplicated lead key | `/api/health` |
| **Project 3 Loan Agents** | `POST /api/incoming-lead`, `POST /api/chat` | Shared service token | `syncLeadToAvaniCrm` contract | `GET /api/ping` |
| **Project 4 Calling Bridge** | `CallingAgentBridge` + `/api/vapi-callback` | Callback secret / `test_mode` | Consent gate + `scrubPII` | `test_calling_bridge.js` |
