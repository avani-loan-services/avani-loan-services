# Implementation Plan - Free CIBIL Check Feature

Add a professional 'Free CIBIL Check' feature to the Avani Loan Service application. This includes a dedicated page, form validation, OTP verification, and automated data logging into Google Sheets.

## User Review Required

> [!IMPORTANT]
> **External Integrations & Credentials Required**:
> 1. **EmailJS**: We will use your existing EmailJS account for OTP verification. I will need the `Service ID`, `Template ID`, and `Public Key`.
> 2. **Google Sheets**: I will provide the "Google Apps Script" code. You will need to deploy it and provide the `Deployment URL`.
> 3. **Report Generation**: I will implement a client-side PDF generator (using `jspdf`) to provide a downloadable "Full CIBIL Report" based on the estimated score.

## Proposed Changes

### [UI Components]

#### [NEW] [CibilCheck.jsx](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/CibilCheck.jsx)
Create a new page with a multi-step form:
- **Step 1: Information**: Name, PAN Number, Mobile, Email.
- **Step 2: Verification**: OTP input via EmailJS verification.
- **Step 3: Result**: Interactive "CIBIL Score Gauge" reflecting an estimated score based on income/age logic.
- **Step 4: Report**: A "Download Full Report" button that generates a PDF summary.

#### [NEW] [CibilCheck.css](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/CibilCheck.css)
Add custom styling following the existing "glass-morphism" and premium aesthetic of the project.

### [Routing & Navigation]

#### [MODIFY] [App.jsx](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/App.jsx)
Register the `/cibil-check` route.

#### [MODIFY] [Navbar.jsx](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/components/Navbar.jsx)
Add "CIBIL Check" to the main navigation menu.

### [Data Integration]

#### [NEW] [googleSheets.js] (Likely in `src/lib/`)
Create a utility to handle the `fetch` POST request to the Google Apps Script Webhook.

## Verification Plan

### Automated Tests
- Browser test to verify the form validation and PDF download trigger.
- Validate PAN number regex.

### Manual Verification
- User to provide the Google Sheets Webhook URL for live data logging.
- User to verify the receipt of the Email OTP.
