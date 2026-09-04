# Rollback Plan

If any critical failure occurs during deployment or production rollout:
1. Revert to the last stable Git commit.
2. If `src/routes/eligibility.cjs` has critical failures processing files, restore the previous component state referencing `api/eligibility/process` (by reverting `Eligibility.jsx` via Git).
3. If OmniDM AI integration is triggering unwanted CRM data, temporarily remove `app.use('/api/crm', crmRouter);` from `server.cjs` and redirect the front-end requests to the `/api/save-lead` fallback.
4. Restart the node instance via pm2 or your hosting provider dashboard to apply changes.
