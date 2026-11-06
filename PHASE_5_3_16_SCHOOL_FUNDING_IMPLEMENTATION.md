# AVANI LOAN SERVICES — PHASE 5.3.16 SCHOOL FUNDING IMPLEMENTATION
## INDIA SCHOOL FUNDING & EDUCATIONAL TRUST DATABASE (24 LIVE RECORDS)

**Document Reference:** `ALS-SCHOOL-DB-P5316-20261106`  
**Module Name:** Module B (Schools) — K-12 Chains, Boarding Schools & Education Societies  
**Database Record Count:** Exactly 24 Primary & Secondary School Institutions  
**Primary Key Schema:** `ALS-EDU-MH-SCH-XXX` (e.g., `ALS-EDU-MH-SCH-001`)  
**Affiliations Covered:** CBSE, ICSE, IB World, Cambridge CAIE, Maharashtra State Board  
**Funding Instruments:** Campus Land Acquisition, Classroom Wing Construction, Sports Complexes, Bus Fleet Financing, Solar & Green Campus Capex, Working Capital

---

### 1. SEPARATION ARCHITECTURE & CATEGORIZATION

The 80 institutions in the master educational registry are deterministically partitioned using `src/utils/educationCategoryHelper.cjs` into two distinct, purpose-built databases:
- **School Funding Database:** 24 K-12 school campuses, educational trusts, and boarding institutions.
- **College & University Funding Database:** 56 higher education universities, medical institutes, and engineering colleges.

The School Funding Database specifically serves the debt structuring requirements of school founders, trustees, and governing boards.

---

### 2. CONFIRMED DATA VS. RESEARCH-BASED ESTIMATES DISCLOSURE

In accordance with strict corporate integrity and data governance guidelines, the School Funding Database maintains a clear, explicit distinction between confirmed regulatory records and analytical estimates:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ RESEARCH-BASED ANALYTICAL ESTIMATES DISCLOSURE PROTOCOL (UI BANNER)                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ "NOTICE TO LENDING OFFICERS & RESEARCH ANALYSTS:                                       │
│ Institutional identities, governing educational trust names, registration numbers,    │
│ affiliated examination boards (CBSE/ICSE/IB), and physical campus addresses are        │
│ CONFIRMED REGULATORY RECORDS. Student capacity, approximate enrolment numbers, and    │
│ estimated funding brackets represent research-based analytical projections compiled   │
│ for preliminary debt structuring and must be verified during formal credit appraisal." │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Data Classification Schema:
- **Confirmed Fields (`confirmed_fields`):**
  - `institution_id`, `institution_name`, `trust_name`, `board_affiliation`, `city`, `state`, `campus_address`, `contact_details`.
- **Analytical Estimates (`research_estimates`):**
  - `student_capacity_estimate`: Modelled from built-up area and classroom counts.
  - `approx_enrolment_estimate`: Projected at typical 75%–90% capacity utilization.
  - `estimated_funding_need`: Derived from proposed capex programs (₹5 Cr to ₹35 Cr).
  - Schema flag: `data_classification.is_estimate = true`.

---

### 3. SCHOOL DATABASE INVENTORY & SUB-VIEWS

| # | Sub-View | Filter Criteria | Live Count | Primary Focus |
| :-: | :--- | :--- | :-: | :--- |
| 1 | **All Schools** | `subview=all` | **24** | Master list of all primary, secondary, and senior secondary schools |
| 2 | **School Groups & Chains** | `subview=groups` | **23** | Multi-branch school societies, educational foundations, K-12 chains |
| 3 | **Education Trusts** | `subview=trusts` | **24** | Public Charitable Trusts registered under Charity Commissioner |
| 4 | **Priority Prospects (A+)**| `subview=prospects`| **24** | Top tier institutions ready for debt expansion structuring |
| 5 | **Funding Pipeline** | `subview=pipeline` | **24** | Active debt advisory stages from Lead to Term Loan Sanction |

---

### 4. REPRESENTATIVE SCHOOL INSTITUTIONS (24 MASTER RECORDS)

