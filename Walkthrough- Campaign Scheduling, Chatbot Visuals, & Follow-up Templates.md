# Walkthrough: Campaign Scheduling, Chatbot Visuals, & Follow-up Templates

I have successfully completed all the steps outlined in the implementation plan. Here is a summary of what was accomplished and how it works:

## 1. Background Scheduling & Cron Service (Backend)

We implemented an automated cron job in the backend that runs every minute to check for scheduled campaigns.
- Added a `CampaignsCronService` which queries the `Campaign` table for any campaigns with `status = "SCHEDULED"` and a `scheduledAt` date that has passed.
- The service processes the CSV rows, substitutes the variables into the templates, and dispatches the outbound messages (WhatsApp) or voice calls (Bland AI).
- After dispatch, the campaign status is updated to `COMPLETED`. If an error occurs, it is marked as `FAILED`.
- The NextJS backend was built successfully without errors.

## 2. WhatsApp & Voice Campaign Updates (Frontend)

Both the **Broadcasts** (WhatsApp) and **Voice Campaigns** pages have been updated to support scheduling:
- Removed the hardcoded dummy templates from the UI. The UI now dynamically fetches Meta-approved templates from the backend.
- Added a toggle for **"Call/Send Now"** vs **"Schedule for Later"**.
- Added a date-time picker for scheduled dispatches.
- The UI automatically posts the payload, complete with `type`, `scheduledAt`, and `status`, to the backend.

## 3. Chatbot Flow Visuals Updated

The Chatbot Workflow page (`/flows`) has been completely overhauled to match the actual AI conversational flow. The new nodes are:
1. **Greeting & Welcome**: Initial contact.
2. **Loan Requirement**: Identifying the specific loan category.
3. **Employment Status**: Checking for Salaried vs Business.
4. **Salary & Income Check**: Asking for take-home pay and requested amount.
5. **Document Checklist**: Sending the appropriate KYC file requirements based on answers.

> [!TIP]
> You can navigate to `https://avani-crm.onrender.com/flows` (or your local environment) to test the new simulation flow visually!

## 4. Meta Follow-up Templates Created

I have automatically seeded the following Meta-approved templates into your CRM database so they show up in your UI:
- **`loan_consultation_offer_day3`**: "Hello {{1}}, we noticed you haven't proceeded with your loan application. If you need any assistance or have questions, our advisors are here to help. Please reply YES if you'd like a call."
- **`loan_consultation_offer_day5`**: "Hello {{1}}, this is our final reminder regarding your loan inquiry. We have exclusive interest rates available right now. If you're no longer interested, please share this offer with friends or family who might need a loan. Thank you!"

> [!IMPORTANT]
> **Action Required for Meta Business Suite:** 
> While these templates are now available in the CRM UI, you must manually create them in your [Meta Business WhatsApp Manager](https://business.facebook.com/latest/whatsapp_manager/message_templates/) with the **exact same names** (`loan_consultation_offer_day3` and `loan_consultation_offer_day5`) to get them approved by Meta for actual dispatch over the WhatsApp API.

## Next Steps
You can test the scheduling functionality by uploading a small CSV in the CRM, picking a time 2-3 minutes in the future, and verifying that the backend cron job automatically dispatches the messages/calls at the appointed time!
