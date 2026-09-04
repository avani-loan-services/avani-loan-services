# Migrate AI Calling from Vapi to Bland AI

This plan outlines the steps to replace the unstable Vapi integration with a highly reliable Bland AI outbound calling system. Since Bland AI handles Indian languages and numbers natively, this will resolve the silent/timeout issues.

## User Review Required
> [!IMPORTANT]
> Since Bland AI doesn't use a "Dashboard Assistant" the way Vapi did, we will embed the Marathi/Hindi sales script directly into the backend code. This means if you want to change the script later, you will modify it in the codebase. 

## Proposed Changes

### `src/lib/bland.ts`
#### [NEW] [bland.ts](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/3-AVANI%20AI%20CRM/src/lib/bland.ts)
Create a new utility function to replace `vapi.ts`.
- Uses `POST https://api.bland.ai/v1/calls`.
- Passes the `encrypted_key` in headers to route calls through your Twilio number (`+13203773219`).
- Uses the `maya` voice and `language: hi` for robust Marathi/Hindi TTS.
- Passes the Marathi script dynamically.

---

### `src/app/api/leads/trigger/route.ts` & `src/app/api/leads/upload/route.ts`
#### [MODIFY] [trigger/route.ts](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/3-AVANI%20AI%20CRM/src/app/api/leads/trigger/route.ts)
#### [MODIFY] [upload/route.ts](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/3-AVANI%20AI%20CRM/src/app/api/leads/upload/route.ts)
- Replace imports of `triggerOutboundCall` from `vapi.ts` with the new Bland AI trigger.

---

### `src/app/api/bland-webhook/route.ts`
#### [NEW] [bland-webhook/route.ts](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/3-AVANI%20AI%20CRM/src/app/api/bland-webhook/route.ts)
Create the endpoint to receive call summaries from Bland AI.
- Parses Bland AI's payload (extracting call variables like interested status).
- Pushes the processed lead to Google Sheets, HubSpot, Make.com, and sends the WhatsApp message.

---

### `.env.local`
#### [MODIFY] [.env.local](file:///C:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/3-AVANI%20AI%20CRM/.env.local)
- Add `BLAND_API_KEY` and `BLAND_ENCRYPTED_KEY`.

## Verification Plan
1. Create `test_bland.js` to trigger a test call directly via the new Bland script to your phone (`+917219053645`).
2. Verify that the call is in Marathi, there are no silent failures, and the Twilio Caller ID shows up correctly.
3. Verify that once the call ends, the `bland-webhook` successfully captures the lead and fires the WhatsApp follow-up.
4. Commit and push to GitHub so Render automatically deploys the Bland AI version.
