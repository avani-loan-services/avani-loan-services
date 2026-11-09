# PHASE 5.3.22 — FORENSIC AUTHENTICATION ROOT CAUSE ANALYSIS

**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Domain:** `https://www.avanifinserv.com`  
**Admin Portal:** `https://www.avanifinserv.com/admin`  
**API Gateway:** `https://api.avanifinserv.com`  
**Investigation Lead:** Principal Security & Full-Stack Systems Engineer  
**Date:** November 9, 2026  
**Status:** RESOLVED & VERIFIED IN PRODUCTION  

---

## 1. EXECUTIVE SUMMARY

Following Phase 5.3.21, the business owner reported that navigating to `https://www.avanifinserv.com/admin` presented an administration login dialog displaying the error:
`"Invalid credentials provided"`

A forensic audit of the application source code, live server runtime, database schemas, and supplied screenshots was conducted. The investigation identified **four compounding root causes** that caused this authentication failure:

1. **Client-Side Form Input Pollution:** In the user's screenshot, the username field contained the string `"Admin Operations Dashboard"`. This occurred because documentation headings and operational dashboard titles were inadvertently pasted or autofilled into the username input.
2. **Missing Frontend Input Sanitation:** The frontend login form lacked whitespace and format guards, passing `"Admin Operations Dashboard"` directly to `/api/portal/auth/login`. The backend query searched for a user matching `identifier === 'admin operations dashboard'`, which does not exist, triggering an immediate 401 Unauthorized response.
3. **Dual Storage Desynchronization:** `src/services/portalAuthService.cjs` queried `db.findOne('admin_users', ...)`, which accessed an in-memory table populated only from `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/admin_users.json` during boot. It never queried or synchronized with MongoDB Atlas collection `portal_admin_users`. If an administrator password was updated in MongoDB Atlas or in environment secrets, the running backend process never recognized the change.
4. **Brute-Force Account Lockout Trigger:** Each failed attempt with the mismatched username or previous credentials incremented `failed_login_attempts`. After 5 failed attempts, the backend engaged a 15-minute account lockout (`lockout_until = now + 15 min`), causing even valid credentials to be rejected with 429 / 401.

---

## 2. DETAILED FORENSIC BREAKDOWN

### 2.1 Screenshot & Input Value Forensics
In the screenshot provided by the owner:
- Page URL: `https://www.avanifinserv.com/admin`
- Target Header: `AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal`
- Username Textbox Value: `Admin Operations Dashboard`
- Error Banner: `Invalid credentials provided`

In `src/services/portalAuthService.cjs`:
```javascript
const identifier = (usernameOrEmail || '').trim().toLowerCase();
const user = db.findOne('admin_users', u =>
  (u.username && u.username.toLowerCase() === identifier) ||
  (u.email && u.email.toLowerCase() === identifier)
);
```
When `identifier` was evaluated as `"admin operations dashboard"`, no record in `admin_users` matched, resulting in:
```javascript
db.logAudit(null, 'SYSTEM', 'LOGIN_FAILED_UNKNOWN_USER', { identifier }, ip, userAgent);
return { success: false, status: 401, message: 'Invalid credentials provided.' };
```

### 2.2 Dual-Storage Architecture Disconnect
The application possessed two disjoint credential stores:
- **MongoDB Atlas (`portal_admin_users`):** The persistent cloud database on cluster `avani-loan-services-m0.xj6nhak.mongodb.net`.
- **Local Disk JSON (`AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/admin_users.json`):** A static JSON file created during initial scaffolding.

At server startup:
```javascript
function initDatabase() {
  const tableNames = Object.keys(tables);
  for (const name of tableNames) {
    loadTable(name); // Loads purely from local disk JSON
  }
}
```
When `database.cjs` established connection with MongoDB Atlas, it did not hydrate or synchronize `tables.admin_users`. Consequently:
- Any rotation executed directly in MongoDB Atlas was ignored by the API server.
- The server remained locked to whatever bcrypt hash resided in `admin_users.json` on disk.

### 2.3 Version Control File Exposure
`admin_users.json` was tracked in the Git repository. Whenever a developer or CI/CD workflow executed `git pull origin master` on the Oracle Cloud VM, the disk file was overwritten by the committed repository state, undoing any runtime password updates.

### 2.4 Brute-Force Lockout Cascade
`portalAuthService.cjs` enforces:
```javascript
if (user.failed_login_attempts >= 5) {
  user.lockout_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  message = 'Account locked for 15 minutes due to 5 consecutive failed login attempts.';
}
```
When multiple login attempts were made with the invalid username or stale passwords, the account entered lockout mode.

---

## 3. REMEDIATION IMPLEMENTED

| Defect | Remediation Applied | Files Modified |
| :--- | :--- | :--- |
| Input Pollution | Added client-side whitespace/format validation in `handleLogin`. Rejects spaces if not email format. | `src/pages/UnifiedAdminPortal.jsx` |
| Authoritative Sync | Added `syncFromAtlas()` hook called immediately upon MongoDB Atlas connection. | `src/models/portalDatabase.cjs`, `src/models/database.cjs` |
| Atlas Direct Auth | Modified `portalAuthService.cjs` to query `PortalAdminUser` in Atlas first before in-memory fallback. | `src/services/portalAuthService.cjs` |
| Git Exposure | Untracked `admin_users.json`, `admin_sessions.json`, `admin_audit_logs.json` via `git rm --cached` and added to `.gitignore`. | `.gitignore`, `data/admin_users.example.json` |
| Credential Rotation | Created secure script `scripts/rotate_admin_credential.cjs` to update Atlas and server storage simultaneously. | `scripts/rotate_admin_credential.cjs` |
| Lockout Recovery | Automated reset of `failed_login_attempts: 0` and `lockout_until: null` on credential rotation. | `scripts/rotate_admin_credential.cjs` |

---

## 4. VERIFICATION EVIDENCE

1. **Localhost Test Suite:** `scripts/test_phase_5_3_22_auth_suite.cjs` passed with 24/24 assertions (100%).
2. **Production API Probe:** `scripts/test_live_auth_verification.cjs` executed against `https://www.avanifinserv.com/api/portal/auth/login` returned HTTP 200, JWT token, and Super Administrator role.
3. **Browser Automation:** Chrome DevTools MCP verified that entering `"Admin Operations Dashboard"` triggers the validation banner:
   `"Invalid username format. Please use 'admin' or your administrator email (without spaces)."`
4. **Live Dashboard Access:** Submitting authorized credentials successfully loaded the Executive Operations Overview with all 160 institutional records (80 Builders, 24 Schools, 56 Colleges).
