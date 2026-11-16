# Owner Actions and Approvals Checklist (`TASK-11720`)

**Execution ID:** `TASK-11720`  
**Owner / Managing Director:** Sachin Shinde (`+91 72491 08474`, `enquiry@avanifinserv.com`)  
**Current Release Status:** **`PRODUCTION READY — PENDING OWNER SIGN-OFF`**  
**Date:** 16 November 2026  

---

## 1. External Infrastructure & Security Actions (Authorized Operator / Owner)

1. **`BLK-003` — Update API VM (`api.avanifinserv.com`) via Authorized SSH Session:**
   - SSH into the API VM with your authorized key (`~/.ssh` on this workstation does not hold a VM private key).
   - Pull `master` (`c3f1cb4` / latest docs head) into the deployed backend directory, restart the Node/Express API process, and apply/reload the approved Nginx CSP header policy.
   - Confirm afterward: `GET https://api.avanifinserv.com/api/nonexistent` returns `HTTP 404` `application/json` (instead of `200` SPA HTML) and `GET https://api.avanifinserv.com/api/portal/integrations` returns `HTTP 401` JSON when unauthenticated.
2. **`BLK-004` — Connect External NTFS Drive (`>= 50 GB` Free Space):**
   - Attach the encrypted/physical NTFS backup drive and execute cold archival backup outside the primary disk.
3. **`BLK-005` — Schedule Maintenance Window for Dependency Major Upgrades:**
   - Project 1 (`1-AVANI LOAN SERVICE FY 26-27`): `0` critical, `0` high, `7` moderate (`exceljs`/`uuid` major, transitive `gaxios`, `googleapis-common`, `rimraf`, `glob`, `minimatch`).
   - Project 2 (`3-AVANI AI CRM`): `26` total (`2` crit, `16` high, `8` mod) — schedule Next.js/SDK upgrade + full regression.
   - Project 3 (`4-AVANI LOAN AGENTS`): `28` total (`2` crit, `18` high, `6` mod, `2` low) — schedule major upgrade + advisor test regression.

## 2. Explicit Governance Decisions Required (`OPEN_OWNER_APPROVAL`)

1. **Third-Party Provider Go-Live (`PROVIDER_MODE`):**
   - Currently `PROVIDER_MODE=mock` (`MOCK_ONLY`) for all 9 external adapters (`chatmitra`, `meta_whatsapp`, `twilio`, `vapi`, `hubspot`, `google_sheets`, `zapier`, `smtp_email`, `gemini_ai`) and live cross-project outbound calls (`avani_ai_crm`, `avani_loan_agents`, `avavi_calling_agent`).
   - **Action:** Decide which providers to activate first, verify production credentials in Vercel / API VM secrets out-of-band, and run single-lead sandbox verification before enabling production broadcasts.
2. **Live 6-Role RBAC Production Smoke Test (Optional):**
   - Currently `admin_users.json` stores `3` `Super Administrator` accounts; non-admin roles (`Administrator`, `Research Manager`, `Sales Manager`, `Sales Executive`, `Read-Only Analyst`) are verified in automated unit/E2E suites (`test_four_project_ecosystem_e2e.test.cjs`), not against live production user records.
   - **Action:** Provision non-admin test accounts in MongoDB if live 6-role browser QA is required prior to operational onboarding.

## 3. Formal Owner Acceptance Sign-Off Block

- [ ] Codebase, GitHub release, and Vercel production website (`https://www.avanifinserv.com/`, `dpl_C3gbbcVD9zU9wQunEmcAfYqgJqAU`) reviewed and approved.
- [ ] Open external items (`BLK-003`, `BLK-004`, `BLK-005`, `PROVIDER_MODE=mock` go-live gate) acknowledged.
- **Signed:** `________________________` **Date:** `________________`
