# Add Chartered Accountant and Professional Loan Profiles

This plan outlines the steps to add the two requested loan profiles ("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[Chartered Accountant Loan](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)](/services/chartered-accountant-loan)" and "Doctor or Professional Loan") across the Avani Finserv website, and automatically deploy the changes.

## Proposed Changes

### Data and Configuration
#### [MODIFY] src/data/services.json
- Add an entry for `chartered-accountant-loan` with appropriate SEO, description, and eligibility criteria.
- Add an entry for `doctor-professional-loan` (renaming/expanding the existing Doctor concept if necessary).

### Pages
#### [MODIFY] src/pages/Home.jsx
- Update the `loanCards` array to include the two new loan types so they appear in the "Loan Products We Offer" grid.

#### [MODIFY] src/pages/Loans.jsx
- Update the `loans` array to include the two new loan types with their specific descriptions, rates, tenures, and features.
- Update the generic Doctor loan to specifically cater to "Doctor or Professional Loan".

#### [MODIFY] src/pages/Eligibility.jsx
- Update `PROFILE_DOCS` to include specific required documents for Chartered Accountants (e.g., COP, Membership Certificate) and Doctors/Professionals.
- Add the new options to the `calc-tabs` so users can select them.
- Adjust the eligibility calculator logic to handle their specific income types (usually ITR based like business or self-employed).

#### [MODIFY] src/pages/Documents.jsx
- Add "[chartered accountant loan](/services/chartered-accountant-loan)" and "[Doctor / Professional Loan](/services/doctor-professional-loan)" to the `docs` array to display their required document checklists in the accordion.

#### [MODIFY] src/pages/Catalog.jsx
- Add two new catalog cards (SCARD 6 and 7) for the new loan types.
- Update the sequence numbers (e.g., 01 / 07 instead of 01 / 05).
- Update the Portfolio Overview list on the contact page of the catalog.

### Components
#### [MODIFY] src/components/Footer.jsx
- Ensure any hardcoded lists of services in the footer include the new loans.

#### [MODIFY] src/components/LeadForm.jsx
- If there is a dropdown for selecting the loan type, ensure the new options are available.

## Verification Plan

### Automated Tests
- Build the project using `npm run build` to ensure no syntax errors.

### Deployment & Live Status
- Once the code changes are made, run the existing auto-deployment scripts (e.g. `.\auto-deploy.ps1`) to push the changes live as requested.
