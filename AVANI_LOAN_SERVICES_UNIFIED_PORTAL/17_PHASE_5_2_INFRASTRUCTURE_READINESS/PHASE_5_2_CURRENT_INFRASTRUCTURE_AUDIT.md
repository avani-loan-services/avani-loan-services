# AVANI LOAN SERVICES — PHASE 5.2 CURRENT INFRASTRUCTURE AUDIT
## Comprehensive Source Code, Git State, Runtime Architecture, & Network Topology Inspection

**Document Version:** 1.0.0  
**Audit Date:** November 02, 2026  
**Auditor:** Senior SaaS Infrastructure Architect, DevSecOps Lead, & Node.js/Vercel Reliability Engineer  
**Project:** AVANI LOAN SERVICES Unified Business Growth & Lead Management Portal  
**Target Domain:** `https://www.avanifinserv.com/`  
**Classification:** STRICTLY CONFIDENTIAL — INFRASTRUCTURE AUDIT REPORT  

---

## 1. EXECUTIVE AUDIT SUMMARY

An exhaustive, non-destructive audit of the AVANI LOAN SERVICES infrastructure, source tree, network topology, and runtime architecture was executed. The objective of this Phase 5.2 investigation is to evaluate the technical gap between local verification and production readiness, specifically addressing the database egress/ingress mismatch between Vercel Serverless execution environments and MongoDB Atlas Free Tier (M0) network access rules.

### Key Audit Findings:
1. **Repository & Branch Integrity**: Active branch is `master`, tracking `origin/master` at commit `d693fb7`. The remote repository is clean with zero unpushed commits. All Phase 5, Phase 5.1, and Phase 5.2 modifications are isolated in the local working tree.
2. **Architecture Model**: Co-located hybrid monorepo consisting of a Vite + React 19 Single Page Application (SPA) and an Express 5.2.1 REST API. In local development, Express serves both static bundles and API routes as a unified stateful HTTP daemon. On Vercel, static SPA assets are edge-distributed, whereas the Express API is executed as a stateless AWS Lambda serverless function via `api/index.js`.
3. **Database Connectivity Blocker**: The production database target is MongoDB Atlas M0 cluster `avani-loan-services-m0.xj6nhak.mongodb.net`. Atlas enforces strict IP Access List filtering. Because Vercel serverless functions dynamically rotate across ephemeral IP pools in AWS regions (e.g., `ap-south-1` Mumbai) and policy strictly forbids `0.0.0.0/0`, direct serverless connections time out (`serverSelectionTimeoutMS: 3000ms`) and are blocked at the network transport layer.
4. **Persistence Layer Disconnect**: Currently, `src/models/portalDatabase.cjs` utilizes an in-memory Map backed by synchronous JSON file writes in `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/` with an asynchronous dual-write to Mongoose. While this succeeds locally, Vercel serverless containers operate on a read-only filesystem (`EROFS`) with ephemeral memory that is recycled on every cold start. Cloud persistence is strictly blocked until secure database egress is established.
5. **Credential & Environment Security**: No plaintext passwords or connection strings are committed in tracked Git files. Rotated administrator credentials from Phase 5.1 are preserved in untracked `.admin_credential_handoff.secret` with `*.secret` properly configured in `.gitignore`. A legacy credential (`Samarth@1356`) previously used in older public calculator tools was audited and isolated from the Unified Admin Portal.

---

## 2. GIT REPOSITORY & VERSION CONTROL AUDIT

```
Branch: master
Tracking Remote: origin/master
Remote URL: https://github.com/avani-loan-services/avani-loan-services.git
Base Commit: d693fb7 ("feat(providers): add ChatMitra trial engine, integration tests, and audit reports")
Remote Ahead/Behind: 0 / 0 (Synchronized with upstream baseline)
```

