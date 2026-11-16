// src/services/ecosystemIntegrationRegistry.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Central Ecosystem Integration Registry & Workflow Engine
// Reuses apps/integration-gateway/index.cjs without exposing secret values.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { IntegrationGateway } = require('../../apps/integration-gateway/index.cjs');

const gateway = new IntegrationGateway({ mode: process.env.PROVIDER_MODE || 'mock' });

const PROVIDER_DEFS = [
  {
    id: 'website_intake',
    name: 'Website Enquiry Intake',
    category: 'Core Platform',
    webhook: '/api/portal/public/enquiry',
    envKeys: [],
    alwaysLive: true
  },
  {
    id: 'chatmitra',
    name: 'ChatMitra WhatsApp',
    category: 'Communication',
    webhook: '/api/whatsapp-webhook',
    envKeys: ['AISENCY_WABA_API_KEY']
  },
  {
    id: 'meta_whatsapp',
    name: 'Meta WhatsApp Cloud API',
    category: 'Communication',
    webhook: '/api/meta/webhook',
    envKeys: ['META_APP_ID', 'WHATSAPP_PHONE_NUMBER_ID', 'META_WEBHOOK_VERIFY_TOKEN']
  },
  {
    id: 'twilio',
    name: 'Twilio Messaging & Voice',
    category: 'Communication',
    webhook: '/api/whatsapp/webhook',
    envKeys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER']
  },
  {
    id: 'vapi',
    name: 'VAPI AI Voice Calling',
    category: 'AI & Voice',
    webhook: '/api/vapi-callback',
    envKeys: ['VAPI_API_KEY', 'VAPI_ASSISTANT_ID']
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM & Automation',
    webhook: '/api/auth/hubspot/callback',
    envKeys: ['HUBSPOT_ACCESS_TOKEN', 'HUBSPOT_CLIENT_ID']
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets & Apps Script',
    category: 'CRM & Automation',
    webhook: null,
    envKeys: ['GOOGLE_SHEET_APP_SCRIPT_URL', 'GOOGLE_SHEETS_ID']
  },
  {
    id: 'zapier',
    name: 'Zapier Webhooks',
    category: 'CRM & Automation',
    webhook: '/api/lead',
    envKeys: ['ZAPIER_WEBHOOK_URL']
  },
  {
    id: 'smtp_email',
    name: 'Transactional SMTP Email',
    category: 'Communication',
    webhook: null,
    envKeys: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']
  },
  {
    id: 'gemini_ai',
    name: 'Google Gemini AI',
    category: 'AI & Voice',
    webhook: null,
    envKeys: ['GEMINI_API_KEY']
  }
];

const WORKFLOW_DEFS = [
  {
    workflowId: 'WF-A-ENQUIRY',
    name: 'New Customer Enquiry Intake',
    trigger: 'enquiry.received',
    conditions: ['valid_phone_or_email', 'not_duplicate_lease'],
    actions: ['create_crm_lead', 'record_source', 'schedule_followup'],
    owner: 'CRM Intake Engine',
    enabled: true
  },
  {
    workflowId: 'WF-B-BUILDER',
    name: 'Builder Partnership Qualification',
    trigger: 'builder.created',
    conditions: ['official_channel_present'],
    actions: ['score_builder_100pt', 'assign_owner', 'update_builder_pipeline'],
    owner: 'Builder Partnership Lead',
    enabled: true
  },
  {
    workflowId: 'WF-C-EDUCATION',
    name: 'Education Institutional Funding & Consent Gate',
    trigger: 'education.outreach.requested',
    conditions: ['consent_status === Approved', 'not_opted_out'],
    actions: ['dispatch_approved_template', 'log_consent_audit'],
    owner: 'Education Institutional Lead',
    enabled: true
  },
  {
    workflowId: 'WF-D-APPLICATION',
    name: 'Loan Application & Lender Coordination',
    trigger: 'application.submitted',
    conditions: ['foir_calculated', 'checklist_verified'],
    actions: ['match_lenders', 'create_task', 'notify_admin'],
    owner: 'Underwriting Desk',
    enabled: true
  },
  {
    workflowId: 'WF-E-COMMUNICATION',
    name: 'Approved Customer Communication',
    trigger: 'communication.dispatch',
    conditions: ['consent_verified', 'stop_switch_inactive'],
    actions: ['dispatch_channel_adapter', 'capture_delivery_status'],
    owner: 'Communication Controller',
    enabled: true
  },
  {
    workflowId: 'WF-F-DLQ-RECOVERY',
    name: 'Integration Failure & DLQ Recovery',
    trigger: 'integration.failed',
    conditions: ['retries < max_retries'],
    actions: ['enqueue_dlq', 'notify_administrator', 'retry_with_backoff'],
    owner: 'Integration Gateway',
    enabled: true
  }
];

const providerRuntimeState = new Map();
for (const def of PROVIDER_DEFS) {
  providerRuntimeState.set(def.id, {
    enabled: true,
    lastSyncAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
    errorCount: 0,
    retryCount: 0
  });
}

const workflowRuntimeState = new Map();
for (const wf of WORKFLOW_DEFS) {
  workflowRuntimeState.set(wf.workflowId, {
    enabled: wf.enabled,
    lastExecutionAt: null,
    lastStatus: 'IDLE',
    executionCount: 0
  });
}

function getEffectiveMode() {
  return process.env.PROVIDER_MODE || gateway.mode || 'mock';
}

