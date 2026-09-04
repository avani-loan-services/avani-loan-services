// src/routes/documentPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────
// Express Router for Customer Document Portal & File Uploads
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getLead, updateLeadStatus } = require('../services/centralLeadEngine.cjs');
const { getRequiredDocuments, evaluateDocumentCompleteness } = require('../services/documentChecklistEngine.cjs');
const { notifyDocumentsComplete, notifyDocumentsPending } = require('../services/notificationService.cjs');

// Configure Multer Storage for Secure Document Vault
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const leadId = req.body.leadId || 'GENERAL';
    const category = req.body.category || 'misc';
    const dir = path.join(__dirname, '../../uploads/leads', leadId, category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max file size
});

// ── 1. GET /api/documents/portal/:token (Get Portal Details) ────
router.get('/portal/:token', (req, res) => {
  try {
    const { token } = req.params;
    const lead = getLead(token);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead document portal token not found.' });
    }

    const requiredChecklist = getRequiredDocuments(lead.loanProduct);
    const evalResult = evaluateDocumentCompleteness(lead.loanProduct, lead.receivedDocuments || []);

    return res.json({
      success: true,
      lead: {
        leadId: lead.leadId,
        fullName: lead.fullName,
        loanProduct: lead.loanProduct,
        loanAmount: lead.loanAmount,
        status: lead.status,
        receivedDocuments: lead.receivedDocuments || [],
        requiredChecklist: requiredChecklist,
        evalResult: evalResult
      }
    });
  } catch (err) {
    console.error('[DocumentPortalRoutes] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. POST /api/documents/portal/:token/upload (Upload File) ───
router.post('/portal/:token/upload', upload.single('document'), async (req, res) => {
  try {
    const { token } = req.params;
    const lead = getLead(token);

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Invalid document portal token.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file received for upload.' });
    }

    const category = req.body.category || 'General';

    const uploadedDocRecord = {
      docId: `${category}_${Date.now()}`,
      category: category,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      sizeBytes: req.file.size,
      uploadDate: new Date().toISOString(),
      verificationStatus: 'Human Verification Required'
    };

    const existingDocs = lead.receivedDocuments || [];
    existingDocs.push(uploadedDocRecord);
    lead.receivedDocuments = existingDocs;

    // Evaluate completeness checkpoint
    const evalResult = evaluateDocumentCompleteness(lead.loanProduct, existingDocs);

    if (evalResult.isComplete) {
      updateLeadStatus(lead.leadId, 'DOCUMENTS_COMPLETE', 'All mandatory documents uploaded successfully');
      notifyDocumentsComplete(lead).catch(e => console.warn('[DocumentPortal] Escalation err:', e.message));
    } else {
      updateLeadStatus(lead.leadId, 'DOCUMENTS_PARTIAL', `Uploaded ${category}`);
      notifyDocumentsPending(lead, evalResult.missingMandatory).catch(e => console.warn('[DocumentPortal] Reminder err:', e.message));
    }

    return res.json({
      success: true,
      message: 'Document uploaded successfully',
      uploadedDoc: uploadedDocRecord,
      evalResult: evalResult
    });
  } catch (err) {
    console.error('[DocumentPortalRoutes] Upload error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
