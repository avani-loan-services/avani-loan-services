// src/models/Lead.cjs
// ─────────────────────────────────────────────────────────────────
// Canonical Lead Model & Idempotency Engine for AVANI LOAN SERVICES
// Preferred Lead ID Format: ALS-2026-XXXXXX
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { getInMemoryStore, isConnected } = require('./database.cjs');

const LeadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true, index: true },
  secureToken: { type: String, default: '' },
  fullName: { type: String, default: 'Valued Customer' },
  mobile: { type: String, required: true, index: true },
  whatsapp: { type: String, default: '' },
  email: { type: String, default: '' },
  city: { type: String, default: 'Latur' },
  state: { type: String, default: 'Maharashtra' },
  source: { type: String, default: 'WEBSITE' },
  campaign: { type: String, default: 'ALS_CAMPAIGN_2026' },
  platform: { type: String, default: 'Meta / Web' },

  // Loan Info
  loanType: { type: String, default: 'PERSONAL_LOAN' },
  loanProduct: { type: String, default: 'PERSONAL_LOAN' },
  requestedAmount: { type: String, default: 'Below ₹5 Lakh' },
  loanAmount: { type: String, default: 'Below ₹5 Lakh' },
  applicantType: { type: String, default: 'INDIVIDUAL' },
  employmentType: { type: String, default: 'SALARIED' },
  profession: { type: String, default: 'OTHER_PROFESSIONAL' },
  monthlyIncome: { type: String, default: '₹25,000–₹50,000' },
  businessTurnover: { type: String, default: '' },
  existingEmi: { type: String, default: 'No' },
  cibilStatus: { type: String, default: 'Prefer to discuss' },
  cibilScore: { type: Number, default: 0 },
  propertyInfo: { type: String, default: '' },
  educationInfo: { type: String, default: '' },

  // Pipeline & Status
  status: { type: String, default: 'NEW_LEAD' },
  currentWorkflowState: { type: String, default: 'NEW_LEAD' },
  aiAgentStatus: { type: String, default: 'NEW' },
  assignedAdvisor: { type: String, default: 'Sachin Shinde' },
  priority: { type: String, default: 'HOT' },
  leadScore: { type: Number, default: 50 },
  leadScoreGrade: { type: String, default: 'WARM' },
  qualificationStatus: { type: String, default: 'NOT_EVALUATED' },
  qualificationAnswers: { type: Object, default: {} },
  documentStatus: { type: String, default: 'NOT_REQUESTED' },
  requiredDocuments: { type: Array, default: [] },
  receivedDocuments: { type: Array, default: [] },
  missingDocuments: { type: Array, default: [] },
  followUps: { type: Array, default: [] },
  nextFollowUp: { type: String, default: '' },
  lastContactedAt: { type: String, default: '' },
  timeline: { type: Array, default: [] },
  communicationHistory: { type: Array, default: [] },

  // Audit & Deduplication
  createdBy: { type: String, default: 'SYSTEM' },
  updatedBy: { type: String, default: 'SYSTEM' },
  sourceEventId: { type: String, default: '' },
  idempotencyKey: { type: String, default: '' },
  correlationId: { type: String, default: '' },
  testRunId: { type: String, default: '' },
  duplicateCount: { type: Number, default: 0 },
  duplicateEvents: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

// Dedicated Counter Schema for Atomic Sequence Generation
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}, { collection: 'counters' });

const MongoCounter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

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

function generateDeterministicLeadId(sequence = 1) {
  return formatCanonicalLeadId(sequence);
}

/**
 * Atomic Lead ID Generator
 * Uses MongoDB findOneAndUpdate with $inc: { seq: 1 } when connected.
 * In-memory fallback is strictly non-production and explicitly logged.
 */
