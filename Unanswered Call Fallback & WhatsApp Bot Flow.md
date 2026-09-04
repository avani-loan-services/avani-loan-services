# Unanswered Call Fallback & WhatsApp Bot Flow

Since the Twilio `+1` number has a high rejection rate in India, implementing an automatic WhatsApp fallback is the perfect omnichannel strategy. We will detect when a customer doesn't pick up and instantly move the conversation to WhatsApp.

## Proposed Architecture

1. **Detect Missed Call:** When the AI dialer hangs up, Vapi sends an `end-of-call-report`. We will check the `endedReason` (e.g., `customer-did-not-answer`, `voicemail`, `failed`).
2. **Trigger WhatsApp:** If the call was missed, `AVANI AI CRM` will ping `AVANI LOAN AGENTS` to send a specific WhatsApp template (e.g., `missed_call_outreach`) using your Meta number `7249108474`.
3. **Inbound WhatsApp Bot (NEW):** We will create an inbound webhook in `AVANI LOAN AGENTS` so that when the customer replies "YES" to the missed call message, the system automatically replies with the document upload link and your official WABA number.

> [!IMPORTANT]
> **User Review Required: WhatsApp Template Name**
> To send the first automated message to a missed call, you MUST have an approved Meta template. In this plan, I will program the system to use a template named **`missed_call_outreach`**. You must create and approve this template in your Meta Business Manager, or tell me the exact name of an existing template you want to use for missed calls.

## Proposed Changes

---

### AVANI AI CRM

#### [MODIFY] [route.ts](file:///C:/Users/ALPHA-1/Desktop/AVANI%20AI%20CRM/src/app/api/vapi-webhook/route.ts)
- Update the Vapi webhook handler to extract `call.endedReason`.
- If `endedReason` is `customer-did-not-answer`, `customer-busy`, or `failed`, mark the lead status as "Missed Call" in the database.
- Forward the lead to `AVANI LOAN AGENTS` with a new `event_type: 'missed_call'`.

---

### AVANI LOAN AGENTS

#### [MODIFY] [route.ts (incoming-lead)](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/AVANI%20LOAN%20AGENTS/app/api/incoming-lead/route.ts)
- Update the receiver to accept the `event_type` parameter and pass it to the orchestrator.

#### [MODIFY] [orchestrator.ts](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/AVANI%20LOAN%20AGENTS/lib/services/orchestrator.ts)
- Add branching logic: If it's a standard interested lead, do the normal sync. If it's a `missed_call`, only trigger the `sendWhatsAppMissedCall` function.

#### [MODIFY] [whatsapp.ts](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/AVANI%20LOAN%20AGENTS/lib/services/whatsapp.ts)
- Add `sendWhatsAppMissedCall()` function to send the Meta template for missed calls.
- Add `sendWhatsAppDirectMessage()` function to send plain text replies (used when the customer replies to us).

#### [NEW] [route.ts (whatsapp-webhook)](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/AVANI%20LOAN%20AGENTS/app/api/whatsapp-webhook/route.ts)
- Create a brand new endpoint `GET /api/whatsapp-webhook` to verify the Meta webhook setup.
- Create `POST /api/whatsapp-webhook` to receive incoming WhatsApp messages from customers.
- **Bot Logic:** If the incoming message is from a customer (e.g., they reply "Yes" or "Interested"), the bot will automatically reply: 
  *"Thank you for your interest! Please submit your documents securely on our portal: https://www.avanifinserv.com/documents. For any further assistance, you can also reach our official WhatsApp number: +91 9175635165."*

## Open Questions
1. Is the Meta Template name `missed_call_outreach` acceptable for the initial outreach message, or do you have a different approved template you want to use?
2. To receive messages (the customer replying "Yes"), you will need to log into the Meta Developer Portal and set the Webhook URL to `https://avani-loan-agents.onrender.com/api/whatsapp-webhook`. Are you comfortable configuring the Meta Webhook after I write the code?

## Verification Plan
1. Send a test webhook payload simulating a "missed call" from Vapi.
2. Verify that the CRM forwards it as a `missed_call` event.
3. Send a test inbound payload to the new WhatsApp Webhook to verify it replies with the document link.
