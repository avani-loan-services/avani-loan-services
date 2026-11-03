# AVANI LOAN SERVICES — PHASE 5.3.2 DATABASE RECONCILIATION
## Forensic Audit, Discrepancy Root Cause Analysis & Collection-Level Census

**Document Version:** 1.0.0  
**Audit Date:** November 03, 2026  
**Auditor:** Principal Database Architect & DevSecOps Lead  
**Target Cluster:** `avani-loan-services-m0.xj6nhak.mongodb.net`  
**Target Database:** `avani_loan_services_prod`  
**Source Directory:** [`AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data)  
**Classification:** MANDATORY AUDIT & RECONCILIATION DELIVERABLE  

---

## 1. ROOT CAUSE OF THE THREE-RECORD DISCREPANCY

### 1.1 The Mathematical Question
In Phase 5.3, the arithmetic breakdown was listed as:
- Admin Users: 1
- Builder Module (4 collections × 80): 320
- Education Module (4 collections × 80): 320
- Unified Tasks: 29
- **Sum:** $1 + 320 + 320 + 29 = 670$.

Adding the two missing collections:
- 5th Education Collection (`education_funding_profiles.json`): 80 records
- System Automation State (`system_automation_state.json`): 1 record
- **Sum:** $670 + 80 + 1 = \mathbf{751\text{ records}}$.

However, the Phase 5.3.1 report stated **754 records**. What is the exact source of this **3-record difference** ($754 - 751 = 3$)?

### 1.2 The Forensic Answer
The exact source of the 3-record difference is in **`unified_tasks.json`**:
1. When Phase 5.3 was originally authored, the narrative copied forward an older static snapshot citing **29 tasks**.
2. However, automated regression test runs (which execute live inbound enquiry form submissions via `publicEnquiryRoutes.cjs`) had dynamically added 3 new operational tasks to [`unified_tasks.json`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/unified_tasks.json):
   - `TSK-1793606657424-Y7BT`: Inbound Builder Enquiry Follow-up
   - `TSK-1793606657431-MBJ2`: Inbound Education Enquiry Assessment
   - `TSK-1793607288961-DZOL`: Inbound Education Funding Consultation
3. When the physical disk file was audited during Phase 5.3.1, `unified_tasks.json` actually contained **32 records**, not 29 ($32 - 29 = +3$).
   $$\text{Actual on disk} = 1 + 320 + 400 + 1 + 32 = \mathbf{754\text{ records}}.$$
4. The narrative text of the Phase 5.3 report had cited the historical 29 figure, creating the apparent mathematical discrepancy of 3 records.
5. Furthermore, during the Phase 5.3.1 verification runs executed on November 03 at 07:26 AM:
   - Functional Test 5.1 created Task 33: `TSK-1793670968782-PFVM`
   - Functional Test 5.2 created Task 34: `TSK-1793670968791-BBST`
   - QC #25 created Task 35: `TSK-1793671028004-HPRO`
6. As a result, the live count of `unified_tasks.json` is currently **35 records**, bringing the complete live migration census to **757 records**.

---

## 2. COLLECTION-LEVEL CENSUS & SCHEMA AUDIT TABLE

Every collection was programmatically audited against its Mongoose production model schema in [`src/models/portalSchemas.cjs`](file:///c:/Users/ALPHA-1/Downloads/21MAY2026/SACHIN%20SHINDE%20DOCUMENTS/DEVELOPEMENT%20TOOLS/1-AVANI%20LOAN%20SERVICE%20FY%2026-27/src/models/portalSchemas.cjs) and primary key constraints:

| Source Filename | Target Collection Name | Actual Source Count | Valid Record Count | Unique Primary Keys | Duplicate Count | Missing Primary Key Count | Schema Validation Failures | Expected Target Count |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `admin_users.json` | `portal_admin_users` | 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| `builder_companies.json` | `portal_builder_companies` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `builder_contacts.json` | `portal_builder_contacts` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `builder_maharera.json` | `portal_builder_maharera` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `builder_pipeline.json` | `portal_builder_pipeline` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `education_institutions.json` | `portal_education_institutions` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `education_contacts.json` | `portal_education_contacts` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `education_funding_profiles.json` | `portal_education_funding_profiles` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `education_pipeline.json` | `portal_education_pipeline` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `education_consent_records.json` | `portal_education_consent_records` | 80 | 80 | 80 | 0 | 0 | 0 | 80 |
| `unified_tasks.json` | `portal_unified_tasks` | 35 | 35 | 35 | 0 | 0 | 0 | 35 |
| `system_automation_state.json` | `portal_system_automation_state` | 1 | 1 | 1 | 0 | 0 | 0 | 1 |
| **TOTALS (12 Files)** | **12 Production Collections** | **757** | **757** | **757** | **0** | **0** | **0** | **757** |

---

## 3. CORE BUSINESS DATABASE VS. OPERATIONAL LOGS

To ensure complete transparency, datasets are segregated into two distinct operational categories:

### 3.1 Fixed Master Business Database (722 Records)
The core business records for Maharashtra Builders and Educational Institutions are strictly fixed and immutable:
- Builder Companies: 80
- Builder Contacts: 80
- Builder MahaRERA Filings: 80
- Builder Pipeline Deals: 80
- Educational Institutions: 80
- Education Contacts: 80
- Education Funding Profiles: 80
- Education Pipeline Deals: 80
- Education Consent Records: 80
- Administrator Accounts: 1
- Global Automation State: 1
- **Subtotal Core Fixed Master:** $80 \times 4 + 80 \times 5 + 1 + 1 = \mathbf{722\text{ records}}$.

### 3.2 Dynamic Runtime Tasks (35 Records)
- Seed baseline tasks: 2 records (`TSK-001`, `TSK-002`).
- Follow-up tasks auto-generated from testing inbound public enquiries: 33 records.
- Total tasks: **35 records**.

### 3.3 Runtime Activity Logs (Excluded from Core Migration Manifest)
- `builder_enquiries.json`: 11 records (public form test entries).
- `education_enquiries.json`: 24 records (public form test entries).
- `admin_audit_logs.json`: 180 records (immutable audit trail).
- `admin_sessions.json`: 13 records (session cache).

---

## 4. INTEGRITY GUARANTEES

1. **Zero Record Fabrication:** No records have been fabricated, modified, or silently adjusted to make predetermined figures match.
2. **Zero Primary Key Duplication:** 100% of records possess unique, valid primary keys.
3. **Zero Schema Validation Errors:** 100% of records strictly conform to their Mongoose models.
4. **Idempotency:** Migration scripts utilize upsert operations (`filter = { [primaryKey]: doc[primaryKey] }`, `{ upsert: true }`), ensuring that running the migration multiple times produces zero duplicate records.
