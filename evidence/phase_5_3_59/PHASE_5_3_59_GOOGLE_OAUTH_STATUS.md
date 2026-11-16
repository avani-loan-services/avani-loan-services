# PHASE 5.3.59 — GOOGLE OAUTH & RCLONE STATUS

## 1. Current Status: **NOT CONFIGURED / BLOCKED BY STORAGE & OAUTH PRE-REQUISITES**

- **`rclone` Binary Check:** Not installed on `PATH` and not present on `D:\` (`Get-ChildItem -LiteralPath D:\ -Filter "rclone*" -Recurse` returned empty).
- **Installer Safety Gate:** `C:` had `0 MB` free pre-cleanup (`197.12 MB` post-cleanup) and `D:` is a `FAT32` removable drive with `3.28 MB` free. Downloading or extracting `rclone` onto `C:` was intentionally blocked to protect system stability.
- **OAuth Policy Compliance:** No browser cookies, profile credentials, tokens, or passwords were extracted or requested.

## 2. Owner-Authorised Setup Prerequisites (When Space Permits)

1. Attach an external NTFS drive (`>= 50 GB`) or free at least `2 GB` on `C:`.
2. Download official `rclone` for Windows and verify its SHA-256 checksum.
3. Run `rclone config` interactively so the owner completes Google Drive OAuth directly in their own browser.
4. Execute `scripts/avani_rclone_backup_template.ps1` using `scripts/avani_rclone_exclusions.txt`.
