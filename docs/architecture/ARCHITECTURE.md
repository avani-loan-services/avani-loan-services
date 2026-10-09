# AVANI LOAN SERVICES — TARGET AI AUTOMATION ARCHITECTURE

**Document ID:** `ALS-DOC-ARCH-2026-001`  
**Execution Date:** 09 October 2026  
**Owner:** Sachin Shinde  
**Business Entity:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  

---

## 1. System Context & High-Level Architecture

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           LEAD INTAKE CHANNELS                         │
  │  • Website Forms (https://www.avanifinserv.com/)                       │
  │  • Meta WhatsApp Business (+91-9175635165) / AiSensy Live Chat         │
  │  • AI Telecalling Inquiries (Exotel SIP Trunk / Vapi / OmniDM)         │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                SECURITY GATEWAY & REVERSE PROXY (Nginx)                │
  │  • Rate Limiting, TLS 1.3, DDoS Mitigation                             │
  │  • HMAC Webhook Authentication & Idempotency Filter                    │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │            N8N TRANSACTIONAL WORKFLOW ENGINE (Queue Mode)              │
  │  [LOAN-01-LEAD] ──► [LOAN-02-CONSENT GATE] (Halt if no DPDP consent)   │
  │                            │                                           │
  │                            ▼                                           │
  │  [LOAN-03-KYC] ──► [LOAN-04-DOC-OCR & NORMALIZER]                      │
  │                            │                                           │
  │                            ▼                                           │
  │  [LOAN-05-FOIR] ──► [LOAN-06-BUREAU] ──► [LOAN-07-LENDER-POLICY]       │
  │                            │                                           │
  │                            ▼                                           │
  │  [LOAN-08-CRM] ──► [LOAN-09-HUMAN REVIEW GATE (Sachin Shinde)]         │
  │                            │                                           │
  │                            ▼                                           │
  │  [LOAN-10-DLQ] ──► [LOAN-11-REPORTING] ──► [LOAN-12-WHATSAPP]         │
  │  [LOAN-13-VOICE] ──► [LOAN-14-FOLLOW-UP] ──► [LOAN-15-AUDIT]           │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 DETERMINISTIC UNDERWRITING CORE (apps/)                │
  │  • apps/foir-engine/           (Pure Reducing Balance EMI, FOIR, DTI)  │
  │  • apps/policy-engine/         (Versioned Rules: SBI, HDFC, Bajaj, etc)│
  │  • apps/statement-api/         (Bank Statement Scrubbing & Normalizing)│
  │  • apps/integration-gateway/   (Idempotency Leases & Dead Letter Queue)│
  │  • apps/telecalling-service/   (Marathi/Hindi/English Qualification)   │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                          DATA STORAGE LAYER                            │
  │  • PostgreSQL 16 (Canonical Loan Application State)                    │
  │  • Redis 7 (BullMQ Queues & Fast Idempotency Leases)                   │
  │  • Encrypted Object Storage (Private KYC & Bank Statement Vault)       │
  │  • MongoDB (Resilient Conversation Memory & In-Memory Fallback)        │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Deterministic FOIR Engine (`apps/foir-engine/`)
- Evaluates fixed monthly debt obligations against verified net income.
- Derives maximum loan eligibility capacity using reverse Present Value (PV) calculations.
- Enforces borrower risk bands (`PRIME`, `STANDARD`, `STRETCHED`, `CRITICAL_OVERBURDENED`).
- LLM is strictly forbidden from calculating or guessing FOIR.

### 2.2 Versioned Lender Policy Engine (`apps/policy-engine/`)
- Evaluates applicant profile against institutional credit matrices (`policies/v1/`).
- Checks geographic eligibility, employment categories, minimum income, age limits, and CIBIL thresholds.
- Outputs structured match statuses (`MATCH_RECOMMENDED`, `CONDITIONAL_MATCH`, `REJECT`, `REFER_HUMAN_UNDERWRITER`) accompanied by standardized reason codes and document checklists.

### 2.3 Statement Normalizer & PII Vault (`apps/statement-api/`)
- Scrubs bank statements for ECS/NACH bounces, loan EMIs, and salary credit deposits.
- Enforces real-time regex masking of all 10-digit PANs, 12-digit Aadhaars, and bank account numbers.

### 2.4 Trilingual Telecalling Service (`apps/telecalling-service/`)
- Conversational qualification in Marathi, Hindi, and English.
- Evaluates TRAI DND opt-in compliance before triggering any outbound call.
- Provides immediate human transfer to Sachin Shinde (`+917249108474`).
- Strictly prohibited from guaranteeing loan sanctions or quoting arbitrary interest rates.

### 2.5 Human Underwriting Authorization Gate (`LOAN-09-REVIEW`)
- Technical block preventing autonomous sanction or automated disbursement.
- Flags application for Principal Loan Advisor sign-off.
