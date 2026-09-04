// src/models/Lead.cjs
// ─────────────────────────────────────────────────────────────────
// Canonical Lead Model & Idempotency Engine
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const { getInMemoryStore, isConnected } = require('./database.cjs');

const LeadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, default: 'Valued Customer' },
  mobile: { type: String, required: true, index: true },
  email: { type: String, default: '' },
  city: { type: String, default: 'Latur' },
  employmentType: { type: String, default: 'SALARIED' },
  profession: { type: String, default: 'OTHER_PROFESSIONAL' },
  monthlyIncome: { type: String, default: '₹25,000–₹50,000' },
  loanProduct: { type: String, default: 'PERSONAL_LOAN' },
  loanAmount: { type: String, default: 'Below ₹5 Lakh' },
  source: { type: String, default: 'WEBSITE' },
  campaign: { type: String, default: 'ALS_CAMPAIGN_2026' },
  aiAgentStatus: { type: String, default: 'NEW' },
  currentWorkflowState: { type: String, default: 'NEW_LEAD' },
  language: { type: String, default: 'Marathi' },
  correlationId: { type: String, default: '' },
  testRunId: { type: String, default: '' },
  duplicateCount: { type: Number, default: 0 },
  duplicateEvents: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

function generateDeterministicLeadId(dateObj = new Date(), sequence = 1) {
  const yyyymmdd = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = String(sequence).padStart(6, '0');
  return `AVL-${yyyymmdd}-${seqStr}`;
}

async function findOrCreateLead(leadData) {
  const mobile = String(leadData.mobile || leadData.phone || '').replace(/[^0-9]/g, '');
  const normalizedMobile = mobile.length > 10 ? mobile.slice(-10) : mobile;
  const source = leadData.source || 'WEBSITE';
  const campaign = leadData.campaign || 'ALS_CAMPAIGN_2026';
  const correlationId = leadData.correlationId || `CORR-${Date.now()}`;
  const testRunId = leadData.testRunId || 'AVANI-E2E-2026';

  if (isConnected()) {
    let existing = await MongoLead.findOne({ mobile: normalizedMobile });
    if (existing) {
      existing.duplicateCount += 1;
      existing.duplicateEvents.push({
        timestamp: new Date(),
        source,
        campaign,
        correlationId
      });
      existing.updatedAt = new Date();
      await existing.save();
      return { isDuplicate: true, lead: existing };
    }

    const count = await MongoLead.countDocuments();
    const leadId = generateDeterministicLeadId(new Date(), count + 1);

    const newLead = new MongoLead({
      leadId,
      fullName: leadData.fullName || 'Valued Customer',
      mobile: normalizedMobile,
      email: leadData.email || '',
      city: leadData.city || 'Latur',
      employmentType: leadData.employmentType || 'SALARIED',
      profession: leadData.profession || 'OTHER_PROFESSIONAL',
      monthlyIncome: leadData.monthlyIncome || '50000',
      loanProduct: leadData.loanProduct || 'PERSONAL_LOAN',
      loanAmount: leadData.loanAmount || '500000',
      source,
      campaign,
      aiAgentStatus: 'NEW',
      currentWorkflowState: 'NEW_LEAD',
      language: leadData.language || 'Marathi',
      correlationId,
      testRunId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newLead.save();
    return { isDuplicate: false, lead: newLead };
  } else {
    // In-memory fallback
    const store = getInMemoryStore();
    if (store.leads.has(normalizedMobile)) {
      const existing = store.leads.get(normalizedMobile);
      existing.duplicateCount += 1;
      existing.duplicateEvents.push({ timestamp: new Date(), source, campaign, correlationId });
      existing.updatedAt = new Date();
      return { isDuplicate: true, lead: existing };
    }

    const leadId = generateDeterministicLeadId(new Date(), store.leads.size + 1);
    const newLead = {
      leadId,
      fullName: leadData.fullName || 'Valued Customer',
      mobile: normalizedMobile,
      email: leadData.email || '',
      city: leadData.city || 'Latur',
      employmentType: leadData.employmentType || 'SALARIED',
      profession: leadData.profession || 'OTHER_PROFESSIONAL',
      monthlyIncome: leadData.monthlyIncome || '50000',
      loanProduct: leadData.loanProduct || 'PERSONAL_LOAN',
      loanAmount: leadData.loanAmount || '500000',
      source,
      campaign,
      aiAgentStatus: 'NEW',
      currentWorkflowState: 'NEW_LEAD',
      language: leadData.language || 'Marathi',
      correlationId,
      testRunId,
      duplicateCount: 0,
      duplicateEvents: [],
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
