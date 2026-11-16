# 07 — COMPLETE REGRESSION TEST RESULTS (PHASE 5.3.63)

| Test category | Result | Evidence | Outstanding issues |
|---|---|---|---|
| Unit tests | **PASSED** (`4/4` files) | `test_foir_engine`, `test_hubspot_signature`, `test_policy_engine`, `test_statement_api` | None |
| Integration tests | **PASSED** (`3/3` files) | `chatmitra_integration` (`12/12`), `test_integration_gateway` (`6/6`), `test_website_crm_intake` (`5/5`) | None |
| Security tests | **PASSED** (`1/1` file) | `test_pii_and_consent` (consent gate, PAN/Aadhaar masking, TRAI DND) | None |
| Workflow tests | **PASSED** (`1/1` file) | `test_loan_workflows` (`3/3` 15-domain cases) | None |
| Forensic tests | **PASSED** | `npm.cmd run forensic:test` (`FORENSIC_EXIT: 0`, Phases 1–8 PASS) | None |
| ESLint | **PASSED** | `0` errors, `51` warnings (`ESLINT_EXIT: 0`) | `51` non-blocking warnings |
| Dependency audit | **PASSED (0 High/Crit)** | `7` moderate advisories (`exceljs`/`uuid`/`gaxios`/`glob`/`minimatch`/`rimraf`/`googleapis-common`) | Breaking `exceljs` major downgrade avoided |
| Type checking | **N/A** | JS/JSX project (`no tsconfig.json`) | None |
| Production build | **PASSED** | `vite v6.4.6`, `2160` modules, `33.43s`, `BUILD_EXIT: 0` | None |
| Browser smoke tests | **BLOCKED** | Pending owner approval & Vercel login/deploy | Pending Phase M |
| Git diff validation | **BLOCKED** | `git` CLI not installed after Windows reset | Pending Git install |

**`node --test` Summary:** `9/9` suites passed (`pass 9, fail 0, cancelled 0, skipped 0, duration_ms 2547.2875`, `NODE_TEST_EXIT: 0`).
