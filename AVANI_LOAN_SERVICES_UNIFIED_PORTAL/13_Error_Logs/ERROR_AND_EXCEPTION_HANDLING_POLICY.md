# ERROR AND EXCEPTION HANDLING POLICY
## TECHNICAL STANDARD & INCIDENT RESPONSE PROTOCOL

---

## 1. Core Principles & Security Invariants

The AVANI LOAN SERVICES Unified Portal enforces robust error isolation and standardized exception handling across both frontend and backend systems.

### Core Guidelines
1. **No Information Leakage:** System stack traces, database connection strings, environment variables, and SQL/NoSQL driver errors must **never** be exposed in API responses or public client consoles.
2. **Standardized Response Envelope:** Every error response strictly adheres to a consistent JSON schema across all routes.
3. **Resilient Fallback:** Transient backend or database connectivity failures must trigger graceful fallbacks rather than terminating running server processes.
4. **Permanent Audit Correlation:** Every critical exception is tagged with a unique `requestId` and logged in the immutable audit ledger.

---

## 2. Standard Error Response Format

All API errors return appropriate HTTP status codes alongside a structured JSON payload:

```json
{
  "success": false,
  "error": "VALIDATION_FAILED",
  "message": "The provided officialEmail format is invalid.",
  "timestamp": "2026-11-01T15:45:12.123Z",
  "requestId": "req-9f8e7d6c-5b4a-3210"
}
```

### Common HTTP Status Codes
| HTTP Status | Error Type | Operational Meaning |
|-------------|------------|---------------------|
| **400 Bad Request** | `BAD_REQUEST` / `VALIDATION_FAILED` | Malformed payload, missing mandatory fields, or regex failure. |
| **401 Unauthorized** | `AUTH_REQUIRED` / `INVALID_CREDENTIALS` | Missing, expired, or corrupted JWT Bearer token; wrong password. |
| **403 Forbidden** | `FORBIDDEN` / `PASSWORD_CHANGE_REQUIRED` | Insufficient RBAC role permissions or must change default password. |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | Requested builder ID, institution ID, or task ID does not exist. |
| **409 Conflict** | `DUPLICATE_RESOURCE` | Duplicate enquiry submitted within 24 hours or duplicate registration. |
| **429 Too Many Requests** | `RATE_LIMITED` / `ACCOUNT_LOCKED` | Rate limit exceeded or account locked after 5 consecutive failures. |
| **500 Internal Server Error**| `INTERNAL_SERVER_ERROR` | Unhandled server exception (masked details returned to client). |

---

## 3. Categorized Handling Policies

### 3.1 Input Validation Exceptions
- **Trigger:** Frontend or public API submissions containing blank required fields, non-numeric phone numbers, or invalid email patterns.
- **Handling:** Express middleware intercepts request before reaching business controllers. A detailed `fieldErrors` array is returned to allow frontend UI to highlight specific inputs.

### 3.2 Authentication & Security Exceptions
- **Failed Login Attempts:** Increment the user's failed attempts counter in `users.json`. If attempts reach **5**, set `isLocked: true` and `lockoutUntil: Date.now() + 15 * 60 * 1000`. Return HTTP 429.
- **Token Expiration:** JWT expiration triggers automatic token invalidation. The React client catches HTTP 401, clears local session caches, and gracefully redirects to `/admin/login` with an informational toast.

### 3.3 Database & Storage Exceptions
- **MongoDB Connection Failure:** If cloud MongoDB is unreachable, the system automatically engages the in-memory/JSON filesystem storage engine (`portalDatabase.cjs`). Operations continue seamlessly without downtime.
- **File System Write Collision:** Asynchronous writes to `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/*.json` utilize atomic write-then-rename operations to prevent file corruption during concurrent edits.

### 3.4 Integration & External Communication Exceptions
- **External API Downtime:** If third-party SMTP or WhatsApp servers return HTTP 5xx or timeout, requests enter an exponential backoff queue ($2^n$ retries).
- **Circuit Breaker:** After 5 consecutive failures, outbound dispatches pause automatically to prevent API quota exhaustion and alert administrators.

---

## 4. Audit Logging & Masking Protocol

All errors and administrative operations are recorded in `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/auditLogs.json`.

### Sensitive Data Masking Rule
The logging engine applies regex filters before writing log entries to sanitize sensitive data:
- Passwords, secret keys, and JWT tokens are replaced with `[REDACTED]`.
- PAN cards and personal financial documents are masked showing only last 4 digits (`XXXX-XXXX-1234`).
- Email addresses in debug logs are partially obscured (`a***i@avanifinserv.com`).

---

## 5. Developer & Operational Incident Playbook

1. **Investigating an Incident:**
   - Check `auditLogs.json` or the **Audit Logs** view in the Unified Dashboard.
   - Cross-reference the user's `requestId` against server logs.
2. **Account Lockout Recovery:**
   - An administrator can unlock a locked account via the User Management panel or by issuing a PATCH to `/api/portal/auth/users/:userId/unlock`.
3. **Emergency Disconnect:**
   - If aberrant automated messages are detected, immediately engage the **Emergency STOP Switch** from the top navigation bar to halt all outbound communications.
