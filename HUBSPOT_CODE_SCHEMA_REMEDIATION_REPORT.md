# AVANI LOAN SERVICES — HUBSPOT CODE SCHEMA REMEDIATION REPORT

**Date:** 14 September 2026  
**Gate:** Controlled Code Schema Remediation Gate  
**Project:** AVANI LOAN SERVICES ONLY  
**Authoritative Workspace:** `C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27`  
**Authoritative GitHub Repository:** `avani-loan-services/avani-loan-services`  
**Authoritative Branch:** `main`  
**Approved Baseline Commit:** `32be26eea389939787f49b7057962bd661e2f0b5`  
**Target File:** `src/utils/hubSpot.cjs`  
**HubSpot Portal ID:** `244236573`  

---

## Executive Verdict

### **VERDICT: PASS — CODE SCHEMA REMEDIATION COMPLETE**

All required property realignments and deterministic enumeration mappers have been implemented surgically in `src/utils/hubSpot.cjs` without modifying the underlying OAuth 2.0 authentication architecture or touching any external system.

---

## A. Before / After Property Mapping Matrix

| AVANI Field | Before (Rejected by Portal 244236573) | After (Authoritative Portal Schema) | Type / Transformation | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Loan Type** | `loan_type__c` | `loan_type` | `enumeration` (Select) mapped deterministically to internal portal option values | **REMEDIATED** |
| **Loan Amount** | `loan_amount` | `loan_amount_required` | `number` (Numeric parsed value, currency/punctuation stripped) | **REMEDIATED** |
| **Monthly Income** | `monthly_income` | `what_is_your_monthly_income` | `string` (Text) preserving exact range e.g. `₹1–2L` without corruption | **REMEDIATED** |
| **Applicant ID** | `avani_lead_id` | `lead_id` | `string` (Text) preserving exact AVANI Applicant ID e.g. `ALS-2026-001256` | **REMEDIATED** |
| **Source** | `source` | *Omitted* | Removed from HubSpot payload; non-existent custom field eliminated | **REMEDIATED** |
| **Lead Status** | `meta.status \|\| 'Pending'` (Mixed Case) | `hs_lead_status: 'NEW'` | `enumeration` (Radio) strictly normalized to uppercase internal key | **REMEDIATED** |
| **First Name** | `firstname` | `firstname` | Preserved verbatim (extracted from `meta.name`) | **PRESERVED** |
| **Last Name** | `lastname` | `lastname` | Preserved verbatim (extracted from `meta.name`) | **PRESERVED** |
| **Email** | `email` | `email` | Preserved verbatim | **PRESERVED** |
| **Phone** | `phone` | `phone` | Preserved verbatim | **PRESERVED** |
| **City** | `city` | `city` | Preserved verbatim | **PRESERVED** |

---

## B. Loan Enumeration Mapping

The deterministic helper `mapLoanTypeToHubSpot(loanType)` normalizes incoming loan product strings to one of the seven verified allowed internal enumeration keys of Portal `244236573`:

| Incoming AVANI Display Label / Variant | Target HubSpot Internal Enum Value | Verification Status |
| :--- | :--- | :---: |
| `Personal Loan` | `personal_salary_loan` | **PASS** |
| `[[[[[[[[[[[[Salary Loan](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)](/services/salary-loan)` | `personal_salary_loan` | **PASS** |
| `Personal / Salary Loan` | `personal_salary_loan` | **PASS** |
| `[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)` | `business_loan` | **PASS** |
| `Commercial Loan` / `MSME Loan` | `business_loan` | **PASS** |
| `Doctor Loan` / `Doctor Professional Loan` | `doctor_loan` | **PASS** |
| `[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)` / `Housing Loan` | `home_loan` | **PASS** |
| `Mortgage Loan` / `Loan Against Property (LAP)` | `mortgage_loan` | **PASS** |
| `[Education Loan](/services/education-loan) (India)` / `Education Loan` | `education_loan_india` | **PASS** |
| `Education Loan (Global Studies)` / `Education Loan - Global` | `education_loan_global` | **PASS** |
| Existing valid internal enum (e.g. `business_loan`) | Exact pass-through | **PASS** |
| Unrecognized / Invalid Loan Type | `''` (Does not silently invent options) | **PASS** |

