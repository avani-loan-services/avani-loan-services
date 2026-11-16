# PHASE 5.3.59 — AUTOMATION & EXTERNAL MIGRATION STATUS

## 1. Backup Script & Exclusions Configuration

- **Backup Script:** `scripts/avani_rclone_backup_template.ps1` (uses `rclone copy --checksum --retries 3 --low-level-retries 10`, `rclone check --one-way`, SHA-256 manifest, secret regex check, and strict exclusions).
- **Exclusions File Created:** `scripts/avani_rclone_exclusions.txt` (excludes `.env`, `.env.*`, `Mongodb project details.txt`, `*.key`, `*.pem`, `*.pfx`, `*.p12`, `*.token`, `*secret*`, `*credential*`, `node_modules/**`, `src/**`, `dist/**`, `.git/**`).
- **Windows Task Scheduler:** **NOT REGISTERED / NOT ENABLED** — held per safety rule requiring `rclone` installation, owner-authorised OAuth, and a passing test upload first.

## 2. External NTFS Migration Readiness Plan (`SACHIN SHINDE DOCUMENTS`)

- **Current Blocker:** No external NTFS drive attached (`D:\` is `FAT32` with `3.28 MB` free; `SACHIN SHINDE DOCUMENTS` totals `34,969.18 MB` / `~34.15 GB`).
- **Recommended Hardware:** External USB SSD/HDD formatted **NTFS** with at least **50 GB** free space (ideally `>= 100 GB`).
- **Safe Migration Sequence (Once External NTFS Drive `E:\` Is Attached):**
  1. Close IDE/Node/Chrome processes holding handles inside `SACHIN SHINDE DOCUMENTS`.
  2. Mirror with `robocopy` (no `/MOVE` until verified): `robocopy "C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS" "E:\SACHIN SHINDE DOCUMENTS" /E /COPY:DAT /R:2 /W:2 /MT:8 /LOG:E:\robocopy_migration.log`.
  3. Verify file counts, byte totals, and Git integrity (`git rev-parse HEAD`, `git status --short`) on `E:\`.
  4. Rename original folder to `.bak` temporarily, create NTFS directory junction (`mklink /J`) preserving exact original path if needed, verify workspace opens cleanly, then remove `.bak`.
