// src/utils/documentParser.js
// ─────────────────────────────────────────────────────────────────
// Parses uploaded PDFs and images using:
//   1. pdf-parse  (for native PDFs with embedded text)
//   2. tesseract.js (OCR fallback for images and scanned PDFs)
// ─────────────────────────────────────────────────────────────────
const fs       = require('fs');

// Vercel serverless polyfills for pdf-parse (pdf.js dependency)
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix { constructor() { this.a=1; this.b=0; this.c=0; this.d=1; this.e=0; this.f=0; } };
}
if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData { constructor() { this.width=0; this.height=0; this.data=[]; } };
}
if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {};
}

const pdfParseReq = require('pdf-parse');
const Tesseract = require('tesseract.js');

const pdfParse = typeof pdfParseReq === 'function' ? pdfParseReq : (pdfParseReq && pdfParseReq.default ? pdfParseReq.default : null);

/**
 * Extract text from a single uploaded file.
 * Returns an object with normalised financial fields.
 */
async function parseFile(file) {
  const ext  = (file.originalname || '').split('.').pop().toLowerCase();
  const data = fs.readFileSync(file.path);
  let text = '';

  // ── Step 1: Try pdf-parse for native PDFs ──────────────────────
  if (ext === 'pdf' && pdfParse) {
    try {
      const pdfData = await pdfParse(data);
      text = (pdfData.text || '').trim();
    } catch (e) {
      console.warn(`[parser] pdf-parse failed for ${file.originalname}: ${e.message}`);
    }
  }

  // ── Step 2: OCR fallback (images ONLY, never raw PDF bytes) ──────
  if (ext !== 'pdf' && (!text || text.length < 10)) {
    try {
      const ocrTask = Tesseract.recognize(data, 'eng', {
        cachePath: process.env.VERCEL ? '/tmp' : undefined,
        logger: () => {}
      });
      const timeoutTask = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OCR_TIMEOUT')), 8000)
      );
      const { data: { text: ocrText } } = await Promise.race([ocrTask, timeoutTask]);
      if (ocrText) text = ocrText.trim();
    } catch (ocrErr) {
      console.warn(`[parser] OCR skipped/failed for ${file.originalname}: ${ocrErr.message}`);
    }
  }

  // ── Step 3: Regex field extraction ────────────────────────────
  const salaryMatch    = text.match(/(?:salary|gross\s*pay|ctc)[:\s₹]*([0-9,]+)/i);
  const bankMatch      = text.match(/(?:bank(?:\s*name)?)[:\s]*([A-Za-z\s]+?)(?:\n|,|$)/i);
  const accountMatch   = text.match(/(?:account\s*(?:no|number)?)[:\s]*([0-9X*\-]+)/i);
  const netIncomeMatch = text.match(/(?:net\s*(?:income|pay|salary))[:\s₹]*([0-9,]+)/i);
  const panMatch       = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
  const aadhaarMatch   = text.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);

  return {
    document : file.originalname,
    bank     : bankMatch    ? bankMatch[1].trim()                            : 'Not Found',
    account  : accountMatch ? accountMatch[1].trim()                        : 'Not Found',
    salary   : salaryMatch  ? parseInt(salaryMatch[1].replace(/,/g, ''), 10) : 0,
    netIncome: netIncomeMatch ? parseInt(netIncomeMatch[1].replace(/,/g, ''), 10) : 0,
    pan      : panMatch    ? panMatch[0]    : 'Not Found',
    aadhaar  : aadhaarMatch? aadhaarMatch[0]: 'Not Found',
    rawText  : text.slice(0, 500)   // first 500 chars for diagnostics
  };
}

/**
 * Parse an array of multer file objects in parallel.
 * Deletes each temp file after parsing.
 */
async function parseDocuments(files) {
  if (!files || files.length === 0) return [];
  const parsePromises = files.map(async (file) => {
    try {
      return await parseFile(file);
    } catch (err) {
      console.error(`[parser] Unexpected error for ${file.originalname}:`, err.message);
      return { document: file.originalname, error: err.message };
    } finally {
      // Always cleanup temp upload
      if (fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (_) {}
      }
    }
  });
  return await Promise.all(parsePromises);
}

module.exports = { parseDocuments };
