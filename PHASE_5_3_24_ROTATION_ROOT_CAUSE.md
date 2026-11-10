# PHASE 5.3.24 — ROTATION ROOT CAUSE ANALYSIS & CODE FORENSICS

- **Project:** AVANI LOAN SERVICES
- **Audit Date:** 2026-11-10T12:31:00+05:30
- **Scope:** `scripts/rotate_admin_credential.cjs`, `src/services/portalAuthService.cjs`, `src/models/portalDatabase.cjs`

---

## 1. THE REPORTED DEFECT

The owner's terminal output showed:
```text
  MongoDB Atlas update warning: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
 Live Production API (https://www.avanifinserv.com) updated successfully via authenticated session.
 Local server storage admin_users.json updated successfully.
 Local admin_sessions.json invalidated.
 Secure credentials recorded to git-ignored file: .admin_credential_rotated.secret
=== ROTATION SUMMARY ===
Username / Identifier : admin (or admin@avanifinserv.com)
Role                  : Super Administrator
Account Lockout       : RESET (failed attempts: 0, lockout: null)
MongoDB Atlas Sync    : VERIFIED
Server Storage Sync   : VERIFIED
Session Revocation    : ALL SESSIONS REVOKED
Credential Storage    : Written to local .admin_credential_rotated.secret
Status                : SUCCESS
```

The user observed that line 1 announced an Atlas connection failure, while line 10 claimed `MongoDB Atlas Sync: VERIFIED`.

---

## 2. CODE FORENSIC TRACE

### A. The Direct Connection Failure
In `scripts/rotate_admin_credential.cjs` (original lines 50-89):
```javascript
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
let mongoUpdated = false;

if (mongoUri) {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    // ... update mongo ...
    mongoUpdated = true;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas update warning:', err.message);
  }
}
```
When executed from the developer machine:
1. Public IP `106.210.148.3` was NOT whitelisted in the MongoDB Atlas Network Access Access List.
2. The initial Mongoose connection threw `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster...`.
3. The catch block caught the error and printed the warning.
4. `mongoUpdated` remained `false`.

### B. The Production API Fallback
In `scripts/rotate_admin_credential.cjs` (original lines 100-135):
```javascript
if (!mongoUpdated) {
  // Read current password from local .admin_credential_rotated.secret
  // Call https://www.avanifinserv.com/api/portal/auth/login
  // Call https://www.avanifinserv.com/api/portal/auth/change-password
  if (changeData.success) {
    console.log('✅ Live Production API (https://www.avanifinserv.com) updated successfully via authenticated session.');
    mongoUpdated = true; // <-- CRITICAL LOGIC FLAW
  }
}
```
Notice line 127: `mongoUpdated = true;`.
The script developer reused `mongoUpdated` as a shorthand flag for "credential was successfully updated somewhere authoritative".

### C. The Contradictory Summary Display
In `scripts/rotate_admin_credential.cjs` (original line 213):
```javascript
console.log('MongoDB Atlas Sync    :', mongoUpdated ? 'VERIFIED' : 'OFFLINE/SKIPPED');
```
Because `mongoUpdated` had been set to `true` by the Production API fallback, the summary printed:
`MongoDB Atlas Sync: VERIFIED`!

---

## 3. SECONDARY ARCHITECTURAL FINDING: SESSION REVOCATION GAP

In `src/services/portalAuthService.cjs` (original `changePassword` function):
```javascript
async function changePassword(userId, currentPassword, newPassword, ip, userAgent) {
  // ... validate current password ...
  // ... hash new password ...
  user.password_hash = await bcrypt.hash(newPassword, salt);
  user.must_change_password = false;
  user.updated_at = new Date().toISOString();
  db.upsert('admin_users', 'user_id', user);
  // NO SESSION INVALIDATION OCCURRED HERE!
}
```
When an administrator's password was changed, previously issued JWT tokens and session records remained valid until natural 8-hour expiry.

---

## 4. REMEDIATION IMPLEMENTED

1. **Decoupled Status Reporting in `scripts/rotate_admin_credential.cjs`:**
   - Introduced separate state variables:
     - `directAtlasStatus` (`VERIFIED`, `BLOCKED`, `FAILED`, `SKIPPED`)
     - `prodApiStatus` (`VERIFIED`, `FAILED`, `SKIPPED`)
     - `prodBackendStorage` (`mongodb_atlas`, `in_memory_safeguard`, `unknown`)
     - `localJsonStatus` (`VERIFIED`, `FAILED`)
     - `sessionRevocationStatus` (`REVOKED_ATLAS_AND_LOCAL`, `REVOKED_LOCAL_ONLY`)
   - `directAtlasStatus` can ONLY be `'VERIFIED'` if direct `mongoose.connect()` succeeded and updated the Atlas collection.
   - When updated via the Production API, the status is clearly reported as:
     `PARTIAL_SUCCESS — UPDATED VIA PRODUCTION PROXY (mongodb_atlas (connected))`
     with an explicit explanation that direct local IP access is blocked by the Atlas firewall.
2. **Interactive Password Input:**
   - Implemented `promptHiddenPassword()` using Node.js TTY raw mode to accept input without echoing characters to the terminal or command history.
3. **Session Invalidation on Password Change:**
   - Modified `src/services/portalAuthService.cjs` to iterate active sessions for the user in `db.tables.admin_sessions` and MongoDB `portal_admin_sessions`, marking `is_revoked: true` immediately.
