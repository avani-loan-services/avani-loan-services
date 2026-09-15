// src/models/ContentTemplate.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Content Template Data Model & Ledger
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');

// In-memory template store for test runs and serverless fallback
const inMemoryTemplates = new Map();
const inMemoryAuditLogs = [];

const ContentTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  businessId: {
    type: String,
    required: true,
    default: BUSINESS_IDENTITY.businessId,
    index: true
  },
  product: {
    type: String,
    required: true,
    index: true
  },
  audience: {
    type: [String],
    default: []
  },
  channel: {
    type: String,
    required: true,
    enum: ['WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP_STATUS', 'WEBSITE', 'EMAIL'],
    index: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['TEXT', 'WHATSAPP_TEMPLATE', 'IMAGE_PROMPT', 'VIDEO_SCRIPT', 'CAROUSEL'],
    index: true
  },
  campaignType: {
    type: String,
    required: true,
    enum: ['AWARENESS', 'LEAD_GEN', 'FOLLOW_UP', 'CONVERSION', 'RETARGETING', 'CRM_UTILITY', 'BROADCAST'],
    index: true
  },
  language: {
    type: String,
    required: true,
    enum: ['mr', 'en', 'hi'],
    default: 'en',
    index: true
  },
  templateName: {
    type: String,
    required: true
  },
  internalDescription: {
    type: String,
    default: ''
  },
  headline: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    required: true
  },
  footer: {
    type: String,
    default: 'AVANI LOAN SERVICES | Latur'
  },
  cta: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  variables: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  imagePrompt: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  videoPrompt: {
    type: String,
    default: ''
  },
  videoScript: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['DRAFT', 'VALIDATED', 'SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'ARCHIVED'],
    default: 'DRAFT',
    index: true
  },
  aisensyStatus: {
    type: String,
    enum: ['UNPUBLISHED', 'SUBMITTED', 'ACTIVE', 'FAILED', 'NOT_APPLICABLE'],
    default: 'UNPUBLISHED'
  },
  metaStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'NOT_APPLICABLE'],
    default: 'DRAFT',
    index: true
  },
  metaTemplateId: {
    type: String,
    default: ''
  },
  metaCategory: {
    type: String,
    enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION', 'NONE'],
    default: 'MARKETING'
  },
  aisensyCampaignName: {
    type: String,
    default: ''
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  approvalStatus: {
    type: String,
    default: 'PENDING_REVIEW'
  },
  validationReport: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const MongoContentTemplate = mongoose.models.ContentTemplate || mongoose.model('ContentTemplate', ContentTemplateSchema);

// Audit Log Schema
const TemplateAuditSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  who: { type: String, default: 'SYSTEM_ENGINE' },
  what: { type: String, required: true },
  businessId: { type: String, required: true, default: BUSINESS_IDENTITY.businessId },
  product: { type: String, required: true },
  templateId: { type: String, required: true },
  channel: { type: String, required: true },
  externalPlatform: { type: String, default: 'LOCAL' },
  action: { type: String, required: true },
  result: { type: String, required: true },
  error: { type: String, default: '' },
  externalId: { type: String, default: '' },
  idempotencyKey: { type: String, default: '' }
}, {
  timestamps: true
});

const MongoTemplateAudit = mongoose.models.TemplateAudit || mongoose.model('TemplateAudit', TemplateAuditSchema);

/**
 * Record an audit trail entry
 */
async function recordTemplateAudit(entry) {
  assertBusinessIsolation(entry);
  const auditRecord = {
    auditId: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date(),
    who: entry.who || 'SYSTEM_ENGINE',
    what: entry.what || 'TEMPLATE_ACTION',
    businessId: BUSINESS_IDENTITY.businessId,
    product: entry.product || 'GENERAL',
    templateId: entry.templateId || 'N/A',
    channel: entry.channel || 'GENERAL',
    externalPlatform: entry.externalPlatform || 'LOCAL',
    action: entry.action || 'MODIFY',
    result: entry.result || 'SUCCESS',
    error: entry.error || '',
    externalId: entry.externalId || '',
    idempotencyKey: entry.idempotencyKey || ''
  };

  inMemoryAuditLogs.unshift(auditRecord);
  if (inMemoryAuditLogs.length > 500) inMemoryAuditLogs.pop();

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await MongoTemplateAudit.create(auditRecord);
    } catch (err) {
      console.warn('[TemplateAudit] MongoDB audit log write error:', err.message);
    }
  }

  return auditRecord;
}

