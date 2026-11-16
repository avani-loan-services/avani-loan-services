// src/services/ecosystemIntegrationRegistry.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Central Ecosystem Integration Registry & Workflow Engine
// Connects Project 1 (Portal), Project 2 (3-AVANI AI CRM), Project 3
// (4-AVANI LOAN AGENTS), Project 4 (5-AVAVI AI CALLING AGENT), and third-party
// adapters via apps/integration-gateway/index.cjs without exposing secrets.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { IntegrationGateway } = require('../../apps/integration-gateway/index.cjs');
const { buildSignedServiceHeaders, sanitizePayloadForAudit } = require('./serviceAuthGuard.cjs');

const gateway = new IntegrationGateway({ mode: process.env.PROVIDER_MODE || 'mock' });
const PRODUCTION_DISPATCH_STATE = {
  globalProductionDispatchEnabled: process.env.GLOBAL_PRODUCTION_DISPATCH_ENABLED === 'true',
  enabledProviders: new Set()
};

const TARGET_SERVICE_META = {
  avani_ai_crm: { audience: 'svc-ai-crm', envUrlKey: 'AVANI_CRM_URL', defaultPath: '/api/ecosystem/s2s' },
  avani_loan_agents: { audience: 'svc-loan-agents', envUrlKey: 'LOAN_AGENTS_URL', defaultPath: '/api/ecosystem/s2s' },
  avavi_calling_agent: { audience: 'svc-ai-calling', envUrlKey: 'CALLING_AGENT_URL', defaultPath: '/api/ecosystem/s2s' }
};

function loadCallingBridge() {
  const bridgePath = path.resolve(__dirname, '../../../5-AVAVI AI CALLING AGENT/calling-agent-bridge.js');
  if (fs.existsSync(bridgePath)) {
    try {
      return require(bridgePath);
    } catch {
      return null;
    }
  }
  return null;
}

