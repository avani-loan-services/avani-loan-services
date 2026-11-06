# AVANI LOAN SERVICES — PHASE 5.3.16 COLLEGE FUNDING IMPLEMENTATION
## INDIA COLLEGE, UNIVERSITY & HIGHER EDUCATION FUNDING DATABASE (56 LIVE RECORDS)

**Document Reference:** `ALS-COLLEGE-DB-P5316-20261106`  
**Module Name:** Module B (Colleges & Universities) — Higher Education Debt Structuring System  
**Database Record Count:** Exactly 56 Premier Institutions of Higher Learning  
**Primary Key Schema:** `ALS-EDU-MH-COL-XXX` (e.g., `ALS-EDU-MH-COL-001`)  
**Disciplines Covered:** Engineering, Medicine & Hospitals, Autonomous Colleges, Deemed Universities, Multi-Institute Societies  
**Funding Products:** Hospital Wing Debt, Super-Specialty Medical Equipment, Research Labs, Hostel Towers, Campus Acquisition, Refinancing Existing High-Cost Debt

---

### 1. DATABASE COMPOSITION & SUBVIEW ARCHITECTURE

The College & University Funding Database delivers specialized financial intelligence tailored to large-scale capital investments (ranging from ₹15 Cr to ₹150+ Cr).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             COLLEGE & UNIVERSITY FUNDING DATABASE ARCHITECTURE (56 CAMPUSES)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Higher Education Categorization Matrix:                                                │
│ • Engineering Colleges & Tech Campuses (50)                                            │
│ • Medical Colleges, Dental Institutes & Teaching Hospitals (22)                        │
│ • Autonomous Institutions with Academic Autonomy (19)                                 │
│ • Deemed-to-be Universities & Private Universities (14)                               │
│ • Educational Trusts & Non-Profit Societies (56)                                       │
│ • Multi-Institution Higher Education Groups (56)                                       │
│ • Priority Funding Prospects A+ (28)                                                   │
│ • Active Higher Ed Loan Pipeline (56)                                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Credit Assessment Metrics Tracked:                                                     │
│ • NAAC Grade (A++, A+, A) & NBA Accreditations                                         │
│ • NIRF Ranking Tier & UGC 12(B) Recognition Status                                     │
│ • Total Student Headcount & Annual Tuition Cashflow Profiles                           │
│ • Existing Debt vs Operating Surplus (EBITDA Debt Service Coverage Ratio)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. INSTITUTIONAL BREAKDOWN BY SPECIALIZATION SUBVIEWS

| Sub-View Filter | Parameter | Records | Prominent Representative Campuses |
| :--- | :--- | :-: | :--- |
| **All Institutions** | `subview=all` | **56** | Complete higher education registry across Maharashtra & Western India |
| **Engineering Colleges** | `subview=engineering` | **50** | COEP Technological University, VJTI Mumbai, MIT World Peace University, PICT Pune, SPIT Mumbai |
| **Medical Colleges & Hospitals** | `subview=medical` | **22** | Bharati Vidyapeeth Medical College, DY Patil Medical, Krishna Institute of Medical Sciences, MGM Medical |
| **Autonomous Institutes** | `subview=autonomous` | **19** | Walchand College of Engineering Sangli, Government College of Engineering Karad, Cummins College Pune |
| **Deemed Universities** | `subview=deemed` | **14** | Symbiosis International University, NMIMS University, D.Y. Patil Vidyapeeth, Datta Meghe Institute |
| **Educational Trusts** | `subview=trusts` | **56** | All registered educational trusts operating the collegiate and university campuses |
| **Multi-Institution Groups** | `subview=groups` | **56** | Large groups operating multiple colleges across varied academic disciplines |
| **Priority Prospects (A+)** | `subview=prospects` | **28** | Top 50% institutions with superior balance sheets and active expansion capex programs |
| **Higher Ed Pipeline** | `subview=pipeline` | **56** | 19-stage corporate debt deal pipeline from Initial Contact to Bank Term Sheet Issuance |

---

### 3. SAMPLE HIGH-VALUE INSTITUTIONAL PROFILES

1. **`ALS-EDU-MH-COL-001`: College of Engineering, Pune (COEP Technological University)**
   - *Trust:* Autonomous State University Society
   - *Specialization:* Engineering & Advanced Computing (NIRF #73)
   - *Capex Opportunity:* ₹65 Cr for New Robotics & AI Innovation Complex
2. **`ALS-EDU-MH-COL-004`: Veermata Jijabai Technological Institute (VJTI), Mumbai**
   - *Trust:* Autonomous Educational Board of Governance
   - *Specialization:* Engineering & Textile Technology
   - *Capex Opportunity:* ₹45 Cr for High-Voltage Research Lab & Green Energy Campus
3. **`ALS-EDU-MH-COL-012`: Bharati Vidyapeeth Deemed University & Medical College, Pune**
   - *Trust:* Bharati Vidyapeeth Society
   - *Specialization:* Multi-Disciplinary, 1200-Bed Teaching Hospital & Medical College
   - *Capex Opportunity:* ₹120 Cr Super-Specialty Oncology Block & Equipment Line
4. **`ALS-EDU-MH-COL-018`: MIT World Peace University (MAEER's MIT Group), Pune**
   - *Trust:* Maharashtra Academy of Engineering & Educational Research (MAEER)
   - *Specialization:* Engineering, Management, Design, Pharmacy
   - *Capex Opportunity:* ₹95 Cr New Residential Campus Tower & Convention Center
5. **`ALS-EDU-MH-COL-027`: Symbiosis International (Deemed University), Pune & Lavale**
   - *Trust:* Symbiosis Society
   - *Specialization:* Law, Management, International Studies, Health Sciences
   - *Capex Opportunity:* ₹80 Cr Sports Science Complex & Student Housing Expansion

---

### 4. API SPECIFICATION & MASTER EXPORT

- **List API:** `GET /api/portal/education/colleges?subview={view}&category={cat}&city={city}&search={query}&page=1&limit=25`
  - Gated by: `requirePortalAuth`
  - Response: `{ success: true, total: 56, subviewCounts: {...}, data: [...] }`
- **Master Export Endpoint:** `GET /api/portal/education/colleges/export`
  - Generates: `College_University_Funding_Master.xlsx` (14.2 KB) formatted with corporate column headers, trustee names, NAAC/NBA accreditations, estimated funding needs, contact personas, and deal stages.
