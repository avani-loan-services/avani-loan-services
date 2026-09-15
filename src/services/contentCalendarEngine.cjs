// src/services/contentCalendarEngine.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — 30-Day Product Content Calendar & Multi-Format Exporter
// ─────────────────────────────────────────────────────────────────

const { PRODUCTS_CATALOG, ALL_PRODUCT_KEYS } = require('../config/productsCatalog.cjs');
const { BUSINESS_IDENTITY } = require('../config/businessIdentity.cjs');

/**
 * Generate a 30-Day Content Calendar for a specific loan product or all products
 */
function generate30DayCalendar(productId = 'ALL', startDate = new Date()) {
  const targetProducts = productId === 'ALL' ? ALL_PRODUCT_KEYS : [productId];
  const calendarEntries = [];

  targetProducts.forEach(pKey => {
    const product = PRODUCTS_CATALOG[pKey];
    if (!product) return;

    for (let day = 1; day <= 30; day++) {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + (day - 1));
      const dateStr = scheduledDate.toISOString().split('T')[0];

      // Determine rotation strategy
      let channel, contentType, language, topic, cta;
      const langCycle = ['mr', 'en', 'hi'][(day - 1) % 3];

      if (day % 4 === 1) {
        channel = 'WHATSAPP';
        contentType = 'WHATSAPP_TEMPLATE';
        language = langCycle;
        topic = `Day ${day}: ${product.name} Pre-Approval & Eligibility Checklist`;
        cta = 'Check Eligibility';
      } else if (day % 4 === 2) {
        channel = 'INSTAGRAM';
        contentType = 'VIDEO_SCRIPT';
        language = langCycle;
        topic = `Day ${day}: 20-Second Short Reel on ${product.name} Benefits`;
        cta = 'Connect on WhatsApp';
      } else if (day % 4 === 3) {
        channel = 'LINKEDIN';
        contentType = 'TEXT';
        language = 'en';
        topic = `Day ${day}: Comprehensive Guide to ${product.name} Documentation & FOIR`;
        cta = 'Talk to an Advisor';
      } else {
        channel = 'WHATSAPP_STATUS';
        contentType = 'IMAGE_PROMPT';
        language = langCycle;
        topic = `Day ${day}: Transparent Rate Comparison & Advisory Spotlight`;
        cta = 'Visit avanifinserv.com';
      }

      calendarEntries.push({
        calendarId: `CAL-${product.code}-DAY-${String(day).padStart(2, '0')}`,
        dayNumber: day,
        date: dateStr,
        scheduledTime: '10:30 AM IST',
        product: pKey,
        productName: product.name,
        channel,
        contentType,
        language,
        topic,
        headline: `${product.name} Spotlight: ${topic}`,
        cta,
        campaign: `${product.slug}_30day_campaign`,
        status: 'PLANNED',
        publishingStatus: 'UNPUBLISHED',
        templateId: `ALS-${product.code}-${channel.substring(0, 2)}-D${day}-${language.toUpperCase()}-V1`,
        imagePromptRef: `ALS-${product.code}-IMG-C01-SQUARE-V1`,
        videoScriptRef: `ALS-${product.code}-VID-REEL-01-${language.toUpperCase()}`
      });
    }
  });

  return calendarEntries;
}

/**
 * Export templates or calendar entries to CSV format
 */
function convertToCSV(items = []) {
  if (!items || items.length === 0) return '';

  const headers = [
    'templateId', 'businessId', 'product', 'channel', 'contentType',
    'language', 'headline', 'body', 'cta', 'status', 'metaStatus', 'aisensyStatus'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = items.map(t => {
    return headers.map(h => escapeCSV(t[h])).join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Export calendar to Excel-compatible CSV
 */
function convertCalendarToCSV(calendar = []) {
  if (!calendar || calendar.length === 0) return '';

  const headers = [
    'calendarId', 'dayNumber', 'date', 'scheduledTime', 'product', 'productName',
    'channel', 'contentType', 'language', 'topic', 'headline', 'cta', 'status', 'campaign'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = calendar.map(item => {
    return headers.map(h => escapeCSV(item[h])).join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

module.exports = {
  generate30DayCalendar,
  convertToCSV,
  convertCalendarToCSV,
  exportCalendarToCSV: convertCalendarToCSV
};

