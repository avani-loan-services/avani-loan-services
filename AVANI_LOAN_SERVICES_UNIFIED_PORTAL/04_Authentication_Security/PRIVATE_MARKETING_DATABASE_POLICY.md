# AVANI LOAN SERVICES — PRIVATE MARKETING DATABASE POLICY
## Governance, Authorized Usage, Security Controls & Compliance Architecture

**Document Version:** 1.0.0  
**Effective Date:** November 03, 2026  
**Jurisdiction / Standard:** Digital Personal Data Protection Act (DPDP), Meta Commercial Communications Policies, TRAI / DLT Guidelines  
**Classification:** STRICTLY CONFIDENTIAL — APPROVED AVANI LOAN SERVICES ADMINISTRATORS ONLY  
**Project:** AVANI LOAN SERVICES Unified Business Growth & Lead Management Portal  
**Target Domain:** `https://www.avanifinserv.com/`  

---

## 1. PURPOSE & PRINCIPLES

### 1.1 Exclusive Business Purpose
The AVANI LOAN SERVICES Private Marketing Database is maintained exclusively for:
1. **Module A — Residential Builder Partnerships:** Initiating and nurturing project loan and home loan tie-up alliances with registered Maharashtra real estate developers.
2. **Module B — Educational Institutional Funding:** Facilitating educational infrastructure financing, working capital lines, equipment leasing, and institutional expansion credit for eligible schools, colleges, universities, and educational trusts across India.

### 1.2 Prohibited Use & Strict Isolation Invariant
- **Zero Cross-Entity Sharing:** No data, contacts, financial metrics, or campaign records from this system may be shared with, accessed by, or utilized for *AVANI AGRO FOODS*, *OMNIVA*, or any third-party business entity.
- **Zero Data Resale:** Under no circumstances shall contact records, mobile numbers, email addresses, or financial data be sold, rented, leased, licensed, or distributed to third-party lead aggregators or brokers.
- **Strict Commercial Purpose:** All contacts must be engaged strictly in relation to legitimate institutional and commercial financing advisory services offered directly by AVANI LOAN SERVICES.

---

## 2. AUTHORIZED USERS & ACCESS GOVERNANCE

### 2.1 Authorized User Roles
Access to the Private Marketing Database is restricted strictly to verified and approved AVANI LOAN SERVICES administrators:

| Role Code | Operational Scope | Authorized Permissions |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Executive Management | Full platform control: User management, emergency STOP, policy configuration, audit log inspection, and export approvals. |
| `ADMIN` | Senior Finance / Operations | Lead review, stage transitions, campaign scheduling, consent validation, and pipeline tracking. |
| `RESEARCH_ANALYST` | Market Research Desk | Builder MahaRERA verification, qualification score adjustment, institution profile enrichment. *(No bulk export permissions)*. |
| `OUTREACH_MANAGER` | Direct Client Relations | Follow-up call logging, meeting scheduling, and individual approved communications. |