---

## C. Test Results

### 1. Payload & Enum Unit Testing
Executed automated test suite `scratch/test_hubspot_payload_remediation.cjs`:
* **Loan Type Enum Mapping:** 17/17 test cases **PASSED**.
* **Numeric Loan Amount Parsing:** 7/7 test cases **PASSED** (converted strings like `'₹8,50,000'` to numeric `850000`).
* **Lead Status Normalization:** 9/9 test cases **PASSED** (mapped `'New'`, `'Pending'`, `''`, and `undefined` to `'NEW'`).
* **Complete Outgoing Payload Verification:**
  - `loan_type__c` present: **NO** (Eliminated)
  - `loan_amount` present: **NO** (Eliminated)
  - `monthly_income` present: **NO** (Eliminated)
  - `avani_lead_id` present: **NO** (Eliminated)
  - `source` present: **NO** (Eliminated)
  - `loan_type` emitted: **YES** (`business_loan`)
  - `loan_amount_required` emitted: **YES** (`850000` - `typeof number`)
  - `what_is_your_monthly_income` emitted: **YES** (`₹1–2L`)
  - `lead_id` emitted: **YES** (`ALS-2026-001256`)
  - `hs_lead_status` emitted: **YES** (`NEW`)

### 2. Project Build Validation
* **Command:** `npm run build`
* **Output:** `✓ built in 45.31s`
* **Exit Code:** `0` (Clean build, zero syntax errors, zero module resolution failures).

---

## D. Diff Boundary

### Modified Files:
* `src/utils/hubSpot.cjs` in authoritative repository `avani-loan-services` (and mirrored in workspace `1-AVANI LOAN SERVICE FY 26-27`).

