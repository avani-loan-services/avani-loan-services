# Supabase Direct-to-Cloud Upload Implementation

This plan outlines the architectural shift to migrate the Avani Loan Services eligibility file upload process from a Vercel-bound `multer` implementation to a seamless, direct-to-cloud **Supabase Storage** solution.

## Background Problem
Currently, the frontend sends a single `multipart/form-data` request containing up to 12 files to the `/api/eligibility/process` endpoint. Because this backend is hosted on Vercel's serverless edge, any request payload over **4.5 MB** is instantly rejected by Vercel with a `413 Payload Too Large` error, crashing the eligibility calculation flow. 

## Proposed Changes

We will bypass Vercel's upload limit by moving the heavy lifting to the frontend.

### 1. Frontend Integration (`src/pages/Eligibility.jsx`)
- **Install Supabase Client:** Add `@supabase/supabase-js` to the project dependencies.
- **Client-Side Uploads:** Instead of appending files to a `FormData` object, the frontend will loop through the user's selected files and upload them individually and directly to the `eligibility-docs` Supabase bucket.
- **JSON Payload Shift:** After all files are uploaded, the frontend will collect their public URLs and send them along with the customer metadata in a lightweight JSON payload to `/api/eligibility/process`.

### 2. Backend Restructuring (`src/routes/eligibility.cjs`)
- **Remove Multer:** The backend will no longer act as a file upload middleman. We will remove the `multer` middleware and replace it with `express.json()` to parse the incoming JSON payload.
- **Virtual File Parsing:** Instead of reading files from the local filesystem (`req.files`), `documentParser.cjs` will be updated to fetch the uploaded Supabase URLs into temporary memory buffers.
- **Maintain Current Workflow:** Once downloaded to memory, the files will pass through the exact same `pdf-parse` and `Tesseract.js` OCR logic to extract salary and banking information for the Excel report generation.

## User Review Required

> [!CAUTION]
> **Performance on Vercel Hobby Tier**
> Even though this architecture completely bypasses the strict 4.5 MB upload limit, the Vercel backend will still need to download those 12 large PDFs into its memory to perform OCR (reading text from the documents). 
> Vercel's free serverless functions have a strict **10-second execution timeout** and a **50 MB RAM limit**. Analyzing 12 heavy PDFs simultaneously might cause the serverless function to time out or crash. 

## Open Questions

1. **OCR Timeout Strategy:** If the OCR processing times out on Vercel while analyzing 12 heavy PDFs, would you prefer the backend to simply skip the OCR extraction for large files (meaning the Excel sheet will just show "0" for the salary field, but the process will succeed), or would you prefer it to fail completely?
2. **Document Links in Google Sheets:** Since your documents are now going to be securely hosted on the cloud, would you like me to add a new column to your Google Sheet to save the Supabase Document URLs for easy access later?

## Verification Plan
- **Automated Verification:** The project will be built with `npm run build` to ensure the new Supabase SDK compiles without issues.
- **Manual Verification:** I will require you to run a test submission with 12 large PDFs to verify that the frontend uploads succeed and the Vercel backend correctly receives the payload without a `413` error.
