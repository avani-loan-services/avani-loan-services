// src/services/avaniAiAgent.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI AI AGENT — Gemini Multilingual Extraction & Intent Engine
// ─────────────────────────────────────────────────────────────────

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
const genAI = new GoogleGenerativeAI(apiKey);

function detectLanguage(text) {
  const norm = String(text || '').trim();
  // Marathi / Devanagari keywords
  if (/[\u0900-\u097F]/.test(norm)) {
    if (norm.includes('नमस्कार') || norm.includes('पाहिजे') || norm.includes('उत्पन्न') || norm.includes('हवे')) {
      return 'Marathi';
    }
    return 'Hindi';
  }
  return 'English';
}

function parseAndValidateExtraction(rawOutput) {
  try {
    let cleanJson = rawOutput.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);

    // Schema Validation
    const validated = {
      detectedLanguage: parsed.detectedLanguage || 'Marathi',
      intent: parsed.intent || 'INFORMATION_QUERY',
      extractedFields: {
        fullName: parsed.extractedFields?.fullName || null,
        profession: parsed.extractedFields?.profession || null,
        employmentType: parsed.extractedFields?.employmentType || null,
        monthlyIncome: parsed.extractedFields?.monthlyIncome || null,
        loanProduct: parsed.extractedFields?.loanProduct || null,
        loanAmount: parsed.extractedFields?.loanAmount || null,
        city: parsed.extractedFields?.city || null
      }
    };

    return { isValid: true, data: validated };
  } catch (err) {
    return { isValid: false, error: err.message };
  }
}

/**
 * Heuristic Fallback Extractor (Runs when Gemini API is mock or offline)
 */
function heuristicExtraction(messageText) {
  const text = String(messageText || '');
  const lang = detectLanguage(text);

  const fields = {
    fullName: null,
    profession: null,
    employmentType: null,
    monthlyIncome: null,
    loanProduct: null,
    loanAmount: null,
    city: null
  };

  const lower = text.toLowerCase();

  // Profession extraction
  if (lower.includes('डॉक्टर') || lower.includes('doctor') || lower.includes('dr')) {
    fields.profession = 'DOCTOR';
    fields.employmentType = 'PROFESSIONAL';
    fields.loanProduct = 'DOCTOR_LOAN';
  } else if (lower.includes('ca') || lower.includes('chartered') || lower.includes('सीए')) {
    fields.profession = 'CHARTERED_ACCOUNTANT';
    fields.employmentType = 'PROFESSIONAL';
    fields.loanProduct = 'CA_LOAN';
  } else if (lower.includes('business') || lower.includes('व्यापार')) {
    fields.employmentType = 'BUSINESS_OWNER';
    fields.loanProduct = 'BUSINESS_LOAN';
  } else if (lower.includes('salary') || lower.includes('पगार')) {
    fields.employmentType = 'SALARIED';
    fields.loanProduct = 'PERSONAL_LOAN';
  }

  // Monthly income extraction
  if (lower.includes('1 लाख') || lower.includes('1 lakh') || lower.includes('100000') || lower.includes('1,00,000')) {
    fields.monthlyIncome = '100000';
  } else if (lower.includes('50') || lower.includes('50000')) {
    fields.monthlyIncome = '50000';
  }

  // Loan amount extraction
  if (lower.includes('30 लाख') || lower.includes('30 lakh') || lower.includes('3000000') || lower.includes('30,00,000')) {
    fields.loanAmount = '3000000';
  } else if (lower.includes('50 लाख') || lower.includes('50 lakh') || lower.includes('5000000')) {
    fields.loanAmount = '5000000';
  }

  return {
    detectedLanguage: lang,
    intent: fields.loanProduct ? 'LOAN_APPLICATION' : 'GREETING',
    extractedFields: fields
  };
}

/**
 * Main AI Agent Process Function
 */
async function processCustomerMessageWithAI(customerMessage, conversationContext = {}) {
  const detectedLang = detectLanguage(customerMessage);

  if (apiKey.includes('MOCK') || apiKey.length < 20) {
    const fallback = heuristicExtraction(customerMessage);
    return {
      success: true,
      provider: 'Internal_Heuristic_AI',
      extraction: fallback
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are AVANI AI CRM Intent & Field Extractor.
Extract structured details from customer WhatsApp message.

Return ONLY a JSON object with this exact schema:
{
  "detectedLanguage": "Marathi" | "Hindi" | "English",
  "intent": "GREETING" | "LOAN_APPLICATION" | "DOCUMENT_SUBMISSION" | "STATUS_CHECK",
  "extractedFields": {
    "fullName": string or null,
    "profession": "DOCTOR" | "CHARTERED_ACCOUNTANT" | "ARCHITECT" | "ENGINEER" | "OTHER_PROFESSIONAL" | null,
    "employmentType": "SALARIED" | "SELF_EMPLOYED" | "BUSINESS_OWNER" | "PROFESSIONAL" | "FARMER" | "PENSIONER" | null,
    "monthlyIncome": string or null,
    "loanProduct": "PERSONAL_LOAN" | "BUSINESS_LOAN" | "DOCTOR_LOAN" | "CA_LOAN" | "HOME_LOAN" | "EDUCATION_LOAN" | null,
    "loanAmount": string or null,
    "city": string or null
  }
}

Customer Message: "${customerMessage}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const validated = parseAndValidateExtraction(responseText);

    if (validated.isValid) {
      return {
        success: true,
        provider: 'Gemini_1.5_Flash',
        extraction: validated.data
      };
    } else {
      console.warn('[AVANI AI Agent] Gemini JSON schema invalid. Fallback to heuristic parser.');
      return {
        success: true,
        provider: 'Gemini_Fallback_Heuristic',
        extraction: heuristicExtraction(customerMessage)
      };
    }
  } catch (err) {
    console.error('[AVANI AI Agent] Gemini Error:', err.message);
    return {
      success: true,
      provider: 'Error_Fallback_Heuristic',
      extraction: heuristicExtraction(customerMessage)
    };
  }
}

module.exports = {
  detectLanguage,
  processCustomerMessageWithAI,
  heuristicExtraction
};
