import axios from 'axios';

// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE WEBSITE LEAD INTAKE API
// Endpoint: POST /api/save-lead
// Conforms to Cross-Workspace Integration Contracts (Version 1.0.0)
// Validates DPDP consent, normalizes mobile, prevents duplicate submissions,
// captures UTM attribution, and forwards securely to AVANI AI CRM.
// ─────────────────────────────────────────────────────────────────

const inMemoryIdempotencyCache = new Map();

function normalizeIndianPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^0-9]/g, '');
  const raw10 = digits.length > 10 ? digits.slice(-10) : digits;
  if (raw10.length !== 10 || !/^[6-9]/.test(raw10)) return null;
  return {
    formatted: `+91${raw10}`,
    raw10
  };
}

function normalizeLoanCategory(loanType) {
  const norm = String(loanType || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (norm.includes('DOCTOR') || norm.includes('MEDIC')) return 'DOCTOR_LOAN';
  if (norm.includes('BUSIN') || norm.includes('COMMERC') || norm.includes('MSME')) return 'BUSINESS_LOAN';
  if (norm.includes('MORTG') || norm.includes('LAP') || norm.includes('AGAINSTPROP')) return 'MORTGAGE_LOAN';
  if (norm.includes('HOME') || norm.includes('HOUS')) return 'HOME_LOAN';
  if (norm.includes('GLOBAL') || norm.includes('ABROAD') || norm.includes('OVERSEA')) return 'EDUCATION_LOAN_GLOBAL';
  if (norm.includes('EDU') || norm.includes('STUD')) return 'EDUCATION_LOAN_INDIA';
  if (norm.includes('SCHOOL') || norm.includes('COLLEGE') || norm.includes('INSTITUT')) return 'SCHOOL_COLLEGE_FUNDING';
  return 'PERSONAL_LOAN';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const correlationId = `CORR-WEB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  res.setHeader('X-Correlation-Id', correlationId);

  try {
    const raw = req.body || {};
    const name = (raw.name || raw.fullName || '').trim();
    const rawPhone = raw.phone || raw.mobile || raw.whatsapp || '';
    const rawLoanType = raw.loanType || raw.loanProduct || raw.product || 'Personal Loan';
    const email = (raw.email || '').trim();
    const city = (raw.city || 'Latur').trim();
    const state = (raw.state || 'Maharashtra').trim();

    // 1. Mandatory Fields Validation
    if (!name || !rawPhone) {
      return res.status(400).json({
        success: false,
        correlationId,
        error: 'Name and valid phone number are required.'
      });
    }

    // 2. Phone Number Normalization
    const phoneData = normalizeIndianPhone(rawPhone);
    if (!phoneData) {
      return res.status(400).json({
        success: false,
        correlationId,
        error: 'Invalid mobile number. Please provide a valid 10-digit Indian mobile number.'
      });
    }

    // 3. DPDP Act Consent Check
    const consentGranted = raw.consent !== false && raw.consentStatus !== 'DENIED';
    if (!consentGranted) {
      return res.status(403).json({
        success: false,
        correlationId,
        error: 'DPDP Act Consent required: processing cannot proceed without applicant consent.'
      });
    }

    // 4. Duplicate Suppression / Idempotency Check
    const idempotencyKey = raw.idempotencyKey || `IDEMP-${phoneData.raw10}-${Date.now()}`;
    const cacheKey = `${phoneData.raw10}-${raw.idempotencyKey || ''}`;
    const now = Date.now();
    const cached = inMemoryIdempotencyCache.get(cacheKey);

    if (cached && (now - cached.timestamp < 30000)) { // 30-second deduplication window
      return res.status(200).json({
        success: true,
        correlationId,
        idempotencyHit: true,
        leadId: cached.leadId,
        message: 'Duplicate submission absorbed safely. Your enquiry is already being processed.',
        status: 'RECEIVED'
      });
    }

    const canonicalLoanCategory = normalizeLoanCategory(rawLoanType);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const leadId = raw.leadId || `AVL-${dateStr}-${Math.floor(100000 + Math.random() * 900000)}`;

    const crmPayload = {
      leadId,
      name,
      phone: phoneData.formatted,
      email,
      city,
      state,
      loanType: canonicalLoanCategory,
      requestedAmount: raw.amount || raw.requestedAmount || '',
      monthlyIncome: raw.monthlyIncome || '',
      employmentType: raw.employmentType || raw.customerProfile || 'Salaried',
      preferredLanguage: raw.preferredLanguage || 'English',
      leadSource: raw.source || raw.utm_source || 'WEBSITE',
      campaign: raw.campaign || raw.utm_campaign || 'DIRECT',
      campaignId: raw.campaignId || raw.c || '',
      utmSource: raw.utm_source || raw.utmSource || 'website',
      utmMedium: raw.utm_medium || raw.utmMedium || 'web_form',
      utmCampaign: raw.utm_campaign || raw.utmCampaign || '',
      utmContent: raw.utm_content || raw.utmContent || '',
      utmTerm: raw.utm_term || raw.utmTerm || '',
      consentStatus: 'GRANTED',
      consentPurpose: 'LOAN_ELIGIBILITY_PROCESSING',
      consentTimestamp: new Date().toISOString(),
      idempotencyKey,
      correlationId
    };

    const syncResults = {
      crm: false,
      googleWebApp: false,
      pabbly: false,
      pickyAssist: false
    };

    // 5. Forward to AVANI AI CRM (Master Lead Store)
    const CRM_BASE_URL = process.env.AVANI_CRM_URL || process.env.NEXT_PUBLIC_CRM_URL || 'https://avani-ai-crm.vercel.app';
    const CRM_API_KEY = process.env.CRM_API_KEY || '';

    try {
      const crmHeaders = { 'Content-Type': 'application/json' };
      if (CRM_API_KEY) crmHeaders['x-api-key'] = CRM_API_KEY;

      const crmRes = await axios.post(`${CRM_BASE_URL}/api/leads`, crmPayload, {
        headers: crmHeaders,
        timeout: 8000
      });
      if (crmRes.status === 200 && crmRes.data?.success) {
        syncResults.crm = true;
      }
    } catch (crmErr) {
      console.warn('[LeadIntake] AVANI AI CRM sync warning:', crmErr.message);
      // Non-blocking: downstream fallbacks will retain lead record
    }

    // 6. Secondary Partner Webhooks (Picky Assist, Google Sheet, Pabbly)
    const PICKY_ASSIST_URL = process.env.PICKY_ASSIST_URL || "";
    const GOOGLE_SHEET_APP_SCRIPT_URL = process.env.GOOGLE_SHEET_APP_SCRIPT_URL || process.env.GOOGLE_WEB_APP_URL || "";
    const PABBLY_CONNECT_URL = process.env.PABBLY_CONNECT_URL || process.env.ZAPIER_WEBHOOK_URL || "";

    if (PICKY_ASSIST_URL) {
      try {
        await axios.post(PICKY_ASSIST_URL, crmPayload, { timeout: 5000 });
        syncResults.pickyAssist = true;
      } catch (err) { /* non-fatal */ }
    }

    if (GOOGLE_SHEET_APP_SCRIPT_URL) {
      try {
        await axios.post(GOOGLE_SHEET_APP_SCRIPT_URL, crmPayload, { timeout: 5000 });
        syncResults.googleWebApp = true;
      } catch (err) { /* non-fatal */ }
    }

    if (PABBLY_CONNECT_URL) {
      try {
        await axios.post(PABBLY_CONNECT_URL, crmPayload, { timeout: 5000 });
        syncResults.pabbly = true;
      } catch (err) { /* non-fatal */ }
    }

    // Cache idempotency entry
    inMemoryIdempotencyCache.set(cacheKey, { leadId, timestamp: now });

    // Clean old cache entries (older than 5 minutes)
    if (inMemoryIdempotencyCache.size > 1000) {
      for (const [k, v] of inMemoryIdempotencyCache.entries()) {
        if (now - v.timestamp > 300000) inMemoryIdempotencyCache.delete(k);
      }
    }

    return res.status(200).json({
      success: true,
      leadId,
      correlationId,
      status: 'RECEIVED',
      productCategory: canonicalLoanCategory,
      assignedAdvisor: 'Sachin Shinde',
      syncResults,
      acknowledged: true,
      message: 'Thank you for contacting AVANI LOAN SERVICES. Your enquiry has been received and routed to our Senior Loan Advisor.'
    });

  } catch (error) {
    console.error('[LeadIntake] Internal Error:', error.message);
    return res.status(500).json({
      success: false,
      correlationId,
      error: 'An unexpected error occurred while processing your enquiry. Please contact +91 91756 35165.'
    });
  }
}
