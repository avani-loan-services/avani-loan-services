# 05 — SECURITY AND DEPENDENCY AUDIT (PHASE 5.3.63)

## 1. Installed Key Versions (`npm.cmd ls nodemailer sharp`)
- `nodemailer@10.5.0`
- `sharp@0.35.5`

## 2. `npm audit --json` Findings (`7` Moderate, `0` High, `0` Critical)

| Package | Severity | Direct / Transitive | Advisory / Via | Fix Available | Breaking? |
|---|---|---|---|---|---|
| `exceljs` | moderate | Direct | `uuid` | `exceljs@3.4.0` | **Yes (`semverMajor=True`)** |
| `uuid` | moderate | Transitive (via `exceljs`) | `1119441` | `exceljs@3.4.0` | **Yes (`semverMajor=True`)** |
| `gaxios` | moderate | Transitive | `rimraf` | `True` | No |
| `googleapis-common` | moderate | Transitive | `gaxios` | `True` | No |
| `rimraf` | moderate | Transitive | `glob` | `True` | No |
| `glob` | moderate | Transitive | `1244013` / `minimatch` | `True` | No |
| `minimatch` | moderate | Transitive | `1244623` | `True` | No |

Per policy, no `npm audit fix --force` or breaking `exceljs` downgrade was performed.

## 3. Application & Archive Security Verification
- `tests/security/test_pii_and_consent.test.cjs` + `tests/unit/test_hubspot_signature.test.cjs`: **PASS**
- Protected resources (`.env`, `.env:67`, `Mongodb project details.txt`, `PROVIDER_MODE`): untouched and excluded from all release candidate archives (`BadEntries=0`).
