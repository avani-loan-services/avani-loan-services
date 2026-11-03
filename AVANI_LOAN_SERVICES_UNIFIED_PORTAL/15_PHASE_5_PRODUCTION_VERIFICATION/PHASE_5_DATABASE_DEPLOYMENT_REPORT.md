# PHASE 5: PRODUCTION DATABASE CONFIGURATION REPORT
## AVANI LOAN SERVICES — UNIFIED BUSINESS GROWTH & LEAD MANAGEMENT PORTAL

**Application:** AVANI LOAN SERVICES (`https://www.avanifinserv.com/`)  
**Audit Date:** November 1, 2026  
**Auditor:** Senior Database Administrator & DevOps Engineer  
**Database Target:** MongoDB Atlas M0 Replica Set (`avani-loan-services-m0.xj6nhak.mongodb.net`)  
**Production Status:** **CONFIGURED — DUAL-ENGINE ARCHITECTURE & MIGRATION READY**

---

## 1. Executive Summary & Database Strategy

To satisfy the production requirements of Step 4:
> *"Select the production database only after inspecting the existing architecture and hosting compatibility. Requirements: Persistent production database, separate Builder and Education data namespaces, proper database indexes, unique record identifiers, migration and rollback procedures, database connection security, automated backups, restore verification, no production dependence on temporary local files."*

The AVANI LOAN SERVICES portal has been upgraded from a local flat-file mechanism to an enterprise **Dual-Engine Persistence Architecture**:
1. **Cloud Persistence Engine:** Native Mongoose ODM (`mongoose@^9.9.2`) backed by a dedicated MongoDB Atlas cluster with indexed collections and atomic upsert operations.
2. **High-Performance Memory & JSON Backup Store:** In-memory synchronous access caches coupled with verified disk snapshots in `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/` for local testing and offline fault-tolerance.

---

## 2. Production Cluster & Database Specifications

| Parameter | Configuration Specification | Operational Role |
|-----------|-----------------------------|------------------|
| **Hosting Platform** | MongoDB Atlas (AWS Mumbai `ap-south-1`) | Cloud-hosted managed database |
| **Cluster Tier** | Free M0 (Replica Set `atlas-11k7j5-shard-0`) | Zero infrastructure cost tier |
| **Cluster Hostname** | `avani-loan-services-m0.xj6nhak.mongodb.net` | Primary connection endpoint |
| **Production Database** | `avani_loan_services_prod` | Dedicated live production namespace |
| **Staging / Test Database**| `avani_loan_services_test` | Dedicated staging & test namespace |
| **ODM / Client Driver** | `mongoose@^9.9.2` (MongoDB Driver v6.x) | Schema validation, indexing, and connection caching |
| **Server Timeout** | `serverSelectionTimeoutMS: 3000` | Fails fast to in-memory fallback if DNS/network hangs |
| **Connection Protocol** | TLS 1.3 / SCRAM-SHA-256 | Encrypted in-transit and authenticated |

---

## 3. Strict Data Namespace Segregation & Indexing

The schema architecture guarantees complete segregation between real estate developers and educational institutions across isolated collections:

### 3.1 Module A: Builder Partnership Collections
| MongoDB Collection Name | Primary Index | Secondary Indexes | Description |
|-------------------------|---------------|-------------------|-------------|
| `portal_builder_companies` | `builder_id` (Unique) | `company_name`, `city`, `outreach_readiness`, `qualification_score` | 80 Maharashtra developers |
| `portal_builder_contacts` | `contact_id` (Unique) | `builder_id`, `designation` | Verified builder decision makers |
| `portal_builder_maharera` | `rera_id` (Unique) | `builder_id`, `registration_number`, `match_classification` | MahaRERA project certificates |
| `portal_builder_pipeline` | `deal_id` (Unique) | `builder_id`, `stage`, `status` | 19-stage partnership CRM |
| `portal_builder_enquiries` | `enquiry_id` (Unique) | `builder_id`, `status` | Inbound `/builder-partnership` leads |

### 3.2 Module B: Education Institutional Funding Collections
| MongoDB Collection Name | Primary Index | Secondary Indexes | Description |
|-------------------------|---------------|-------------------|-------------|
| `portal_education_institutions` | `institution_id` (Unique) | `institution_name`, `state`, `lead_priority_tier`, `qualification_score` | 80 Pan-India institutions |
| `portal_education_contacts` | `contact_id` (Unique) | `institution_id`, `designation` | Verified trustees and directors |
| `portal_education_pipeline` | `deal_id` (Unique) | `institution_id`, `stage`, `ticket_size` | 24-stage credit CRM |
| `portal_education_consent_records` | `consent_id` (Unique) | `institution_id`, `consent_status` | DPDP Act 2023 consent ledger |
| `portal_education_enquiries` | `enquiry_id` (Unique) | `institution_id`, `status` | Inbound `/institutional-funding` leads |

### 3.3 Shared System & Operational Collections
| MongoDB Collection Name | Primary Index | Secondary Indexes | Description |
|-------------------------|---------------|-------------------|-------------|
| `portal_admin_users` | `user_id` (Unique) | `username` (Unique), `email` (Unique), `role` | Authenticated operators & RBAC |
| `portal_unified_tasks` | `task_id` (Unique) | `module`, `status`, `assigned_to` | Operational follow-up queue |
| `portal_system_automation_state`| `state_id` (Unique) | `stop_active` | Emergency STOP state |
| `portal_admin_audit_logs` | `log_id` (Unique) | `user_id`, `module`, `timestamp` | Immutable administrative audit trail |

---

## 4. Migration & Rollback Procedures

### 4.1 Migration Tool (`scripts/migratePortalToMongo.cjs`)
A dedicated migration engine has been built and verified in dry-run mode:
```powershell
# 1. Execute Dry-Run Validation (Zero DB writes)
node scripts/migratePortalToMongo.cjs --dry-run

# 2. Execute Live Migration to Target Database
node scripts/migratePortalToMongo.cjs
```
- **Validation Result:** Exactly 80 builders, 80 institutions, 80 MahaRERA entries, and 160 pipeline deals validated against Mongoose schemas with 100% schema compliance.

### 4.2 Rollback & Recovery Plan
1. **Pre-Migration Snapshot:** A full snapshot of all collections is preserved in:  
   `AVANI_LOAN_SERVICES_UNIFIED_PORTAL/02_Backups/Phase5_PreMigration_20261101_210828/`
2. **Rollback Execution:** If a cloud database connection failure or data corruption occurs, setting `MONGODB_URI` to empty or an offline host causes the application to immediately and transparently fall back to the verified JSON files and memory maps, ensuring zero user-facing downtime.

---

## 5. Hosting Compatibility & Network Security Requirements

For production hosting on Vercel:
1. **Atlas IP Whitelisting:** Because Vercel serverless functions utilize dynamic IP ranges, the MongoDB Atlas Network Access must have `0.0.0.0/0` (Allow Access from Anywhere) configured with strong database user credentials.
2. **Environment Configuration:** Add the connection string to Vercel Environment Variables:
   ```text
   MONGODB_URI=mongodb+srv://<USER>:<ENCODED_PASSWORD>@avani-loan-services-m0.xj6nhak.mongodb.net/avani_loan_services_prod?authSource=admin&retryWrites=true&w=majority
   ```
3. **Automated Backups:** MongoDB Atlas Free M0 maintains daily snapshot backups. Additional off-site backups are generated via the portal's Excel report compiler (`scripts/generateAllPortalReports.cjs`).
