// apps/telecalling-service/index.cjs
// ─────────────────────────────────────────────────────────────────
// AI Telecalling Service & Trilingual Voice Agent Orchestration
// AVANI LOAN SERVICES — Autonomous Credit Underwriting Suite
// Languages: Marathi (Primary), Hindi, English
// Compliance: TRAI DLT, DND Opt-in Verification, Human Transfer Gate
// ─────────────────────────────────────────────────────────────────

'use strict';

const HUMAN_ESCALATION_NUMBER = '+917249108474'; // Sachin Shinde

const SYSTEM_PROMPTS = {
  marathi: `तुम्ही अवनी लोन सर्व्हिसेस (लातूर, महाराष्ट्र) चे वरिष्ठ सहाय्यक आहात.
नियम:
1. अतिशय नम्रपणे आणि स्पष्ट मराठीत बोला.
2. ग्राहकाला कोणत्या कर्जाची गरज आहे (वैयक्तिक, व्यवसाय, डॉक्टर, गृह कर्ज) ते विचारा.
3. उत्पन्न आणि रोजगाराची माहिती घ्या.
4. कोणत्याही कर्जाची खात्रीशीर मंजुरी (Guaranteed Approval) देऊ नका.
5. व्याजदर मनमानी सांगू नका ("व्याजदर सिबिल स्कोअर आणि बँकेच्या नियमांनुसार निश्चित होईल").
6. ग्राहकाला अडचण असल्यास किंवा मानवी सल्लागार हवा असल्यास सचिन शिंदे सरांशी (+917249108474) त्वरित संपर्क करून द्या.`,

  hindi: `आप अवनी लोन सर्विसेज (लातूर, महाराष्ट्र) के वरिष्ठ ऋण सलाहकार हैं।
नियम:
1. विनम्र और स्पष्ट हिंदी में बात करें।
2. ग्राहक की ऋण आवश्यकता (पर्सनल, बिजनेस, डॉक्टर, होम लोन) की पहचान करें।
3. मासिक आय और रोजगार का प्रकार पूछें।
4. किसी भी लोन की पक्की मंजूरी (Guaranteed Approval) का वादा न करें।
5. ब्याज दर मनगढ़ंत न बताएं ("सटीक ब्याज दर सिबिल स्कोर और बैंक नीति पर निर्भर करती है")।
6. आवश्यकता पड़ने पर हमारे वरिष्ठ कार्यकारी सचिन शिंदे (+917249108474) से कॉल ट्रांसफर करें।`,

  english: `You are an elite loan qualification assistant calling from Avani Loan Services (Latur, Maharashtra).
Rules:
1. Speak professionally, politely, and concisely.
2. Qualify lead for loan product (Personal, Business, Doctor Professional, Home).
3. Gather approximate monthly income and employment type.
4. Never guarantee loan approval under any circumstances.
5. Never invent interest rates or credit scores ("Rates and sanction depend on lender policy and CIBIL").
6. Transfer call to senior executive Sachin Shinde (+917249108474) upon request or complex inquiry.`
};

/**
 * Validate customer opt-in for TRAI DND compliance.
 */
function verifyDndCompliance(lead = {}) {
  if (!lead.optInGiven) {
    return {
      canCall: false,
      reason: 'TRAI_DND_VIOLATION_NO_OPT_IN',
      message: 'Automated outbound calling blocked: No documented customer consent/opt-in found.'
    };
  }
  return { canCall: true, reason: 'OPT_IN_VERIFIED' };
}

/**
 * Classify customer voice intent and check for human transfer keywords.
 */
function parseVoiceIntent(userTranscript = '', language = 'marathi') {
  const text = String(userTranscript).toLowerCase();

  // Escalation detection
  const escalationKeywords = [
    'human', 'executive', 'agent', 'manager', 'sachin', 'boltoy', 'bolna hai',
    'माणूस', 'अधिकारी', 'मॅनेजर', 'सचिन सर', 'बात करा', 'कॉल ट्रान्सफर', 'insan se baat'
  ];
  const requiresHumanTransfer = escalationKeywords.some(k => text.includes(k));

  if (requiresHumanTransfer) {
    return {
      intent: 'HUMAN_HANDOFF_REQUESTED',
      transferNumber: HUMAN_ESCALATION_NUMBER,
      responseMessage: language === 'marathi'
        ? 'नक्कीच, मी आमचे वरिष्ठ सल्लागार सचिन शिंदे यांच्याशी आपला कॉल लगेच ट्रान्सफर करत आहे.'
        : 'जी बिल्कुल, मैं हमारे वरिष्ठ प्रबंधक सचिन शिंदे जी से आपका कॉल तुरंत ट्रांसफर कर रहा हूँ।'
    };
  }

  // Loan product detection
  let detectedProduct = 'PERSONAL_LOAN';
  if (text.includes('doctor') || text.includes('डॉक्टर')) {
    detectedProduct = 'DOCTOR_LOAN';
  } else if (text.includes('business') || text.includes('उद्योग') || text.includes('व्यवसाय') || text.includes('व्यापार')) {
    detectedProduct = 'BUSINESS_LOAN';
  } else if (text.includes('home') || text.includes('घर') || text.includes('गृह')) {
    detectedProduct = 'HOME_LOAN';
  }

  return {
    intent: 'QUALIFYING_LEAD',
    detectedProduct,
    requiresHumanTransfer: false
  };
}

/**
 * Generate structured post-call summary note for CRM.
 */
function generateCrmCallNote(callRecord = {}) {
  return {
    callId: callRecord.callId || `CALL-${Date.now()}`,
    leadId: callRecord.leadId,
    phoneMasked: callRecord.phoneMasked,
    language: callRecord.language || 'marathi',
    durationSeconds: callRecord.durationSeconds || 0,
    outcome: callRecord.outcome || 'QUALIFIED',
    qualifiedProduct: callRecord.qualifiedProduct || 'PERSONAL_LOAN',
    monthlyIncomeExtracted: callRecord.monthlyIncome || null,
    nextAction: callRecord.outcome === 'QUALIFIED' ? 'REQUEST_DOCUMENTS' : 'FOLLOW_UP_LATER',
    noteText: `[AI Telecalling] Call completed in ${callRecord.language || 'Marathi'}. Outcome: ${callRecord.outcome}. Recommended Next Step: Send WhatsApp Document Checklist.`
  };
}

module.exports = {
  HUMAN_ESCALATION_NUMBER,
  SYSTEM_PROMPTS,
  verifyDndCompliance,
  parseVoiceIntent,
  generateCrmCallNote
};
