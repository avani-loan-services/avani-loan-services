# AVANI LOAN SERVICES — PHASE 5.3.16 FOOTER NAVIGATION AUDIT
## COMPLETE BOTTOM NAVIGATION, CONTACT HYPERLINKS & REGULATORY DISCLOSURE AUDIT

**Document Reference:** `ALS-FOOTER-AUDIT-P5316-20261106`  
**Component Inspected:** `src/components/Footer.jsx`  
**Audit Scope:** Multi-column footer layout, direct telephony/email protocols, corporate partnership links, statutory regulatory disclosures, no-advance-fee policy, and copyright metadata.

---

### 1. FOOTER COLUMN STRUCTURE & NAVIGATION MATRIX

The footer component provides comprehensive site closure, organizational credibility, statutory compliance notices, and direct contact avenues structured across four functional columns and a statutory bottom compliance bar:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AVANI LOAN SERVICES FOOTER                             │
├───────────────────┬───────────────────┬─────────────────────┬──────────────────────────┤
│ 1. Corporate Bio  │ 2. Retail Loans   │ 3. Institutional    │ 4. Contact & Support     │
│   & Brand Info    │   & Mortgages     │    & B2B Channels   │                          │
│                   │                   │                     │                          │
│ • Avani Finserv   │ • Home Loan       │ • Builder Alliance  │ • Rajiv Gandhi Chowk,    │
│ • DSA Disclosures │ • Salary Loan     │ • Institutional     │   Opp Bank of Baroda,    │
│ • No Advance Fee  │ • Business Loan   │   Funding           │   Ausa Road, Latur       │
│ • RBI Partner     │ • Mortgage (LAP)  │ • School Capital    │ • 📞 +91 91756 35165     │
│   Network         │ • Education Loan  │ • College Expansion │ • ✉️ enquiry@            │
│                   │ • Professional    │ • Financial Tools   │      avanifinserv.com    │
├───────────────────┴───────────────────┴─────────────────────┴──────────────────────────┤
│ BOTTOM COMPLIANCE BAR:                                                                 │
│ © 2026 Avani Loan Services | Privacy Policy | Terms & Conditions | Disclaimer | Portal │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. CONTACT HYPERLINK PROTOCOL VERIFICATION

A primary objective of the Phase 5.3.16 footer modernization is ensuring instant, zero-friction client connectivity through standardized operating system protocols:

| Link Description | Target Uniform Resource Identifier | Expected OS / Browser Action | Audit Verification |
| :--- | :--- | :--- | :---: |
| **Direct Phone Dialer** | `tel:+919175635165` | Triggers mobile dialer / desktop telephony app | **PASS** |
| **Official Email Intake** | `mailto:enquiry@avanifinserv.com` | Triggers default mail client with prefilled recipient | **PASS** |
| **Physical Headquarters** | `Latur, Maharashtra - 413512` | Address text clearly displayed with postal PIN code | **PASS** |
| **Administrative Access** | `/admin/login` | Direct route to password-protected CRM portal | **PASS** |

---

### 3. STATUTORY REGULATORY DISCLOSURES IN FOOTER

To adhere to the Reserve Bank of India (RBI) Digital Lending Guidelines and fair practices code, the footer explicitly incorporates statutory consumer advisories:

1. **Direct Selling Agent (DSA) Status:**
   > *"Avani Loan Services is an authorized corporate loan distribution partner and direct sales associate (DSA) representing leading scheduled commercial banks, nationalized institutions, and NBFCs registered with the Reserve Bank of India."*
2. **Strict No-Advance-Fee Guarantee:**
   > *"We strictly adhere to zero advance processing fees. Avani Loan Services never asks customers to pay cash, processing deposits, or sanction commissions into private personal bank accounts prior to formal bank loan disbursement."*
3. **Statutory Links in Bottom Bar:**
   - **Privacy Policy:** `/privacy-policy` (Data governance, IT Act 2000, grievance officer).
   - **Terms & Conditions:** `/terms` (Full service terms, borrower obligations).
   - **Disclaimer:** `/disclaimer` (Interest rate disclosures, credit verification rules, fraud warning).
   - **Admin Portal Access:** `/admin/login` (Secure internal staff and executive management gateway).
