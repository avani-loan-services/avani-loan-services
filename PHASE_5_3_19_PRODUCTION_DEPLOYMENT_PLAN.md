# PHASE 5.3.19 — PRODUCTION DEPLOYMENT PLAN
## STEP-BY-STEP DEPLOYMENT RUNBOOK & POST-RELEASE VERIFICATION

**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Target Date:** November 7, 2026  
**Infrastructure Boundaries:**
- **Code Repository:** `avani-loan-services/avani-loan-services` (GitHub origin, branch: `master`)
- **Backend API & Processing:** Oracle Cloud Ubuntu VM (`ubuntu@80.225.206.249`, PM2 service: `avani-portal`, reverse-proxy: Nginx)
- **Frontend & Edge CDN:** Vercel Global Edge Network
- **Production Database:** MongoDB Atlas Replica Set `avani_loan_services_prod`

---

### 1. PRE-DEPLOYMENT GATES & VERIFICATION CHECKLIST

- [x] Localhost test suite `scripts/test_phase_5_3_19_suite.cjs` passed: **26/26 tests PASS (100%)**.
- [x] Full regression test suite `scripts/test_phase_5_3_18_production.cjs` passed: **33/33 tests PASS (100%)**.
- [x] Production frontend build compiled cleanly with `npm run build` (0 warnings, 0 syntax errors).
- [x] `PROVIDER_MODE=mock` verified in all route configurations (zero live messaging dispatches).
- [x] Database role `readWrite@avani_loan_services_prod` verified with zero excessive cluster-level privileges.
- [x] All 160 enterprise records (80 Builders, 24 Schools, 56 Colleges) verified in disk registers and Atlas collections.

---

### 2. EXECUTION RUNBOOK (STEP-BY-STEP)

#### Step 1: Git Version Control & Commit
1. Merge working feature branch `phase-5-3-19-admin-navigation-templates-campaigns` into local `master`.
2. Review `git status` to ensure only verified Phase 5.3.19 files and reports are staged.
3. Commit with structured semantic message:
   `feat(portal): complete phase 5.3.19 admin navigation, templates & campaigns security, regression`
4. Push commit to remote: `git push origin master`.

#### Step 2: Oracle Cloud VM Backend Deployment
1. Connect to production server via SSH:
   `ssh -i <key> ubuntu@80.225.206.249`
2. Navigate to application directory:
   `cd /home/ubuntu/avani-loan-services`
3. Fetch and pull latest changes from `origin/master`:
   `git pull origin master`
4. Gracefully reload PM2 backend process without downtime:
   `pm2 reload avani-portal`
5. Verify process status and health endpoint:
   `pm2 status avani-portal`
   `curl -s http://127.0.0.1:3000/health`

#### Step 3: Vercel Frontend Edge Deployment
1. Deploy verified build artifacts to production edge:
   `npx vercel deploy --prod --yes`
2. Validate that the deployment commit hash matches local HEAD.
3. Confirm deployment URL alias points to `https://www.avanifinserv.com` and `https://avanifinserv.com`.

#### Step 4: Live Production Post-Deployment Smoke Test
1. Execute `scripts/test_phase_5_3_18_production.cjs` against `https://api.avanifinserv.com/` (expect 33/33 PASS).
2. Execute `scripts/test_phase_5_3_19_suite.cjs` against `https://api.avanifinserv.com/` (expect 26/26 PASS).
3. Test unauthenticated visit to `https://www.avanifinserv.com/templates` -> verify redirect to login.
4. Test unauthenticated visit to `https://www.avanifinserv.com/campaigns` -> verify redirect to login.
5. Log in with admin credentials -> verify topbar pills, sidebar navigation, Leads CRM, Builders (80), Schools (24), Colleges (56), Templates (8), and Campaigns (4).

---

### 3. CONTINGENCY & ROLLBACK PROCEDURE

If any regression occurs during live verification:
1. **Frontend Rollback:** Execute `vercel rollback` to restore previous deployment `dpl_HyDRRAMT8jQAm6H14D9THENzxQiL` instantly.
2. **Backend Rollback:** On Oracle VM, execute `git checkout HEAD~1 && pm2 reload avani-portal`.
3. **Data Safety Guarantee:** Zero destructive migrations or deletions are run; all 160 records and schemas remain immutable.
