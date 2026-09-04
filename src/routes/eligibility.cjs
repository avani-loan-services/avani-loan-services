// src/routes/eligibility.cjs
require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const { parseDocuments } = require('../utils/documentParser.cjs');
const { generateExcel } = require('../utils/excelGenerator.cjs');
const { appendRowToGoogleSheet } = require('../utils/googleSheets.cjs');
const { syncToHubSpot } = require('../utils/hubSpot.cjs');
const { processEligibility } = require('../services/eligibilityEngine.cjs');
const { getCache, setCache } = require('../cache.cjs');
const { eligibilityQueue } = require('../queues/eligibilityQueue.cjs');
const { verifySessionToken } = require('./calculatorAuth.cjs');
const rateLimit = require('express-rate-limit');

const calculateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Rate limit exceeded – try again later' },
});
router.use('/calculate', calculateLimiter);

const uploadDir = process.env.VERCEL
  ? '/tmp/uploads/eligibility'
  : (process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'));

try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn('[eligibility] Could not create uploadDir:', e.message);
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: (parseFloat(process.env.MAX_UPLOAD_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) cb(null, true);
    else cb(Object.assign(new Error('UNSUPPORTED_TYPE'), { code: 'UNSUPPORTED_TYPE' }));
  }
});

// Existing AI eligibility endpoint. Kept intact for existing /eligibility consumers.
router.post('/process', upload.array('files', 20), async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== process.env.ELIGIBILITY_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    let meta = {};
    try { meta = JSON.parse(req.body.metadata || '{}'); } catch (_) {}
    const FIELDS = ['timestamp', 'name', 'phone', 'email', 'loanType', 'amount', 'city', 'source', 'status', 'aiCallId'];
    FIELDS.forEach(f => { if (!meta[f]) meta[f] = ''; });
    if (!meta.timestamp) meta.timestamp = new Date().toISOString();
    if (!meta.status) meta.status = process.env.ADMIN_STATUS_DEFAULT || 'Pending';

    (async () => {
      try {
        if (process.env.ZAPIER_WEBHOOK_URL) await axios.post(process.env.ZAPIER_WEBHOOK_URL, meta);
      } catch (e) { console.error('[zapier] error:', e.message); }
    })();

    (async () => {
      try {
        const { sendEnquiryEmail } = require('../utils/emailService.cjs');
        await sendEnquiryEmail(meta);
      } catch (e) { console.error('[email] error:', e.message); }
    })();

    const parsed = await parseDocuments(req.files || []);
    const excelPath = await generateExcel(parsed, meta);
    let destPath = excelPath;
    try {
      const outputRoot = process.env.VERCEL ? '/tmp/eligibility_output' : (process.env.ELIGIBILITY_OUTPUT_ROOT || path.join(__dirname, '../../eligibility calculation sheet'));
      const dateFolder = path.join(outputRoot, new Date().toISOString().slice(0, 10));
      if (!fs.existsSync(dateFolder)) fs.mkdirSync(dateFolder, { recursive: true });
      destPath = path.join(dateFolder, path.basename(excelPath));
      fs.copyFileSync(excelPath, destPath);
    } catch (e) { console.warn('[eligibility] Could not copy Excel:', e.message); }

    await Promise.allSettled([appendRowToGoogleSheet(meta), syncToHubSpot(meta)]);
    const fileName = path.basename(excelPath);
    return res.json({ success: true, downloadUrl: `/api/eligibility/download/${fileName}`, excelFile: fileName, message: 'Eligibility report generated successfully.' });
  } catch (e) {
    if (e.code === 'UNSUPPORTED_TYPE' || e.message === 'UNSUPPORTED_TYPE') return res.status(400).json({ message: 'Supported formats are PDF, JPG, PNG (max 10 MB).' });
    if (e.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Maximum allowed size is 10 MB.' });
    console.error('[eligibility] Internal error:', e);
    return res.status(500).json({ message: 'We could not extract data from the file. Please ensure the document is clear and try again.' });
  }
});

