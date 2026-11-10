# PHASE 5.3.24 — APPLICATION SECURITY & CREDENTIAL HANDLING AUDIT

- **Project:** AVANI LOAN SERVICES
- **Audit Date:** 2026-11-10T12:33:00+05:30
- **Auditor:** Senior Application Security & Systems Engineer
- **Security Standard:** OWASP Top 10 (2021) / NIST SP 800-63B Authentication Standards

---

## 1. CREDENTIAL EXPOSURE RISK AUDIT & REMEDIATION

### A. The Incident: Command-Line Password Injection
In the terminal screenshot supplied by the owner:
```powershell
node scripts/rotate_admin_credential.cjs --password "..."
```
**Vulnerability Identified:**
When secrets are passed as command-line arguments:
1. They are stored in plaintext in the operating system's shell history file (e.g. `C:\Users\<user>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt`).
2. They are visible in process monitoring tools (Task Manager, `Get-Process`, Process Explorer) while running.
3. They are captured in terminal scrollback buffers and screenshots.

**Corrective Measures Implemented:**
1. **Interactive Hidden Prompt:** `scripts/rotate_admin_credential.cjs` now defaults to an interactive hidden prompt with `*` character masking when running in an interactive terminal.
2. **CLI Warning:** If a user supplies `--password`, the script emits an explicit security alert advising that the secret is stored in shell history.
3. **History Purge Guide Provided:** The owner is guided to clear the specific command from `ConsoleHost_history.txt`.

---

## 2. SOURCE CONTROL & GIT INTEGRITY

Both secret files were audited against `.gitignore`:
```bash
git check-ignore -v .admin_credential_rotated.secret .admin_credential.secret
```
**Output:**
```text
.gitignore:72:*.secret    .admin_credential_rotated.secret
.gitignore:72:*.secret    .admin_credential.secret
```
Neither file is tracked by Git, and both are protected by wildcard rule `*.secret`.
A repository audit confirmed 0 commits track `.secret`, `.env`, or `.env.local`.

---

## 3. SESSION MANAGEMENT & CRYPTOGRAPHIC STRENGTH

1. **Password Hashing:**
   - Evaluated: `bcrypt` with salt rounds = 12.
   - Resilient against GPU-accelerated rainbow table and dictionary attacks.
2. **Session Token Issuance:**
   - Evaluated: HMAC-SHA256 JWT tokens with 8-hour expiry and signed session identifiers.
3. **Session Revocation Boundary:**
   - Password rotation now actively iterates active session records for the user and revokes them in both MongoDB Atlas (`portal_admin_sessions`) and local session caches.
   - Revoked sessions are immediately rejected with HTTP 401.
4. **Brute-Force & Lockout Protection:**
   - 5 consecutive failed attempts trigger an automatic 15-minute account lockout (`lockout_until`).
   - Reset automatically upon successful credential rotation or lockout timeout expiration.

---

## 4. SECURITY AUDIT CHECKLIST

| Security Control | OWASP Category | Verification Status | Notes |
| :--- | :--- | :---: | :--- |
| **Password Storage** | A02: Cryptographic Failures | `PASS` | 12-round bcrypt hash stored; 0 plaintext stored. |
| **Session Invalidation** | A07: Identification & Auth | `PASS` | All sessions invalidated upon password change. |
| **Brute Force Lockout** | A07: Identification & Auth | `PASS` | 5 failed attempts -> 15 min account lock. |
| **Secret Leakage in Logs** | A09: Security Logging | `PASS` | Zero passwords, hashes, or tokens printed. |
| **Git Exclusion** | A05: Security Misconfig | `PASS` | `*.secret`, `.env`, `.env.local` strictly ignored. |
| **Interactive Terminal Input** | A04: Insecure Design | `PASS` | Masked TTY raw-mode password input. |
