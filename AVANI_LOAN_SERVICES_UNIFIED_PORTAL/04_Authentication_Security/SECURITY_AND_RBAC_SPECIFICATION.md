# AVANI LOAN SERVICES — SECURITY & RBAC SPECIFICATION
## PASSWORD-PROTECTED PORTAL SECURITY ARCHITECTURE

### 1. AUTHENTICATION & CREDENTIAL SECURITY
The AVANI LOAN SERVICES administration portal (`/admin/` and `/admin/dashboard`) is protected by a multi-layered security architecture:
1. **Bcrypt Hash Storage:** Plaintext passwords are never stored in databases, configuration files, environment strings, or memory caches. Passwords are salted and hashed using `bcrypt` with work factor 12.
2. **Initial Administrator Provisioning:**
   - Seed Account: `admin` / `admin@avanifinserv.com`
   - Initial Temporary Password: Securely generated upon provisioning (configured via `ADMIN_INITIAL_PASSWORD` environment variable or private handoff).
   - Mandatory Replacement Flag: `must_change_password: true`.
   - Any attempt by the initial administrator to perform operational tasks before changing the password triggers an enforced interactive modal.
3. **Session & Cookie Security:**
   - Server-side cryptographic JSON Web Tokens (`jwt`) signed with `CALCULATOR_SESSION_SECRET`.
   - Token expiry: 8 hours.
   - Dual delivery: Transmitted via HTTP-Only, Secure, SameSite `Lax` cookies (`avani_portal_token`) and supported via `Authorization: Bearer <token>` headers for API clients.

---

### 2. RATE LIMITING & ACCOUNT LOCKOUT
- **Login Rate Limiting:** Enforced via `express-rate-limit`: Maximum 5 failed attempts per 15-minute window per IP.
- **Account Lockout:** If an account receives 5 consecutive incorrect password submissions, the account enters a 15-minute lockout state (`lockout_until = NOW + 15m`).
- **Enquiry Rate Limiting:** Public form endpoints (`/api/portal/public/*`) are restricted to 10 submissions per hour per IP to prevent spam bot flooding.

---

### 3. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

| Role | Permissions & Access Scope |
|---|---|
| **Super Administrator** | Full platform control (`*`): User creation, role reassignment, password reset, global emergency STOP switch, and system settings. |
| **Administrator** | Record management, pipeline progression, audit log review, report generation, and CSV/XLSX exports. |
| **Research Manager** | Builder and Educational institution verification, MahaRERA reviews, qualification score calibration, and research audits. |
| **Sales Manager** | Pipeline deal assignments, activity logs, partnership proposal reviews, and outreach approvals. |
| **Sales Executive** | Lead viewing, activity logging, follow-up scheduling, and enquiry triage for assigned regions. |
| **Read-Only Analyst** | Read-only inspection of dashboards, databases, performance metrics, and pre-generated XLSX reports. |

---

### 4. AUDIT LOGGING & COMPLIANCE
Every administrative action (login, logout, failed attempt, stage transition, user creation, data export, and emergency STOP activation) generates an immutable audit record in `admin_audit_logs`:
- `log_id`: Unique identifier
- `user_id`: Authenticated user or system daemon
- `module`: `BUILDER`, `EDUCATION`, `SYSTEM`, `AUTOMATION`, `ENQUIRY`
- `action`: Specific operation code
- `details`: JSON payload of metadata and changed attributes
- `ip_address`: Client remote IP address
- `timestamp`: UTC timestamp
