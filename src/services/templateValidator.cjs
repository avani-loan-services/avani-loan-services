// src/services/templateValidator.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Production Template & Compliance Validator
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY, AGRO_CONTAMINATION_TERMS, checkBusinessIsolation } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG } = require('../config/productsCatalog.cjs');

// Strict list of prohibited misleading or unverified financial claims
const PROHIBITED_FINANCIAL_CLAIMS = [
  'guaranteed loan approval',
  'guaranteed sanction',
  '100% approval',
  '100% sanction',
  'instant guaranteed loan',
  'zero documentation guaranteed',
  'increase cibil by',
  'guaranteed cibil improvement',
  'guaranteed loan approval after cibil',
  'guaranteed interest rate',
  'guaranteed cash',
  'zero credit check'
];

/**
 * Perform comprehensive validation on a template object
 */
function validateTemplate(template) {
  const errors = [];
  const warnings = [];

  if (!template) {
    return { isValid: false, errors: ['Template object is required'], warnings: [] };
  }

  // 1. Hard Tenant & Business Isolation Check
  const isolationCheck = checkBusinessIsolation(template);
  if (!isolationCheck.valid) {
    errors.push(`Tenant isolation violation: ${isolationCheck.error}`);
  }

  if (template.businessId && template.businessId !== BUSINESS_IDENTITY.businessId) {
    errors.push(`Invalid businessId: '${template.businessId}'. Must be '${BUSINESS_IDENTITY.businessId}'.`);
  }

  // 2. Product Validation
  if (!template.product) {
    errors.push('Template missing product association.');
  } else if (!PRODUCTS_CATALOG[template.product]) {
    errors.push(`Invalid product '${template.product}'. Must be one of the 10 approved AVANI loan products.`);
  }

  // 3. Channel Validation
  const validChannels = ['WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP_STATUS', 'WEBSITE', 'EMAIL'];
  if (!template.channel || !validChannels.includes(template.channel)) {
    errors.push(`Invalid channel '${template.channel}'. Allowed: ${validChannels.join(', ')}.`);
  }

  // 4. Language Validation
  const validLanguages = ['mr', 'en', 'hi'];
  if (!template.language || !validLanguages.includes(template.language)) {
    errors.push(`Invalid language '${template.language}'. Allowed: mr, en, hi.`);
  }

  // 5. Template Name Validation
  if (!template.templateName || typeof template.templateName !== 'string' || template.templateName.trim().length === 0) {
    errors.push('Template name is required.');
  } else if (template.channel === 'WHATSAPP') {
    // Meta naming requirements: lowercase letters, numbers, and underscores only
    if (!/^[a-z0-9_]+$/.test(template.templateName)) {
      errors.push(`Meta WhatsApp templateName '${template.templateName}' must only contain lowercase alphanumeric characters and underscores.`);
    }
    if (template.templateName.length > 512) {
      errors.push('Template name exceeds Meta maximum length (512 characters).');
    }
  }

  // 6. Body Content Validation
  const bodyText = template.body || '';
  if (!bodyText || bodyText.trim().length === 0) {
    errors.push('Template body text is required.');
  } else {
    // Length checks per channel
    if (template.channel === 'WHATSAPP') {
      if (bodyText.length > 1024) {
        errors.push(`WhatsApp template body exceeds Meta limit (1024 characters). Current length: ${bodyText.length}.`);
      }
    } else if (template.channel === 'WHATSAPP_STATUS') {
      if (bodyText.length > 700) {
        warnings.push(`WhatsApp Status text is recommended to be under 700 characters. Current: ${bodyText.length}.`);
      }
    }

    // 7. Prohibited Financial Claims Scan
    const lowerBody = bodyText.toLowerCase();
    for (const claim of PROHIBITED_FINANCIAL_CLAIMS) {
      if (lowerBody.includes(claim)) {
        errors.push(`Prohibited financial claim detected: "${claim}". Ensure compliant wording such as 'Eligibility depends on lender assessment'.`);
      }
    }

    // 8. Agro Foods Contamination Deep Scan
    for (const agroTerm of AGRO_CONTAMINATION_TERMS) {
      if (lowerBody.includes(agroTerm)) {
        errors.push(`Agro Foods contamination detected: "${agroTerm}". Templates must strictly refer to AVANI LOAN SERVICES.`);
      }
    }
  }

  // 9. WhatsApp Header & Footer Lengths
  if (template.channel === 'WHATSAPP') {
    if (template.headline && template.headline.length > 60) {
      errors.push(`WhatsApp header text exceeds 60 characters (current: ${template.headline.length}).`);
    }
    if (template.footer && template.footer.length > 60) {
      errors.push(`WhatsApp footer text exceeds 60 characters (current: ${template.footer.length}).`);
    }
  }

  // 10. WhatsApp Variable Syntax Validation
  if (template.channel === 'WHATSAPP' && bodyText) {
    const varMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const varNumbers = varMatches.map(m => parseInt(m.replace(/[\{\}]/g, ''), 10));

    // Check for named variables which are invalid for Meta API templates
    const namedVars = bodyText.match(/\{\{([a-zA-Z_]+)\}\}/g) || [];
    if (namedVars.length > 0) {
      errors.push(`Meta WhatsApp templates require numeric variables {{1}}, {{2}}, etc. Found named variable: ${namedVars.join(', ')}.`);
    }

    // Check for sequential variable numbering: 1, 2, 3...
    if (varNumbers.length > 0) {
      const sorted = [...new Set(varNumbers)].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] !== i + 1) {
          errors.push(`WhatsApp template variable numbering must be sequential starting at {{1}}. Missing {{${i + 1}}}.`);
          break;
        }
      }
    }
  }

  // 11. Interactive Buttons Check
  if (template.channel === 'WHATSAPP' && Array.isArray(template.cta)) {
    if (template.cta.length > 10) {
      errors.push('WhatsApp template cannot exceed 10 buttons.');
    }
    template.cta.forEach((btn, idx) => {
      const btnText = typeof btn === 'string' ? btn : (btn.text || '');
      if (!btnText) {
        errors.push(`Button at index ${idx} is missing text.`);
      } else if (btnText.length > 25) {
        errors.push(`Button '${btnText}' exceeds Meta button limit (25 characters).`);
      }
    });
  }

  // 12. Contact Details & Brand Alignment Verification
  const fullContentStr = JSON.stringify(template).toLowerCase();
  // Check that if any phone number is explicitly mentioned in copy, it matches Avani
  const phoneMatches = fullContentStr.match(/(?:\+91|91)?[6-9]\d{9}/g) || [];
  for (const phone of phoneMatches) {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean !== '919175635165' && clean !== '9175635165' && clean !== '9175635165') {
      warnings.push(`Unrecognized phone number detected: ${phone}. Avani Loan Services official WhatsApp is +91 91756 35165.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    checkedAt: new Date().toISOString()
  };
}

/**
 * Agro Foods Contamination Scanner (standalone testable scanner)
 */
function scanAgroContamination(content) {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const lower = text.toLowerCase();
  const detected = [];

  for (const term of AGRO_CONTAMINATION_TERMS) {
    if (lower.includes(term)) {
      detected.push(term);
    }
  }

  return {
    passed: detected.length === 0,
    detectedTerms: detected,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  validateTemplate,
  scanAgroContamination,
  PROHIBITED_FINANCIAL_CLAIMS
};
