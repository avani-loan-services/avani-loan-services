# PHASE 5.3.29 — REGRESSION AND BUILD REPORT

**Execution Date:** 2026-11-12  
**Test Environment:** Local Node test harness (`NODE_ENV=test` / `APP_MODE=test`, `PROVIDER_MODE=mock`)  

---

## 1. Build & Regression Summary

| Suite / Command | Exit Code | Passed | Failed | Skipped | Status | Key Coverage Observed |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `npm run build` (`vite build`) | `0` | 2154 modules | 0 | 0 | **VERIFIED** | Built `dist/index.html` + `dist/assets/index-D58qdNvs.js` in `18.10s`; `prebuild` regenerated 7 service pages + `public/sitemap.xml` + `public/robots.txt`. |
| `node scripts/screenshot_readiness_validator.cjs` | `0` | 3 assertions | 0 | 0 | **VERIFIED** | Blank-pane rejection, populated-pane acceptance, evaluator generation. |
| `node scripts/test_phase_5_3_24_auth_regression.cjs` | `0` | 21 | 0 | 0 | **VERIFIED** | Login 200, bad password 401, 5-attempt lockout 423, `/me`, logout 200, revoked token 401, protected 401, password rotation invalidates old session, 503 guard, zero secret leaks. |
| `node scripts/test_phase_5_3_27_suite.cjs` | `0` | 6 | 0 | 0 | **VERIFIED** | Security headers/CORS, auth & session continuity, RBAC 403 analyst mutation block, CRM 80/24/56 counts + 409 duplicate guard + XLSX export, templates lifecycle, campaigns opt-out/9 states; snapshots restored cleanly. |
| `node scripts/test_phase_5_3_23_template_suite.cjs` | `0` | 34 | 0 | 0 | **VERIFIED** | Build integrity, `/health` 200, unauthenticated 401 on templates/campaigns, truthful Meta status, variable interpolation, local draft clone, mock test send (`₹0`, 0 live sends), campaign dry-run, 80/24/56 counts, logout -> 401 revocation. (`portal_campaigns.json` restored via `git checkout --` post-test). |

---

## 2. Browser Verification Summary (Local `dist/` at `http://127.0.0.1:4199`)

| Check | Status | Observed Result |
| :--- | :--- | :--- |
| Public `/` desktop load | **VERIFIED** | Title `Home - Avani Loan Services \| Avani Loan Services`, `textLen=4923`, `scrollWidth <= innerWidth` (`1503 <= 1523`). |
| `/admin?tab=builders` canonicalization | **VERIFIED** | Canonicalized cleanly to `/admin?tab=builder`. |
| `/admin?tab=leads` preservation | **VERIFIED** | Preserved `/admin?tab=leads`. |
| Browser Back / Forward (`/` <-> `/admin?tab=builder`) | **VERIFIED** | Back returned `/`; Forward returned `/admin?tab=builder`. |
| Live authenticated portal views (Builders, Leads, Logout) | **BLOCKED** | Requires legitimate interactive administrator login on production. |
