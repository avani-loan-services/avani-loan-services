# WEBHOOK AND EVENT CATALOG (2026-11-16)

| Endpoint | Provider | Security / Validation |
|---|---|---|
| `/api/portal/public/enquiry` | Website Forms | Server-side validation, duplicate suppression, consent evidence |
| `/api/whatsapp-webhook` | ChatMitra | HMAC-SHA256 signature verification + idempotency |
| `/api/meta/webhook` | Meta WhatsApp | `META_WEBHOOK_VERIFY_TOKEN` + payload validation |
| `/api/whatsapp/webhook` | Twilio | Provider payload validation |
| `/api/vapi-callback` | VAPI | Callback event logging & correlation ID |
| `/api/lead` | HubSpot / Zapier | HubSpot V3 signature + timestamp replay check |
