# BUILDER MODULE FINAL QA REPORT (2026-11-16)

- **API Route Isolation (`src/routes/builderPortalRoutes.cjs`):** Interacts strictly with `builder_*` collections (`builder_companies`, `builder_contacts`, `builder_maharera`, `builder_pipeline`, `builder_enquiries`).
- **Auth & Permission Gate:** Protected by `requirePortalAuth` + `requirePermission('builder:read')` (`401` verified for unauthenticated `GET /api/portal/builder/companies`).
- **Dataset Verified:** `80` companies (`80` unique `builder_id`), `80` contacts, `80` MahaRERA records, `80` pipeline records, `14` enquiries.
- **Public Enquiry Route (`/builder-partnership`):** Live `HTTP 200` on `https://www.avanifinserv.com/builder-partnership`; intake validation tested via `tests/integration/test_website_crm_intake.test.cjs` (`5/5` PASS).