### 2.1 Working Tree Analysis
- **Tracked Modifications**:
  - `.gitignore`: Updated with `*.secret` to prevent credential leakage.
  - `src/App.jsx`: Route mounting for `/admin/*`, `/builder-partnership`, and `/institutional-funding`.
  - `src/server.cjs`: Integration of portal routers (`/api/portal/*`) and database connection initialization.
  - `vercel.json`: Path rewrite rules routing `/api/portal/(.*)` to `/api/index.js`.
  - Content markdown templates: Sanitized of exposed credentials.
- **Untracked Directories & Artifacts**:
  - `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/`: Master portal architecture, data models, 80 builder records, 80 institution records, backups, and Phase 5/5.1/5.2 audit reports.
  - `src/models/portalDatabase.cjs` & `src/models/portalSchemas.cjs`: Database engine and Mongoose schemas.
  - `src/routes/` & `src/middleware/`: Portal authentication, builder CRM, education CRM, dashboard, and public enquiry API controllers.
  - `src/pages/`: Unified Admin Portal, Builder Partnership, and Institutional Funding React components.
  - `scripts/`: Verification test runners, credential rotation engine, and seed scripts.
- **Git Hygiene Verdict**: **CLEAN & CONTAINED**. No premature commits or unauthorized remote pushes have been executed.

---

