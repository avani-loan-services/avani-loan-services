# Pipeline Redesign and Auto-Reply Automation

This plan outlines the major architectural change to update your CRM's Lead Pipeline stages and implement automatic WhatsApp replies based on status changes.

## Proposed Changes

### 1. Database Schema Migration (CRM Backend)
We will update the `LeadStatus` enum in `prisma/schema.prisma` to precisely match your requested pipeline:
- `NEW_LEAD`
- `CONTACT_ATTEMPTED`
- `QUALIFIED`
- `DOCS_REQUESTED`
- `DOCS_RECEIVED`
- `ELIGIBILITY_REVIEW`
- `LENDER_SUBMISSION`
- `UNDER_PROCESS`
- `APPROVED`
- `DISBURSED`
- `REFERRAL_REQUESTED`

### 2. Frontend & Backend Refactoring
- Search and replace all old status references (e.g., `DOCS_PENDING`, `BANK_PROCESSING`) across the CRM frontend and backend code to align with the new pipeline structure.
- Run `npx prisma generate` and `npx prisma db push` to apply the database changes.

### 3. Agent Tool Synchronization
- Update the Lead/Pipeline models in the `AVANI LOAN AGENTS` project to ensure both systems speak the exact same language regarding lead statuses.

### 4. Auto-Reply Automation (CRM Backend)
- Inject a hook in the `ContactService` or `ContactsController` (where lead statuses are updated).
- When a lead's status changes, it will trigger an automated WhatsApp message to the customer. 
- *Example:* Moving a lead to `DOCS_REQUESTED` will automatically send them a message asking for their documents.

### 5. Document Storage
- Add the recently generated `Whatsapp Marketing Templates.md` file to the root of the CRM directory.

### 6. Deployment
- Push changes via Git to auto-deploy the CRM Backend, CRM Frontend, and Agent tools to live.

---

> [!WARNING]
> **Database Changes**
> Changing enums in Prisma can sometimes require dropping tables if not handled carefully. I will ensure this is done safely, but please ensure your database is backed up if there is critical live data.

## Open Questions

Before proceeding, I need your input on the following:

> [!IMPORTANT]
> **Auto-Reply Message Content**
> What exactly should the bot say when the status changes? If you don't have exact messages right now, I will create standard, professional placeholder messages for each stage (e.g., "Your loan has been approved!", "Please submit your documents.") which you can edit later. Is that okay?

> [!IMPORTANT]
> **Current Leads**
> What should happen to existing leads in your database that currently have old statuses (like `BANK_PROCESSING`)? During the database push, they will need to be mapped to a new status (e.g., `UNDER_PROCESS`). I will handle this mapping automatically if approved.
