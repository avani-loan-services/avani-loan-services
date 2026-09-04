# Implementation Plan for Avani Loan Services Launch Checklist and Monitoring

## Goal Description
Complete all items in the provided launch checklist, organize reference PDFs, create a comprehensive monitoring folder with separate documentation files, and enable automated deployment (auto‑mode) for the website `https://www.avanifinserv.com/`.

## User Review Required
- Confirm the folder structure for reference data and monitoring files.
- Approve the inclusion of placeholder security implementations (e.g., password hashing) where user authentication is not yet present.
- Approve the automation script approach (PowerShell) for running weekly/monthly checks.

## Open Questions
- Do you have an existing user authentication flow that requires password hashing, or should we add a demo `User` model with bcrypt?
- Which database are you using for leads (e.g., SQLite, MongoDB, file‑based)? Provide details for adding SQL‑injection protection and backup scripts.
- Do you prefer the monitoring scripts to be scheduled via Windows Task Scheduler or a custom `schedule` slash command?

## Proposed Changes
---
### Project Structure Enhancements
- **[NEW]** `Ref Data/` directory at project root to store large PDF assets.
- **[NEW]** `website_monitor/` directory with the following files:
  - `checklist.md` – weekly/monthly monitoring tasks.
  - `todo.md` – actionable items.
  - `dos_donts.md` – best practices.
  - `errors.md` – known error patterns.
  - `corrective_actions.md` – remediation steps.
  - `auto_monitor.ps1` – PowerShell script that runs checks, generates reports, and pushes to a `reports/` folder.

---
### Backend Security Enhancements (`backend/server.js`)
- **[MODIFY]** Add `helmet` for security headers.
- **[MODIFY]** Add `express-rate-limit` with safe defaults (100 requests per 15 min).
- **[MODIFY]** Add `compression` middleware for gzip.
- **[MODIFY]** Add input sanitization using `express-validator` for all incoming routes.
- **[MODIFY]** Add placeholder bcrypt password hashing utility (`utils/password.js`).
- **[MODIFY]** Ensure CORS configuration is strict (allowed origins from env).

---
### Front‑end Enhancements (`index.html` and CSS)
- Add `<meta name="viewport" content="width=device-width, initial-scale=1">` for mobile responsiveness.
- Insert GA4 measurement ID script (placeholder) with user‑provided ID.
- Add SEO meta tags (title, description, canonical, robots).
- Enable lazy loading of images and minify CSS.

---
### Environment & Secrets
- Create `.env.example` with required variables (`PORT`, `FRONTEND_URL`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, `VAPI_API_KEY`, `GA4_MEASUREMENT_ID`).
- Update `scripts/add-github-secrets.js` to read from `.env` and avoid hard‑coded values.

---
### Database Backup
- Add `scripts/backup_db.ps1` that copies the current DB file (or dumps MongoDB) to `backups/` with timestamp.
- Schedule this script to run daily via Windows Task Scheduler (or provide slash command `/schedule`).

---
### Monitoring Automation
- **`website_monitor/auto_monitor.ps1`** will:
  1. Run `npm run lint` and `npm test`.
  2. Perform a curl request to `https://www.avanifinserv.com/robots.txt` and verify disallow rules.
  3. Verify GA4, HubSpot, VAPI scripts are present in the page source.
  4. Generate a markdown report (`reports/weekly_YYYYMMDD.md`).
  5. Commit and push the report to a `monitoring-reports` branch.
- Add `schedule` slash command suggestion for weekly/monthly runs.

---
### Deployment Automation
- Update `auto-deploy.ps1` to:
  - Pull latest from `main`.
  - Run `npm ci`.
  - Execute `npm run build`.
  - Deploy to Vercel using `vercel --prod`.
  - Run `website_monitor/auto_monitor.ps1` post‑deploy to verify.

## Verification Plan
### Automated Tests
- Run existing Jest tests (if any).
- Add unit tests for rate‑limiter and password utility.
- Execute the PowerShell monitoring script and verify generated report files.

### Manual Verification
- Open the Vercel preview URL and inspect network tab for HubSpot, VAPI, GA4 loads.
- Check `/robots.txt` and `/sitemap.xml` for correct content.
- Verify that PDF assets are accessible in `Ref Data/`.
- Ensure HTTPS is enforced (Vercel default).

---
**Implementation steps will be tracked in `task.md` after approval.**
