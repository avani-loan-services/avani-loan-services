# AVANI LOAN SERVICES — PHASE 5.3.7
## GENUINE ₹0 COMMERCIAL PRODUCTION ARCHITECTURE & HOSTING COMPARISON

- **Project:** AVANI LOAN SERVICES Unified Business Growth & Lead Management Portal
- **Financial Constraint:** Strictly **₹0.00 / $0.00 recurring monthly infrastructure cost**, indefinitely.
- **Commercial Policy Requirement:** All hosting tiers must legally permit commercial / enterprise business activities under their published Terms of Service.
- **Date & Timestamp:** 2026-11-03 19:30 IST

---

### 1. FORMAL CORRECTION: THE VERCEL HOBBY RESTRICTION

In the Phase 5.3.6 audit, Vercel Hobby was mentioned as a potential host for the production portal frontend. **This proposal is formally retracted and corrected**:

- **Legal Constraint:** Section 4.1 of the [Vercel Terms of Service](https://vercel.com/legal/terms) explicitly mandates:
  > *"The Hobby plan is for personal, non-commercial use only."*
- **Application Context:** AVANI LOAN SERVICES is an active commercial financial intermediary managing builder partnerships, educational institution loan distributions, and lead intelligence. Hosting commercial portals on Vercel Hobby violates Vercel terms and exposes the organization to account suspension or forced billing upgrades to Vercel Pro ($20/seat/month).
- **Public Website Preservation:** The live public consumer website at `https://www.avanifinserv.com/` remains untouched and active.
- **Approved Commercial Zero-Cost Alternatives for Portal Frontend:**
  1. **Option 1: Static Serving Directly from Node.js Express Backend (Recommended):**
     [`src/server.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/server.cjs#L36-L118) is already configured to serve the Vite production build (`dist/index.html` and assets). When deployed on an eligible Always Free VM or server, frontend and backend are served together on `portal.avanifinserv.com` with zero extra moving parts, zero extra cost, and zero commercial licensing restrictions.
  2. **Option 2: Cloudflare Pages (Free Plan):**
     Unlike Vercel, [Cloudflare Pages Free](https://www.cloudflare.com/plans/) **explicitly permits commercial use**. It provides 500 builds/month, unlimited bandwidth, edge caching, and free SSL on custom domains at ₹0.00 recurring cost.

---

### 2. COMPREHENSIVE ARCHITECTURAL COMPARISON

| Architecture Option | Compute & Runtime | Static Outbound IPv4 for Atlas /32 | Inbound Domain & TLS | Commercial Use Permitted? | Real Recurring Monthly Cost | Key Operational Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Option A: Oracle Cloud Always Free VM** | 1/8 OCPU AMD or up to 4 OCPU Ampere A1, 1-24 GB RAM | **1 Reserved Public Static IPv4 included FREE** | Cloudflare DNS + Universal SSL / Let's Encrypt | **YES** (Permitted in OCI terms) | **₹0.00** | Instance reclamation if idle (<20% CPU/RAM for 7 days); card needed for sign-up |
| **Option B: Office Server + Cloudflare Tunnel** | Local PC/Server (Node.js 18+ LTS) | **UNSTABLE (Dynamic CGNAT IP rotates frequently)** | Cloudflare Argo Tunnel (zero open ports) | **YES** (Owned hardware) | **₹0.00** | Atlas /32 connection breaks on ISP IP rotation; local power/internet outages |
| **Option C: Fly.io Trial** | Shared Micro VM | **DISQUALIFIED ($2/mo dedicated IPv4 fee)** | Fly Anycast SSL | **YES** | **₹168+/mo ($2/mo)** | **DISQUALIFIED (Violates ₹0 mandate)** |
| **Option D: Render** | Prohibited | Prohibited | Prohibited | **NO** | **DISQUALIFIED** | **STRICTLY PROHIBITED BY POLICY** |

---

### 3. DEEP-DIVE: OPTION A (ORACLE CLOUD ALWAYS FREE)

#### Official Free Tier Specifications
- **Compute:** Up to 2 AMD-based Compute VMs (1/8 OCPU, 1 GB RAM each) OR up to 4 OCPUs and 24 GB RAM Ampere A1 (ARM64).
- **Public IPv4 Allocation:** **1 Ephemeral or Reserved Static Public IPv4 is included 100% FREE** with each active compute instance. Because this IP remains fixed for the lifetime of the VM, it provides the required unchanging `/32` IP address for MongoDB Atlas Network Access.
- **Outbound Data Transfer:** 10 TB/month free egress included.
- **Storage:** Up to 200 GB total Block/Boot volume storage is Always Free.

#### Limitations & Risk Mitigation
1. **Idle Reclamation Rule:**
   - *Clause:* Oracle automatically flags and reclaims Always Free compute instances that average < 20% CPU, < 20% RAM, and < 20% network utilization over a 7-day window.
   - *Remediation:* A lightweight background system telemetry worker running periodic health checks and scheduled synchronization tasks maintains active utilization safely above thresholds.
2. **Identity Verification Card Hold:**
   - *Clause:* Oracle requires a credit or debit card during registration to verify user identity. A temporary $1-2 hold is placed and immediately reversed.
   - *Constraint:* If the owner strictly refuses to authorize an identity verification hold, Option A cannot be provisioned.
3. **Regional Capacity Fluctuations:**
   - *Clause:* High-demand regions (e.g., Mumbai, Ashburn) occasionally experience transient capacity constraints for Ampere A1 ARM shapes.
   - *Remediation:* Standard AMD Micro shapes (VM.Standard.E2.1.Micro) possess high availability and are more than sufficient to serve the 670-record portal.

---

### 4. DEEP-DIVE: OPTION B (OFFICE SERVER + CLOUDFLARE TUNNEL)

#### Technical Capabilities
- **Inbound Security:** Cloudflare Tunnel (`cloudflared`) establishes outbound HTTPS connections to Cloudflare edge nodes. The server can receive traffic on `https://api.avanifinserv.com` without opening any incoming ports on the office router.
- **Zero Cloud Cost:** Utilizes existing on-premise hardware with zero infrastructure billing.

#### The Atlas Outbound IP Blocker
- While Cloudflare Tunnel solves *inbound* access, outbound traffic from the Node.js application to MongoDB Atlas bypasses Cloudflare and routes through the local office ISP gateway.
- Residential and business broadband providers in India (Jio, Airtel, local fiber) utilize Dynamic IP with Carrier-Grade NAT (CGNAT).
- In our live testing, the host IP rotated from `106.220.188.157` to `110.227.23.32`.
- Because MongoDB Atlas enforces strict `/32` allowlisting and forbids `0.0.0.0/0`, every ISP IP change instantly terminates database connectivity with `MongoServerSelectionError`.
- **Verdict on Option B:** Cannot be declared production-ready for MongoDB Atlas unless paired with a fixed ISP static IP add-on (which costs ~₹200-300/month, violating the ₹0 constraint) or an automated dynamic Atlas API updater.

---

### 5. RESOURCE-BY-RESOURCE COST AUDIT

| Service Component | Active Tier | Monthly Cost (USD) | Monthly Cost (INR) | Free Quota / Limits | Commercial Policy Compliance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MongoDB Atlas M0** | Free M0 Sandbox | $0.00 | ₹0.00 | 512 MB, 500 connections | 100% Permitted |
| **Cloudflare Edge & DNS** | Free Plan | $0.00 | ₹0.00 | Unlimited DNS & DDoS | 100% Permitted |
| **Cloudflare Tunnels** | Free Zero Trust | $0.00 | ₹0.00 | 50 Active Tunnels | 100% Permitted |
| **Cloudflare Pages** | Free Plan | $0.00 | ₹0.00 | 500 builds/mo, unlimited traffic | 100% Permitted |
| **OCI Compute & Static IP**| Always Free | $0.00 | ₹0.00 | 1 VM, 1 Static IPv4, 10 TB egress | 100% Permitted |
| **GitHub Actions / Repo** | Free Tier | $0.00 | ₹0.00 | 2,000 CI minutes, 1 GB storage | 100% Permitted |
| **TOTAL RECURRING COMMITMENT** | — | **$0.00** | **₹0.00** | **Strictly Zero Cost** | **100% COMPLIANT** |

---

### 6. VERIFIED FACTS vs. UNVERIFIED CLAIMS

| Dimension | Classification | Detailed Evidence |
| :--- | :--- | :--- |
| **Fly.io Outbound IP Cost** | **VERIFIED FACT** | `fly ips allocate-v4` failed with explicit message: "Dedicated IPv4 addresses now cost $2/mo. You are on the $1 trial. Add a credit card." Disqualified. |
| **OCI Always Free 1 Static IP**| **VERIFIED FACT** | Oracle documentation confirms 1 reserved public IPv4 is included free per running compute instance. |
| **Vercel Hobby Commercial Use**| **VERIFIED FACT** | Vercel ToS Section 4.1 forbids commercial applications on Hobby accounts. Retracted from production recommendation. |
| **Office Server Atlas Whitelist**| **VERIFIED FACT** | Dynamic ISP rotation breaks `/32` Atlas whitelist. Option B requires automation or static IP. |
| **Zero-Cost Deployment Live** | **UNVERIFIED CLAIM (REJECTED)**| No cloud VM is currently provisioned. Staging runs locally on development host. |
