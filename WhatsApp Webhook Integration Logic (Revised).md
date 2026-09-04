# WhatsApp Webhook Integration Logic (Revised)

Based on your clarification, we will **NOT** build the Meta WhatsApp API directly into this CRM. Instead, we will send the customer data directly to your existing **AVANI LOAN AGENTS** system hosted on Render (`https://avani-loan-agents.onrender.com`). Your existing system will then be responsible for actually sending the WhatsApp message from your number `7249108474`.

## Proposed Logic Workflow

1. **End of Call Trigger:** When the AI hangs up, Vapi sends an `end-of-call-report` to our existing webhook (`/api/vapi-webhook`).
2. **Data Extraction:** The webhook uses AI to analyze the call transcript. It determines:
   - If the customer was interested.
   - The customer's Name.
   - The specific Loan Product they inquired about (e.g., "Personal Loan").
3. **Trigger Avani Loan Agents System:** If the customer is interested, the webhook will call a new function `triggerAvaniLoanAgentsWebhook()`.
4. **API Request Payload:** The function will make a POST request to your other Render application (`https://avani-loan-agents.onrender.com`). It will securely pass the customer's Name, Phone Number, and requested Loan Product in JSON format.
5. **WhatsApp Delivery:** Once your `avani-loan-agents` system receives this data, *that* system will use its own logic to send the WhatsApp message from `7249108474`.

## Proposed Changes

### Integration Library (`src/lib/integrations.ts`)
#### [NEW] `triggerAvaniLoanAgentsWebhook` function
We will add a new function that makes an HTTP POST request to your external dashboard.

```typescript
export async function triggerAvaniLoanAgentsWebhook(lead: any) {
  // We need the exact API endpoint of your other app, e.g., /api/webhook
  const url = "https://avani-loan-agents.onrender.com/api/receive-lead"; 
  
  try {
    await axios.post(url, {
      name: lead.name,
      phone: lead.phone,
      loanType: lead.loanType,
      requestedAmount: lead.requestedAmount
    });
  } catch (error) {
    console.error("Avani Loan Agents Webhook error:", error);
  }
}
```

#### [MODIFY] `src/app/api/vapi-webhook/route.ts`
We will update the end-of-call webhook to trigger this new function automatically whenever a customer is marked as "Interested".

## Open Questions

1. **Exact API URL:** You provided `https://avani-loan-agents.onrender.com/dashboard`, but `/dashboard` is usually a webpage for humans to look at, not an API endpoint that accepts automated JSON data. Does your other application have a specific API endpoint URL designed to receive this data (like `/api/webhook` or `/api/leads`)? 
2. **Authentication:** Does your `avani-loan-agents` application require an API key or password to accept data, or is the endpoint open?
