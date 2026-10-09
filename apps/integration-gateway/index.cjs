// apps/integration-gateway/index.cjs
// ─────────────────────────────────────────────────────────────────
// Unified Provider Integration Gateway & DLQ Dispatcher
// AVANI LOAN SERVICES — Autonomous Credit Underwriting Suite
// Version: 1.0.0 (Idempotent, Zero-Secret-Leakage, Resilient DLQ)
// ─────────────────────────────────────────────────────────────────

'use strict';

const EventEmitter = require('events');

class IntegrationGateway extends EventEmitter {
  constructor(options = {}) {
    super();
    this.mode = options.mode || process.env.PROVIDER_MODE || 'mock';
    this.idempotencyStore = new Map();
    this.deadLetterQueue = [];
    this.auditLedger = [];
    this.dlqMaxRetries = 3;
  }

  /**
   * Generate standard application correlation ID.
   */
  generateCorrelationId() {
    return `CORR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Acquire idempotency lease for an incoming operation.
   * Prevents replay and duplicate application creation.
   */
  acquireIdempotencyLease(key, ttlMs = 60000) {
    if (!key) return { acquired: true, duplicate: false };
    const now = Date.now();
    const existing = this.idempotencyStore.get(key);

    if (existing && existing.expiresAt > now) {
      return { acquired: false, duplicate: true, originalRecord: existing.data };
    }

    this.idempotencyStore.set(key, {
      acquiredAt: now,
      expiresAt: now + ttlMs,
      data: null
    });
    return { acquired: true, duplicate: false };
  }

  /**
   * Store completion result for an idempotency key.
   */
  commitIdempotency(key, data) {
    if (this.idempotencyStore.has(key)) {
      const entry = this.idempotencyStore.get(key);
      entry.data = data;
    }
  }

  /**
   * Record entry in immutable provider audit ledger.
   */
  recordLedgerEntry(provider, operation, status, details = {}) {
    const entry = {
      ledgerId: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      provider,
      operation,
      status,
      timestamp: new Date().toISOString(),
      correlationId: details.correlationId || null,
      leadId: details.leadId || null,
      messageId: details.messageId || null,
      error: details.error || null
    };
    this.auditLedger.push(entry);
    return entry;
  }

  /**
   * Route failed operations to Dead Letter Queue (DLQ).
   */
  sendToDLQ(domain, payload, error, correlationId) {
    const dlqItem = {
      dlqId: `DLQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      domain,
      payload,
      error: error ? error.message || String(error) : 'Unknown Error',
      retries: 0,
      status: 'QUEUED',
      correlationId,
      createdAt: new Date().toISOString()
    };
    this.deadLetterQueue.push(dlqItem);
    this.recordLedgerEntry('DLQ', 'ENQUEUE_FAILED_JOB', 'ENQUEUED', {
      correlationId,
      error: dlqItem.error
    });
    return dlqItem;
  }

  /**
   * Replay DLQ item with retry limit.
   */
  async replayDLQ(dlqId, handlerFn) {
    const item = this.deadLetterQueue.find(i => i.dlqId === dlqId);
    if (!item) throw new Error(`DLQ Item not found: ${dlqId}`);

    if (item.retries >= this.dlqMaxRetries) {
      item.status = 'MAX_RETRIES_EXCEEDED';
      return { success: false, reason: 'Max retries reached' };
    }

    item.retries += 1;
    try {
      const res = await handlerFn(item.payload);
      item.status = 'RESOLVED';
      this.recordLedgerEntry('DLQ', 'REPLAY_JOB_SUCCESS', 'RESOLVED', { correlationId: item.correlationId });
      return { success: true, result: res };
    } catch (err) {
      item.status = item.retries >= this.dlqMaxRetries ? 'PERMANENTLY_FAILED' : 'RETRY_PENDING';
      this.recordLedgerEntry('DLQ', 'REPLAY_JOB_FAILED', 'FAILED', { correlationId: item.correlationId, error: err.message });
      return { success: false, error: err.message };
    }
  }

  /**
   * Meta WhatsApp / AiSensy outbound adapter.
   * Enforces Basic Tier Human Fallback constraint.
   */
  async dispatchWhatsAppMessage(params = {}) {
    const { toPhone, templateName, paramsList = [], correlationId, provider = 'META_WHATSAPP' } = params;
    
    // Check if AiSensy is targeted and note plan constraints
    if (provider === 'AISENSY') {
      const mockWamid = `AISENSY-MSG-${Date.now()}`;
      this.recordLedgerEntry('AISENSY', 'DISPATCH_TEMPLATE', 'DISPATCHED', {
        correlationId,
        messageId: mockWamid
      });
      return {
        success: true,
        provider: 'AISENSY',
        messageId: mockWamid,
        tierNotice: 'AiSensy BASIC Tier Inbound restricted: Customer inbound replies routed to human live chat advisors.'
      };
    }

    const mockWamid = `WAMID-MOCK-${Date.now()}`;
    this.recordLedgerEntry('META_WHATSAPP', 'DISPATCH_MESSAGE', 'API_ACCEPTED', {
      correlationId,
      messageId: mockWamid
    });
    return {
      success: true,
      provider: 'META_WHATSAPP',
      messageId: mockWamid
    };
  }

  /**
   * HubSpot CRM idempotent upsert adapter.
   */
  async syncHubSpotLead(leadData = {}, correlationId = null) {
    const idempotencyKey = `HS-${leadData.mobile || leadData.phone || leadData.email}`;
    const lease = this.acquireIdempotencyLease(idempotencyKey);

    if (lease.duplicate) {
      this.recordLedgerEntry('HUBSPOT', 'UPSERT_LEAD', 'SUPPRESSED_DUPLICATE', { correlationId });
      return { success: true, duplicateSuppressed: true, hsObjectId: lease.originalRecord?.hsObjectId };
    }

    const mockHsId = `HS-OBJ-${Date.now()}`;
    this.commitIdempotency(idempotencyKey, { hsObjectId: mockHsId });
    this.recordLedgerEntry('HUBSPOT', 'UPSERT_LEAD', 'HUBSPOT_SYNCED', {
      correlationId,
      messageId: mockHsId
    });

    return {
      success: true,
      duplicateSuppressed: false,
      hsObjectId: mockHsId
    };
  }

  /**
   * Google Sheets Ledger sync adapter.
   */
  async syncGoogleSheets(leadData = {}, correlationId = null) {
    this.recordLedgerEntry('GOOGLE_SHEETS', 'APPEND_ROW', 'SHEETS_SYNCED', { correlationId });
    return { success: true, rowAction: 'APPENDED' };
  }

  /**
   * Zapier Webhook sync adapter.
   */
  async syncZapier(leadData = {}, correlationId = null) {
    this.recordLedgerEntry('ZAPIER', 'TRIGGER_HOOK', 'ZAPIER_SYNCED', { correlationId });
    return { success: true, eventDispatched: true };
  }
}

module.exports = {
  IntegrationGateway
};
