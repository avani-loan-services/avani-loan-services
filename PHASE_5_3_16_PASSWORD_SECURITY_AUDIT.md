# AVANI LOAN SERVICES — PHASE 5.3.16 PASSWORD & ACCESS SECURITY AUDIT
## AUTHENTICATION GATES, BRUTE-FORCE DEFENSE, RBAC & SECURE SESSION AUDIT

**Document Reference:** `ALS-SEC-AUDIT-P5316-20261106`  
**Security Framework:** OWASP Top 10 API Security Risks (2023) & RBI Cyber Security Guidelines  
**Audit Scope:** Password hashing algorithms, session token handling, lockout mechanisms, least privilege, zero credentials exposure, and audit logging.

---

### 1. PASSWORD CRYPTOGRAPHY & STORAGE SPECIFICATION

1. **Hashing Standard:** All user credentials stored in `admin_users` collection are hashed using **Bcrypt with a Cost Factor (Rounds) of 12**.
   - Raw passphrases are never persisted anywhere in the database, file system, or memory dumps.
   - Salt generation utilizes cryptographically secure pseudorandom number generators (`bcrypt.genSaltSync(12)`).
2. **Initial Credential Rotation & Protection:**
   - Default initial credentials generated with high entropy (24+ characters including uppercase, lowercase, numbers, and special symbols).
   - In accordance with non-negotiable security rules, credentials are never printed to stdout, git history, application logs, or public reports.
3. **Mandatory Password Replacement on First Login:**
   - Every newly created administrative user account has `must_change_password: true`.
   - The portal dashboard displays a modal prompt on initial authentication requiring the user to establish a personalized permanent secret before accessing CRM data.

---

### 2. BRUTE-FORCE DEFENSE & ACCOUNT LOCKOUT ENGINE

The authentication route (`POST /api/portal/auth/login`) implements layered multi-tier defenses:
1. **Network Rate Limiting:**
   - Enforced by `express-rate-limit`: Maximum **5 login attempts per 15-minute window per IP address**.
   - Exceeding the rate limit immediately returns `HTTP 429 Too Many Requests`.
2. **Progressive Account Lockout:**
   - Each failed authentication increments `failed_login_attempts`.
   - Responses report remaining attempts: *"Invalid credentials. X attempt(s) remaining before account lockout."*
   - Reaching **5 consecutive failed attempts** activates an automated **15-minute account lockout** (`lockout_until = Date.now() + 15 mins`).
   - Active lockouts reject further login attempts with `HTTP 429` regardless of whether subsequent attempts supply correct credentials.
3. **Audit Logging:**
   - Every failed login attempt is recorded in `admin_audit_logs` with event type `LOGIN_FAILED_BAD_PASSWORD` or `LOGIN_FAILED_UNKNOWN_USER`, capturing source IP, user agent, and timestamp.

---

### 3. SESSION MANAGEMENT & HTTP-ONLY COOKIES

- **Token Standard:** JSON Web Tokens (JWT) signed with HMAC-SHA256 utilizing a dedicated high-entropy secret (`CALCULATOR_SESSION_SECRET` / `JWT_SECRET`).
- **Token Validity:** 8-hour maximum lifetime (`expiresIn: '8h'`).
- **Transmission Security:**
  - Token delivered via **HTTP-only cookie** named `avani_portal_token`.
  - Flags enforced in production: `httpOnly: true`, `secure: true` (only transmitted over HTTPS), `sameSite: 'lax'`, `maxAge: 28800000` (8 hours).
  - Also accepts `Authorization: Bearer <token>` for automated API clients.
  - Mitigates Cross-Site Scripting (XSS) token exfiltration and Cross-Site Request Forgery (CSRF).

---

### 4. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

| Role Title | Builder DB | Education DB | CRM & Deals | Tasks | Enquiries | Reports / Exports | Automation Control |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Administrator** | Full | Full | Full | Full | Full | Full | Full (Resume/Stop) |
| **Administrator** | Full | Full | Full | Full | Full | Full | Emergency Stop Only |
| **Research Manager** | Read/Write | Read/Write | None | None | None | Export Allowed | None |
| **Sales Manager** | Read/Write | Read/Write | Read/Write | Full | Read/Write | Full | None |
| **Sales Executive** | Read/Write | Read/Write | Assigned Only | Assigned | View Only | None | None |
| **Read-Only Analyst** | Read Only | Read Only | Read Only | None | Read Only | Export Allowed | None |

---

### 5. AUDIT FINDINGS SUMMARY

| Test Item | Verification Method | Result | Status |
| :--- | :--- | :--- | :---: |
| **Unauthenticated API Gate** | Requesting `/api/portal/*` without token | Returns `HTTP 401 Unauthorized` | **PASS** |
| **Bcrypt Work Factor** | Hash format inspection (`$2b$12$...`) | Exactly 12 rounds verified | **PASS** |
| **Masked PM2 Logs** | Grepping production VM logs | URIs masked as `mongodb+srv:****@` | **PASS** |
| **Zero Secrets Leakage** | Automated scanning of API responses | 0 keys or URIs exposed | **PASS** |
