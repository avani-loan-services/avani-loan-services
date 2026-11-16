# Service-to-Service Authentication & Authorization Architecture

**Execution ID:** `TASK-11720`  
**Owner Project:** Project 1 (`1-AVANI LOAN SERVICE FY 26-27`)  
**Date:** 16 November 2026  

---

## 1. Authentication Layers Across the Four Projects

### 1.1 Portal User & Operator Authentication (Project 1)
Defined in `src/services/portalAuthService.cjs` and `src/middleware/portalAuthMiddleware.cjs`:
- **Token Transport:** `HttpOnly` cookie (`avani_portal_token`) prioritized, with `Authorization: Bearer <token>` header fallback (`requirePortalAuth`).
- **Signing & Session Lifetime:** JWT signed via `process.env.CALCULATOR_SESSION_SECRET || process.env.JWT_SECRET` (fallback key strictly for non-production local test environments) with `TOKEN_EXPIRY = '8h'`.
- **Server-Side Revocation Check:** `isSessionActive(decoded.sessionId)` validates session state against MongoDB / `portalDatabase.cjs` on every protected request.
- **Brute-Force Protection:** `MAX_FAILED_ATTEMPTS = 5`, `LOCKOUT_DURATION_MS = 15 * 60 * 1000` (15 minutes), plus dummy bcrypt timing mitigation (`DUMMY_BCRYPT_HASH`) and uniform failure copy (`UNIFORM_LOGIN_ERROR`).
- **Defense-in-Depth CSRF Guard:** `requirePortalCsrf` requires `content-type: application/json`, `x-requested-with`, or `x-avani-portal-csrf` on state-changing HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`).
- **Role-Based Access Control (`requireRole`):** Enforces 6 roles (`Super Administrator`, `Administrator`, `Research Manager`, `Sales Manager`, `Sales Executive`, `Read-Only Analyst`). For example, `POST /api/portal/integrations/cross-project/event` allows `Super Administrator`, `Administrator`, `Sales Manager`, and `Sales Executive`, returning `HTTP 403` for `Read-Only Analyst` (verified in `tests/integration/test_four_project_ecosystem_e2e.test.cjs`).

### 1.2 Inter-Project Bridge Credentials (Environment Variables — Values Redacted)
Per `src/services/ecosystemIntegrationRegistry.cjs`:
- **Project 1 <-> Project 2 (`3-AVANI AI CRM`):** Authenticated via `AVANI_CRM_URL` and `CRM_API_KEY` (webhook `/api/portal/integrations/cross-project/event`, health `/api/health`).
- **Project 1 <-> Project 3 (`4-AVANI LOAN AGENTS`):** Authenticated via `GEMINI_API_KEY` and CRM bridge configuration (`crmSync.ts` -> `/api/incoming-lead`, `/api/ping`).
- **Project 1 <-> Project 4 (`5-AVAVI AI CALLING AGENT`):** Authenticated via `VAPI_API_KEY` and `VAPI_ASSISTANT_ID` (callback `/api/vapi-callback`).

### 1.3 Gateway Guardrails & Webhook Security
- **Unified Webhook Receiver (`webhook_router`):** Enforces HMAC verification and idempotency leasing via `apps/integration-gateway/index.cjs` (`acquireIdempotencyLease` / `commitIdempotency`).
- **Secret Hygiene:** No raw `.env*` secrets or tokens are returned by `GET /api/portal/integrations` or `getProviderSnapshot()`. Instead, `credentialsConfigured`, `configuredKeysCount`, and `totalKeysCount` report boolean/numeric readiness safely.
- **API 404 Fail-Closed Handling:** Added explicit `app.use('/api', ...)` JSON `404` handler in `src/server.cjs` (lines 228–235) before the SPA HTML fallback so unauthenticated/unknown `/api/*` probes never leak frontend HTML responses with `200 OK`.
