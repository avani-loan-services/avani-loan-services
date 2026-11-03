// src/services/marketingPermissionService.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MARKETING PERMISSION & COMPLIANCE CONTROLLER
// Separate eligibility validation for WhatsApp Outreach & Meta Custom Audiences
// Enforces DPDP Act, Meta Commercial Terms & Zero Unsolicited Outreach Invariants
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const db = require('../models/portalDatabase.cjs');

/**
 * Evaluates whether a contact is legally and technically eligible for WhatsApp promotional messaging.
 * Note: Having a public phone number or past commercial enquiry does NOT automatically grant promotional rights.
 * 
 * @param {Object} contact Contact record (Builder or Education contact)
 * @param {Object} [consentRecord] Associated consent record if present
 * @returns {Object} { eligible: boolean, reason: string, legal_basis: string, checks: Object }
 */
function evaluateWhatsAppEligibility(contact, consentRecord = null) {
  const autoState = db.getAutomationState();

  const checks = {
    emergencyStopInactive: !autoState.stop_active,
    whatsappChannelActive: Boolean(autoState.whatsapp_marketing_active),
    providerModeSafe: process.env.PROVIDER_MODE === 'mock' || process.env.PROVIDER_MODE === 'live',
    hasExplicitConsent: false,
    notSuppressed: true,
    channelAuthorized: false,
    timestampValid: false
  };

  // 1. Emergency STOP Switch Check
  if (autoState.stop_active) {
    return {
      eligible: false,
      reason: 'BLOCKED_BY_EMERGENCY_STOP: Central automation controller has halted all outbound marketing.',
      legal_basis: 'NONE_HALTED',
      checks
    };
  }

  // 2. Outbound WhatsApp Channel Active Check
  if (!autoState.whatsapp_marketing_active) {
    return {
      eligible: false,
      reason: 'CHANNEL_PAUSED: WhatsApp marketing channel is deactivated in system automation settings.',
      legal_basis: 'NONE_CHANNEL_OFF',
      checks
    };
  }

  // 3. Provider Mode Safety: Default must be mock unless production live is explicitly verified
  if (process.env.PROVIDER_MODE !== 'live' && process.env.PROVIDER_MODE !== 'mock') {
    return {
      eligible: false,
      reason: 'SAFETY_LOCKOUT: PROVIDER_MODE is unverified. Outbound messaging prohibited.',
      legal_basis: 'NONE_MODE_UNSAFE',
      checks
    };
  }

  // 4. Contact Presence & Suppression Check
  if (!contact || (!contact.mobile && !contact.official_mobile && !contact.telephone && !contact.phone)) {
    return {
      eligible: false,
      reason: 'INVALID_CONTACT: No verified mobile telephone number present.',
      legal_basis: 'NONE_NO_NUMBER',
      checks
    };
  }

  const phone = (contact.mobile || contact.official_mobile || contact.telephone || contact.phone || '').trim();

  // If consent record not supplied, attempt to find in database
  if (!consentRecord) {
    const consentId = contact.consent_id || contact.contact_id;
    consentRecord = db.findOne('education_consent_records', c => 
      c.consent_id === consentId || c.contact_id === contact.contact_id
    );
  }

  // Check Opt-Out & Suppression Lists
  if (consentRecord && (consentRecord.opt_out === true || consentRecord.consent_status === 'Revoked' || consentRecord.consent_status === 'Suppressed')) {
    checks.notSuppressed = false;
    return {
      eligible: false,
      reason: 'SUPPRESSED: Contact has actively opted out or been marked on suppression register.',
      legal_basis: 'SUPPRESSED_REVOKED',
      checks
    };
  }

  // 5. Explicit Legal Basis & Consent Verification
  // Rule: Mere public presence or commercial enquiry does NOT grant blanket promotional authority
  if (!consentRecord || consentRecord.consent_status !== 'Granted') {
    return {
      eligible: false,
      reason: 'CONSENT_REQUIRED: No explicit, verified opt-in consent record on file. Unsolicited outreach prohibited.',
      legal_basis: 'NONE_NO_CONSENT',
      checks
    };
  }

  checks.hasExplicitConsent = true;

  // 6. Communication Channel Verification
  const allowedChannels = Array.isArray(consentRecord.allowed_channels) 
    ? consentRecord.allowed_channels 
    : [consentRecord.channel || 'whatsapp'];

  if (!allowedChannels.includes('whatsapp') && !allowedChannels.includes('ALL')) {
    return {
      eligible: false,
      reason: 'CHANNEL_UNAUTHORIZED: Consent record does not authorize WhatsApp communication.',
      legal_basis: 'CONSENT_CHANNEL_MISMATCH',
      checks
    };
  }

  checks.channelAuthorized = true;

  // 7. Validity Period Check (Consent expires after 180 days unless renewed)
  const consentDate = new Date(consentRecord.consent_timestamp || consentRecord.created_at || 0).getTime();
  const maxAgeMs = 180 * 24 * 60 * 60 * 1000;
  if (Date.now() - consentDate > maxAgeMs) {
    return {
      eligible: false,
      reason: 'CONSENT_EXPIRED: Prior consent exceeds 180-day validity window. Re-verification required.',
      legal_basis: 'CONSENT_STALE',
      checks
    };
  }

  checks.timestampValid = true;

  return {
    eligible: true,
    reason: 'ELIGIBLE: Verified explicit consent on file with active WhatsApp permission.',
    legal_basis: consentRecord.legal_basis || 'EXPLICIT_CONSENT_DPDP_COMPLIANT',
    consent_id: consentRecord.consent_id,
    checks
  };
}

