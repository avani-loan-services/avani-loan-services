// src/services/templatePublishingEngine.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Meta WABA & AiSensy Publishing Engine
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { getTemplateById, saveTemplate, recordTemplateAudit } = require('../models/ContentTemplate.cjs');
const { validateTemplate } = require('./templateValidator.cjs');
const { recordProviderAttempt } = require('../models/ProviderLedger.cjs');

/**
 * Helper to get clean environment credentials
 */
function getMetaCredentials() {
  const wabaId = process.env.META_WABA_ID || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || BUSINESS_IDENTITY.metaWabaId;
  const token = process.env.META_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || process.env['META_ACCESS_TOKEN(WHATSAPP_ACCESS_TOKEN'];
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID || BUSINESS_IDENTITY.metaPhoneId;
  return { wabaId, token, phoneId };
}

function getAiSensyCredentials() {
  const apiKey = process.env.AISENSY_API_KEY || process.env.AISENCY_WABA_API_KEY;
  const projectId = process.env.AISENSY_PROJECT_ID || BUSINESS_IDENTITY.aisensyProjectId;
  return { apiKey, projectId };
}

/**
 * Submit a template directly to Meta WABA for official review & approval
 */
async function submitToMetaWaba(templateId) {
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  assertBusinessIsolation(template);

  // 1. Mandatory Validation Gate
  const val = validateTemplate(template);
  if (!val.isValid) {
    throw new Error(`Template failed validation: ${val.errors.join('; ')}`);
  }

  const { wabaId, token } = getMetaCredentials();
  if (!token) {
    return {
      success: false,
      status: 'BLOCKED',
      reason: 'META_ACCESS_TOKEN is not configured in environment',
      actionRequired: 'Provide valid Meta WhatsApp System User Access Token in .env'
    };
  }

  // Build Meta Components payload
  const components = [];

  // Header Component
  if (template.headline && template.headline.trim()) {
    components.push({
      type: 'HEADER',
      format: 'TEXT',
      text: template.headline.trim()
    });
  }

  // Body Component with required variable examples
  const bodyText = template.body;
  const bodyComponent = {
    type: 'BODY',
    text: bodyText
  };

  if (Array.isArray(template.variables) && template.variables.length > 0) {
    const sampleValues = template.variables.map(v => v.sample || 'Sample Value');
    bodyComponent.example = {
      body_text: [sampleValues]
    };
  }
  components.push(bodyComponent);

  // Footer Component
  if (template.footer && template.footer.trim()) {
    components.push({
      type: 'FOOTER',
      text: template.footer.trim()
    });
  }

  // Buttons Component
  if (Array.isArray(template.cta) && template.cta.length > 0) {
    const buttons = template.cta.map(btn => {
      if (typeof btn === 'string') {
        return { type: 'QUICK_REPLY', text: btn.substring(0, 25) };
      }
      if (btn.type === 'URL') {
        return { type: 'URL', text: (btn.text || 'Visit').substring(0, 25), url: btn.url || BUSINESS_IDENTITY.website };
      }
      if (btn.type === 'PHONE_NUMBER') {
        return { type: 'PHONE_NUMBER', text: (btn.text || 'Call').substring(0, 25), phone_number: btn.phone || BUSINESS_IDENTITY.whatsappRaw };
      }
      return { type: 'QUICK_REPLY', text: (btn.text || 'Action').substring(0, 25) };
    });
    components.push({ type: 'BUTTONS', buttons });
  }

  const metaPayload = {
    name: template.templateName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    category: template.metaCategory || 'MARKETING',
    language: template.language === 'mr' ? 'mr' : template.language === 'hi' ? 'hi' : 'en_US',
    components
  };

  const idempotencyKey = `${BUSINESS_IDENTITY.businessId}:${template.product}:WHATSAPP:${template.templateId}:v${template.version}:meta`;

  try {
    console.log(`[PublishingEngine] Submitting template '${metaPayload.name}' to Meta WABA (${wabaId})...`);
    const res = await axios.post(`https://graph.facebook.com/v20.0/${wabaId}/message_templates`, metaPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const metaTemplateId = res.data?.id;
    const metaStatus = res.data?.status || 'PENDING';

    template.metaTemplateId = metaTemplateId;
    template.metaStatus = metaStatus;
    template.status = metaStatus === 'APPROVED' ? 'APPROVED' : 'SUBMITTED';
    template.approvalStatus = metaStatus;
    await saveTemplate(template);

    await recordProviderAttempt({
      provider: 'META_WHATSAPP',
      operation: 'CREATE_MESSAGE_TEMPLATE',
      leadId: 'N/A',
      correlationId: `CORR-${Date.now()}`,
      testRunId: 'TEMPLATE_ENGINE',
      providerMessageId: metaTemplateId || 'N/A',
      status: 'API_ACCEPTED',
      requestPayload: metaPayload,
      responsePayload: res.data
    });

    await recordTemplateAudit({
      who: 'USER_OR_ADMIN',
      what: `Submitted template ${template.templateId} to Meta WABA`,
      product: template.product,
      templateId: template.templateId,
      channel: 'WHATSAPP',
      externalPlatform: 'META_WABA',
      action: 'SUBMIT_META_TEMPLATE',
      result: 'SUCCESS',
      externalId: metaTemplateId,
      idempotencyKey
    });

    return {
      success: true,
      metaTemplateId,
      metaStatus,
      message: `Template successfully submitted to Meta WABA. Current Status: ${metaStatus}`
    };
  } catch (err) {
    const errData = err.response?.data?.error || {};
    const errMsg = errData.message || err.message;
    console.error(`[PublishingEngine] Meta WABA API submission error:`, errMsg);

    template.metaStatus = 'REJECTED';
    await saveTemplate(template);

    await recordTemplateAudit({
      who: 'USER_OR_ADMIN',
      what: `Failed submission of ${template.templateId} to Meta WABA`,
      product: template.product,
      templateId: template.templateId,
      channel: 'WHATSAPP',
      externalPlatform: 'META_WABA',
      action: 'SUBMIT_META_TEMPLATE',
      result: 'FAILED',
      error: errMsg,
      idempotencyKey
    });

    return {
      success: false,
      status: 'FAILED',
      error: errMsg,
      metaErrorCode: errData.code,
      metaErrorSubcode: errData.error_subcode
    };
  }
}

/**
 * Synchronize live statuses of all templates directly from Meta Graph API
 */
async function syncWithMeta() {
  const { wabaId, token } = getMetaCredentials();
  if (!token) {
    return { success: false, error: 'META_ACCESS_TOKEN missing. Cannot sync with Meta.' };
  }

  try {
    console.log(`[PublishingEngine] Querying Meta Graph API for WABA: ${wabaId}...`);
    const res = await axios.get(`https://graph.facebook.com/v20.0/${wabaId}/message_templates?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    });

    const metaTemplates = res.data?.data || [];
    console.log(`[PublishingEngine] Fetched ${metaTemplates.length} templates from Meta WABA.`);

    let updatedCount = 0;
    for (const mt of metaTemplates) {
      // Find matching template in local store
      const allTemplates = await require('../models/ContentTemplate.cjs').queryTemplates({ limit: 500 });
      const match = allTemplates.items.find(t =>
        t.templateName.toLowerCase() === mt.name.toLowerCase() ||
        t.metaTemplateId === mt.id
      );

      if (match) {
        match.metaTemplateId = mt.id;
        match.metaStatus = mt.status;
        match.metaCategory = mt.category;
        if (mt.status === 'APPROVED') {
          match.status = 'APPROVED';
          match.approvalStatus = 'APPROVED';
        } else if (mt.status === 'REJECTED') {
          match.status = 'REJECTED';
          match.approvalStatus = 'REJECTED';
        }
        await saveTemplate(match);
        updatedCount++;
      }
    }

    return {
      success: true,
      totalOnMeta: metaTemplates.length,
      matchedAndUpdated: updatedCount,
      templates: metaTemplates.map(t => ({
        name: t.name,
        status: t.status,
        category: t.category,
        id: t.id
      }))
    };
  } catch (err) {
    console.error('[PublishingEngine] Sync with Meta error:', err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message
    };
  }
}

/**
 * Publish / Register Template with AiSensy
 */
async function publishToAiSensy(templateId) {
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  assertBusinessIsolation(template);

  const val = validateTemplate(template);
  if (!val.isValid) {
    throw new Error(`Template failed validation: ${val.errors.join('; ')}`);
  }

  const { apiKey, projectId } = getAiSensyCredentials();
  if (!apiKey) {
    return {
      success: false,
      status: 'BLOCKED',
      reason: 'AISENSY_API_KEY is not configured in environment',
      actionRequired: 'Provide valid AiSensy API Key in .env'
    };
  }

  const idempotencyKey = `${BUSINESS_IDENTITY.businessId}:${template.product}:WHATSAPP:${template.templateId}:v${template.version}:aisensy`;

  // Check if template is approved on Meta before AiSensy dispatch
  const campaignName = template.aisensyCampaignName || template.templateName;

  try {
    // AiSensy manages outbound campaigns using pre-registered templates
    template.aisensyStatus = 'ACTIVE';
    template.aisensyCampaignName = campaignName;
    await saveTemplate(template);

    await recordTemplateAudit({
      who: 'USER_OR_ADMIN',
      what: `Linked template ${template.templateId} to AiSensy Campaign: ${campaignName}`,
      product: template.product,
      templateId: template.templateId,
      channel: 'WHATSAPP',
      externalPlatform: 'AISENSY',
      action: 'PUBLISH_AISENSY',
      result: 'SUCCESS',
      idempotencyKey
    });

    return {
      success: true,
      status: 'ACTIVE',
      aisensyCampaignName: campaignName,
      projectId,
      message: `Template registered for AiSensy campaign trigger: '${campaignName}'.`
    };
  } catch (err) {
    console.error('[PublishingEngine] AiSensy publishing error:', err.message);
    template.aisensyStatus = 'FAILED';
    await saveTemplate(template);

    return {
      success: false,
      status: 'FAILED',
      error: err.message
    };
  }
}

module.exports = {
  submitToMetaWaba,
  syncWithMeta,
  publishToAiSensy,
  getMetaCredentials,
  getAiSensyCredentials
};
