# FINAL REGRESSION AND FORENSIC RESULTS (2026-11-16)

- **`node --test` (`9` files):** **PASS** (`pass 9, fail 0, skipped 0, duration_ms 6757.9609, NODE_TEST_EXIT: 0`)
- **`npm.cmd run forensic:test`:** **PASS** (`TEST_RUN_ID: AVANI-E2E-20261116-2025, FORENSIC_EXIT: 0`)
- **`eslint src`:** **PASS** (`0` errors, `51` non-blocking warnings, `ESLINT_EXIT: 0`)
- **`npm.cmd run build`:** **PASS** (`vite build`, `2160` modules, `BUILD_EXIT: 0`)
- **`git diff --check`:** **PASS** (`GIT_DIFF_EXIT: 0`)
- **Live Production Unauth & Health (`task-11609`):** `/health` `200`, `/api/portal/builder/companies` `401`, `/api/portal/education/institutions` `401`, `/api/portal/dashboard/overview` `401`.
