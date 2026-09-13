// src/services/leadPersistenceService.cjs
// ─────────────────────────────────────────────────────────────────
// Serverless Lead Persistence Service & Repository Abstraction
// AVANI LOAN SERVICES — ZERO LOCAL FILESYSTEM / ZERO /TMP DEPENDENCY
// ─────────────────────────────────────────────────────────────────

const crypto = require('crypto');
const { getInMemoryStore, isConnected } = require('../models/database.cjs');

// Lazy-load MongoLead and MongoCounter from Lead.cjs to avoid circular dependencies
let MongoLead = null;
let MongoCounter = null;

function getMongoLead() {
  if (!MongoLead) {
    try {
      const leadModel = require('../models/Lead.cjs');
      MongoLead = leadModel.MongoLead;
    } catch (e) {
      // Non-fatal if Lead.cjs cannot be loaded in standalone tests
    }
  }
  return MongoLead;
}

function getMongoCounter() {
  if (!MongoCounter) {
    try {
      const leadModel = require('../models/Lead.cjs');
      MongoCounter = leadModel.MongoCounter;
    } catch (e) {
      // Non-fatal if Lead.cjs cannot be loaded in standalone tests
    }
  }
  return MongoCounter;
}

/**
 * Normalize phone number to 10 digits
 */
