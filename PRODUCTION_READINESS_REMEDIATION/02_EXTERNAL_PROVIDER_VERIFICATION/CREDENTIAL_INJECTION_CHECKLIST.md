# External Provider Credential Injection & Owner Activation Checklist (Phase 2)

**Timestamp (UTC):** `2026-11-16T11:50:00Z`  
**Global Production Dispatch Switch:** `DISABLED` (`GLOBAL_PRODUCTION_DISPATCH_ENABLED=false`)  

---

## 1. Providers Verified Read-Only (`4 / 9`) — Still Gated Pending Owner Activation Approval

| Provider | Env Keys Present | Live Test Executed | Observed Result | Remaining Action Before Production Dispatch |
| :--- | :--- | :--- | :--- | :--- |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | `GET /2010-04-01/Accounts/<SID>.json` | `HTTP 200` (Auth PASS; zero messages sent) | Confirm `TWILIO_WHATSAPP_NUMBER` / sender registration + Owner enable approval |
| **HubSpot** | `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET` | `GET /crm/v3/objects/contacts?limit=1` | `HTTP 200` (Auth PASS; read-only) | Owner approval to enable `hubspot` production dispatch flag |
| **Google Sheets** | `GOOGLE_SHEET_APP_SCRIPT_URL`, `GOOGLE_SHEETS_ID` | `GET GOOGLE_SHEET_APP_SCRIPT_URL` | `HTTP 200` (Reachable; no mutation) | Inject `GOOGLE_SERVICE_ACCOUNT_JSON` if direct Sheets API write is preferred; test isolated sheet tab + Owner approval |
| **Gemini AI** | `GEMINI_API_KEY` | `GET /v1beta/models` | `HTTP 200` (Auth PASS) | Confirm quota/billing limits + Owner enable approval |

## 2. Providers Failing Auth / Missing Credentials (`5 / 9`) — Blocked Until Remediated

| Provider | Observed Blocker | Missing / Invalid Env Keys (Do Not Commit Values) | Required Owner Action |
| :--- | :--- | :--- | :--- |
| **ChatMitra** | `CREDENTIAL_MISSING` | `CHATMITRA_API_KEY` missing in Project 1 `.env` (`AISENCY_WABA_API_KEY` present only as legacy WABA key) | Issue active ChatMitra API key + webhook secret into server/Vercel env |
| **Meta WhatsApp** | `CREDENTIAL_MISSING` | `META_SYSTEM_USER_TOKEN` missing in Project 1 (`META_APP_ID` & `WHATSAPP_PHONE_NUMBER_ID` present only) | Inject permanent `META_SYSTEM_USER_TOKEN` (`whatsapp_business_messaging` + `whatsapp_business_management`) |
| **VAPI** | `FAILED` (`HTTP 401`) | `VAPI_API_KEY` / `VAPI_ASSISTANT_ID` present in `.env`, rejected with `401` by `api.vapi.ai` | Rotate/replace `VAPI_API_KEY` in VAPI dashboard and re-verify `GET /assistant/<id>` |
| **Zapier** | `FAILED` (`HTTP 404`) | `ZAPIER_WEBHOOK_URL` returns `404` on live hook probe (and in forensic Zapier check) | Recreate or re-enable live Zapier Catch Hook URL in Zapier account |
| **SMTP Email** | `CREDENTIAL_MISSING` | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` contain 11-char placeholder strings | Inject production SMTP host/port/user/app-password |
