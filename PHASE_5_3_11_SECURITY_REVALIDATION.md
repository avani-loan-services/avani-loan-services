# AVANI LOAN SERVICES — PHASE 5.3.11 SECURITY REVALIDATION
## Perimeter, Transport, Proxy, HTTP Headers, Access Control & Browser Security Re-Audit

**Audit Date:** November 5, 2026  
**Auditor:** Senior Application Security Auditor & DevOps Architect  
**Target Domain:** `https://api.avanifinserv.com`  
**Host IP:** `80.225.206.249`  
**Audit Standard:** OWASP ASVS Level 2 / Production Hardening Benchmark  
**Audit Status:** PASSED (Perimeter cloaked, TLS active, RBAC enforced; CORS & CSP optimization recommendations registered)

---

## 1. Network Perimeter & Port Exposure

### 1.1 Localhost Binding Verification
Express server process execution was audited on the Oracle Cloud VM:
```bash
ubuntu@instance-20261104-1940:~$ sudo ss -tulpn | grep 3000
tcp   LISTEN 0      511        127.0.0.1:3000       0.0.0.0:*    users:(("node",pid=14027,fd=18))
```
- **Finding:** The Node.js process is strictly bound to loopback `127.0.0.1:3000`. It does not listen on wildcard `0.0.0.0`.

### 1.2 Direct Public Port Ingress Test
An external probe was launched directly against port 3000 from an outside internet network:
```powershell
curl.exe --connect-timeout 4 -i http://80.225.206.249:3000/api/portal/health
# Result: curl: (28) Connection timed out after 4016 milliseconds
```
- **Finding:** Direct public ingress to port 3000 is blocked at the network perimeter. All public traffic must enter through Nginx on ports 80 or 443.

---

## 2. TLS/SSL & Transport Layer Security

### 2.1 Certificate Lifecycle Audit
- **Certificate Path:** `/etc/letsencrypt/live/api.avanifinserv.com/fullchain.pem`
- **Issuer:** Let's Encrypt (`R13`)
- **Key Type:** RSA 2048-bit
- **Serial:** `63:f4:9d:3c:ea:f8:ec:03:c0:6a:3f:56:41:9e:0b:56:e6:0`
- **Validity:** Valid until February 2, 2027 (89 days remaining).
- **Automated Renewal Timer:** Systemd timer `certbot.timer` is enabled and triggered twice daily.

### 2.2 HTTP-to-HTTPS Redirection
```http
GET /api/portal/health HTTP/1.1
Host: api.avanifinserv.com

HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0 (Ubuntu)
Location: https://api.avanifinserv.com/api/portal/health
```
- **Finding:** Port 80 unconditionally redirects to HTTPS via HTTP 301.
- **Exception:** ACME challenge path `location ^~ /.well-known/acme-challenge/` serves static validation files directly from `/var/www/html` for zero-downtime certificate renewals.

---

## 3. Reverse Proxy & Modern Security Headers

### 3.1 Live Header Inspection
```http
HTTP/1.1 200 OK
Server: nginx/1.18.0 (Ubuntu)
Content-Type: application/json; charset=utf-8
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### 3.2 Security Header Evaluation & Analysis

#### A. Content-Security-Policy (CSP)
- **Current Observation:** Nginx currently relies on legacy `X-Frame-Options` and `X-XSS-Protection`.
- **Modern Security Standard:** Modern browsers have deprecated `X-XSS-Protection`. A robust Content-Security-Policy is the industry-standard mechanism to prevent cross-site scripting and frame injection.
- **API CSP Recommendation:** Because `api.avanifinserv.com` exclusively serves JSON data, an optimal API CSP header is:
  ```nginx
  add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none'; base-uri 'none';" always;
  ```
  This guarantees that even if an API endpoint is opened directly in a browser, no script execution, embedding, or base URL hijacking can occur.

#### B. HSTS `includeSubDomains` Review
- **Investigation:** We audited whether any subdomains under `avanifinserv.com` lack HTTPS support.
  - `avanifinserv.com` -> HTTPS supported (Vercel Edge).
  - `www.avanifinserv.com` -> HTTPS supported (Vercel Edge).
  - `api.avanifinserv.com` -> HTTPS supported (Let's Encrypt).
  - `mail.avanifinserv.com` -> HTTPS supported (Vercel Edge).
  - `webmail.avanifinserv.com` -> HTTPS supported (Vercel Edge).
- **Cascading Analysis:** An HSTS directive emitted by `api.avanifinserv.com` applies strictly to `api.avanifinserv.com` and its child subdomains (e.g., `*.api.avanifinserv.com`). It does NOT apply to sibling subdomains like `mail.avanifinserv.com`.
- **Finding:** Retaining `includeSubDomains` on `api.avanifinserv.com` is completely safe and causes zero disruption to other domain services.

---

## 4. CORS (Cross-Origin Resource Sharing) Audit

- **Current Implementation in `src/server.cjs`:**
  ```javascript
  app.use(cors());
  ```
  This emits `Access-Control-Allow-Origin: *`, allowing any origin to make cross-origin requests.
- **Risk Assessment:**
  1. For public lead enquiry endpoints (`/api/portal/public/*`), open CORS allows legitimate form submissions from the marketing website `https://www.avanifinserv.com`.
  2. For protected administration routes (`/api/portal/builder/*`, `/api/portal/education/*`), authentication is required via JWT/session tokens, so unauthorized data leakage is prevented by the auth middleware.
- **Recommended Hardening:**
  In a future release, configure explicit origin whitelisting:
  ```javascript
  const allowedOrigins = [
    'https://www.avanifinserv.com',
    'https://avanifinserv.com'
  ];
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Cross-origin request blocked by CORS policy'));
      }
    },
    credentials: true
  }));
  ```
  *(Action logged in Owner Action Register; not deployed autonomously to avoid disrupting marketing forms without owner signoff).*

---

## 5. Authentication & Access Control Verification

### 5.1 Unauthenticated Protection Matrix
Testing private administration endpoints without authentication credentials:

| Protected Resource | HTTP Method | Response Status | Security Verdict |
| :--- | :---: | :---: | :---: |
| `/api/portal/builder/companies` | GET | **401 Unauthorized** | **SECURED** |
| `/api/portal/education/institutions` | GET | **401 Unauthorized** | **SECURED** |
| `/api/portal/dashboard/overview` | GET | **401 Unauthorized** | **SECURED** |
| `/api/portal/auth/me` | GET | **401 Unauthorized** | **SECURED** |
| `/api/portal/tasks` | GET | **401 Unauthorized** | **SECURED** |

- **Sanitized Response Payload:**
  ```json
  {
    "success": false,
    "authenticated": false,
    "message": "Authentication required. Please login to access the administration portal."
  }
  ```
- **Information Leakage Assessment:** **ZERO**. No stack traces, environment variables, or database schema names are returned.

---

## 6. Security Revalidation Signoff
The production infrastructure satisfies all perimeter, transport, and authentication controls. Recommended header and CORS enhancements are documented and scheduled for controlled owner-approved rollout.
