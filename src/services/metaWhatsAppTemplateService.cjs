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

// Meta WhatsApp Platform Credentials (from environment only)
const CONFIG = {
  metaBusinessId: process.env.META_BUSINESS_ID || '130700309306240',
  metaAppId: process.env.META_APP_ID || '2049842548930849',
  wabaId: process.env.META_WABA_ID || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1062614709598311',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1147494668457940',
  displayPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '+917249108474',
  graphApiVersion: process.env.GRAPH_API_VERSION || 'v20.0',
  metaAccessToken: process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || process.env.META_SYSTEM_USER_TOKEN || null,
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

module.exports = {
  CONFIG,
  getMetaConnectionStatus,
  fetchTemplatesFromMeta,
  syncTemplatesWithDatabase,
  simulateTestDispatch,
  parseMetaTemplate
};
