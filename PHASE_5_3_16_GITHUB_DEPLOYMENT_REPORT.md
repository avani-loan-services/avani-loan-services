# AVANI LOAN SERVICES — PHASE 5.3.16 GITHUB DEPLOYMENT REPORT
## REPOSITORY SYNCHRONIZATION, ORACLE VM RELEASE & DEPLOYMENT LOG

**Document Reference:** `ALS-DEPLOY-P5316-20261106`  
**GitHub Repository:** `https://github.com/avani-loan-services/avani-loan-services`  
**Target Branch:** `master`  
**Deployed Commit Hashes:**
- `6787f7b`: *feat(phase-5.3.16): complete website upgrade with password-protected builder, school, and college funding databases*
- `008829d`: *fix(qc): refine auth token extraction and test assertions*  
**Production Server:** Oracle Cloud VM (`80.225.206.249`, Ubuntu 20.04 LTS, Node.js 20.20.2 LTS, PM2 Process ID 0)

---

### 1. REPOSITORY COMMIT CHRONOLOGY

All source code modifications and new components were tracked, committed, and synchronized to the GitHub remote repository:

```
* 008829d (HEAD -> master, origin/master) fix(qc): refine auth token extraction and test assertions
* 6787f7b feat(phase-5.3.16): complete website upgrade with password-protected builder, school, and college funding databases
* 7afa388 (Phase 5.3.14/5.3.15 baseline) chore: sync production least-privilege verification artifacts
```

#### Files Modified & Added in Phase 5.3.16:
1. `src/components/Navbar.jsx`: Multi-tier corporate header, dropdown menus, accordion mobile drawer, lock icon Admin Login button.
2. `src/components/Navbar.css`: Responsive navigation styles, transitions, touch targets, and overflow safeguards.
3. `src/components/Footer.jsx`: Telephony (`tel:+919175635165`), email, statutory disclosures, corporate partnership links.
4. `src/pages/Terms.jsx`: Newly authored Terms of Service page with DSA disclosure and no-upfront-fee guarantee.
5. `src/pages/Disclaimer.jsx`: Newly authored Regulatory Disclosures, credit policies, and anti-fraud warning.
6. `src/App.jsx`: Wired `/terms` and `/disclaimer` routes into React Router DOM.
7. `src/utils/educationCategoryHelper.cjs`: Deterministic helper partitioning 80 institutions into 24 Schools and 56 Colleges.
8. `src/routes/builderPortalRoutes.cjs`: Subviews (`residential`, `contacts`, `decision_makers`, `pipeline`, `tasks`), counts, and detail drawer data.
9. `src/routes/educationPortalRoutes.cjs`: `/schools` (24), `/schools/export`, `/colleges` (56), `/colleges/export`, and subviews.
10. `src/routes/unifiedPortalRoutes.cjs`: Updated `/overview` telemetry with `databases` block (80 builders, 24 schools, 56 colleges).
11. `src/pages/UnifiedAdminPortal.jsx`: Dedicated sections for Schools (24) and Colleges (56), subview pills, research estimate alerts, drawer inspection.
12. `src/pages/UnifiedAdminPortal.css`: Modern database cards, subview pill tabs, and research estimate banner styling.
13. `scripts/generate-service-pages.js`: Prebuild sitemap generator updated to include all institutional and legal pages.
14. `public/sitemap.xml`: Generated production sitemap including all 24 core pages and localized routes.
15. `scripts/test_phase_5_3_16_website_and_databases.cjs`: 30-case automated regression suite.

---

### 2. ORACLE CLOUD VM DEPLOYMENT LOG

The production Oracle VM was updated via SSH without service disruption:

1. **Pull Step:**
   ```bash
   cd /home/ubuntu/avani-loan-services
   git pull origin master
   ```
   *Output:*
   ```
   Updating 7afa388..008829d
   Fast-forward
   16 files changed, 2786 insertions(+), 275 deletions(-)
   ```
2. **Process Reload Step:**
   ```bash
   pm2 reload avani-portal
   ```
   *Output:*
   ```
   [PM2] Applying action reloadProcessId on app [avani-portal](ids: [ 0 ])
   [PM2] [avani-portal](0) ✓
   ```
3. **Daemon State Verification:**
   - PM2 status: `online`
   - Uptime: Reset clean, supervised by systemd
   - Memory usage: `60.7 MiB` heap
   - MongoDB connection: Connected to `avani_loan_services_prod`

---

### 3. ZERO-COST HOSTING ATTESTATION

- **Oracle Cloud Infrastructure:** VM deployed on Oracle Always Free Tier (1 OCPU, 1 GB RAM, Ampere/AMD Shape, 50 GB Boot Volume).
- **MongoDB Atlas:** Cluster tier `M0 Free Sandbox` (512 MB storage, shared RAM, multi-AZ replica set).
- **Vercel Edge Network:** Hobby / Free Tier CDN for React frontend distribution.
- **Total Incurred Hosting Fee:** **₹0.00 / month**.
