# Walkthrough - Comprehensive Document Lists & Education Loans on Eligibility Page

I have successfully updated the `/eligibility` checker page of Avani Finserv. Below is a detailed description of the modifications made, the design decisions, and how they have been verified.

## 📁 Modified Files

### [Eligibility.jsx](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/Eligibility.jsx)
- **Comprehensive Document Configuration**: Upgraded `PROFILE_DOCS` to include complete document requirements for all loan categories matching the documentation page.
- **Education Loans (India & Global)**: Added new profiles `Education_India` and `Education_Global` with specific student, co-applicant, and financial/academic upload options.
- **Dynamic Field Customization**: Added logic to dynamically adjust the input labels, hints, and placeholders when the active tab is an [Education Loan](/services/education-loan). This translates fields into Student/Co-applicant context (e.g. Co-applicant's Net Income, Co-applicant's EMIs, Co-applicant's Age, Student's Full Name) since students generally do not earn active incomes.
- **Admin Lead Display**: Integrated display handling in the Admin Dashboard for these new loan types to show friendly names ("Education (India)" and "Education (Global)") and proper Co-applicant field headers in the detail panel.

### [Eligibility.css](file:///c:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/Eligibility.css)
- **Responsive Segments / Tabs**: Added horizontal scrolling support (`overflow-x: auto; -webkit-overflow-scrolling: touch`) and custom scrollbar hiding for the `.calc-tabs` element. Added a media query so that the 6 segment tabs fill the width on desktop layouts, but scroll smoothly on mobile screens without breaking the card layout.

## 🧪 Verification & Output

### 1. Build Verification
- Ran `npm run build` locally.
- Verified that Vite successfully transformed and built all modules into a production bundle without any errors:
  ```
  ✓ built in 20.01s
  ```

### 2. Auto-Deployment & Integrations
- Updated Google Sheets App Script Webhook URL to: `https://script.google.com/macros/s/AKfycby-BeIa9P8-XoutWpBKRq3SnxG-EcWH9MoEDep1C3Gs9_6lJqA6ZFc5cO44mryIg4qOoQ/exec` in `googleSheets.js`, `verify-all.cjs`, and `test-sync.cjs`.
- Confirmed `VITE_HUBSPOT_FORM_ID` is set to `edde042c-3451-420a-a472-6a5c42cbdf98` in `.env`.
- Deployed successfully via `npx vercel deploy --prod --yes` to production, pointing live leads from the eligibility checker and contact forms to the correct Google sheet and HubSpot forms.

