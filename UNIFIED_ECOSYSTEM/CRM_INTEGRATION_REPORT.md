# CRM Integration Report (`3-AVANI AI CRM` — Project 2)

**Execution ID:** `TASK-11720`  
**Repository / Folder:** `3-AVANI AI CRM` (`https://github.com/avaniagrofoods/avani-ai-crm.git`, branch `main`)  
**Verified Commit SHA:** `6563424c09348d29f952a5f19286176cf990c492`  
**Date:** 16 November 2026  

---

## 1. Integration Scope & Contracts Verified

1. **Registry Binding in Project 1:** Registered as provider `avani_ai_crm` (`AVANI AI CRM Service`, category `Connected Ecosystem`, webhook `/api/portal/integrations/cross-project/event`, health `/api/health`, required env keys `AVANI_CRM_URL`, `CRM_API_KEY`).
2. **Idempotency & Attribution Schema (`tests/test_cp28_remediation_contracts.test.cjs`):**
   - `src/app/api/public/enquiry/route.ts` persists `idempotencyKey` (returning `idempotencyHit: true` on duplicate keys), `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, and `consentPurpose`.
   - `src/models/Lead.ts` schema defines all 7 required attribution, idempotency, and consent fields.
   - `src/app/login/page.tsx` enforces `"Secure Owner Access"` and `"Enter owner email"` wording (removing legacy staff/advisor placeholders).
   - `src/app/inbox/page.tsx` defines `nextTempId` cleanly outside the `InboxPage` React component for hook purity.
3. **Contract Test Verification Result:**
   - Command: `node --test tests/test_cp28_remediation_contracts.test.cjs`
   - Observed Output: `PASS [1/4]`..`PASS [4/4]`, `pass 1, fail 0`, exit code `0` (`P2_CP28_TEST_EXIT: 0`).
4. **Repository Isolation:** Project 2's separate Git repository (`main`) and remote (`avaniagrofoods/avani-ai-crm.git`) were left clean and unmodified (`0` edits required).

## 2. Dependency Audit Status (`npm audit`)

- **Observed Result:** `26` total vulnerabilities (`2` critical, `16` high, `8` moderate, `0` low).
- **Risk Classification:** Tracked under `BLK-005` (`OPEN_TECHNICAL` / `ACCEPTED_RISK_WITH_APPROVAL`) — major framework dependency upgrades in Project 2 must be scheduled during a controlled maintenance window with full Next.js/CRM regression testing.
