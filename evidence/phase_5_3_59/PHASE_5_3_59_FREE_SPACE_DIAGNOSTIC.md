# PHASE 5.3.59 — C: FREE-SPACE FLUCTUATION DIAGNOSTIC

## 1. Reported Symptom

`C:` free space fluctuated sharply across recent checks (`11.67 GB -> 4.28 GB -> 0 MB`, and `681.17 MB` removed yielded `197.12 MB` net free space).

## 2. Verified Findings

1. **Filesystem Health (`fsutil dirty query C:`):** `Volume - C: is NOT Dirty`. No NTFS volume corruption flag is set.
2. **Quota Check (`[System.IO.DriveInfo]::GetDrives()`):** `TotalFreeSpace == AvailableFreeSpace` (`0 MB` before cleanup; `197.12 MB` after cleanup). There is no per-user NTFS quota discrepancy.
3. **Root Cause — Dynamic Windows Virtual Memory Expansion:**
   - `C:\pagefile.sys`: **9.07 GB** (`LastWriteTime: 14-Nov-26 6:56:12 PM`)
   - `C:\swapfile.sys`: **0.02 GB** (`LastWriteTime: 14-Nov-26 2:21:38 PM`)
   - Under heavy Node/Chrome/IDE workloads, Windows dynamically expands `pagefile.sys` onto `C:`, consuming remaining free blocks and causing multi-gigabyte swings in reported free space.
4. **Over-Commit Reclamation Observed During Cleanup:**
   - Removing **681.17 MB** (`714,257,183 bytes`) of stale `puppeteer` `win64-148.0.7778.167` caches raised `C:` free space from `0 MB` to **197.12 MB**.
   - The remaining ~484 MB was immediately absorbed by pending system/virtual-memory/IDE allocations because `C:` was at `0 MB` exhaustion.

## 3. Conclusion

The fluctuation is caused by normal Windows dynamic pagefile expansion (`9.07 GB`) competing with a nearly full `118.59 GB` OS volume containing `34.15 GB` under `SACHIN SHINDE DOCUMENTS`. Permanent relief requires moving `SACHIN SHINDE DOCUMENTS` (or large non-OS archives) to an external NTFS drive (`>= 50 GB` recommended) and keeping at least 15–20 GB free on `C:`.
