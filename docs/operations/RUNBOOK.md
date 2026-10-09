# AVANI LOAN SERVICES — SYSTEM OPERATIONAL RUNBOOK

**Document ID:** `ALS-DOC-RUNBOOK-2026-001`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES  
**Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. Local Development & Testing Operations

### 1.1 Running the Frontend Development Server
```powershell
npm run dev
# Serves Vite SPA at http://localhost:5173/
```

### 1.2 Running the Backend Express Server
```powershell
node src/server.cjs
# Listens on port 5000 (http://localhost:5000/)
```

### 1.3 Running Autonomous Test Suites
```powershell
# 1. Master Autonomous Lending Test Suite (Unit, Integration, Security, Workflow, Calculators)
node scripts/runAllLendingTests.cjs

# 2. Master Production Forensic Validation Suite (E2E Marathi Doctor & CRM Idempotency)
node scripts/runForensicValidation.cjs

# 3. Master 20 Financial Tools Test Matrix (206 specs)
node scripts/testMasterFinancialTools.cjs
```

### 1.4 Production Build Verification
```powershell
npm run build
# Executes link injector, generates service sitemaps, and compiles Vite production bundle into dist/
```

---

## 2. Infrastructure Operations (Docker Compose)

### 2.1 Starting the Production Stack
```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```
Services initialized:
- `avani_postgres`: PostgreSQL 16 on port 5432
- `avani_redis`: Redis 7 on port 6379
- `avani_n8n`: n8n Workflow Engine (Queue Mode) on port 5678
- `avani_n8n_worker`: Dedicated background worker for asynchronous jobs
- `avani_lending_api`: Hardened Node.js API on port 5000
- `avani_nginx_gateway`: Reverse proxy on ports 80/443

---

## 3. Incident Management & DLQ Triage

### 3.1 Dead Letter Queue (DLQ) Inspection
When third-party webhooks (Meta, HubSpot, Bureau) fail after retries, messages enter `apps/integration-gateway/` DLQ.
1. Inspect queued items: `GET /api/dlq/pending`
2. Review the logged error message and correlation ID.
3. Once the downstream provider recovers, trigger replay:
   `POST /api/dlq/replay` with `{ "dlqId": "DLQ-XXXX" }`
4. Note: Poisoned messages that fail 3 replay attempts are permanently quarantined to prevent infinite retry storms.

### 3.2 Human Escalation Protocol
If an applicant encounters a complex loan requirement or an automated telecall requests human assistance:
- **Designated Underwriting Lead:** Sachin Shinde
- **Direct Escalation Phone:** `+917249108474`
- **Official Email:** `sachin@avanifinserv.com`
- **Fallback Rule:** All AI autonomous sanctioning is disabled by architecture; human review is mandatory.