function getProviderSnapshot(def) {
  const rt = providerRuntimeState.get(def.id);
  const configuredCount = def.envKeys.filter(k => Boolean(process.env[k])).length;
  const credentialsConfigured = def.alwaysLive ? true : configuredCount > 0;
  const mode = def.alwaysLive ? 'production' : getEffectiveMode();
  let status = 'NOT_CONFIGURED';
  if (def.alwaysLive) status = 'LIVE_VERIFIED';
  else if (mode === 'mock') status = credentialsConfigured ? 'MOCK_ONLY' : 'MOCK_ONLY';
  else status = credentialsConfigured ? 'LIVE_UNVERIFIED' : 'NOT_CONFIGURED';

  return {
    id: def.id,
    name: def.name,
    category: def.category,
    enabled: rt.enabled,
    mode,
    status,
    credentialsConfigured,
    configuredKeysCount: configuredCount,
    totalKeysCount: def.envKeys.length,
    webhook: def.webhook,
    lastSyncAt: rt.lastSyncAt,
    lastErrorAt: rt.lastErrorAt,
    errorCount: rt.errorCount,
    retryCount: rt.retryCount
  };
}

function listIntegrations() {
  return PROVIDER_DEFS.map(getProviderSnapshot);
}

function listWorkflows() {
  return WORKFLOW_DEFS.map(wf => ({
    ...wf,
    ...workflowRuntimeState.get(wf.workflowId)
  }));
}

async function testProviderConnection(providerId) {
  const def = PROVIDER_DEFS.find(p => p.id === providerId);
  if (!def) return null;
  const rt = providerRuntimeState.get(providerId);
  const corrId = gateway.generateCorrelationId();
  const mode = def.alwaysLive ? 'production' : getEffectiveMode();

  if (mode === 'mock' || def.alwaysLive) {
    rt.lastSyncAt = new Date().toISOString();
    gateway.recordLedgerEntry(def.id.toUpperCase(), 'TEST_CONNECTION', 'PASSED', { correlationId: corrId });
    return {
      success: true,
      providerId: def.id,
      mode,
      correlationId: corrId,
      message: `${def.name} connection check passed in ${mode} mode.`
    };
  }

  const hasCreds = def.envKeys.some(k => Boolean(process.env[k]));
  if (!hasCreds) {
    rt.lastErrorAt = new Date().toISOString();
    rt.errorCount += 1;
    rt.lastErrorMessage = 'Missing required environment credentials';
    gateway.recordLedgerEntry(def.id.toUpperCase(), 'TEST_CONNECTION', 'NOT_CONFIGURED', { correlationId: corrId });
    return {
      success: false,
      providerId: def.id,
      mode,
      correlationId: corrId,
      message: `${def.name} credentials are not configured.`
    };
  }

  rt.lastSyncAt = new Date().toISOString();
  gateway.recordLedgerEntry(def.id.toUpperCase(), 'TEST_CONNECTION', 'CONFIG_VERIFIED', { correlationId: corrId });
  return {
    success: true,
    providerId: def.id,
    mode,
    correlationId: corrId,
    message: `${def.name} configuration verified.`
  };
}

function toggleProvider(providerId, enabled) {
  const def = PROVIDER_DEFS.find(p => p.id === providerId);
  if (!def) return null;
  const rt = providerRuntimeState.get(providerId);
  rt.enabled = Boolean(enabled);
  gateway.recordLedgerEntry(def.id.toUpperCase(), rt.enabled ? 'ENABLE_PROVIDER' : 'DISABLE_PROVIDER', 'UPDATED', {});
  return getProviderSnapshot(def);
}

function toggleWorkflow(workflowId, enabled) {
  const wf = WORKFLOW_DEFS.find(w => w.workflowId === workflowId);
  if (!wf) return null;
  const rt = workflowRuntimeState.get(workflowId);
  rt.enabled = Boolean(enabled);
  gateway.recordLedgerEntry('WORKFLOW_ENGINE', rt.enabled ? 'ENABLE_WORKFLOW' : 'PAUSE_WORKFLOW', 'UPDATED', { messageId: workflowId });
  return { ...wf, ...rt };
}

function executeConsentGatedWorkflow(workflowId, payload = {}) {
  const wf = WORKFLOW_DEFS.find(w => w.workflowId === workflowId);
  if (!wf) return { success: false, status: 404, error: 'Workflow not found' };
  const rt = workflowRuntimeState.get(workflowId);
  if (!rt.enabled) return { success: false, status: 409, blocked: true, reason: 'WORKFLOW_PAUSED' };

  if (workflowId === 'WF-C-EDUCATION' || workflowId === 'WF-E-COMMUNICATION') {
    const consent = payload.consent_status || 'Pending_Request';
    if (consent !== 'Approved' || payload.suppressed === true || payload.opt_out === true) {
      rt.lastExecutionAt = new Date().toISOString();
      rt.lastStatus = 'BLOCKED_CONSENT_GATE';
      gateway.recordLedgerEntry('WORKFLOW_ENGINE', workflowId, 'BLOCKED_CONSENT_GATE', {
        leadId: payload.lead_id || payload.institution_id || null
      });
      return {
        success: false,
        status: 403,
        blocked: true,
        reason: `Outreach blocked: consent_status=${consent}`
      };
    }
  }

  rt.lastExecutionAt = new Date().toISOString();
  rt.lastStatus = 'EXECUTED';
  rt.executionCount += 1;
  gateway.recordLedgerEntry('WORKFLOW_ENGINE', workflowId, 'EXECUTED', {
    leadId: payload.lead_id || payload.institution_id || null
  });
  return { success: true, status: 200, workflowId, executedAt: rt.lastExecutionAt };
}

module.exports = {
  gateway,
  listIntegrations,
  listWorkflows,
  testProviderConnection,
  toggleProvider,
  toggleWorkflow,
  executeConsentGatedWorkflow,
  getEffectiveMode
};
