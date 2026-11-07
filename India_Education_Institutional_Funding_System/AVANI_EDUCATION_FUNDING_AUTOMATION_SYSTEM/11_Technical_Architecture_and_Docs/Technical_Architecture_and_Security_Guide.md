# AVANI LOAN SERVICES — TECHNICAL ARCHITECTURE & SECURITY GUIDE
## System Design, Data Governance, Cryptographic Isolation, and Pipeline Architecture
**System Name:** Education Institutional Funding Automation & Lead Generation Architecture  
**Client Entity:** [AVANI LOAN SERVICES](https://www.avanifinserv.com/)  
**Version:** 2.0 (Phase 2 Production)  
**Execution Date:** 2026-10-31  

---

## 1. SYSTEM ARCHITECTURE & DATA FLOW

```mermaid
flowchart TD
    subgraph DataSources["1. Primary Research & Regulatory Ingestion"]
        S1["UGC & AICTE Regulatory Portals"]
        S2["CBSE & CISCE School Directories"]
        S3["Official Institutional Portals & Tenders"]
        S4["Trust & Society Public Filings"]
    end

    subgraph DataEngine["2. Forensic Audit & Scoring Engine"]
        A1["Deduplication Engine (0 Duplicates)"]
        A2["Authority Classifier (Owner/Trustee vs Principal)"]
        A3["100-Point Lead Scoring Matrix"]
        A4["Verification Tagger (Verified vs Partially Verified)"]
    end

    subgraph AutomationSuite["3. Commercial Pipelines & Marketing Automation"]
        C1["CRM Ready Import (24 Standard Fields)"]
        C2["16-Stage Pipeline Velocity Tracker"]
        C3["4 Persona-Specific Campaign Sequences"]
        C4["Opt-Out & Suppression List Enforcement"]
    end

    subgraph UserInterface["4. Executive Portals & Conversion Tools"]
        UI1["Live Interactive Dashboard (HTML5/SVG/JS)"]
        UI2["Printable PDF Executive Briefings"]
        UI3["Institutional Funding Enquiry Form (HTML/PDF)"]
        UI4["Excel/CSV Bank-Grade Exports"]
    end

    DataSources --> DataEngine
    DataEngine --> AutomationSuite
    AutomationSuite --> UserInterface
```

---

## 2. DATA VALIDATION RULES & SCHEMA INTEGRITY

1. **Unique Primary Keys:** Every record is assigned an immutable alphanumeric identifier formatted as `ALS-EDU-[REGION]-[CITY]-[SEQ]`.
2. **Mandatory Field Enforcement:** All 65 standard columns in the Master Database and all 24 columns in the CRM Master Import require non-null values. Missing data is strictly classified using standardized placeholders (`Not publicly verified` or `Pending Scheduled Outreach`).
3. **Regex Pattern Validations:**
   - Email addresses: `^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$`
   - Telephone / Mobile: `^(\+91[-\s]?)?[0-9]10$` or standard Indian STD switchboard format `^(\+91[-\s]?)?[0-9](2, 4)[-\s]?[0-9](6, 8)$`
   - Web URLs: `^https?:\/\/[^\s\/$.?#].[^\s]*$`
4. **Authority Separation:** School and college principals are flagged as academic administrators; statutory loan agreements are mapped exclusively to legal Trustees, Chairmen, and General Secretaries.

---

## 3. SECURITY, ENCRYPTION & CONFIDENTIALITY PROTOCOLS

1. **Zero Credential Collection:** The system strictly prohibits collecting net banking passwords, OTPs, or personal identity numbers (Aadhaar/PAN).
2. **Environment Variable Isolation:** Any API keys or server configuration parameters are maintained exclusively via local `.env` files and never checked into source control or printed in console logs.
3. **Automated Backup Strategy:** Complete snapshots of all source databases and generated artifacts are stored in `00_Original_Database_Backup/` prior to any data transformation.
4. **Local Execution & Privacy:** All data auditing, calculations, and PDF generations execute entirely on the local system without transmitting prospect data to unapproved third-party cloud aggregators.
