# Technical Documentation

## Architecture
The AVANI LOAN SERVICES ecosystem is a React (Vite) Single Page Application backed by an Express server. 
It integrates several external services:
1. **Google Gemini LLM**: For loan eligibility processing and credit manager recommendations.
2. **Google Sheets (Google Drive API)**: For backend database synchronization and analytics.
3. **Meta (WhatsApp) Business API**: For direct CRM integration and automated communications.
4. **OmniDM AI Voice Agent**: For voice-based AI assistant callback routing.

## Eligibility Engine
Located at `src/services/eligibilityEngine.cjs`, it computes the maximum eligible loan based on standard FOIR, DTI, and tenure calculations. Financial limits are parameterized dynamically.

## CRM Routing
The `crmService.cjs` file routes inbound requests from the floating action buttons (AI Voice, WhatsApp) directly to a webhook destination (Hubspot/AVANI CRM), bridging the gap between web interactions and backend lead management.
