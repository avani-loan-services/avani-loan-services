# AVANI LOAN SERVICES — 35-POINT AUTOMATED QC REPORT

**Execution Date:** 2026-11-03T03:25:08.769Z
**Result:** 35 / 35 Passed (100% PASS RATE)

| QC ID | Category | Audit Test Description | Status | Evidence Recorded |
|---|---|---|---|---|
| QC 01 | Security | Authentication with Hash Verification | **PASSED** | Role: Super Administrator |
| QC 02 | Security | Unauthorized Route Access Rejection | **PASSED** | HTTP 401 Unauthorized returned |
| QC 03 | Security | Server-Side Session Handling | **PASSED** | User: admin@avanifinserv.com |
| QC 04 | Security | Force Password Change on Initial Login | **PASSED** | mustChangePassword flag enforced |
| QC 05 | Security | Role-Based Access Control (RBAC) | **PASSED** | Super Admin access verified, 1 users |
| QC 06 | Security | API Token Cryptographic Signature Verification | **PASSED** | Invalid JWT token rejected |
| QC 07 | Security | Credential Protection (Bcrypt Hash Storage) | **PASSED** | Password stored as bcrypt $2b$ hash, zero plaintext |
| QC 08 | Security | Server-Side Input Validation | **PASSED** | Company or builder name is required. |
| QC 09 | Security | Rate Limiter & Account Lockout Active | **PASSED** | Express-rate-limit configured on login (5/15m) & enquiries (10/h) |
| QC 10 | Security | Zero Sensitive Data in Public Endpoints | **PASSED** | Zero credential leakage in responses |
| QC 11 | Builder | Builder Database Ingestion Count | **PASSED** | Exactly 80 builders ingested |
| QC 12 | Builder | Duplicate Builder Company Detection | **PASSED** | Zero duplicates found across 80 records |
| QC 13 | Builder | Contact Verification Fields Populated | **PASSED** | 80 verified contacts with designation & department |
| QC 14 | Builder | MahaRERA Record Review & Classification | **PASSED** | 70 Verified Match, 6 Wrong Promoter, 4 Status Unconfirmed |
| QC 15 | Builder | Partnership 100-Point Qualification Scoring | **PASSED** | Total score: 7628, Mean: 95.35 / 100 |
| QC 16 | Builder | 19-Stage Builder Partnership Pipeline | **PASSED** | 19 distinct stages configured with deal progression |
| QC 17 | Builder | Pipeline Activity & Audit History | **PASSED** | Deal transitioned to Stage 9 with timestamped notes |
| QC 18 | Builder | All 8 Builder Excel Reports Generated | **PASSED** | 8 XLSX reports generated |
| QC 19 | Education | Educational Institution Ingestion Count | **PASSED** | Exactly 80 institutions ingested |
| QC 20 | Education | Duplicate Educational Institution Detection | **PASSED** | Zero duplicate institutions across 80 records |
| QC 21 | Education | Priority A+ Lead Classification Model | **PASSED** | Exactly 52 benchmark A+ prospects maintained |
| QC 22 | Education | Decision-Maker Contact Verification | **PASSED** | 80 verified leadership contacts |
| QC 23 | Education | Permission-Based Consent Guard | **PASSED** | Pre-consent opt-in enforced for all prospects |
| QC 24 | Education | Suppression & Opt-Out Handling | **PASSED** | Immediate opt-out suppression logged |
| QC 25 | Education | Inbound Institutional Enquiry Form Validation | **PASSED** | Enquiry ID: ALS-ENQ-EDU-1793676308672-AJJH |
| QC 26 | Education | Follow-up Cadence Rules Enforced | **PASSED** | Cadence intervals: 2, 5, 10, 15 business days with weekend exclusion |
| QC 27 | Education | 24-Stage Education CRM Pipeline | **PASSED** | 24 stages configured with strict lender sanction validation |
| QC 28 | Education | All 8 Education Excel Reports Generated | **PASSED** | 8 XLSX reports generated |
| QC 29 | Unified | Absolute Data Separation (Zero Cross-Namespace Leakage) | **PASSED** | Zero shared primary keys, separate tables & schemas |
| QC 30 | Unified | Live Telemetry Dashboard Calculations | **PASSED** | Live database counts: 80 Builders, 80 Institutions, 52 A+ Leads |
| QC 31 | Unified | Global Emergency STOP & Resume Mechanism | **PASSED** | Outbound channels halted and safely resumed |
| QC 32 | Unified | System Backup Integrity | **PASSED** | Backups preserved in 02_Backups (12 items) |
| QC 33 | Unified | Graceful Error & Exception Handling | **PASSED** | Handled malformed payloads with 400 Bad Request |
| QC 34 | Unified | Rate Limiting & Abuse Protection | **PASSED** | Express-rate-limit configured on auth and enquiry endpoints |
| QC 35 | Unified | Duplicate Send & Data Quality Sync Verification | **PASSED** | Zero builder or institution duplicates across statewide records |
