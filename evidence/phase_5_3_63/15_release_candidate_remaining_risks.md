# 15 — RELEASE CANDIDATE REMAINING RISKS (PHASE 5.3.63)

1. **Git CLI Missing (Release Blocker for Phase L):** `winget` failed (`0x80072ee2` / `0x80070020`), preventing `git status`, `git diff`, `git commit`, and `git push`.
2. **Vercel CLI Logged Out (Release Blocker for Phase M):** `vercel whoami` returned `Logged out`, preventing live Vercel deployment and post-deployment smoke tests.
3. **Offline Nginx Binary Unavailable (Low / Non-Blocking for Frontend):** `where.exe nginx` not found locally (`OFFLINE_NGINX_VALIDATION_NOT_AVAILABLE`); operator should run `sudo nginx -t` before applying the Phase 5.3.55 CSP patch on the API VM.
4. **7 Moderate npm Audit Advisories (Non-Blocking):** `exceljs`/`uuid` fix requires a breaking `semverMajor` change (`exceljs@3.4.0`); `0` high or critical advisories exist.
5. **51 ESLint Warnings (Non-Blocking):** Unused state setters / hook dependencies in `src/pages/*`; `0` errors.
