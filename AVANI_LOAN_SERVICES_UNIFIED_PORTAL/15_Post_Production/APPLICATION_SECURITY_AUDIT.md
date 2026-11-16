# APPLICATION SECURITY AUDIT (2026-11-16)

- **Unauthenticated API Access Check:** `GET /api/portal/builder/companies`, `/api/portal/education/institutions`, `/api/portal/dashboard/overview` all returned **HTTP `401`** (`requirePortalAuth` JWT + server-side `isSessionActive` check).
- **RBAC Matrix Verified (`hasPermission` across 6 roles):**
  - `Super Administrator`: `builder:read/write=true`, `education:read/write=true`, `automation:control=true`, `users:manage=true`
  - `Administrator`, `Research Manager`, `Sales Manager`, `Sales Executive`: `builder:read/write=true`, `education:read/write=true`, `automation:control=false`, `users:manage=false`
  - `Read-Only Analyst`: `builder:read=true`, `builder:write=false`, `education:read=true`, `education:write=false`, `automation:control=false`, `users:manage=false`
- **Security Test Suites:** `tests/security/test_pii_and_consent.test.cjs` + `tests/unit/test_hubspot_signature.test.cjs` **PASSED** (`0` failures).
- **HTTP Hardening (`src/server.cjs` + `vercel.json`):** `helmet`, `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, strict CORS allowlist, `httpOnly` + `sameSite: lax` + `secure` (prod) cookies, `5 req / 15 min` auth rate limiter.
- **P0/P1 Code Defects:** **0 open**.