## 3. RUNTIME & APPLICATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOCAL RUNTIME (Stateful)                           │
│                                                                             │
│  [Browser] ──► [localhost:3000]                                            │
│                     │                                                       │
│                     ▼                                                       │
│             [Express 5 Server]                                              │
│             ├─ Static: /dist (React 19 SPA)                                 │
│             └─ API: /api/portal/*                                           │
│                     │                                                       │
│                     ▼                                                       │
│             [portalDatabase.cjs] ──► JSON Disk: AVANI_.../data/*.json       │
│                     │                                                       │
│                     └─► (Async Mongoose) ──► [MongoDB Local / Timeout]      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERCEL RUNTIME (Serverless)                         │
│                                                                             │
│  [Browser] ──► [https://www.avanifinserv.com/]                              │
│                     │                                                       │
│         ┌───────────┴───────────────────────────────┐                       │
│         ▼                                           ▼                       │
│   [Vercel CDN Edge]                     [Vercel Serverless Function]        │
│   Static Assets & SPA                   AWS Lambda / Firecracker microVM    │
│   (/index.html, /assets/*)              Entrypoint: api/index.js            │
│                                                     │                       │
│                                                     ▼                       │
│                                             [Express Handler]               │
│                                             - Ephemeral In-Memory Map       │
│                                             - Read-Only Filesystem (EROFS)  │
│                                             - Dynamic Rotating Outbound IP  │
│                                                     │                       │
│                                                     ▼                       │
│                                        [Direct Connection BLOCKED]          │
│                                                     │                       │
│                                                     ▼                       │
│                                       [MongoDB Atlas M0 Cluster]            │
│                                       Strict IP Access List Enforced        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Technology Stack Specifications
- **Node.js**: v24.14.0 (Engine declared: `24.x` in `.vercel/project.json`).
- **Web Framework**: Express v5.2.1 (using native router, urlencoded/json middlewares, and helmet/cors security headers).
- **Frontend SPA**: React v19.2.4, React Router DOM v7.14.0, Vite v4.3.4, Lucide React v1.8.0.
- **Database Client**: Mongoose v9.9.2 (Strict query false, server selection timeout 3000ms).
- **Authentication**: Bcrypt v6.0.0 (12 salt rounds), JSONWebToken v9.0.3, Express Rate Limit v8.5.2.
- **Reporting Engine**: ExcelJS v4.4.0 (Streaming XLSX workbook generation).

### 3.2 Vercel Serverless Configuration (`vercel.json`)
The Vercel routing configuration routes incoming traffic through rewrite rules:
```json
{
  "rewrites": [
    { "source": "/api/eligibility/(.*)", "destination": "/api/index.js" },
    { "source": "/api/auth/(.*)", "destination": "/api/index.js" },
    { "source": "/api/portal/(.*)", "destination": "/api/index.js" },
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
All `/api/portal/*` requests route into `api/index.js`, which imports `src/server.cjs` and exports the Express app instance.

---

## 4. DATABASE CONNECTIVITY & NETWORK EGRESS AUDIT

### 4.1 Target MongoDB Atlas Cluster
- **Cluster Identifier**: `avani-loan-services-m0.xj6nhak.mongodb.net`
- **Cluster Tier**: Free M0 Sandbox (Shared AWS infrastructure)
- **Region**: `ap-south-1` (AWS Mumbai, India)
- **Authentication Database**: `admin`
- **Target Database**: `avani_loan_services_test` (Staging) / `avani_loan_services_prod` (Production)
- **Encryption**: TLS 1.2+ mandatory for all wire traffic.

### 4.2 Network Access & Ingress Mechanics
MongoDB Atlas restricts incoming connections via its **Network Access IP Access List**. Every inbound packet must originate from a CIDR block explicitly registered in the cluster firewall.

1. **Why Direct Vercel Connections Fail**:
   - Vercel serverless execution units run inside transient microVMs on AWS Lambda.
   - The outbound IP address for each execution is assigned dynamically from AWS's massive public IP range (hundreds of thousands of rotating addresses in `ap-south-1`).
   - Consequently, when Vercel attempts a TCP handshake to `avani-loan-services-m0.xj6nhak.mongodb.net:27017`, the connection is rejected at the Atlas firewall.
2. **Why `0.0.0.0/0` is Unacceptable**:
   - Opening Atlas to `0.0.0.0/0` (Anywhere) allows brute-force attacks and vulnerability scanning from any internet host.
   - For a financial consultancy and loan advisory firm handling corporate balance sheets, promoter PANs, RERA audit records, and institutional credit profiles, `0.0.0.0/0` violates basic security standards, ISO 27001 recommendations, and DPDP Act 2023 reasonable security safeguards.
3. **Atlas Free M0 Limitations**:
   - Atlas Free Tier (M0) does **not** support AWS VPC Peering or AWS PrivateLink (these require Dedicated M10+ instances).
   - Atlas Free Tier (M0) does **not** support custom firewall rules beyond IP Access List entries.

---

## 5. ENVIRONMENT VARIABLE & CONFIGURATION PARITY AUDIT

| Variable Name | Local (`.env`) | Vercel Preview | Vercel Production | Risk & Parity Assessment |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` / `test` | `production` | `production` | Parity verified. Strict production rules apply on Vercel. |
| `APP_MODE` | `test` / `development` | `staging` | `production` | Controls provider mocks and validation guards. |
| `PROVIDER_MODE` | `mock` | `mock` | `mock` (Mandatory) | Enforces zero real outbound marketing sends. |
| `MONGODB_URI` | In-memory / localhost | Blocked (Egress) | Blocked (Egress) | **CRITICAL GAP**: Missing static egress route to Atlas. |
| `PORTAL_JWT_SECRET` | System Fallback | Configured | Configured | Cryptographic JWT signing key. |
| `ADMIN_INITIAL_PASSWORD` | `.secret` handoff file | Environment variable | Environment variable | Rotated in Phase 5.1; purged from Git tracking. |
| `CALCULATOR_ACCESS_PASSWORD` | Legacy string | Environment variable | Environment variable | Legacy calculator gate password; isolated from portal. |

---

## 6. AUDIT CONCLUSION & READINESS STATUS

| Inspection Area | Status | Critical Detail |
| :--- | :---: | :--- |
| Git Branch & Working Tree | **PASS** | Clean branch `master`, tracking `origin/master`, zero unpushed commits. |
| Source Code Hygiene | **PASS** | Secrets sanitized; credentials stored in `.secret` untracked files. |
| Server Architecture | **PASS** | Express 5.2.1 routes cleanly integrated for both local and serverless. |
| Atlas Network Egress | **BLOCKED** | Vercel dynamic IP pool incompatible with Atlas IP Access List. |
| Production Persistence | **BLOCKED** | Read-only serverless filesystem cannot persist local JSON; Atlas required. |

**OVERALL ARCHITECTURAL GATE: BLOCKED PENDING SECURE EGRESS PROVISIONING.**
