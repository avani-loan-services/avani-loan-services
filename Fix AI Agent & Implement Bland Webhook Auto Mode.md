# Fix AI Agent & Implement Bland Webhook Auto Mode

This plan addresses why the AI Agent isn't replying to your broadcast messages and implements the "Auto Mode" for Bland AI calls so they automatically trigger WhatsApp templates.

## Why the AI Agent isn't triggering from Broadcasts
The AI Agent only "wakes up" and replies when a customer **sends an incoming message** (e.g., they reply "BL" or "I want a loan"). The broadcast feature sends an *outbound* message. Until the customer replies to that broadcast, the AI will not send a message. Additionally, because you had a dummy template ("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan) Inquiry") selected, the backend sent it as a normal text message (which was rejected by Meta's 24-hour window policy). 

## Proposed Changes

### Backend

#### [MODIFY] `whatsapp.service.ts`
- I have already modified this to throw an explicit error if you try to use an invalid dummy template. This ensures it doesn't silently fail or send as free-text.

#### [NEW] `bland.controller.ts` & `bland.service.ts`
- Implement a `POST /api/bland/webhook` endpoint to receive the "End of Call" webhook from Bland AI.
- When the webhook hits (regardless of whether they answered or not), we will automatically trigger the Meta-approved `loan_consultation_offer` template to their WhatsApp number.

#### [NEW] `seed_consultation_template.ts`
- Seed the database with the missing `loan_consultation_offer` template so it appears in your CRM dropdown. (You will need to ensure this is approved in your Meta Business Suite).

### Instructions for You (Bland AI Webhook Setup)
Once I deploy this code, you will need to log into Bland AI and set the webhook URL so it knows where to send the call data.
1. Go to your Bland AI dashboard.
2. In your Campaign or AI Agent settings, look for "Webhook" or "Post-Call Webhook".
3. Set the URL to: `https://avani-crm-backend.onrender.com/api/bland/webhook`
4. Set the Method to: `POST`

## User Review Required
> [!IMPORTANT]
> Please approve this plan so I can implement the Bland Webhook and seed the `loan_consultation_offer` template. 
> Also, remember to **refresh your browser** on the Live CRM to load the latest templates!
