# AVANI LOAN SERVICES — PHASE 5.3.16 BUILDER DATABASE IMPLEMENTATION
## MAHARASHTRA BUILDER PARTNERSHIP & REAL ESTATE INTELLIGENCE DATABASE (80 LIVE RECORDS)

**Document Reference:** `ALS-BUILDER-DB-P5316-20261106`  
**Module Name:** Module A — Maharashtra Real Estate & Builder Intelligence System  
**Database Record Count:** Exactly 80 Builders (10 Cities, 8 Builders per City)  
**Primary Key Schema:** `ALS-BLD-MH-<CITY>-XXX` (e.g., `ALS-BLD-MH-MUM-001`)  
**Data Authentication:** MahaRERA Registered & Verified Corporate Developers

---

### 1. DATABASE ARCHITECTURE & SCOPE

The Builder Database provides a complete real estate developer registry and pipeline tracker for Avani Loan Services' corporate home loan distribution, Approved Project Financial (APF) tie-ups, and construction finance operations.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BUILDER DATABASE ARCHITECTURE (80 DEVELOPERS)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Geographic Coverage: 10 Key Urban Hubs across Maharashtra                              │
│ [Mumbai] [Pune] [Nagpur] [Nashik] [Thane] [Aurangabad] [Kolhapur] [Solapur] [Amravati] [Nanded] │
│ (8 Premier Developers per Hub = 80 Total Verified Corporate Developers)                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Sub-View Views & Intelligence Filters:                                                 │
│ • All Builders (80)         • Residential Developers (80) • Builder Contacts (80)      │
│ • Decision Makers (79)      • Partnership Pipeline (80)   • Follow-up Tasks (0)        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Interactive Capabilities:                                                              │
│ • Instant Fuzzy Search by Builder Name, City, RERA ID, or Contact Executive            │
│ • Direct Detail Drawer with RERA Certifications, Active Project Count, Units           │
│ • Direct WhatsApp Partnership Chat (`https://wa.me/91...`)                             │
│ • Instant OpenXML Excel Master Export (`/api/portal/builder/export`)                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. GEOGRAPHIC DISTRIBUTION (10 MAHARASHTRA CITIES)

| # | City / Urban Region | Builder Count | Typical Developer Profile | Representative Projects / Promoters |
| :-: | :--- | :-: | :--- | :--- |
| 1 | **Mumbai MMR** | 8 | Tier-1 Conglomerates, High-Rise Residential | Macrotech (Lodha), Godrej, Oberoi, K Raheja |
| 2 | **Pune Metro** | 8 | Large Township Developers, IT Corridor Housing | Kolte-Patil, Rohan Builders, Kumar Properties |
| 3 | **Nagpur** | 8 | Vidarbha Hub, Commercial & Integrated Residential | Moraj Infratech, Rachana Construction |
| 4 | **Nashik** | 8 | Vineyard Valley, Affordable & Luxury Villas | Thakkers Developers, Bagad Properties |
| 5 | **Thane - Navi Mumbai**| 8 | Suburban Growth Corridors, Metro Expansion | Dosti Group, Hiranandani Communities |
| 6 | **Chhatrapati Sambhajinagar** | 8 | Marathwada Regional Industrial Centers | Kasliwal Group, Sara Builders |
| 7 | **Kolhapur** | 8 | Western Maharashtra Agri-Industrial Hubs | Ghatge Patil Infra, Shanti Promoters |
| 8 | **Solapur** | 8 | Textile & Smart City Housing Complexes | Balaji Developers, Siddheshwar Infra |
| 9 | **Amravati** | 8 | Education & Industrial Growth Belts | Gulmohar Builders, Tapadiya Constructions |
| 10 | **Nanded** | 8 | Holy City Tourism, Infrastructure & Suburbs | Guru Kripa Developers, Sachkhand Infra |
| **Total** | **10 Cities** | **80** | **100% MahaRERA Verified Developers** | **Statewide Master Coverage** |

---

### 3. INTERACTIVE SUB-VIEWS & TELEMETRY

1. **Sub-view: All Builders (`subview=all`):**
   - Displays master listing of all 80 real estate companies.
   - Shows Company Name, City, Tier, Active Projects, Total Residential Units, Partnership Tier.
2. **Sub-view: Residential Developers (`subview=residential`):**
   - Filters developers specializing in residential housing communities, high-rises, and integrated townships eligible for APF retail home loan counters.
3. **Sub-view: Builder Contacts (`subview=contacts`):**
   - Surfaces verified corporate alliances desks, marketing heads, and general liaison contacts.
4. **Sub-view: Decision Makers (`subview=decision_makers`):**
   - Curated list of 79 C-level executives, Managing Directors, Promoters, and Chief Financial Officers for senior-level partnership negotiations.
5. **Sub-view: Partnership Pipeline (`subview=pipeline`):**
   - 19-stage pipeline showing deal velocity from Initial Research (Stage 1) to Active Home Loan Desk Live on Site (Stage 19).
6. **Sub-view: Follow-up Tasks (`subview=tasks`):**
   - Actionable follow-up dates and task logs tied directly to real estate alliances representatives.

---

### 4. API SPECIFICATION & DATA INTEGRITY

- **List Endpoint:** `GET /api/portal/builder/companies?subview={view}&city={city}&search={query}&page=1&limit=25`
  - Requires: `requirePortalAuth`
  - Returns: `{ success: true, total: 80, subviewCounts: {...}, data: [...] }`
- **Detail Endpoint:** `GET /api/portal/builder/companies/:id`
  - Returns complete corporate dossier, contacts array, MahaRERA project list, active pipeline stages, and audit history.
- **Master Export Endpoint:** `GET /api/portal/builder/export`
  - Returns dynamic OpenXML spreadsheet `Builder_Database_Master.xlsx` with complete columns: `Builder ID, Company Name, Operating City, MahaRERA Number, Promoters, Contact Person, Phone, Email, Active Units, APF Status`.