### 2.2 Server-Side Authentication & Session Controls
1. **Server-Side Authentication:** All portal routes (`/api/portal/*`) enforce server-side validation via [`portalAuthMiddleware.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/middleware/portalAuthMiddleware.cjs). Unauthenticated or forged requests are rejected with `HTTP 401 Unauthorized`.
2. **Cryptographic JWT:** Sessions utilize signed JSON Web Tokens (`jwt`) with an 8-hour maximum lifetime.
3. **Bcrypt Password Storage:** Passwords are never stored in plaintext. Passwords use bcrypt with 10–12 salt rounds (`$2b$10$...`).
4. **Enforced Credential Rotation:** Temporary administrative credentials flag `mustChangePassword: true`, requiring mandatory rotation before operational access.
5. **Brute-Force Shielding:** Express-rate-limit enforces a maximum of 5 login attempts per 15-minute window per IP address, with automatic 15-minute account lockout upon consecutive failures.

---

## 3. APPROVED ACTIVITIES & OPERATIONAL WORKFLOWS

Administrators are authorized to conduct only the following 5 distinct operational activities:

### Activity 1: Builder-Related WhatsApp Marketing
- Direct, personalized WhatsApp communication to verified decision-makers (Managing Directors, Promoters, Sales Heads) of verified residential developers.
- Use only pre-approved transactional and alliance proposal templates adhering to WhatsApp Business API guidelines.
- Mandatory MahaRERA verification prior to initiating outbound outreach.

### Activity 2: Educational Institution Funding-Related WhatsApp Marketing
- Direct outreach to authorized educational trustees, directors, and financial controllers regarding institutional funding products (12 structured credit categories).
- Strict adherence to ticket sizes (₹5 Cr to ₹100+ Cr) and verified institutional eligibility criteria.

### Activity 3: Relevant Meta Ads Campaigns & Eligible Audience Management
- Creation and curation of custom audiences and lookalike segments for targeted B2B Meta Ads campaigns.
- Audience selection must be grounded strictly in verified qualification scoring (e.g., Priority A+ educational institutions with scores $\ge 90/100$, verified builders with active MahaRERA registrations).
- All ad copy must comply with Meta Financial Products and Services Advertising Policies.

### Activity 4: Contact Segmentation, Campaign Preparation & Follow-Up Tracking
- Multi-dimensional segmentation across:
  - Geography: Top Maharashtra municipal corporations (Mumbai, Pune, Nagpur, Nashik, Thane, Chhatrapati Sambhajinagar, etc.).
  - Builder Scale: Project count, active units, qualification tier.
  - Institution Category: Medical colleges, engineering universities, K-12 school chains, standalone trusts.
- Structured follow-up cadence scheduling (e.g., Day 2, Day 5, Day 10, Day 15 business days).

### Activity 5: Consent Verification, Opt-Out Management & Campaign Reporting
- Mandatory pre-consent opt-in validation before adding any contact to an active messaging queue.
- Real-time logging of opt-out / suppression requests (Immediate halt on all subsequent outreach).
- Comprehensive campaign delivery, read, and conversion reporting.

---

## 4. SECURITY & DATA PROTECTION CONTROLS

### 4.1 Restricted Data Exports
- Bulk exports (XLSX / CSV) are strictly restricted to authenticated administrators and audited in real time.
- Every export event writes an immutable audit record: timestamp, operator user ID, IP address, query filters, and total record count.
- Unauthorized export attempts or automated scraping triggers immediate session revocation and security alerting.

### 4.2 Comprehensive Audit Logging
Every action within the portal is immutably logged in `portal_admin_audit_logs`:
- Timestamp (ISO 8601 UTC)
- Operator Identifier (`user_id`, username)
- Operation Category (`AUTH`, `BUILDER`, `EDUCATION`, `CAMPAIGN`, `EXPORT`, `EMERGENCY_STOP`)
- Details Payload (Record IDs, before/after values)
- Client IP Address and User-Agent

### 4.3 Zero Public Access & Search Engine Crawler Shielding
1. **Dynamic Robots Tag:** [`UnifiedAdminPortal.jsx`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/UnifiedAdminPortal.jsx) dynamically injects `<meta name="robots" content="noindex, nofollow" />` upon loading.
2. **Robots.txt Enclosure:** [`public/robots.txt`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/public/robots.txt) explicitly specifies:
   ```txt
   User-agent: *
   Disallow: /admin/
   Disallow: /api/
   Allow: /
   ```
3. **Sitemap Exclusion:** `/admin` and `/api` routes are excluded from [`public/sitemap.xml`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/public/sitemap.xml).
4. **Footer Link Safety:** Link to `/admin/login` in [`Footer.jsx`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/components/Footer.jsx) carries `rel="nofollow"`.

### 4.4 Encrypted Transport & Restricted Database Access
- **Encrypted Transport:** Enforced HTTPS / TLS 1.3 across all communication channels.
- **Restricted Database Access:** Target MongoDB Atlas cluster (`avani-loan-services-m0.xj6nhak.mongodb.net`) strictly rejects unauthorized IPs.
- **Zero 0.0.0.0/0 Rule:** The Atlas IP Access List must NEVER be configured with `0.0.0.0/0`. Only a dedicated `/32` static outbound IPv4 address is permitted.
- **Fail-Safe Storage Guard:** In production mode (`NODE_ENV === 'production'`), any write operation attempted while MongoDB is disconnected throws an explicit `HTTP 503 Service Unavailable`, preventing volatile in-memory fallback and silent data loss.

---

## 5. MARKETING RESTRICTION & COMPLIANCE ENFORCEMENT

```
========================================================================================
                             MARKETING RESTRICTION NOTICE
                             
     NO PROMOTIONAL COMMUNICATION OR ADVERTISING-AUDIENCE UPLOAD IS PERMITTED
       WITHOUT EXPLICIT LEGAL BASIS, VERIFIED PERMISSIONS & PLATFORM COMPLIANCE
========================================================================================
```

### 5.1 Mandatory Pre-Requisites for Campaign Execution
Before any promotional communication or audience upload is initiated:
1. **Consent Verification:** Verify that the recipient has an active, valid consent record in `portal_education_consent_records` or an established commercial inquiry relationship.
2. **Suppression Check:** Confirm that the recipient does NOT exist in the opt-out / DND suppression register.
3. **Template Pre-Approval:** Ensure all WhatsApp message templates are approved by Meta and registered on DLT where required.
4. **Emergency STOP Check:** The system verifies that `system_automation_state.emergencyStopActive === false` and `outboundMessagingHalted === false`. If the emergency switch is active, all outbound messaging queues are completely frozen.

---

## 6. PRODUCTION STABILITY & WEBSITE PRESERVATION RULE

### 6.1 Strict Preservation of Existing Production Website
In compliance with the mandatory Production Rule:
> *"Preserve the existing live website until the database, authentication, backup, migration and cloud-persistence tests have passed."*

- The live production website at [`https://www.avanifinserv.com/`](https://www.avanifinserv.com/) is currently preserved, stable, and active.
- The Unified Portal code and container configurations are fully staged, committed ([`3db48de`](https://github.com/avani-loan-services/avani-loan-services/commit/3db48de)), and verified locally.
- **Release Status:** Maintained as **NO-GO** at the release gate until Fly.io dedicated outbound IPv4 allocation and MongoDB Atlas `/32` IP whitelisting are completed.
- This ensures zero disruption to live loan calculators, customer inquiry flows, and public SEO visibility.

---

## 7. POLICY ADOPTION & ENFORCEMENT

This policy is enacted into the AVANI LOAN SERVICES software codebase and operational runtime:
- **Enforcing Middleware:** [`src/middleware/portalAuthMiddleware.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/middleware/portalAuthMiddleware.cjs)
- **Database Model Guard:** [`src/models/portalDatabase.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/models/portalDatabase.cjs)
- **Emergency Controller:** [`src/routes/unifiedPortalRoutes.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/routes/unifiedPortalRoutes.cjs)
- **Frontend Safeguards:** [`src/pages/UnifiedAdminPortal.jsx`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/UnifiedAdminPortal.jsx)
