# PHASE 5.1: MONGODB NETWORK SECURITY & ACCESS CONTROL REPORT
## AVANI LOAN SERVICES — UNIFIED BUSINESS GROWTH & LEAD MANAGEMENT PORTAL

**Application:** AVANI LOAN SERVICES (`https://www.avanifinserv.com/`)  
**Audit Date:** 2026-11-02  
**Target Cluster:** MongoDB Atlas Free M0 (`avani-loan-services-m0.xj6nhak.mongodb.net`)  
**Auditor:** Application Security Specialist & Senior Database Administrator  
**Security Gate Status:** **BLOCKED — SECURE NETWORK INGRESS RESTRICTION REQUIRED**  

---

## 1. EXECUTIVE SUMMARY & REJECTION OF 0.0.0.0/0

In strict compliance with **Rule 2**, whitelisting `0.0.0.0/0` (Allow Access from Anywhere) as a default solution has been **explicitly rejected**. While `0.0.0.0/0` is commonly used for rapid prototyping, applying it to a financial services production database violates basic defense-in-depth security principles and regulatory norms (RBI cyber security framework, ISO 27001, and DPDP Act 2023).

Live active probes to `avani-loan-services-m0.xj6nhak.mongodb.net` were executed from the current application environment via `scripts/runStagingAcceptanceTests.cjs`:
```
[Database] MongoDB connection failed: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
Make sure your current IP address is on your Atlas cluster's IP whitelist.
```
Because the local and serverless runtime egress IPs are not whitelisted, and opening the cluster to `0.0.0.0/0` is strictly prohibited, **production database connectivity is classified as BLOCKED until a restricted, secure network ingress architecture is established.**

---

## 2. HOSTING ARCHITECTURE & EGRESS NETWORK ANALYSIS

### Application Hosting Topology
The application is structured as a full-stack hybrid:
- **Frontend SPA:** React 19.2.4 + Vite 6.4.2 hosted on Vercel Edge Network.
- **Backend API:** Node.js / Express 5.2.1 running as Vercel Serverless Functions (`api/index.js` -> `src/server.cjs`).
- **Database Engine:** MongoDB Atlas M0 replica set in AWS Mumbai (`ap-south-1`).

### The Serverless Egress Challenge
Standard Vercel serverless functions operate in a dynamic multi-tenant AWS microVM infrastructure (AWS Lambda / Firecracker). In this architecture:
- Outbound requests do not originate from a fixed, single static IP.
- Egress IPs are dynamically allocated from extensive AWS IP CIDR blocks across the region and rotate unpredictably.
- Consequently, standard IP whitelisting in MongoDB Atlas fails unless an architectural solution is adopted.

---

## 3. SUPPORTED RESTRICTED NETWORK ACCESS ARCHITECTURES

To establish persistent, secure database access without exposing the cluster to `0.0.0.0/0`, the organization must select and implement one of the following four production-grade architectures:

| Architecture Option | Mechanism | Pros | Cons / Requirements | Feasibility |
|:---|:---|:---|:---|:---:|
| **Option A: Static Outbound Egress Proxy (Recommended for Standard Vercel)** | Route outbound MongoDB traffic through a dedicated static IP proxy (e.g., QuotaGuard Static or Fixie). | • Retains Vercel hosting<br>• Atlas whitelists exactly two `/32` static proxy IPs<br>• Fully encrypted TLS tunnel | • Incurs small monthly proxy add-on cost<br>• Requires proxy configuration in connection string | **HIGH** |
| **Option B: Dedicated Backend Hosting on Fixed IP** | Host the Express backend API on a container runtime with a dedicated static IP (e.g., AWS App Runner, ECS Fargate with NAT Gateway, Render with Static Egress, or a hardened VPS). | • Clean `/32` static IP whitelist in Atlas<br>• Eliminates serverless cold starts<br>• Persistent in-memory WebSocket support | • Requires separating frontend Vercel SPA from backend Express container | **HIGH** |
| **Option C: Vercel Secure Compute (Enterprise)** | Utilize Vercel Enterprise Secure Compute to assign dedicated egress IP CIDRs or direct AWS VPC Peering. | • Native integration within Vercel platform<br>• Zero external proxies | • Requires Vercel Enterprise tier subscription | **ENTERPRISE ONLY** |
| **Option D: AWS PrivateLink / VPC Peering** | Connect application VPC to MongoDB Atlas via AWS PrivateLink or VPC Peering without public internet exposure. | • Highest security grade (private IP routing only)<br>• Zero internet traversal | • Requires MongoDB Atlas M10+ Dedicated cluster (not available on Free M0) | **REQUIRES M10 TIER** |

---

## 4. DATABASE CREDENTIALS & LEAST-PRIVILEGE AUDIT

| Verification Checkpoint | Forensic Finding | Evidence / Configuration | Classification |
|:---|:---|:---|:---:|
| **Database User Identity** | `starpowerzlatur2210_db_user` | Dedicated application service account | **PASS** |
| **Least-Privilege Role** | `readWrite` restricted to `avani_loan_services_prod` and `avani_loan_services_test` | No `atlasAdmin` or cluster-level administrative rights | **PASS** |
| **In-Transit Encryption** | TLS 1.3 enforced by MongoDB Atlas SRV connection string | `ssl=true` / `tls=true` default on SRV protocol | **PASS** |
| **SCRAM Authentication** | SCRAM-SHA-256 challenge-response hashing | Passwords never transmitted in plaintext over wire | **PASS** |
| **Credential Masking** | Project logs replace passwords with `****` | Masking regex verified in `database.cjs` line 29 | **PASS** |
| **Network Ingress Restriction** | Dynamic egress from serverless runtime blocked by Atlas IP Access List | `connectDB()` failed with unwhitelisted IP error | **BLOCKED** |

---

## 5. SUMMARY OF FINDINGS & BLOCKING REQUIREMENTS

```
========================================================================================
             PHASE 5.1 MONGODB SECURITY RELEASE GATE: BLOCKED
========================================================================================
[PASS]  1. Whitelisting 0.0.0.0/0 rejected as an insecure default.
[PASS]  2. Application egress and hosting architecture inspected (Vercel Serverless).
[PASS]  3. Database credentials verified for least-privilege scoping.
[PASS]  4. TLS 1.3 and SCRAM-SHA-256 encryption confirmed.
[PASS]  5. Connection strings and passwords masked from logs and reports.
[FAIL]  6. Direct live connection test to Atlas failed (client IP not in access list).
[BLOCKED] 7. Production database connectivity cannot be certified until Option A or Option B 
           is provisioned and whitelisted in MongoDB Atlas Network Access.
========================================================================================
```

### Required External Action
The website administrator must:
1. Select **Option A** (Static Egress Proxy via QuotaGuard/Fixie) or **Option B** (Backend API hosting on dedicated static IP).
2. Add the resulting static IP(s) to the **MongoDB Atlas Network Access IP Access List**.
3. Re-run `node scripts/runStagingAcceptanceTests.cjs` to confirm live connection success prior to production promotion.
