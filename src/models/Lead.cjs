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

function generateDeterministicLeadId(sequence = 1) {
  const seqStr = String(sequence).padStart(6, '0');
  return `ALS-2026-${seqStr}`;
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

    const count = await MongoLead.countDocuments();
    const leadId = generateDeterministicLeadId(count + 1001);

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

    const leadId = generateDeterministicLeadId(store.leads.size + 1001);
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
  findOrCreateLead,
  getLeadByMobile,
  updateLeadState,
  generateDeterministicLeadId
};

