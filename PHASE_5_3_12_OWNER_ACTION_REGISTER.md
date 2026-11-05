# AVANI LOAN SERVICES — PHASE 5.3.12 OWNER ACTION REGISTER
## Action Items, Governance Checklist & Owner Authorization Requirements

**Audit Date:** November 5, 2026  
**Auditor:** Senior DevOps Architect & Production Reliability Engineer  
**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Target Environments:** MongoDB Atlas Console, Oracle Cloud Console, VM Host  
**Release Governance Status:** AWAITING OWNER ACTION ITEMS FOR FINAL ACCEPTANCE

---

## 1. Master Owner Action Checklist

| ID | Area / Console | Action Item Description | Priority | Est. Time | Acceptance Criteria | Status |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **ACT-01** | **MongoDB Atlas**<br>[cloud.mongodb.com](https://cloud.mongodb.com/) | **Scope Database User to Least Privilege:**<br>**Option B (Fastest):** Edit user `starpowerzlatur2210_db_user`, change role from `readWriteAnyDatabase` to `readWrite` on `avani_loan_services_prod`.<br>**Option A (Dedicated User):** Add `avani_prod_app_user` with `readWrite@avani_loan_services_prod`, update `.env`, and restart PM2. | **P1 (High)** | 2 mins | `connectionStatus` reports `readWrite` strictly on `avani_loan_services_prod`. | **PENDING OWNER ACTION** |
| **ACT-02** | **Oracle Cloud**<br>[cloud.oracle.com](https://cloud.oracle.com/) | **Verify ₹0 Invoicing Ledger:**<br>1. In console search, open *Billing & Cost Management -> Invoices*.<br>2. Confirm past and current monthly invoices display **Amount Due: ₹0.00**.<br>3. Check *Cost Analysis* to verify zero forecasted spend. | **P1 (High)** | 2 mins | Invoices confirm ₹0.00 charge. Ledger status upgrades to VERIFIED. | **PENDING OWNER ACTION** |
| **ACT-03** | **Production VM**<br>SSH Terminal | **Authorize Controlled Reboot Test (Optional):**<br>During an approved maintenance window, authorize a single host reboot (`sudo reboot`) to physically verify that `pm2-ubuntu.service` restores the API automatically. | **P2 (Medium)** | 2 mins | Server reboots and `/api/portal/health` returns HTTP 200 within 60s. | **STAGED FOR MAINTENANCE** |
| **ACT-04** | **Synthetic Monitor**<br>[uptimerobot.com](https://uptimerobot.com/) | **Activate Free Synthetic Uptime Probe:**<br>Configure a free HTTP(s) monitor on UptimeRobot pointing to `https://api.avanifinserv.com/api/portal/health` (5-minute interval). | **P2 (Medium)** | 3 mins | Monitor active, reporting 200 OK with email alerts configured. | **READY TO ACTIVATE** |

---

## 2. Step-by-Step Instructions for Owner

### ACT-01: Scoping MongoDB Atlas User (Option B - Recommended 2-Minute Fix)
1. Open [https://cloud.mongodb.com/](https://cloud.mongodb.com/) and sign in.
2. Select your Project: **AVANI LOAN SERVICES**.
3. In the left sidebar, click **Database Access** (under Security).
4. Locate the user **`starpowerzlatur2210_db_user`** and click **Edit**.
5. Under *Database User Privileges*:
   - Change from *Atlas Admin* or *Read and write to any database* to **Specific Privileges**.
   - Click **Add Specific Privilege**:
     - **Role:** `readWrite`
     - **Database:** `avani_loan_services_prod`
6. Click **Update User**.
7. *Impact:* Atlas applies the restriction immediately. Zero application downtime or `.env` modifications required.

### ACT-02: Verifying Oracle Cloud Billing Ledger
1. Open [https://cloud.oracle.com/](https://cloud.oracle.com/) and log in.
2. In the top search bar, type `Invoices` and click **Invoices** under Billing & Cost Management.
3. Verify that all monthly statements show:
   - **Amount Due: ₹0.00** (or $0.00).
4. *Impact:* Validates compliance with the non-negotiable ₹0 recurring infrastructure constraint.

---

## 3. Production Acceptance Signoff

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRODUCTION ACCEPTANCE SIGNOFF                        │
├────────────────────────────────────────────────────────────────────────┤
│ Project:          AVANI LOAN SERVICES Unified Portal                   │
│ Target Database:  avani_loan_services_prod                             │
│ Live Documents:   765 / 765 Verified (0 Duplicates)                    │
│ Systemd Status:   Active & Configured (pm2-ubuntu.service)             │
│ Current Role:     readWriteAnyDatabase@admin (Excessive)               │
│ Target Role:      readWrite@avani_loan_services_prod                   │
│ Release Decision: PARTIAL GO (Gated on ACT-01 & ACT-02)                │
└────────────────────────────────────────────────────────────────────────┘
```

---

*Report certified by Antigravity Autonomous DevOps & Security Audit System.*
