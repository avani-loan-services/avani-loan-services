# PHASE 5.3.60 — GOOGLE DRIVE BACKUP PLAN (`AVANI_SAFE_ARCHIVE`)

## 1. Target Remote Folder Structure

Once `rclone` is installed on an approved external NTFS volume (or after `C:` space recovery) and owner OAuth is verified, create the remote hierarchy under `gdrive:/AVANI_SAFE_ARCHIVE/`:

- `01_Historical_Backups`
- `02_Project_Evidence`
- `03_Completed_Reports`
- `04_Old_Release_Archives`
- `05_Other_Approved_Files`
- `99_Migration_Manifests`

## 2. Non-Destructive Backup Rules

- Always use `rclone copy` (never destructive `sync` or `move`).
- Enforce `--exclude-from scripts/avani_rclone_exclusions.txt` (`.env`, `.env.*`, `Mongodb project details.txt`, `*.key`, `*.pem`, `*.pfx`, `*.p12`, `*.token`, `*secret*`, `*credential*`, `node_modules/**`, `src/**`, `dist/**`, `.git/**`).
- Generate local SHA-256 manifests and verify transfers via `rclone check --one-way` with `--checksum --retries 3 --low-level-retries 10`.
- Never delete local originals.
