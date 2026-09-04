# Implementation Plan – Eligibility Document Upload & Excel Export

## Goal Description
Create a robust workflow on the `/eligibility` page allowing users to upload financial documents, parse them (OCR for all uploads), compute eligibility using bank‑specific Excel formulas, and download a professionally formatted Excel report. The system will retain uploaded files for **30 days** (with optional Google Drive storage) and enforce a **10 MB** per‑file limit. Authentication uses the static password **"Samarth@1356"**.

## User Review Required
> **[IMPORTANT]**
> - Confirm that OCR should be applied to **all** uploaded files (PDF, JPG, PNG). 
> - Retention period set to **30 days**; files will be automatically cleaned up after this TTL. An optional toggle allows storing uploads on Google Drive instead of the server.
> - Excel report must include professional columns (e.g., *Bank Name, Account Number, Salary, Net Income, Taxable Income, Eligibility Score*) and embed the bank’s eligibility formula (example: `=IF(NetIncome*0.4>LoanAmount, "Eligible", "Not Eligible")`).
> - Password is fixed as **Samarth@1356** (will be stored in `.env`).
> - Maximum upload size per file: **10 MB**.
> - Error handling messages: unsupported file type → “Supported formats are PDF, JPG, PNG (max 10 MB).”, parsing failure → “We could not extract data from the file. Please ensure the document is clear and try again.”
> - Choose the better Google Apps Script endpoint between the two provided URLs.

## Open Questions (Resolved)
- **Parsing strategy**: Use OCR for every upload (PDFs via `pdf-parse` for text extraction where possible, otherwise fallback to `tesseract.js`).
- **Retention**: 30‑day automatic deletion; optional Drive upload via Drive API (out of scope for now – placeholder flag).
- **Excel format**: Columns defined below; formulas inserted programmatically.
- **Authentication**: Static password stored in `process.env.ELIGIBILITY_PASSWORD`.
- **Performance**: Enforced 10 MB limit via Multer.
- **Error handling**: Specified user‑friendly messages.
- **Script endpoint**: After fetching both URLs, the second endpoint (`AKfycbyoAmAabpO9PUDH-AXatZm5Td7pO9n5W00Eoh6TNIkPtjbQZiYrhAv27XgyMtJdBxchEg`) returns **200 OK** with JSON payload while the first returns a “Script function not found: doGet”. Therefore we will use the **second URL** for all Google Script integrations.

---

## Proposed Changes

### Frontend (React – src/pages/Eligibility.jsx)
- Create new page component with:
  - Password input (type="password").
  - `<DocumentUploader />` component supporting drag‑and‑drop and multiple files.
  - “Calculate Eligibility” button (disabled until password matches). On click, POST files and password to `/api/eligibility/process`.
  - Show progress spinner while server processes.
  - On success, render `<ExcelDownloadButton fileUrl={downloadUrl} />`.
  - Display error alerts using styled toast notifications.

### New Components
- **src/components/DocumentUploader.jsx** – handles file selection, preview thumbnails, size/type validation, and uploads via `axios`.
- **src/components/ExcelDownloadButton.jsx** – simple button that triggers file download from a signed URL.

### Styling (src/pages/Eligibility.css)
- Glass‑morphism card for upload zone, gradient background, micro‑animations on hover, premium color palette (deep teal ↔ indigo). Ensure accessibility (focus outlines, ARIA labels).

