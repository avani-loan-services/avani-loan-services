# AVANI LOAN SERVICES — END-TO-END DATA FLOW SPECIFICATION

**Document ID:** `ALS-DOC-DATAFLOW-2026-001`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES  
**Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. 15-Stage Underwriting Data Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Applicant
    participant Gateway as Nginx / Ingestion Gateway
    participant Orchestrator as AI Orchestrator / n8n
    participant Consent as LOAN-02 Consent Gate
    participant Vault as Private Doc Vault
    participant Normalizer as Statement API
    participant FOIR as FOIR Engine
    participant Policy as Policy Engine
    participant CRM as HubSpot / Sheets
    actor Advisor as Sachin Shinde (Human Underwriter)
    participant Audit as Immutable Audit Ledger

    Customer->>Gateway: Submits Loan Inquiry (Form / WhatsApp / Voice)
    Gateway->>Orchestrator: Generates ALS-APP-ID & Correlation ID
    Orchestrator->>Consent: Evaluates DPDP Act Consent
    alt Consent Not Granted
        Consent-->>Customer: Requests Purpose Consent (Processing Halted)
    else Consent Verified
        Consent->>Vault: Stores Raw Uploaded KYC & Statement
        Vault-->>Normalizer: Streams Statement File
        Normalizer->>Normalizer: Masks PII & Normalizes Bounces / Credits
        Normalizer->>FOIR: Feeds Verified Income & Existing EMIs
        FOIR->>FOIR: Deterministically Computes EMI, FOIR & Capacity
        FOIR->>Policy: Transmits Financial Assessment & Bureau Score
        Policy->>Policy: Evaluates Versioned Rules (SBI, HDFC, Bajaj, etc.)
        Policy-->>CRM: Syncs Idempotent Lead Dossier (HubSpot & Sheets)
        Policy->>Advisor: Holds Application for Mandatory Human Sanction
        alt Underwriter Approves
            Advisor->>Audit: Records Final Lender Sanction & Commission
            Advisor-->>Customer: Issues Official Bank Sanction Letter
        else Underwriter Rejects / Refers
            Advisor->>Audit: Records Rejection Reason Code
            Advisor-->>Customer: Notifies Reason & Mitigation Options
        end
    end
```

---

## 2. In-Transit Data Transformations

1. **Intake Payload:** Contains unmasked name, phone, loan product, requested amount.
2. **Correlation Tagging:** Assigned unique `CORR-[timestamp]-[rand]` and `ALS-APP-[date]-[rand]` tags.
3. **Consent Enforcement:** If `consentGranted === false`, pipeline terminates immediately with `status: AWAITING_CONSENT`. No external APIs or KYC services are contacted.
4. **Scrubbing & Masking:** PAN is masked to `XXXXX1234X`, Aadhaar to `XXXXXXXX1234`, and account number to `XXXXXXXX1234`.
5. **Statement Parsing:** Raw lines scanned for transaction keywords (`SALARY`, `BOUNCE`, `EMI`). Bounces flagged; verified average income derived.
6. **Mathematical Execution:** FOIR computed as `(Existing EMI + Proposed EMI) / Income`. Available EMI capacity converted to maximum allowable loan principal.
7. **Institutional Rule Matching:** Matched against criteria in `policies/v1/`. Reason codes attached (`MATCH_RECOMMENDED`, `REASON_CIBIL_BELOW_THRESHOLD`, etc.).
8. **Underwriting Quarantine:** Application status locked to `PENDING_HUMAN_UNDERWRITER_APPROVAL`.
9. **Ledger Audit:** Immutable log entry created with hash, timestamp, reviewer identity, and outcome.
