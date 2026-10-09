# AVANI LOAN SERVICES — PII PROTECTION & COMPLIANCE POLICY

**Document ID:** `ALS-DOC-PII-2026-001`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES  
**Statutory Framework:** Digital Personal Data Protection (DPDP) Act 2023 & DPDP Rules 2025 (India)  

---

## 1. Data Classification

- **Restricted Data (Highest Security):** PAN Card Number, Aadhaar Number, Bank Account Number, Bank Account Statements, CIBIL Credit Reports, Income Tax Returns (ITR), Salary Slips.
- **Confidential Data:** Mobile Number, Email Address, Full Name, City, Employment Details, Loan Requirements.
- **Internal Operational Data:** Application IDs (`ALS-APP-*`), Correlation IDs (`CORR-*`), Webhook IDs, Audit Logs.

---

## 2. Mandatory Masking Specifications

All data stored in general application state, transmitted over webhooks, or written to execution logs MUST adhere to the following deterministic masking formats:

| PII Attribute | Masking Pattern | Example Input | Masked Output |
| :--- | :--- | :--- | :--- |
| **Permanent Account Number (PAN)** | `XXXXX + Last 4 Digits + Last Character` | `ABCDE1234F` | `XXXXX1234F` |
| **Aadhaar Number** | `XXXXXXXX + Last 4 Digits` | `999988887777` | `XXXXXXXX7777` |
| **Bank Account Number** | `XXXXXXXX + Last 4 Digits` | `100200300400` | `XXXXXXXX0400` |
| **Mobile Phone Number** | `Country Code + First 2 + **** + Last 2` | `919876543210` | `9198****10` |

---

## 3. Strict Prohibitions

1. **Zero Real KYC in Development:** Never commit, copy, or place real customer PAN, Aadhaar, bank statements, or salary slips in development fixtures, Git commits, or documentation.
2. **Zero PII in AI Prompts:** General LLM prompts must receive only aggregated numerical facts (e.g. `Income: ₹1,20,000`, `FOIR: 42%`, `Obligations: ₹15,000`) and masked identifiers.
3. **Zero Raw Statements in Ordinary Logs:** n8n workflow logs and application stdout must NEVER print raw statement lines or unmasked account details.
4. **Consent Gate Prerequisite:** Under no circumstances may KYC processing, bank statement OCR, or credit bureau inquiries proceed without explicit consent verified in `LOAN-02-CONSENT`.

---

## 4. Data Retention & Erasure Schedule

- **Application Incomplete / Abandoned:** Raw documents purged automatically after 14 days.
- **Application Rejected / Withdrawn:** Customer data retained in masked audit format for 90 days, raw documents securely destroyed within 7 days.
- **Disbursed Loans:** Financial underwriting records retained for 7 years to comply with statutory banking audit regulations; raw identity documents transferred to lender of record.
