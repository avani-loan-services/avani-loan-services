# AVANI LOAN SERVICES — UNIFIED DASHBOARD SPECIFICATION & USER GUIDE

## 1. Executive Overview

The **AVANI LOAN SERVICES Unified Business Growth & Lead Management Portal** provides a consolidated, executive-grade operational cockpit for managing institutional partnerships and commercial financing across Maharashtra and Pan-India.

The centralized administrative dashboard is accessible at:
- **Portal Base Route:** `https://www.avanifinserv.com/admin/`
- **Dashboard Direct Route:** `https://www.avanifinserv.com/admin/dashboard`
- **API Surface:** `/api/portal/*`

The architecture enforces strict **data namespace separation** between two high-yield business lines:
1. **Module A (Builder Partnerships):** Maharashtra Residential Real Estate developers across 10 strategic cities, acquiring home-loan referral alliances under MahaRERA compliance.
2. **Module B (Education Funding):** Pan-India private schools, colleges, professional universities, and educational trusts seeking infrastructure, expansion, and LAP capital.

---

## 2. Navigation Architecture & 12 Specialized Sections

The admin dashboard features a responsive, high-contrast, dual-theme operational interface with 12 specialized navigation sections:

| # | Navigation Section | Target View / Component | Core Operational Capability |
|---|--------------------|-------------------------|-----------------------------|
| 1 | **Executive Overview** | `overview` | Real-time dual-module KPIs, sync status, high-level conversion rates, and quick action bar. |
| 2 | **Builder Database** | `builders` | Searchable directory of 80 verified Maharashtra developers with MahaRERA matching, confidence scores, and city filters. |
| 3 | **Builder Pipeline** | `builder-pipeline` | 19-stage partnership acquisition CRM with deal stage transition audits and assigned ownership. |
| 4 | **Builder Contacts & MahaRERA** | `builder-contacts` | Official corporate channels, department classifications (A, B, C, D), and verified MahaRERA project registers. |
| 5 | **Education Institutions** | `education-institutions` | Comprehensive directory of 80 educational institutions across 18 states with multi-campus and accreditation details. |
| 6 | **Priority A+ Prospects** | `education-aplus` | Curated cohort of 52 benchmark A+ institutional prospects scored across infrastructure capacity and funding readiness. |
| 7 | **Education Pipeline** | `education-pipeline` | 24-stage structured institutional funding CRM with ticket sizing and credit committee tracking. |
| 8 | **Funding Categories & Consent** | `education-consent` | 12 distinct credit products (School Infra, College Expansion, LAP) and DPDP-compliant consent ledger (Opt-in/Opt-out). |
| 9 | **Public Enquiry Manager** | `enquiries` | Live inbound triage for inbound `/builder-partnership` and `/institutional-funding` submissions with deduplication. |
| 10 | **Operational Task Centre** | `tasks` | Priority task queue with SLA indicators, scheduled follow-ups, and automated CRM action items. |
| 11 | **Campaigns & Outreach** | `campaigns` | Multi-channel communication templates (Email, WhatsApp, Phone), consent gating, and message approval triggers. |
| 12 | **Automation & Emergency STOP** | `automation` | Central cron controller, synchronization health, and instant outbound broadcast kill-switch. |

---

## 3. Top Navigation & Global Controls

### 3.1 Module Switcher Pill
Located prominently in the portal header, the **Module Switcher** allows operators to toggle visual focus:
- **ALL MODULES:** Displays aggregated operational telemetry and combined pending tasks.
- **BUILDER PARTNERSHIPS:** Filters dashboard KPIs, tasks, and alerts exclusively to Maharashtra residential real estate.
- **EDUCATION FUNDING:** Filters dashboard KPIs, tasks, and alerts exclusively to Pan-India educational institutions.

### 3.2 Live Database Synchronizer
- **Action:** Triggers `/api/portal/dashboard/sync` POST request.
- **Function:** Reconciles in-memory dataset states with physical JSON stores (`AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/*.json`), re-indexes search keys, and computes fresh KPI aggregations without requiring a server reboot.

### 3.3 Emergency STOP Switch
- **Visual State:** Bright Crimson / Amber status badge in the primary header.
- **Action:** Opens the Emergency STOP Modal to halt all outbound automated messaging instantly, or resume active operations under dual-confirmation safeguards.

---

## 4. Executive KPI Metrics Grid

The dashboard presents 8 real-time calculated business metrics:

```
+---------------------------+---------------------------+---------------------------+---------------------------+
| TOTAL BUILDERS            | PARTNERSHIP READY         | TOTAL INSTITUTIONS        | PRIORITY A+ PROSPECTS     |
| 80                        | 52                        | 80                        | 52                        |
| 10 Cities in Maharashtra  | High-Fit Referral Allian. | 18 States & UTs           | Score >= 85 (High Yield)  |
+---------------------------+---------------------------+---------------------------+---------------------------+
| PENDING INBOUND ENQUIRIES | ACTIVE CRM PIPELINE       | OVERDUE TASKS             | AUTOMATION STATUS         |
| [Dynamic Count]           | 160 Active Deals          | [Dynamic SLA Count]       | ACTIVE / STOPPED          |
| Inbound Builder & School  | 80 Builder + 80 Education | Requires Immediate Action | Outbound Communications   |
+---------------------------+---------------------------+---------------------------+---------------------------+
```

---

## 5. Security & Session Protocols

1. **Session Timeout:** JWT bearer tokens expire automatically after **8 hours**. Inactivity prompts re-authentication.
2. **First Login Enforcement:** Newly provisioned credentials require an immediate password update via the secure modal dialog. All dashboard interactions remain locked until the password is changed.
3. **Role-Based Visibility (RBAC):**
   - *Super Administrator / Administrator:* Unrestricted write access across all modules, user administration, data export, and Emergency STOP.
   - *Research Manager:* Edit access to builder accounts, institutional databases, and MahaRERA verification registers.
   - *Sales Manager / Executive:* Operational access to CRM pipelines, task assignment, inbound enquiry triage, and communication logging.
   - *Read-Only Analyst:* Read-only inspection across records and reports; export and write triggers are disabled.

---

## 6. Daily Workflow & Operator Procedures

1. **Morning Inspection:**
   - Log into `/admin/login` using authorized corporate credentials.
   - Review **Emergency STOP status** (confirm green "ACTIVE" status).
   - Check **Public Enquiry Manager** for new builder or school submissions generated overnight.
2. **Triage & Pipeline Management:**
   - Review the **Operational Task Centre** for scheduled discovery meetings and proposal milestones.
   - Navigate to **Builder Pipeline** (Module A) or **Education Pipeline** (Module B) to update deal stages.
3. **Audit & Compliance Verification:**
   - In Module B, inspect **Consent Status** before initiating manual or automated outreach.
   - For Module A, verify MahaRERA registration IDs before sharing formal alliance agreements.
4. **End of Day Synchronization:**
   - Trigger the **Sync Database** action to persist all stage transitions and activity notes.
   - Download scheduled Excel workbooks from the **Reports** section for offsite archival.
