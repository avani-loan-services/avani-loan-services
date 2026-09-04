// Main Backend Server for Avani Loan Services
// File: backend/server.js

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Import routes
const authRouter = require('./routes/auth');
const leadsRouter = require('./routes/leads');
app.use('/api/auth', authRouter);

// Mount routes
app.use('/api', leadsRouter);
app.use('/api/leads', leadsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Avani Loan Services - VAPI Integration Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Avani Loan Services - AI Calling Backend API',
    version: '1.0',
    endpoints: {
      health: 'GET /health',
      saveLead: 'POST /api/save-lead',
      sendWhatsApp: 'POST /api/send-whatsapp',
      sendSMS: 'POST /api/send-sms',
      scheduleAppointment: 'POST /api/schedule-appointment',
      getAllLeads: 'GET /api/all-leads',
      getLeadById: 'GET /api/lead/:id',
      bulkImport: 'POST /api/bulk-import',
      sendBulkWhatsApp: 'POST /api/send-bulk-whatsapp',
      analytics: 'GET /api/analytics',
      vapiWebhook: 'POST /api/webhooks/vapi-callback'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Avani Loan Services - VAPI AI Backend Server             ║
║  Status: Running ✅                                        ║
║  Port: ${PORT}                                                ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
