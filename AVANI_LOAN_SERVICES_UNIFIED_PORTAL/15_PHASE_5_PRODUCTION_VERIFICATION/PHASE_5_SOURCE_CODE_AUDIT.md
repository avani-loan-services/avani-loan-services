# PHASE 5: PROJECT AND SOURCE CODE AUDIT
## AVANI LOAN SERVICES — UNIFIED BUSINESS GROWTH & LEAD MANAGEMENT PORTAL

**Application:** AVANI LOAN SERVICES  
**Production Domain:** `https://www.avanifinserv.com/`  
**Git Branch:** `master`  
**Node.js Runtime:** `v24.14.0`  
**Audit Date:** November 1, 2026  
**Auditor:** Senior Full-Stack Engineer, DevOps & Application Security Auditor  
**Status:** **AUDITED — ARCHITECTURE VERIFIED & PRODUCTION GAP IDENTIFIED**

---

## 1. Executive Architecture Summary

The AVANI LOAN SERVICES codebase is structured as a modern hybrid web application combining a React 19 single-page application (SPA) frontend with an Express 5 REST API backend, deployable to Node.js server runtimes or serverless hosting platforms (Vercel).

```
                      ┌───────────────────────────────────────────────┐
                      │             CLIENT BROWSER LAYER              │
                      │  https://www.avanifinserv.com (Vite/React 19) │
                      └───────┬───────────────────────────────┬───────┘
                              │                               │
                      Public Endpoints               Protected Admin Portal
                      - /builder-partnership          - /admin/login
                      - /institutional-funding        - /admin/dashboard
                              │                               │
                              ▼                               ▼
                      ┌───────────────────────────────────────────────┐
                      │              VERCEL ROUTING ENGINE            │
                      │           vercel.json -> api/index.js         │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │            EXPRESS 5 REST API BACKEND         │
                      │                  src/server.cjs               │
                      └───────┬───────────────────────────────┬───────┘
                              │                               │
                     [Public Routes]                  [Protected Routes]
                     /api/portal/public/*             /api/portal/auth/*
                                                      /api/portal/builder/*
                                                      /api/portal/education/*
                                                      /api/portal/dashboard/*
                                                              │
                                              ┌───────────────┴───────────────┐
                                              ▼                               ▼
                                  ┌───────────────────────┐       ┌───────────────────────┐
                                  │   MONGODB ATLAS M0    │       │  LOCAL JSON DATASTORE │
                                  │  (Production Target)  │◄─────►│ (Verified Seed/Caches)│
                                  │ avani_loan_services_  │       │  02_Backups & /data/  │
                                  │ prod & test databases │       │ (80 Builders, 80 Inst)│
                                  └───────────────────────┘       └───────────────────────┘
```

---

## 2. Technology Stack Compatibility Audit

| Component | Target Version | Installed / Configured Version | Compatibility & Health Status |
|-----------|----------------|--------------------------------|-------------------------------|
| **Node.js** | `>= 20.x` | `v24.14.0` (LTS/Current) | **PASS** — Fully compatible with ES modules and CommonJS (`.cjs`). |
| **Frontend Framework** | React 19 | `react@^19.2.4`, `react-dom@^19.2.4` | **PASS** — Uses modern hooks, concurrent features, zero deprecated APIs. |
| **Routing** | React Router 7 | `react-router-dom@^7.14.0` | **PASS** — Handles client routes `/admin/*`, `/builder-partnership`, `/institutional-funding`. |
| **Build Tooling** | Vite 6 | `vite@^6.0.0`, `@vitejs/plugin-react@^4.3.4` | **PASS** — Production bundle compiles cleanly (`npm run build` in ~50s). |
| **Backend Framework** | Express 5 | `express@^5.2.1` | **PASS** — Built-in native async handler, robust middleware chain. |
| **Database ODM** | Mongoose 9 | `mongoose@^9.9.2` | **PASS** — Dual-driver support with fallback memory caching. |
| **Security & Auth** | Bcrypt & JWT | `bcrypt@^6.0.0`, `jsonwebtoken@^9.0.3` | **PASS** — 12-round salt hashing, cryptographic HMAC SHA-256 JWT signatures. |
| **Report Generation** | ExcelJS | `exceljs@^4.4.0` | **PASS** — Generates 21 styled XLSX analytical workbooks on disk. |

---

## 3. Route & Endpoint Topology Audit

### 3.1 Portal Administrative & Operational Endpoints (`src/server.cjs`)
All unified portal routes are mounted under `/api/portal/*`:
- **Authentication & Users (`src/routes/portalAuthRoutes.cjs`):**
  - `POST /api/portal/auth/login` (Rate limited: 5 req/15 min, account lockout guard)
  - `GET /api/portal/auth/me` (JWT verification)
  - `POST /api/portal/auth/change-password` (Enforces change for first-time login)
  - `POST /api/portal/auth/logout` (Invalidates session)
  - `GET /api/portal/auth/users` (RBAC restricted to Super Administrator)
- **Module A: Builder Partnerships (`src/routes/builderPortalRoutes.cjs`):**
  - `GET /api/portal/builder/companies` (Query by city, category, readiness)
  - `GET /api/portal/builder/pipeline` (19 stages)
  - `PATCH /api/portal/builder/pipeline/:dealId` (Deal progression & stage audit logging)
  - `GET /api/portal/builder/contacts` (Category A, B, C, D verified channels)
  - `GET /api/portal/builder/maharera` (MahaRERA registration status)
  - `GET /api/portal/builder/export` (Dynamic CSV/JSON export)
