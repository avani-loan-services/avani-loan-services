// src/services/aisensyAdapter.cjs
// ─────────────────────────────────────────────────────────────────
// AiSensy WABA WhatsApp Adapter
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');

const AISENSY_API_URL = process.env.AISENSY_API_URL || 'https://backend.aisensy.com/campaign/t1/api/v2';
const AISENSY_API_KEY = process.env.AISENSY_API_KEY || 'PLACEHOLDER_AISENSY_KEY';

/**
 * Send WABA WhatsApp Template Message via AiSensy
 */
async function sendWhatsAppTemplate({ destination, campaignName, templateParams = [], mediaUrl = null }) {
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: campaignName,
      destination: String(destination).replace(/[^0-9]/g, ''),
      userName: templateParams[0] || 'Valued Customer',
      templateParams: templateParams
    };

    if (mediaUrl) payload.media = { url: mediaUrl };

    if (AISENSY_API_KEY.includes('PLACEHOLDER')) {
      console.log(`[AiSensyAdapter Mock] WABA Message dispatched to ${destination}: Campaign ${campaignName}`, templateParams);
      return { success: true, mock: true, payload };
    }

    const res = await axios.post(AISENSY_API_URL, payload, { timeout: 10000 });
    console.log(`[AiSensyAdapter] Message sent successfully to ${destination}:`, res.status);
    return { success: true, data: res.data };
  } catch (err) {
    console.warn(`[AiSensyAdapter] Delivery failed for ${destination} (non-fatal):`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendWhatsAppTemplate
};