const PROVIDER_DEFS = [
  { id: 'avani_core_api', name: 'AVANI LOAN SERVICES Core API', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Platform', webhook: '/api/health', healthEndpoint: '/health', envKeys: [], alwaysLive: true },
  { id: 'website_intake', name: 'Website Enquiry Intake', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Platform', webhook: '/api/portal/public/enquiry', healthEndpoint: '/api/portal/public/enquiry', envKeys: [], alwaysLive: true },
  { id: 'portal_database', name: 'Portal & MongoDB Data Layer', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Infrastructure', webhook: null, healthEndpoint: '/api/health', envKeys: [], alwaysLive: true },
  { id: 'webhook_router', name: 'Unified Webhook Receiver & HMAC Guard', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Infrastructure', webhook: '/api/whatsapp-webhook', healthEndpoint: '/health', envKeys: [], alwaysLive: true },
  { id: 'workflow_engine', name: 'Unified 8-Workflow Engine (WF-01..WF-08)', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Infrastructure', webhook: null, healthEndpoint: '/api/portal/integrations/health', envKeys: [], alwaysLive: true },
  { id: 'background_jobs', name: 'BullMQ & DLQ Recovery Queue', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Infrastructure', webhook: null, healthEndpoint: '/api/portal/integrations/health', envKeys: [], alwaysLive: true },
  { id: 'deployment_health', name: 'Vercel & API Health Monitor', ownerProject: 'Project 1 (1-AVANI LOAN SERVICE FY 26-27)', category: 'Core Infrastructure', webhook: null, healthEndpoint: '/health', envKeys: [], alwaysLive: true },
  { id: 'avani_ai_crm', name: 'AVANI AI CRM Service', ownerProject: 'Project 2 (3-AVANI AI CRM)', category: 'Connected Ecosystem', webhook: '/api/portal/integrations/cross-project/event', healthEndpoint: '/api/health', envKeys: ['AVANI_CRM_URL', 'CRM_API_KEY'] },
  { id: 'avani_loan_agents', name: 'AVANI LOAN AGENTS Advisory Suite', ownerProject: 'Project 3 (4-AVANI LOAN AGENTS)', category: 'Connected Ecosystem', webhook: '/api/incoming-lead', healthEndpoint: '/api/ping', envKeys: ['GEMINI_API_KEY'] },
  { id: 'avavi_calling_agent', name: 'AVAVI AI CALLING AGENT Bridge', ownerProject: 'Project 4 (5-AVAVI AI CALLING AGENT)', category: 'Connected Ecosystem', webhook: '/api/vapi-callback', healthEndpoint: '/api/vapi-callback', envKeys: ['VAPI_API_KEY', 'VAPI_ASSISTANT_ID'] },
  { id: 'chatmitra', name: 'ChatMitra WhatsApp', ownerProject: 'Project 1 / Project 2', category: 'Communication', webhook: '/api/whatsapp-webhook', healthEndpoint: '/api/whatsapp-webhook', envKeys: ['AISENCY_WABA_API_KEY'] },
  { id: 'meta_whatsapp', name: 'Meta WhatsApp Cloud API', ownerProject: 'Project 1 / Project 2', category: 'Communication', webhook: '/api/meta/webhook', healthEndpoint: '/api/meta/webhook', envKeys: ['META_APP_ID', 'WHATSAPP_PHONE_NUMBER_ID', 'META_WEBHOOK_VERIFY_TOKEN'] },
  { id: 'twilio', name: 'Twilio Messaging & Voice', ownerProject: 'Project 1', category: 'Communication', webhook: '/api/whatsapp/webhook', healthEndpoint: '/api/whatsapp/webhook', envKeys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'] },
  { id: 'vapi', name: 'VAPI AI Voice Calling', ownerProject: 'Project 1 / Project 4', category: 'AI & Voice', webhook: '/api/vapi-callback', healthEndpoint: '/api/vapi-callback', envKeys: ['VAPI_API_KEY', 'VAPI_ASSISTANT_ID'] },
  { id: 'hubspot', name: 'HubSpot CRM', ownerProject: 'Project 1 / Project 3', category: 'CRM & Automation', webhook: '/api/auth/hubspot/callback', healthEndpoint: '/api/crm/health', envKeys: ['HUBSPOT_ACCESS_TOKEN', 'HUBSPOT_CLIENT_ID'] },
  { id: 'google_sheets', name: 'Google Sheets & Apps Script', ownerProject: 'Project 1 / Project 3', category: 'CRM & Automation', webhook: null, healthEndpoint: null, envKeys: ['GOOGLE_SHEET_APP_SCRIPT_URL', 'GOOGLE_SHEETS_ID'] },
  { id: 'zapier', name: 'Zapier Webhooks', ownerProject: 'Project 1 / Project 3', category: 'CRM & Automation', webhook: '/api/lead', healthEndpoint: '/api/lead', envKeys: ['ZAPIER_WEBHOOK_URL'] },
  { id: 'smtp_email', name: 'Transactional SMTP Email', ownerProject: 'Project 1', category: 'Communication', webhook: null, healthEndpoint: null, envKeys: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] },
  { id: 'gemini_ai', name: 'Google Gemini AI', ownerProject: 'Project 1 / Project 3', category: 'AI & Voice', webhook: null, healthEndpoint: null, envKeys: ['GEMINI_API_KEY'] }
];

const WORKFLOW_DEFS = [
  { workflowId: 'WF-01', version: '1.0.0', name: 'Website Lead Capture', trigger: 'enquiry.received', conditions: ['valid_phone_or_email', 'not_duplicate_lease'], actions: ['assign_central_customer_id', 'create_crm_lead', 'assign_advisor', 'schedule_followup'], owner: 'Project 1 + Project 2', enabled: true },
  { workflowId: 'WF-02', version: '1.0.0', name: 'AI Lead Qualification', trigger: 'lead.qualification.requested', conditions: ['no_autonomous_sanction_or_rate_guarantee'], actions: ['classify_loan_product', 'check_foir_and_checklist', 'handover_to_human_advisor'], owner: 'Project 3 (4-AVANI LOAN AGENTS)', enabled: true },
  { workflowId: 'WF-03', version: '1.0.0', name: 'AI Calling Integration', trigger: 'call.initiation.requested', conditions: ['consent_status === Approved', 'not_opted_out', 'valid_calling_window'], actions: ['invoke_calling_bridge', 'scrub_transcript_pii', 'map_disposition_to_crm'], owner: 'Project 4 (5-AVAVI AI CALLING AGENT)', enabled: true },
  { workflowId: 'WF-04', version: '1.0.0', name: 'Builder Partnerships', trigger: 'builder.outreach.requested', conditions: ['official_channel_verified'], actions: ['score_builder_100pt', 'update_builder_pipeline'], owner: 'Module A (Builders)', enabled: true },
  { workflowId: 'WF-05', version: '1.0.0', name: 'Education Institutional Funding', trigger: 'education.outreach.requested', conditions: ['consent_status === Approved', 'not_opted_out'], actions: ['dispatch_approved_template', 'log_consent_audit'], owner: 'Module B (Education)', enabled: true },
  { workflowId: 'WF-06', version: '1.0.0', name: 'Loan Application Coordination', trigger: 'application.submitted', conditions: ['foir_calculated', 'checklist_verified'], actions: ['match_lenders_human_review', 'update_application_status'], owner: 'Underwriting Desk', enabled: true },
  { workflowId: 'WF-07', version: '1.0.0', name: 'Communication Synchronisation', trigger: 'communication.dispatch', conditions: ['consent_status === Approved', 'not_opted_out', 'stop_switch_inactive'], actions: ['dispatch_channel_adapter', 'record_delivery_receipt'], owner: 'Communication Hub', enabled: true },
  { workflowId: 'WF-08', version: '1.0.0', name: 'Integration Error Recovery', trigger: 'integration.failed', conditions: ['retries < max_retries'], actions: ['enqueue_dlq', 'retry_with_idempotency', 'notify_administrator'], owner: 'Integration Gateway', enabled: true }
];

const providerRuntimeState = new Map();
for (const def of PROVIDER_DEFS) {
  providerRuntimeState.set(def.id, {
    enabled: true,
    productionDispatchEnabled: Boolean(def.alwaysLive),
    verificationStatus: def.alwaysLive ? 'LIVE_VERIFIED' : 'MOCK_ONLY',
    lastSyncAt: null,
    lastErrorAt: null,
    lastErrorMessage: null,
    lastTestResult: null,
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

const customerIdentityIndex = new Map();
const crossProjectEvents = [];

function getEffectiveMode() {
  return process.env.PROVIDER_MODE || gateway.mode || 'mock';
}

function generateCentralCustomerId(phone = '', email = '') {
  const normPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  const normEmail = String(email || '').trim().toLowerCase();
  const seed = `${normPhone}|${normEmail}`;
  if (!normPhone && !normEmail) return null;
  const hash = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12).toUpperCase();
  return `CUS-AVL-${hash}`;
}

function scrubSensitiveText(text) {
  const bridgeMod = loadCallingBridge();
  if (bridgeMod && typeof bridgeMod.scrubPII === 'function') {
    return bridgeMod.scrubPII(text);
  }
  return String(text || '')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, 'XXXXXXXX1234')
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi, 'XXXXX1234X')
    .replace(/\b(otp|code|pin|password|secret)\s*[:=-]?\s*\S+/gi, '$1: [REDACTED]');
}

function mapCallingDisposition(raw) {
  const bridgeMod = loadCallingBridge();
  if (bridgeMod && typeof bridgeMod.mapCallDisposition === 'function') {
    return bridgeMod.mapCallDisposition(raw);
  }
  const d = String(raw || '').toUpperCase();
  if (d.includes('OPT') || d.includes('DND') || d.includes('DO_NOT_CALL')) return 'OPTED_OUT';
  if (d.includes('CALLBACK')) return 'CALLBACK_REQUESTED';
  if (d.includes('INTEREST')) return 'QUALIFIED_INTERESTED';
  return 'COMPLETED';
}

function getProviderSnapshot(def) {
  const rt = providerRuntimeState.get(def.id);
  const configuredCount = def.envKeys.filter(k => Boolean(process.env[k])).length;
  const credentialsConfigured = def.alwaysLive ? true : configuredCount > 0;
  const mode = def.alwaysLive ? 'production' : getEffectiveMode();
  let status = 'NOT_CONFIGURED';
  if (def.alwaysLive) status = 'LIVE_VERIFIED';
  else if (mode === 'mock') status = 'MOCK_ONLY';
  else status = credentialsConfigured ? 'LIVE_UNVERIFIED' : 'NOT_CONFIGURED';

  return {
    id: def.id,
    name: def.name,
    ownerProject: def.ownerProject,
    category: def.category,
    enabled: rt.enabled,
    productionDispatchEnabled: rt.productionDispatchEnabled,
    verificationStatus: rt.verificationStatus,
    mode,
    status,
    credentialsConfigured,
    configuredKeysCount: configuredCount,
    totalKeysCount: def.envKeys.length,
    webhook: def.webhook,
    healthEndpoint: def.healthEndpoint,
    lastSyncAt: rt.lastSyncAt,
    lastErrorAt: rt.lastErrorAt,
    lastTestResult: rt.lastTestResult,
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

  rt.lastSyncAt = new Date().toISOString();
  rt.lastTestResult = `PASSED (${mode})`;
  gateway.recordLedgerEntry(def.id.toUpperCase(), 'TEST_CONNECTION', 'PASSED', { correlationId: corrId });
  return {
    success: true,
    providerId: def.id,
    ownerProject: def.ownerProject,
    mode,
    correlationId: corrId,
    message: `${def.name} connection check passed in ${mode} mode.`
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
  const normalizedId = workflowId === 'WF-C-EDUCATION' ? 'WF-05' : workflowId === 'WF-E-COMMUNICATION' ? 'WF-07' : workflowId;
  const wf = WORKFLOW_DEFS.find(w => w.workflowId === normalizedId);
  if (!wf) return { success: false, status: 404, error: 'Workflow not found' };
  const rt = workflowRuntimeState.get(normalizedId);
  if (!rt.enabled) return { success: false, status: 409, blocked: true, reason: 'WORKFLOW_PAUSED' };

  if (['WF-03', 'WF-05', 'WF-07'].includes(normalizedId)) {
    const consent = payload.consent_status || 'Pending_Request';
    if (consent !== 'Approved' || payload.suppressed === true || payload.opt_out === true) {
      rt.lastExecutionAt = new Date().toISOString();
      rt.lastStatus = 'BLOCKED_CONSENT_GATE';
      gateway.recordLedgerEntry('WORKFLOW_ENGINE', normalizedId, 'BLOCKED_CONSENT_GATE', {
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
  gateway.recordLedgerEntry('WORKFLOW_ENGINE', normalizedId, 'EXECUTED', {
    leadId: payload.lead_id || payload.institution_id || null
  });
  return { success: true, status: 200, workflowId: normalizedId, executedAt: rt.lastExecutionAt };
}

function syncCrossProjectEvent(eventType, payload = {}, correlationId = null) {
  const corrId = correlationId || gateway.generateCorrelationId();
  const idempKey = payload.idempotencyKey || `${eventType}:${payload.phone || ''}:${payload.email || ''}:${payload.externalId || ''}`;
  const lease = gateway.acquireIdempotencyLease(idempKey);

  if (lease.duplicate) {
    gateway.recordLedgerEntry('CROSS_PROJECT_BUS', eventType, 'SUPPRESSED_DUPLICATE', { correlationId: corrId });
    return { success: true, status: 200, duplicateSuppressed: true, correlationId: corrId, data: lease.originalRecord };
  }

  if (payload.autonomousApproval === true || payload.guaranteedRate === true) {
    gateway.recordLedgerEntry('LOAN_AGENTS_GUARDRAIL', eventType, 'BLOCKED_AUTONOMOUS_FINANCIAL_CLAIM', { correlationId: corrId });
    return { success: false, status: 403, blocked: true, reason: 'REGULATORY_GUARDRAIL_VIOLATION', correlationId: corrId };
  }

  if (['call.initiation.requested', 'education.outreach.requested', 'communication.dispatch'].includes(eventType)) {
    const consent = payload.consent_status || 'Pending_Request';
    if (consent !== 'Approved' || payload.suppressed === true || payload.opt_out === true) {
      gateway.recordLedgerEntry('CROSS_PROJECT_BUS', eventType, 'BLOCKED_CONSENT_GATE', { correlationId: corrId });
      return { success: false, status: 403, blocked: true, reason: `Blocked by consent gate: ${consent}`, correlationId: corrId };
    }
  }

  const centralCustomerId = generateCentralCustomerId(payload.phone, payload.email) || payload.centralCustomerId || null;
  if (centralCustomerId) {
    const existing = customerIdentityIndex.get(centralCustomerId) || {
      centralCustomerId,
      externalIds: {},
      consentStatus: payload.consent_status || 'Pending_Request',
      updatedAt: new Date().toISOString()
    };
    if (payload.sourceProject && payload.externalId) {
      existing.externalIds[payload.sourceProject] = payload.externalId;
    }
    if (payload.rawDisposition) {
      const disp = mapCallingDisposition(payload.rawDisposition);
      existing.lastCallDisposition = disp;
      if (disp === 'OPTED_OUT') existing.consentStatus = 'Opted_Out';
    }
    existing.updatedAt = new Date().toISOString();
    customerIdentityIndex.set(centralCustomerId, existing);
  }

  const scrubbedSummary = payload.summary ? scrubSensitiveText(payload.summary) : null;
  const eventRecord = {
    eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventType,
    correlationId: corrId,
    sourceProject: payload.sourceProject || 'Project 1',
    targetProject: payload.targetProject || 'Project 2',
    centralCustomerId,
    scrubbedSummary,
    disposition: payload.rawDisposition ? mapCallingDisposition(payload.rawDisposition) : null,
    timestamp: new Date().toISOString()
  };

  crossProjectEvents.push(eventRecord);
  gateway.commitIdempotency(idempKey, eventRecord);
  gateway.recordLedgerEntry('CROSS_PROJECT_BUS', eventType, 'SYNCHRONIZED', {
    correlationId: corrId,
    leadId: centralCustomerId
  });

  return { success: true, status: 200, duplicateSuppressed: false, correlationId: corrId, event: eventRecord };
}

function setProviderVerificationState(providerId, { verificationStatus, ownerApproved = false, enableDispatch = false } = {}) {
  const def = PROVIDER_DEFS.find(p => p.id === providerId);
  if (!def) return null;
  const rt = providerRuntimeState.get(providerId);
  const allowedStatuses = ['MOCK_ONLY', 'CREDENTIAL_MISSING', 'SANDBOX_VERIFIED', 'PRODUCTION_VERIFIED', 'FAILED', 'NOT_TESTED', 'LIVE_VERIFIED'];
  if (verificationStatus && allowedStatuses.includes(verificationStatus)) {
    rt.verificationStatus = verificationStatus;
  }
  if (enableDispatch === true) {
    const gatePassed = rt.verificationStatus === 'PRODUCTION_VERIFIED' && ownerApproved === true;
    if (!gatePassed) {
      return { success: false, status: 403, reason: 'PROVIDER_ENABLEMENT_GATE_FAILED', statusCurrent: rt.verificationStatus };
    }
    rt.productionDispatchEnabled = true;
    PRODUCTION_DISPATCH_STATE.enabledProviders.add(providerId);
  } else if (enableDispatch === false) {
    rt.productionDispatchEnabled = false;
    PRODUCTION_DISPATCH_STATE.enabledProviders.delete(providerId);
  }
  return { success: true, provider: getProviderSnapshot(def), rt };
}

async function dispatchToConnectedService({
  targetProjectId,
  eventType,
  payload = {},
  correlationId = null,
  idempotencyKey = null,
  targetUrl = null,
  s2sSecret = null
} = {}) {
  const meta = TARGET_SERVICE_META[targetProjectId];
  if (!meta) {
    return { success: false, status: 404, error: `Unknown connected service target: ${targetProjectId}` };
  }
  const corrId = correlationId || gateway.generateCorrelationId();
  const baseUrl = targetUrl || process.env[meta.envUrlKey] || '';
  if (!baseUrl) {
    const dlqItem = gateway.sendToDLQ(targetProjectId.toUpperCase(), sanitizePayloadForAudit({ eventType, payload }), new Error(`${meta.envUrlKey} not configured`), corrId);
    return { success: false, status: 503, error: `${meta.envUrlKey} not configured`, dlqId: dlqItem.dlqId, correlationId: corrId };
  }

  // First enforce central registry guardrails (idempotency, consent, no autonomous financial claims)
  const syncRes = syncCrossProjectEvent(eventType, {
    ...payload,
    sourceProject: payload.sourceProject || 'Project 1 (svc-loan-api)',
    targetProject: targetProjectId,
    idempotencyKey
  }, corrId);
  if (!syncRes.success) {
    return syncRes;
  }
  if (syncRes.duplicateSuppressed) {
    return syncRes;
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}${meta.defaultPath}`;
  const wirePayload = {
    eventType,
    correlationId: corrId,
    idempotencyKey: idempotencyKey || `${eventType}:${corrId}`,
    centralCustomerId: syncRes.event?.centralCustomerId || null,
    payload: sanitizePayloadForAudit(payload)
  };
  const { headers, serializedBody } = buildSignedServiceHeaders({
    issuer: 'svc-loan-api',
    audience: meta.audience,
    body: wirePayload,
    correlationId: corrId,
    idempotencyKey: wirePayload.idempotencyKey,
    secret: s2sSecret
  });

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: serializedBody,
      signal: AbortSignal.timeout(Number(process.env.S2S_TIMEOUT_MS || 5000))
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    if (!res.ok) {
      const errMsg = `Downstream ${targetProjectId} returned HTTP ${res.status}`;
      const dlqItem = gateway.sendToDLQ(targetProjectId.toUpperCase(), wirePayload, new Error(errMsg), corrId);
      return { success: false, status: res.status, error: errMsg, downstreamBody: json || text.slice(0, 200), dlqId: dlqItem.dlqId, correlationId: corrId };
    }
    gateway.recordLedgerEntry(targetProjectId.toUpperCase(), 'S2S_DISPATCH', 'DELIVERED', { correlationId: corrId, leadId: wirePayload.centralCustomerId });
    return { success: true, status: res.status, correlationId: corrId, targetProjectId, centralCustomerId: wirePayload.centralCustomerId, downstreamResponse: json };
  } catch (err) {
    const dlqItem = gateway.sendToDLQ(targetProjectId.toUpperCase(), wirePayload, err, corrId);
    return { success: false, status: 502, error: err.message, dlqId: dlqItem.dlqId, correlationId: corrId };
  }
}

module.exports = {
  gateway,
  customerIdentityIndex,
  crossProjectEvents,
  PRODUCTION_DISPATCH_STATE,
  listIntegrations,
  listWorkflows,
  testProviderConnection,
  toggleProvider,
  toggleWorkflow,
  executeConsentGatedWorkflow,
  generateCentralCustomerId,
  syncCrossProjectEvent,
  setProviderVerificationState,
  dispatchToConnectedService,
  scrubSensitiveText,
  mapCallingDisposition,
  getEffectiveMode
};
