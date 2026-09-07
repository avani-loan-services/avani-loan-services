# Implementation Plan - Add Comprehensive Document Lists & Education Loans to Eligibility

Add all detailed document lists to the respective loan profiles on the `/eligibility` page to match the documents page, and add [Education Loan](/services/education-loan) (India) and Education Loan (Global) with document upload provisions in auto mode.

## User Review Required

> [!IMPORTANT]
> - All document lists are being mapped from the official `Documents.jsx` component definition, meaning more specific/comprehensive document upload categories will be shown to the user on `/eligibility`.
> - The Education Loan eligibility is calculated based on the Co-applicant's monthly net income and existing EMIs, as students typically do not have active incomes.
> - The two new tabs "Education (India)" and "Education (Global)" will be added to the tabs row.

## Proposed Changes

### Frontend - Eligibility Page

#### [MODIFY] [Eligibility.jsx](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/Eligibility.jsx)
- Update `PROFILE_DOCS` to include complete, detailed document categories matching the documents list page.
- Add `Education_India` and `Education_Global` profiles to `PROFILE_DOCS` with their student, co-applicant, and financial/academic upload options.
- Update the profile tabs array to render:
  - Personal / Salary
  - [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Business Loan](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)](/services/business-loan)
  - Doctor Loan
  - Home / Mortgage
  - Education (India)
  - Education (Global)
- Dynamically customize form labels and hints when an Education Loan tab is active (e.g. changing "Full Name" to "Student's Full Name", "Monthly Net Income" to "Co-applicant's Monthly Net Income", and "Age" to "Co-applicant's Age").
- Handle clean layout naming for the newly added tabs in the lead detail view and submission success messages.

#### [MODIFY] [Eligibility.css](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/Eligibility.css)
- Update `.calc-tabs` styling to support wrapping or clean rendering on mobile devices since the number of tabs is increasing from 4 to 6.

## Verification Plan

### Manual Verification
- Run local development server using `npm run dev`.
- Visit the local `/eligibility` page.
- Verify that clicking each tab (Personal, Business, Doctor, Home, Education (India), Education (Global)) shows the correct, complete document upload checklist.
- Test uploading files in all tabs and verify that the file count updates and turns green.
- Verify that form input labels dynamically update for Education Loans to reference Co-applicant details.
- Run a calculation using the Admin Eligibility Panel for each loan type and verify that calculations work correctly.
- Perform a Vercel deploy.