// Existing calculation endpoint. Kept compatible with the current AI Eligibility page.
router.post('/calculate', upload.fields([
  { name: 'itrYear1', maxCount: 1 },
  { name: 'itrYear2', maxCount: 1 },
  { name: 'bankStatements', maxCount: 5 },
  { name: 'otherDocs', maxCount: 5 },
]), async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload || '{}');
    const files = {};
    const allFiles = [];
    for (const [key, arr] of Object.entries(req.files || {})) {
      files[key] = arr.map((f) => f.path);
      arr.forEach(f => allFiles.push(f));
    }
    const result = await processEligibility(payload, files);
    let excelFileName = null;
    let downloadUrl = null;
    try {
      if (allFiles.length > 0) {
        const parsedDocs = await parseDocuments(allFiles);
        const meta = {
          timestamp: result.timestamp || new Date().toISOString(),
          name: payload.applicantName || 'Valued Customer',
          phone: payload.phone || '',
          email: payload.email || '',
          loanType: payload.loanType || 'Personal',
          amount: String(result.maxPrincipal || payload.amount || 0),
          city: payload.city || '',
          source: 'AI_Eligibility_Engine',
          status: 'Analyzed',
          aiCallId: ''
        };
        const excelPath = await generateExcel(parsedDocs, meta);
        const outputRoot = process.env.VERCEL ? '/tmp/eligibility_output' : (process.env.ELIGIBILITY_OUTPUT_ROOT || path.join(__dirname, '../../eligibility calculation sheet'));
        const dateFolder = path.join(outputRoot, new Date().toISOString().slice(0, 10));
        if (!fs.existsSync(dateFolder)) fs.mkdirSync(dateFolder, { recursive: true });
        const destPath = path.join(dateFolder, path.basename(excelPath));
        fs.copyFileSync(excelPath, destPath);
        excelFileName = path.basename(excelPath);
        downloadUrl = `/api/eligibility/download/${excelFileName}`;
        syncToHubSpot(meta).catch(err => console.warn('[hubspot] sync error:', err.message));
      }
    } catch (docErr) { console.warn('[eligibility] Excel/document parsing warning:', docErr.message); }
    return res.json({ success: true, data: { ...result, excelFile: excelFileName, downloadUrl } });
  } catch (e) {
    console.error('[eligibility/calculate error]', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// -----------------------------------------------------------------------------
// NEW: Protected FOIR Assessment endpoint used by /calculators/loan/foir-eligibility
// This is deliberately separate from the legacy AI eligibility endpoint above.
// Uploaded bank/existing-loan statements are read-only inputs, parsed transiently,
// and deleted after processing. No source document is modified.
// -----------------------------------------------------------------------------
const foirAssessmentUpload = multer({
  dest: uploadDir,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) return cb(null, true);
    return cb(Object.assign(new Error('UNSUPPORTED_TYPE'), { code: 'UNSUPPORTED_TYPE' }));
  }
});

const FOIR_PRODUCTS = {
  salary: {
    label: 'Salary Loan',
    checklist: ['PAN / Identity Proof', 'Address Proof', 'Latest Salary Slips', 'Bank Statements', 'Existing Loan Statements']
  },
  business: {
    label: 'Business Loan',
    checklist: ['PAN / Identity Proof', 'Address Proof', 'Business Registration / Proof', 'ITR / Financial Statements', 'Bank Statements', 'Existing Loan Statements', 'GST Documents where applicable']
  },
  education_india: {
    label: 'Education Loan — India',
    checklist: ['Student KYC', 'Admission / Offer Letter', 'Fee Structure', 'Co-applicant KYC', 'Income Proof', 'Bank Statements', 'Existing Loan Statements']
  },
  education_global: {
    label: 'Education Loan — Global Studies',
    checklist: ['Passport', 'Admission / Offer Letter', 'University Fee Structure', 'Academic Documents', 'Co-applicant KYC', 'Income Proof', 'Bank Statements', 'Existing Loan Statements']
  },
  home: {
    label: 'Home Loan',
    checklist: ['PAN / Identity Proof', 'Address Proof', 'Income Proof', 'Bank Statements', 'Existing Loan Statements', 'Property / Agreement Documents']
  },
  mortgage_lap: {
    label: 'Mortgage / LAP',
    checklist: ['PAN / Identity Proof', 'Address Proof', 'Income Proof', 'ITR / Financial Statements', 'Bank Statements', 'Existing Loan Statements', 'Property Ownership / Title Documents']
  },
  ca: {
    label: 'Chartered Accountant Loan',
    checklist: ['PAN / Identity Proof', 'Address Proof', 'CA Membership / Professional Proof', 'ITR / Income Proof', 'Bank Statements', 'Existing Loan Statements', 'Practice / Business Proof']
  },
  doctor_professional: {
    label: 'Doctor / Professional Loan',
    checklist: ['PAN / Identity Proof', 'Address Proof', 'Professional Registration / Certificate', 'Income Proof', 'ITR', 'Bank Statements', 'Existing Loan Statements', 'Practice / Business Proof']
  },
  school_college: {
    label: 'School & College Funding',
    checklist: ['Institution Registration / Proof', 'Promoter / Director KYC', 'Financial Statements', 'Bank Statements', 'Existing Loan Statements', 'Revenue / Fee Information']
  }
};

