const axios = require('axios');
const { syncToHubSpot } = require('../utils/hubSpot.cjs');

/**
 * Sync lead data to AVANI AI CRM.
 * It also falls back to HubSpot sync if configured.
 * 
 * Expected payload:
 * { name, phone, email, source, campaign, product, timestamp, device, utm_source, utm_medium, ... }
 */
async function syncToCrm(payload) {
  try {
    const crmWebhookUrl = process.env.AVANI_CRM_WEBHOOK_URL;
    
    // Sync to custom AVANI AI CRM Webhook if provided
    if (crmWebhookUrl) {
      await axios.post(crmWebhookUrl, {
        leadDetails: {
          name: payload.name || '',
          phone: payload.phone || '',
          email: payload.email || '',
        },
        metadata: {
          source: payload.source || 'Website',
          campaign: payload.campaign || 'Organic',
          product: payload.product || payload.loanType || '',
          timestamp: payload.timestamp || new Date().toISOString(),
          device: payload.device || 'Unknown',
          utmParameters: {
            utm_source: payload.utm_source || '',
            utm_medium: payload.utm_medium || '',
            utm_campaign: payload.utm_campaign || ''
          }
        }
      });
      console.log('[CRM] Successfully synced to AVANI AI CRM.');
    } else {
      console.log('[CRM] AVANI_CRM_WEBHOOK_URL not set. Skipping primary CRM sync.');
    }

    // Fallback sync to HubSpot
    await syncToHubSpot(payload);

  } catch (error) {
    console.error('[CRM] Failed to sync to CRM:', error.message);
  }
}

module.exports = { syncToCrm };
