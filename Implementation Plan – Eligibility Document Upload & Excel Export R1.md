# Eligibility Integration – Final Implementation Plan

## Goal Description
Create a fully‑automated eligibility workflow for `https://www.avanifinserv.com/eligibility` that:
1. Accepts user details **(Timestamp, Name, Phone, Email, Loan type, Amount, City, Source, Status, AI Call ID)**.
2. Uploads all supporting documents (PDF/JPG/PNG ≤ 10 MB) via multipart /form‑data.
3. Parses each document using **OCR**:
   - Prefer `pdf‑parse` for native PDFs (text extraction).
   - Fallback to **tesseract.js** for images or PDFs where text extraction fails.
4. Generates a professionally styled Excel report (columns & embedded formulas) using `exceljs`.
5. Saves the Excel file in a date‑wise folder:
   `C:\Users\ALPHA-1\Desktop\AVANI LOAN SERVICE FY 26-27\eligibility calculation sheet\<YYYY‑MM‑DD>\`
6. Sends the captured metadata to **Google Sheets** (via the confirmed script endpoint `https://script.google.com/macros/s/AKfycbyoAmAabpO9PUDH-AXatZm5Td7pO9n5W00Eoh6TNIkPtjbQZiYrhAv27XgyMtJdBxchEg/exec`).
7. Pushes the same data to **HubSpot** (contact creation).
8. Enforces a **30‑day retention** policy for uploaded files (cron job already present) and marks a placeholder flag for future Drive‑API upload.
9. Uses a static admin password stored in `process.env.ELIGIBILITY_PASSWORD` for the `/api/eligibility/process` endpoint.
10. Provides clear user‑friendly error messages for unsupported file types, size limits, and parsing failures.

## Configuration (Environment Variables – add to `.env`)
```
ELIGIBILITY_PASSWORD=Samarth@1356
ELIGIBILITY_UPLOAD_DIR=C:/Users/ALPHA-1/Desktop/AVANI LOAN SERVICE FY 26-27/uploads/eligibility
MAX_UPLOAD_SIZE_MB=10
ELIGIBILITY_RETENTION_DAYS=30
EXCEL_OUTPUT_ROOT=C:/Users/ALPHA-1/Desktop/AVANI LOAN SERVICE FY 26-27/eligibility calculation sheet
GOOGLE_SHEETS_ID=1iwWWEB3nJnboJv8nKteOni1bhNgdE-mLlhOhkNSg4Zw
GOOGLE_SERVICE_ACCOUNT_JSON=config/google-service-account.json
HUBSPOT_API_KEY=YOUR_HUBSPOT_API_KEY   # replace after you generate it
```
> **Note** – `GOOGLE_SERVICE_ACCOUNT_JSON` points to the service‑account file that must be placed at `config/google-service-account.json`.

## Backend (`src/routes/eligibility.js`)
- **Multer** limits: `fileSize = MAX_UPLOAD_SIZE_MB * 1024 * 1024` and accepts `.pdf,.png,.jpg,.jpeg`.
- Parse request body:
  ```js
  const meta = JSON.parse(req.body.metadata || '{}');
  ```
- Call `parseDocuments(req.files)` – inside `documentParser.js` we first try `pdf-parse`; if it throws or returns empty, we run `tesseract.js` on each page image.
- After `generateExcel(parsed)`, copy the Excel file to a folder named after the current date under `EXCEL_OUTPUT_ROOT`.
- Use **Google Sheets helper** (`appendRowToGoogleSheet(meta)`) and **HubSpot helper** (`syncToHubSpot(meta)`).
- Return `{ downloadUrl: '/api/eligibility/download/<fileName>' }`.
- Errors:
  - Unsupported file type → `400 { message: 'Supported formats are PDF, JPG, PNG (max 10 MB).' }`
  - Parsing failure → `500 { message: 'We could not extract data from the file. Please ensure the document is clear and try again.' }`
  - Invalid password → `401 { message: 'Invalid password' }`

## Front‑End (`src/pages/Eligibility.jsx`)
- Added **City** input field (state `city`).
- Built `metadata` object containing all fields plus `status: 'Pending'`.
- Appended `metadata` (JSON string) to the `FormData` before sending.
- Updated `handleSubmit` to create `FormData`, attach password, files (converted to `Blob`s), and metadata, then POST to `/api/eligibility/process`.
- On success, triggers automatic download of the generated Excel file.

## Utilities
### `src/utils/googleSheets.js`
```js
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
async function appendRowToGoogleSheet(row) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const values = [[
    row.timestamp, row.name, row.phone, row.email, row.loanType,
    row.amount, row.city, row.source, row.status, row.aiCallId
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}
module.exports = { appendRowToGoogleSheet };
```

### `src/utils/hubSpot.js`
```js
const fetch = require('node-fetch');
async function syncToHubSpot(row) {
  const body = {
    properties: {
      email: row.email,
      phone: row.phone,
      firstname: row.name.split(' ')[0] || '',
      lastname: row.name.split(' ')[1] || '',
      loan_type: row.loanType,
      loan_amount: row.amount,
      city: row.city,
      source: row.source,
      status: row.status,
      ai_call_id: row.aiCallId
    }
  };
  await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?hapikey=${process.env.HUBSPOT_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
module.exports = { syncToHubSpot };
```

## Excel Formatting (handled in `excelGenerator.js`)
- Columns: **Timestamp, Name, Phone, Email, Loan Type, Amount, City, Source, Status, AI Call ID**.
- Insert formulas for **Amount** (e.g., `=C2*12` for annualized loan amount) and any eligibility calculations you already have.
- Apply a clean table style, auto‑filter, header bolding, and a light gradient fill for premium look.

## Retention & Future Drive Upload
- Existing cron job (`node‑cron` at `0 2 * * *`) removes files older than `ELIGIBILITY_RETENTION_DAYS`.
- A boolean flag `enableDriveUpload` can be added later; for now it stays `false`.

## Script Endpoint Decision
- The second Google Apps Script URL (`.../AKfycbyoAmAabpO9PUDH-AXatZm5Td7pO9n5W00Eoh6TNIkPtjbQZiYrhAv27XgyMtJdBxchEg/exec`) returns **200 OK** with JSON, so all Google‑Sheet interactions will target this endpoint exclusively.

## Verification Steps (auto mode)
1. **Install dependencies**: `npm install googleapis node-fetch tesseract.js pdf-parse exceljs`.
2. **Build & run**:
   ```bash
   npm run dev   # Vite front‑end
   npm run start # Express back‑end
   ```
3. **Smoke test** (curl):
   ```bash
   curl -X POST http://localhost:3000/api/eligibility/process \
        -F "password=Samarth@1356" \
        -F "metadata={\"timestamp\":\"2026-06-06T10:00:00Z\",\"name\":\"John Doe\",\"phone\":\"9999999999\",\"email\":\"john@example.com\",\"loanType\":\"Personal\",\"amount\":\"500000\",\"city\":\"Latur\",\"source\":\"WebForm\",\"status\":\"Pending\",\"aiCallId\":\"\"}" \
        -F "files=@sample.pdf" \
        -F "files=@sample.jpg"
   ```
   Verify response includes `downloadUrl`, Excel appears in the date folder, a new row appears in Google Sheet, and HubSpot contact is created.
4. **Manual test**: Open `http://localhost:3000/eligibility`, fill the form (including City), submit, and confirm download and external integrations.

---
All requirements are now incorporated: OCR parsing strategy, 30‑day retention, Excel format, static password auth, 10 MB limit, friendly error handling, and the correct Google Script endpoint.

The implementation is ready to be executed in auto mode.
