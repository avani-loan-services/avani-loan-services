# MASTER BLOCKER REGISTER (2026-11-16)

| Blocker ID | Description | Severity | Status | Evidence / Resolution |
|---|---|---|---|---|
| **BLK-001** | Git CLI missing post-reset | P0 | **RESOLVED** | `git version 2.56.1.windows.1` installed; `origin/master` synced |
| **BLK-002** | Vercel CLI logged out | P0 | **RESOLVED** | `avaniagrofoods1356-4705` authenticated; `dpl_H43C23gkKuoNQh8FXqb9NHugAzah` deployed |
| **BLK-003** | API VM Nginx CSP (`nginx/1.18.0`) | P3 (Defence-in-depth) | **EXTERNAL BLOCKER** | API serves `application/json` (not HTML); `~/.ssh` has only `known_hosts` |
| **BLK-004** | External NTFS Drive (`>= 50 GB`) | P3 (Ops) | **EXTERNAL BLOCKER** | `C:` has `7.06 GB` free; `D:` is full `FAT32`; pending external NTFS drive |
| **BLK-005** | `npm audit` 7 moderate advisories | P3 (Low) | **ACCEPTED / DOCUMENTED** | `0` high/critical; `exceljs`/`uuid` fix is breaking `semverMajor` |
