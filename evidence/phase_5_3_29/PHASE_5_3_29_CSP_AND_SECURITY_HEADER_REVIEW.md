# PHASE 5.3.29 — CSP AND SECURITY HEADER REVIEW

**Status:** **VERIFIED** (Technical Investigation Complete; Zero Production Policy Deployed)  
**Scope:** AVANI LOAN SERVICES & AVANI AI CRM ONLY  

---

## 1. Duplicate Header Root Causes & Effective Production Headers

### Observed Production Headers (`https://api.avanifinserv.com/health` via Nginx + Express Helmet)
Live `curl.exe -sI https://api.avanifinserv.com/api/health` output confirmed duplicate emissions from **two layers**:
1. **Layer 1 — Express Helmet (`src/server.cjs` lines 9–12):**
   - `helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })`
   - Emits: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-XSS-Protection: 0`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `Referrer-Policy: no-referrer`.
2. **Layer 2 — Oracle Nginx Reverse Proxy (`/etc/nginx/sites-enabled/*`):**
   - Explicitly sets `add_header X-Frame-Options "SAMEORIGIN" always;`, `add_header X-XSS-Protection "1; mode=block" always;`, `add_header X-Content-Type-Options "nosniff" always;`, `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`.
3. **Combined Effective Header Collision:**
   - `X-Frame-Options: SAMEORIGIN, SAMEORIGIN`
   - `X-Content-Type-Options: nosniff, nosniff`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains, max-age=31536000; includeSubDomains`
   - Conflicting `X-XSS-Protection`: Helmet sends `0`, Nginx appends `1; mode=block`.
   - `Content-Security-Policy`: **Absent** (`null`) on both `https://www.avanifinserv.com` (Vercel) and `https://api.avanifinserv.com` (Nginx + Express).

---

## 2. Local CSP-Report-Only Probe Findings

A temporary local Node probe served built `dist/` on `http://127.0.0.1:4199` with `Content-Security-Policy-Report-Only` and a `POST /__csp_report` collector across `/calculators` and `/admin?tab=builder`.

**Observed Violations (`violationCount: 7`):**
1. **`connect-src` blocked:** `https://forms.hsforms.com/embed/v3/form/244236573/edde042c-3451-420a-a472-6a5c42cbdf98/json?...`
   - *Reason:* HubSpot embed v2 fetches form JSON from `https://forms.hsforms.com` in addition to `forms-na1.hsforms.com` / `forms-na2.hsforms.com` and HubSpot metrics endpoints.
2. **`font-src` blocked:** `https://unpkg.com/lucide-static@latest/font/Lucide.ttf`
   - *Reason:* External Lucide static font fallback or stylesheet font reference.
3. **`frame-src` blocked:** `http://js.hsforms.net` (scheme `http:` triggered inside HubSpot embed script!).
   - *Functional Risk:* Enforcing `frame-src` without checking/replacing the HubSpot script behavior or permitting its iframe transport can break the embedded HubSpot enquiry form on public pages.

---

## 3. Legitimate Third-Party Origin Inventory (`index.html` + Runtime Probe)
- **Analytics (GA4):** `https://www.googletagmanager.com`, `https://www.google-analytics.com`, `https://analytics.google.com`
- **HubSpot Forms & Telemetry:** `https://js.hsforms.net`, `http://js.hsforms.net` (observed runtime iframe attempt), `https://static.hsappstatic.net`, `https://forms.hsforms.com`, `https://forms-na1.hsforms.com`, `https://forms-na2.hsforms.com`, `https://app-na2.hubspot.com`, `https://metrics-fe-na1.hubspot.com`, `https://metrics-fe-na2.hubspot.com`
- **Vapi AI Widget:** `https://cdn.jsdelivr.net`, `https://api.vapi.ai`, `wss://api.vapi.ai`
- **Fonts & UI Assets:** `https://fonts.googleapis.com`, `https://fonts.gstatic.com`, `https://unpkg.com`
- **API & Auth Backend:** `https://api.avanifinserv.com`

---

## 4. Recommended Least-Privilege CSP & Safe Rollout Sequence (DO NOT DEPLOY NOW)

```http
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net https://js.hsforms.net https://static.hsappstatic.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com https://unpkg.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://api.avanifinserv.com https://www.google-analytics.com https://analytics.google.com https://forms.hsforms.com https://forms-na1.hsforms.com https://forms-na2.hsforms.com https://app-na2.hubspot.com https://metrics-fe-na1.hubspot.com https://metrics-fe-na2.hubspot.com https://api.vapi.ai wss://api.vapi.ai;
  frame-src 'self' https://js.hsforms.net http://js.hsforms.net https://forms.hsforms.com https://forms-na1.hsforms.com https://forms-na2.hubspot.com https://forms-na2.hsforms.com;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'self';
```

### Safe Rollout Sequence
1. **Deduplicate Headers First:** Remove duplicate `X-Frame-Options`, `X-XSS-Protection`, `X-Content-Type-Options`, and `Strict-Transport-Security` from either Nginx or Helmet (keep HSTS at TLS proxy, Helmet handles app headers cleanly) so conflicting `X-XSS-Protection: 0, 1; mode=block` disappears.
2. **Self-Host / Remove Inline Init Scripts (Future Hardening):** Move GA4/HubSpot/Vapi inline `<script>` tags in `index.html` to a module bundle so `'unsafe-inline'` in `script-src` can later be retired (or use Vercel nonces).
3. **Deploy `Content-Security-Policy-Report-Only` Only:** Collect reports for 7 days across desktop/mobile (`Home`, `Services`, `Calculators`, `Contact`, `Admin Login`, `Templates`, `Campaigns`, `Builders`).
4. **Enforce Only at 0 Breakages:** Verify HubSpot form submission, Vapi assistant, Google Fonts, and Admin CRM downloads succeed with zero console blocks before switching to `Content-Security-Policy`.