/**
 * Evaluates whether a contact is legally and technically eligible for inclusion in Meta Custom Audience uploads.
 * Enforces Meta's Custom Audience Terms and requirement for explicit digital advertising consent.
 * 
 * @param {Object} contact Contact record
 * @param {Object} [consentRecord] Associated consent record
 * @returns {Object} { eligible: boolean, reason: string, legal_basis: string, audience_tier: string }
 */
function evaluateMetaAudienceEligibility(contact, consentRecord = null) {
  const autoState = db.getAutomationState();

  if (autoState.stop_active) {
    return {
      eligible: false,
      reason: 'BLOCKED_BY_EMERGENCY_STOP: Central automation controller has halted all audience synchronization.',
      legal_basis: 'NONE_HALTED'
    };
  }

  if (!contact) {
    return {
      eligible: false,
      reason: 'INVALID_CONTACT: Missing contact record.',
      legal_basis: 'NONE'
    };
  }

  // Attempt to resolve consent record
  if (!consentRecord) {
    const consentId = contact.consent_id || contact.contact_id;
    consentRecord = db.findOne('education_consent_records', c => 
      c.consent_id === consentId || c.contact_id === contact.contact_id
    );
  }

  // Check Opt-Out & Advertising Opt-Out
  if (consentRecord && (consentRecord.opt_out === true || consentRecord.advertising_opt_out === true || consentRecord.consent_status === 'Suppressed')) {
    return {
      eligible: false,
      reason: 'SUPPRESSED: Contact has opted out of advertising or audience matching.',
      legal_basis: 'SUPPRESSED'
    };
  }

  // Rule: Meta Custom Audience uploads REQUIRE explicit digital advertising consent or established legitimate business alliance
  const hasAdvertisingConsent = consentRecord && (
    consentRecord.purpose === 'meta_ads' ||
    consentRecord.purpose === 'digital_advertising' ||
    consentRecord.advertising_consent === true ||
    (consentRecord.consent_status === 'Granted' && consentRecord.marketing_opt_in === true)
  );

  if (!hasAdvertisingConsent) {
    return {
      eligible: false,
      reason: 'ADVERTISING_CONSENT_REQUIRED: Meta Custom Audiences require explicit opt-in for digital advertising matching. General commercial inquiries do not qualify.',
      legal_basis: 'NONE_NO_AD_CONSENT'
    };
  }

  // Check Minimum Qualification Tier for high relevance
  const score = contact.qualification_score || contact.score || 0;
  const isHighValue = score >= 85 || contact.lead_priority_tier === 'A+' || contact.outreach_readiness === 'APPROVED FOR IMMEDIATE OUTREACH';

  if (!isHighValue) {
    return {
      eligible: false,
      reason: 'AUDIENCE_QUALITY_REJECTION: Contact does not meet minimum qualification threshold (Score >= 85 or Priority A+) for B2B financial audience inclusion.',
      legal_basis: 'INELIGIBLE_SCORE'
    };
  }

  return {
    eligible: true,
    reason: 'ELIGIBLE: Verified explicit advertising consent and qualified B2B score threshold met.',
    legal_basis: 'EXPLICIT_DIGITAL_AD_CONSENT_META_TERMS_COMPLIANT',
    audience_tier: contact.lead_priority_tier === 'A+' ? 'META_AUDIENCE_EDUCATION_APLUS' : 'META_AUDIENCE_BUILDER_QUALIFIED'
  };
}

/**
 * Registers an immediate opt-out or suppression request for a contact across all channels.
 */
function registerOptOutSuppression(identifier, channel = 'ALL', reason = 'User requested opt-out', operatorId = 'SYSTEM') {
  const now = new Date().toISOString();
  
  // Find matching consent record by contact_id, phone, email, or consent_id
  const cleanId = (identifier || '').toString().trim().toLowerCase();
  const existing = db.findOne('education_consent_records', c => 
    (c.official_email && c.official_email.toLowerCase() === cleanId) || 
    (c.contact_mobile && c.contact_mobile === cleanId) || 
    (c.contact_id && c.contact_id.toLowerCase() === cleanId) ||
    (c.consent_id && c.consent_id.toLowerCase() === cleanId)
  );

  if (existing) {
    existing.consent_status = 'Suppressed';
    existing.opt_out = true;
    existing.advertising_opt_out = true;
    existing.suppression_reason = reason;
    existing.suppressed_by = operatorId;
    existing.suppressed_at = now;
    db.upsert('education_consent_records', 'consent_id', existing);
  }

  db.logAudit(operatorId, 'MARKETING_COMPLIANCE', 'REGISTER_SUPPRESSION', { identifier, channel, reason, matched: Boolean(existing) });

  return {
    success: true,
    message: `Contact [${identifier}] has been marked suppressed across channel [${channel}].`,
    data: existing || { identifier, channel, suppressed: true, reason }
  };
}

module.exports = {
  evaluateWhatsAppEligibility,
  evaluateMetaAudienceEligibility,
  registerOptOutSuppression
};
