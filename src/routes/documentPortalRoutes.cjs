// src/routes/documentPortalRoutes.cjs
// ─────────────────────────────────────────────────────────────────
// Express Router for Hardened Customer Document Portal & File Uploads
// AVANI LOAN SERVICES — ZERO TRUST DOCUMENT ARCHITECTURE
// ─────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getLeadByPortalToken,
  revokePortalToken,
  updateLead
} = require('../services/centralLeadEngine.cjs');
const {
  generateChecklistForLead,
  reviewDocument,
  DOCUMENT_STATUSES
} = require('../services/documentWorkflowEngine.cjs');

// Security Whitelists
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png'
]);

const UPLOADS_BASE_DIR = path.resolve(__dirname, '../../uploads/leads');

// Configure Multer Storage for Secure Document Vault
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const lead = req.authenticatedLead;
    const leadId = lead ? lead.leadId : 'QUARANTINE';
    const rawCategory = req.body.category || 'misc';
    const category = String(rawCategory).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

    const targetDir = path.join(UPLOADS_BASE_DIR, leadId, category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const rawBase = path.basename(file.originalname, ext);
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = String(file.mimetype || '').toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type rejected. Only PDF and Image formats (PDF, JPG, PNG) are permitted. Received: ${ext}`));
  }
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    return cb(new Error(`Invalid MIME type: ${mime}. Expected application/pdf or image/jpeg/png.`));
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
    files: 1
  }
});

/**
 * Middleware: Verify customer portal token and attach authenticated lead
 */
function requirePortalAuth(req, res, next) {
  const token = req.params.token || req.headers['x-portal-token'];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Document portal token is required.' });
  }

  const lead = getLeadByPortalToken(token);
  if (!lead) {
    return res.status(403).json({
      success: false,
      error: 'Invalid, expired, or revoked document portal token.'
    });
  }

  req.authenticatedLead = lead;
  next();
}

// ── 1. GET /api/documents/portal/:token (Get Portal Details) ────
router.get('/portal/:token', requirePortalAuth, (req, res) => {
  try {
    const lead = req.authenticatedLead;

    // Generate dynamic required checklist if not already attached
    let checklist = lead.requiredDocuments;
    if (!checklist || checklist.length === 0) {
      checklist = generateChecklistForLead(lead.loanProduct, lead.employmentType, lead.profession);
      updateLead(lead.leadId, { requiredDocuments: checklist });
    }

    // Sanitize received documents (do not expose internal server file paths)
    const sanitizedReceivedDocs = (lead.receivedDocuments || []).map(doc => ({
      docId: doc.docId,
      category: doc.category,
      originalName: doc.originalName,
      sizeBytes: doc.sizeBytes,
      uploadDate: doc.uploadDate,
      status: doc.status || DOCUMENT_STATUSES.UNDER_REVIEW,
      reviewerNotes: doc.reviewerNotes || ''
    }));

    return res.json({
      success: true,
      lead: {
        leadId: lead.leadId,
        fullName: lead.fullName,
        loanProduct: lead.loanProduct,
        requestedAmount: lead.requestedAmount || lead.loanAmount,
        documentStatus: lead.documentStatus || 'NOT_REQUESTED',
        requiredChecklist: checklist,
        receivedDocuments: sanitizedReceivedDocs,
        expiresAt: lead.portalTokenExpiresAt ? new Date(lead.portalTokenExpiresAt).toISOString() : null
      }
    });
  } catch (err) {
    console.error('[DocumentPortalRoutes] Error fetching portal:', err.message);
    return res.status(500).json({ success: false, error: 'Internal error loading portal' });
  }
});

// ── 2. POST /api/documents/portal/:token/upload (Upload File) ───
router.post('/portal/:token/upload', requirePortalAuth, (req, res) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      const isMulterError = err instanceof multer.MulterError;
      return res.status(400).json({
        success: false,
        error: isMulterError ? `Upload rejected: ${err.message}` : err.message
      });
    }

    try {
      const lead = req.authenticatedLead;

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No document file received for upload.' });
      }

      const rawCategory = req.body.category || req.body.docId || 'GENERAL';
      const category = String(rawCategory).replace(/[^a-zA-Z0-9_-]/g, '_');
      const docId = req.body.docId || `${category}_${Date.now()}`;

      const uploadedDocRecord = {
        docId: docId,
        category: category,
        originalName: req.file.originalname,
        filename: req.file.filename,
        filePath: req.file.path,
        sizeBytes: req.file.size,
        uploadDate: new Date().toISOString(),
        status: DOCUMENT_STATUSES.UNDER_REVIEW,
        verificationStatus: 'Pending Verification'
      };

      const existingDocs = lead.receivedDocuments || [];
      const docIndex = existingDocs.findIndex(d => d.docId === docId);
      if (docIndex >= 0) {
        existingDocs[docIndex] = uploadedDocRecord;
      } else {
        existingDocs.push(uploadedDocRecord);
      }

      // Update requiredDocuments entry if it exists
      const requiredDocs = lead.requiredDocuments || [];
      const reqDoc = requiredDocs.find(d => d.docId === docId);
      if (reqDoc) {
        reqDoc.status = DOCUMENT_STATUSES.UPLOADED;
        reqDoc.uploadedAt = new Date().toISOString();
      }

      const updatedLead = updateLead(lead.leadId, {
        receivedDocuments: existingDocs,
        requiredDocuments: requiredDocs,
        documentStatus: 'DOCUMENTS_PENDING'
      }, 'CUSTOMER_PORTAL');

      return res.json({
        success: true,
        message: 'Document uploaded and queued for advisor review.',
        uploadedDoc: {
          docId: uploadedDocRecord.docId,
          category: uploadedDocRecord.category,
          originalName: uploadedDocRecord.originalName,
          sizeBytes: uploadedDocRecord.sizeBytes,
          status: uploadedDocRecord.status
        },
        overallDocumentStatus: updatedLead.documentStatus
      });
    } catch (uploadErr) {
      console.error('[DocumentPortalRoutes] Processing error:', uploadErr.message);
      return res.status(500).json({ success: false, error: uploadErr.message });
    }
  });
});

// ── 3. GET /api/documents/portal/:token/file/:docId (Secure Stream) ───
router.get('/portal/:token/file/:docId', requirePortalAuth, (req, res) => {
  try {
    const lead = req.authenticatedLead;
    const { docId } = req.params;

    const doc = (lead.receivedDocuments || []).find(d => d.docId === docId);
    if (!doc || !doc.filePath) {
      return res.status(404).json({ success: false, error: 'Requested document not found in lead vault.' });
    }

    const safeBasePath = path.join(UPLOADS_BASE_DIR, lead.leadId);
    const resolvedPath = path.resolve(doc.filePath);

    // Guard against directory traversal (IDOR)
    if (!resolvedPath.startsWith(safeBasePath)) {
      return res.status(403).json({ success: false, error: 'Access denied: Directory traversal violation.' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, error: 'Document file missing on disk.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalName || 'document.pdf')}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const ext = path.extname(resolvedPath).toLowerCase();
    if (ext === '.pdf') res.setHeader('Content-Type', 'application/pdf');
    else if (ext === '.png') res.setHeader('Content-Type', 'image/png');
    else res.setHeader('Content-Type', 'image/jpeg');

    const stream = fs.createReadStream(resolvedPath);
    stream.pipe(res);
  } catch (err) {
    console.error('[DocumentPortalRoutes] Stream error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve document stream.' });
  }
});

// ── 4. POST /api/documents/portal/:token/revoke (Token Revocation) ───
router.post('/portal/:token/revoke', requirePortalAuth, (req, res) => {
  try {
    const lead = req.authenticatedLead;
    revokePortalToken(lead.leadId, req.body.reason || 'Revoked via portal endpoint');
    return res.json({
      success: true,
      message: `Document portal access revoked for Lead ID ${lead.leadId}`
    });
  } catch (err) {
    console.error('[DocumentPortalRoutes] Revoke error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
