# 03 — PRODUCTION ARCHITECTURE & ISSUE REGISTER (PHASE 5.3.62)

## 1. Architecture Summary

- **Frontend:** React `19.2.4`, `react-router-dom` `7.14.0`, built with `vite` `6.0.0` (`dist/` output), `prebuild` runs `scripts/generate-service-pages.js`.
- **Backend / API:** Express `5.2.1` (`src/server.cjs`) + Vercel serverless endpoints (`api/health.js`, `api/index.js`, `api/save-lead.js`, `api/track-click.js`, `api/vapi-callback.js`).
- **Database & Queues:** `mongoose` `9.9.2`, `bullmq` `5.2.0`, `ioredis-mock` `5.4.1`, `@supabase/supabase-js` `2.110.7`.

## 2. Prioritized Issue Register

| Priority | Finding | Impact | Proposed Fix | Verification |
|---|---|---|---|---|
| **P0 (Tooling/Release Blocker)** | `git` is missing after Windows 10 reset (`winget` download timed out `0x80072ee2`) and `vercel` CLI is not installed | Blocks Phase 8 (`git commit`/`push`) and Phase 9 (`vercel deploy`) | Owner installs Git for Windows (`winget install --id Git.Git -e`) and authenticates `vercel` CLI | `git --version`, `vercel whoami` |
| **P1** | None found in codebase (`eslint` 0 errors, `9/9` `node --test` suites pass, `forensic:test` passes, `vite build` passes) | N/A | N/A | All checks pass |
| **P2** | `51` ESLint warnings (`no-unused-vars`, `react-hooks/exhaustive-deps`, `react-refresh/only-export-components`) in `src/pages/*` | Non-blocking; build succeeds with 0 errors | Clean up unused state setters in a dedicated post-release PR | `eslint src` |
| **P3** | `vercel.json` uses `Content-Security-Policy-Report-Only`; `.vercel/project.json` targets `nodeVersion: 24.x` while local Node is `v26.13.1` | Non-blocking; intentional staged CSP rollout | Keep as-is until production CSP telemetry is reviewed | `vercel.json` |
