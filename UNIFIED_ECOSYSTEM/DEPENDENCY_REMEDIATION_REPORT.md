# Dependency Remediation & Vulnerability Audit Report

**Execution ID:** `TASK-11720`  
**Status Classification:** `OPEN_TECHNICAL` / `ACCEPTED_RISK_WITH_APPROVAL` (`BLK-005`)  
**Date:** 16 November 2026  

---

## 1. Cross-Project `npm audit` Summary

| Project | Critical | High | Moderate | Low | Info | Total | Breakdown / Root Packages |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Project 1** (`1-AVANI LOAN SERVICE FY 26-27`) | `0` | `0` | `7` | `0` | `0` | `7` | `exceljs` / `uuid` breaking major; `gaxios`, `googleapis-common`, `rimraf`, `glob`, `minimatch` (transitive) |
| **Project 2** (`3-AVANI AI CRM`) | `2` | `16` | `8` | `0` | `0` | `26` | Tracked under `BLK-005` for controlled maintenance upgrade |
| **Project 3** (`4-AVANI LOAN AGENTS`) | `2` | `18` | `6` | `2` | `0` | `28` | Tracked under `BLK-005` for controlled maintenance upgrade |
| **Project 4** (`5-AVAVI AI CALLING AGENT`) | `0` | `0` | `0` | `0` | `0` | `0` | Native Node.js `fetch` & built-ins |

## 2. Remediation Decision & Safety Policy

- **Why Automatic `--force` Fixes Were Avoided:** Blindly running `npm audit fix --force` introduces breaking major API changes (e.g., `exceljs` / `uuid` in Project 1 and Next.js/SDK framework majors in Projects 2 and 3) without isolating regression impact.
- **Controlled Upgrade Path:** Zero (`0`) Critical and Zero (`0`) High vulnerabilities exist in the production web/API platform (Project 1). Projects 2 and 3 (`BLK-005`) are scheduled for controlled maintenance-window major version upgrades followed by full regression suites before go-live activation.
