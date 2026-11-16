# Final Owner Approval & Operational Sign-Off Checklist

**Project Ecosystem:** AVANI LOAN SERVICES (Projects 1–4)  
**Managing Director / Owner:** Sachin Shinde (`+91 72491 08474`, `enquiry@avanifinserv.com`)  
**Current Release Status:** **`NOT PRODUCTION READY` / `PARTIALLY VERIFIED` (5 Blockers Open Against Live Production Gates)**  
**Date:** 16 November 2026  

---

## Owner Approval & Infrastructure Closure Gates

1. **Production API VM Deployment (`BLK-003` — `OPEN_INFRASTRUCTURE_ACCESS`):**
   - [ ] Execute [OPERATOR_VM_DEPLOYMENT_RUNBOOK.md](../03_API_VM_AND_PROXY/OPERATOR_VM_DEPLOYMENT_RUNBOOK.md) over authorised SSH session (`git pull`, `npm ci --omit=dev`, inject `ECOSYSTEM_SERVICE_SECRET`, restart API service, apply `infra/nginx/nginx.conf`, reload Nginx).
   - [ ] Confirm live `curl -i https://api.avanifinserv.com/api/portal/integrations` -> `401` JSON and `/api/nonexistent` -> `404` JSON.
2. **Four-Project Live Production Integration (`BLK-001` — `OPEN_INFRASTRUCTURE_ACCESS`):**
   - [ ] Inject shared `ECOSYSTEM_SERVICE_SECRET` + `ECOSYSTEM_KEY_ID` + `AVANI_CRM_URL` / `LOAN_AGENTS_URL` / `CALLING_AGENT_URL` across Vercel/VM envs for P1–P4 and re-verify live remote S2S endpoints once `BLK-003` is deployed.
3. **Nine External Provider Credentials & Individual Activation (`BLK-002` — `OPEN_CREDENTIAL_REQUIRED` / `OPEN_OWNER_APPROVAL`):**
   - [ ] Supply `CHATMITRA_API_KEY`, `META_SYSTEM_USER_TOKEN`, rotated `VAPI_API_KEY`, active `ZAPIER_WEBHOOK_URL`, and real `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`.
   - [ ] Explicitly approve enabling `Twilio`, `HubSpot`, `Google Sheets`, `Gemini AI` (and remaining 5 after credential fix) before flipping `GLOBAL_PRODUCTION_DISPATCH_ENABLED`.
4. **Dependency Security Remediation (`BLK-004` — `OPEN_SECURITY_REMEDIATION`):**
   - [ ] P1 (`0C/0H/0M`), P2 (`0C/0H/14M`), P4 (`0C/0H/0M`) already pass `0 Critical, 0 High`.
   - [ ] Approve/schedule Vercel AI SDK major upgrade (`ai@4 -> 7`, `@ai-sdk/google@1 -> 4`) in Project 3 (`4-AVANI LOAN AGENTS`) to clear the remaining `6` High vulnerabilities (`GHSA-866g-f22w-33x8`, `GHSA-rwvc-j5jr-mgvh`, `GHSA-mrhx-c7xc-m3w5`).
5. **Cold Hardware Backup, Break-Glass VM Access & Live Non-Admin RBAC (`BLK-005` — `OPEN_EXTERNAL_DEPENDENCY` / `OPEN_OWNER_APPROVAL`):**
   - [ ] Attach external NTFS drive (`>= 50 GB` free) and run cold archival copy (`C:\` `2.57 GB` free only).
   - [ ] Provision named VM SSH operator keys & MFA break-glass policy ([VM_BREAK_GLASS_AND_ACCESS_RUNBOOK.md](../05_BACKUP_RESTORE/VM_BREAK_GLASS_AND_ACCESS_RUNBOOK.md)).
   - [ ] Optionally provision non-admin production test accounts in MongoDB to run live `api.avanifinserv.com` `403` RBAC checks (`Administrator`, `Research Manager`, `Sales Manager`, `Sales Executive`, `Read-Only Analyst`).
6. **Production Data Protection, Monitoring, Incident Response & Rollback Readiness:**
   - [ ] Acknowledge `GLOBAL_PRODUCTION_DISPATCH_ENABLED=false` stays off until items 1–5 are signed off.

- **Owner Signature:** `________________________`  **Date:** `________________`
