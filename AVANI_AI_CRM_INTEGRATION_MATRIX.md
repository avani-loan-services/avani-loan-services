# AVANI AI CRM — INTEGRATION MATRIX & EVIDENCE AUDIT

**Document ID**: `AVANI_AI_CRM_INTEGRATION_MATRIX.md`  
**Execution Date**: 2026-08-11  
**Audit Rule**: No integration is marked operational based solely on HTTP 200 responses. Evidence classifications: `REAL`, `MOCK`, `SIMULATED`, `REPLAYED`, `UNVERIFIED`.

---

## 1. Integration Matrix

| Integration Name | API Endpoint | Webhook Route | Database Record | Physical Provider Evidence | Classification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Meta WhatsApp API** | `graph.facebook.com/v18.0` | `/api/whatsapp-webhook` | `WebhookInbox` | `WAMID-MOCK-1786416701646-975` (Simulated Status) | `SIMULATED` | **PASS (Mock)** / **UNVERIFIED (Live)** |
| **AiSensy Campaign** | `backend.aisensy.com/v2` | `/api/whatsapp-webhook` | `ProviderLedger` | Pending live API key configuration | `UNVERIFIED` | **UNVERIFIED** |
| **AVANI AI Agent** | Gemini 1.5 Flash API | Internal Orchestrator | `ConversationState` | Schema Validated Extraction (Language: Marathi) | `REAL` | **PASS** |
| **Gemini Extractor** | `@google/generative-ai` | `avaniAiAgent.cjs` | `ConversationState` | Structured JSON Extractor + Heuristic Fallback | `REAL` | **PASS** |
| **OmniDM Voice Agent** | `api.omnidm.ai/v1/calls` | `/api/omnidm/callback` | `ProviderLedger` | `OMNI-CALL-1786416701653` (Local Mock ID) | `MOCK` | **PASS (Mock)** / **UNVERIFIED (Live)** |
| **HubSpot CRM** | `api.hubapi.com/v3` | Downstream Sync | `ProviderLedger` | `HS-OBJ-1786416701656` (Mock Idempotent Upsert) | `MOCK` | **PASS (Mock)** / **UNVERIFIED (Live)** |
| **Google Sheets** | Sheets v4 API | Downstream Sync | `ProviderLedger` | Row 2 Match (Insert ➔ Update verified) | `SIMULATED` | **PASS** |
| **Zapier Webhook** | Hooks Catch API | Downstream Sync | `ProviderLedger` | Event `ZAPIER_AVL-20260811-000001_EVT_001` (Suppressed) | `SIMULATED` | **PASS** |
| **Vercel Serverless** | Express App Entry | `/api/whatsapp-webhook` | Atlas / Local Mongo | Build Passed (`2107 modules transformed`) | `REAL` | **PASS** |
| **MongoDB Database** | Mongoose `8.x` | All Models | MongoDB Collections | Local In-Memory Fallback Active | `REAL (Mock)` | **PASS (Local)** |

---

## 2. Distinction Between Mock & Live Evidence

1. **WhatsApp Delivery**: In local test mode, message ID `WAMID-MOCK-1786416701646-975` was processed through state transitions `API_ACCEPTED` ➔ `SENT` ➔ `DELIVERED` ➔ `READ`. Live WABA delivery evidence requires Meta Cloud API credentials.
2. **OmniDM Call Answered**: In local test mode, call ID `OMNI-CALL-1786416701653` received callback status `ANSWERED` triggering template `loan_consultation_offer`. Physical phone ringing requires live OmniDM API key.
3. **HubSpot Contact**: Object ID `HS-OBJ-1786416701656` proved duplicate suppression logic in code.
