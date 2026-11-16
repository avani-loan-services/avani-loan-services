# Unified Customer Data Model

**Execution ID:** `TASK-11720`  
**Owner Project:** Project 1 (`1-AVANI LOAN SERVICE FY 26-27`)  
**Date:** 16 November 2026  

---

## 1. Deterministic Central Customer Identity (`CUS-AVL-*`)

Implemented in `src/services/ecosystemIntegrationRegistry.cjs` (`generateCentralCustomerId(phone, email)`):

1. **Phone Normalization:** Strips non-digits and takes the trailing 10 digits (`String(phone || '').replace(/\D/g, '').slice(-10)`).
2. **Email Normalization:** Trims whitespace and converts to lowercase (`String(email || '').trim().toLowerCase()`).
3. **Composite Seed & Hash:** Concatenates `` `${normPhone}|${normEmail}` ``; returns `null` if both are empty.
4. **Canonical ID:** Computes SHA-256 hex digest, slices the first 12 characters, uppercases, and prefixes with `CUS-AVL-` (e.g., `CUS-AVL-<12-HEX>`).

## 2. Canonical Cross-Project Customer Index Schema

Stored in `customerIdentityIndex` (`Map<string, CustomerIndexRecord>`) inside `src/services/ecosystemIntegrationRegistry.cjs`:

| Field | Type | Description |
| :--- | :--- | :--- |
| `centralCustomerId` | `string` | Canonical `CUS-AVL-<12-HEX>` identifier |
| `externalIds` | `Record<string, string>` | Mapping from `sourceProject` (e.g., `Project 1`, `Project 2`, `Project 4`) to `externalId` (e.g., `EXT-LEAD-001`, `CALL-001`) |
| `consentStatus` | `'Approved' \| 'Pending_Request' \| 'Opted_Out'` | Default `'Pending_Request'`; flips automatically to `'Opted_Out'` if `mapCallingDisposition()` resolves `OPTED_OUT` |
| `lastCallDisposition` | `string?` | Mapped calling disposition (`QUALIFIED_INTERESTED`, `CALLBACK_REQUESTED`, `OPTED_OUT`, `COMPLETED`, etc.) |
| `updatedAt` | `string` | ISO-8601 UTC timestamp of latest cross-project mutation |

## 3. Marketing Attribution, Consent & Redaction Extensions

- **Attribution & Consent (`3-AVANI AI CRM` / Project 1 intake):** `Lead.ts` and `/api/public/enquiry` support `idempotencyKey`, `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, and `consentPurpose` (verified by Project 2 contract suite `test_cp28_remediation_contracts.test.cjs`).
- **PII Scrubbing Before Persistence:** `scrubSensitiveText()` (delegating to `5-AVAVI AI CALLING AGENT/calling-agent-bridge.js` `scrubPII()`) masks Aadhaar (`XXXXXXXX1234`), PAN (`XXXXX1234X`), 9–18 digit bank accounts, and OTP/pin/password/secret values (`$1: [REDACTED]`) before event summaries enter `crossProjectEvents`.
