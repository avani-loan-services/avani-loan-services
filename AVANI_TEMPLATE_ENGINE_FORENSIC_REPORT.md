# AVANI LOAN SERVICES — CONTENT TEMPLATE ENGINE FORENSIC REPORT
**Authoritative Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main`  
**Tenant / Business Identity:** `AVANI LOAN SERVICES` (`businessId = "avani-loan-services"`)  
**Audit Date:** 2026-09-15  
**Auditor / Engine:** Antigravity AI Agent  

---

## 1. Executive Summary & Objective
This forensic inspection establishes the structural, architectural, and integration baseline of **AVANI LOAN SERVICES** prior to implementing the production-ready **Productwise Content Template Engine**.
The template engine generates, manages, validates, and publishes multi-channel, multi-lingual marketing, utility, and CRM follow-up content across 10 distinct loan products for Sachin Shinde's Avani Loan Services.

---

## 2. Forensic Inspection Findings

### 2.1 Git Repository & Remote Baseline
- **Repository:** `avani-loan-services/avani-loan-services` (Confirmed via `git remote -v`: `origin https://github.com/avani-loan-services/avani-loan-services.git`).
- **Current Branch:** `main` (clean, aligned with remote tracking branch `origin/main`).
- **Target Remote:** Verified; strictly isolated from any unrelated projects or repositories.

### 2.2 Business & Tenant Identity
- **Business Name:** AVANI LOAN SERVICES
- **Founder & Owner:** Sachin Shinde
- **Industry:** Financial Services | Loan Consultancy | Loan Advisory
- **Headquarters / Office:** Old Barshi Road, 5 no chauk, Kulswamini Nagar, Next to Sai School, Latur – 413512, Maharashtra, India
- **Website:** `https://www.avanifinserv.com/`
- **Email:** `enquiry@avanifinserv.com`
- **Official WhatsApp Business:** `+91 91756 35165`
- **Tenant Lock:** Hardcoded guard `businessId = "avani-loan-services"` must be enforced on all templates, campaigns, image prompts, video scripts, and publishing operations.

### 2.3 Existing Integration Architecture
1. **AiSensy Transport:**
   - **Project ID:** `6a670f94d0c39f57eaa6799f`
   - **Gateway Endpoint:** `https://backend.aisensy.com/campaign/t1/api/v2`
   - **Key Format:** Valid JWT API Token verified in local environment (`AISENSY_API_KEY`).
   - **Existing Adapter:** `src/services/aisensyAdapter.cjs` & `src/services/whatsappProviderEngine.cjs`.
2. **Meta WhatsApp Cloud / WABA Infrastructure:**
   - **WABA ID:** `1062614709598311` (Confirmed live via Meta Graph API v20.0).
   - **Phone Number ID:** `1147494668457940`.
   - **Access Token:** Valid System User Token verified live with HTTP 200 response from Meta Graph API.
   - **Current Live WABA Templates:** 15 active templates inspected on Meta (including approved templates for `home_loan_welcome`, `mortgage_loan_welcome`, `education_loan__india_documents`, and pending utility templates).
3. **Database Architecture:**
   - **Primary Store:** MongoDB via Mongoose (`src/models/database.cjs`).
   - **Serverless Fallback:** In-memory fallback map with fail-closed production protection (`src/config/envValidator.cjs`).
   - **Existing Models:** `Lead.cjs`, `ConversationState.cjs`, `ProviderLedger.cjs`, `WebhookInbox.cjs`.
4. **Backend Server & Routing (`src/server.cjs`):**
   - Express server with JSON/URL-encoded raw-body verification.
   - Active routes: `/api/crm`, `/api/whatsapp`, `/api/whatsapp-webhook`, `/api/eligibility`, `/api/documents`, `/api/meta`, `/api/lead`, `/api/marketing`, `/api/calculator-auth`.
   - Vercel Serverless entry point: `api/index.js` redirects all requests to `src/server.cjs`.
5. **Frontend Application:**
   - React 19 + Vite 6 + React Router 7 (`src/App.jsx`).
   - Includes full Financial Tools & Calculators suite, Eligibility Engine, Lead forms, and Admin dashboards.

---

## 3. Reusable Components vs Required New Additions

| Component | Status | Action Required |
| :--- | :--- | :--- |
| `src/server.cjs` | Active | Mount `/api/templates` router |
| `vercel.json` | Active | Add rewrite rule `{ "source": "/api/templates/(.*)", "destination": "/api/index.js" }` |
| `src/App.jsx` | Active | Mount `/templates` and product-specific template management routes |
| `src/models/ContentTemplate.cjs` | **New** | Create MongoDB schema for multi-channel, multi-lingual templates with versioning & audit logs |
| `src/services/templateEngine.cjs` | **New** | Core generation engine for 10 loan products across Awareness, Lead Gen, Follow-up, Conversion, Retargeting |
| `src/services/templateValidator.cjs` | **New** | Validation engine: syntax, character limits, prohibited financial claims, and **Agro Foods Contamination Scanner** |
| `src/services/aisensyPublisher.cjs` | **New** | Integration module with AiSensy campaign & template registry with idempotency |
| `src/services/metaWabaPublisher.cjs` | **New** | Direct Meta WABA Graph API template registration, sync, and status lifecycle |
| `src/pages/TemplateDashboard.jsx` | **New** | Admin interface for previewing, filtering, generating, validating, and publishing templates |
| `src/config/productsCatalog.cjs` | **New** | Central product specification and target audience definitions for all 10 products |

---

## 4. Strict Risk Assessment & Mitigation

1. **Risk 1: Accidental Cross-Business Contamination (Agro Foods)**
   - *Mitigation:* Hard tenant lock on `businessId = "avani-loan-services"`. Automated validation scanner blocks any keywords (`moringa`, `agro`, `spices`, `export`, etc.) and halts publishing immediately.
2. **Risk 2: Misleading Financial / Banking Claims**
   - *Mitigation:* Explicit prohibited keyword list ("100% approval", "guaranteed sanction", "instant cash", "guaranteed CIBIL increase"). All copy adheres to RBI / DSA compliance standards ("Eligibility depends on lender criteria").
3. **Risk 3: False Representation of Meta Approval**
   - *Mitigation:* Templates start in `DRAFT` or `SUBMITTED`/`PENDING`. Only live responses from Meta Graph API can transition status to `APPROVED`.
4. **Risk 4: Duplicate Dispatches or Publishing**
   - *Mitigation:* Strict idempotency keys: `avani-loan-services:{product}:{channel}:{templateId}:{version}` stored in `ProviderLedger` and template version history.

---

## 5. Execution Roadmap

- **Phase 1:** Forensic Inspection (Completed).
- **Phase 2–3:** Architecture & Strict Business Isolation Enforcement.
- **Phase 4:** Database Schema (`ContentTemplate.cjs`, `TemplateAudit.cjs`).
- **Phase 5–8:** Multi-Product Generation Engine (Text, WhatsApp, Social, Image Prompts, Video/Reels).
- **Phase 9:** Admin UI (`/templates` Dashboard & Product Pages).
- **Phase 10:** Validation Engine & Agro Contamination Scanner.
- **Phase 11–13:** AiSensy & Meta WABA Publishing Engine & Sync.
- **Phase 14–15:** Automated Tests & Security Scan.
- **Phase 16–18:** Production Build, Vercel Config, Verification.
- **Phase 19–21:** Git Diff Review, Push to `origin/main`, and Final Acceptance Report.
