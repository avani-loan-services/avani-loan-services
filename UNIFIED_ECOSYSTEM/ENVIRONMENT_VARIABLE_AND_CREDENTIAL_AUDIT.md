# ENVIRONMENT VARIABLE AND CREDENTIAL AUDIT (ZERO-SECRET REDACTED)

*Policy: Only variable names, owning project, and `PRESENT_UNVERIFIED` / `MISSING` classification are recorded; zero secret values are printed.*

| Project | Env Files Inspected | Key Categories Present (`PRESENT_UNVERIFIED` in live mode; active in `PROVIDER_MODE=mock`) |
|---|---|---|
| **Project 1 (`1-AVANI LOAN SERVICE FY 26-27`)** | `.env`, `.env.example`, `.env.local`, `.env.production` | `ELIGIBILITY_*`, `HUBSPOT_*`, `GOOGLE_SHEET*`, `GEMINI_API_KEY`, `CALCULATOR_*`, `MAKE_WEBHOOK_URL`, `ZAPIER_WEBHOOK_URL`, `SMTP_*`, `TWILIO_*`, `VAPI_*`, `META_*`, `WHATSAPP_*`, `AISENCY_WABA_API_KEY` |
| **Project 2 (`3-AVANI AI CRM`)** | `.env.local`, `.env.production`, `.vercel/.env.production.local` | `META_APP_ID`, `AISENCY_WABA_API_KEY`, `GEMINI_API_KEY`, `HUBSPOT_API_KEY`, `ZAPIER_WEBHOOK_URL`, `GOOGLE_SHEET_APP_SCRIPT_URL`, Vercel runtime vars |
| **Project 3 (`4-AVANI LOAN AGENTS`)** | `.env` (8 keys), `.env.local` (26 keys), `.vercel/.env.production.local` (53 keys) | `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `OMNIDIM_*`, `WHATSAPP_*`, `AISENCY_WABA_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_SHEET_APP_SCRIPT_URL`, `HUBSPOT_*`, `ZAPIER_WEBHOOK_URL`, `MAKE_WEBHOOK_URL`, `PABBLY_*`, `TWILIO_*`, `VAPI_*` |
| **Project 4 (`5-AVAVI AI CALLING AGENT`)** | `calling-agent-bridge.js` env references | `CALLING_MODE` (`test_mode` default), `AVANI_CRM_URL`, `CRM_API_KEY` |

**Classification Note:** Because `PROVIDER_MODE=mock` is preserved by owner safety rules and live external provider API calls were not triggered against customer accounts, third-party provider keys are classified **`PRESENT_UNVERIFIED` (Mock-Active)** rather than `PRESENT_VALIDATED`.
