# PHASE 5.3.64 — NEXT SESSION EXECUTION CHECKLIST

1. **FIRST:** Check for any leftover `Git-2.56.1-64-bit.exe` process/partial file in `%TEMP%` and complete verified installation of official Git for Windows (`git --version`).
2. **SECOND:** Verify Git repository (`avani-loan-services/avani-loan-services`), `master` branch, `git status --short`, `git diff --check`, and `git remote -v`.
3. **THIRD:** Revalidate Vercel authentication (`npm.cmd exec --yes -- vercel whoami` -> `avaniagrofoods1356-4705`) and project linkage (`avani-loan-service-fy-26-27` / `prj_BtpgssjnKgpe81l955WsdHe4Jbwk`).
4. **FOURTH:** Re-run any required release checks affected by changes (`node --test`, `npm.cmd run build` if any files changed).
5. **FIFTH:** Proceed with the previously approved Phase 4 (Git commit & push to `origin master`), Phase 5–6 (Vercel production deploy & smoke tests), and Phase 7 (separate Nginx CSP patch once API VM access is confirmed).
