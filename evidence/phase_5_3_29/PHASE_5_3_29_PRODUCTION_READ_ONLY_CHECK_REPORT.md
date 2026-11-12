# PHASE 5.3.29 — PRODUCTION READ-ONLY CHECK REPORT

**Check Timestamp:** 2026-11-12T11:37–11:40 IST (`06:07–06:10 UTC`)  
**Policy:** Strictly read-only public & infrastructure checks; zero authenticated mutation or deployment.  

---

## 1. Public Frontend & API Read-Only Probes

| Endpoint / Check | HTTP Status / Output | TLS / Service Observation | Status |
| :--- | :---: | :--- | :--- |
| `https://www.avanifinserv.com/` | `200 OK` | Server `Vercel`, HSTS `max-age=63072000` | **VERIFIED** |
| `https://www.avanifinserv.com/calculators` | `200 OK` | Server `Vercel` | **VERIFIED** |
| `https://www.avanifinserv.com/services` | `200 OK` | Server `Vercel` | **VERIFIED** |
| `https://www.avanifinserv.com/admin` | `200 OK` | Server `Vercel`; unauthenticated login gate | **VERIFIED** |
| `https://api.avanifinserv.com/health` | `200 OK` | `{"status":"ok","service":"avani-loan-services-api"}` | **VERIFIED** |
| `https://api.avanifinserv.com/api/portal/health` | `200 OK` | `{"status":"ok","service":"avani-loan-services-portal","storage_engine":"mongodb_atlas","database":"connected"}` | **VERIFIED** |
| Unauthenticated `/api/portal/builder/companies` | `401` | `Authentication required` | **VERIFIED** |
| Unauthenticated `/api/portal/education/schools` | `401` | `Authentication required` | **VERIFIED** |
| Unauthenticated `/api/portal/education/colleges` | `401` | `Authentication required` | **VERIFIED** |
| Unauthenticated `/api/portal/leads` | `401` | `Authentication required` | **VERIFIED** |
| Unauthenticated `/api/portal/templates` | `401` | `Authentication required` | **VERIFIED** |
| Unauthenticated `/api/portal/campaigns` | `401` | `Authentication required` | **VERIFIED** |

---

## 2. TLS Certificates

| Domain | Subject | Issuer | Expiry | Status |
| :--- | :--- | :--- | :--- | :--- |
| `https://www.avanifinserv.com` | `CN=*.avanifinserv.com` | `CN=YR1, O=Let's Encrypt, C=US` | `28-Jan-27 4:10:03 PM` | **VERIFIED** |
| `https://api.avanifinserv.com` | `CN=api.avanifinserv.com` | `CN=YR2, O=Let's Encrypt, C=US` | `02-Feb-27 10:50:54 PM` | **VERIFIED** |

---

## 3. Infrastructure Status (Oracle VM, PM2, Vercel, GitHub Remote)

- **Vercel (`npx --no-install vercel ls`):** Latest production deployment `https://avani-loan-service-fy-26-27-cqwfwdhod.vercel.app` (`Ready`, Production, ~1d old; unchanged).
- **Oracle Cloud Backend VM (`api.avanifinserv.com` host):**
  - Git branch: `master`, HEAD commit: **`d10e08b`** (running application release untouched).
  - `.env` runtime modes: `NODE_ENV=production`, `APP_MODE=production`, `PROVIDER_MODE=mock`.
  - PM2 process `avani-portal`: `id 0`, `status: online`, `pid: 107581`, `uptime: 23h`, `restarts: 18`, `mem: 84.1mb`.
- **GitHub Remote (`git ls-remote origin refs/heads/master`):** `a98a69f4170eea63595ca8a351ba7d4491b67a2d` (Phase 5.3.28 audit commit).
- **Important Epistemic Boundary:** Live authenticated CRM database record counts and UI table contents were **NOT** queried or verified in production (`BLOCKED` pending interactive administrator login).
