# Initial Blocker Register — Phase 0 Baseline (`2026-11-16`)

| ID | Blocker | Required Evidence | Initial Status | Initial Baseline Findings |
| :--- | :--- | :--- | :--- | :--- |
| `BLK-001` | Four-project live integration | Authenticated bidirectional E2E traces across Projects 1–4 | Open | P2–P4 previously verified only via read-only contract tests; no shared short-lived JWT/HMAC S2S identity layer across P1–P4; P4 lacks `package.json`/HTTP listener. |
| `BLK-002` | Nine external providers | Nine individual authenticated live tests | Open | `PROVIDER_MODE` defaults to `mock`; `CHATMITRA_API_KEY`, `WHATSAPP_ACCESS_TOKEN`/`META_ACCESS_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON` missing; `SMTP_*` holds placeholder strings; Twilio/VAPI/HubSpot/Google Sheets AppScript/Zapier/Gemini keys present in `.env` but unverified live. |
| `BLK-003` | API VM and reverse proxy | Live curl outputs and deployment evidence | Open | `https://api.avanifinserv.com/health` returns `200` JSON, whereas `/api/portal/integrations` and `/api/nonexistent` return `200` `text/html`; `~/.ssh` contains only `known_hosts` / `known_hosts.old` (no authorised VM private key). |
| `BLK-004` | Security vulnerabilities | Four clean final audits and regression results | Open | P1: `0C/0H/7M`; P2: `2C/16H/8M`; P3: `2C/18H/6M/2L`; P4: no `package.json`/lockfile audited at baseline. |
| `BLK-005` | Operational readiness | Backup restore, operator access and RBAC evidence | Open | No external NTFS backup drive (`>= 50 GB`) attached (`C:\` `2.57 GB`, `D:\` `0 GB`); no staging restore verification log; no live non-admin production RBAC user credentials. |
