# BLOCKER RESOLUTION REGISTER (2026-11-16)

| Blocker ID | Description | Severity | Root Cause | Resolution / Status |
|---|---|---|---|---|
| **BLK-001** | Git CLI missing after Windows 10 reset | P0 (Release) | OS reset removed Git from `PATH` | **RESOLVED** (`git version 2.56.1.windows.1` installed; `origin/master` verified) |
| **BLK-002** | Vercel CLI logged out | P0 (Release) | Post-reset session cleared | **RESOLVED** (`avaniagrofoods1356-4705` authenticated, `VERCEL_EXIT: 0`) |
| **BLK-003** | API VM Nginx CSP patch (`api.avanifinserv.com`) | P2 (External Infra) | `~/.ssh` contains only `known_hosts` (no private key) | **BLOCKED (External Access)** — operator must apply `PHASE_5_3_55_PROPOSED_NGINX_CSP_PATCH.md` on API VM (`sudo nginx -t && sudo systemctl reload nginx`) |
| **BLK-004** | `npm audit` 7 moderate advisories | P3 (Low) | Transitive `glob`/`minimatch` + `exceljs`/`uuid` | **DOCUMENTED** (`0` high/critical; breaking `exceljs` major downgrade avoided) |
