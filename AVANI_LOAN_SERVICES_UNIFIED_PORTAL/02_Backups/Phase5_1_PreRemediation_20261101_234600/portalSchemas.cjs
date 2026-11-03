// src/models/portalSchemas.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MONGOOSE SCHEMAS & PRODUCTION DATA MODELS
// Absolute Namespace Separation & Indexed Collections
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const Schemas = {
  PortalAdminUser: new mongoose.Schema({
    user_id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    full_name: { type: String, default: '' },
    password_hash: { type: String, required: true },
    role: { type: String, required: true, index: true },
    must_change_password: { type: Boolean, default: true },
    failed_login_attempts: { type: Number, default: 0 },
    lockout_until: { type: Date, default: null },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date, default: null }
  }, { collection: 'portal_admin_users', strict: false }),

  PortalBuilderCompany: new mongoose.Schema({
    builder_id: { type: String, required: true, unique: true, index: true },
    company_name: { type: String, required: true, index: true },
    brand_name: { type: String, default: '' },
    legal_entity_name: { type: String, default: '' },
    corporate_website: { type: String, default: '' },
    city: { type: String, required: true, index: true },
    state: { type: String, default: 'Maharashtra' },
    qualification_score: { type: Number, default: 0, index: true },
    outreach_readiness: { type: String, required: true, index: true },
    verification_status: { type: String, default: 'Verified', index: true }
  }, { collection: 'portal_builder_companies', strict: false }),

  PortalBuilderContact: new mongoose.Schema({
    contact_id: { type: String, required: true, unique: true, index: true },
    builder_id: { type: String, required: true, index: true }
  }, { collection: 'portal_builder_contacts', strict: false }),

  PortalBuilderMahaRera: new mongoose.Schema({
    rera_id: { type: String, required: true, unique: true, index: true },
    builder_id: { type: String, required: true, index: true },
    registration_number: { type: String, required: true, index: true },
    match_classification: { type: String, required: true, index: true }
  }, { collection: 'portal_builder_maharera', strict: false }),

  PortalBuilderPipeline: new mongoose.Schema({
    deal_id: { type: String, required: true, unique: true, index: true },
    builder_id: { type: String, required: true, index: true },
    stage: { type: String, required: true, index: true }
  }, { collection: 'portal_builder_pipeline', strict: false }),

  PortalEducationInstitution: new mongoose.Schema({
    institution_id: { type: String, required: true, unique: true, index: true },
    institution_name: { type: String, required: true, index: true },
    parent_trust_society: { type: String, default: '' },
    state: { type: String, required: true, index: true },
    city: { type: String, default: '' },
    lead_priority_tier: { type: String, required: true, index: true },
    qualification_score: { type: Number, default: 0, index: true },
    verification_status: { type: String, default: 'Verified', index: true }
  }, { collection: 'portal_education_institutions', strict: false }),

  PortalEducationContact: new mongoose.Schema({
    contact_id: { type: String, required: true, unique: true, index: true },
    institution_id: { type: String, required: true, index: true }
  }, { collection: 'portal_education_contacts', strict: false }),

  PortalEducationPipeline: new mongoose.Schema({
    deal_id: { type: String, required: true, unique: true, index: true },
    institution_id: { type: String, required: true, index: true },
    stage: { type: String, required: true, index: true }
  }, { collection: 'portal_education_pipeline', strict: false }),

  PortalEducationConsentRecord: new mongoose.Schema({
    consent_id: { type: String, required: true, unique: true, index: true },
    institution_id: { type: String, required: true, index: true },
    consent_status: { type: String, required: true, index: true }
  }, { collection: 'portal_education_consent_records', strict: false }),

  PortalUnifiedTask: new mongoose.Schema({
    task_id: { type: String, required: true, unique: true, index: true },
    module: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true }
  }, { collection: 'portal_unified_tasks', strict: false }),

  PortalPublicEnquiry: new mongoose.Schema({
    enquiry_id: { type: String, required: true, unique: true, index: true },
    module: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true }
  }, { collection: 'portal_public_enquiries', strict: false }),

  PortalAutomationState: new mongoose.Schema({
    state_id: { type: String, required: true, unique: true, index: true },
    stop_active: { type: Boolean, default: false }
  }, { collection: 'portal_system_automation_state', strict: false }),

  PortalAdminAuditLog: new mongoose.Schema({
    log_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, default: 'SYSTEM', index: true },
    module: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true }
  }, { collection: 'portal_admin_audit_logs', strict: false })
};

function getPortalModels() {
  const models = {};
  for (const [name, schema] of Object.entries(Schemas)) {
    models[name] = mongoose.models[name] || mongoose.model(name, schema);
  }
  return models;
}

module.exports = {
  Schemas,
  getPortalModels
};
