# Add Document Upload and Excel Export to Eligibility Page

## Goal Description

Implement a feature on the `/eligibility` page where visitors can upload financial documents (salary slips, bank statements, ITRs, etc.). After entering a password and clicking the eligibility calculator, the uploaded documents are parsed, relevant financial data is extracted, compiled into an Excel sheet, and offered for download. The implementation will also include any necessary UI/UX upgrades and backend processing to support this flow.

## User Review Required

> [!IMPORTANT]
> - Confirm the list of accepted document types and formats (PDF, JPG, PNG). 
> - Approve the chosen library for server‑side PDF/ image parsing (e.g., `pdf-parse` for PDFs, `tesseract.js` for OCR). 
> - Approve the UI design style for the upload component and download button (ensure it aligns with the premium aesthetic of the site).

## Open Questions

> [!WARNING]
> - **Document Parsing**: Should we rely on OCR for all uploads or use structured PDF parsing for known formats? 
> - **Security**: How long should uploaded files be retained on the server before deletion? 
> - **Excel Format**: What columns and formatting are required in the exported Excel sheet? 
> - **Authentication**: Is the password a static shared key or user‑specific? Should we store it in an environment variable?
> - **Performance**: Expected maximum file size per upload? 
> - **Error Handling**: Desired user feedback for unsupported file types or parsing failures.

---

## Proposed Changes

### Frontend (React)

- **[MODIFY] src/pages/Eligibility.jsx**
  - Add a file upload component (`<input type="file" multiple>`). 
  - Display a styled drag‑and‑drop area using the existing design system (glassmorphism, gradients). 
  - Add a password input field and a "Calculate Eligibility" button. 
  - After processing, show a download button linking to the generated Excel file.

- **[NEW] src/components/DocumentUploader.jsx**
  - Reusable component handling file selection, preview thumbnails, and validation of file types/sizes.
  - Uses `axios` to POST files to `/api/eligibility/upload`.

- **[NEW] src/components/ExcelDownloadButton.jsx**
  - Button that triggers a download of the Excel file returned from the server.

### Backend (Node/Express)

- **[MODIFY] src/routes/eligibility.js** (create if missing)
  - Add `POST /api/eligibility/upload` route to accept multipart/form-data.
  - Use `multer` middleware for handling file uploads, stored temporarily in a secure folder.
  - Validate file types and size.
  - After upload, invoke parsing service.

- **[NEW] src/utils/documentParser.js**
  - Functions to parse PDFs (`pdf-parse`) and images (`tesseract.js`). 
  - Extract key fields: salary amount, bank balance, tax figures, etc.
  - Return a JSON object with normalized financial data.

- **[NEW] src/utils/excelGenerator.js**
  - Use `exceljs` to create an Excel workbook from the parsed data.
  - Set column headers, apply styling (bold headers, alternating row colors) to match the premium UI.
  - Save the workbook to a temporary file and send it back to the client for download.

- **[MODIFY] src/server.js**
  - Ensure `express.json()` and `express.urlencoded()` middleware handle large payloads.
  - Add route registration for the new eligibility API.
  - Implement cleanup logic to delete temporary files after download or after a configurable TTL (e.g., 15 minutes).

### Environment & Security

- Add new env variables:
  - `ELIGIBILITY_UPLOAD_DIR` – directory for temporary storage.
  - `ELIGIBILITY_PASSWORD` – static password to protect the calculation.
  - `MAX_UPLOAD_SIZE_MB` – size limit for each file.

- Update `.env.example` with placeholders.

### Styling (CSS)

- **[MODIFY] src/pages/Eligibility.css** (or create if not existent)
  - Introduce glass‑morphism card for the upload area.
  - Use gradient background and subtle micro‑animations on hover for the download button.
  - Ensure accessibility (focus outlines, ARIA labels).

### Tests & Validation

- Add unit tests for `documentParser` and `excelGenerator` using Jest.
- Add integration test for the upload endpoint using `supertest`.
- Manual QA steps:
  1. Upload supported files → verify parsing.
  2. Click calculate → verify Excel download.
  3. Attempt unsupported file → verify user‑friendly error.

---

## Verification Plan

### Automated Tests
- Run `npm test` to execute Jest suites for parser and generator.
- Use `supertest` to POST a sample PDF and assert a 200 response with `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` MIME type.

### Manual Verification
- Deploy locally (`npm run dev`). Navigate to `/eligibility`.
- Upload a salary slip PDF and a bank statement image.
- Enter the correct password and click "Calculate Eligibility".
- Confirm the generated Excel file contains the expected rows/columns.
- Test edge cases: oversized file, wrong password, unsupported format.

> [!NOTE]
> After user approval, the implementation will be executed and the relevant files will be modified/created accordingly.
