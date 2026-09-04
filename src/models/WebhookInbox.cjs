// src/models/WebhookInbox.cjs
// ─────────────────────────────────────────────────────────────────
// Webhook Inbox, Atomic Leasing & Webhook Deduplication Engine
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { getInMemoryStore, isConnected } = require('./database.cjs');

const WebhookInboxSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  source: { type: String, required: true },
  payload: { type: Object, required: true },
  status: {
    type: String,
    enum: ['RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'RECEIVED'
  },
  leaseExpiresAt: { type: Date, default: null },
  processingStartedAt: { type: Date, default: null },
  attemptCount: { type: Number, default: 0 },
  lastError: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoWebhookInbox = mongoose.models.WebhookInbox || mongoose.model('WebhookInbox', WebhookInboxSchema);

/**
 * Record webhook event atomically with duplicate prevention
 */
async function registerWebhookEvent(eventId, source, payload) {
  if (isConnected()) {
    try {
      const existing = await MongoWebhookInbox.findOne({ eventId });
      if (existing) {
        return { isDuplicate: true, event: existing };
      }

      const newEvent = new MongoWebhookInbox({
        eventId,
        source,
        payload,
        status: 'RECEIVED',
        attemptCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newEvent.save();
      return { isDuplicate: false, event: newEvent };
    } catch (err) {
      if (err.code === 11000) {
        // Unique constraint collision
        const existing = await MongoWebhookInbox.findOne({ eventId });
        return { isDuplicate: true, event: existing };
      }
      throw err;
    }
  } else {
    // In-memory fallback
    const store = getInMemoryStore();
    if (store.webhookInbox.has(eventId)) {
      return { isDuplicate: true, event: store.webhookInbox.get(eventId) };
    }

    const newEvent = {
      eventId,
      source,
      payload,
      status: 'RECEIVED',
      leaseExpiresAt: null,
      processingStartedAt: null,
      attemptCount: 0,
      lastError: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.webhookInbox.set(eventId, newEvent);
    return { isDuplicate: false, event: newEvent };
  }
}

/**
 * Atomic worker lease acquisition (5-minute lease)
 */
async function acquireLease(eventId, leaseDurationMs = 5 * 60 * 1000) {
  const now = new Date();
  const leaseExpiry = new Date(now.getTime() + leaseDurationMs);

  if (isConnected()) {
    const event = await MongoWebhookInbox.findOneAndUpdate(
      {
        eventId,
        $or: [
          { status: 'RECEIVED' },
          { status: 'FAILED' },
          { leaseExpiresAt: { $lt: now } } // Stale lease recovery
        ]
      },
      {
        status: 'PROCESSING',
        processingStartedAt: now,
        leaseExpiresAt: leaseExpiry,
        $inc: { attemptCount: 1 },
        updatedAt: now
      },
      { new: true }
    );

    return !!event;
  } else {
    const store = getInMemoryStore();
    const event = store.webhookInbox.get(eventId);
    if (!event) return false;

    const isLeaseStale = event.leaseExpiresAt && new Date(event.leaseExpiresAt) < now;
    if (event.status === 'RECEIVED' || event.status === 'FAILED' || isLeaseStale) {
      event.status = 'PROCESSING';
      event.processingStartedAt = now;
      event.leaseExpiresAt = leaseExpiry;
      event.attemptCount += 1;
      event.updatedAt = now;
      return true;
    }

    return false;
  }
}

/**
 * Mark event completed or failed
 */
async function releaseLease(eventId, success, errorMsg = '') {
  const now = new Date();
  const nextStatus = success ? 'COMPLETED' : 'FAILED';

  if (isConnected()) {
    await MongoWebhookInbox.findOneAndUpdate(
      { eventId },
      {
        status: nextStatus,
        leaseExpiresAt: null,
        lastError: errorMsg,
        updatedAt: now
      }
    );
  } else {
    const store = getInMemoryStore();
    const event = store.webhookInbox.get(eventId);
    if (event) {
      event.status = nextStatus;
      event.leaseExpiresAt = null;
      event.lastError = errorMsg;
      event.updatedAt = now;
    }
  }
}

module.exports = {
  MongoWebhookInbox,
  registerWebhookEvent,
  acquireLease,
  releaseLease
};
