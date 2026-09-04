// src/utils/whatsappHelper.js
// ─────────────────────────────────────────────────────────────────
// Centralized Reusable WhatsApp Link Generator for AVANI LOAN SERVICES
// Primary WABA Number: +91 91756 35165 (International format: 919175635165)
// ─────────────────────────────────────────────────────────────────

export const WHATSAPP_NUMBER = '919175635165';
export const PHONE_NUMBER = '+919175635165';
export const DISPLAY_PHONE = '9175635165';

const PRODUCT_MESSAGES = {
  'Personal Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Personal Loan. Please share the required documents.',
  'Salary Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Personal / Salary Loan. Please share the required documents.',
  'Business Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Business Loan. Please share the required documents.',
  'Doctor / Professional Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Doctor / Professional Loan. Please share the required documents.',
  'Doctor Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Doctor / Professional Loan. Please share the required documents.',
  'Chartered Accountant Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Chartered Accountant / Professional Loan. Please share the required documents.',
  'Home Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Home Loan. Please share the required documents.',
  'Mortgage Loan / LAP': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Mortgage Loan / Loan Against Property. Please share the required documents.',
  'Mortgage Loan': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Mortgage Loan / Loan Against Property. Please share the required documents.',
  'Loan Against Property': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Mortgage Loan / Loan Against Property. Please share the required documents.',
  'Education Loan India': 'Hello AVANI LOAN SERVICES, I want the document checklist for an Education Loan in India. Please share the required documents.',
  'Education Loan Global': 'Hello AVANI LOAN SERVICES, I want the document checklist for a Global Education Loan. Please share the required documents.',
  'School Funding': 'Hello AVANI LOAN SERVICES, I want the document checklist for School Funding. Please share the required documents.',
  'College Funding': 'Hello AVANI LOAN SERVICES, I want the document checklist for College Funding. Please share the required documents.',
  'CIBIL Improvement': 'Hello AVANI LOAN SERVICES, I want the document checklist and consultation details for CIBIL improvement / credit correction. Please guide me.',
  'CIBIL Correction': 'Hello AVANI LOAN SERVICES, I want the document checklist and consultation details for CIBIL improvement / credit correction. Please guide me.'
};

/**
 * Generate product-specific WhatsApp link
 */
export function generateWhatsAppDocumentLink(productName = 'Personal Loan') {
  const messageText = PRODUCT_MESSAGES[productName] || `Hello AVANI LOAN SERVICES, I want the document checklist for ${productName}. Please share the required documents.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Generate click tracking payload
 */
export function trackCtaClick(eventName, product = '') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, { product: product });
  }
}
