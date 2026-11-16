# 02 — PROJECT BASELINE AUDIT (PHASE 5.3.62)

- **Project Root:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`
- **Package Name:** `avani-loan-service-fy-26-27` (`"type": "module"`, Vite + React 19 frontend, Express 5 CommonJS backend `src/server.cjs`)
- **Lockfile & Dependencies:** `package-lock.json` (`True`), `node_modules` (`True`), `pnpm-lock.yaml` (`False`), `yarn.lock` (`False`)
- **Hosting Config:** `.vercel/project.json` (`projectName: avani-loan-service-fy-26-27`, `framework: vite`, `nodeVersion: 24.x`) and `vercel.json` (security headers + `/api/(.*)` rewrite to `https://api.avanifinserv.com/api/$1`)
- **Directories Present:** `.git`, `.github`, `.vercel`, `api/`, `apps/`, `backend/`, `config/`, `configs/`, `data/`, `dist/`, `docs/`, `evidence/`, `n8n/`, `node_modules/`, `scripts/`, `src/`, `tests/`
- **Git Baseline:** `.git` directory exists, but `git` CLI is not installed (`winget` download timed out), so live `git status` / `HEAD` / `remote -v` could not be executed in this phase.
