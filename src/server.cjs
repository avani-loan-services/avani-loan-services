// src/server.cjs – main Express server entry point
require('dotenv').config();
const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const helmet   = require('helmet');
const app      = express();
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const { validateEnvironmentIsolation } = require('./config/envValidator.cjs');
const { connectDB } = require('./models/database.cjs');

validateEnvironmentIsolation();
connectDB().catch(err => console.warn('[Database] Initial connection warning:', err.message));

const allowedOrigins = [
  'https://www.avanifinserv.com',
  'https://avanifinserv.com',
  'https://api.avanifinserv.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^https:\/\/avani-loan-service.*\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie']
}));
app.use(express.json({
  limit: '20mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '20mb',
  verify: (req, res, buf) => {
    if (!req.rawBody) req.rawBody = buf;
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

// ── AVANI UNIFIED BUSINESS GROWTH & LEAD MANAGEMENT PORTAL ──
const portalAuthRouter = require('./routes/portalAuthRoutes.cjs');
app.use('/api/portal/auth', portalAuthRouter);

const builderPortalRouter = require('./routes/builderPortalRoutes.cjs');
app.use('/api/portal/builder', builderPortalRouter);

const educationPortalRouter = require('./routes/educationPortalRoutes.cjs');
app.use('/api/portal/education', educationPortalRouter);

const unifiedPortalRouter = require('./routes/unifiedPortalRoutes.cjs');
app.use('/api/portal/dashboard', unifiedPortalRouter);

const portalTemplatesRouter = require('./routes/portalTemplatesRoutes.cjs');
app.use('/api/portal/templates', portalTemplatesRouter);

const portalCampaignsRouter = require('./routes/portalCampaignsRoutes.cjs');
app.use('/api/portal/campaigns', portalCampaignsRouter);

const portalLeadsRouter = require('./routes/portalLeadsRoutes.cjs');
app.use('/api/portal/leads', portalLeadsRouter);

const publicEnquiryRouter = require('./routes/publicEnquiryRoutes.cjs');
app.use('/api/portal/public', publicEnquiryRouter);

// Health check endpoints for container and API gateways
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'avani-loan-services-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/portal/health', async (req, res) => {
  const portalDb = require('./models/portalDatabase.cjs');
  const mongoose = require('mongoose');
  let isAtlas = false;
  let dbStatus = 'disconnected';

  if (portalDb.isMongoConnected && mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      dbStatus = 'connected';
      isAtlas = true;
    } catch (err) {
      dbStatus = 'ping_failed';
      isAtlas = false;
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = (isProduction && !isAtlas) ? 503 : 200;

  return res.status(statusCode).json({
    status: isAtlas ? 'ok' : 'degraded',
    service: 'avani-loan-services-portal',
    storage_engine: isAtlas ? 'mongodb_atlas' : 'in_memory_safeguard',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Global Express error handler for status propagation (e.g. 503 storage unavailable)
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  if (res.headersSent) return next(err);
  const safeError = (status >= 500 && process.env.NODE_ENV === 'production') ? 'Internal Server Error' : (err.message || 'Internal Server Error');
  return res.status(status).json({
    success: false,
    error: safeError
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '127.0.0.1';
  app.listen(PORT, HOST, () => console.log(`✅ Server running on http://${HOST}:${PORT}`));
  require('./cron/retention.cjs');
}

module.exports = app;