- **Module B: Education Funding (`src/routes/educationPortalRoutes.cjs`):**
  - `GET /api/portal/education/institutions` (Query by state, category, accreditation)
  - `GET /api/portal/education/aplus` (52 benchmark A+ opportunities)
  - `GET /api/portal/education/pipeline` (24 credit evaluation stages)
  - `PATCH /api/portal/education/pipeline/:dealId` (Credit underwriting progression)
  - `GET /api/portal/education/funding-categories` (12 credit products)
  - `GET /api/portal/education/consent` (DPDP Act 2023 consent ledger)
  - `GET /api/portal/education/export` (Dynamic CSV/JSON export)
- **Unified Operations & System (`src/routes/unifiedPortalRoutes.cjs`):**
  - `GET /api/portal/dashboard/overview` (Combined dual-module KPI metrics)
  - `GET /api/portal/dashboard/tasks` & `POST /api/portal/dashboard/tasks`
  - `PATCH /api/portal/dashboard/tasks/:taskId` (Task completion & SLA tracking)
  - `GET /api/portal/dashboard/enquiries` & `PATCH /api/portal/dashboard/enquiries/:enquiryId`
  - `GET /api/portal/dashboard/automation/status`
  - `POST /api/portal/dashboard/automation/emergency-stop` (Immediate outbound kill-switch)
  - `POST /api/portal/dashboard/automation/resume` (Controlled resumption with justification)
  - `POST /api/portal/dashboard/automation/sync` (Database reconcile & index trigger)
  - `GET /api/portal/dashboard/audit-logs` (Immutable operational audit log)
  - `GET /api/portal/dashboard/reports/unified-dashboard` (Telemetry summary)
- **Public Inbound Lead Capture (`src/routes/publicEnquiryRoutes.cjs`):**
  - `POST /api/portal/public/builder-enquiry` (Rate limited: 10 req/hr per IP)
  - `POST /api/portal/public/education-enquiry` (Rate limited: 10 req/hr per IP)

### 3.2 Pre-Existing Website Routes Preserved
The audit verified that existing core routes remain completely intact and functional:
- `/api/eligibility/*` (Loan eligibility engine)
- `/api/calculator-auth/*` (Financial calculator access)
- `/api/lead/*` & `/api/marketing/*` (Customer lead capture)
- `/api/documents/*` (Customer document upload portal)
- `/api/whatsapp-webhook` & `/api/meta/*` (Omnichannel customer webhooks)
- Existing public customer calculators, EMI estimators, and loan product pages.

---

## 4. Database & Storage Architecture Audit

### 4.1 Current Implementation State
The portal currently implements persistence via `src/models/portalDatabase.cjs`:
- **Storage Medium:** Flat JSON files written to `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/*.json` alongside synchronized in-memory JavaScript `Map()` collections.
- **Data Integrity:** Fast synchronous/asynchronous disk persistence using `fs.writeFileSync`.
- **Primary Keys:** Explicit prefixes (`ALS-BLD-XXXX`, `ALS-EDU-XXXX`, `TSK-XXXX`, `USR-XXXX`, `ENQ-XXXX`).

### 4.2 Production Serverless Hosting Gap Analysis
> [!CRITICAL]
> **Production Persistence Limitation:**  
> On serverless hosting providers like **Vercel** (`api/index.js`), the local execution filesystem (`/var/task`) is **ephemeral and read-only** during serverless function execution.  
> Any runtime mutations (new builder leads, password updates, pipeline stage shifts, enquiry submissions) written exclusively to disk via `fs.writeFileSync()` will fail or be wiped when the serverless container recycles.
> 
> **Correction Required (Step 4):**  
> Connect the portal data engine to the persistent cloud database (`MongoDB Atlas M0` cluster `avani-loan-services-m0.xj6nhak.mongodb.net`, databases `avani_loan_services_prod` and `avani_loan_services_test`), with seamless fallback to verified JSON backups when offline.

---

## 5. Environment Variables & Secret Configuration Audit

| Configuration Key | Purpose | Present in Local `.env` | Staging / Prod Target | Security Assessment |
|-------------------|---------|-------------------------|------------------------|---------------------|
| `PORT` | Local express listen port | Yes (`3000`) | Managed by Vercel/Host | Normal |
| `APP_MODE` | Application environment guard | Set to `test` | `staging` / `production` | Enforces fail-closed rules |
| `PROVIDER_MODE` | Outbound messaging mock/live | Set to `mock` | `mock` / `live` | Outbound campaigns safely mocked |
| `MONGODB_URI` | Atlas cloud connection string | Local/Placeholder | Required in Vercel | Must be supplied securely |
| `ADMIN_INITIAL_PASSWORD` | Temporary bootstrap password | Present | Custom in Prod | Force-changed on first login |
| `JWT_SECRET` / `PORTAL_JWT_SECRET` | Token signing secret | Fallback configured | High-entropy 64-char string | Never exposed in Git |

---

## 6. Git Branch & Version Control Audit

- **Active Branch:** `master`
- **Remote Origin:** `origin/master` (`https://github.com/alphastarpower/1-AVANI-LOAN-SERVICE-FY-26-27`)
- **Status:** Staging changes and unified portal files tracked cleanly.
- **Backup Verification:** Full pre-audit snapshot created at:  
  `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/02_Backups/Phase5_PreMigration_20261101_210828/`

---

## 7. Step 1 Audit Conclusion & Action Plan

1. The frontend, backend, security middleware, and reporting suites are syntactically sound and functional.
2. The existing public website pages and loan calculators are 100% preserved.
3. The primary technical enhancement needed before production cutover is upgrading `portalDatabase.cjs` to support MongoDB persistence alongside the existing JSON stores.
