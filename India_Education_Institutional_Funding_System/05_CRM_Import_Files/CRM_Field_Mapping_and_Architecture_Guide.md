# AVANI LOAN SERVICES — CRM ARCHITECTURE & FIELD MAPPING GUIDE
**Target CRM Platforms:** Zoho CRM, LeadSquared, Salesforce Financial Services Cloud, HubSpot Enterprise  
**Author:** CRM & Database Architect, AVANI LOAN SERVICES  
**Calibration Date:** 2026-10-31  

---

## 1. CRM PIPELINE STAGES (1 TO 17)
The institutional funding sales pipeline is structured into 17 rigorous stages:
1. **Stage 01:** New Institution Identified (Initial research record created)
2. **Stage 02:** Research Pending (Secondary verification of trust and assets underway)
3. **Stage 03:** Contact Details Verified (Official telephone, email, and website confirmed)
4. **Stage 04:** Decision-Maker Identified (Owner, Chairman, Managing Trustee, or Secretary verified)
5. **Stage 05:** Initial Business Enquiry (Introductory corporate dossier dispatched)
6. **Stage 06:** Interested Prospect (Prospect acknowledges and requests advisory consultation)
7. **Stage 07:** Funding Requirement Received (Specific borrowing amount and purpose disclosed)
8. **Stage 08:** Documents Requested (Trust deed, 3 years audited ITR/balance sheets, property title deeds)
9. **Stage 09:** Financial Assessment (Debt service coverage ratio DSCR and collateral LTV evaluation)
10. **Stage 10:** Lender Matching (Shortlisting suitable public/private banks, NBFCs, or debt syndicates)
11. **Stage 11:** Application Initiated (Formal loan proposal submitted to financial institution)
12. **Stage 12:** Credit Assessment (Lender credit committee inspection and campus legal/technical audit)
13. **Stage 13:** Sanction Received (Sanction letter issued with approved terms and interest rate)
14. **Stage 14:** Disbursed (Loan agreement executed, mortgage created, funds released to trust account)
15. **Stage 15:** Not Interested (Trust has no current debt requirement; archived for annual review)
16. **Stage 16:** Follow-up Later (Trust has upcoming capital project in 6–12 months)
17. **Stage 17:** Do Not Contact (Explicit opt-out or disqualified institution)

---

## 2. STANDARD CRM FIELD MAPPING TABLE
| # | Standard Field Name | CRM API Name | Data Type | Permitted Values / Schema | Zoho CRM Field |
|---|---|---|---|---|---|
| 1 | Lead ID | `Lead_ID` | String (Unique) | ALS-EDU-XX-XXX-XXX | Custom Text |
| 2 | Institution Name | `Account_Name` | String | Mandatory Entity Name | Account Name |
| 3 | Category | `Institution_Category` | Picklist | School, College, University, Group | Industry Sub-type |
| 4 | Parent Trust / Society | `Parent_Trust` | String | Registered Trust / Society Legal Name | Parent Account |
| 5 | City | `Billing_City` | String | Standard City Name | Billing City |
| 6 | State | `Billing_State` | Picklist | Maharashtra, Karnataka, Gujarat, etc. | Billing State |
| 7 | Decision Maker Name | `Contact_Name` | String | Verified Leader Name | Contact Name |
| 8 | Designation | `Designation` | String | Chairman, Managing Trustee, Secretary | Title |
| 9 | Official Phone | `Phone` | Phone | E.164 Standard Format | Phone |
| 10 | WhatsApp Number | `WhatsApp_Number` | Phone | Verified WhatsApp Business Mobile | Mobile |
| 11 | Funding Requirement | `Funding_Amount_Cr` | Decimal (INR Cr) | ₹0.10 Cr to ₹10.00 Cr | Deal Amount |
| 12 | Funding Category | `Funding_Category` | Picklist | ₹10L-₹50L, ₹50L-₹2Cr, ₹2Cr-₹5Cr, ₹5Cr-₹10Cr | Pipeline Segment |
| 13 | Lead Quality Score | `Lead_Score` | Integer (0-100) | 0 to 100 Objective Score | Lead Score |
| 14 | Lead Tier | `Lead_Tier` | Picklist | A+, A, B, C | Priority Rating |
| 15 | Verification Status | `Verification_Status` | Picklist | Verified, Cross-verified, Publicly listed | Status |

