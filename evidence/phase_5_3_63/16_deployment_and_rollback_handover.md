# 16 — DEPLOYMENT AND ROLLBACK HANDOVER (PHASE 5.3.63)

## 1. Pre-Deployment Checklist (After Owner Approval)
1. Install Git for Windows and verify `git --version`, `git branch --show-current` (`master`), `git remote -v` (`avani-loan-services/avani-loan-services`).
2. Review `git status --short` and `git diff --check`; commit approved changes only (never `.env*` or `Mongodb project details.txt`) and `git push origin master`.
3. Authenticate Vercel CLI (`npm.cmd exec --yes -- vercel login`) and confirm `vercel whoami`.
4. Deploy verified `avani-loan-service-fy-26-27` production target (`npm.cmd run build && npm.cmd exec --yes -- vercel deploy --prod --yes`).
5. Run non-destructive post-deployment smoke tests (`https://www.avanifinserv.com/`, `https://api.avanifinserv.com/api/health`, login route, security headers).

## 2. Rollback Plan
- **Frontend (Vercel):** Instant promote of previous healthy deployment in Vercel Dashboard (`avani-loan-service-fy-26-27` -> Deployments -> Promote to Production) or `vercel rollback`.
- **Git:** `git revert <commit>` + `git push origin master` (never `force-push`).
- **Backend / Nginx:** Re-deploy previous verified backend RC archive and run `sudo nginx -t && sudo systemctl reload nginx`.
