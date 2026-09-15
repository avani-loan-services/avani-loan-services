// src/models/MediaAsset.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Media Asset Data Model & Status Machine
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');

// In-memory media asset store for tests and serverless fallback
const inMemoryMediaAssets = new Map();
const inMemoryAssetAuditLogs = [];

// 11-State Media Asset Status Machine
const ASSET_STATUSES = Object.freeze({
  CONCEPT: 'CONCEPT',
  READY_FOR_RENDERING: 'READY_FOR_RENDERING',
  GENERATING: 'GENERATING',
  GENERATED: 'GENERATED',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  APPROVED_INTERNAL: 'APPROVED_INTERNAL',
  REJECTED_INTERNAL: 'REJECTED_INTERNAL',
  READY_TO_PUBLISH: 'READY_TO_PUBLISH',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
  ARCHIVED: 'ARCHIVED'
});

// Permitted State Transitions (Directed Acyclic Graph)
const ASSET_TRANSITIONS = {
  [ASSET_STATUSES.CONCEPT]: [
    ASSET_STATUSES.READY_FOR_RENDERING,
    ASSET_STATUSES.ARCHIVED,
    ASSET_STATUSES.FAILED
  ],
  [ASSET_STATUSES.READY_FOR_RENDERING]: [
    ASSET_STATUSES.GENERATING,
    ASSET_STATUSES.CONCEPT,
    ASSET_STATUSES.ARCHIVED,
    ASSET_STATUSES.FAILED
  ],
  [ASSET_STATUSES.GENERATING]: [
    ASSET_STATUSES.GENERATED,
    ASSET_STATUSES.FAILED,
    ASSET_STATUSES.READY_FOR_RENDERING
  ],
  [ASSET_STATUSES.GENERATED]: [
    ASSET_STATUSES.QUALITY_REVIEW,
    ASSET_STATUSES.FAILED
  ],
  [ASSET_STATUSES.QUALITY_REVIEW]: [
    ASSET_STATUSES.APPROVED_INTERNAL,
    ASSET_STATUSES.REJECTED_INTERNAL,
    ASSET_STATUSES.FAILED
  ],
  [ASSET_STATUSES.APPROVED_INTERNAL]: [
    ASSET_STATUSES.READY_TO_PUBLISH,
    ASSET_STATUSES.ARCHIVED
  ],
  [ASSET_STATUSES.REJECTED_INTERNAL]: [
    ASSET_STATUSES.READY_FOR_RENDERING,
    ASSET_STATUSES.ARCHIVED
  ],
  [ASSET_STATUSES.READY_TO_PUBLISH]: [
    ASSET_STATUSES.PUBLISHED,
    ASSET_STATUSES.APPROVED_INTERNAL,
    ASSET_STATUSES.FAILED
  ],
  [ASSET_STATUSES.PUBLISHED]: [
    ASSET_STATUSES.ARCHIVED
  ],
  [ASSET_STATUSES.FAILED]: [
    ASSET_STATUSES.READY_FOR_RENDERING,
    ASSET_STATUSES.ARCHIVED
  ],
  [ASSET_STATUSES.ARCHIVED]: [
    ASSET_STATUSES.CONCEPT
  ]
};

function canTransitionAsset(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ASSET_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
}

function transitionAssetStatus(asset, targetStatus, metadata = {}) {
  const currentStatus = asset.status || ASSET_STATUSES.CONCEPT;
  if (!canTransitionAsset(currentStatus, targetStatus)) {
    throw new Error(
      `Invalid asset transition from "${currentStatus}" to "${targetStatus}". Allowed: ${JSON.stringify(ASSET_TRANSITIONS[currentStatus] || [])}`
    );
  }

  const logEntry = {
    assetId: asset.id || asset.assetId,
    fromStatus: currentStatus,
    toStatus: targetStatus,
    actor: metadata.actor || 'SYSTEM',
    reason: metadata.reason || 'State transition requested',
    timestamp: new Date().toISOString()
  };

  asset.status = targetStatus;
  asset.updatedAt = new Date().toISOString();

  if (targetStatus === ASSET_STATUSES.APPROVED_INTERNAL) {
    asset.approvedBy = metadata.actor || 'Sachin Shinde';
    asset.approvedAt = new Date().toISOString();
  }

  inMemoryAssetAuditLogs.push(logEntry);
  return { success: true, asset, logEntry };
}

const MediaAssetSchema = new mongoose.Schema({
  id: {
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
    enum: ['WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP_STATUS', 'WEBSITE'],
    index: true
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'mr', 'hi'],
    default: 'en',
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['IMAGE', 'VIDEO'],
    index: true
  },
  format: {
    type: String,
    required: true,
    enum: ['1:1', '4:5', '9:16', '1.91:1', '16:9']
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true
  },
  headline: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  cta: {
    type: String,
    default: 'Talk to an Advisor'
  },
  prompt: {
    type: String,
    default: ''
  },
  script: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  storageProvider: {
    type: String,
    enum: ['MOCK', 'OPENAI', 'EXTERNAL', 'MANUAL', 'LOCAL', 'VERCEL_BLOB', 'S3'],
    default: 'MOCK'
  },
  storageKey: {
    type: String,
    default: ''
  },
  publicUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: Object.values(ASSET_STATUSES),
    default: ASSET_STATUSES.CONCEPT,
    index: true
  },
  qualityScore: {
    type: Number,
    default: 90,
    min: 0,
    max: 100
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: String,
    default: null
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  version: {
    type: Number,
    default: 1
  },
  checksum: {
    type: String,
    default: ''
  },
  campaignId: {
    type: String,
    default: null,
    index: true
  },
  templateId: {
    type: String,
    default: null,
    index: true
  }
}, { timestamps: true });

