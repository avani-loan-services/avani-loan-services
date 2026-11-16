# EXISTING INTEGRATION AND DEPENDENCY AUDIT (2026-11-16)

- **Project 1 Core Gateway (`apps/integration-gateway/index.cjs`):** Idempotency leases, DLQ (`maxRetries=3`), audit ledger, Meta/AiSensy/HubSpot/Sheets/Zapier adapters.
- **Project 2 (`3-AVANI AI CRM`):** `mongoose@9.7.3`, `pg@8.22.0`, `next@16.2.10`, `axios@1.18.1`.
- **Project 3 (`4-AVANI LOAN AGENTS`):** Next.js + Prisma (`database.db` / `prisma/schema.prisma`), `lib/services/crmSync.ts`, `lib/services/orchestrator.ts`.
- **Project 4 (`5-AVAVI AI CALLING AGENT`):** Pure Node.js (`fetch` native Node 18+, zero external npm dependencies).
- **Identified Duplicate/Disconnected Surfaces Closed in TASK-11720:** Unified via `ecosystemIntegrationRegistry.cjs` + `/api/portal/integrations/cross-project/event` + `src/server.cjs` `/api` JSON 404 fix.
