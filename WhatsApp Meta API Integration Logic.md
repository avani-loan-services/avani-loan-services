# WhatsApp Meta API Integration Logic

Based on your request, we will update the system so that as soon as the Vapi AI finishes a call with a customer, it automatically sends a WhatsApp message from your official Meta WhatsApp number (**+91 7249108474 - AVANI LOAN AGENTS**) detailing the specific loan products they inquired about.

## User Review Required

> [!IMPORTANT]  
> **Meta WhatsApp Template Rule:** Because you are sending an *outbound* message to a customer to initiate a conversation, Meta enforces a strict rule: **You can only send pre-approved Template Messages.** You cannot send raw, unstructured text. 
> You will need to create and approve a message template inside your Meta WhatsApp Manager before this code will successfully deliver the message.

## Proposed Logic Workflow

1. **End of Call Trigger:** When the AI hangs up, Vapi sends an `end-of-call-report` to our existing webhook (`/api/vapi-webhook`).
2. **Data Extraction:** The webhook uses AI to analyze the call transcript. It determines:
   - If the customer was interested.
   - The customer's Name.
   - The specific Loan Product they inquired about (e.g., "Personal Loan", "[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)", "[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)").
3. **Trigger Meta API:** If the customer is interested, the webhook will call a new function `sendMetaWhatsAppMessage()`.
4. **API Request Payload:** The function will make a POST request directly to the **Meta Graph API** (`https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages`), bypassing Twilio.
5. **Message Format:** The payload will trigger your approved Meta Template (for example, a template named `loan_product_details`). It will dynamically inject the `Customer Name` and `Loan Product` into the template variables so the customer receives a highly personalized message from "AVANI LOAN AGENTS".

## Proposed Changes

### 1. Environment Variables (`.env.local`)
We will need to add your Meta Developer credentials:
#### [NEW] `META_WA_ACCESS_TOKEN`
#### [NEW] `META_WA_PHONE_NUMBER_ID`

### 2. Integration Library (`src/lib/integrations.ts`)
#### [MODIFY] `sendWhatsAppChecklist` function
We will completely rewrite this function. We will remove the old Twilio WhatsApp code and replace it with the official **Meta WhatsApp Cloud API** code.

```typescript
export async function sendMetaWhatsAppMessage(phone: string, name: string, loanType: string) {
  const token = process.env.META_WA_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  
  // Logic to map the loanType to your specific Meta Template variables
  // ...
}
```

## Open Questions

1. Do you agree with this logic and flow? 
2. Have you already created a **Meta Developer App** and obtained your `Access Token` and `Phone Number ID`? (If not, you will need to do this in the Meta Developer Portal).
3. Do you already have an approved WhatsApp Template for this message, or do you need help formatting the exact message you want to submit to Meta for approval?
