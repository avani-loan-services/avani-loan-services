// src/services/metaWhatsAppTemplateService.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — META WHATSAPP TEMPLATE INTEGRATION & SYNC ENGINE
// Phase 5.3.23: Authoritative Meta WABA Graph API & BSP Verification Service
// NEVER prints, logs, or exposes API tokens, secrets, or raw credentials.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const db = require('../models/portalDatabase.cjs');

// Safely load environment configuration
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

/**
 * Canonical Meta System User Token Resolver
 * Canonical variable: META_SYSTEM_USER_TOKEN
 * Legacy aliases (META_ACCESS_TOKEN, WHATSAPP_TOKEN):
 *  - Never silently override META_SYSTEM_USER_TOKEN.
 *  - Conflicting non-empty values across aliases fail closed with META_TOKEN_ALIAS_CONFLICT.
 *  - Whitespace-only or malformed tokens fail closed.
 *  - Legacy-only tokens are rejected unless allowLegacyCompat is explicitly enabled (test-only bridge).
 */
function resolveCanonicalMetaToken(env = process.env, { allowLegacyCompat = false } = {}) {
  const keys = ['META_SYSTEM_USER_TOKEN', 'META_ACCESS_TOKEN', 'WHATSAPP_TOKEN'];
  const nonEmpty = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key) && env[key] !== undefined && env[key] !== null) {
      const raw = String(env[key]);
      const trimmed = raw.trim();
      if (raw.length > 0 && trimmed.length === 0) {
        return {
          valid: false,
          token: null,
          status: 'INVALID',
          code: 'META_PRODUCTION_CONFIG_INVALID',
          source: key,
          message: `${key} cannot be whitespace-only.`
        };
      }
      if (trimmed.length > 0) {
        nonEmpty.push({ key, value: trimmed });
      }
    }
  }

  if (nonEmpty.length === 0) {
    return {
      valid: false,
      token: null,
      status: 'MISSING',
      code: 'MISSING_META_ACCESS_TOKEN',
      source: null,
      message: 'Meta System User Access Token (META_SYSTEM_USER_TOKEN) is not configured.'
    };
  }

  const distinctValues = new Set(nonEmpty.map(item => item.value));
  if (distinctValues.size > 1) {
    return {
      valid: false,
      token: null,
      status: 'INVALID',
      code: 'META_TOKEN_ALIAS_CONFLICT',
      source: nonEmpty.map(item => item.key).join(','),
      message: `Conflicting Meta token values detected across environment aliases (${nonEmpty.map(i => i.key).join(', ')}).`
    };
  }

  const canonicalEntry = nonEmpty.find(item => item.key === 'META_SYSTEM_USER_TOKEN');
  if (!canonicalEntry && !allowLegacyCompat) {
    return {
      valid: false,
      token: null,
      status: 'MISSING',
      code: 'MISSING_META_ACCESS_TOKEN',
      source: nonEmpty[0].key,
      message: `Canonical META_SYSTEM_USER_TOKEN is required; legacy alias (${nonEmpty[0].key}) is not accepted in strict mode.`
    };
  }

  const resolved = (canonicalEntry || nonEmpty[0]).value;
  const resolvedSource = (canonicalEntry || nonEmpty[0]).key;
  if (resolved.length < 20 || /\s/.test(resolved)) {
    return {
      valid: false,
      token: null,
      status: 'INVALID',
      code: 'META_PRODUCTION_CONFIG_INVALID',
      source: resolvedSource,
      message: `${resolvedSource} format is invalid (must be >=20 chars with no whitespace).`
    };
  }

  return {
    valid: true,
    token: resolved,
    status: 'PRESENT',
    code: null,
    source: resolvedSource,
    message: null
  };
}

// Meta WhatsApp Platform Credentials (from environment only)
const CONFIG = {
  metaBusinessId: process.env.META_BUSINESS_ID || '130700309306240',
  metaAppId: process.env.META_APP_ID || '2049842548930849',
  wabaId: process.env.META_WABA_ID || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1062614709598311',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1147494668457940',
  displayPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '+917249108474',
  graphApiVersion: process.env.GRAPH_API_VERSION || 'v20.0',
  metaAccessToken: resolveCanonicalMetaToken(process.env, { allowLegacyCompat: process.env.NODE_ENV === 'test' }).token,
  aisensyApiKey: process.env.AISENCY_WABA_API_KEY || null,
  providerMode: process.env.PROVIDER_MODE || 'mock'
};

