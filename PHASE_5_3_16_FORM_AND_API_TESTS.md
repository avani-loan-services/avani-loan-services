# AVANI LOAN SERVICES — PHASE 5.3.16 FORM & API TESTS
## SERVER-SIDE VALIDATION, INBOUND PERSISTENCE & REST API AUDIT

**Document Reference:** `ALS-API-TEST-P5316-20261106`  
**Execution Environment:** Production Node.js 20 Backend (`http://127.0.0.1:3000` via Nginx TLS 1.3 `https://api.avanifinserv.com`)  
**Scope:** Inbound Lead Intake Forms, Database CRUD, Authentication Handlers, Rate Limiters, Excel Streamers, and Error Propagation.

---

### 1. INBOUND ENQUIRY FORM TESTS

#### Test 1: Inbound Builder Partnership Form
- **Endpoint:** `POST /api/portal/public/builder-enquiry`
- **Payload Tested:**
  ```json
  {
    "company_name": "Regression Test Realty Ltd",
    "contact_person": "QC Officer",
    "business_telephone": "+919999988888",
    "official_email": "qc.builder.1793976575@example.com",
    "city": "Pune",
    "residential_project_count": 5,
    "partnership_interest": "APF & In-House Home Loan Counter",
    "privacy_acknowledgement": true
  }
  ```
- **Observed Result:** `HTTP 200 OK`
- **Response Received:**
  ```json
  {
    "success": true,
    "message": "Thank you! Your Builder Partnership Enquiry has been registered successfully. Our Home Loan Alliance Director will contact you within 1 business day.",
    "enquiry_id": "ALS-ENQ-BLD-1793976575340-CV7O"
  }
  ```
- **Database Verification:** Verified enquiry record in `builder_enquiries` and follow-up task generated in `unified_tasks`.

#### Test 2: Inbound Educational Funding Form
- **Endpoint:** `POST /api/portal/public/education-enquiry`
- **Validation Gates Tested:**
  - Missing Trust/Institute Name: `HTTP 400 Bad Request` ("Educational trust or institution name is required.")
  - Invalid Phone Number: `HTTP 400 Bad Request` ("A valid telephone number is required.")
  - Missing Privacy Checkbox: `HTTP 400 Bad Request` ("Privacy policy acknowledgement is required.")
- **Successful Submission:** Generates `enquiry_id: ALS-ENQ-EDU-...`, stores in `education_enquiries`, assigns to Institutional Finance Desk.

---

### 2. PRIVATE DATABASE REST API ENDPOINTS

| Endpoint | Method | Security Gate | Parameters Tested | Response Code | Observed Output / Payload |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/portal/health` | GET | Public | None | `200 OK` | `{"status":"ok","storage_engine":"mongodb_atlas","database":"connected"}` |
| `/api/portal/auth/login` | POST | Rate Limited | Valid credentials | `200 OK` | `{success: true, token: "...", user: {role: "Super Administrator"}}` |
| `/api/portal/auth/login` | POST | Rate Limited | Bad password | `401 Unauthorized` | `{success: false, message: "Invalid credentials. 4 attempt(s) remaining..."}` |
| `/api/portal/auth/me` | GET | `requirePortalAuth` | Auth Cookie/Bearer | `200 OK` | `{success: true, authenticated: true, user: {...}}` |
| `/api/portal/builder/companies` | GET | `requirePortalAuth` | `subview=all` | `200 OK` | `{success: true, total: 80, subviewCounts: {...}}` |
| `/api/portal/builder/companies` | GET | `requirePortalAuth` | `subview=residential` | `200 OK` | `{success: true, total: 80, data: [...]}` |
| `/api/portal/builder/companies` | GET | `requirePortalAuth` | `subview=contacts` | `200 OK` | `{success: true, total: 80, data: [...]}` |
| `/api/portal/builder/companies` | GET | `requirePortalAuth` | `subview=decision_makers`| `200 OK` | `{success: true, total: 79, data: [...]}` |
| `/api/portal/builder/companies` | GET | `requirePortalAuth` | `subview=pipeline` | `200 OK` | `{success: true, total: 80, data: [...]}` |
| `/api/portal/builder/companies/:id`| GET | `requirePortalAuth` | `:id=ALS-BLD-MH-MUM-001`| `200 OK` | `{success: true, data: {company_name: "Macrotech Developers..."}}` |
| `/api/portal/builder/export` | GET | `requirePortalAuth` | None | `200 OK` | Binary OpenXML XLSX Stream (14,263 bytes) |
| `/api/portal/education/schools` | GET | `requirePortalAuth` | `subview=all` | `200 OK` | `{success: true, total: 24, subviewCounts: {...}}` |
| `/api/portal/education/schools` | GET | `requirePortalAuth` | `subview=groups` | `200 OK` | `{success: true, total: 23, data: [...]}` |
| `/api/portal/education/schools` | GET | `requirePortalAuth` | `subview=trusts` | `200 OK` | `{success: true, total: 24, data: [...]}` |
| `/api/portal/education/schools` | GET | `requirePortalAuth` | `subview=prospects` | `200 OK` | `{success: true, total: 24, data: [...]}` |
| `/api/portal/education/schools/export`| GET | `requirePortalAuth`| None | `200 OK` | Binary OpenXML XLSX Stream (10,561 bytes) |
| `/api/portal/education/colleges` | GET | `requirePortalAuth` | `subview=all` | `200 OK` | `{success: true, total: 56, subviewCounts: {...}}` |
| `/api/portal/education/colleges` | GET | `requirePortalAuth` | `subview=engineering` | `200 OK` | `{success: true, total: 50, data: [...]}` |
| `/api/portal/education/colleges` | GET | `requirePortalAuth` | `subview=medical` | `200 OK` | `{success: true, total: 22, data: [...]}` |
| `/api/portal/education/colleges` | GET | `requirePortalAuth` | `subview=autonomous` | `200 OK` | `{success: true, total: 19, data: [...]}` |
| `/api/portal/education/colleges` | GET | `requirePortalAuth` | `subview=deemed` | `200 OK` | `{success: true, total: 14, data: [...]}` |
| `/api/portal/education/colleges/export`| GET | `requirePortalAuth`| None | `200 OK` | Binary OpenXML XLSX Stream (14,209 bytes) |
| `/api/portal/dashboard/overview`| GET | `requirePortalAuth` | None | `200 OK` | `{success: true, data: {databases: {totalDatabases: 3, ...}}}` |
| `/api/portal/dashboard/automation/status`| GET | `requirePortalAuth` | None | `200 OK` | `{success: true, data: {stop_active: false, ...}}` |

---

### 3. EXCEL EXPORT INTEGRITY AUDIT

All three database exports were tested and verified to deliver valid OpenXML spreadsheets with complete multi-column structures and auto-filters:
1. `Builder_Database_Master.xlsx`: 14,263 bytes, 80 rows + headers.
2. `School_Funding_Database_Master.xlsx`: 10,561 bytes, 24 rows + headers + analytical estimate disclosure footnote.
3. `College_University_Funding_Master.xlsx`: 14,209 bytes, 56 rows + headers.
