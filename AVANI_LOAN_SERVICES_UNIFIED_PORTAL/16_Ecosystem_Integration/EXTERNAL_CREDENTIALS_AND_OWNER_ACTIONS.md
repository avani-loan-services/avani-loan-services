# EXTERNAL CREDENTIALS AND OWNER ACTIONS (2026-11-16)

1. **Live Provider Activation (`PROVIDER_MODE`):** Currently kept as `mock` per safety rules; switching to live requires explicit owner authorization and live sandbox/prod verification for ChatMitra, Meta WhatsApp, Twilio, VAPI, HubSpot, Google Sheets, Zapier, and SMTP.
2. **Live 6-Role Production RBAC Credentials:** `admin_users.json` has `3` `Super Administrator` hashes only; supply non-admin test accounts if live `api.avanifinserv.com` RBAC verification is required.
3. **API VM Nginx CSP (`BLK-003`):** Operator SSH required on `nginx/1.18.0` VM for defence-in-depth `Content-Security-Policy` header.