/**
 * 1. Check Meta WhatsApp Platform Connection Status
 * Reports genuine connection state without fabricating approvals or token presence.
 */
async function getMetaConnectionStatus() {
  const hasMetaToken = Boolean(CONFIG.metaAccessToken && CONFIG.metaAccessToken.length > 20);
  const hasAiSensyKey = Boolean(CONFIG.aisensyApiKey && CONFIG.aisensyApiKey.length > 20);

  // Summary counts from local database
  const templates = db.getAll('portal_templates');
  const whatsAppTemplates = templates.filter(t => t.channel === 'WhatsApp');
  const metaApprovedCount = whatsAppTemplates.filter(t => t.meta_approval_status === 'APPROVED' && t.synced_from_meta === true).length;
  const pendingCount = whatsAppTemplates.filter(t => t.meta_approval_status === 'PENDING' || t.meta_approval_status === 'IN_REVIEW').length;
  const rejectedCount = whatsAppTemplates.filter(t => t.meta_approval_status === 'REJECTED').length;
  const pausedDisabledCount = whatsAppTemplates.filter(t => t.meta_approval_status === 'PAUSED' || t.meta_approval_status === 'DISABLED').length;
  const localDraftsCount = whatsAppTemplates.filter(t => ['LOCAL_DRAFT', 'UNVERIFIED_LOCAL_TEMPLATE', 'NOT_VERIFIED', 'UNKNOWN'].includes(t.meta_approval_status) || !t.synced_from_meta).length;

  let connectionState = {
    status: 'CONFIGURATION_PENDING',
    connected: false,
    live_sync_supported: false,
    provider_mode: CONFIG.providerMode,
    live_sending_enabled: false,
    waba_id: CONFIG.wabaId,
    phone_number_id: CONFIG.phoneNumberId,
    display_phone: CONFIG.displayPhoneNumber,
    business_name: 'Avani Loan Services',
    meta_business_id: CONFIG.metaBusinessId,
    meta_app_id: CONFIG.metaAppId,
    graph_api_version: CONFIG.graphApiVersion,
    token_status: hasMetaToken ? 'PRESENT' : 'MISSING_SYSTEM_USER_TOKEN',
    bsp_partner: hasAiSensyKey ? 'AiSensy (Meta Tech Partner)' : 'DIRECT_META',
    notice: 'Direct Meta Graph API synchronization requires a System User Access Token with whatsapp_business_management permission. Inbound and outbound live dispatches remain disabled (PROVIDER_MODE=mock).',
    last_sync_timestamp: new Date().toISOString(),
    templates_summary: {
      total_portal_templates: templates.length,
      total_whatsapp_templates: whatsAppTemplates.length,
      meta_approved: metaApprovedCount,
      pending_review: pendingCount,
      rejected: rejectedCount,
      paused_or_disabled: pausedDisabledCount,
      local_drafts_or_unverified: localDraftsCount
    }
  };

  // If token is configured, probe Graph API
  if (hasMetaToken) {
    try {
      const probeUrl = `https://graph.facebook.com/${CONFIG.graphApiVersion}/${CONFIG.wabaId}?fields=id,name,timezone_id,message_template_namespace`;
      const res = await axios.get(probeUrl, {
        headers: { Authorization: `Bearer ${CONFIG.metaAccessToken}` },
        timeout: 8000
      });
      if (res.data && res.data.id) {
        connectionState.status = 'CONNECTED';
        connectionState.connected = true;
        connectionState.live_sync_supported = true;
        connectionState.waba_name = res.data.name || 'Avani Loan Services';
        connectionState.namespace = res.data.message_template_namespace || null;
      }
    } catch (probeErr) {
      connectionState.status = 'AUTH_ERROR';
      connectionState.connected = false;
      connectionState.error_details = probeErr.response?.data?.error?.message || probeErr.message;
    }
  }

  return connectionState;
}

