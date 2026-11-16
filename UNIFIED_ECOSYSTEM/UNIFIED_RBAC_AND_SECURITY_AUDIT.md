# Unified RBAC and Security Audit Report

**Execution ID:** `TASK-11720`  
**Auth Implementation:** `src/services/portalAuthService.cjs` & `src/middleware/portalAuthMiddleware.cjs`  
**Date:** 16 November 2026  

---

## 1. Six-Role RBAC Matrix (`ROLES` / `ROLE_PERMISSIONS`)

| Role | Permissions Scope | Cross-Project Event POST (`/cross-project/event`) | Provider/Workflow Toggle & DLQ Replay |
| :--- | :--- | :--- | :--- |
| `Super Administrator` | `['*']` (Unrestricted) | Allowed (`200`) | Allowed (`200`) |
| `Administrator` | Builder/Education RW+Delete, CRM RW, Automation RW+Stop, Enquiry RW, Reports Export, Audit Read | Allowed (`200`) | Allowed (`200`) |
| `Research Manager` | Builder/Education RW+Export, Reports Export | Denied (`403`) | Denied (`403`) |
| `Sales Manager` | Builder/Education RW+Export, CRM RW, Enquiry RW, Reports Export | Allowed (`200`) | Denied (`403`) |
| `Sales Executive` | Builder/Education RW, CRM RW, Enquiry RW | Allowed (`200`) | Denied (`403`) |
| `Read-Only Analyst` | Builder/Education Read+Export, CRM Read, Enquiry Read, Reports Export, Audit Read | Denied (`403` — verified E2E) | Denied (`403`) |

## 2. Security Controls Verified in Code & Tests

1. **HttpOnly Cookie + Bearer Fallback + Server Session Check:** `requirePortalAuth` checks `avani_portal_token` cookie then `Bearer` header, validates JWT signature (`8h` expiry), and verifies `isSessionActive(decoded.sessionId)` in DB/store.
2. **Account Lockout & Timing Mitigation:** `MAX_FAILED_ATTEMPTS = 5`, `LOCKOUT_DURATION_MS = 15 * 60 * 1000`, constant-time dummy bcrypt hash comparison (`DUMMY_BCRYPT_HASH`), uniform error message (`UNIFORM_LOGIN_ERROR`), mandatory initial password change gate (`requirePasswordChangeChecked` -> `403`).
3. **CSRF Defense-in-Depth:** `requirePortalCsrf` requires `content-type: application/json`, `x-requested-with`, or `x-avani-portal-csrf` on mutating methods.
4. **Live Unauthenticated Endpoints Verified on `api.avanifinserv.com`:** `/api/portal/builder/companies`, `/api/portal/education/institutions`, and `/api/portal/dashboard/overview` all enforce `HTTP 401` when unauthenticated (`task-11740`).
5. **Express `/api/*` 404 Fail-Closed Handler:** `src/server.cjs` (lines 228–235) ensures unknown `/api/*` routes return JSON `404` rather than SPA `index.html`.

## 3. Honest Disclosure on Live Production RBAC Verification (`OPEN_OWNER_APPROVAL`)

- **Local Unit/Integration Testing:** RBAC enforcement (including `Super Administrator` allow vs `Read-Only Analyst` `HTTP 403` deny) is verified in `tests/integration/test_four_project_ecosystem_e2e.test.cjs` and Project 1 portal security tests.
- **Live Production (`api.avanifinserv.com`):** Only `3` `Super Administrator` hashes exist in `admin_users.json`; non-admin live test credentials were **not** provided in workspace. Therefore live 6-role browser/API login testing on production remains `OPEN_OWNER_APPROVAL` (non-blocking for code acceptance; requires Owner-provisioned test accounts if live 6-role production smoke verification is desired).
- **API VM Nginx CSP (`BLK-003`):** Remains `OPEN_EXTERNAL_DEPENDENCY` because workspace host `~/.ssh` holds only `known_hosts` with no authorized SSH private key to reload Nginx or pull latest `src/server.cjs` on the API VM.
