# PHASE 5.3.19 — BROWSER EVIDENCE INDEX
## FORENSIC TRACEABILITY, UI ROUTE VALIDATION & RESPONSIVE VIEWPORT CHECKS

**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Date:** November 7, 2026  
**Auditor:** Senior Front-End QA & Application Security Architect  

---

### 1. INTERFACE ROUTE & DESTINATION MATRIX

The following table records the full browser verification suite across all admin routes:

| Route / Destination | Auth Requirement | Expected Visual Component | UI Controls Verified | Status |
| :--- | :--- | :--- | :--- | :--- |
| `https://www.avanifinserv.com/admin` | Unauthenticated | Login Dialog Card | Username, Password, Set New Password (if flagged) | ✅ PASS |
| `https://www.avanifinserv.com/admin` | Authenticated | Executive Overview | 3-Database Cards (Builders, Schools, Colleges), Telemetry | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=leads` | Authenticated | Consumer Leads CRM | Loan Type Filter, Status Filter, Search, WhatsApp Direct Link | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=builder` | Authenticated | Builder Database | 80 Developers, MahaRERA IDs, Subview Tabs, Detail Drawer | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=schools` | Authenticated | School Funding Database | 24 School Groups, Governance Roster, Capital Intelligence | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=colleges` | Authenticated | College & Univ Database | 56 Campuses, Engineering/Medical Subviews, Detail Drawer | ✅ PASS |
| `https://www.avanifinserv.com/templates` | Authenticated | Templates Hub | Meta WABA Banner, Template Cards, Duplicate, Preview Modal | ✅ PASS |
| `https://www.avanifinserv.com/campaigns` | Authenticated | Campaigns Workspace | Guardrail Notice, Cards, Dry-Run Trigger, Playbooks | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=analytics` | Authenticated | Cross-Module Analytics | Pipeline Value (₹1,550+ Cr), Funnels, Tier Distribution | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=tasks` | Authenticated | Task Centre | Builder & Education follow-up schedules | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=enquiries`| Authenticated | Inbound Enquiries | Consumer & institutional inbound web submissions | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=reports`  | Authenticated | Reports & Exports | Direct Excel XLSX download buttons for 3 databases | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=sync`     | Authenticated | Data Synchronization | System integrity indicators, duplicate audit trigger | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=automation`| Authenticated | Automation Centre | Global STOP switch, trigger/resume controls | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=users`    | SuperAdmin Only | User Management (RBAC) | List of portal administrators, role tags, password status | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=settings` | Authenticated | System Settings | Channel integration status, working hours schedule | ✅ PASS |
| `https://www.avanifinserv.com/admin?tab=audit`    | Authenticated | Activity Audit Logs | Forensic timestamps, action tags, IP addresses | ✅ PASS |

---

### 2. RESPONSIVE VIEWPORT BEHAVIOR CHECKS

1. **Desktop Viewport (> 1200px):**
   - Both the full topbar navigation pill bar and the complete left sidebar are persistently visible.
   - 3-Database overview grid renders as a 3-column card row.
   - Detail drawers slide out from the right margin with overlay backdrop (500px fixed width).

2. **Tablet Viewport (768px – 1024px):**
   - Topbar pills condense gracefully with horizontal scroll if needed.
   - Data tables utilize responsive wrapper (`.portal-table-wrap`) with native horizontal scrolling, preserving tabular column structure without text clipping.
   - Cards switch to a 2-column layout.

3. **Mobile Smartphone Viewport (< 768px):**
   - Horizontal module pill bar in topbar is hidden to eliminate header crowding.
   - Hamburger drawer toggle (`.portal-mobile-toggle`) appears next to the user badge.
   - Tapping the hamburger slides in the mobile navigation drawer (`.portal-sidebar.mobile-open`) from the left.
   - Tapping any navigation link closes the drawer and scrolls to the selected view.
   - Detail drawers take up 90vw width for touch interaction.

---

### 3. INTERACTIVE MODAL VERIFICATION

1. **Create Template Modal:** Validated form inputs (Identifier, Channel, Category, Header, Body with `{{1}}` placeholders, Footer, Variables list). Submit triggers `POST /api/portal/templates` and updates the grid immediately.
2. **Interactive WhatsApp Phone Mockup Preview Modal:** Clicking "Preview" renders a smartphone container with realistic WhatsApp chat bubble, replacing dynamic variables with sample values.
3. **Create Campaign Wizard Modal:** Captures campaign title, channel, target cohort dropdown (`BUILDERS_80`, `SCHOOLS_24`, `COLLEGES_56`), associated template, and scheduled date.
4. **Dry Run Results Modal:** Displays real audience evaluation, valid recipients, suppression count, cost incurred (₹0.00), and formatted mock JSON payload.
