# Drip Campaigns & Bland AI Integration Plan

This document outlines the architecture and implementation steps to fulfill your request for automated follow-ups (Drip Campaigns) and Bland AI calling.

## Goal Description
You requested a system with two main automated conditions for leads:

**Condition 1 (Bland AI Calling):**
- Upload a CSV of contacts.
- Bland AI calls them one by one.
- After the call ends (regardless of outcome), the AI Agent sends the Meta-approved WhatsApp template `loan_consultation_offer · English`.
- If the customer replies, the AI Agent takes over the conversation (e.g., asking for loan type, salary, etc.).
- If the customer does NOT reply, the system automatically sends follow-up templates on Day 3, Day 5, etc.
- If there is still no reply after the final day, a closing "Thank you" message is sent.

**Condition 2 (Bulk WhatsApp Broadcast):**
- Upload a CSV to broadcast the `loan_consultation_offer · English` template directly.
- The same Drip Campaign rules apply: if they reply, the agent takes over. If no reply, automated Day 3 and Day 5 follow-ups occur.

> [!IMPORTANT]
> To support automated follow-ups spanning multiple days, the backend server must track the state of each lead and use a scheduled job (CRON) to dispatch messages on the appropriate day.

## Open Questions

Before proceeding, I need to clarify a few points regarding your existing architecture:

> [!WARNING]
> 1. **Bland AI Integration:** Does your `avani-ai-crm` or `avani-loan-agents` currently have *any* Bland AI integration set up, or am I building this from scratch? (I couldn't find any existing "bland" API keys or webhooks in the codebase).
> 2. **Repository Responsibility:** `avani-ai-crm` handles the UI and CSV uploads. `avani-loan-agents` handles the AI conversation logic (WhatsApp Webhook). Where should the "Day 3/5 Drip Campaign logic" live? I recommend placing the Cron Job and Drip Campaign tracking inside `avani-loan-agents` since it already handles WhatsApp messaging and contact statuses. Do you agree?
> 3. **Follow-up Templates:** Do you already have Meta-approved templates for Day 3, Day 5, and the Final Thank You message? If so, what are their exact template names?
> 4. **Bland API Key:** I will need your Bland AI API Key and Path/authorization to configure the outbound calling and the inbound webhook for call completion.

## Proposed Changes

### `4-AVANI LOAN AGENTS` (Backend)

#### [MODIFY] `prisma/schema.prisma`
- Add a new model `DripCampaign` or add fields to `Contact` to track:
  - `dripStatus` (ACTIVE, PAUSED, COMPLETED)
  - `currentDay` (0, 3, 5, Final)
  - `lastMessageSentAt`

#### [NEW] `lib/cron/drip-campaign.ts`
- Create a cron job script that runs daily.
- Finds all contacts with `dripStatus = ACTIVE`.
- Checks if the required days (3 or 5) have passed since `lastMessageSentAt`.
- Sends the corresponding WhatsApp template and updates the `currentDay`.

#### [MODIFY] `app/api/whatsapp-webhook/route.ts`
- Update the inbound message handler.
- If a user replies, update their `dripStatus` to `PAUSED` or `COMPLETED` so they stop receiving automated follow-ups and the conversational AI agent takes over.

#### [NEW] `app/api/bland-webhook/route.ts`
- Create an endpoint to receive the call completion webhook from Bland AI.
- Upon receiving the webhook, trigger the initial Day 0 WhatsApp template (`loan_consultation_offer · English`) and set the contact's `dripStatus` to `ACTIVE`.

### `3-AVANI AI CRM` (Frontend & Backend)

#### [NEW] `frontend/src/app/bland-campaigns/page.tsx`
- Build a new UI page specifically for "Upload CSV for Bland AI Calling".
- Read the CSV and post the numbers to the backend.

#### [NEW] `backend/src/bland/bland.service.ts`
- Create a service that securely calls the Bland AI API (`https://api.bland.ai/v1/calls`) to dispatch the outbound calls.
- Configure the `webhook` parameter in the API call to point to `https://avani-loan-agents.onrender.com/api/bland-webhook`.

## Verification Plan

### Automated Tests
- Test the CRON job logic locally with dummy dates to ensure Day 3 and Day 5 messages trigger correctly.
- Test the Bland Webhook locally to ensure it triggers the initial Day 0 message.

### Manual Verification
- Upload a test CSV with our own numbers.
- Verify Bland AI initiates a call.
- Verify that immediately after the call drops, the WhatsApp Meta template is received.
- Wait (or simulate waiting) to ensure Day 3 follow-up is received if we don't reply.
- Reply to the Day 3 message and verify the AI agent responds and the Day 5 message is cancelled.
