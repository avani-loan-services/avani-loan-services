# NGINX CSP BLOCKER AND OPERATOR INSTRUCTIONS (2026-11-16)

**Status:** `BLOCKED — AUTHORIZED INFRASTRUCTURE ACCESS REQUIRED`

## 1. Observed Live API Headers (`https://api.avanifinserv.com/health`)

- `Server`: `nginx/1.18.0 (Ubuntu)`
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `SAMEORIGIN`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- **`Content-Security-Policy`:** **Missing** in live response headers (`~/.ssh` contains only `known_hosts` and `known_hosts.old`; no SSH private key is present on this Windows host).

## 2. Operator Execution Procedure (Run on API VM After Backup)

1. Back up active Nginx site config:
   `sudo cp /etc/nginx/sites-available/api.avanifinserv.com /etc/nginx/sites-available/api.avanifinserv.com.bak.$(date +%F_%H%M%S)`
2. Apply `location /api/` directives from `evidence/phase_5_3_55/PHASE_5_3_55_PROPOSED_NGINX_CSP_PATCH.md` (`proxy_hide_header Content-Security-Policy;`, `add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none'" always;`, plus preserved `HSTS`, `X-Content-Type-Options`, `X-Frame-Options "DENY"`, `X-XSS-Protection`).
3. Validate syntax: `sudo nginx -t`
4. Reload only if `nginx -t` exits `0`: `sudo systemctl reload nginx`
5. Verify live headers: `curl -sI https://api.avanifinserv.com/health`
6. **Rollback:** Restore the `.bak.*` file and run `sudo nginx -t && sudo systemctl reload nginx`.
