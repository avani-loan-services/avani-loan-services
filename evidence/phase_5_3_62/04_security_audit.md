# 04 — SECURITY & PROTECTED DATA AUDIT (PHASE 5.3.62)

- **Server Security Controls (`src/server.cjs`):**
  - `helmet` enabled, `Permissions-Policy: camera=(), microphone=(self), geolocation=(), payment=(), usb=()`.
  - `/api` & `/health` enforce `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`.
  - Strict CORS allowlist (`https://www.avanifinserv.com`, `https://avanifinserv.com`, `https://api.avanifinserv.com`, and `https://avani-loan-service-fy-26-27*.vercel.app`).
  - `req.rawBody` preserved for webhook HMAC signature verification; malformed JSON returns `400` safely.
- **Security Test Suite (`tests/security/test_pii_and_consent.test.cjs` + `tests/unit/test_hubspot_signature.test.cjs`):**
  - Consent gate blocks KYC/Underwriting without consent: **PASS**
  - PAN/Aadhaar PII masking in state and logs: **PASS**
  - TRAI DND opt-in gate for outbound voice calls: **PASS**
  - HubSpot V3 signature + timestamp replay protection: **PASS**
- **`.gitignore` Secret Exclusions:** Excludes `.env`, `.env.*`, `backend/.env`, `Mongodb project details.txt`, `*.key`, `*.pem`, `*.p12`, `*.pfx`, `service-account*.json`, `.vercel`.
- **Protected Resources Preserved:** `ENV_67_NONEMPTY=True`, `MONGODB_DETAILS_EXISTS=True`, `PROVIDER_MODE` untouched, zero secret values printed or committed.
