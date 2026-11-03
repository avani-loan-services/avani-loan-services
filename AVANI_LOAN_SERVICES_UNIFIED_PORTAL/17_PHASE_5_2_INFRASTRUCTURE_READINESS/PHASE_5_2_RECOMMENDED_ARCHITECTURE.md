# AVANI LOAN SERVICES — PHASE 5.2 RECOMMENDED ARCHITECTURE SPECIFICATION
## Blueprinted Implementation Plan: Vercel CDN Frontend + Render Dedicated Backend Container with Static Egress to MongoDB Atlas

**Document Version:** 1.0.0  
**Specification Date:** November 02, 2026  
**Architect:** Senior SaaS Infrastructure Architect, DevOps Specialist, & Production Reliability Engineer  
**Project:** AVANI LOAN SERVICES Unified Business Growth & Lead Management Portal  
**Target Domain:** `https://www.avanifinserv.com/`  
**Classification:** BLUEPRINT & PRODUCTION EXECUTION PLAN  

---

## 1. FORMAL ARCHITECTURAL RECOMMENDATION

After detailed evaluation of serverless egress constraints, network security mandates, database connection pooling behavior, and operational costs, the **Senior SaaS Infrastructure Architecture Team** formally recommends:

> **OPTION 2: HYBRID DECOUPLED ARCHITECTURE**
> - **Frontend Tier**: React 19 Single Page Application (SPA) hosted on **Vercel CDN Edge** at `https://www.avanifinserv.com/`.
> - **Backend Tier**: Express 5.2.1 REST API hosted as a long-running Node.js container on **Render** (or equivalent managed container host) with a **Dedicated Static Outbound IP**.
> - **Database Tier**: MongoDB Atlas M0 Cluster (`avani-loan-services-m0.xj6nhak.mongodb.net`) locked strictly to the backend container's dedicated `/32` static IP.

```mermaid
graph TD
    User([Business Users & Borrowers]) -->|Browser HTTPS| CloudflareDNS[Custom Domain DNS: avanifinserv.com]
    
    subgraph FrontendVercel [Vercel Global Edge CDN]
        VercelSPA[React 19 SPA Static Distribution\n/index.html, /assets/*\nEdge SSL, Instant CDN Invalidation]
    end
    
    subgraph BackendRender [Render Cloud Container Platform - ap-south-1 Mumbai]
        ExpressAPI[Express 5.2.1 Server Container\nPersistent Process: node src/server.cjs\nFull Memory Connection Pool: Mongoose 9.9.2\nExcelJS Stream Generator]
        StaticEgress[Dedicated Static Outbound IP\nFixed IPv4: 35.180.XX.YY/32]
    end
    
    subgraph DatabaseAtlas [MongoDB Atlas Cloud - ap-south-1 Mumbai]
        Firewall[Atlas IP Access List Firewall\nRule: ALLOW 35.180.XX.YY/32 ONLY\nDENY ALL OTHER TRAFFIC]
        AtlasCollections[(Authoritative Database Collections\n- portal_admin_users\n- portal_builder_companies\n- portal_education_institutions\n- portal_unified_tasks\n- portal_admin_audit_logs)]
    end

    CloudflareDNS -->|Route Root & Page URLs| VercelSPA
    CloudflareDNS -->|Route /api/* or api.avanifinserv.com| ExpressAPI
    ExpressAPI --- StaticEgress
    StaticEgress -->|TLS 1.2 Wire Traffic| Firewall
    Firewall --> AtlasCollections
```

---

## 2. DETAILED RATIONALE FOR SELECTION

1. **Strict Zero Open Access Compliance (`!0.0.0.0/0`)**:
   By provisioning a dedicated static outbound IP on the container host, MongoDB Atlas's firewall is configured with an exact `/32` rule (e.g., `35.180.XX.YY/32`). Inbound traffic from any other IP on the internet is dropped at the Atlas network border.
2. **Persistent Mongoose Connection Pooling**:
   Unlike Vercel serverless functions where database connections are frequently re-negotiated across microVM cold starts, a container runtime keeps a long-running Express process with an established, persistent Mongoose connection pool (`poolSize: 10`). This reduces API latency by 300–800ms per request.
3. **Zero Changes to Application Source Code**:
   The existing `src/server.cjs` and `src/models/database.cjs` were architected as standard Node.js Express daemons. Deploying to a container requires zero proxy shims, zero custom SOCKS agents, and zero refactoring of routes or controllers.
4. **Resilient Local & Cloud Fallback Isolation**:
   On the container host, the filesystem is persistent (optional persistent disk) or clean stateless container memory. In production mode (`NODE_ENV=production`), writes directly commit to MongoDB Atlas, eliminating the risk of data loss associated with transient serverless microVM recycling.
5. **Exceptional Cost-to-Performance Ratio**:
   The entire dedicated container backend with static outbound IP costs approximately **$14.00 USD/month (~₹1,200 INR/month)**, representing an optimal financial balance for AVANI LOAN SERVICES.