let MongooseMediaAsset;
try {
  MongooseMediaAsset = mongoose.model('MediaAsset', MediaAssetSchema);
} catch (e) {
  MongooseMediaAsset = mongoose.models.MediaAsset;
}

// ── In-Memory & Database Operations ──

function normalizeMediaAsset(assetData) {
  assertBusinessIsolation(assetData);
  const now = new Date().toISOString();
  return {
    id: assetData.id || `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: assetData.product,
    audience: assetData.audience || ['General Borrowers'],
    channel: assetData.channel || 'INSTAGRAM',
    language: assetData.language || 'en',
    type: assetData.type || 'IMAGE',
    format: assetData.format || '1:1',
    width: assetData.width || 1080,
    height: assetData.height || 1080,
    duration: assetData.duration || 0,
    title: assetData.title || 'Untitled Asset',
    headline: assetData.headline || '',
    caption: assetData.caption || '',
    cta: assetData.cta || 'Contact Advisor',
    prompt: assetData.prompt || '',
    script: assetData.script || null,
    storageProvider: assetData.storageProvider || 'MOCK',
    storageKey: assetData.storageKey || '',
    publicUrl: assetData.publicUrl || '',
    thumbnailUrl: assetData.thumbnailUrl || '',
    status: assetData.status || ASSET_STATUSES.CONCEPT,
    qualityScore: typeof assetData.qualityScore === 'number' ? assetData.qualityScore : 90,
    approvedBy: assetData.approvedBy || null,
    approvedAt: assetData.approvedAt || null,
    createdAt: assetData.createdAt || now,
    updatedAt: now,
    version: assetData.version || 1,
    checksum: assetData.checksum || '',
    campaignId: assetData.campaignId || null,
    templateId: assetData.templateId || null
  };
}

async function saveMediaAsset(assetData) {
  const normalized = normalizeMediaAsset(assetData);
  inMemoryMediaAssets.set(normalized.id, normalized);

  if (mongoose.connection.readyState === 1 && MongooseMediaAsset) {
    try {
      await MongooseMediaAsset.findOneAndUpdate(
        { id: normalized.id },
        normalized,
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[MediaAsset] DB write warning, saved to in-memory store:', err.message);
    }
  }

  return normalized;
}

async function getMediaAssetById(assetId) {
  if (inMemoryMediaAssets.has(assetId)) {
    return inMemoryMediaAssets.get(assetId);
  }

  if (mongoose.connection.readyState === 1 && MongooseMediaAsset) {
    try {
      const found = await MongooseMediaAsset.findOne({ id: assetId }).lean();
      if (found) {
        inMemoryMediaAssets.set(found.id, found);
        return found;
      }
    } catch (err) {
      console.warn('[MediaAsset] DB read warning:', err.message);
    }
  }

  return null;
}

async function queryMediaAssets(filter = {}) {
  let assets = Array.from(inMemoryMediaAssets.values());

  if (mongoose.connection.readyState === 1 && MongooseMediaAsset) {
    try {
      const dbQuery = {};
      if (filter.product) dbQuery.product = filter.product;
      if (filter.channel) dbQuery.channel = filter.channel;
      if (filter.language) dbQuery.language = filter.language;
      if (filter.type) dbQuery.type = filter.type;
      if (filter.status) dbQuery.status = filter.status;
      if (filter.campaignId) dbQuery.campaignId = filter.campaignId;

      const dbAssets = await MongooseMediaAsset.find(dbQuery).lean();
      if (dbAssets && dbAssets.length > 0) {
        dbAssets.forEach(a => inMemoryMediaAssets.set(a.id, a));
        assets = dbAssets;
      }
    } catch (err) {
      console.warn('[MediaAsset] DB query warning, returning in-memory:', err.message);
    }
  }

  return assets.filter(a => {
    if (filter.product && a.product !== filter.product) return false;
    if (filter.channel && a.channel !== filter.channel) return false;
    if (filter.language && a.language !== filter.language) return false;
    if (filter.type && a.type !== filter.type) return false;
    if (filter.status && a.status !== filter.status) return false;
    if (filter.campaignId && a.campaignId !== filter.campaignId) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const match = (a.title && a.title.toLowerCase().includes(q)) ||
                    (a.headline && a.headline.toLowerCase().includes(q)) ||
                    (a.prompt && a.prompt.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

function countMediaAssets() {
  return inMemoryMediaAssets.size;
}

function clearMediaAssetsForTesting() {
  inMemoryMediaAssets.clear();
  inMemoryAssetAuditLogs.length = 0;
}

module.exports = {
  ASSET_STATUSES,
  ASSET_TRANSITIONS,
  canTransitionAsset,
  transitionAssetStatus,
  normalizeMediaAsset,
  saveMediaAsset,
  getMediaAssetById,
  queryMediaAssets,
  countMediaAssets,
  clearMediaAssetsForTesting,
  inMemoryMediaAssets,
  inMemoryAssetAuditLogs,
  MediaAssetModel: MongooseMediaAsset
};
