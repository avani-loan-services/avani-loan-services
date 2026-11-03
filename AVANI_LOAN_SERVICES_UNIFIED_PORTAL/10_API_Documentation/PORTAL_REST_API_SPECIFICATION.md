# REST API SPECIFICATION
## AVANI LOAN SERVICES UNIFIED PORTAL

**Base API URL:** `https://www.avanifinserv.com/api/portal/`  
**Authentication:** HTTP Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)  
**Data Format:** JSON (`Content-Type: application/json`)

---

## 1. Authentication & Session Endpoints (`/auth`)

### 1.1 Login
- **Endpoint:** `POST /api/portal/auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "username": "admin_master",
  "password": "ProvidedPassword123!"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "userId": "USR-0001",
    "username": "admin_master",
    "fullName": "Master Administrator",
    "role": "Super Administrator",
    "mustChangePassword": false
  }
}
```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials
  - `429 Too Many Requests`: Account temporarily locked after 5 failed attempts (15 min cooldown)

### 1.2 Get Current Profile
- **Endpoint:** `GET /api/portal/auth/me`
- **Auth Required:** Yes
- **Success Response (200 OK):** Returns current user object and permissions.

### 1.3 Change Password
- **Endpoint:** `POST /api/portal/auth/change-password`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "currentPassword": "ProvidedPassword123!",
  "newPassword": "NewStrongPassword2026!"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 1.4 Logout
- **Endpoint:** `POST /api/portal/auth/logout`
- **Auth Required:** Yes
- **Success Response (200 OK):** Invalidates active session.

---

## 2. Module A — Builder Partnership Endpoints (`/builder`)

### 2.1 Get Builders Directory
- **Endpoint:** `GET /api/portal/builder/companies`
- **Auth Required:** Yes (Read permissions)
- **Query Parameters:** `city`, `category`, `search`, `page`, `limit`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 80,
  "data": [
    {
      "builderId": "ALS-BLD-0001",
      "companyName": "Lodha Group (Macrotech Developers)",
      "city": "Mumbai",
      "projectCount": 24,
      "qualificationScore": 98.5,
      "outreachReadiness": "Approved Immediate Outreach"
    }
  ]
}
```

### 2.2 Get Builder Pipeline
- **Endpoint:** `GET /api/portal/builder/pipeline`
- **Auth Required:** Yes
- **Success Response (200 OK):** Array of active partnership deals with 19 stage taxonomy.

### 2.3 Update Builder Pipeline Deal Stage
- **Endpoint:** `PATCH /api/portal/builder/pipeline/:dealId`
- **Auth Required:** Yes (Sales Manager / Super Admin)
- **Request Body:**
```json
{
  "stage": "Discovery Meeting Scheduled",
  "notes": "Meeting set with VP Sales for Friday 3 PM"
}
```

### 2.4 Builder Contacts & MahaRERA
- **Endpoint:** `GET /api/portal/builder/contacts`
- **Endpoint:** `GET /api/portal/builder/maharera`
- **Success Response (200 OK):** Returns verified contact channels and MahaRERA project records.

---

## 3. Module B — Education Funding Endpoints (`/education`)

### 3.1 Get Educational Institutions
- **Endpoint:** `GET /api/portal/education/institutions`
- **Auth Required:** Yes
- **Query Parameters:** `state`, `category`, `search`, `page`, `limit`
- **Success Response (200 OK):** Array of 80 institutions with campus and accreditation fields.

### 3.2 Get Priority A+ Prospects
- **Endpoint:** `GET /api/portal/education/aplus`
- **Auth Required:** Yes
- **Success Response (200 OK):** Filtered list of 52 benchmark institutions scoring $\ge 85$.

### 3.3 Get & Update Education Pipeline
- **Endpoint:** `GET /api/portal/education/pipeline`
- **Endpoint:** `PATCH /api/portal/education/pipeline/:dealId`
- **Request Body:**
```json
{
  "stage": "Documents Requested",
  "ticketSize": "₹25 Crore",
  "notes": "Trust deed and 3-year audit report requested"
}
```

### 3.4 Funding Categories & Consent
- **Endpoint:** `GET /api/portal/education/funding-categories`: List of 12 credit facilities.
- **Endpoint:** `GET /api/portal/education/consent`: Complete DPDP consent ledger.

---

## 4. Unified Dashboard & Operational Endpoints (`/dashboard`)

### 4.1 System Overview
- **Endpoint:** `GET /api/portal/dashboard/overview`
- **Auth Required:** Yes
- **Success Response (200 OK):** Consolidated metrics across builders, institutions, pipeline, and tasks.

### 4.2 Task Management
- **Endpoint:** `GET /api/portal/dashboard/tasks`
- **Endpoint:** `POST /api/portal/dashboard/tasks`
- **Endpoint:** `PATCH /api/portal/dashboard/tasks/:taskId`

### 4.3 Inbound Enquiry Management
- **Endpoint:** `GET /api/portal/dashboard/enquiries`
- **Endpoint:** `PATCH /api/portal/dashboard/enquiries/:enquiryId`

### 4.4 Automation Controller
- **Endpoint:** `GET /api/portal/dashboard/automation/status`
- **Endpoint:** `POST /api/portal/dashboard/automation/emergency-stop`
- **Endpoint:** `POST /api/portal/dashboard/automation/resume`
- **Endpoint:** `POST /api/portal/dashboard/automation/sync`

### 4.5 Audit Logs
- **Endpoint:** `GET /api/portal/dashboard/audit-logs`
- **Success Response (200 OK):** Immutable event log containing operator ID, action, and timestamp.

---

## 5. Public Enquiry Endpoints (`/public`)

These public endpoints accept submissions directly from front-facing marketing pages without requiring authentication tokens:

### 5.1 Public Builder Partnership Enquiry
- **Endpoint:** `POST /api/portal/public/builder-enquiry`
- **Auth Required:** No (Rate limited: 10 req / min per IP)
- **Request Body:**
```json
{
  "companyName": "Shree Ram Developers",
  "contactPerson": "Anand Shinde",
  "designation": "Director of Sales",
  "officialEmail": "anand@shreeramdevelopers.in",
  "telephone": "+91 98220 12345",
  "city": "Pune",
  "reraNumber": "P52100012345",
  "activeProjects": 4,
  "partnershipInterests": ["Exclusive Site Home Loan Desk", "Fast Track Sanctions"],
  "notes": "Immediate assistance needed for upcoming Kharadi residential tower."
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Builder partnership enquiry received successfully",
  "enquiryId": "ENQ-BLD-1730456789000",
  "taskId": "TSK-0081"
}
```

### 5.2 Public Education Institutional Funding Enquiry
- **Endpoint:** `POST /api/portal/public/education-enquiry`
- **Auth Required:** No (Rate limited: 10 req / min per IP)
- **Request Body:**
```json
{
  "institutionName": "St. Xavier's Public School",
  "trustName": "St. Xavier Educational Foundation",
  "contactPerson": "Dr. Ronald D'Souza",
  "designation": "Managing Trustee",
  "officialEmail": "director@stxaviersedu.in",
  "telephone": "+91 98900 54321",
  "city": "Nashik",
  "state": "Maharashtra",
  "fundingCategory": "School Infrastructure Finance",
  "ticketSize": "₹15 Crore",
  "purpose": "Construction of new senior secondary academic wing and robotics laboratory.",
  "affirmConsent": true
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Education funding enquiry submitted successfully",
  "enquiryId": "ENQ-EDU-1730456789001",
  "taskId": "TSK-0082"
}
```