### Exact Git Diff in `avani-loan-services` (against baseline `32be26e`):
```diff
--- a/src/utils/hubSpot.cjs
+++ b/src/utils/hubSpot.cjs
@@ -40,27 +40,121 @@ async function getAccessToken() {
   return accessToken;
 }
 
+/**
+ * Maps AVANI loan product display labels to authoritative HubSpot internal enumeration values.
+ * Portal 244236573 allowed options:
+ * - personal_salary_loan
+ * - business_loan
+ * - doctor_loan
+ * - home_loan
+ * - mortgage_loan
+ * - education_loan_india
+ * - education_loan_global
+ */
+function mapLoanTypeToHubSpot(loanType) {
+  if (!loanType || typeof loanType !== 'string') return '';
+  const norm = loanType.trim().toLowerCase();
+
+  if (norm.includes('global') || norm.includes('abroad') || norm.includes('overseas')) {
+    return 'education_loan_global';
+  }
+  if (norm.includes('edu') || norm.includes('student')) {
+    return 'education_loan_india';
+  }
+  if (norm.includes('doctor') || norm.includes('medical') || norm.includes('dr')) {
+    return 'doctor_loan';
+  }
+  if (norm.includes('home') || norm.includes('housing')) {
+    return 'home_loan';
+  }
+  if (norm.includes('mortgage') || norm.includes('lap') || norm.includes('property')) {
+    return 'mortgage_loan';
+  }
+  if (norm.includes('busin') || norm.includes('commercial') || norm.includes('msme') || norm.includes('sme')) {
+    return 'business_loan';
+  }
+  if (norm.includes('person') || norm.includes('salary') || norm.includes('salaried')) {
+    return 'personal_salary_loan';
+  }
+
+  // Exact option value pass-through if already internal key
+  const validEnums = [
+    'personal_salary_loan',
+    'business_loan',
+    'doctor_loan',
+    'home_loan',
+    'mortgage_loan',
+    'education_loan_india',
+    'education_loan_global'
+  ];
+  if (validEnums.includes(norm)) {
+    return norm;
+  }
+
+  return '';
+}
+
+/**
+ * Safely parses loan amount into a numeric value as required by HubSpot's number field type.
+ */
+function parseLoanAmount(amount) {
+  if (typeof amount === 'number') {
+    return Number.isFinite(amount) ? amount : null;
+  }
+  if (!amount || typeof amount !== 'string') return null;
+  const cleaned = amount.replace(/[^\d.]/g, '');
+  if (!cleaned) return null;
+  const parsed = parseFloat(cleaned);
+  return Number.isFinite(parsed) ? parsed : null;
+}
+
+/**
+ * Normalizes lead status to HubSpot internal uppercase enumeration.
+ * Initial lead status is strictly 'NEW'.
+ */
+function mapLeadStatus(status) {
+  if (!status || typeof status !== 'string') return 'NEW';
+  const norm = status.trim().toUpperCase();
+  const validStatuses = [
+    'NEW',
+    'OPEN',
+    'IN_PROGRESS',
+    'OPEN_DEAL',
+    'UNQUALIFIED',
+    'ATTEMPTED_TO_CONTACT',
+    'CONNECTED',
+    'BAD_TIMING'
+  ];
+  if (validStatuses.includes(norm)) {
+    return norm;
+  }
+  return 'NEW';
+}
+
 async function syncToHubSpot(meta) {
   try {
     const token = await getAccessToken();
     const nameParts = (meta.name || '').split(' ');
-    const body = {
-      properties: {
-        email         : meta.email    || '',
-        phone         : meta.phone    || '',
-        firstname     : nameParts[0]  || '',
-        lastname      : nameParts.slice(1).join(' ') || '',
-        city          : meta.city     || '',
-        loan_type__c  : meta.loanType || '',
-        loan_amount   : meta.amount   || '',
-        monthly_income: meta.monthlyIncomeRange || meta.monthlyIncome || '',
-        avani_lead_id : meta.leadId || meta.avaniLeadId || '',
-        source        : meta.source   || '',
-        hs_lead_status: meta.status || process.env.ADMIN_STATUS_DEFAULT || 'Pending'
-      }
+    const properties = {
+      email                      : meta.email || '',
+      phone                      : meta.phone || '',
+      firstname                  : nameParts[0] || '',
+      lastname                   : nameParts.slice(1).join(' ') || '',
+      city                       : meta.city || '',
+      loan_type                  : mapLoanTypeToHubSpot(meta.loanType || meta.loanProduct),
+      what_is_your_monthly_income: meta.monthlyIncomeRange || meta.monthlyIncome || '',
+      lead_id                    : meta.leadId || meta.avaniLeadId || '',
+      hs_lead_status             : mapLeadStatus(meta.status || 'NEW')
     };
 
-    await axios.post(
+    const numAmount = parseLoanAmount(meta.amount);
+    if (numAmount !== null) {
+      properties.loan_amount_required = numAmount;
+    }
+
+    const body = { properties };
+
+    const hubRes = await axios.post(
       'https://api.hubapi.com/crm/v3/objects/contacts',
       body,
       {
@@ -71,10 +165,17 @@ async function syncToHubSpot(meta) {
       }
     );
     console.log('[hubspot] Contact synced successfully.');
+    return hubRes.data;
   } catch (err) {
     // Non‑fatal – log and continue
     console.error('[hubspot] Sync error (non‑fatal):', err.response?.data || err.message);
+    return { error: true, data: err.response?.data || err.message };
   }
 }
 
-module.exports = { syncToHubSpot };
+module.exports = {
+  syncToHubSpot,
+  mapLoanTypeToHubSpot,
+  parseLoanAmount,
+  mapLeadStatus
+};
```

---

## E. Security Confirmation

* **No secrets added:** Confirmed.
* **No tokens added:** Confirmed.
* **No credentials exposed:** Confirmed.
* **No Private App fallback added to production code:** Confirmed (`getAccessToken()` remains standard OAuth 2.0 refresh token grant).

---

## F. External Mutation Status

```text
HubSpot contacts modified:   NO
HubSpot properties modified: NO
Vercel modified:             NO
Deployment performed:        NO
Meta modified:               NO
Google Sheets modified:      NO
MongoDB modified:            NO
AVANI AGRO FOODS touched:    NO
```

---

## Conclusion & Next Gate

The HubSpot CRM contact property mapping code has been verified and remediated to match Portal `244236573` exactly.

**Status:** Code remediation complete. Awaiting human authorization for the subsequent **Vercel Production OAuth Configuration Gate**.
