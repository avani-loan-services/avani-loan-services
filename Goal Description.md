# Goal Description

The objective is to ingest, process, and implement the vast library of 25 business documents (Volumes 1-11 of Meta Approved Templates, AI Conversation Flows, Lead Scoring Matrices, Campaign Calendars, etc.) located in `WHATSAPP META TEMPLETES`. 

These documents contain critical business logic and marketing copy that need to be structurally integrated into both the **AVANI AI CRM** (NestJS/NextJS) and the **AVANI LOAN AGENTS** (NextJS/SQLite) platforms so that the systems can utilize them in auto-mode.

## User Review Required

> [!WARNING]
> This is a massive update that touches the core business logic, AI prompts, and database structures of **both** your applications simultaneously. Please review the Open Questions below before I begin execution.

## Open Questions

> [!IMPORTANT]
> 1. **Database Integration vs. AI Knowledge Base**: Do you want these 11 volumes of templates to be directly seeded as records in the CRM database (so they can be selected manually from the UI), or should they be stored as static JSON/Markdown "Knowledge Base" files that the Gemini AI reads to automatically construct messages?
> 2. **Agent Database Alignment**: The `AVANI LOAN AGENTS` app currently uses a lightweight SQLite database (`database.db`), which is separate from the CRM's PostgreSQL Prisma database. Do you want the Agent to simply read these new AI flow rules from files, or should we completely restructure the Agent to share the CRM's PostgreSQL database?

## Proposed Changes

---
### Phase 1: Data Ingestion & Structuring
I will write Python scripts to programmatically read all `.docx`, `.pdf`, and `.xlsx` files from the `WHATSAPP META TEMPLETES` folder.
* **[NEW]** Convert all 11 Volumes of product-specific marketing templates into a structured `templates.json` file.
* **[NEW]** Convert the `AI conversation flows.docx`, `Lead Scoring Matrix.docx`, and `Pipeline Stages.docx` into optimized Markdown context files.

---
### Phase 2: AVANI AI CRM Integration
We will inject this newly structured data into the CRM backend.
#### [NEW] `AVANI AI CRM/backend/src/knowledge/`
* I will create a new dedicated `knowledge` module in the NestJS backend to host the extracted AI Flows, Prompts, and CTA Libraries.
#### [MODIFY] `AVANI AI CRM/backend/src/whatsapp/whatsapp.service.ts`
* Update the Gemini AI Prompt injection logic. The AI will now dynamically load the *Volume-specific* templates based on the customer's loan product (e.g., loading Volume 3 for Doctor Loans) to generate highly contextual responses.
#### [MODIFY] `schema.prisma`
* Add new models for `Campaign` and `MetaTemplate` if we decide to store these templates natively in the database.

---
### Phase 3: AVANI LOAN AGENTS Integration
We will update the AI orchestration in the agent repository to adhere to the new rules.
#### [MODIFY] `AVANI LOAN AGENTS/app/api/chat/route.ts` & `vapi/route.ts`
* Update the system prompts to strictly follow the rules defined in `AI conversation flows.docx` and `Lead Scoring Matrix.docx`.
#### [NEW] `AVANI LOAN AGENTS/lib/knowledge/`
* Sync the identical structured JSON/Markdown files to the Agent app so it shares the exact same brain as the CRM.

## Verification Plan

### Automated Tests
- Run `npm run build` on both CRM (frontend/backend) and Agent repositories to ensure zero typescript compilation errors.
- Run Python schema validation on the generated JSON template libraries to ensure all 11 volumes were extracted correctly.

### Manual Verification
- We will ask the user to trigger a test lead conversation and verify that the AI successfully retrieves and sends a highly specific template from the appropriate Volume (e.g. Volume 6 for Education Loans).
