# Repository-Specific Integration Assessment (Phase 1 Baseline)

**Timestamp (UTC):** `2026-11-16T11:45:00Z`  
**Authorised Projects Audited:** Projects 1, 2, 3, and 4 under `DEVELOPEMENT TOOLS\`  

---

## 1. Project 1 — `1-AVANI LOAN SERVICE FY 26-27` (`svc-loan-api`)
- **Stack:** Node.js + Express 5 (`src/server.cjs`, CommonJS `.cjs`) + Vite React 19 SPA (`src/`).
- **Entry Point & Ecosystem Hub:** `src/server.cjs`, `src/services/ecosystemIntegrationRegistry.cjs`, `src/routes/portalIntegrationsRoutes.cjs`, `apps/integration-gateway/index.cjs`.
- **Auth Mechanism:** Portal user JWT in `avani_portal_token` cookie / Bearer header (`portalAuthService.cjs`), 6-role RBAC (`requireRole`), CSRF check (`requirePortalCsrf`).
- **Gap Identified:** No machine-to-machine short-lived JWT + HMAC request signing / replay guard allowing Projects 2–4 to call `POST /api/portal/integrations/cross-project/event` securely without sharing admin credentials, and no outbound authenticated S2S dispatcher from Project 1 to Projects 2–4.

## 2. Project 2 — `3-AVANI AI CRM` (`svc-ai-crm`)
- **Stack:** Next.js 16.2.10 App Router + TypeScript + Mongoose/MongoDB + PostgreSQL.
- **Entry Point & Routes:** `src/app/api/health/route.ts`, `src/app/api/public/enquiry/route.ts`, `src/app/api/leads/route.ts`, `src/app/api/vapi-webhook/route.ts`.
- **Auth Mechanism:** HMAC session cookie (`src/lib/auth.ts`, `SESSION_SECRET`), `verifySharedWebhookSecret` for internal/webhook routes.
- **Gap Identified:** Lacks dedicated `/api/ecosystem/s2s` receiver and outbound signed `svc-ai-crm -> svc-loan-api` client using short-lived JWT + HMAC + correlation IDs + idempotency.

## 3. Project 3 — `4-AVANI LOAN AGENTS` (`svc-loan-agents`)
- **Stack:** Next.js 16 + TypeScript + Prisma / SQLite (`lib/db/client.ts`) + Vercel AI SDK (`@ai-sdk/google`, `ai`).
- **Entry Point & Routes:** `app/api/incoming-lead/route.ts`, `app/api/chat/route.ts`, `app/api/ping/route.ts`, `lib/services/orchestrator.ts`, `lib/services/crmSync.ts`, `lib/tools/eligibility.ts`.
- **Auth Mechanism:** No inbound auth on `app/api/incoming-lead/route.ts`; `crmSync.ts` uses optional static `x-api-key`.
- **Gap Identified:** Must authenticate incoming `svc-loan-api` requests (`app/api/ecosystem/s2s/route.ts`), evaluate trilingual eligibility under regulatory guardrails (no autonomous sanction/rate guarantees), and push signed `svc-loan-agents -> svc-loan-api` results.

## 4. Project 4 — `5-AVAVI AI CALLING AGENT` (`svc-ai-calling`)
- **Stack:** Standalone Node.js CommonJS (`calling-agent-bridge.js`, `test_calling_bridge.js`), previously lacked `package.json`, `package-lock.json`, `.env.example`, and an HTTP server listener.
- **Gap Identified:** Requires `package.json` + lockfile (`npm audit` baseline), HTTP listener (`POST /api/ecosystem/s2s`, `GET /health`), incoming S2S JWT+HMAC verification, PII redaction (`scrubPII`), disposition mapping (`mapCallDisposition`), and outbound signed callbacks to `svc-loan-api`.
