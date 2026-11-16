# FINAL EXTERNAL BLOCKER REGISTER (2026-11-16)

| ID | Description | Impact | Dependency / Action | Completion Criteria |
|---|---|---|---|---|
| **BLK-003** | API VM Nginx CSP (`nginx/1.18.0`) | Low (`RECOMMENDED — DEFENCE IN DEPTH`; API serves `application/json`, not HTML) | Operator SSH to API VM (no SSH key in `~/.ssh`); run `PHASE_5_3_55_PROPOSED_NGINX_CSP_PATCH.md` + `sudo nginx -t && sudo systemctl reload nginx` | `Content-Security-Policy` present on `/health` |
| **BLK-004** | External NTFS Drive (`>= 50 GB`) | Low (Ops/Storage; `C:` currently `7.06 GB` free) | Owner connects external NTFS SSD/HDD (`>= 50 GB`) and runs `scripts/avani_ntfs_relocate_and_junction_template.ps1` | Verified NTFS junction & SHA-256 match |
| **BLK-005** | `npm audit` 7 moderate advisories | Low (`0` high/critical; `exceljs`/`uuid` fix is breaking `semverMajor`) | Defer until planned major dependency upgrade | `0` moderate advisories |
