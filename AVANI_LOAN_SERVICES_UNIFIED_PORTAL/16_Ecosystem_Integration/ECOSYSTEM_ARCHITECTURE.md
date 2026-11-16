# ECOSYSTEM ARCHITECTURE (2026-11-16)

- **Forward Flow:** Business Applications (`AdminIntegrationsPage.jsx`, `BuilderPartnershipPage.jsx`, `InstitutionalFundingPage.jsx`) -> Central API (`src/routes/portalIntegrationsRoutes.cjs`, `/api/portal/integrations`) -> Central Registry & Workflow Engine (`src/services/ecosystemIntegrationRegistry.cjs`) -> `IntegrationGateway` (`apps/integration-gateway/index.cjs`) -> Provider Adapters.
- **Reverse Flow:** External Provider -> Webhook Receiver (`/api/whatsapp-webhook`, `/api/meta/webhook`, `/api/vapi-callback`, `/api/lead`) -> Signature & Payload Validation -> Idempotency Lease -> CRM / Database -> Dashboard.
- **Security Controls:** `requirePortalAuth`, `requirePortalCsrf`, `requireRole('Super Administrator', 'Administrator')`, zero secret exposure in frontend/API responses, audit logging, and DLQ replay.
