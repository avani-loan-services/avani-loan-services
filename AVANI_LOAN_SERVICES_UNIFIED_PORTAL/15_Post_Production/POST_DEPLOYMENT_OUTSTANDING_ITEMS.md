# POST-DEPLOYMENT OUTSTANDING ITEMS (2026-11-16)

1. **API VM Nginx CSP Patch (`BLOCKED — AUTHORIZED INFRASTRUCTURE ACCESS REQUIRED`):** `https://api.avanifinserv.com/health` (`nginx/1.18.0 (Ubuntu)`) still lacks `Content-Security-Policy`; `~/.ssh` has only `known_hosts`. Operator must apply `NGINX_CSP_BLOCKER_AND_OPERATOR_INSTRUCTIONS.md` on the API VM.
2. **ESLint Warnings (`51` — P3 Non-Blocking):** Unused state setters / hook dependencies in `src/pages/*` (`0` errors).
3. **`npm audit` 7 Moderate Advisories (P3 Non-Blocking):** `0` high/critical; `exceljs`/`uuid` fix requires breaking `semverMajor` change.
4. **External NTFS Storage Relocation:** Pending external NTFS drive (`>= 50 GB`) for full workspace offloading.
5. **Owner Business Sign-Off:** Awaiting explicit business-owner acceptance to transition from `PRODUCTION READY — PENDING OWNER SIGN-OFF` to `PRODUCTION SIGNED OFF`.
