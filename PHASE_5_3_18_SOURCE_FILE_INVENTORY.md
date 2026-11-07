# AVANI LOAN SERVICES — PHASE 5.3.18 SOURCE FILE INVENTORY
**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Execution Mode:** ANTIGRAVITY AUTO MODE ONLY  
**Analysis Date:** 2026-11-07  
**Batch ID:** `BATCH-20261107-P5318`

---

## 1. SOURCE REPOSITORY DISCOVERY & INVENTORY SUMMARY

A recursive scan across the local project directory (`C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`) cataloged a total of 482 files, including 177 Excel workbooks (.xlsx/.xls), 47 CSV datasets, and 66 JSON datasets.

A rigorous forensic audit identified the authoritative master source datasets corresponding to the two primary operational verticals:

1. **Maharashtra Builder Partnerships Master**
2. **India Education Institutional Funding System Master**

---

## 2. AUTHORITATIVE MASTER SOURCE DATASETS

### 2.1 Builder Database Master (`Maharashtra_Builder_Master_Database_V3_1.csv`)
- **Relative Path:** `Maharashtra_Builder_Master_Database_V3_1.csv`
- **File Format:** RFC-4180 UTF-8 CSV
- **File Size:** ~72 KB
- **Authoritative Record Count:** 80 Enterprise Builders
- **Dataset Lineage:**
  - **Version 1 (Phase 1):** Initial municipal exploratory batch (54-57 builders across Mumbai, Pune, Thane, Nagpur, Nashik).
  - **Version 2 (Phase 2):** Standardized 80-builder registry with initial contact research.
  - **Version 3.1 (Phase 3.1 Master):** Fully vetted, forensically audited 80-builder master database containing verified legal entity names, MahaRERA registrations, executive decision-makers, direct mobile/WhatsApp links, and 7-factor qualification scoring.
- **Key Fields Discovered (36 Total Columns):**
  - Identity: `builder_id`, `company_name`, `brand_name`, `legal_entity_name`, `corporate_website`
  - Geographic: `city`, `locality`, `state`, `pincode`, `registered_office_address`
  - Contacts: `official_telephone`, `official_mobile`, `official_email`, `sales_email`, `general_email`, `contact_page_url`
  - WhatsApp: `whatsapp_channel`, `whatsapp_classification`, `whatsapp_link`, `whatsapp_notes`
  - Project Scale: `residential_segment`, `residential_project_count`, `residential_projects`, `maharera_registration`, `maharera_url`
  - Leadership Governance: `decision_maker_name`, `executive_designation`, `decision_maker_category`, `decision_maker_url`
  - Scoring & Verification: `qualification_score`, `qualification_grade`, `score_variance`, `auditor_notes`

### 2.2 Education Institutional Funding Master (`Master_India_Education_Institutional_Funding_Database.csv` & `.xlsx`)
- **Relative Path:** `India_Education_Institutional_Funding_System/01_Master_Database/Master_India_Education_Institutional_Funding_Database.csv`
- **Excel Companion:** `India_Education_Institutional_Funding_System/01_Master_Database/Master_India_Education_Institutional_Funding_Database.xlsx`
- **File Format:** RFC-4180 UTF-8 CSV & Microsoft Excel (.xlsx)
- **File Size:** ~98 KB
- **Authoritative Record Count:** Exactly 80 Institutional Groups
  - **Geographic Split:** 40 Maharashtra Campuses + 40 National Campuses (Karnataka, Gujarat, Uttar Pradesh, Tamil Nadu, Delhi NCR, Andhra Pradesh, Telangana).
  - **Institutional Split:** 24 K-12 & Residential Schools + 56 Higher Education Campuses (Engineering, Medical, Autonomous & Deemed).
- **Key Fields Discovered (45 Total Columns):**
  - Identity: `institution_id`, `institution_name`, `institution_category`, `subcategory`, `board_affiliation`, `parent_trust_society`
  - Campus Metrics: `year_established`, `number_of_branches`, `student_capacity`, `approx_enrolment`
  - Contact Channels: `official_email`, `official_telephone`, `institution_website`, `complete_address`, `city`, `state`, `pin_code`
  - Leadership Governance Roster:
    - `owner_founder_name`
    - `chairman_name` / `chairman_mobile` / `chairman_email`
    - `managing_trustee_name`
    - `secretary_name` / `secretary_mobile`
    - `director_name` / `principal_name`
    - `finance_head_name` / `finance_head_mobile`
  - Institutional Lending Intelligence:
    - `potential_borrowing_capacity` (Mapped uniformly to ₹5 Cr - ₹10 Cr Very Large bracket)
    - `secured_funding_potential` (LAP on campus land, academic structures, hospital blocks)
    - `unsecured_funding_potential` (Working capital overdraft & equipment financing lines)
    - `existing_borrowing_information`
    - `property_ownership_information` (Freehold multi-acre titles)
    - `reported_expansion_plans` (New academic blocks, university accreditation capex)
    - `potential_collateral_category` (Prime institutional real estate)

---

## 3. SECONDARY AND SUPPORTING ARTIFACTS INVENTORY

| Artifact / Workbook Name | Path / Folder | Record Count | Role in Phase 5.3.18 |
| :--- | :--- | :---: | :--- |
| `Ticket_Size_Funding_Prospects_Database.xlsx` | `India_Education_Institutional_Funding_System/02_Funding_Ticket_Size_Matrix/` | 80 | Confirmed ₹5 Cr - ₹10 Cr Very Large institutional borrowing classification |
| `Regional_Expansion_Funding_Database.xlsx` | `India_Education_Institutional_Funding_System/03_Regional_Expansion_Database/` | 80 | Validated 40 Maharashtra + 40 National territorial partition |
| `School_Funding_Database_Master.xlsx` | `India_Education_Institutional_Funding_System/04_Category_Databases/` | 24 | Provided verified subview partitioning for K-12 & Boarding Schools |
| `College_University_Funding_Master.xlsx` | `India_Education_Institutional_Funding_System/04_Category_Databases/` | 56 | Provided subview partitioning for Engineering, Medical, Deemed & Autonomous |
| `builder_companies.json` | `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/` | 80 | In-memory production cache for Builder Module |
| `education_institutions.json` | `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/` | 80 | In-memory production cache for Education Module |
| `builder_contacts.json` | `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/` | 80 | Decision-maker directory for Builder Module |
| `education_contacts.json` | `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/` | 80 | Leadership contacts directory for Education Module |

---

## 4. INVENTORY FORENSIC CONCLUSION

The local source directory contains the complete, uncorrupted master records with exhaustive field-level detail. No data loss occurred between original research artifacts and current production systems. All 80 builders and 80 education institutions match 1:1 with authoritative CSV source files.
