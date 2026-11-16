# PRODUCTION INTEGRATION ACCEPTANCE (2026-11-16)

| Integration | Mode / Config | Local / Mock Suite | Live Production Status |
|---|---|---|---|
| Website CRM Intake (`/api/public/enquiry`) | Active | `test_website_crm_intake` (`5/5` PASS) | Live routes `HTTP 200` |
| ChatMitra / WhatsApp | `PROVIDER_MODE=mock` | `chatmitra_integration` (`12/12` PASS) | **MOCK-ONLY** (no live messages sent) |
| Integration Gateway (HubSpot/Sheets/Zapier) | `PROVIDER_MODE=mock` | `test_integration_gateway` (`6/6` PASS), `forensic:test` PASS | **MOCK-ONLY** |
| HubSpot V3 Signature & Replay | Active | `test_hubspot_signature` (`7/7` PASS) | Verified in code |
| VAPI / Twilio Voice | `PROVIDER_MODE=mock` | `test_pii_and_consent` TRAI DND gate PASS | **MOCK-ONLY** (live calling disabled per policy) |
