# Unified Integration Plan: AVANI AI CRM ➔ AVANI LOAN AGENTS Dashboard ➔ Meta WhatsApp

I have inspected both of your codebases! I see your Meta WhatsApp credentials (`WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`) inside the `.env` file of your **AVANI LOAN AGENTS** app. 

This is excellent! We can now perfectly connect the two systems so that your AI caller automatically pushes the lead to your main dashboard, and your main dashboard automatically sends the official Meta WhatsApp message.

## Proposed Logic Workflow

1. **End of Call Trigger (AVANI AI CRM):**
   When the AI hangs up, your CSV Dialer system (`AVANI AI CRM`) will catch the end-of-call report. It will extract the customer's Name, Phone, and specific Loan Product.
   
2. **Forwarding to Dashboard:**
   `AVANI AI CRM` will make an HTTP POST request to `https://avani-loan-agents.onrender.com/api/incoming-lead`, securely sending the lead data.

3. **Dashboard Processing (AVANI LOAN AGENTS):**
   Your main dashboard will receive the data, save it to your `database.db` (so it appears on your dashboard UI), and then trigger the `orchestrator.ts`.

4. **Meta WhatsApp Delivery:**
   The orchestrator will call a new function we will build: `sendWhatsAppMeta()`. This function will use your official Meta Graph API credentials to send a customized WhatsApp message from "+91 7249108474 (AVANI LOAN AGENTS)".

---

## Proposed Changes

### Component 1: `AVANI AI CRM` (The AI Dialer)
#### [MODIFY] `src/app/api/vapi-webhook/route.ts`
We will add a function to forward the lead data:
```typescript
await axios.post('https://avani-loan-agents.onrender.com/api/incoming-lead', {
  name: lead.name,
  phone: lead.phone,
  loanType: lead.loanType,
  requestedAmount: lead.requestedAmount,
  callSummary: summary
});
```

### Component 2: `AVANI LOAN AGENTS` (The Dashboard in your Downloads folder)
#### [NEW] `app/api/incoming-lead/route.ts`
We will create this endpoint to receive the lead from the AI Dialer, save it to the database, and trigger the orchestrator.

#### [NEW] `lib/services/whatsapp.ts`
We will add the official Meta WhatsApp Graph API integration using your existing `.env` credentials:
```typescript
export async function sendWhatsAppMeta(lead: Lead) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  
  // Send Meta Template message with Lead.name and Lead.loan_type injected
}
```

#### [MODIFY] `lib/services/orchestrator.ts`
We will update the orchestrator to call `sendWhatsAppMeta()` instead of Twilio.

---

## User Review Required

> [!WARNING]  
> **Meta WhatsApp Template Rule:** Because you are sending an *outbound* message to initiate a conversation, Meta strictly requires you to use a **Pre-Approved Message Template**. 

## Open Questions

1. **Meta Template Name:** Do you already have an approved Message Template in your Meta WhatsApp Manager? If yes, what is the exact `Template Name`? If no, I will write the code to send a standard "hello" template, and you will need to create/approve a real template in Meta later.
2. Are you ready for me to make these code changes across both of your projects?
