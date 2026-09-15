# AVANI LOAN SERVICES — CONTENT TEMPLATE ENGINE FORENSIC INSPECTION REPORT

**Date:** 2026-09-15  
**Authoritative Business:** AVANI LOAN SERVICES (Owner: Sachin Shinde)  
**Authoritative Domain:** https://www.avanifinserv.com  
**Authoritative Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main`  
**Current Git SHA:** `f6704e0`  
**Production Deployment:** `dpl_5Ap1ycr2vdaurKdkKY8BrTikwDrW`  

---

## 1. Executive Summary & Forensic Context
This report provides the exhaustive baseline inspection of the AVANI LOAN SERVICES codebase, services, and integrations prior to executing the end-to-end build, generation, validation, AiSensy/Meta integration, and deployment workflow for the **Productwise Content Template Engine**.

The objective is to establish an enterprise-grade, multi-channel marketing content library for **exactly 10 distinct financial loan products**, locked strictly to the `avani-loan-services` business identity, with absolute isolation from any unrelated projects.

---

## 2. Current Architecture & Runtime Configuration
- **Frontend Stack:** React 19 + Vite 6 + React Router 7 + Lucide Icons + Pure Vanilla CSS design tokens.
- **Backend Architecture:** Express 5 runtime (`src/server.cjs`), mounted for serverless invocation via `api/index.js` in Vercel.
- **Database & Persistence:** Dual-tier architecture using MongoDB Atlas (`avani_loan_services_test` / production) with an isolated, in-memory fallback store (`src/models/ContentTemplate.cjs`, `src/models/database.cjs`) for zero-dependency test execution.
- **Routing & Rewrite Layer:** `vercel.json` rewrites all `/api/templates/(.*)` paths to `api/index.js`, while client-side routes `/templates` and `/templates/:productId` are routed to `TemplateDashboard.jsx`.

---

## 3. Existing Reusable Components & Modules
The following core assets and modules are inspected and ready for direct reuse:
1. **Business Identity Hard Lock (`src/config/businessIdentity.cjs`):**
   - Authoritative constants: `BUSINESS_IDENTITY.businessId = 'avani-loan-services'`, Founder: Sachin Shinde, WhatsApp: `+91 91756 35165`, Office: Kulswamini Nagar, Latur.
   - Enforcement utilities: `assertBusinessIsolation()`, `checkBusinessIsolation()`, and `AGRO_CONTAMINATION_TERMS` firewall.
2. **Product Catalog (`src/config/productsCatalog.cjs`):**
   - 10 distinct products: `personal_loan`, `business_loan`, `doctor_loan`, `home_loan`, `mortgage_loan`, `education_loan_india`, `education_loan_global`, `school_funding`, `college_funding`, `cibil_consultation`.
3. **Template Data Model & Ledger (`src/models/ContentTemplate.cjs`):**
   - Full schema supporting Template ID, Business ID, Product, Audience, Channel, Content Type, Campaign Type, Language, Headline, Body, Footer, CTA, Variables, Image Prompt, Video Script, Status, AiSensy Status, Meta Status, Version, Idempotency Key, and Audit Trail.
4. **Validation & Contamination Engine (`src/services/templateValidator.cjs`):**
   - Enforces business isolation, Meta naming constraints, prohibited financial claim detection, variable sequence validation (`{{1}}`, `{{2}}`), and contamination scanning.
5. **Publishing & Integration Engine (`src/services/templatePublishingEngine.cjs`):**
   - Meta Graph API (`/v20.0/{waba_id}/message_templates`) direct submission & live status synchronization.
   - AiSensy campaign registration and status tracking.
6. **Express API Router (`src/routes/templates.cjs`):**
   - Endpoints for querying (`/api/templates`), stats (`/stats`), catalog (`/products`), bulk generation (`/generate`), validation (`/validate`), single template (`/:id`), Meta submission (`/:id/submit-meta`), AiSensy publishing (`/:id/publish-aisensy`), Meta sync (`/meta/sync`), export (`/export`), and audit logs (`/audit`).
7. **Frontend Admin UI (`src/pages/TemplateDashboard.jsx` & `TemplateDashboard.css`):**
   - Multi-tab UI featuring Metrics Dashboard, Product Library, Template Viewer, WhatsApp Preview, Social Previews, Image Prompts, Video Scripts, Meta/AiSensy Publishing Controls, Contamination Scanner, and Audit Log Explorer.

---

## 4. Existing Integrations & Environment Variables
- **Meta WhatsApp Business Platform (WABA):**
  - WABA ID: `1062614709598311`
  - Phone Number ID: `1147494668457940`
  - Meta Access Token loaded via secure environment variable (`META_ACCESS_TOKEN`).
- **AiSensy WhatsApp Transport:**
  - Project ID: `6a670f94d0c39f57eaa6799f`
  - API Key loaded via secure environment variable (`AISENSY_API_KEY`).
  - Active approved notification campaign: `avani_retail_day1_ack`.
- **Google Sheets CRM Ingestion:**
  - Apps Script Webhook + GCP Project `679374780504` Service Account API.
- **HubSpot CRM:**
  - Portal `244236573` with OAuth refresh and HMAC Signature V3 verification.
- **OmniDM AI Voice Engine:**
  - Voice dispatch & post-call routing ledger (VAPI is deprecated/unused as instructed).

---

## 5. Files That Can Be Reused vs Changed
| File Path | Action | Rationale |
| :--- | :--- | :--- |
| `src/config/businessIdentity.cjs` | **REUSE** | Provides clean, non-negotiable business identity enforcement. |
| `src/config/productsCatalog.cjs` | **REUSE / EXTEND** | Full 10 products catalog already configured. |
| `src/models/ContentTemplate.cjs` | **REUSE** | Comprehensive schema with in-memory + MongoDB dual persistence. |
| `src/services/templateValidator.cjs` | **REUSE** | Compliance and contamination scanner verified with 0 findings. |
| `src/services/templatePublishingEngine.cjs`| **REUSE** | Meta WABA Graph API v20 and AiSensy integration handlers in place. |
| `src/services/templateGenerator.cjs` | **EXTEND** | Expand content generation coverage across all Awareness, Lead Gen, Conversion, Follow-up, and Retargeting subcategories. |
| `src/services/templateContentData.cjs` | **EXTEND** | Add granular 30-day social calendar hooks and multi-format reel scripts. |
| `src/pages/TemplateDashboard.jsx` | **ENHANCE** | Ensure seamless tab navigation and bulk actions. |
| `scripts/test_template_engine_suite.cjs` | **REUSE / EXTEND** | Comprehensive 10-gate test matrix covering all functional areas. |

---

## 6. Risks & Mitigation Strategies
1. **Risk:** Accidental cross-entity contamination in prompts or marketing copy.  
   **Mitigation:** Automated scanning gate (`verify-security-and-isolation.cjs` and `scanAgroContamination`) blocks any unauthorized terms prior to build and commit.
2. **Risk:** Prohibited financial claims (e.g. "100% approval", "instant guaranteed loan").  
   **Mitigation:** Deterministic regex filter in `templateValidator.cjs` enforces strict RBI/regulatory compliance wording.
3. **Risk:** False reporting of external provider approval.  
   **Mitigation:** `templatePublishingEngine.cjs` explicitly differentiates `DRAFT`, `SUBMITTED`, `PENDING`, `APPROVED`, and `REJECTED`, only marking `APPROVED` when the Meta Graph API returns that exact state.

---

## 7. Execution Plan
1. **Phase 1-4:** Forensic inspection complete. Business isolation & database schemas verified.
2. **Phase 5-8:** Enrich template generator to produce comprehensive Awareness, Lead-Gen, Follow-up, Conversion, Retargeting, and 30-Day social calendars across English, Marathi, and Hindi.
3. **Phase 9-13:** Verify Admin UI, validation firewall, AiSensy & Meta integration workflows, and idempotency keys.
4. **Phase 14-16:** Run 10-gate template test suite, full regression suite, security scan, and local production build.
5. **Phase 17-21:** Vercel production deployment, live production verification, Git commit & push, and final report delivery.
