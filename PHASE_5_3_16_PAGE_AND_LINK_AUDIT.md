# AVANI LOAN SERVICES — PHASE 5.3.16 PAGE & LINK AUDIT
## COMPLETE ROUTE RESOLUTION, INTERNAL HYPERLINK & BUTTON VALIDATION MATRIX

**Document Reference:** `ALS-LINK-AUDIT-P5316-20261106`  
**Target Environment:** `https://www.avanifinserv.com` and Production Express Engine  
**Audit Objective:** Validate all application routes, internal anchors, action buttons, form submissions, and external resources for HTTP 200 resolution, error-free client state, and zero 404 dead links.

---

### 1. ROUTE MAPPING AND STATUS MATRIX

Every route declared within React Router (`src/App.jsx`) and Express backend (`src/server.cjs`) was probed and verified:

| # | Route URI | Rendering Component | Type | Associated CTAs / Buttons | Verification |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1 | `/` | `Home.jsx` | Public | "Apply Now", "Check Eligibility", "Call Expert" | **PASS (200)** |
| 2 | `/services` | `Services.jsx` | Public | "Learn More", "Calculate EMI", "Enquire" | **PASS (200)** |
| 3 | `/services/home-loan` | `HomeLoan.jsx` | Public | "Apply for Home Loan", "Check Rate", "Contact" | **PASS (200)** |
| 4 | `/services/salary-loan` | `SalaryLoan.jsx` | Public | "Get Personal Loan", "EMI Calculator" | **PASS (200)** |
| 5 | `/services/business-loan` | `BusinessLoan.jsx` | Public | "Get SME Loan Quote", "Upload Documents" | **PASS (200)** |
| 6 | `/services/mortgage-lap` | `MortgageLoan.jsx` | Public | "Calculate LAP EMI", "Property Valuation" | **PASS (200)** |
| 7 | `/services/education-loan` | `EducationLoan.jsx` | Public | "Check Student Loan", "Partner Institutes" | **PASS (200)** |
| 8 | `/services/doctor-professional-loan` | `DoctorLoan.jsx` | Public | "Doctor Priority Loan", "Enquire Now" | **PASS (200)** |
| 9 | `/services/chartered-accountant-loan` | `CALoan.jsx` | Public | "CA Practice Loan", "Express Sanction" | **PASS (200)** |
| 10 | `/builder-partnership` | `BuilderPartnership.jsx` | Public | "Register Builder Partnership", "Call Direct" | **PASS (200)** |
| 11 | `/institutional-funding` | `InstitutionalFunding.jsx` | Public | "Request Institutional Quote", "Enquire" | **PASS (200)** |
| 12 | `/calculators` | `CalculatorsHub.jsx` | Public | "Launch EMI Tool", "Eligibility Check" | **PASS (200)** |
| 13 | `/calculators/loan/emi` | `EmiCalculator.jsx` | Public | "Calculate Amortisation", "Download PDF" | **PASS (200)** |
| 14 | `/eligibility` | `Eligibility.jsx` | Public | "Run AI Eligibility", "Download Report" | **PASS (200)** |
| 15 | `/cibil-check` | `CibilGuide.jsx` | Public | "Get CIBIL Advisory", "Talk to Specialist" | **PASS (200)** |
| 16 | `/documents` | `DocumentsVault.jsx` | Public | "Download Checklist", "KYC Guidelines" | **PASS (200)** |
| 17 | `/download-application` | `DownloadApp.jsx` | Public | "Download Application Form PDF" | **PASS (200)** |
| 18 | `/about` | `About.jsx` | Public | "Our Team", "Corporate Profile", "Contact Us" | **PASS (200)** |
| 19 | `/contact` | `Contact.jsx` | Public | "Submit Ticket", "Open Map", "Call Desk" | **PASS (200)** |
| 20 | `/terms` | `Terms.jsx` | Public | "View Disclaimer", "View Privacy Policy" | **PASS (200)** |
| 21 | `/disclaimer` | `Disclaimer.jsx` | Public | "View Terms", "Grievance Redressal" | **PASS (200)** |
| 22 | `/privacy-policy` | `PrivacyPolicy.jsx` | Public | "Contact Grievance Officer", "Terms" | **PASS (200)** |
| 23 | `/admin/login` | `UnifiedAdminPortal.jsx` | Protected | "Sign In to Management Portal", "Reset" | **PASS (200)** |
| 24 | `/admin/portal` | `UnifiedAdminPortal.jsx` | Protected | "Export Excel", "Filter", "Inspect Drawer" | **PASS (Auth)** |

---

### 2. FORM ACTION & DATA TRANSMISSION AUDIT

1. **Inbound Builder Partnership Form (`/builder-partnership`):**
   - Transmits to `POST /api/portal/public/builder-enquiry`.
   - Validates company name, contact person, 10-digit mobile, official email, operating city, project units, and mandatory privacy acknowledgment.
   - Saves record into `builder_enquiries` with primary key format `ALS-ENQ-BLD-<TIMESTAMP>-<RANDOM>`.
   - Creates an automated administrative task in `unified_tasks` for follow-up within 1 business day.
2. **Inbound Institutional Funding Form (`/institutional-funding`):**
   - Transmits to `POST /api/portal/public/education-enquiry`.
   - Validates institution name, trust name, representative designation, phone, email, state, city, and required funding bracket.
   - Saves record into `education_enquiries` with primary key format `ALS-ENQ-EDU-<TIMESTAMP>-<RANDOM>`.
   - Automatically assigns deal to senior institutional loan desk.
3. **Quick Retail Lead Forms (Header & Hero):**
   - Collects customer name, mobile number, desired loan category, and loan amount.
   - Transmits securely to backend lead collector with client-side honeypot protection against spam bots.

---

### 3. BUTTONS & INTERACTIVE ELEMENTS AUDIT

- **All Clickable CTAs:** Audited for proper `cursor: pointer` feedback, hover elevation, and distinct active styling.
- **WhatsApp Direct Connect:** Formats telephone number with international dial code `+919175635165` using `https://wa.me/919175635165` with prefilled corporate greeting.
- **Download Buttons:** Verified to trigger instantaneous client-side PDF and Excel downloads using standard binary blobs and MIME type headers (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
