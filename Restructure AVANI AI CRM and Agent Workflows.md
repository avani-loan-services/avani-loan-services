# Restructure AVANI AI CRM and Agent Workflows

This plan details the architectural changes required to implement your comprehensive 8-stage loan funnel ecosystem, aligning both the CRM tracking stages and the AI Agent's conversational logic.

## Open Questions

> [!IMPORTANT]
> **Database Reset Required**
> Modifying the core `LeadStatus` enum in the database schema will require a database migration. Depending on the current data in your development database, this might clear existing test leads or require mapping old statuses to new ones. Please confirm if it is acceptable to reset the test database for this schema change, or if you need to preserve existing test leads.

> [!NOTE]
> **Broadcasting Images/Videos**
> You asked: *"can i need to make templete of magaes, videos approve from meta or suggest me solution on it so that ican plan to send broadcast msgs of images, videos etc. is possible thru boradcast mesg"*
> **Yes, it is absolutely possible!** However, Meta's strict rules still apply. To broadcast images or videos outside of the 24-hour window, you **MUST** create a "Media Template" in your Meta WhatsApp Manager and get it approved. 
> 
> **How to do it:**
> 1. Go to your Meta WhatsApp Manager -> Message Templates.
> 2. Create a new template and select "Media" for the header.
> 3. Choose Image or Video. You will upload a "sample" image/video for Meta to review.
> 4. Add your text in the body and buttons at the bottom.
> 5. Once approved, the CRM can send this template with any dynamic image/video URL you provide!

## Proposed Changes

---

### CRM Database Schema

We will update the Prisma schemas in both `avani-crm` and `avani-loan-agents` to use your exact pipeline stages.

#### [MODIFY] schema.prisma
- Update `LeadStatus` enum to: `NEW_LEAD`, `CONTACTED`, `QUALIFIED`, `DOCUMENTS_PENDING`, `DOCUMENTS_RECEIVED`, `ELIGIBILITY_CHECK`, `BANK_DISCUSSION`, `APPLICATION_SUBMITTED`, `SANCTION_RECEIVED`, `DISBURSED`, `CLOSED`.
- Ensure the `Contact` model supports associating the new dynamic tags (e.g., `PL-HOT`, `BL-WARM`).

---

### AI Agent Logic (`avani-loan-agents`)

The AI needs to be strictly programmed to handle the 8 distinct loan funnels, score the leads, and request the specific documents you outlined.

#### [MODIFY] lib/agents/advisor-prompt.ts
- Completely rewrite the `SYSTEM_PROMPT` to incorporate the 8 form structures: Personal Loan, [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan), Doctor/Professional Loan, [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan), Mortgage Loan, [Education Loan](/services/education-loan) (India), Education Loan (Abroad), and School & College Funding.
- Implement logic for the AI to ask the specific questions for each loan type.
- Implement the Lead Scoring logic (Hot, Warm, Cold) based on the user's responses.
- Update the document collection instructions so the AI provides the exact required documents for each loan type.

#### [MODIFY] app/api/chat/route.ts
- Update the `submitQualifiedLead` AI tool to accept the AI's calculated "Lead Score Tag" (e.g., `PL-HOT`) and save it to the CRM database.
- Ensure the tool sets the initial CRM stage correctly (e.g., `QUALIFIED` or `DOCUMENTS_PENDING`).

#### [MODIFY] lib/db/client.ts
- Update the database insertion logic to handle assigning the AI-generated tags to the newly created contact in the CRM.

---

### CRM Frontend (`avani-crm/frontend`)

The frontend Kanban board and contact lists must be updated to reflect the new pipeline stages.

#### [MODIFY] src/app/leads/page.tsx
- Update the pipeline column definitions to map directly to the new `LeadStatus` enum (`NEW_LEAD`, `CONTACTED`, etc.).
- Update the UI colors and ordering to reflect the new flow.

#### [MODIFY] src/app/contacts/page.tsx
- Update the status badges and filtering options to match the new pipeline stages.

## Verification Plan

### Automated Tests
- Build both the CRM backend and the AI Agent to ensure there are no compilation errors with the new Prisma schema.

### Manual Verification
- We will chat with the AI Agent as a "Personal Loan" customer and verify it asks the specific questions, calculates eligibility, and outputs the exact document list.
- We will verify that when the AI submits the lead, it appears in the CRM under the correct new stage (e.g., `QUALIFIED`) with the correct tag (e.g., `PL-HOT`).
