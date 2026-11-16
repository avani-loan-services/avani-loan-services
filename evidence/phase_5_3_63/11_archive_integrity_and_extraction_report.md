# 11 — ARCHIVE INTEGRITY AND EXTRACTION REPORT (PHASE 5.3.63)

## 1. Release Candidate Archives Verified

| Archive | Path | Size (Bytes) | SHA-256 | Entries | Extracted | Bad Entries (`.env*`, keys, `../`, abs, `.map`) | Missing Required |
|---|---|---:|---|---:|---:|---:|---:|
| Backend RC | `evidence/phase_5_3_63/release/AVANI_LOAN_SERVICES_BACKEND_RC_5_3_63.zip` | `7,472,092` | `847669EA2794614209DAD4BA29DB6A5708A575034B127F3FBF08A86671B8DC0D` | `203` | `203` | `0` | `0` |
| Frontend RC | `evidence/phase_5_3_63/release/AVANI_LOAN_SERVICES_FRONTEND_RC_5_3_63.zip` | `5,514,902` | `B0E0D10052413676340F6317C35EF6992C8ED4FECA6C7A3E5246E5D9FA49D50F` | `48` | `48` | `0` | `0` |

## 2. Extraction & Manifest Verification

- Both archives were extracted into isolated temporary directories (`%TEMP%\avani_rc_validate_5_3_63\backend` and `\frontend`), verified against required runtime files (`src/server.cjs`, `package.json`, `package-lock.json`, `DEPLOYMENT_README.md`, `api/health.js`, `index.html`, `vercel.json`), and per-file SHA-256 hashes were recorded in `09_backend_release_candidate_manifest.csv` and `10_frontend_release_candidate_manifest.csv`.
- **Result:** **PASSED**
