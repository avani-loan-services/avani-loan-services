// src/models/ProviderLedger.cjs
// ─────────────────────────────────────────────────────────────────
// Provider Ledger — Forensic Source of Truth for Outbound Attempts
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { getInMemoryStore, isConnected } = require('./database.cjs');

const ProviderLedgerSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['META_WHATSAPP', 'AISENSY', 'OMNIDM', 'HUBSPOT', 'GOOGLE_SHEETS', 'ZAPIER'],
    required: true
  },
  operation: { type: String, required: true },
  leadId: { type: String, required: true, index: true },
  correlationId: { type: String, required: true },
  testRunId: { type: String, required: true },
  providerRequestId: { type: String, default: '' },
  providerMessageId: { type: String, default: '' },
  providerCallId: { type: String, default: '' },
  status: {
    type: String,
    enum: [
      'API_ACCEPTED',
      'SENT',
      'DELIVERED',
      'READ',
      'REPLIED',
      'DISPATCHED',
      'RINGING',
      'ANSWERED',
      'NO_ANSWER',
      'BUSY',
      'FAILED',
      'UNKNOWN',
      'HUBSPOT_REQUESTED',
      'HUBSPOT_ACCEPTED',
      'HUBSPOT_SYNCED',
      'HUBSPOT_FAILED',
      'SHEETS_SYNCED',
      'ZAPIER_SYNCED'
    ],
    required: true
  },
  requestPayload: { type: Object, default: {} },
  responsePayload: { type: Object, default: {} },
  requestTimestamp: { type: Date, default: Date.now },
  responseTimestamp: { type: Date, default: Date.now },
  errorCode: { type: String, default: '' },
  errorMessage: { type: String, default: '' }
});

const MongoProviderLedger = mongoose.models.ProviderLedger || mongoose.model('ProviderLedger', ProviderLedgerSchema);

async function recordProviderAttempt(entryData) {
  const entry = {
    provider: entryData.provider,
    operation: entryData.operation,
    leadId: entryData.leadId || 'N/A',
    correlationId: entryData.correlationId || `CORR-${Date.now()}`,
    testRunId: entryData.testRunId || 'AVANI-E2E-2026',
    providerRequestId: entryData.providerRequestId || '',
    providerMessageId: entryData.providerMessageId || '',
    providerCallId: entryData.providerCallId || '',
    status: entryData.status || 'UNKNOWN',
    requestPayload: entryData.requestPayload || {},
    responsePayload: entryData.responsePayload || {},
    requestTimestamp: entryData.requestTimestamp || new Date(),
    responseTimestamp: entryData.responseTimestamp || new Date(),
    errorCode: entryData.errorCode || '',
    errorMessage: entryData.errorMessage || ''
  };

  if (isConnected()) {
    const doc = new MongoProviderLedger(entry);
    await doc.save();
    return doc;
  } else {
    const store = getInMemoryStore();
    store.providerLedger.push(entry);
    return entry;
  }
}

async function getLedgerByLeadId(leadId) {
  if (isConnected()) {
    return await MongoProviderLedger.find({ leadId }).sort({ requestTimestamp: -1 });
  } else {
    return getInMemoryStore().providerLedger.filter(item => item.leadId === leadId);
  }
}

module.exports = {
  MongoProviderLedger,
  recordProviderAttempt,
  getLedgerByLeadId
};
