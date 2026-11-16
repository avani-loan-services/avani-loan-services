# API CSP APPLICABILITY AND SECURITY DECISION (2026-11-16)

## 1. Classification: **`RECOMMENDED — DEFENCE IN DEPTH`**

## 2. Live Response Evidence (`task-11544`)
- **Frontend (`https://www.avanifinserv.com/`):** `HTTP 200`, `Content-Type: text/html; charset=utf-8` (`4,886` bytes), `Content-Security-Policy-Report-Only` present covering `'self'`, Google Analytics/GTM, HubSpot, Vapi, `https://api.avanifinserv.com`, `object-src 'none'`, `frame-ancestors 'self'`.
- **API (`https://api.avanifinserv.com/health`):** `HTTP 200`, `Content-Type: application/json; charset=utf-8` (`90` bytes, `{"status":"ok","service":"avani-loan-services-api",...}`), `Content-Security-Policy` absent, while `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `Permissions-Policy`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, and strict CORS are enforced.

## 3. Security Rationale
- The API serves JSON/data responses rather than browser-rendered HTML documents, so the absence of `Content-Security-Policy` on `/health` is **not** a critical vulnerability.
- Applying `add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none'" always;` in Nginx `location /api/` (`PHASE_5_3_55_PROPOSED_NGINX_CSP_PATCH.md`) remains **recommended defence-in-depth** when operator SSH access to the `nginx/1.18.0 (Ubuntu)` API VM is available.