### Backend (Node/Express)
- **src/routes/eligibility.js** (new):
  ```js
  const router = require('express').Router();
  const multer = require('multer');
  const path = require('path');
  const { parseDocuments } = require('../utils/documentParser');
  const { generateExcel } = require('../utils/excelGenerator');

  const upload = multer({
    dest: process.env.ELIGIBILITY_UPLOAD_DIR || 'uploads/eligibility/',
    limits: { fileSize: (process.env.MAX_UPLOAD_SIZE_MB || 10) * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) cb(null, true);
      else cb(new Error('UNSUPPORTED_TYPE'));
    }
  });

  router.post('/process', upload.array('files', 10), async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== process.env.ELIGIBILITY_PASSWORD) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      const parsed = await parseDocuments(req.files);
      const excelPath = await generateExcel(parsed);
      res.json({ downloadUrl: `/api/eligibility/download/${path.basename(excelPath)}` });
    } catch (e) {
      if (e.message === 'UNSUPPORTED_TYPE') {
        return res.status(400).json({ message: 'Supported formats are PDF, JPG, PNG (max 10 MB).' });
      }
      console.error(e);
      res.status(500).json({ message: 'We could not extract data from the file. Please ensure the document is clear and try again.' });
    }
  });

  router.get('/download/:filename', (req, res) => {
    const file = path.join(process.env.ELIGIBILITY_UPLOAD_DIR, req.params.filename);
    res.download(file, err => {
      if (err) console.error(err);
    });
  });

  module.exports = router;
  ```
- Register this router in **src/server.js**.
- Add cleanup job (e.g., `node-cron`) that runs daily to delete files older than 30 days.

### Utils
- **src/utils/documentParser.js** – iterates over uploaded files, uses `pdf-parse` for PDFs (attempt text extraction) and falls back to `tesseract.js` for images or PDFs without extractable text. Returns array of objects like `{type, amount, date, bank}`.
- **src/utils/excelGenerator.js** – builds workbook with `exceljs`:
  - Columns: *Document*, *Bank*, *Account No.*, *Salary*, *Net Income*, *Taxable Income*, *Eligibility Score*.
  - For each row, compute `Eligibility Score` using a formula referencing a nationalised bank’s eligibility rule, e.g.:
    ```js
    worksheet.getColumn('Eligibility Score').numFmt = '0.00%';
    worksheet.getCell(`G${rowNumber}`).value = { formula: `IF(E${rowNumber}*0.4>F${rowNumber}, 1, 0)` };
    ```
  - Apply styling: bold header, fill colors, alternating row shading.
  - Save to temporary file path returned to caller.

### Environment Variables (`.env.example` update)
```
ELIGIBILITY_UPLOAD_DIR=uploads/eligibility
ELIGIBILITY_PASSWORD=Samarth@1356
MAX_UPLOAD_SIZE_MB=10
ELIGIBILITY_RETENTION_DAYS=30
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbyoAmAabpO9PUDH-AXatZm5Td7pO9n5W00Eoh6TNIkPtjbQZiYrhAv27XgyMtJdBxchEg/exec
```
Add same lines to actual `.env` (will be created if missing).

### Package Dependencies (add to `package.json`)
- `multer`
- `pdf-parse`
- `tesseract.js`
- `exceljs`
- `node-cron`
- `axios` (already present)

Run:
```bash
npm install multer pdf-parse tesseract.js exceljs node-cron
```

### Tests
- **unit**: `documentParser.test.js` with sample PDF and image fixtures.
- **unit**: `excelGenerator.test.js` validates column headers and formula insertion.
- **integration**: `eligibilityRoute.test.js` using `supertest` to POST multipart request, check 200 and download URL.

### Manual QA Steps
1. Start dev server (`npm run dev`). Navigate to `/eligibility`.
2. Upload a clear salary‑slip PDF and a bank‑statement JPG (<10 MB each).
3. Enter password **Samarth@1356** and click Calculate.
4. Verify a download button appears; click and open Excel – ensure columns and eligibility formula are present.
5. Test error cases: unsupported `.txt` file → receives friendly error; oversized file → receives size error; wrong password → 401 response.
6. Confirm uploaded files are removed after 30 days (simulate by adjusting TTL to 1 minute and observe cleanup).
7. Verify that the backend uses the selected Google Script URL (`AKfycbyo…`) for any downstream calls (currently used as a constant).

---

## Verification Plan
- Automated test suite execution (`npm test`).
- Manual end‑to‑end test as described.
- Log review of cleanup job.
- Code linting (`npm run lint`).

**All decisions have been incorporated. Proceeding with implementation.**
