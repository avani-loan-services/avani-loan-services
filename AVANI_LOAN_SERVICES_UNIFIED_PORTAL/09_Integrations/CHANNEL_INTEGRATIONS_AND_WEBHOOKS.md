# CHANNEL INTEGRATIONS, WEBHOOKS & COMMUNICATIONS ENGINE
## ARCHITECTURAL SPECIFICATION & CONFIGURATION GUIDE

---

## 1. Overview & Communication Principles

The AVANI LOAN SERVICES Unified Portal features a modular communications dispatch engine capable of interfacing with corporate email systems, official WhatsApp Business accounts, and inbound webhooks.

### Foundational Invariants
1. **Consent-Gated Dispatch:** No outbound email or WhatsApp message can be dispatched without verifying that `consent_status === "opt_in"` or that an explicit Category A/B contact route exists.
2. **Emergency STOP Interception:** Every outbound dispatch pipeline queries `automationState.json`. If `outboundMessagingHalted === true`, the dispatch job aborts immediately and logs an intercept event.
3. **No Hardcoded Credentials:** All API keys, SMTP credentials, and webhook secrets are sourced exclusively from environment variables (`process.env`).

---

## 2. Email Integration (SMTP & Transactional API)

The system supports standard enterprise SMTP transports as well as REST-based transactional email providers (e.g., SendGrid, Amazon SES, Postmark).

### 2.1 Configuration Parameters (.env)
```env
# Enterprise Email Transport Configuration
PORTAL_SMTP_HOST=smtp.avanifinserv.com
PORTAL_SMTP_PORT=587
PORTAL_SMTP_SECURE=false
PORTAL_SMTP_USER=partnerships@avanifinserv.com
PORTAL_SMTP_PASSWORD=************************
PORTAL_EMAIL_FROM_NAME="AVANI LOAN SERVICES — Institutional Advisory"
PORTAL_EMAIL_FROM_ADDR=advisory@avanifinserv.com
PORTAL_EMAIL_REPLY_TO=sachin@avanifinserv.com
```

### 2.2 Dispatch Flow & Template Interpolation
1. **Trigger:** User actions on the **Campaigns & Outreach** dashboard or automated CRM stage transitions (e.g., `Stage 6: Introduction Ready`).
2. **Sanitization & Merge:** The template engine merges prospective institutional details (`{{institutionName}}`, `{{trustName}}`, `{{contactPerson}}`) while sanitizing any malicious markup.
3. **Delivery Tracking:** A unique message ID and delivery token are registered in `auditLogs.json` for receipt correlation.

---

## 3. Official WhatsApp Business Cloud API

Integration with the Meta WhatsApp Business Cloud API (or certified BSPs such as Gupshup / Twilio) enables formal institutional outreach and meeting confirmations.

### 3.1 Configuration Parameters (.env)
```env
# WhatsApp Business Cloud API Settings
WHATSAPP_API_ENDPOINT=https://graph.facebook.com/v19.0
WHATSAPP_PHONE_NUMBER_ID=109283746592837
WHATSAPP_BUSINESS_ACCOUNT_ID=293847561029384
WHATSAPP_BEARER_TOKEN=EAAK...********************
WHATSAPP_WEBHOOK_VERIFY_TOKEN=avani_waba_verify_token_2026
```

### 3.2 Pre-Approved Template Architecture
In accordance with Meta and TRAI regulations, unsolicited promotional messaging is prohibited. All initial communications utilize pre-approved institutional templates:
- **Template `als_builder_partnership_intro_v1`:** Formal introduction to real estate developer sales directors.
- **Template `als_edu_funding_advisory_v1`:** Formal briefing for educational trust management.
- **Template `als_meeting_confirmation_v1`:** Calendar invitation and discovery meeting agenda.

---

## 4. Inbound Webhooks & Payload Security

The portal exposes secure webhook endpoints for receiving status callbacks from external communication providers and partner networks.

### 4.1 Endpoint Inventory
- `POST /api/portal/webhooks/email-status`: Delivery, open, bounce, and spam complaint notifications.
- `POST /api/portal/webhooks/whatsapp-inbound`: Delivery receipts and inbound prospect replies.
- `POST /api/portal/webhooks/lead-partner-sync`: External lead-generation partner integrations.

### 4.2 Webhook Security & Signature Verification
All inbound webhook payloads must be authenticated using HMAC SHA-256 signatures:
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(req, secret) {
  const signature = req.headers['x-avani-signature'] || req.headers['x-hub-signature-256'];
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

---

## 5. Automated Retry Logic & Failure Handling

To guarantee reliability across transient network failures:
1. **Exponential Backoff:** If an external dispatch request fails (e.g., HTTP 429 or 503), the dispatch worker retries at intervals of $2^n \times 1000\text{ ms}$ (1s, 2s, 4s, 8s, up to 3 retries).
2. **Circuit Breaker:** If 5 consecutive outbound attempts fail within a 2-minute window, the subsystem raises a priority warning on the dashboard and queues messages in `pendingOutbound.json` rather than discarding them.
3. **Bounce & Suppression Ledger:** Any hard bounce (SMTP 550) or WhatsApp invalid number receipt immediately marks the contact record as `Restricted / Invalid Channel` to prevent repeat attempts.
