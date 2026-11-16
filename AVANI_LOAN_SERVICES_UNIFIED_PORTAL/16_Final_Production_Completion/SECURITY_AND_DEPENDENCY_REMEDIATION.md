# SECURITY AND DEPENDENCY REMEDIATION (2026-11-16)

## 1. `npm audit` 7 Moderate Advisories (`0` High, `0` Critical)

| Package | Installed / Scope | Direct / Transitive | Advisory / Via | Fix & Recommendation |
|---|---|---|---|---|
| `exceljs` | Direct (`package.json`) | Direct | `uuid` | `exceljs@3.4.0` (`semverMajor=True` breaking downgrade) — **Defer**, do not force-downgrade |
| `uuid` | Transitive (via `exceljs`) | Transitive | `1119441` | Tied to `exceljs`; **Defer** |
| `gaxios` | Transitive (via `googleapis`) | Transitive | `rimraf` | Non-breaking fix available (`npm audit fix` in maintenance window) |
| `googleapis-common` | Transitive (via `googleapis`) | Transitive | `gaxios` | Non-breaking fix available |
| `rimraf` | Transitive | Transitive | `glob` | Non-breaking fix available |
| `glob` | Transitive | Transitive | `1244013` / `minimatch` | Non-breaking fix available |
| `minimatch` | Transitive | Transitive | `1244623` | Non-breaking fix available |

## 2. CSP Assessment
- **Frontend (`https://www.avanifinserv.com/`):** `Content-Security-Policy-Report-Only` active.
- **API (`https://api.avanifinserv.com/health`):** Returns `application/json; charset=utf-8` (not HTML); `RECOMMENDED — DEFENCE IN DEPTH` Nginx CSP patch awaits external operator SSH (`~/.ssh` has only `known_hosts`).
