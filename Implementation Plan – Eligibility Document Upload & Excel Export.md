# Eligibility Integration Plan

## Goal Description
Implement end‑to‑end processing for the eligibility form at `https://www.avanifinserv.com/eligibility`:
1. Capture form data (including a new **City** field) and send it to a Google Sheet and HubSpot.
2. Generate an Excel report on the server, store it in a date‑wise folder under `C:\Users\ALPHA-1\Desktop\AVANI LOAN SERVICE FY 26-27\eligibility calculation sheet`.
3. Ensure the backend route (`/api/eligibility/process`) handles the new metadata, pushes data to Google Sheets and HubSpot, and copies the Excel file to the target folder.
4. Add required environment variables and a service‑account JSON file for Google Sheets API.
5. Provide user guidance for obtaining a HubSpot API key.

## User Review Required
- **Google Sheet ID**: extracted ID `1iwWWEB3nJnboJv8nKteOni1bhNgdE-mLlhOhkNSg4Zw`. Verify this is correct.
- **Service‑account JSON**: we will create a placeholder file `google-service-account.json`. You must replace its contents with the actual credentials from your Google Cloud project.
- **HubSpot API key**: we will supply step‑by‑step instructions; you will generate the key in HubSpot and add it to `.env`.
- **Status column**: default set to `Pending`. If you need an additional default value, please specify.

## Open Questions
- Do you want the **Status** column to allow selection of other preset values (e.g., `In Review`, `Completed`) from the UI, or should it remain fixed to `Pending` on submission?
- Do you have a preferred location/name for the service‑account JSON file, or should we keep it as `config/google-service-account.json`?
- Confirm the **City** field should be a free‑text input (we will add it to the form).

## Proposed Changes
---
### Backend
#### [MODIFY] [src/routes/eligibility.js](file:///C:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/routes/eligibility.js)
- Import `appendRowToGoogleSheet` and `syncToHubSpot` utilities.
- Parse `req.body.metadata` (JSON) to obtain form fields.
- After Excel generation, copy the file to a date‑wise folder under `process.env.EXCEL_OUTPUT_ROOT`.
- Call both Google Sheets and HubSpot sync functions with the metadata.

#### [NEW] [src/utils/googleSheets.js](file:///C:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/utils/googleSheets.js)
- Helper that authenticates with a service‑account JSON and appends a row to the configured sheet.

#### [NEW] [src/utils/hubSpot.js](file:///C:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/utils/hubSpot.js)
- Simple function that POSTs contact data to HubSpot using the API key.

#### [MODIFY] [.env] (write file)
- Add `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `HUBSPOT_API_KEY`, `EXCEL_OUTPUT_ROOT`.

### Frontend
#### [MODIFY] [src/pages/Eligibility.jsx](file:///C:/Users/ALPHA-1/Desktop/AVANI%20LOAN%20SERVICE%20FY%2026-27/src/pages/Eligibility.jsx)
- Add a `city` state and an input field in the form.
- Include `city` (and `status: "Pending"`) in the `metadata` JSON that is appended to the FormData before posting.

### Project Setup
#### [NEW] [google-service-account.json] (placeholder)
- Create an empty JSON file with a comment reminding the user to paste their real service‑account credentials.

#### Scripts
- Ensure `npm install googleapis node-fetch` is run.
- Verify `npm run dev` (Vite) and `npm run start` (Express) start correctly.

## Verification Plan
### Automated Tests
- Run a curl command that posts a sample FormData (password, metadata, dummy PDF) to `/api/eligibility/process` and verify:
  * Response contains `downloadUrl`.
  * Excel file exists in the date‑wise folder.
  * Google Sheet row count increases (use Sheets API to read back the last row).
  * HubSpot contact is created (use HubSpot test endpoint or check via UI).

### Manual Verification
- Open the live site, fill out the form (including City), submit, and confirm:
  * Download prompt for the Excel report appears.
  * Row appears in the Google Sheet.
  * Contact appears in HubSpot.
  * Excel file is present under the correct local folder.

---
*Please review the plan, answer the open questions, and provide the service‑account JSON content (or upload the file). Once approved, we will execute the implementation and run all commands in auto mode.*
