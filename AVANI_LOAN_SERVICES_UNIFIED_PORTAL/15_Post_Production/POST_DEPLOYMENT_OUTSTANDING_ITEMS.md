# POST-DEPLOYMENT OUTSTANDING ITEMS (2026-11-16)

1. **API VM Nginx CSP (`RECOMMENDED — DEFENCE IN DEPTH`, External Operator Required):** `https://api.avanifinserv.com/health` returns `application/json; charset=utf-8` (not browser HTML), and already enforces `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, and `CORS`. Adding `Content-Security-Policy "default-src 'none'; frame-ancestors 'none'"` in Nginx `location /api/` remains recommended defence-in-depth when operator SSH access is used.
2. **ESLint Warnings (`51` — P3 Non-Blocking, No Action Required Now):** Unused state setters / hook dependencies (`0` errors).
3. **`npm audit` 7 Moderate Advisories (P3 Non-Blocking):** `0` high/critical; `exceljs`/`uuid` fix requires breaking `semverMajor` change.
4. **External NTFS Storage Relocation (Owner Hardware Required):** Pending external NTFS drive (`>= 50 GB`).
5. **Owner Business Acceptance (Owner Decision Required):** Explicit acceptance to move from `PRODUCTION READY — PENDING OWNER SIGN-OFF` to `PRODUCTION SIGNED OFF`.