/**
 * 2. Fetch Verified Templates from Meta WhatsApp Graph API
 * If token is not present, honestly reports BLOCKED instead of faking data.
 */
async function fetchTemplatesFromMeta() {
  if (!CONFIG.metaAccessToken || CONFIG.metaAccessToken.length < 20) {
    return {
      success: false,
      blocked: true,
      code: 'MISSING_META_ACCESS_TOKEN',
      message: 'Meta System User Access Token (whatsapp_business_management) is not configured in production environment variables. Live Meta template query cannot be authenticated.',
      waba_id: CONFIG.wabaId,
      phone_number_id: CONFIG.phoneNumberId,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const url = `https://graph.facebook.com/${CONFIG.graphApiVersion}/${CONFIG.wabaId}/message_templates?fields=id,name,status,category,language,components,quality_score,rejected_reason&limit=100`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${CONFIG.metaAccessToken}` },
      timeout: 10000
    });

    const rawTemplates = res.data?.data || [];
    const parsedTemplates = rawTemplates.map(t => parseMetaTemplate(t));

    return {
      success: true,
      count: parsedTemplates.length,
      templates: parsedTemplates,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('[MetaTemplateService] Meta Graph API Error:', err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
      code: 'META_GRAPH_API_ERROR',
      status: err.response?.status || 500
    };
  }
}

/**
 * Helper to parse Meta WhatsApp Template Components
 */
function parseMetaTemplate(raw) {
  let headerText = '';
  let bodyText = '';
  let footerText = '';
  let buttons = [];
  let variables = [];
  let sampleValues = {};

  if (Array.isArray(raw.components)) {
    for (const c of raw.components) {
      if (c.type === 'HEADER') {
        headerText = c.text || (c.format ? `[${c.format} HEADER]` : '');
      } else if (c.type === 'BODY') {
        bodyText = c.text || '';
        // Extract variables like {{1}}, {{2}}
        const matches = bodyText.match(/\{\{([0-9]+)\}\}/g);
        if (matches) {
          variables = [...new Set(matches.map(m => m.replace(/[\{\}]/g, '')))];
        }
        if (c.example && Array.isArray(c.example.body_text) && c.example.body_text[0]) {
          c.example.body_text[0].forEach((val, idx) => {
            sampleValues[String(idx + 1)] = val;
          });
        }
      } else if (c.type === 'FOOTER') {
        footerText = c.text || '';
      } else if (c.type === 'BUTTONS' && Array.isArray(c.buttons)) {
        buttons = c.buttons.map(b => b.text || b.type);
      }
    }
  }

  // Canonical status mapping per Meta documentation
  // Meta returns: APPROVED | PENDING | REJECTED | PAUSED | DISABLED
  const validStatusMap = {
    APPROVED: 'APPROVED',
    PENDING: 'PENDING',
    IN_REVIEW: 'PENDING',
    REJECTED: 'REJECTED',
    PAUSED: 'PAUSED',
    DISABLED: 'DISABLED'
  };

  const canonicalStatus = validStatusMap[String(raw.status).toUpperCase()] || 'UNKNOWN';

  return {
    template_id: `TPL-META-${raw.id || raw.name}`,
    meta_id: raw.id,
    name: raw.name,
    display_name: raw.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    channel: 'WhatsApp',
    category: raw.category || 'UTILITY',
    language: raw.language || 'en',
    meta_approval_status: canonicalStatus,
    header: headerText,
    body: bodyText,
    footer: footerText,
    buttons,
    variables,
    sample_values: sampleValues,
    quality_score: raw.quality_score?.score || 'UNKNOWN',
    rejected_reason: raw.rejected_reason || null,
    synced_from_meta: true,
    last_synced_at: new Date().toISOString()
  };
}

/**
 * 3. Synchronize Templates into Portal Database
 * Accurately reports whether live sync occurred or configuration warning occurred.
 */
async function syncTemplatesWithDatabase() {
  const metaResult = await fetchTemplatesFromMeta();

  if (!metaResult.success) {
    // Record audit notice
    return {
      synced: false,
      count: 0,
      reason: metaResult.code,
      message: metaResult.message || metaResult.error,
      recommendation: 'Configure META_ACCESS_TOKEN (Permanent System User Token) in environment variables to enable real-time template synchronization from Meta WABA.'
    };
  }

  let upsertedCount = 0;
  for (const tpl of metaResult.templates) {
    db.upsert('portal_templates', 'template_id', tpl);
    upsertedCount++;
  }

  db.persist('portal_templates');

  return {
    synced: true,
    count: upsertedCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * 4. Controlled Test Message Dispatch Workflow
 * Strictly adheres to PROVIDER_MODE=mock guardrails (zero live sends, ₹0 spend).
 */
async function simulateTestDispatch({ templateId, recipientPhone, language = 'en', variables = {}, user = 'admin' }) {
  if (!templateId) {
    return { success: false, status: 400, message: 'Template ID is required.' };
  }
  if (!recipientPhone) {
    return { success: false, status: 400, message: 'Recipient phone number is required.' };
  }

  const cleanPhone = String(recipientPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 13) {
    return { success: false, status: 400, message: 'Invalid phone number format. Provide 10-digit Indian mobile or E.164 format.' };
  }

  const template = db.getById('portal_templates', templateId);
  if (!template) {
    return { success: false, status: 404, message: 'Template not found in portal database.' };
  }

  // Check required variables
  const missingVars = [];
  if (Array.isArray(template.variables)) {
    for (const v of template.variables) {
      if (variables[v] === undefined || variables[v] === '') {
        missingVars.push(v);
      }
    }
  }

  if (missingVars.length > 0) {
    return {
      success: false,
      status: 400,
      message: `Missing required template variable values: ${missingVars.map(v => `{{${v}}}`).join(', ')}`,
      missing_variables: missingVars
    };
  }

  // Render simulated body text
  let renderedBody = template.body || '';
  Object.keys(variables).forEach((k, idx) => {
    const reg = new RegExp(`\\{\\{${k}\\}\\}|\\{\\{${idx + 1}\\}\\}`, 'g');
    renderedBody = renderedBody.replace(reg, variables[k]);
  });

  // Simulated WAMID
  const mockWamid = `wamid.HBgL${cleanPhone}V1${Date.now()}SIM${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const simulationRecord = {
    message_id: mockWamid,
    template_id: template.template_id,
    template_name: template.name,
    recipient_phone: `+${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`,
    rendered_header: template.header || '',
    rendered_body: renderedBody,
    rendered_footer: template.footer || '',
    buttons: template.buttons || [],
    provider: 'Meta_WhatsApp_Cloud_API_Sandbox',
    provider_mode: CONFIG.providerMode,
    live_send_executed: false,
    cost_incurred: 0,
    delivery_status: 'API_ACCEPTED_MOCK',
    dispatched_by: user,
    dispatched_at: new Date().toISOString(),
    regulatory_compliance: 'DPDP_Act_2023_Compliant_Simulated'
  };

  db.logAudit(user, 'TEMPLATES', 'SEND_TEST_SIMULATION', {
    templateId,
    phone: cleanPhone.slice(0, 4) + '****',
    mockWamid
  });

  return {
    success: true,
    message: 'Test message simulated successfully. Zero live WhatsApp messages dispatched (Mock Mode active).',
    simulation: simulationRecord
  };
}

const ALLOWED_SUBMISSION_TEMPLATE_IDS = [
  'TPL-WABA-001',
  'TPL-WABA-002',
  'TPL-WABA-003',
  'TPL-WABA-004'
];

const submissionInFlight = new Set();

function sanitizeErrorText(text) {
  if (!text) return 'Meta Graph API request failed';
  return String(text)
    .replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
    .replace(/EAA[0-9A-Za-z]{10,}/g, '[REDACTED_TOKEN]');
}

/**
 * Compute deterministic SHA-256 hash of approved template content so post-approval
 * edits automatically invalidate approval.
 */
function computeTemplateContentHash(tpl) {
  const canonical = {
    template_id: tpl?.template_id || '',
    name: tpl?.name || '',
    language: tpl?.language || 'en',
    category: String(tpl?.category || '').toUpperCase(),
    header: tpl?.header || '',
    body: tpl?.body || '',
    footer: tpl?.footer || '',
    buttons: Array.isArray(tpl?.buttons) ? tpl.buttons : [],
    sample_values: tpl?.sample_values || {}
  };
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

/**
 * Verify operator approval strictly from trusted server-side records (never req.body).
 */
function verifyServerSideOperatorApproval(template, approvalRecord = null) {
  const record = approvalRecord || template;
  if (!record || record.operator_approval_status !== 'APPROVED') {
    return { approved: false, code: 'OPERATOR_APPROVAL_REQUIRED', reason: 'Server-side operator approval is missing or not APPROVED.' };
  }
  const currentHash = computeTemplateContentHash(template);
  if (!record.approved_template_hash || record.approved_template_hash !== currentHash) {
    return { approved: false, code: 'APPROVAL_STALE_TEMPLATE_MODIFIED', reason: 'Template content was modified after approval or lacks an approval content hash.' };
  }
  return { approved: true, approvedBy: record.approved_by || 'operator', approvedAt: record.approved_at || null };
}

/**
 * 5. Validate a WhatsApp template draft against Meta Cloud API structural rules.
 */
function validateTemplateForMetaSubmission(tpl) {
  const errors = [];
  if (!tpl || tpl.channel !== 'WhatsApp') {
    errors.push('NOT_WHATSAPP_TEMPLATE');
    return { valid: false, errors };
  }
  if (!tpl.name || !/^[a-z0-9_]+$/.test(tpl.name)) {
    errors.push('INVALID_NAME_FORMAT');
  }
  const supportedLangs = ['en', 'en_US', 'en_GB', 'hi', 'mr'];
  if (!tpl.language || !supportedLangs.includes(tpl.language)) {
    errors.push('INVALID_LANGUAGE_CODE');
  }
  const validCategories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
  if (!tpl.category || !validCategories.includes(String(tpl.category).toUpperCase())) {
    errors.push('INVALID_CATEGORY');
  }
  if (tpl.header && tpl.header.length > 60) {
    errors.push(`HEADER_TOO_LONG:${tpl.header.length}`);
  }
  if (tpl.footer && tpl.footer.length > 60) {
    errors.push(`FOOTER_TOO_LONG:${tpl.footer.length}`);
  }
  if (!tpl.body || typeof tpl.body !== 'string' || tpl.body.trim().length === 0) {
    errors.push('EMPTY_BODY');
  } else if (tpl.body.length > 1024) {
    errors.push(`BODY_TOO_LONG:${tpl.body.length}`);
  }

  const rawVars = (tpl.body || '').match(/\{\{([0-9a-zA-Z_]+)\}\}/g) || [];
  const uniqueVars = [...new Set(rawVars.map(v => v.replace(/[\{\}]/g, '')))];
  for (let i = 0; i < uniqueVars.length; i++) {
    if (!uniqueVars.includes(String(i + 1))) {
      errors.push('NON_SEQUENTIAL_VARIABLES');
      break;
    }
  }
  if (uniqueVars.length > 0) {
    if (!tpl.sample_values || typeof tpl.sample_values !== 'object') {
      errors.push('MISSING_SAMPLE_VALUES');
    } else {
      for (const v of uniqueVars) {
        if (!tpl.sample_values[v] || String(tpl.sample_values[v]).trim() === '') {
          errors.push(`MISSING_SAMPLE_FOR_${v}`);
        }
      }
    }
  }

  if (Array.isArray(tpl.buttons)) {
    if (tpl.buttons.length > 3) {
      errors.push('TOO_MANY_BUTTONS');
    }
    for (const btn of tpl.buttons) {
      const text = typeof btn === 'string' ? btn : (btn && btn.text ? btn.text : '');
      if (!text || text.length > 25) {
        errors.push('INVALID_BUTTON_TEXT');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 6. Build Meta Graph API POST /{WABA_ID}/message_templates payload.
 */
function buildMetaSubmissionPayload(tpl) {
  const components = [];
  if (tpl.header && tpl.header.trim()) {
    components.push({ type: 'HEADER', format: 'TEXT', text: tpl.header.trim() });
  }
  const bodyComponent = { type: 'BODY', text: tpl.body.trim() };
  const rawVars = (tpl.body || '').match(/\{\{([0-9]+)\}\}/g) || [];
  const uniqueVars = [...new Set(rawVars.map(v => v.replace(/[\{\}]/g, '')))];
  if (uniqueVars.length > 0 && tpl.sample_values) {
    bodyComponent.example = {
      body_text: [uniqueVars.map(v => String(tpl.sample_values[v] || ''))]
    };
  }
  components.push(bodyComponent);

  if (tpl.footer && tpl.footer.trim()) {
    components.push({ type: 'FOOTER', text: tpl.footer.trim() });
  }
  if (Array.isArray(tpl.buttons) && tpl.buttons.length > 0) {
    components.push({
      type: 'BUTTONS',
      buttons: tpl.buttons.map(btn => ({
        type: 'QUICK_REPLY',
        text: typeof btn === 'string' ? btn : btn.text
      }))
    });
  }

  return {
    name: tpl.name,
    language: tpl.language || 'en',
    category: String(tpl.category).toUpperCase(),
    components
  };
}

/**
 * 7. Controlled Meta Template Submission (POST /{WABA_ID}/message_templates)
 * Strictly guarded by allowlist, operator approval, validation, idempotency,
 * PROVIDER_MODE=mock block, explicit production env validation, and genuine API response reconciliation.
 */
function validateMetaProductionConfig(env = process.env) {
  const fields = {};
  const missing = [];
  const invalid = [];

  const checkNumeric = (key, val) => {
    const v = val ? String(val).trim() : '';
    if (!v) {
      fields[key] = 'MISSING';
      missing.push(key);
    } else if (!/^\d{6,30}$/.test(v)) {
      fields[key] = 'INVALID';
      invalid.push(key);
    } else {
      fields[key] = 'PRESENT';
    }
  };

  checkNumeric('META_BUSINESS_ID', env.META_BUSINESS_ID);
  checkNumeric('META_APP_ID', env.META_APP_ID);
  checkNumeric('META_WABA_ID', env.META_WABA_ID || env.WHATSAPP_BUSINESS_ACCOUNT_ID);
  checkNumeric('WHATSAPP_PHONE_NUMBER_ID', env.WHATSAPP_PHONE_NUMBER_ID);

  const apiVer = env.GRAPH_API_VERSION ? String(env.GRAPH_API_VERSION).trim() : '';
  if (!apiVer) {
    fields.GRAPH_API_VERSION = 'MISSING';
    missing.push('GRAPH_API_VERSION');
  } else if (!/^v\d+\.\d+$/.test(apiVer)) {
    fields.GRAPH_API_VERSION = 'INVALID';
    invalid.push('GRAPH_API_VERSION');
  } else {
    fields.GRAPH_API_VERSION = 'PRESENT';
  }

  const tokRes = resolveCanonicalMetaToken(env, { allowLegacyCompat: false });
  fields.META_SYSTEM_USER_TOKEN = tokRes.status;
  if (tokRes.status === 'MISSING') {
    missing.push('META_SYSTEM_USER_TOKEN');
  } else if (tokRes.status === 'INVALID') {
    invalid.push('META_SYSTEM_USER_TOKEN');
  }

  fields.PROVIDER_MODE = env.PROVIDER_MODE ? 'PRESENT' : 'MISSING';
  if (!env.PROVIDER_MODE) missing.push('PROVIDER_MODE');

  return {
    valid: missing.length === 0 && invalid.length === 0,
    fields,
    missing,
    invalid,
    tokenErrorCode: tokRes.code
  };
}

async function submitTemplateToMeta({
  templateId,
  operatorId = 'system',
  operatorScope = 'avani-loan-services',
  approvalRecord = null,
  httpClient = axios,
  dbAdapter = db,
  overrideTemplate = null,
  requireExplicitEnvConfig = (process.env.NODE_ENV === 'production')
} = {}) {
  const correlationId = crypto.randomBytes(8).toString('hex');
  const attemptAt = new Date().toISOString();

  if (!templateId || !ALLOWED_SUBMISSION_TEMPLATE_IDS.includes(templateId)) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_REJECTED', {
      templateId: String(templateId || 'UNKNOWN'),
      outcome: 'TEMPLATE_NOT_ALLOWLISTED',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      status: 400,
      code: 'TEMPLATE_NOT_ALLOWLISTED',
      correlationId,
      message: `Template ID "${templateId}" is not in the Meta submission allowlist.`
    };
  }

  const template = overrideTemplate || dbAdapter.getById('portal_templates', templateId);
  if (!template) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_REJECTED', {
      templateId,
      outcome: 'TEMPLATE_NOT_FOUND',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      status: 404,
      code: 'TEMPLATE_NOT_FOUND',
      correlationId,
      message: `Template "${templateId}" not found.`
    };
  }

  // Tenant / scope isolation check
  if (template.tenant_id && template.tenant_id !== operatorScope) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_FORBIDDEN_SCOPE', {
      templateId,
      outcome: 'CROSS_SCOPE_FORBIDDEN',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      status: 403,
      code: 'CROSS_SCOPE_FORBIDDEN',
      correlationId,
      message: 'Access denied: template belongs to an unauthorized scope.'
    };
  }

  // Server-side operator approval verification (never trusts client boolean)
  const approvalCheck = verifyServerSideOperatorApproval(template, approvalRecord);
  if (!approvalCheck.approved) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_BLOCKED_APPROVAL', {
      templateId,
      outcome: approvalCheck.code,
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      status: 403,
      code: approvalCheck.code,
      correlationId,
      message: approvalCheck.reason
    };
  }

  const validation = validateTemplateForMetaSubmission(template);
  if (!validation.valid) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_VALIDATION_FAILED', {
      templateId,
      outcome: 'TEMPLATE_VALIDATION_FAILED',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      status: 400,
      code: 'TEMPLATE_VALIDATION_FAILED',
      correlationId,
      message: 'Template failed Meta structural validation.',
      errors: validation.errors
    };
  }

  // Idempotency guard against duplicate or concurrent submissions
  const blockedStates = ['PENDING', 'IN_REVIEW', 'APPROVED', 'SUBMITTED_TO_META'];
  if (template.meta_id || blockedStates.includes(String(template.meta_approval_status || '').toUpperCase()) || submissionInFlight.has(templateId)) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_DUPLICATE_BLOCKED', {
      templateId,
      outcome: 'DUPLICATE_SUBMISSION_PREVENTED',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      status: 409,
      code: 'DUPLICATE_SUBMISSION_PREVENTED',
      correlationId,
      message: 'Template already has a Meta submission ID, active review status, or in-flight submission.'
    };
  }

  const activeProviderMode = process.env.PROVIDER_MODE || CONFIG.providerMode || 'mock';
  if (activeProviderMode !== 'live') {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_BLOCKED_MOCK_MODE', {
      templateId,
      name: template.name,
      providerMode: activeProviderMode,
      outcome: 'MOCK_MODE_ACTIVE',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      blocked: true,
      status: 403,
      code: 'MOCK_MODE_ACTIVE',
      correlationId,
      message: 'Live Meta template submission is blocked while PROVIDER_MODE=mock.'
    };
  }

  if (requireExplicitEnvConfig) {
    const cfgCheck = validateMetaProductionConfig(process.env);
    if (!cfgCheck.valid) {
      dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_INCOMPLETE_CONFIG', {
        templateId,
        outcome: 'META_PRODUCTION_CONFIG_INCOMPLETE',
        missing: cfgCheck.missing,
        invalid: cfgCheck.invalid,
        correlationId,
        timestamp: attemptAt
      });
      return {
        success: false,
        blocked: true,
        status: 400,
        code: 'META_PRODUCTION_CONFIG_INCOMPLETE',
        correlationId,
        missing: cfgCheck.missing,
        invalid: cfgCheck.invalid,
        message: 'Explicit Meta production configuration is incomplete or invalid; fallback IDs cannot be used in production.'
      };
    }
  }

  const tokenRes = resolveCanonicalMetaToken(process.env, {
    allowLegacyCompat: !requireExplicitEnvConfig && process.env.NODE_ENV === 'test'
  });
  if (!tokenRes.valid || !tokenRes.token) {
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_TOKEN_REJECTED', {
      templateId,
      outcome: tokenRes.code || 'MISSING_META_ACCESS_TOKEN',
      correlationId,
      timestamp: attemptAt
    });
    return {
      success: false,
      blocked: true,
      status: 400,
      code: tokenRes.code || 'MISSING_META_ACCESS_TOKEN',
      correlationId,
      message: tokenRes.message || 'Meta System User Access Token is not configured.'
    };
  }
  const token = tokenRes.token;

  // Strict endpoint construction guard (prevents host/WABA injection)
  const activeGraphVersion = process.env.GRAPH_API_VERSION || CONFIG.graphApiVersion;
  const activeWabaId = process.env.META_WABA_ID || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || CONFIG.wabaId;
  if (!/^v\d+\.\d+$/.test(String(activeGraphVersion)) || !/^\d+$/.test(String(activeWabaId))) {
    return {
      success: false,
      status: 500,
      code: 'INVALID_META_ENDPOINT_CONFIG',
      correlationId,
      message: 'Invalid Meta Graph API version or WABA ID configuration.'
    };
  }

  const payload = buildMetaSubmissionPayload(template);
  const url = `https://graph.facebook.com/${CONFIG.graphApiVersion}/${CONFIG.wabaId}/message_templates`;
  submissionInFlight.add(templateId);

  try {
    const res = await httpClient.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    const metaId = res?.data?.id ? String(res.data.id) : null;
    const rawStatus = String(res?.data?.status || '').toUpperCase();
    if (!metaId || !/^\d+$/.test(metaId)) {
      dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_SUBMIT_INVALID_RESPONSE', {
        templateId,
        outcome: 'INVALID_META_RESPONSE',
        correlationId,
        timestamp: new Date().toISOString()
      });
      return {
        success: false,
        status: 502,
        code: 'INVALID_META_RESPONSE',
        correlationId,
        message: 'Meta Graph API did not return a valid numeric template submission ID.'
      };
    }

    const submittedAt = new Date().toISOString();
    const canonicalStatus = rawStatus === 'APPROVED' ? 'APPROVED' : (rawStatus === 'REJECTED' ? 'REJECTED' : 'PENDING');

    const updatedRecord = {
      ...template,
      meta_id: metaId,
      meta_approval_status: canonicalStatus,
      submitted_at: submittedAt,
      synced_from_meta: true,
      updated_at: submittedAt
    };

    if (typeof dbAdapter.upsertAsync === 'function') {
      await dbAdapter.upsertAsync('portal_templates', 'template_id', updatedRecord);
    } else if (typeof dbAdapter.upsert === 'function') {
      dbAdapter.upsert('portal_templates', 'template_id', updatedRecord);
    }

    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_TEMPLATE_SUBMITTED', {
      templateId,
      metaId,
      status: canonicalStatus,
      outcome: 'SUBMITTED',
      correlationId,
      timestamp: submittedAt
    });

    return {
      success: true,
      status: 200,
      meta_id: metaId,
      meta_approval_status: canonicalStatus,
      submitted_at: submittedAt,
      correlationId,
      data: updatedRecord
    };
  } catch (err) {
    const errStatus = err?.response?.status || 502;
    const rawErrMsg = err?.response?.data?.error?.message || err.message || 'Meta submission failed';
    const safeMsg = sanitizeErrorText(rawErrMsg);
    dbAdapter.logAudit(operatorId, 'TEMPLATES', 'META_TEMPLATE_SUBMIT_FAILED', {
      templateId,
      httpStatus: errStatus,
      outcome: 'META_GRAPH_API_ERROR',
      correlationId,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      status: errStatus,
      code: 'META_GRAPH_API_ERROR',
      correlationId,
      message: safeMsg
    };
  } finally {
    submissionInFlight.delete(templateId);
  }
}

module.exports = {
  CONFIG,
  ALLOWED_SUBMISSION_TEMPLATE_IDS,
  getMetaConnectionStatus,
  fetchTemplatesFromMeta,
  syncTemplatesWithDatabase,
  simulateTestDispatch,
  parseMetaTemplate,
  validateTemplateForMetaSubmission,
  buildMetaSubmissionPayload,
  computeTemplateContentHash,
  verifyServerSideOperatorApproval,
  sanitizeErrorText,
  resolveCanonicalMetaToken,
  validateMetaProductionConfig,
  submitTemplateToMeta
};