function normalizeMobile(phone) {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Compute SHA-256 Hash of a token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

/**
 * Internal helper to get in-memory storage maps
 */
function getStorage() {
  const store = getInMemoryStore();
  if (!store.leadIndex) {
    store.leadIndex = {
      byId: new Map(),           // leadId -> lead
      byMobile: new Map(),       // 10-digit mobile -> lead
      byIdempotency: new Map(),  // idempotencyKey -> lead
      byTokenHash: new Map()     // tokenHash / secureToken -> lead
    };
    // Re-index any leads already present in store.leads
    if (store.leads) {
      for (const [key, val] of store.leads.entries()) {
        if (val && typeof val === 'object') {
          if (val.leadId) store.leadIndex.byId.set(val.leadId, val);
          const mob = normalizeMobile(val.mobile || key);
          if (mob) store.leadIndex.byMobile.set(mob, val);
          if (val.idempotencyKey) store.leadIndex.byIdempotency.set(val.idempotencyKey, val);
          if (val.portalTokenHash) store.leadIndex.byTokenHash.set(val.portalTokenHash, val);
          if (val.secureToken) store.leadIndex.byTokenHash.set(val.secureToken, val);
        }
      }
    }
  }
  return store.leadIndex;
}

/**
 * Synchronously index a lead in memory
 */
function indexInMemory(lead) {
  if (!lead || !lead.leadId) return;
  const idx = getStorage();
  idx.byId.set(lead.leadId, lead);

  const mob = normalizeMobile(lead.mobile);
  if (mob) {
    idx.byMobile.set(mob, lead);
    // Maintain backward compatibility with store.leads
    const store = getInMemoryStore();
    if (store && store.leads) {
      store.leads.set(mob, lead);
    }
  }

  if (lead.idempotencyKey) {
    idx.byIdempotency.set(lead.idempotencyKey, lead);
  }

  if (lead.portalTokenHash) {
    idx.byTokenHash.set(lead.portalTokenHash, lead);
  }
  if (lead.secureToken) {
    idx.byTokenHash.set(lead.secureToken, lead);
  }
}

/**
 * Asynchronously persist lead to MongoDB if connected
 */
async function syncToDatabase(lead) {
  if (typeof isConnected === 'function' && isConnected()) {
    try {
      const Model = getMongoLead();
      if (Model) {
        await Model.findOneAndUpdate(
          { leadId: lead.leadId },
          { $set: lead },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        lead.persistenceStatus = 'DURABLY_PERSISTED';
        lead.storageLayer = 'MONGODB_ATLAS';
        return { persisted: true, storageLayer: 'MONGODB_ATLAS' };
      }
    } catch (err) {
      console.warn('[LeadPersistenceService] Mongo async sync non-fatal warning:', err.message);
      lead.persistenceStatus = 'ACCEPTED_FOR_PROCESSING';
      lead.storageLayer = 'IN_MEMORY_BUFFER';
      return { persisted: false, storageLayer: 'IN_MEMORY_BUFFER', error: err.message };
    }
  }
  lead.persistenceStatus = 'ACCEPTED_FOR_PROCESSING';
  lead.storageLayer = 'IN_MEMORY_BUFFER';
  return { persisted: false, storageLayer: 'IN_MEMORY_BUFFER' };
}

/**
 * Save a canonical Lead record (Synchronous in-memory commit + async DB sync)
 * Guarantees zero disk writes and zero /tmp usage.
 */
function saveLead(lead) {
  if (!lead || typeof lead !== 'object') {
    throw new Error('Invalid lead: payload must be a non-null object');
  }
  if (!lead.leadId) {
    throw new Error('Invalid lead: missing required field leadId');
  }

  // Explicit persistence status semantics: distinguish accepted from durably persisted
  const dbAlive = typeof isConnected === 'function' && isConnected();
  lead.persistenceStatus = dbAlive ? 'DURABLY_PERSISTED' : 'ACCEPTED_FOR_PROCESSING';
  lead.storageLayer = dbAlive ? 'MONGODB_ATLAS' : 'IN_MEMORY_BUFFER';

  // Commit immediately to in-memory store
  indexInMemory(lead);

  // Trigger non-blocking database persistence if connected
  syncToDatabase(lead).catch(() => {});

  return lead;
}

/**
 * Asynchronously Save a canonical Lead record (Awaits database persistence when connected)
 */
async function saveLeadAsync(lead) {
  if (!lead || typeof lead !== 'object') {
    throw new Error('Invalid lead: payload must be a non-null object');
  }
  if (!lead.leadId) {
    throw new Error('Invalid lead: missing required field leadId');
  }

  indexInMemory(lead);
  await syncToDatabase(lead);
  return lead;
}

/**
 * Find Lead by canonical Lead ID (ALS-2026-XXXXXX)
 */
function findLeadById(leadId) {
  if (!leadId) return null;
  const idx = getStorage();
  return idx.byId.get(String(leadId)) || null;
}

/**
 * Asynchronously Find Lead by canonical Lead ID with MongoDB database fallback
 */
async function findLeadByIdAsync(leadId) {
  if (!leadId) return null;
  const inMem = findLeadById(leadId);
  if (inMem) return inMem;

  if (typeof isConnected === 'function' && isConnected()) {
    try {
      const Model = getMongoLead();
      if (Model) {
        const doc = await Model.findOne({ leadId: String(leadId) }).lean();
        if (doc) {
          indexInMemory(doc);
          return doc;
        }
      }
    } catch (err) {
      console.warn('[LeadPersistenceService] Mongo findLeadByIdAsync error:', err.message);
    }
  }
  return null;
}

/**
 * Find Lead by mobile number (normalized to 10 digits)
 */
function findLeadByMobile(mobile) {
  const norm = normalizeMobile(mobile);
  if (!norm) return null;
  const idx = getStorage();
  return idx.byMobile.get(norm) || null;
}

/**
 * Find Lead by idempotency key
 */
function findLeadByIdempotencyKey(key) {
  if (!key || typeof key !== 'string' || key.trim() === '') return null;
  const idx = getStorage();
  return idx.byIdempotency.get(key.trim()) || null;
}

/**
 * Find Lead by customer portal token
 */
function findLeadByPortalToken(token) {
  if (!token || typeof token !== 'string' || token.trim() === '') return null;
  const cleanToken = token.trim();
  const tokenHash = hashToken(cleanToken);
  const idx = getStorage();

  const lead = idx.byTokenHash.get(tokenHash) || idx.byTokenHash.get(cleanToken) || null;
  if (!lead) return null;

  const now = Date.now();
  if (lead.portalTokenRevoked) return null;
  if (lead.portalTokenExpiresAt && lead.portalTokenExpiresAt < now) return null;

  return lead;
}

/**
 * Update an existing lead record
 */
function updateLead(identifier, updates, actor = 'SYSTEM') {
  if (!identifier) return null;

  // Resolve target lead
  let lead = findLeadById(identifier) || findLeadByMobile(identifier);
  if (!lead) {
    lead = findLeadByPortalToken(identifier);
  }
  if (!lead) return null;

  const timestamp = new Date().toISOString();
  const oldStatus = lead.status;

  // Merge updates
  Object.assign(lead, updates, { updatedAt: timestamp });

  // If status changed and not already appended to timeline, record it
  if (updates.status && updates.status !== oldStatus) {
    lead.timeline = lead.timeline || [];
    lead.timeline.push({
      timestamp,
      fromStatus: oldStatus,
      toStatus: updates.status,
      reason: updates.statusReason || updates.reason || 'Status update',
      actor
    });
  }

  // Re-index in memory
  indexInMemory(lead);

  // Async sync to DB
  syncToDatabase(lead).catch(() => {});

  return lead;
}

/**
 * Get all active leads
 */
function getAllLeads() {
  const idx = getStorage();
  return Array.from(idx.byId.values());
}

/**
 * Asynchronously get all active leads with MongoDB database fallback
 */
async function getAllLeadsAsync() {
  if (typeof isConnected === 'function' && isConnected()) {
    try {
      const Model = getMongoLead();
      if (Model) {
        const docs = await Model.find({}).lean();
        if (Array.isArray(docs) && docs.length > 0) {
          for (const doc of docs) {
            indexInMemory(doc);
          }
          return docs;
        }
      }
    } catch (err) {
      console.warn('[LeadPersistenceService] Mongo getAllLeadsAsync error:', err.message);
    }
  }
  return getAllLeads();
}

/**
 * Count total registered leads
 */
function countLeads() {
  const idx = getStorage();
  return idx.byId.size;
}

/**
 * Reset in-memory indices (used strictly for test isolation)
 */
function resetStorageForTesting() {
  const store = getInMemoryStore();
  store.leadIndex = {
    byId: new Map(),
    byMobile: new Map(),
    byIdempotency: new Map(),
    byTokenHash: new Map()
  };
  if (store.leads) {
    store.leads.clear();
  }
  store._fallbackSeq = 1000;
}

/**
 * Format canonical Lead ID: ALS-2026-XXXXXX
 * Preserves existing numbering convention: sequence 1 -> 1001 -> ALS-2026-001001
 */
function formatCanonicalLeadId(sequence = 1) {
  const num = Number(sequence);
  const normalizedSeq = num >= 1000 ? num : (1000 + num);
  const seqStr = String(normalizedSeq).padStart(6, '0');
  return `ALS-2026-${seqStr}`;
}

/**
 * Atomic Lead ID Generator
 * Primary production mechanism: uses MongoDB findOneAndUpdate with $inc: { seq: 1 }, upsert: true, new: true.
 * When MongoDB is offline, falls back to local in-memory sequence with explicit non-production warning.
 */
async function getNextAtomicLeadId() {
  if (typeof isConnected === 'function' && isConnected()) {
    const Counter = getMongoCounter();
    if (Counter) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'leadId' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      return formatCanonicalLeadId(counter.seq);
    }
  }

  // Fallback when MongoDB is unavailable
  console.warn('[LeadPersistenceService] WARNING: MongoDB is offline or disconnected. Generating fallback in-memory Lead ID. This fallback is NOT production-grade persistence and cannot guarantee globally unique distributed IDs across independent serverless invocations.');
  const store = getInMemoryStore();
  store._fallbackSeq = (store._fallbackSeq || 1000) + 1;
  return formatCanonicalLeadId(store._fallbackSeq);
}

/**
 * Synchronous Lead ID Generator (strictly for local test / synchronous fallback execution)
 */
function generateLeadId() {
  console.warn('[LeadPersistenceService] WARNING: Generating synchronous fallback Lead ID. Production execution with MongoDB must use getNextAtomicLeadId().');
  const store = getInMemoryStore();
  store._fallbackSeq = (store._fallbackSeq || 1000) + 1;
  return formatCanonicalLeadId(store._fallbackSeq);
}

module.exports = {
  saveLead,
  saveLeadAsync,
  findLeadById,
  findLeadByIdAsync,
  findLeadByMobile,
  findLeadByIdempotencyKey,
  findLeadByPortalToken,
  updateLead,
  getAllLeads,
  getAllLeadsAsync,
  countLeads,
  normalizeMobile,
  hashToken,
  resetStorageForTesting,
  formatCanonicalLeadId,
  getNextAtomicLeadId,
  generateLeadId,
  getMongoCounter,
  getMongoLead
};
