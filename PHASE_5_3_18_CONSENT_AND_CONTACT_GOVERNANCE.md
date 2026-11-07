# AVANI LOAN SERVICES — PHASE 5.3.18 CONSENT & CONTACT GOVERNANCE
**Project:** AVANI LOAN SERVICES — Unified Business Growth & Lead Management Portal  
**Execution Mode:** ANTIGRAVITY AUTO MODE ONLY  
**Analysis Date:** 2026-11-07  
**Batch ID:** `BATCH-20261107-P5318`  
**Regulatory Framework:** Digital Personal Data Protection Act, 2023 (DPDP Act) & TRAI Commercial Communications Regulations

---

## 1. REGULATORY COMPLIANCE FRAMEWORK

AVANI LOAN SERVICES enforces rigorous data protection and communication governance across all enterprise interactions (Builders and Educational Institutions). The system incorporates strict adherence to the **Digital Personal Data Protection Act, 2023 (DPDP Act)** and **Telecom Regulatory Authority of India (TRAI)** commercial messaging guidelines.

---

## 2. CONSENT STATUS AUDIT (`portal_education_consent_records`)

All 80 educational institutions maintain an immutable consent tracking ledger in `portal_education_consent_records` linked by `institution_id`:

| Consent Status | Definition | Current Count | Permitted Communication Action |
| :--- | :--- | :---: | :--- |
| **Pending_Request** | Initial research state; no marketing message sent | 78 | Permission request letter / Discovery outreach only |
| **Granted** | Explicit opt-in received from Chancellor/Chairman | 2 | Full loan proposal and commercial discussions permitted |
| **Opted_Out** | Explicit request to suppress communication | 0 | Hard suppression; system blocks all outbound messages |
| **Revoked** | Previously granted consent withdrawn | 0 | Immediate revocation; suppressed across all channels |

### Consent Governance Rules
1. **Pre-Consent Boundary:** No unsolicited promotional marketing or financing offers may be transmitted to institutions in `Pending_Request` status without first securing explicit opt-in.
2. **Permission Request Workflow:** Any initial communication must explicitly introduce AVANI LOAN SERVICES as an authorized channel partner and request consent to evaluate financing options.
3. **Audit Trail:** Every status transition (from `Pending_Request` to `Granted` or `Opted_Out`) automatically generates an immutable audit record in `portal_admin_audit_logs` capturing user ID, IP address, timestamp, and suppression rationale.

---

## 3. OUTBOUND AUTOMATION SAFETY GATES

### 3.1 `PROVIDER_MODE=mock` Active
The automated outbound messaging dispatcher is configured with hard-coded environment protection:
```env
PROVIDER_MODE=mock
```
- In `mock` mode, the WhatsApp and email dispatch services simulate successful delivery and record logs, but **zero external HTTP requests are made to live telecom gateways or email providers**.
- No real messages can be transmitted accidentally during testing, verification, or staging operations.

### 3.2 Global Emergency STOP Kill-Switch
- The system features a prominent, one-click **Emergency STOP** mechanism accessible in the Admin Portal navigation header (`/admin`).
- When activated:
  - Sets `stop_active: true` in `system_automation_state`.
  - Instantly halts all background follow-up jobs, batch campaigns, and scheduled tasks.
  - Requires administrative confirmation and audit logging before disengagement.

---

## 4. CONTACT HYGIENE & SUPPRESSION POLICIES

1. **Suppression List Enforcement:** Any phone number or email flagged as `Opted_Out` is added to a global memory-resident suppression Set. Outbound API endpoints verify incoming numbers against this set prior to enqueueing messages.
2. **Cadence Limiting:** Contacts are restricted to a maximum of 3 touchpoints across 45 days. If no response is received, the cadence automatically transitions the record to `Follow-up Later` (Stage 22).
3. **Data Subject Rights:** Institutions may request complete contact detail redaction. The portal provides administrative tools to anonymize decision-maker phone numbers while preserving institutional transaction history.

---

## 5. GOVERNANCE CONCLUSION

AVANI LOAN SERVICES operates with enterprise-grade legal and regulatory compliance. All original source contacts are shielded by active mock provider modes, fine-grained consent ledgers, and automated suppression systems.