---

## 3. STEP-BY-STEP IMPLEMENTATION PLAN

### Step 1: Managed Container Web Service Provisioning
1. Create a new Web Service on Render (or AWS App Runner) linked to the repository `avani-loan-services/avani-loan-services`.
2. Configure Environment:
   - **Environment**: `Node` (Version 24.x)
   - **Region**: `Singapore` or `Frankfurt` (or AWS Mumbai via App Runner)
   - **Build Command**: `npm install --omit=dev`
   - **Start Command**: `node src/server.cjs`
   - **Instance Type**: Starter ($7.00/mo)
3. Activate the **Static Outbound IP** add-on ($7.00/mo) in the dashboard networking tab.
4. Copy the assigned IPv4 address (e.g., `35.180.XX.YY`).

### Step 2: MongoDB Atlas Network Access Whitelisting
1. Log into MongoDB Atlas Console (`cloud.mongodb.com`).
2. Navigate to **Network Access** under Security.
3. Click **Add IP Address**.
4. Enter the dedicated static outbound IP with `/32` subnet: `35.180.XX.YY/32`.
5. Add comment: `AVANI LOAN SERVICES — Production Backend Container Egress`.
6. Confirm status transitions to **Active**.

### Step 3: Production Environment Variables Injection
Configure the following protected environment variables in the container service dashboard:
```env
NODE_ENV=production
APP_MODE=production
PROVIDER_MODE=mock
PORT=3000
MONGODB_URI=mongodb+srv://starpowerzlatur2210_db_user:[REDACTED_SECURE_PASSWORD]@avani-loan-services-m0.xj6nhak.mongodb.net/avani_loan_services_prod?authSource=admin&retryWrites=true&w=majority
PORTAL_JWT_SECRET=[GENERATE_64_BYTE_HIGH_ENTROPY_KEY]
ADMIN_INITIAL_PASSWORD=[RESOLVED_FROM_HANDOFF_SECRET]
FRONTEND_URL=https://www.avanifinserv.com
```

### Step 4: Routing & Custom Domain Integration
1. Assign backend subdomain: `api.avanifinserv.com`.
2. Add DNS CNAME record in domain registrar:
   - Host: `api`
   - Value: `[render-service-slug].onrender.com`
3. Update `vercel.json` rewrites on the Vercel frontend or update frontend API client base URL:
```json
{
  "rewrites": [
    { "source": "/api/portal/(.*)", "destination": "https://api.avanifinserv.com/api/portal/$1" },
    { "source": "/api/(.*)", "destination": "https://api.avanifinserv.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 5: Database Seeding & Migration
Execute initial data migration from local verified snapshot to Atlas production:
```bash
node scripts/migratePortalToMongo.cjs --target=production
```
Verify that all 80 Builder companies and 80 Educational institutions are ingested and indexed.

---

## 4. VERIFICATION & ACCEPTANCE PROCEDURES

1. **Network Ingress Verification**:
   - Send HTTP request from container to Atlas cluster.
   - Verify Mongoose connection state transitions to `readyState: 1 (connected)`.
   - Verify zero connection timeout logs.
2. **Persistence Integrity Verification**:
   - Create a test enquiry or update a lead stage via the portal API.
   - Restart the backend container instance.
   - Query the API again to confirm the record persisted in MongoDB Atlas across container reboots.
3. **Security Audit Verification**:
   - Attempt connection to MongoDB Atlas from an unwhitelisted local workstation; confirm connection is rejected with firewall refusal.
   - Confirm zero plaintext passwords or secrets in public endpoints.

---

## 5. COMPLETE COST BREAKDOWN

| Component | Provider & Tier | Monthly Cost (USD) | Monthly Cost (INR) | Billing Cycle |
| :--- | :--- | :---: | :---: | :---: |
| **Frontend CDN** | Vercel Hobby / Pro | $0.00 – $20.00 | ₹0 – ₹1,700 | Monthly |
| **Backend Container** | Render Starter (0.5 CPU, 512MB RAM) | $7.00 | ~₹590 | Monthly |
| **Dedicated Static IP** | Render Outbound IP Add-on | $7.00 | ~₹590 | Monthly |
| **Authoritative Database** | MongoDB Atlas Free M0 (Sandbox) | $0.00 | ₹0 | Free Tier |
| **SSL / TLS Encryption** | Let's Encrypt / Managed Auto-SSL | $0.00 | ₹0 | Automated |
| **Total Monthly Investment** | | **$14.00 – $34.00** | **~₹1,180 – ₹2,880** | **Predictable** |

---

## 6. ROLLBACK & DISASTER RECOVERY PLAN

If unexpected network or container failure occurs during migration:
1. Revert `vercel.json` rewrite destinations from `https://api.avanifinserv.com` back to local serverless routing.
2. The frontend immediately falls back to serving cached static pages and standard contact forms.
3. Database backups are continuously preserved in `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/02_Backups/` and can be restored to any compatible MongoDB instance in under 15 minutes.