function safeDocumentSummary(parsedDocs, category) {
  return parsedDocs.map((doc) => ({
    category,
    fileName: doc.document,
    bankName: doc.bank && doc.bank !== 'Not Found' ? doc.bank : null,
    monthlyIncomeDetected: Number(doc.netIncome || doc.salary || 0),
    readOnly: true,
    status: doc.error ? 'Needs Review' : 'Parsed — Verify Before Use',
    sensitiveFieldsMasked: true
  }));
}

router.post('/foir-assessment', foirAssessmentUpload.fields([
  { name: 'incomeProof', maxCount: 5 },
  { name: 'bankStatements', maxCount: 6 },
  { name: 'existingLoanStatements', maxCount: 6 },
  { name: 'otherDocuments', maxCount: 10 }
]), async (req, res) => {
  const filesToCleanup = Object.values(req.files || {}).flat();
  try {
    if (!verifySessionToken(req)) {
      return res.status(401).json({ success: false, error: 'Calculator session expired or unauthorized.' });
    }

    const payload = JSON.parse(req.body.payload || '{}');
    const productKey = String(payload.productKey || 'salary');
    const product = FOIR_PRODUCTS[productKey] || FOIR_PRODUCTS.salary;

    const monthlyIncome = Number(payload.monthlyIncome) || 0;
    const existingEmi = Number(payload.existingEmi) || 0;
    const foirPercent = Number(payload.foirPercent) || 50;
    const rate = Number(payload.rate) || 10;
    const tenureYears = Number(payload.tenureYears) || 15;

    if (monthlyIncome <= 0) return res.status(400).json({ success: false, error: 'Monthly income must be greater than zero.' });
    if (foirPercent <= 0 || foirPercent > 90) return res.status(400).json({ success: false, error: 'FOIR must be between 1% and 90%.' });
    if (rate < 0 || rate > 50) return res.status(400).json({ success: false, error: 'Interest rate must be between 0% and 50%.' });
    if (tenureYears <= 0 || tenureYears > 40) return res.status(400).json({ success: false, error: 'Tenure must be between 1 and 40 years.' });

    const maxPermissibleEmi = (monthlyIncome * foirPercent) / 100;
    const availableEmi = Math.max(0, maxPermissibleEmi - existingEmi);
    const months = Math.round(tenureYears * 12);
    const monthlyRate = rate / 1200;
    let eligibleLoanAmount = 0;
    if (availableEmi > 0) {
      eligibleLoanAmount = monthlyRate === 0
        ? availableEmi * months
        : availableEmi * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
    }
    const estimatedEmi = availableEmi;
    const totalRepayment = estimatedEmi * months;
    const estimatedInterest = Math.max(0, totalRepayment - eligibleLoanAmount);

    const documentSummary = [];
    for (const [field, category] of [
      ['incomeProof', 'Income Proof'],
      ['bankStatements', 'Bank Statement — Read Only'],
      ['existingLoanStatements', 'Existing Loan Statement — Read Only'],
      ['otherDocuments', 'Other Product Documents']
    ]) {
      const incoming = req.files?.[field] || [];
      if (!incoming.length) continue;
      const parsed = await parseDocuments(incoming);
      documentSummary.push(...safeDocumentSummary(parsed, category));
    }

    const requiredChecklist = product.checklist.map((item) => {
      const lower = item.toLowerCase();
      let uploaded = false;
      if (lower.includes('bank statement')) uploaded = (req.files?.bankStatements || []).length > 0;
      else if (lower.includes('existing loan')) uploaded = (req.files?.existingLoanStatements || []).length > 0;
      else if (lower.includes('income') || lower.includes('salary') || lower.includes('itr') || lower.includes('financial')) uploaded = (req.files?.incomeProof || []).length > 0;
      else uploaded = (req.files?.otherDocuments || []).length > 0;
      return { name: item, uploaded };
    });

    const applicationId = `ALS-FOIR-${Date.now()}`;
    const result = {
      applicationId,
      productKey,
      product: product.label,
      applicantName: payload.applicantName || '',
      city: payload.city || '',
      monthlyIncome,
      existingEmi,
      foirPercent,
      maxPermissibleEmi,
      availableEmi,
      rate,
      tenureYears,
      eligibleLoanAmount: Math.round(eligibleLoanAmount),
      estimatedEmi: Math.round(estimatedEmi),
      estimatedInterest: Math.round(estimatedInterest),
      totalRepayment: Math.round(totalRepayment),
      documents: documentSummary,
      requiredChecklist,
      assessment: availableEmi > 0 ? 'Indicative eligibility available' : 'No additional EMI capacity under the supplied FOIR',
      disclaimer: 'This is an indicative assessment, not a loan sanction or guarantee. Final eligibility, rate, amount and approval depend on lender policy, credit assessment, document verification and applicable requirements.',
      calculatedAt: new Date().toISOString()
    };

    // Send only non-sensitive lead metadata to existing CRM/Sheets integrations.
    Promise.allSettled([
      appendRowToGoogleSheet({
        timestamp: result.calculatedAt,
        name: result.applicantName,
        phone: payload.phone || '',
        email: payload.email || '',
        loanType: product.label,
        amount: String(result.eligibleLoanAmount),
        city: result.city,
        source: 'Calculator_FOIR_Assessment',
        status: 'Indicative Eligibility Calculated',
        aiCallId: ''
      }),
      syncToHubSpot({
        name: result.applicantName,
        phone: payload.phone || '',
        email: payload.email || '',
        loanType: product.label,
        amount: String(result.eligibleLoanAmount),
        city: result.city,
        source: 'Calculator_FOIR_Assessment',
        status: 'Indicative Eligibility Calculated'
      })
    ]).catch(() => {});

    return res.json({ success: true, data: result });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, error: 'A document exceeds the 15 MB per-file limit.' });
    if (error.code === 'UNSUPPORTED_TYPE' || error.message === 'UNSUPPORTED_TYPE') return res.status(400).json({ success: false, error: 'Only PDF, JPG, JPEG and PNG documents are supported.' });
    console.error('[foir-assessment] error:', error.message);
    return res.status(500).json({ success: false, error: 'Assessment could not be completed. Please verify the inputs and upload clear documents.' });
  } finally {
    for (const file of filesToCleanup) {
      try { if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (_) {}
    }
  }
});

router.get('/download/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename);
  const baseDir = process.env.VERCEL ? '/tmp/uploads/eligibility' : (process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'));
  const filePath = path.join(baseDir, safeName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found.' });
  res.download(filePath, safeName, err => { if (err) console.error('[download] error:', err.message); });
});

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    password: process.env.ELIGIBILITY_PASSWORD ? 'set' : 'not set',
    zapier: process.env.ZAPIER_WEBHOOK_URL ? 'set' : 'not set',
    hubspot: process.env.HUBSPOT_REFRESH_TOKEN ? 'set' : 'not set',
    sheets: process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? 'set' : 'placeholder'
  });
});

module.exports = router;
