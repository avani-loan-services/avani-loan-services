# AVANI LOAN SERVICES — FORENSIC TEMPLATE & ASSET INVENTORY REPORT

**Date:** 2026-09-15
**Authoritative Business:** AVANI LOAN SERVICES (Owner: Sachin Shinde)
**Authoritative Repository:** `avani-loan-services/avani-loan-services` (Branch: `main`)
**Production Domain:** https://www.avanifinserv.com
**Audit Reference:** ALS-PHASE2-INVENTORY-20260915

---

## 1. Executive Summary
This forensic inventory establishes the verified baseline of all marketing content templates, image concepts, video concepts, and physical media files in the AVANI LOAN SERVICES repository.

### Critical Distinction: Prompts & Scripts vs. Physical Rendered Assets
- **Image Generation Prompts:** **40 Prompt Concepts** generated dynamically across 10 products (4 aspect ratios each: 1080x1080, 1080x1350, 1080x1920, 1200x628).
- **Physical Image Assets (Rendered Marketing Creatives):** **0 Rendered Ad Assets** (The project currently contains 22 website UI assets in `public/` and `src/assets/`, but zero rendered marketing campaign image creatives).
- **Video & Reel Scripts:** **60 Video Scripts** generated dynamically across 10 products (2 durations × 3 languages = 6 per product).
- **Physical Video Assets (Rendered MP4/WebM):** **0 Rendered Video Assets** (No video rendering engine or external video API has executed rendering).

---

## 2. Template Inventory Matrix (Dynamic Generator Scope)

| Product ID | Product Name | Total Generated | WhatsApp Templates | Social Posts | Image Prompts | Video Scripts | English (EN) | Marathi (MR) | Hindi (HI) | Persisted State | Draft / Validated | Submitted | Approved | Rejected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `personal_loan` | Personal Loan | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `business_loan` | [business loan](/services/business-loan) | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `doctor_loan` | Doctor Loan | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `home_loan` | [home loan](/services/home-loan) | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `mortgage_loan` | Mortgage Loan / LAP | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `education_loan_india` | [Education Loan](/services/education-loan) (India) | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `education_loan_global` | [Education Loan](/services/education-loan) (Global) | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `school_funding` | School Funding | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `college_funding` | College Funding | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| `cibil_consultation` | CIBIL Consultation | 73 | 27 | 36 | 4 | 6 | 27 | 23 | 23 | In-Memory / DB Upsert | 73 | 0 | 0 | 0 |
| **TOTALS** | **10 Products** | **730** | **270** | **360** | **40** | **60** | **270** | **230** | **230** | **Dual Store** | **730** | **0** | **0** | **0** |

---

## 3. Physical File Assets Verification
- `public/`: 9 website UI image files (`avani-brand-logo.png`, `personal-loan.png`, `business-loan.png`, `doctor-loan.png`, `home-loan.png`, `mortgage-loan.png`, `education-loan.png`, `avani_cibil_banner.png`, `favicon.ico`). **Zero video files (0 MP4/WebM)**.
- `src/assets/`: 13 UI images used by React components. **Zero video files (0 MP4/WebM)**.
- **Physical Marketing Creative Files:** 0.

---

## 4. Operational Gaps Identified
1. **Image Concept Density:** The current generator produces 4 image prompt formats for 1 visual concept per product (40 prompts total). Target is **10 distinct visual concepts per product across 4 aspect ratios = 100 concepts (400 format variants)**.
2. **Video Concept Density:** The current generator produces 2 video scripts per product across 3 languages (60 scripts total). Target is **30 video concepts per product (10 Short Reels, 5 Educational, 5 FAQ, 5 Problem/Solution, 5 Lead Gen) × 10 products = 300 concepts**.
3. **Publishing State Machine:** The current schema defines basic `status`, `metaStatus`, and `aisensyStatus`. It needs to enforce the rigorous 11-step state machine:
   `DRAFT` ➔ `VALIDATED` ➔ `READY_FOR_SUBMISSION` ➔ `SUBMITTED_TO_META` ➔ `META_PENDING` ➔ `META_APPROVED` ➔ `META_REJECTED` ➔ `READY_FOR_AISENSY` ➔ `PUBLISHED_TO_AISENSY` ➔ `FAILED` ➔ `ARCHIVED`.
4. **Content Quality Scoring:** Need an automated 0–100 scoring algorithm evaluating compliance, brand consistency, readability, CTA quality, and duplication.
5. **Duplicate & Near-Duplicate Detection:** Need automated detection of exact or near-identical headlines, bodies, and prompts.
6. **Bulk Operations & Meta Confirmation:** Need explicit UI multi-select, bulk validation, and human confirmation modal before triggering Meta WABA submissions.
7. **30-Day Content Calendar & Export:** Need programmatic content calendar generation and multi-format export (JSON, CSV, Excel-compatible CSV).
