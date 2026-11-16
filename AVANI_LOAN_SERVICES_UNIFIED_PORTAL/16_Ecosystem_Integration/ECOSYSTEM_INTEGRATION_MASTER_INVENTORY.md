# ECOSYSTEM INTEGRATION MASTER INVENTORY (2026-11-16)

| Provider / Component | Category | Adapter / Endpoint | Auth / Credentials | Mode / Classification |
|---|---|---|---|---|
| Website Enquiry Intake | Core Platform | `src/routes/publicEnquiryRoutes.cjs`, `/api/portal/public/enquiry` | Public + server validation | **LIVE_VERIFIED** |
| ChatMitra WhatsApp | Communication | `src/services/chatmitraProviderEngine.cjs`, `/api/whatsapp-webhook` | `AISENCY_WABA_API_KEY` (present) | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| Meta WhatsApp Cloud API | Communication | `src/services/metaWhatsAppTemplateService.cjs`, `/api/meta/webhook` | `META_APP_ID`, `WHATSAPP_PHONE_NUMBER_ID`, `META_WEBHOOK_VERIFY_TOKEN` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| Twilio Messaging & Voice | Communication | `src/routes/whatsapp.cjs`, `/api/whatsapp/webhook` | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| VAPI AI Voice Calling | AI & Voice | `api/vapi-callback.js`, `/api/vapi-callback` | `VAPI_API_KEY`, `VAPI_ASSISTANT_ID` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| HubSpot CRM | CRM & Automation | `apps/integration-gateway/index.cjs`, `/api/auth/hubspot/callback` | `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_CLIENT_ID` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| Google Sheets & Apps Script | CRM & Automation | `apps/integration-gateway/index.cjs` | `GOOGLE_SHEET_APP_SCRIPT_URL`, `GOOGLE_SHEETS_ID` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| Zapier Webhooks | CRM & Automation | `apps/integration-gateway/index.cjs`, `/api/lead` | `ZAPIER_WEBHOOK_URL` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| Transactional SMTP Email | Communication | `nodemailer@10.5.0` | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
| Google Gemini AI | AI & Voice | `src/services/avaniAiAgent.cjs` | `GEMINI_API_KEY` | **MOCK_ONLY** (`PROVIDER_MODE=mock`) |
