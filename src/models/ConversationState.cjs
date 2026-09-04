// src/models/ConversationState.cjs
// ─────────────────────────────────────────────────────────────────
// MongoDB Conversation State Machine (Survives Cold Starts & Worker Restarts)
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { getInMemoryStore, isConnected } = require('./database.cjs');

const ALLOWED_STATES = [
  'NEW_LEAD',
  'QUALIFICATION',
  'COLLECT_FULL_NAME',
  'COLLECT_MOBILE',
  'COLLECT_EMAIL',
  'COLLECT_CITY',
  'COLLECT_EMPLOYMENT_TYPE',
  'COLLECT_PROFESSION',
  'COLLECT_MONTHLY_INCOME',
  'COLLECT_LOAN_PRODUCT',
  'COLLECT_LOAN_AMOUNT',
  'DOCUMENT_GUIDANCE',
  'DOCUMENTS_PENDING',
  'VOICE_FOLLOWUP',
  'COMPLETED',
  'FAILED'
];

const ConversationStateSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  leadId: { type: String, required: true, index: true },
  currentState: { type: String, enum: ALLOWED_STATES, default: 'NEW_LEAD' },
  collectedData: {
    fullName: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    city: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    profession: { type: String, default: '' },
    monthlyIncome: { type: String, default: '' },
    loanProduct: { type: String, default: '' },
    loanAmount: { type: String, default: '' }
  },
  language: { type: String, default: 'Marathi' },
  correlationId: { type: String, default: '' },
  testRunId: { type: String, default: '' },
  history: [{
    speaker: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  lastActive: { type: Date, default: Date.now }
});

const MongoConversation = mongoose.models.ConversationState || mongoose.model('ConversationState', ConversationStateSchema);

async function getOrCreateConversation(phone, leadId, correlationId = '', testRunId = '') {
  const normPhone = String(phone || '').replace(/[^0-9]/g, '').slice(-10);

  if (isConnected()) {
    let conv = await MongoConversation.findOne({ phone: normPhone });
    if (!conv) {
      conv = new MongoConversation({
        phone: normPhone,
        leadId,
        currentState: 'NEW_LEAD',
        collectedData: { mobile: normPhone },
        language: 'Marathi',
        correlationId,
        testRunId,
        history: [],
        lastActive: new Date()
      });
      await conv.save();
    }
    return conv;
  } else {
    // In-memory fallback
    const store = getInMemoryStore();
    if (!store.conversations.has(normPhone)) {
      const conv = {
        phone: normPhone,
        leadId,
        currentState: 'NEW_LEAD',
        collectedData: { mobile: normPhone },
        language: 'Marathi',
        correlationId,
        testRunId,
        history: [],
        lastActive: new Date()
      };
      store.conversations.set(normPhone, conv);
    }
    return store.conversations.get(normPhone);
  }
}

async function transitionConversationState(phone, nextState, patchData = {}, newHistoryItem = null) {
  if (!ALLOWED_STATES.includes(nextState)) {
    throw new Error(`Invalid state transition: ${nextState}`);
  }

  const normPhone = String(phone || '').replace(/[^0-9]/g, '').slice(-10);

  if (isConnected()) {
    const conv = await MongoConversation.findOne({ phone: normPhone });
    if (!conv) throw new Error(`Conversation not found for phone ${normPhone}`);

    conv.currentState = nextState;
    conv.collectedData = { ...conv.collectedData, ...patchData };
    if (patchData.language) conv.language = patchData.language;
    if (newHistoryItem) conv.history.push(newHistoryItem);
    conv.lastActive = new Date();

    await conv.save();
    return conv;
  } else {
    const store = getInMemoryStore();
    const conv = store.conversations.get(normPhone);
    if (!conv) throw new Error(`Conversation not found for phone ${normPhone}`);

    conv.currentState = nextState;
    conv.collectedData = { ...conv.collectedData, ...patchData };
    if (patchData.language) conv.language = patchData.language;
    if (newHistoryItem) conv.history.push(newHistoryItem);
    conv.lastActive = new Date();

    return conv;
  }
}

module.exports = {
  MongoConversation,
  ALLOWED_STATES,
  getOrCreateConversation,
  transitionConversationState
};