1. `ALS-EDU-MH-SCH-001`: The Cathedral & John Connon School, Mumbai (Anglo-Scottish Education Society) — ICSE/IB
2. `ALS-EDU-MH-SCH-002`: Bombay Scottish School, Mahim & Powai (Scottish Orphanage Society) — ICSE
3. `ALS-EDU-MH-SCH-003`: Dhirubhai Ambani International School, BKC Mumbai (Reliance Foundation) — IB/Cambridge
4. `ALS-EDU-MH-SCH-004`: The Bishop's School, Camp & Kalyani Nagar, Pune (Bishop's Education Society) — ICSE
5. `ALS-EDU-MH-SCH-005`: Sahyadri School, Rajgurunagar (Krishnamurti Foundation India) — ICSE Residential
6. `ALS-EDU-MH-SCH-006`: Center Point School, Nagpur (Center Point Educational Trust) — CBSE
7. `ALS-EDU-MH-SCH-007`: Barnes School & Junior College, Deolali, Nashik (The Bombay Education Society) — ICSE
8. `ALS-EDU-MH-SCH-008`: Singhania School (Smt. Sunitidevi Singhania Education Society), Thane — ICSE
9. `ALS-EDU-MH-SCH-009`: Nath Valley School, Chhatrapati Sambhajinagar (Nath Vidya Educational Foundation) — CBSE
10. `ALS-EDU-MH-SCH-010`: Sanjay Ghodawat International School, Kolhapur (Sou. Sushila Ghodawat Charitable Trust) — CBSE
11. `ALS-EDU-MH-SCH-011`: Podar International School, Parel & Regional Network (Podar Literacy and Education Trust) — CBSE/CAIE
12. `ALS-EDU-MH-SCH-012`: Ryan International School, Mumbai & Pune (St. Xavier's Education Trust) — CBSE/ICSE
13. `ALS-EDU-MH-SCH-013`: Vibgyor High, Mumbai & Pune (Vibgyor Educational Foundation) — ICSE/CBSE
14. `ALS-EDU-MH-SCH-014`: Orchids The International School, Mumbai (K12 Techno Services Trust Network) — CBSE
15. `ALS-EDU-MH-SCH-015`: Billabong High International School, Santacruz & Malad (Citizens Welfare Association) — CBSE/CAIE
16. `ALS-EDU-MH-SCH-016`: Delhi Public School, Pune (Takshila Educational Society) — CBSE
17. `ALS-EDU-MH-SCH-017`: EuroSchool, Airoli & Thane (EuroKids Foundation) — CBSE/ICSE
18. `ALS-EDU-MH-SCH-018`: Hutchings High School & Junior College, Pune (Methodist Church in India Trust) — ICSE
19. `ALS-EDU-MH-SCH-019`: D.Y. Patil International School, Worli & Navi Mumbai (D.Y. Patil Educational Trust) — IB/CAIE
20. `ALS-EDU-MH-SCH-020`: St. Vincent's High School, Pune (Poona Catholic Educational Association) — State Board/CBSE
21. `ALS-EDU-MH-SCH-021`: Campion School, Fort Mumbai (Jesuit Education Association) — ICSE
22. `ALS-EDU-MH-SCH-022`: St. Mary's School (ICSE), Mazgaon, Mumbai (St. Mary's Society) — ICSE
23. `ALS-EDU-MH-SCH-023`: The Kalyani School, Manjri, Pune (Akutai Kalyani Charitable Trust) — CBSE
24. `ALS-EDU-MH-SCH-024`: Riverdale International Residential School, Mulshi, Pune (Riverdale Educational Society) — ICSE Residential

---

### 5. EXPORT AND API SPECIFICATIONS

- **List Endpoint:** `GET /api/portal/education/schools?subview={view}&city={city}&search={query}&page=1&limit=25`
  - Requires: `requirePortalAuth`
  - Returns: `{ success: true, total: 24, subviewCounts: {...}, data: [...] }`
- **Master Export Endpoint:** `GET /api/portal/education/schools/export`
  - Downloads: `School_Funding_Database_Master.xlsx` (10.5 KB) with full audit columns, board affiliations, trustee contacts, estimated funding brackets, and classification disclosures.
