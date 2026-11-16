# PRODUCTION DEPLOYMENT REPORT (2026-11-16)

- **Hosting Provider:** Vercel (`Vercel CLI 65.16.0`, authenticated as `avaniagrofoods1356-4705`)
- **Project:** `avani-loan-service-fy-26-27` (`prj_BtpgssjnKgpe81l955WsdHe4Jbwk`)
- **Deployment ID:** `dpl_H43C23gkKuoNQh8FXqb9NHugAzah`
- **Ready State:** `READY` (`target: production`, `environment: production`, `VERCEL_DEPLOY_EXIT: 0`)
- **Deployment URL:** `https://avani-loan-service-fy-26-27-12qifv0ka.vercel.app`
- **Production URL (Aliased):** `https://www.avanifinserv.com`
- **Inspector URL:** `https://vercel.com/avaniagrofoods1356-4705s-projects/avani-loan-service-fy-26-27/H43C23gkKuoNQh8FXqb9NHugAzah`

## Post-Deployment Live Smoke Tests (Non-Destructive `GET`)
- `https://www.avanifinserv.com/` -> `HTTP 200` (`4886` bytes, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `HSTS=True`, `CSP-Report-Only=True`)
- `https://www.avanifinserv.com/admin/` -> `HTTP 200`
- `https://www.avanifinserv.com/builder-partnership` -> `HTTP 200`
- `https://www.avanifinserv.com/institutional-funding` -> `HTTP 200`
- `https://www.avanifinserv.com/loans` -> `HTTP 200`
- `https://www.avanifinserv.com/eligibility` -> `HTTP 200`
- `https://api.avanifinserv.com/health` -> `HTTP 200` (`{"status":"ok","service":"avani-loan-services-api","timestamp":"2026-11-16T06:02:34.889Z"}`)
