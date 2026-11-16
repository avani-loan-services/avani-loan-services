# 12 — NGINX OFFLINE VALIDATION (PHASE 5.3.63)

- **Binary Check (`where.exe nginx`):** Not installed locally -> `OFFLINE_NGINX_VALIDATION_NOT_AVAILABLE` for `nginx -t` binary execution.
- **Directive-Level Audit (`infra/nginx/nginx.conf` vs `evidence/phase_5_3_55/PHASE_5_3_55_PROPOSED_NGINX_CSP_PATCH.md`):**
  1. `proxy_hide_header Content-Security-Policy;` in `location /api/` prevents duplicate CSP headers from upstream Express (`src/server.cjs` lines 18–21).
  2. Exactly one `add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none'" always;` is added in `location /api/`.
  3. All parent `http {}` security headers (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options "DENY"`, `X-XSS-Protection "1; mode=block"`) are explicitly re-declared with `always` inside `location /api/` so Nginx `add_header` inheritance override does not drop them.
  4. `location /` and `location /webhook/` remain unaltered.
- **Production VM:** Not touched or reloaded.
