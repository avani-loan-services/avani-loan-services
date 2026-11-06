# AVANI LOAN SERVICES — PHASE 5.3.16 REGRESSION RESULTS
## 100% AUTOMATED TEST EXECUTION LOG (30/30 PASSING)

**Document Reference:** `ALS-TEST-RUN-P5316-20261106`  
**Execution Timestamp:** 2026-11-06T14:49:36Z  
**Test Suite Script:** `scripts/test_phase_5_3_16_website_and_databases.cjs`  
**Target Environment:** Oracle Cloud Production VM (`http://127.0.0.1:3000` via Nginx TLS 1.3 `https://api.avanifinserv.com`)  
**Database Cluster:** MongoDB Atlas M0 Replica Set (`avani_loan_services_prod`)  
**Overall Result:** **30 TOTAL | 30 PASS | 0 FAIL (100% SUCCESS RATE)**

---

### 1. COMPLETE TEST EXECUTION SUMMARY TABLE

| Test ID | Category | Test Case Description | Verified Result / Telemetry | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | `HEALTH` | Portal backend health probe & DB connectivity | `Storage: mongodb_atlas`, `database: connected` | **PASS** |
| **TC-02** | `SECURITY` | Builder Database unauthenticated access blocked | Correctly rejected with `HTTP 401 Unauthorized` | **PASS** |
| **TC-03** | `SECURITY` | School Funding Database unauthenticated access blocked | Correctly rejected with `HTTP 401 Unauthorized` | **PASS** |
| **TC-04** | `SECURITY` | College Database unauthenticated access blocked | Correctly rejected with `HTTP 401 Unauthorized` | **PASS** |
| **TC-05** | `AUTH` | Admin login authentication & JWT generation | User: `admin`, Role: `Super Administrator` | **PASS** |
| **TC-06** | `AUTH` | Session verification `/api/portal/auth/me` | Valid active session for `Avani Executive SuperAdmin` | **PASS** |
| **TC-07** | `BUILDER_DB` | Builder Database Master total count equals 80 | Exactly 80 corporate builders loaded | **PASS** |
| **TC-08** | `BUILDER_DB` | Builder Subview: Residential Developers | Exactly 80 residential developers loaded | **PASS** |
| **TC-09** | `BUILDER_DB` | Builder Subview: Builder Contacts | Exactly 80 builders with verified contacts | **PASS** |
| **TC-10** | `BUILDER_DB` | Builder Subview: Decision Makers | Exactly 79 builders with C-level decision makers | **PASS** |
| **TC-11** | `BUILDER_DB` | Builder Subview: Partnership Pipeline | Exactly 80 active partnership deals loaded | **PASS** |
| **TC-12** | `BUILDER_DB` | Builder Subview: Follow-up Tasks | Verified tasks aggregation endpoint (0 tasks) | **PASS** |
| **TC-13** | `BUILDER_DB` | Single Builder Record Inspection (`ALS-BLD-MH-MUM-001`) | Fetched `Macrotech Developers Limited - Mumbai` | **PASS** |
| **TC-14** | `BUILDER_DB` | Builder Database Excel XLSX Export | Streamed `14,263 bytes` OpenXML spreadsheet | **PASS** |
| **TC-15** | `SCHOOL_DB` | School Funding Database total count equals 24 | Exactly 24 school records returned | **PASS** |
| **TC-16** | `SCHOOL_DB` | School Subview: School Groups & Chains | Found 23 multi-branch school groups | **PASS** |
| **TC-17** | `SCHOOL_DB` | School Subview: Education Trusts | Found 24 educational charitable trusts | **PASS** |
| **TC-18** | `SCHOOL_DB` | School Subview: Priority Funding Prospects | Found 24 priority school prospects | **PASS** |
| **TC-19** | `SCHOOL_DB` | School Data Classification (Confirmed vs Estimated) | Confirmed & research-based fields distinguished | **PASS** |
| **TC-20** | `SCHOOL_DB` | School Funding Database Excel XLSX Export | Streamed `10,561 bytes` OpenXML spreadsheet | **PASS** |
| **TC-21** | `COLLEGE_DB` | College & University Database count equals 56 | Exactly 56 college/university records returned | **PASS** |
| **TC-22** | `COLLEGE_DB` | College Subview: Engineering Colleges | Found 50 engineering technical institutions | **PASS** |
| **TC-23** | `COLLEGE_DB` | College Subview: Medical Colleges & Hospitals | Found 22 medical & healthcare institutions | **PASS** |
| **TC-24** | `COLLEGE_DB` | College Subview: Autonomous Institutes | Found 19 academic autonomous institutes | **PASS** |
| **TC-25** | `COLLEGE_DB` | College Subview: Deemed Universities | Found 14 deemed-to-be universities | **PASS** |
| **TC-26** | `COLLEGE_DB` | College Database Excel XLSX Export | Streamed `14,209 bytes` OpenXML spreadsheet | **PASS** |
| **TC-27** | `OVERVIEW` | Executive Overview 3 Databases Metric Verification | Verified telemetry: Builders: 80, Schools: 24, Colleges: 56 | **PASS** |
| **TC-28** | `ENQUIRY` | Inbound Builder Partnership Enquiry Submission | Generated `ALS-ENQ-BLD-1793976575340-CV7O` | **PASS** |
| **TC-29** | `SECURITY` | Automation & Outbound Dispatch Safety Gate | `PROVIDER_MODE=mock` active, zero unsolicited dispatches | **PASS** |
| **TC-30** | `SECURITY` | Zero Secrets Exposure in Public APIs | Sanitized outputs: zero passwords or URIs leaked | **PASS** |

