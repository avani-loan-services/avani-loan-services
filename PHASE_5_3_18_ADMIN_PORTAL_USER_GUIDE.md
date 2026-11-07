# AVANI LOAN SERVICES — PHASE 5.3.18 ADMIN PORTAL USER GUIDE
**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Target URL:** https://www.avanifinserv.com/admin  
**Release Date:** 2026-11-07  
**Batch ID:** `BATCH-20261107-P5318`

---

## 1. ACCESS & AUTHENTICATION

### 1.1 Portal URL
Navigate in any modern web browser (Chrome, Edge, Safari, Firefox) to:
```
https://www.avanifinserv.com/admin
```
*(Note: Direct navigation to `/admin` renders the secure login screen. The portal automatically enforces `noindex, nofollow` to prevent search engine indexing.)*

### 1.2 Administrative Login
1. Enter your assigned administrative **Username** (`admin`).
2. Enter your secure administrator password (as recorded in the credential handoff secret).
3. Click **Sign In to Unified Portal**.
4. Upon successful authentication, an HTTP-only secure session cookie (`avani_portal_token`) is issued with an 8-hour validity period.

---

## 2. THE THREE CORE ENTERPRISE DATABASES

The portal provides 3 distinct, fully functional databases in the primary sidebar navigation:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏢 1. BUILDER DATABASE (80 Records)                          │
│ 🎓 2. SCHOOL FUNDING DATABASE (24 Records)                   │
│ 🏛️ 3. COLLEGE & UNIVERSITY FUNDING DATABASE (56 Records)     │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.1 DATABASE 1: BUILDER PARTNERSHIP DATABASE (80 RECORDS)
- **Target Audience:** Top Maharashtra Residential Real Estate Developers (Mumbai MMR, Pune, Nashik, Nagpur, Aurangabad).
- **Subviews Bar:**
  - **All Builders (80):** Full enterprise directory.
  - **Residential Focus (80):** Developers with active RERA-registered housing projects.
  - **With Contacts (80):** Verified corporate and site office phone/email channels.
  - **Decision Makers (80):** Identified Managing Directors, CEOs, and Promoters.
  - **Active Pipeline:** Track active discussions across 19 deal stages.
- **Search & Filters:** Real-time search by company name, brand name, city, or builder ID.
- **Interactive Detail Drawer:** Click **View** on any builder card/row to slide out the detailed drawer:
  - **Direct WhatsApp Channel:** Click the green **Open WhatsApp Direct Channel** button to initiate communication instantly.
  - **MahaRERA Evidence:** Clickable link verifying active project registration on the official MahaRERA portal.
  - **7-Factor Score Breakdown:** View exact points earned across Company Identity, Project Scale, RERA Compliance, Contacts, Decision Maker, and Partnership Fit.
- **Excel Export:** Click **Export Builders XLSX** in the top right to download `Builder_Master_Database.xlsx`.

---

### 2.2 DATABASE 2: SCHOOL FUNDING DATABASE (24 RECORDS)
- **Target Audience:** K-12 School Groups, Boarding Schools, and Educational Trusts.
- **Subviews Bar:**
  - **All Schools (24):** Complete school sector targets.
  - **School Groups (23):** Multi-branch educational networks.
  - **Educational Trusts (24):** Registered public charitable trusts and societies.
  - **Active Prospects (24):** High-priority institutions with active capital expenditure needs.
- **Interactive Detail Drawer:** Click **View** on any school record:
  - **Leadership Governance Roster:** View Chairman/President name, direct contact phone, Secretary, Principal, and Finance Head.
  - **Institutional Lending Intelligence:** View Potential Borrowing Capacity (e.g., ₹5 Cr - ₹10 Cr), Secured Loan Against Property (LAP) potential, and Unsecured Overdraft (OD) limit.
  - **Collateral & Expansion Plans:** View campus real estate details, student capacity estimates, and modernization goals.
- **Excel Export:** Click **Export Schools XLSX** to download `School_Funding_Database_Master.xlsx`.

---

### 2.3 DATABASE 3: COLLEGE & UNIVERSITY FUNDING DATABASE (56 RECORDS)
- **Target Audience:** Higher Education Institutions across India (Engineering, Medical, Deemed & Autonomous Universities).
- **Subviews Bar:**
  - **All Higher Ed (56):** Complete higher education portfolio.
  - **Engineering Colleges (50):** Autonomous and accredited engineering faculties.
  - **Medical Colleges & Hospitals (22):** Medical colleges and teaching hospital institutions.
  - **Autonomous Institutions (19):** Autonomous degree-granting institutes.
  - **Deemed Universities (14):** Private and deemed university campuses.
- **Interactive Detail Drawer:** Click **View** on any higher education campus:
  - **Leadership Governance:** Chancellor, Chairman, Managing Trustee, Dean, and Finance Head rosters.
  - **Capital Financing Solutions:** Potential borrowing capacity, multi-acre freehold campus land collateral, and expansion Capex plans.
- **Excel Export:** Click **Export Colleges XLSX** to download `College_University_Funding_Master.xlsx`.

---

## 3. ADMINISTRATIVE GOVERNANCE & SAFETY CONTROLS

### 3.1 Emergency STOP Mechanism
- Located in the top header bar next to the user profile badge.
- **Red Alert Indicator:** Displays current automation status (`MOCK PROVIDER ACTIVE`).
- **Emergency Action:** In any unexpected operational scenario, clicking **Emergency STOP** instantly pauses all scheduled tasks, follow-up automations, and batch operations.

### 3.2 Audit Logging & History
- Navigate to the **Audit Logs** tab in the sidebar to review an immutable chronological ledger of all administrative actions (logins, password rotations, pipeline changes, Excel exports, and data imports).

---

## 4. BEST PRACTICES & SUMMARY

1. **Always Verify Contact Consent:** Before initiating commercial proposals, check the institution's consent status in the drawer.
2. **Use Dedicated Exports:** Use `/api/portal/education/schools/export` for K-12 school campaigns and `/api/portal/education/colleges/export` for university infrastructure loans.
3. **Log Out Securely:** When finished with a session, click **Sign Out** in the sidebar to destroy the authentication session.
