# DASHBOARD AND REPORTING RECONCILIATION (2026-11-16)

- **Endpoint:** `GET /api/portal/dashboard/overview` (`src/routes/unifiedPortalRoutes.cjs`)
- **Computation Source:** Live `.length` / `.filter()` queries over `builder_*`, `education_*`, `unified_tasks`, and `system_automation_state` (zero hardcoded production totals).

| Metric | Source Database Count | Logic in `unifiedPortalRoutes.cjs` | Reconciled |
|---|---:|---|---|
| Total Builder Companies | `80` | `builders.length` | **MATCH** |
| Verified Builders | `80` | `verification_status === 'Verified'` | **MATCH** |
| Partnership-Ready Builders | `52` | `outreach_readiness === 'APPROVED FOR IMMEDIATE OUTREACH'` | **MATCH** |
| Awaiting Contact Confirmation | `18` | `outreach_readiness === 'APPROVED AFTER CONTACT CONFIRMATION'` | **MATCH** |
| Builder Meetings Scheduled (Stage 9) | `1` | `bDeals.filter(d => d.stage === 9).length` | **MATCH** |
| Builder Enquiries | `14` | `builder_enquiries.length` | **MATCH** |
| Total Education Institutions | `80` | `institutions.length` | **MATCH** |
| Verified Institutions | `80` | `verification_status === 'Verified'` | **MATCH** |
| A+ Prospects | `52` | `lead_priority_tier === 'A+'` | **MATCH** |
| Consent Approved / Pending / Opted-Out | `0` / `79` / `1` | `education_consent_records` | **MATCH** |
| Education Enquiries | `29` | `education_enquiries.length` | **MATCH** |
| Unified Tasks | `43` | `unified_tasks.length` | **MATCH** |