async function getNextAtomicLeadId() {
  if (isConnected()) {
    const counter = await MongoCounter.findOneAndUpdate(
      { _id: 'leadId' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    return formatCanonicalLeadId(counter.seq);
  }

  // Fallback when MongoDB is offline / disconnected
  console.warn('[LeadModel] WARNING: MongoDB is unavailable. Utilizing local fallback sequence generation. This fallback is NOT production-grade persistence and cannot guarantee globally unique distributed IDs across independent serverless invocations.');
  const store = getInMemoryStore();
  store._fallbackSeq = (store._fallbackSeq || 1000) + 1;
  return formatCanonicalLeadId(store._fallbackSeq);
}

async function findOrCreateLead(leadData) {
  const mobile = String(leadData.mobile || leadData.phone || '').replace(/[^0-9]/g, '');
  const normalizedMobile = mobile.length > 10 ? mobile.slice(-10) : mobile;
  const source = leadData.source || 'WEBSITE';
  const campaign = leadData.campaign || 'ALS_CAMPAIGN_2026';
  const correlationId = leadData.correlationId || `CORR-${Date.now()}`;
  const testRunId = leadData.testRunId || 'AVANI-E2E-2026';
  const idempotencyKey = leadData.idempotencyKey || leadData.sourceEventId || '';

  if (isConnected()) {
    let existing = null;
    if (idempotencyKey) {
      existing = await MongoLead.findOne({ idempotencyKey });
    }
    if (!existing && normalizedMobile) {
      existing = await MongoLead.findOne({ mobile: normalizedMobile });
    }

    if (existing) {
      existing.duplicateCount += 1;
      existing.duplicateEvents.push({
        timestamp: new Date(),
        source,
        campaign,
        correlationId,
        idempotencyKey
      });
      existing.updatedAt = new Date();
      await existing.save();
      return { isDuplicate: true, lead: existing };
    }

    // Atomic MongoDB-backed sequence generation
    const leadId = await getNextAtomicLeadId();

    const newLead = new MongoLead({
      leadId,
      fullName: leadData.fullName || leadData.name || 'Valued Customer',
      mobile: normalizedMobile,
      whatsapp: leadData.whatsapp || normalizedMobile,
      email: leadData.email || '',
      city: leadData.city || 'Latur',
      state: leadData.state || 'Maharashtra',
      loanType: leadData.loanType || leadData.loanProduct || 'PERSONAL_LOAN',
      loanProduct: leadData.loanProduct || leadData.loanType || 'PERSONAL_LOAN',
      requestedAmount: leadData.requestedAmount || leadData.loanAmount || 'Below ₹5 Lakh',
      loanAmount: leadData.loanAmount || leadData.requestedAmount || 'Below ₹5 Lakh',
      applicantType: leadData.applicantType || 'INDIVIDUAL',
      employmentType: leadData.employmentType || 'SALARIED',
      profession: leadData.profession || 'OTHER_PROFESSIONAL',
      monthlyIncome: leadData.monthlyIncome || '₹25,000–₹50,000',
      businessTurnover: leadData.businessTurnover || '',
      existingEmi: leadData.existingEmi || 'No',
      cibilStatus: leadData.cibilStatus || 'Prefer to discuss',
      cibilScore: leadData.cibilScore || 0,
      propertyInfo: leadData.propertyInfo || '',
      educationInfo: leadData.educationInfo || '',
      source,
      campaign,
      status: 'NEW_LEAD',
      currentWorkflowState: 'NEW_LEAD',
      priority: leadData.priority || 'HOT',
      leadScore: leadData.leadScore || 50,
      leadScoreGrade: leadData.leadScoreGrade || 'WARM',
      assignedAdvisor: 'Sachin Shinde',
      idempotencyKey,
      correlationId,
      testRunId,
      timeline: [{
        timestamp: new Date().toISOString(),
        fromStatus: null,
        toStatus: 'NEW_LEAD',
        reason: 'Initial Lead Creation',
        actor: source
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newLead.save();
    return { isDuplicate: false, lead: newLead };
  } else {
    // In-memory fallback
    const store = getInMemoryStore();
    
    // Check idempotencyKey first, then mobile
    let existing = null;
    if (idempotencyKey) {
      for (const l of store.leads.values()) {
        if (l.idempotencyKey === idempotencyKey) {
          existing = l;
          break;
        }
      }
    }
    if (!existing && normalizedMobile && store.leads.has(normalizedMobile)) {
      existing = store.leads.get(normalizedMobile);
    }

    if (existing) {
      existing.duplicateCount = (existing.duplicateCount || 0) + 1;
      existing.duplicateEvents = existing.duplicateEvents || [];
      existing.duplicateEvents.push({ timestamp: new Date(), source, campaign, correlationId, idempotencyKey });
      existing.updatedAt = new Date();
      return { isDuplicate: true, lead: existing };
    }

    const leadId = await getNextAtomicLeadId();
    const newLead = {
      leadId,
      fullName: leadData.fullName || leadData.name || 'Valued Customer',
      mobile: normalizedMobile,
      whatsapp: leadData.whatsapp || normalizedMobile,
      email: leadData.email || '',
      city: leadData.city || 'Latur',
      state: leadData.state || 'Maharashtra',
      loanType: leadData.loanType || leadData.loanProduct || 'PERSONAL_LOAN',
      loanProduct: leadData.loanProduct || leadData.loanType || 'PERSONAL_LOAN',
      requestedAmount: leadData.requestedAmount || leadData.loanAmount || 'Below ₹5 Lakh',
      loanAmount: leadData.loanAmount || leadData.requestedAmount || 'Below ₹5 Lakh',
      applicantType: leadData.applicantType || 'INDIVIDUAL',
      employmentType: leadData.employmentType || 'SALARIED',
      profession: leadData.profession || 'OTHER_PROFESSIONAL',
      monthlyIncome: leadData.monthlyIncome || '₹25,000–₹50,000',
      businessTurnover: leadData.businessTurnover || '',
      existingEmi: leadData.existingEmi || 'No',
      cibilStatus: leadData.cibilStatus || 'Prefer to discuss',
      cibilScore: leadData.cibilScore || 0,
      propertyInfo: leadData.propertyInfo || '',
      educationInfo: leadData.educationInfo || '',
      source,
      campaign,
      status: 'NEW_LEAD',
      currentWorkflowState: 'NEW_LEAD',
      priority: leadData.priority || 'HOT',
      leadScore: leadData.leadScore || 50,
      leadScoreGrade: leadData.leadScoreGrade || 'WARM',
      assignedAdvisor: 'Sachin Shinde',
      idempotencyKey,
      correlationId,
      testRunId,
      duplicateCount: 0,
      duplicateEvents: [],
      qualificationStatus: 'NOT_EVALUATED',
      qualificationAnswers: {},
      documentStatus: 'NOT_REQUESTED',
      requiredDocuments: [],
      receivedDocuments: [],
      missingDocuments: [],
      followUps: [],
      communicationHistory: [],
      timeline: [{
        timestamp: new Date().toISOString(),
        fromStatus: null,
        toStatus: 'NEW_LEAD',
        reason: 'Initial Lead Creation',
        actor: source
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.leads.set(normalizedMobile, newLead);
    return { isDuplicate: false, lead: newLead };
  }
}

async function getLeadByMobile(mobile) {
  const norm = String(mobile || '').replace(/[^0-9]/g, '').slice(-10);
  if (isConnected()) {
    return await MongoLead.findOne({ mobile: norm });
  } else {
    return getInMemoryStore().leads.get(norm) || null;
  }
}

async function updateLeadState(leadId, updates) {
  if (isConnected()) {
    return await MongoLead.findOneAndUpdate(
      { leadId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  } else {
    const store = getInMemoryStore();
    for (const [key, lead] of store.leads.entries()) {
      if (lead.leadId === leadId) {
        Object.assign(lead, updates, { updatedAt: new Date() });
        return lead;
      }
    }
    return null;
  }
}

module.exports = {
  MongoLead,
  MongoCounter,
  findOrCreateLead,
  getLeadByMobile,
  updateLeadState,
  getNextAtomicLeadId,
  formatCanonicalLeadId,
  generateDeterministicLeadId
};

