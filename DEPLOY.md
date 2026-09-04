# Deployment & CI Instructions

This document lists the exact environment variables and steps to deploy the site automatically to Vercel using the included GitHub Actions workflow.

Required secrets (GitHub repository or Vercel project):

- `VERCEL_TOKEN` — Personal Vercel token (used by the GitHub Action deploy step). Create at https://vercel.com/account/tokens
- `VERCEL_PROJECT` — (optional) Vercel project name/ID if you plan to run `vercel` commands that require it
- `SITE_URL` — https://www.avanifinserv.com (used by the static generator; default is this value)
- `VITE_HUBSPOT_FORM_ID` — HubSpot form ID used by the client embed
- `VITE_HUBSPOT_PORTAL_ID` — (optional) HubSpot portal id
- `VITE_HUBSPOT_REGION` — (optional) HubSpot region, e.g., `na1`
- `PABBLY_CONNECT_URL` — (optional) Pabbly webhook URL
- `PICKY_ASSIST_URL` — (optional) Picky Assist webhook URL
- `GOOGLE_WEB_APP_URL` — (optional) Google Apps Script Web App URL used to push leads to Google Sheets

Optional secrets for automatic Vercel env injection (only if you enable that step in the workflow):

- Any env name you want to inject must be exposed as a GitHub secret and listed in `VERCEL_ENV_KEYS` (comma-separated). Example:
  - `VERCEL_ENV_KEYS = VITE_HUBSPOT_FORM_ID,PABBLY_CONNECT_URL,GOOGLE_WEB_APP_URL`

How the workflow runs

1. Push to the `main` branch. The workflow `.github/workflows/deploy.yml` triggers on `push` to `main`.
2. Steps performed by the workflow:
   - Checkout repository
   - Install dependencies (`npm ci`)
   - (Optional) `scripts/set-vercel-envs.sh` can add env vars to Vercel if configured and `VERCEL_TOKEN` is available
   - Inject internal links into markdown files (`npm run inject:links`) — optional but enabled
   - Generate service pages and sitemap (`npm run generate:services`) — this also writes `public/sitemap.xml` and `public/robots.txt`
   - Build the site (`npm run build`) — `prebuild` runs the generator when building locally
   - Deploy to Vercel via `npx vercel --prod` using `VERCEL_TOKEN`
   - Ping Google & Bing with the sitemap

Local commands

Generate service pages and sitemap locally:
```
npm run generate:services
```

Build (generator runs automatically via `prebuild`):
```
npm run build
```

Ping search engines manually:
```
npm run notify:search-engines
```

Notes & best practices

- Make sure to set the HubSpot form ID in Vercel (or GitHub secrets for the Action) so the embedded form loads in production.
- For the `api/save-lead.js` endpoint, store external webhook URLs in Vercel env vars (PABBLY_CONNECT_URL, PICKY_ASSIST_URL, GOOGLE_WEB_APP_URL) so they are not committed in source.
- If you want automatic Vercel env injection, set `VERCEL_ENV_KEYS` and the corresponding GitHub secrets; the workflow attempts to run `scripts/set-vercel-envs.sh` if `VERCEL_TOKEN` is present.
- After the first deploy, open Google Search Console for `https://www.avanifinserv.com` (verify ownership if not already done) and submit the sitemap: `https://www.avanifinserv.com/sitemap.xml`.

If you want, I can (a) prepare the `VERCEL_ENV_KEYS` list for you, (b) run the environment injection step in CI (you'll need to add `VERCEL_TOKEN` as a secret), or (c) connect Vercel via the web dashboard and set env variables there.
