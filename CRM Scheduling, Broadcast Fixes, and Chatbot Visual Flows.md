# CRM Scheduling, Broadcast Fixes, and Chatbot Visual Flows

This plan addresses the issues with the Broadcasts page (where messages failed to send as Meta templates) and implements the requested scheduling functionality for both WhatsApp and AI Voice campaigns. It also includes updating the Chatbot flows UI to visually reflect the agent's conversation logic.

## User Review Required

> [!IMPORTANT]
> **Backend Architecture Change**: To support real scheduling (so you don't have to leave your computer open), I will modify the backend database schema to store the uploaded CSV contacts in the `Campaign` table and install `@nestjs/schedule` to run background jobs. This means the server will automatically wake up and send messages at the scheduled time.

## Proposed Changes

---

### Database Changes (Prisma)

Update the `Campaign` model to store the list of targets and campaign configuration so they can be processed in the background by a Cron job.

#### [MODIFY] schema.prisma
- Add `payload Json?` to `Campaign` model to store the parsed CSV rows, selected columns, and variable mappings.
- Add `type String @default("WHATSAPP")` to distinguish between WhatsApp and Bland AI voice campaigns.

---

### Backend Updates

Install `@nestjs/schedule` and configure the backend to process scheduled campaigns automatically.

#### [NEW] cron.service.ts
- Create a cron job that runs every minute (`@Cron('* * * * *')`).
- Query the database for `Campaign` records where `status = "SCHEDULED"` and `scheduledAt <= now()`.
- For each campaign, read the `payload` JSON, iterate through the contacts, and dispatch either a WhatsApp template via `WhatsappService` or a Voice Call via `BlandService`.
- Update campaign status to `COMPLETED` when done.

#### [MODIFY] campaigns.controller.ts
- Update the `POST /campaigns` endpoint to accept the full payload of scheduled contacts and save it to the DB with `status = "SCHEDULED"` and the `scheduledAt` date.

---

### Frontend Updates

Update the UI to remove preset dummy templates (which caused the Meta delivery failure) and add Date/Time pickers for scheduling.

#### [MODIFY] broadcasts/page.tsx (WhatsApp Broadcasts)
- **Fix Template Issue**: Remove `presetBroadcastTemplates`. Only display real templates fetched from your database (which correspond to your approved Meta templates).
- **Auto-Template Type**: Ensure that when a template is selected, the `mediaType` payload automatically sends as `"template"`, fixing the issue where Meta receives it as plain text and rejects it.
- **Add Scheduling UI**: Add an option in the wizard: "Send Now" or "Schedule for Later". If scheduled, display a date and time picker. Submit the entire CSV payload to the backend to be saved as a Scheduled Campaign.

#### [MODIFY] campaigns/page.tsx (Bland AI Voice Campaigns)
- **Add Scheduling UI**: Similar to Broadcasts, add a "Send Now" or "Schedule for Later" toggle with a date/time picker.

#### [MODIFY] flows/page.tsx (Chatbot Flows UI)
- Restructure the visual flowchart to reflect the exact conversation path seen in Image 4.
- Visualize nodes such as: `Greeting` ➡️ `Loan Requirement` ➡️ `Employment Status` ➡️ `Salary Check` ➡️ `Document Checklist`.

## Verification Plan

### Automated Tests
- Build and run the NextJS frontend to ensure no type errors.
- Run `npx prisma db push` to verify database schema changes.

### Manual Verification
- Review the `/broadcasts` page to confirm dummy templates are gone.
- Attempt to schedule a Broadcast 2 minutes into the future and verify the backend cron job picks it up and processes it.
- View the `/flows` page to confirm the visual representation matches the Loan Agent's conversational logic.
