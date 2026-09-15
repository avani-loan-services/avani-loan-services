// src/config/businessIdentity.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — STRICT BUSINESS & TENANT IDENTITY HARD LOCK
// ─────────────────────────────────────────────────────────────────

const BUSINESS_IDENTITY = Object.freeze({
  businessId: 'avani-loan-services',
  businessName: 'AVANI LOAN SERVICES',
  founder: 'Sachin Shinde',
  industry: 'Financial Services | Loan Consultancy | Loan Advisory',
  website: 'https://www.avanifinserv.com/',
  websiteShort: 'avanifinserv.com',
  documentsUrl: 'https://www.avanifinserv.com/documents',
  email: 'enquiry@avanifinserv.com',
  whatsappBusiness: '+91 91756 35165',
  whatsappRaw: '919175635165',
  office: 'Old Barshi Road, 5 no chauk, Kulswamini Nagar, Next to Sai School, Latur – 413512, Maharashtra, India',
  city: 'Latur',
  state: 'Maharashtra',
  pincode: '413512',
  country: 'India',
  metaWabaId: '1062614709598311',
  metaPhoneId: '1147494668457940',
  aisensyProjectId: '6a670f94d0c39f57eaa6799f'
});

// Prohibited Agro Foods contamination keywords (Case-insensitive check)
const AGRO_CONTAMINATION_TERMS = [
  'avani agro',
  'agro foods',
  'moringa',
  'spices',
  'ingredients',
  'bulk buyers',
  'private label',
  'usa agro',
  'uk agro',
  'uae agro',
  'agro export',
  'avaniagro',
  'agro trade'
];

/**
 * Validates tenant isolation. Throws if invalid businessId or contaminated data is detected.
 */
function assertBusinessIsolation(data) {
  if (!data) return true;

  const targetBusinessId = data.businessId || data.business_id;
  if (targetBusinessId && targetBusinessId !== BUSINESS_IDENTITY.businessId) {
    throw new Error(`[TENANT VIOLATION] Rejected operation for unauthorized businessId: '${targetBusinessId}'. Expected '${BUSINESS_IDENTITY.businessId}'.`);
  }

  // Deep scan stringified content for Agro contamination
  const textToCheck = typeof data === 'string' ? data : JSON.stringify(data);
  const lowerText = textToCheck.toLowerCase();

  for (const term of AGRO_CONTAMINATION_TERMS) {
    if (lowerText.includes(term)) {
      throw new Error(`[CONTAMINATION DETECTED] Payload contains prohibited Agro Foods keyword: '${term}'. Operation rejected.`);
    }
  }

  return true;
}

/**
 * Safe boolean checker without throwing
 */
function checkBusinessIsolation(data) {
  try {
    assertBusinessIsolation(data);
    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

module.exports = {
  BUSINESS_IDENTITY,
  AGRO_CONTAMINATION_TERMS,
  assertBusinessIsolation,
  checkBusinessIsolation
};
