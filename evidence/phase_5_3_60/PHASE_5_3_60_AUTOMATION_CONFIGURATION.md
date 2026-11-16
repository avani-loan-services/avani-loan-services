# PHASE 5.3.60 — AUTOMATION & JUNCTION CONFIGURATION

## 1. Prepared Automation Artifacts (Held Behind Safety Gates)

| Artifact | Purpose | Execution Status |
|---|---|---|
| `scripts/avani_rclone_backup_template.ps1` | Non-destructive `rclone copy`, SHA-256 manifest, secret regex scan, `rclone check --one-way`, dated logs | **READY (Not Executed)** — awaiting `rclone` + owner OAuth |
| `scripts/avani_rclone_exclusions.txt` | Safe exclusion patterns (`.env*`, `Mongodb project details.txt`, keys, `.git`, `node_modules`, `src`, `dist`) | **READY** |
| `scripts/avani_register_backup_task_template.ps1` | Daily Windows Task Scheduler registration (`22:00`) | **NOT REGISTERED / NOT ENABLED** — requires `-ConfirmOAuthAndTestPassed` after passing test upload |
| `scripts/avani_ntfs_relocate_and_junction_template.ps1` | External NTFS `robocopy` mirror, file-count + SHA-256 verification, Git check, `mklink /J`, and rollback backup | **NOT EXECUTED** — blocked until external NTFS drive (`>= 50 GB`, `Healthy`) is attached |

## 2. External Drive Purchase / Connection Checklist

1. Connect an external USB SSD/HDD (`>= 50 GB` free, preferably `>= 100 GB`).
2. Confirm filesystem is **NTFS** (do not use `FAT32`, `exFAT`, or Google Drive streaming mounts for active workspace junctions).
3. Verify `Get-Volume` shows `HealthStatus = Healthy` and `fsutil dirty query <Drive>: ` shows `NOT Dirty`.
4. Close IDE, Node.js, and Chrome handles before running `scripts/avani_ntfs_relocate_and_junction_template.ps1`.
5. Keep `<SourceDir>_PRE_JUNCTION_BAK` until SHA-256, Git status, and workspace launch are verified, then remove only after owner confirmation.
