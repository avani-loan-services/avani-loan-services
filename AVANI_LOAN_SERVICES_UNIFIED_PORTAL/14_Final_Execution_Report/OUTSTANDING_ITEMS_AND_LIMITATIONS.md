# OUTSTANDING ITEMS AND LIMITATIONS (2026-11-16)

1. **API VM Nginx CSP Patch (`api.avanifinserv.com`):** `~/.ssh` contains only `known_hosts` (no SSH private key on this Windows host). Operator should apply `evidence/phase_5_3_55/PHASE_5_3_55_PROPOSED_NGINX_CSP_PATCH.md` directly on the API VM and run `sudo nginx -t && sudo systemctl reload nginx`.
2. **External Storage Relocation:** `C:` has `~8.27 GB` free and `D:` is `FAT32` (`0 GB` free); `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/02_Backups` and full workspace relocation remain pending an external NTFS drive (`>= 50 GB`).
3. **`npm audit` 7 Moderate Advisories:** `0` high/critical; `exceljs`/`uuid` fix is a breaking `semverMajor` change (`exceljs@3.4.0`), intentionally not auto-upgraded.
4. **ESLint Warnings (`51`):** Non-blocking unused state setters / hook dependency warnings in `src/pages/*`.
