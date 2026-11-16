# CRM DATA MAPPING (2026-11-16)

- **Module A (Builder Partnership):** `builder_id` (unique), `company_name`, `city`, `official_email`, `official_telephone`, `maharera_registration`, `qualification_score` (100-pt), `outreach_readiness`, `stage` (`1`–`19`).
- **Module B (Education Institutional Funding):** `institution_id` (unique), `institution_name`, `institution_category`, `lead_priority_tier` (`A+`/`A`), `consent_status` (`Pending_Request` / `Opted_Out` / `Approved`), `stage` (`1`–`24`).
- **Module Isolation:** Separate JSON/MongoDB collections and separate API routes; unverified or `Pending_Request`/`Opted_Out` contacts never enter outreach queues.