/**
 * Save or update a content template idempotently
 */
async function saveTemplate(templateData) {
  assertBusinessIsolation(templateData);

  // Ensure default fields
  if (!templateData.businessId) templateData.businessId = BUSINESS_IDENTITY.businessId;
  if (!templateData.templateId) {
    templateData.templateId = `ALS-${templateData.product.toUpperCase()}-${templateData.channel}-${Date.now()}`;
  }
  if (!templateData.idempotencyKey) {
    templateData.idempotencyKey = `${BUSINESS_IDENTITY.businessId}:${templateData.product}:${templateData.channel}:${templateData.templateId}:v${templateData.version || 1}`;
  }

  templateData.updatedAt = new Date();
  if (!templateData.createdAt) templateData.createdAt = new Date();

  // 1. In-Memory Store
  inMemoryTemplates.set(templateData.templateId, { ...templateData });

  // 2. MongoDB Store
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const doc = await MongoContentTemplate.findOneAndUpdate(
        { templateId: templateData.templateId },
        { $set: templateData },
        { upsert: true, new: true }
      );
      return doc.toObject();
    } catch (err) {
      console.warn('[ContentTemplate] MongoDB write fallback to memory:', err.message);
    }
  }

  return templateData;
}

/**
 * Fetch a single template by ID
 */
async function getTemplateById(templateId) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const doc = await MongoContentTemplate.findOne({ templateId }).lean();
      if (doc) return doc;
    } catch (err) {
      console.warn('[ContentTemplate] MongoDB read fallback:', err.message);
    }
  }
  return inMemoryTemplates.get(templateId) || null;
}

/**
 * Query templates with filtering, product, channel, language, status
 */
async function queryTemplates(filter = {}) {
  const { product, channel, contentType, language, status, search, limit = 50, page = 1 } = filter;

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const query = { businessId: BUSINESS_IDENTITY.businessId };
      if (product && product !== 'ALL') query.product = product;
      if (channel && channel !== 'ALL') query.channel = channel;
      if (contentType && contentType !== 'ALL') query.contentType = contentType;
      if (language && language !== 'ALL') query.language = language;
      if (status && status !== 'ALL') query.status = status;
      if (search) {
        query.$or = [
          { templateName: { $regex: search, $options: 'i' } },
          { headline: { $regex: search, $options: 'i' } },
          { body: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await MongoContentTemplate.countDocuments(query);
      const items = await MongoContentTemplate.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

      return { total, items, page: Number(page), limit: Number(limit) };
    } catch (err) {
      console.warn('[ContentTemplate] MongoDB query error, using in-memory store:', err.message);
    }
  }

  // Memory filtering
  let all = Array.from(inMemoryTemplates.values());
  all = all.filter(t => t.businessId === BUSINESS_IDENTITY.businessId);

  if (product && product !== 'ALL') all = all.filter(t => t.product === product);
  if (channel && channel !== 'ALL') all = all.filter(t => t.channel === channel);
  if (contentType && contentType !== 'ALL') all = all.filter(t => t.contentType === contentType);
  if (language && language !== 'ALL') all = all.filter(t => t.language === language);
  if (status && status !== 'ALL') all = all.filter(t => t.status === status);
  if (search) {
    const s = search.toLowerCase();
    all = all.filter(t =>
      (t.templateName && t.templateName.toLowerCase().includes(s)) ||
      (t.headline && t.headline.toLowerCase().includes(s)) ||
      (t.body && t.body.toLowerCase().includes(s))
    );
  }

  const total = all.length;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  return { total, items, page: Number(page), limit: Number(limit) };
}

/**
 * Get all audit logs
 */
function getAuditLogs(limit = 100) {
  return inMemoryAuditLogs.slice(0, limit);
}

module.exports = {
  MongoContentTemplate,
  MongoTemplateAudit,
  saveTemplate,
  getTemplateById,
  queryTemplates,
  recordTemplateAudit,
  getAuditLogs,
  inMemoryTemplates
};
