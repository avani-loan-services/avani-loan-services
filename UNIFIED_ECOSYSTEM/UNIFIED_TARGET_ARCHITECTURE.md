# UNIFIED TARGET ARCHITECTURE (2026-11-16)

```text
Website / WhatsApp / Email / SMS / Voice / Manual CRM
  -> Central API & Auth (src/server.cjs, portalAuthMiddleware)
    -> Integration Gateway & 19-Service Registry (apps/integration-gateway/index.cjs + ecosystemIntegrationRegistry.cjs)
      -> Unified 8-Workflow Engine (WF-01..WF-08 with Consent Gate & Regulatory Guardrails)
        -> Project 2 (AVANI AI CRM) + Project 3 (AVANI LOAN AGENTS) + Project 4 (AVAVI AI CALLING AGENT)
          -> Canonical CUS-AVL-* Identity Index + Builder/Education Isolated Datasets
            -> Dashboard (/admin/integrations), Audit Logs & DLQ Recovery
```
