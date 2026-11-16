# Production Deployment Report

**Execution ID:** `TASK-11720`  
**Vercel Project:** `avani-loan-service-fy-26-27` (`prj_BtpgssjnKgpe81l955WsdHe4Jbwk`)  
**Vercel CLI Account:** `avaniagrofoods1356-4705` (`Vercel CLI 65.16.0`)  
**Deployed Git Code Commit:** `c3f1cb4d82615d14e00b031cb838cd96227f6330` (`master`)  
**Date:** 16 November 2026  

---

## 1. Vercel Production Deployment Details

- **Command Executed:** `vercel deploy --prod --yes` (`VERCEL_DEPLOY_EXIT: 0`)
- **Deployment ID:** `dpl_C3gbbcVD9zU9wQunEmcAfYqgJqAU`
- **Deployment Status (`readyState`):** `READY` (`target: production`)
- **Preview / Immutable Build URL:** `https://avani-loan-service-fy-26-27-kam53r77m.vercel.app`
- **Aliased Production Domain:** `https://www.avanifinserv.com`
- **Inspector URL:** `https://vercel.com/avaniagrofoods1356-4705s-projects/avani-loan-service-fy-26-27/C3gbbcVD9zU9wQunEmcAfYqgJqAU`

## 2. Post-Deployment Live Verification (Executed After `dpl_C3gbbcVD9zU9wQunEmcAfYqgJqAU` Went Live)

### 2.1 Production Web Routes (`https://www.avanifinserv.com`)
| Check / Path | HTTP Status | Observed Content / Result |
| :--- | :---: | :--- |
| `/` | `200` | `4900` bytes; `HAS_INSTANT_APPROVALS: false`; `HAS_FAST_ADVISORY: true` |
| `/admin/` | `200` | `4900` bytes (Portal SPA served) |
| `/admin/integrations` | `200` | `4900` bytes (Ecosystem Control Centre route live) |
| `/robots.txt` | `200` | `107` bytes |
| `/sitemap.xml` | `200` | `5148` bytes |

### 2.2 Production API (`https://api.avanifinserv.com`)
| Endpoint | HTTP Status | Observed Content-Type & Behavior |
| :--- | :---: | :--- |
| `/health` | `200` | `application/json` — `{"status":"ok","service":"avani-loan-services-api",...}` |
| `/api/portal/builder/companies` | `401` | `application/json` — Authentication required |
| `/api/portal/education/institutions` | `401` | `application/json` — Authentication required |
| `/api/portal/dashboard/overview` | `401` | `application/json` — Authentication required |
| `/api/portal/integrations` & `/api/nonexistent` | `200` (HTML) | **Still pre-update code on API VM (`BLK-003` — `OPEN_EXTERNAL_DEPENDENCY`)** until VM pulls `c3f1cb4` + reloads Express/Nginx |