---

### 2. RAW CONSOLE EXECUTION TRANSCRIPT

```
═══════════════════════════════════════════════════════════════════
  AVANI LOAN SERVICES — PHASE 5.3.16 REGRESSION TEST SUITE
  Target: http://127.0.0.1:3000
═══════════════════════════════════════════════════════════════════

✅ [TC-01] [HEALTH] Portal backend health probe — PASS (Storage: mongodb_atlas)
✅ [TC-02] [SECURITY] Builder Database unauthenticated access blocked — PASS (HTTP 401 Unauthorized)
✅ [TC-03] [SECURITY] School Funding Database unauthenticated access blocked — PASS (HTTP 401 Unauthorized)
✅ [TC-04] [SECURITY] College Database unauthenticated access blocked — PASS (HTTP 401 Unauthorized)
✅ [TC-05] [AUTH] Admin login authentication — PASS (User: admin, Role: Super Administrator)
✅ [TC-06] [AUTH] Session verification /me — PASS (Session valid for Avani Executive SuperAdmin)
✅ [TC-07] [BUILDER_DB] Builder Database Master total count equals 80 — PASS (Exactly 80 builders loaded)
✅ [TC-08] [BUILDER_DB] Builder Subview: Residential Developers — PASS (Found 80 residential builders)
✅ [TC-09] [BUILDER_DB] Builder Subview: Builder Contacts — PASS (Found 80 builders with contacts)
✅ [TC-10] [BUILDER_DB] Builder Subview: Decision Makers — PASS (Found 79 builders with decision makers)
✅ [TC-11] [BUILDER_DB] Builder Subview: Partnership Pipeline — PASS (Found 80 deals)
✅ [TC-12] [BUILDER_DB] Builder Subview: Follow-up Tasks — PASS (Found 0 builders with tasks)
✅ [TC-13] [BUILDER_DB] Single Builder Record Inspection (ALS-BLD-MH-MUM-001) — PASS (Macrotech Developers Limited - Mumbai)
✅ [TC-14] [BUILDER_DB] Builder Database Excel XLSX Export — PASS (Size: 14263 bytes)
✅ [TC-15] [SCHOOL_DB] School Funding Database total count equals 24 — PASS (Exactly 24 school records returned)
✅ [TC-16] [SCHOOL_DB] School Subview: School Groups & Chains — PASS (Found 23 school groups)
✅ [TC-17] [SCHOOL_DB] School Subview: Education Trusts — PASS (Found 24 educational trusts)
✅ [TC-18] [SCHOOL_DB] School Subview: Priority Funding Prospects — PASS (Found 24 priority prospects)
✅ [TC-19] [SCHOOL_DB] School Data Classification (Confirmed vs Estimated) — PASS (Confirmed & estimated fields clearly distinguished)
✅ [TC-20] [SCHOOL_DB] School Funding Database Excel XLSX Export — PASS (Size: 10561 bytes)
✅ [TC-21] [COLLEGE_DB] College & University Database total count equals 56 — PASS (Exactly 56 college/university records returned)
✅ [TC-22] [COLLEGE_DB] College Subview: Engineering Colleges — PASS (Found 50 engineering institutions)
✅ [TC-23] [COLLEGE_DB] College Subview: Medical Colleges & Hospitals — PASS (Found 22 medical/healthcare institutions)
✅ [TC-24] [COLLEGE_DB] College Subview: Autonomous Institutes — PASS (Found 19 autonomous institutes)
✅ [TC-25] [COLLEGE_DB] College Subview: Deemed Universities — PASS (Found 14 deemed universities)
✅ [TC-26] [COLLEGE_DB] College Database Excel XLSX Export — PASS (Size: 14209 bytes)
✅ [TC-27] [OVERVIEW] Executive Overview 3 Databases Metric Verification — PASS (Builders: 80, Schools: 24, Colleges: 56)
✅ [TC-28] [ENQUIRY] Inbound Builder Partnership Enquiry Submission — PASS (Enquiry ID: ALS-ENQ-BLD-1793976575340-CV7O)
✅ [TC-29] [SECURITY] Automation & Outbound Dispatch Safety Gate — PASS (PROVIDER_MODE=mock active, zero unsolicited dispatches)
✅ [TC-30] [SECURITY] Zero Secrets Exposure in Public APIs — PASS (Zero credentials or MongoDB URIs leaked in responses)

═══════════════════════════════════════════════════════════════════
  TEST SUMMARY
═══════════════════════════════════════════════════════════════════
  Total: 30 | PASS: 30 | FAIL: 0
  Rate: 100% Passing
```
