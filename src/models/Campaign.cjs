// src/models/Campaign.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Campaign Data Model & Ledger
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');

// In-memory campaign store for tests and serverless fallback
const inMemoryCampaigns = new Map();

const CAMPAIGN_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  READY_TO_PUBLISH: 'READY_TO_PUBLISH',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
});

// Load persistent seed campaigns if registry exists
try {
  const registryPath = path.join(__dirname, '../data/campaignRegistry.json');
  if (fs.existsSync(registryPath)) {
    const raw = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    if (Array.isArray(raw)) {
      raw.forEach(c => inMemoryCampaigns.set(c.campaignId, c));
    }
  }
} catch (e) {
  // Silent fallback
}

const CampaignSchema = new mongoose.Schema({
  campaignId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
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
    default: ['Salaried Professionals', 'Business Owners']
  },
  language: {
    type: String,
    enum: ['en', 'mr', 'hi'],
    default: 'en'
  },
  channels: {
    type: [String],
    default: ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN']
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(CAMPAIGN_STATUSES),
    default: CAMPAIGN_STATUSES.DRAFT,
    index: true
  },
  cta: {
    type: String,
    default: 'Check Eligibility & Apply'
  },
  budget: {
    type: Number,
    default: 0
  },
  linkedTemplates: {
    type: [String],
    default: []
  },
  linkedMediaAssets: {
    type: [String],
    default: []
  },
  calendarEntries: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  }
}, { timestamps: true });

let MongooseCampaign;
try {
  MongooseCampaign = mongoose.model('Campaign', CampaignSchema);
} catch (e) {
  MongooseCampaign = mongoose.models.Campaign;
}

function normalizeCampaign(data) {
  assertBusinessIsolation(data);
  const now = new Date().toISOString();
  return {
    campaignId: data.campaignId || `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name || 'Untitled Campaign',
    businessId: BUSINESS_IDENTITY.businessId,
    product: data.product,
    audience: Array.isArray(data.audience) ? data.audience : ['General Borrowers'],
    language: data.language || 'en',
    channels: Array.isArray(data.channels) ? data.channels : ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN'],
    startDate: data.startDate || now.split('T')[0],
    endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: data.status || CAMPAIGN_STATUSES.DRAFT,
    cta: data.cta || 'Check Eligibility & Apply',
    budget: typeof data.budget === 'number' ? data.budget : 0,
    linkedTemplates: Array.isArray(data.linkedTemplates) ? data.linkedTemplates : [],
    linkedMediaAssets: Array.isArray(data.linkedMediaAssets) ? data.linkedMediaAssets : [],
    calendarEntries: Array.isArray(data.calendarEntries) ? data.calendarEntries : [],
    createdAt: data.createdAt || now,
    updatedAt: now
  };
}

async function saveCampaign(data) {
  const normalized = normalizeCampaign(data);
  inMemoryCampaigns.set(normalized.campaignId, normalized);

  if (mongoose.connection.readyState === 1 && MongooseCampaign) {
    try {
      await MongooseCampaign.findOneAndUpdate(
        { campaignId: normalized.campaignId },
        normalized,
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[Campaign] DB write warning, saved to in-memory store:', err.message);
    }
  }

  return normalized;
}

async function getCampaignById(campaignId) {
  if (inMemoryCampaigns.has(campaignId)) {
    return inMemoryCampaigns.get(campaignId);
  }

  if (mongoose.connection.readyState === 1 && MongooseCampaign) {
    try {
      const found = await MongooseCampaign.findOne({ campaignId }).lean();
      if (found) {
        inMemoryCampaigns.set(found.campaignId, found);
        return found;
      }
    } catch (err) {
      console.warn('[Campaign] DB read warning:', err.message);
    }
  }

  return null;
}

async function queryCampaigns(filter = {}) {
  let campaigns = Array.from(inMemoryCampaigns.values());

  if (mongoose.connection.readyState === 1 && MongooseCampaign) {
    try {
      const dbQuery = {};
      if (filter.product) dbQuery.product = filter.product;
      if (filter.status) dbQuery.status = filter.status;
      const dbCampaigns = await MongooseCampaign.find(dbQuery).lean();
      if (dbCampaigns && dbCampaigns.length > 0) {
        dbCampaigns.forEach(c => inMemoryCampaigns.set(c.campaignId, c));
        campaigns = dbCampaigns;
      }
    } catch (err) {
      console.warn('[Campaign] DB query warning:', err.message);
    }
  }

  return campaigns.filter(c => {
    if (filter.product && c.product !== filter.product) return false;
    if (filter.status && c.status !== filter.status) return false;
    if (filter.language && c.language !== filter.language) return false;
    return true;
  });
}

function clearCampaignsForTesting() {
  inMemoryCampaigns.clear();
}

module.exports = {
  CAMPAIGN_STATUSES,
  saveCampaign,
  getCampaignById,
  queryCampaigns,
  clearCampaignsForTesting,
  inMemoryCampaigns,
  CampaignModel: MongooseCampaign
};
