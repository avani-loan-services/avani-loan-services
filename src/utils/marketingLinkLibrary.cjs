// src/utils/marketingLinkLibrary.cjs
// ─────────────────────────────────────────────────────────────────
// Complete Marketing Link & Tracking URL Generator for AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const BASE_WEBSITE_URL = 'https://www.avanifinserv.com/contact';
const BASE_WHATSAPP_NUM = '919175635165';

const PRODUCTS = [
  { id: 'personal', name: 'Personal / Salary Loan', code: 'PERSONAL', waMsg: 'Hello AVANI LOAN SERVICES, I want to check my eligibility for a Personal Loan.' },
  { id: 'business', name: 'Business Loan', code: 'BUSINESS', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss a Business Loan for my firm.' },
  { id: 'doctor', name: 'Doctor Loan', code: 'DOCTOR', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss Doctor Professional Loan options.' },
  { id: 'home', name: 'Home Loan', code: 'HOME', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss Home Loan options.' },
  { id: 'mortgage', name: 'Mortgage / Loan Against Property', code: 'MORTGAGE', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss Mortgage / Loan Against Property options.' },
  { id: 'edu_india', name: 'Education Loan – India', code: 'EDU_INDIA', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss Education Loan options for studies in India.' },
  { id: 'edu_global', name: 'Education Loan – Global Studies', code: 'EDU_GLOBAL', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss Study Abroad Education Loan options.' },
  { id: 'school', name: 'School Funding', code: 'SCHOOL', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss School Infrastructure Funding options.' },
  { id: 'college', name: 'College Funding', code: 'COLLEGE', waMsg: 'Hello AVANI LOAN SERVICES, I want to discuss College & University Funding options.' },
  { id: 'cibil', name: 'CIBIL Improvement Consultation', code: 'CIBIL', waMsg: 'Hello AVANI LOAN SERVICES, I need expert advice to improve my CIBIL Score.' }
];

const PLATFORMS = [
  { platform: 'Facebook', source: 'facebook', medium: 'paid_social', purpose: 'Facebook Ads & Page CTA' },
  { platform: 'Instagram', source: 'instagram', medium: 'social', purpose: 'Instagram Bio, Reels & Stories' },
  { platform: 'WhatsApp', source: 'whatsapp', medium: 'referral', purpose: 'WhatsApp Broadcasts & Status CTAs' },
  { platform: 'Google Ads', source: 'google', medium: 'cpc', purpose: 'Google Search & Display Campaigns' },
  { platform: 'LinkedIn', source: 'linkedin', medium: 'social', purpose: 'LinkedIn Business & Executive Posts' },
  { platform: 'YouTube', source: 'youtube', medium: 'video', purpose: 'YouTube Video Descriptions' },
  { platform: 'Website', source: 'website', medium: 'cta', purpose: 'Direct Website Forms' },
  { platform: 'QR Code', source: 'qr', medium: 'offline', purpose: 'Office Desk, Pamphlets & Visiting Cards' },
  { platform: 'Referral', source: 'referral', medium: 'word_of_mouth', purpose: 'DSA & Client Referrals' }
];

/**
 * Generate product specific WhatsApp link
 */
function getWhatsAppProductLink(productCode = 'PERSONAL') {
  const prod = PRODUCTS.find(p => p.code === productCode || p.id === productCode) || PRODUCTS[0];
  const encodedText = encodeURIComponent(prod.waMsg);
  return `https://wa.me/${BASE_WHATSAPP_NUM}?text=${encodedText}`;
}

/**
 * Generate full tracking link with UTM parameters
 */
function generateTrackingUrl({ source = 'facebook', medium = 'social', campaign = 'ALS_AUG_2026', content = 'general', product = 'Personal Loan' }) {
  const cleanProduct = encodeURIComponent(product);
  return `${BASE_WEBSITE_URL}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${content}&product=${cleanProduct}`;
}

/**
 * Generate complete Link Library Table for reporting & marketing dispatch
 */
function getCompleteLinkLibrary() {
  const links = [];

  PLATFORMS.forEach(p => {
    PRODUCTS.forEach(prod => {
      const campaignName = `ALS_${prod.code}_AUG_2026`;
      const trackingUrl = generateTrackingUrl({
        source: p.source,
        medium: p.medium,
        campaign: campaignName,
        content: `${prod.id}_cta`,
        product: prod.name
      });
      const waLink = getWhatsAppProductLink(prod.code);

      links.push({
        platform: p.platform,
        product: prod.name,
        campaign: campaignName,
        purpose: p.purpose,
        trackingUrl: trackingUrl,
        whatsAppUrl: waLink
      });
    });
  });

  return links;
}

module.exports = {
  PRODUCTS,
  PLATFORMS,
  getWhatsAppProductLink,
  generateTrackingUrl,
  getCompleteLinkLibrary
};
