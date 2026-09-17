// src/server.cjs – main Express server entry point
require('dotenv').config();
const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const app      = express();

const { validateEnvironmentIsolation } = require('./config/envValidator.cjs');
const { connectDB, getDatabaseHealth } = require('./models/database.cjs');

validateEnvironmentIsolation();
connectDB().catch(err => console.warn('[Database] Initial connection warning:', err.message));

app.use(cors());
app.use(express.json({
  limit: '20mb',
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '20mb',
  verify: (req, res, buf) => {
    if (!req.rawBody) req.rawBody = Buffer.from(buf);
  }
}));
// Graceful JSON parse error handler (returns 400 instead of unhandled crash)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Malformed JSON payload' });
  }
  next(err);
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../dist')));

// Database Health Check Endpoint conforming to Gate B specification
app.get('/api/health', (req, res) => {
  const dbHealth = getDatabaseHealth();
  res.status(200).json({
    status: dbHealth.connected ? 'OK' : 'DEGRADED',
    service: 'AVANI LOAN SERVICES — AVANI AI CRM',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

const { router: whatsappWebhookRouter } = require('./routes/whatsappWebhookController.cjs');
app.use('/api/whatsapp-webhook', whatsappWebhookRouter);

const eligibilityRouter = require('./routes/eligibility.cjs');
app.use('/api/eligibility', eligibilityRouter);

const authRouter = require('./routes/auth.cjs');
app.use('/api/auth', authRouter);

const omnidmRouter = require('./services/omnidmService.cjs');
app.use('/api/omnidm', omnidmRouter);

const crmRouter = require('./routes/crm.cjs');
app.use('/api/crm', crmRouter);

const whatsappRouter = require('./routes/whatsapp.cjs');
app.use('/api/whatsapp', whatsappRouter);

const formTrackingRouter = require('./routes/formTracking.cjs');
app.use('/api/lead', formTrackingRouter);
app.use('/api/marketing', formTrackingRouter);

const documentPortalRoutes = require('./routes/documentPortalRoutes.cjs');
app.use('/api/documents', documentPortalRoutes);

const metaWebhooks = require('./routes/metaWebhooks.cjs');
app.use('/api/meta', metaWebhooks);

// Calculator authentication now exports both its Express router and the
// session verifier used by the protected FOIR assessment endpoint.
const { router: calculatorAuthRouter } = require('./routes/calculatorAuth.cjs');
app.use('/api/calculator-auth', calculatorAuthRouter);

const templatesRouter = require('./routes/templates.cjs');
app.use('/api/templates', templatesRouter);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  require('./cron/retention.cjs');
}

module.exports = app;
