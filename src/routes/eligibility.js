// src/routes/eligibility.js
const { appendRowToGoogleSheet } = require('../utils/googleSheets');
const { syncToHubSpot } = require('../utils/hubSpot');
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { parseDocuments } = require('../utils/documentParser');
const { generateExcel } = require('../utils/excelGenerator');

// Multer configuration
const upload = multer({
  dest: process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'),
  limits: { fileSize: (process.env.MAX_UPLOAD_SIZE_MB || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([ '.pdf', '.png', '.jpg', '.jpeg' ].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('UNSUPPORTED_TYPE'));
    }
  }
});

router.post('/process', upload.array('files', 10), async (req, res) => {
  try {
    const { password, metadata } = req.body;

    // ---- Zapier webhook (fire‑and‑forget) ----
    // Send the raw enquiry data to Zapier before any other processing.
    // We deliberately do NOT await this promise so the request continues.
    (async () => {
      try {
        const axios = require('axios');
        await axios.post(process.env.ZAPIER_WEBHOOK_URL, metadata ? JSON.parse(metadata) : {});
      } catch (zapErr) {
        console.error('Zapier webhook error:', zapErr.message);
      }
    })();

    // ---- Placeholder email (no‑op) ----
    // Sends an email copy of the enquiry to enquiry@avanifinserv.com.
    // Using a dummy transporter – replace with real SMTP when ready.
    (async () => {
      try {
        const { sendEnquiryEmail } = require('../utils/emailService');
        await sendEnquiryEmail(metadata ? JSON.parse(metadata) : {});
      } catch (mailErr) {
        console.error('Enquiry email error:', mailErr.message);
      }
    })();
    if (password !== process.env.ELIGIBILITY_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    // Parse metadata JSON (fallback to empty object)
    const meta = metadata ? JSON.parse(metadata) : {};
    // Ensure required fields exist
    const requiredFields = ['timestamp','name','phone','email','loanType','amount','city','source','status','aiCallId'];
    requiredFields.forEach(f => { if (!meta[f]) meta[f] = '' });
    // Parse uploaded documents
    const parsed = await parseDocuments(req.files);
    // Generate Excel report
    const excelPath = await generateExcel(parsed);
    // Copy Excel to date‑wise folder
    const dateFolder = path.join(process.env.EXCEL_OUTPUT_ROOT || path.join(__dirname, '../../eligibility calculation sheet'), new Date().toISOString().slice(0,10));
    const fs = require('fs');
    fs.mkdirSync(dateFolder, { recursive: true });
    const destPath = path.join(dateFolder, path.basename(excelPath));
    fs.copyFileSync(excelPath, destPath);
    // Send data to external services (Google Sheets & HubSpot)
    await Promise.all([
      appendRowToGoogleSheet(meta),
      syncToHubSpot(meta)
    ]);
    const fileName = path.basename(excelPath);
    res.json({ downloadUrl: `/api/eligibility/download/${fileName}` });
  } catch (e) {
    if (e.message === 'UNSUPPORTED_TYPE') {
      return res.status(400).json({ message: 'Supported formats are PDF, JPG, PNG (max 10 MB).' });
    }
    console.error(e);
    res.status(500).json({ message: 'We could not extract data from the file. Please ensure the document is clear and try again.' });
  }
});

router.get('/download/:filename', (req, res) => {
  const file = path.join(process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'), req.params.filename);
  res.download(file, err => {
    if (err) console.error(err);
  });
});

module.exports = router;
