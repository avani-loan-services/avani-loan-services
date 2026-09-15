// src/services/templateGenerator.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Comprehensive Productwise Content Generator
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG, ALL_PRODUCT_KEYS } = require('../config/productsCatalog.cjs');
const { PRODUCT_KNOWLEDGE } = require('./templateContentData.cjs');
const { validateTemplate } = require('./templateValidator.cjs');
const { saveTemplate, recordTemplateAudit } = require('../models/ContentTemplate.cjs');

/**
 * Generate a complete, compliant library for a given loan product
 */
function generateProductTemplates(productId, options = {}) {
  const product = PRODUCTS_CATALOG[productId];
  if (!product) {
    throw new Error(`Product not found in catalog: ${productId}`);
  }

  const languages = options.languages || ['en', 'mr', 'hi'];
  const generated = [];

  languages.forEach(lang => {
    // 1. WHATSAPP TEMPLATES (Follow-up, Conversion, Retargeting, Lead-Gen)
    const waTemplates = generateWhatsAppTemplates(productId, lang);
    generated.push(...waTemplates);

    // 2. SOCIAL POSTS (Facebook, Instagram, LinkedIn, WhatsApp Status)
    const socialPosts = generateSocialPosts(productId, lang);
    generated.push(...socialPosts);

    // 3. VIDEO & REEL SCRIPTS (Short Reel, Educational, FAQ, Problem/Solution, Lead-Gen)
    const videoScripts = generateVideoScripts(productId, lang);
    generated.push(...videoScripts);
  });

  // 4. IMAGE GENERATION PROMPTS (1080x1080, 1080x1350, 1080x1920, 1200x628)
  const imagePrompts = generateImagePrompts(productId);
  generated.push(...imagePrompts);

  return generated;
}

/**
 * Generate WhatsApp Templates for a product and language
 */
function generateWhatsAppTemplates(productId, language = 'en') {
  const product = PRODUCTS_CATALOG[productId];
  const pName = product.name;
  const pCode = product.code;
  const templates = [];

  const defaultFooter = language === 'mr'
    ? 'अवनी लोन सर्व्हिसेस | लातूर • अनसबस्क्राईबसाठी STOP पाठवा'
    : language === 'hi'
    ? 'अवनी लोन सर्विसेज | लातूर • अनसब्सक्राइब के लिए STOP भेजें'
    : 'AVANI LOAN SERVICES | Latur • Reply STOP to unsubscribe';

  const advisor = BUSINESS_IDENTITY.founder;
  const docUrl = BUSINESS_IDENTITY.documentsUrl;
  const website = BUSINESS_IDENTITY.website;
  const phone = BUSINESS_IDENTITY.whatsappRaw;

  // ── A. FOLLOW-UP LIFECYCLE (D0 to D30) ──

  // 1. D0 Welcome (Utility)
  templates.push({
    templateId: `ALS-${pCode}-WA-D0-WELCOME-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'FOLLOW_UP',
    language,
    templateName: `${productId.toLowerCase()}_welcome_${language}_v1`,
    headline: language === 'mr' ? 'अवनी लोन सर्व्हिसेस' : language === 'hi' ? 'अवनी लोन सर्विसेज' : 'AVANI LOAN SERVICES',
    body: language === 'mr'
      ? `नमस्कार {{1}}, अवनी लोन सर्व्हिसेसमध्ये स्वागत आहे. तुमच्या ${pName} चौकशी संदर्भात संपर्क करत आहोत. योग्य बँक पर्याय शोधण्यासाठी आमचे तज्ज्ञ {{2}} लवकरच संपर्क करतील.`
      : language === 'hi'
      ? `नमस्ते {{1}}, अवनी लोन सर्विसेज में आपका स्वागत है। आपकी ${pName} पूछताछ के संबंध में हम संपर्क कर रहे हैं। सर्वश्रेष्ठ बैंक विकल्प तलाशने के लिए हमारे सलाहकार {{2}} जल्द संपर्क करेंगे।`
      : `Hello {{1}}, welcome to AVANI LOAN SERVICES. Regarding your inquiry for ${pName}, our senior advisor {{2}} will review your eligibility across top lenders shortly.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Rajesh Kumar' },
      { index: 2, name: 'advisor_name', sample: advisor }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'पात्रता तपासा' : language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility' },
      { type: 'URL', text: language === 'mr' ? 'वेबसाईट पहा' : language === 'hi' ? 'वेबसाइट देखें' : 'Visit Website', url: website }
    ],
    metaCategory: 'UTILITY',
    status: 'VALIDATED',
    version: 1
  });

  // 2. D1 Eligibility Check
  templates.push({
    templateId: `ALS-${pCode}-WA-D1-ELIGIBILITY-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'LEAD_GEN',
    language,
    templateName: `${productId.toLowerCase()}_eligibility_${language}_v1`,
    headline: language === 'mr' ? 'पात्रता पडताळणी' : language === 'hi' ? 'पात्रता सत्यापन' : 'Eligibility Assessment',
    body: language === 'mr'
      ? `नमस्कार {{1}}, तुमच्या ${pName} अर्जाची जलद छाननी करण्यासाठी कृपया तुमचे मासिक उत्पन्न, नोकरी/व्यवसाय आणि अपेक्षित लोन रक्कम {{2}} कळवा. आम्ही सर्वोत्कृष्ट बँकेची ऑफर शोधू.`
      : language === 'hi'
      ? `नमस्ते {{1}}, आपके ${pName} आवेदन की समीक्षा के लिए कृपया अपनी मासिक आय, व्यवसाय और अपेक्षित ऋण राशि {{2}} साझा करें। हम सबसे उपयुक्त बैंक ऑफर खोजेंगे।`
      : `Hello {{1}}, to fast-track your ${pName} assessment, please confirm your monthly income, profile vintage, and expected loan amount {{2}}. We will identify the most competitive bank offer.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Amit Patil' },
      { index: 2, name: 'loan_amount', sample: '₹10 Lakhs' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'माहिती पाठवा' : language === 'hi' ? 'जानकारी भेजें' : 'Send Details' },
      { type: 'PHONE_NUMBER', text: language === 'mr' ? 'कॉल करा' : language === 'hi' ? 'कॉल करें' : 'Call Advisor', phone }
    ],
    metaCategory: 'UTILITY',
    status: 'VALIDATED',
    version: 1
  });

  // 3. D3 Benefits & Comparison (Marketing)
  templates.push({
    templateId: `ALS-${pCode}-WA-D3-BENEFITS-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language,
    templateName: `${productId.toLowerCase()}_benefits_${language}_v1`,
    headline: language === 'mr' ? 'अवनी लोनचे फायदे' : language === 'hi' ? 'अवनी लोन के लाभ' : 'Why Avani Loan Services?',
    body: language === 'mr'
      ? `नमस्कार {{1}}, ${pName} साठी अवनी लोन सर्व्हिसेस का निवडावी? १) पारदर्शक प्रक्रिया, २) अनेक बँकांमधील तुलना, ३) लातूरमधील विश्वसनीय वैयक्तिक मार्गदर्शन. आजच सल्लामसलत बुक करा.`
      : language === 'hi'
      ? `नमस्ते {{1}}, ${pName} के लिए अवनी लोन सर्विसेज क्यों चुनें? 1) पारदर्शी प्रक्रिया, 2) कई बैंकों में ब्याज दरों की तुलना, 3) विश्वसनीय व्यक्तिगत मार्गदर्शन। आज ही परामर्श बुक करें।`
      : `Hello {{1}}, why choose AVANI LOAN SERVICES for your ${pName}? We provide transparent multi-lender comparison, zero hidden charges, and dedicated local advisory right here in Latur. Schedule your consultation today.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Suresh Deshmukh' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'सल्लामसलत बुक करा' : language === 'hi' ? 'परामर्श बुक करें' : 'Book Consultation' },
      { type: 'URL', text: language === 'mr' ? 'वेबसाईट पहा' : language === 'hi' ? 'वेबसाइट देखें' : 'View Options', url: website }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 4. D7 Advisory Call Offer (Marketing)
  templates.push({
    templateId: `ALS-${pCode}-WA-D7-FOLLOWUP-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'FOLLOW_UP',
    language,
    templateName: `${productId.toLowerCase()}_followup_d7_${language}_v1`,
    headline: language === 'mr' ? 'मार्गदर्शन कॉल' : language === 'hi' ? 'सलाहकार कॉल' : 'Advisory Call',
    body: language === 'mr'
      ? `नमस्कार {{1}}, आमच्या टीमकडून तुमच्या ${pName} अर्जाचा आढावा घेण्यासाठी सचिन शिंदे स्वतः ५ मिनिटांच्या कॉलवर चर्चा करू इच्छितात. तुम्ही कोणत्या वेळेत उपलब्ध आहात?`
      : language === 'hi'
      ? `नमस्ते {{1}}, आपके ${pName} आवेदन की समीक्षा के लिए सचिन शिंदे आपसे 5 मिनट के संक्षिप्त कॉल पर चर्चा करना चाहते हैं। आज आपके लिए कौन सा समय सही रहेगा?`
      : `Hello {{1}}, regarding your ${pName} application, our founder Sachin Shinde would like to connect for a quick 5-minute file review. What time works best for you today?`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Ganesh More' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'आता कॉल करा' : language === 'hi' ? 'अभी कॉल करें' : 'Call Now' },
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'नंतर मेसेज करा' : language === 'hi' ? 'बाद में संपर्क करें' : 'Connect Later' }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 5. D10 Document Submission Reminder (Utility)
  templates.push({
    templateId: `ALS-${pCode}-WA-D10-DOCS-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language,
    templateName: `${productId.toLowerCase()}_doc_reminder_${language}_v1`,
    headline: language === 'mr' ? 'कागदपत्रे बाकी आहेत' : language === 'hi' ? 'दस्तावेज़ लंबित' : 'Documents Pending',
    body: language === 'mr'
      ? `नमस्कार {{1}}, तुमच्या ${pName} फाईलची जलद प्रक्रिया सुरू ठेवण्यासाठी कृपया तुमचे प्रलंबित कागदपत्रे {{2}} लिंकवर अपलोड करा किंवा या चॅटवर पाठवा.`
      : language === 'hi'
      ? `नमस्ते {{1}}, आपकी ${pName} फाइल की प्रक्रिया आगे बढ़ाने के लिए कृपया अपने लंबित दस्तावेज़ सुरक्षित रूप से {{2}} लिंक पर अपलोड करें।`
      : `Hello {{1}}, to keep your ${pName} file moving towards sanction, please upload your pending verification documents securely at: {{2}}`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Priya Shinde' },
      { index: 2, name: 'document_portal_url', sample: docUrl }
    ],
    cta: [
      { type: 'URL', text: language === 'mr' ? 'कागदपत्रे अपलोड करा' : language === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'Upload Documents', url: docUrl },
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'मदत हवी आहे' : language === 'hi' ? 'मदद चाहिए' : 'Need Help' }
    ],
    metaCategory: 'UTILITY',
    status: 'VALIDATED',
    version: 1
  });

  // 6. D15 Loan Options Update (Marketing)
  templates.push({
    templateId: `ALS-${pCode}-WA-D15-UPDATE-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CONVERSION',
    language,
    templateName: `${productId.toLowerCase()}_status_d15_${language}_v1`,
    headline: language === 'mr' ? 'नवीन लोन पर्याय' : language === 'hi' ? 'नए ऋण विकल्प' : 'Updated Loan Options',
    body: language === 'mr'
      ? `नमस्कार {{1}}, ${pName} संदर्भात नवीन बँकिंग स्कीम्स उपलब्ध झाल्या आहेत. तुमचे उद्दिष्ट पूर्ण करण्यासाठी योग्य व्याजदर आणि लवचिक मुदत उपलब्ध आहे. अधिक माहितीसाठी संपर्क साधा.`
      : language === 'hi'
      ? `नमस्ते {{1}}, ${pName} के संबंध में नई बैंकिंग योजनाएं सक्रिय हैं। प्रतिस्पर्धी ब्याज दरों और लचीली अवधि की तुलना के लिए हमसे संपर्क करें।`
      : `Hello {{1}}, updated ${pName} programs are active across our lending partners. Let us help you compare eligible limits before current quarterly brackets close.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Vikas Kulkarni' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'माहिती जाणून घ्या' : language === 'hi' ? 'विवरण प्राप्त करें' : 'Get Details' },
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'तज्ज्ञांशी बोला' : language === 'hi' ? 'विशेषज्ञ से बात करें' : 'Talk to Expert' }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 7. D30 Re-engagement & Referral (Marketing)
  templates.push({
    templateId: `ALS-${pCode}-WA-D30-REENGAGE-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'RETARGETING',
    language,
    templateName: `${productId.toLowerCase()}_reengage_d30_${language}_v1`,
    headline: language === 'mr' ? 'आम्ही सदैव सोबत आहोत' : language === 'hi' ? 'हम हमेशा आपके साथ हैं' : 'Always Here To Guide',
    body: language === 'mr'
      ? `नमस्कार {{1}}, भविष्यात जेव्हाही तुम्हाला किंवा तुमच्या परिचितांना ${pName} किंवा इतर आर्थिक सल्ल्याची गरज भासेल, तेव्हा अवनी लोन सर्व्हिसेस नेहमी तत्पर असेल. आमचा नंबर सेव्ह ठेवा.`
      : language === 'hi'
      ? `नमस्ते {{1}}, भविष्य में जब भी आपको या आपके परिचितों को ${pName} या ऋण सलाह की आवश्यकता हो, अवनी लोन सर्विसेज सदैव तत्पर है। हमारा नंबर सुरक्षित रखें।`
      : `Hello {{1}}, whenever you or your colleagues require ${pName} advisory in the future, AVANI LOAN SERVICES is always here to assist. Save our official contact or refer friends who need trusted financial guidance.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Nitin Jadhav' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'रेफरल पाठवा' : language === 'hi' ? 'रेफरल भेजें' : 'Refer a Friend' },
      { type: 'PHONE_NUMBER', text: language === 'mr' ? 'संपर्क साधा' : language === 'hi' ? 'संपर्क करें' : 'Call Office', phone }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // ── B. CONVERSION & RETARGETING TEMPLATES ──

  // 8. Consultation Booking
  templates.push({
    templateId: `ALS-${pCode}-WA-CONV-CONSULT-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CONVERSION',
    language,
    templateName: `${productId.toLowerCase()}_consult_booking_${language}_v1`,
    headline: language === 'mr' ? 'सल्लामसलत सत्र' : language === 'hi' ? 'परामर्श सत्र' : 'Consultation Session',
    body: language === 'mr'
      ? `नमस्कार {{1}}, तुमच्या ${pName} फाईलसाठी सचिन शिंदे यांच्यासोबत मोफत वन-टू-वन सल्लामसलत बुक करण्यासाठी {{2}} लिंकवर स्लॉट निवडा.`
      : language === 'hi'
      ? `नमस्ते {{1}}, अपनी ${pName} फाइल के लिए सचिन शिंदे के साथ निशुल्क परामर्श सत्र बुक करने हेतु {{2}} लिंक पर समय चुनें।`
      : `Hello {{1}}, to book your free one-on-one ${pName} advisory session with Sachin Shinde, please pick your preferred slot at: {{2}}`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Rahul Mane' },
      { index: 2, name: 'consultation_link', sample: `${website}/contact` }
    ],
    cta: [
      { type: 'URL', text: language === 'mr' ? 'स्लॉट बुक करा' : language === 'hi' ? 'स्लॉट बुक करें' : 'Book Slot', url: `${website}/contact` }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 9. Retargeting: Incomplete Application
  templates.push({
    templateId: `ALS-${pCode}-WA-RET-INCOMPLETE-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'RETARGETING',
    language,
    templateName: `${productId.toLowerCase()}_ret_incomplete_${language}_v1`,
    headline: language === 'mr' ? 'अर्जाची स्थिती' : language === 'hi' ? 'आवेदन की स्थिति' : 'Application Status',
    body: language === 'mr'
      ? `नमस्कार {{1}}, तुम्ही सुरू केलेला ${pName} अर्ज अपूर्ण आहे. कोणतीही अडचण असल्यास अवनी लोन सर्व्हिसेसची टीम तुम्हाला मदत करण्यास तयार आहे.`
      : language === 'hi'
      ? `नमस्ते {{1}}, आपका ${pName} आवेदन अधूरा है। यदि आपको किसी दस्तावेज़ में सहायता चाहिए, तो हमारी टीम आपकी सहायता के लिए तैयार है।`
      : `Hello {{1}}, we noticed you started your ${pName} assessment but did not finish. If you faced any difficulty, our advisory desk is ready to assist you.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Kiran Kale' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'अर्ज पूर्ण करा' : language === 'hi' ? 'आवेदन पूरा करें' : 'Finish Application' },
      { type: 'PHONE_NUMBER', text: language === 'mr' ? 'मदत मागवा' : language === 'hi' ? 'मदद मांगें' : 'Call Support', phone }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  return templates;
}

/**
 * Generate Social Media Posts (Facebook, Instagram, LinkedIn, WhatsApp Status)
 */
function generateSocialPosts(productId, language = 'en') {
  const product = PRODUCTS_CATALOG[productId];
  const pName = product.name;
  const pCode = product.code;
  const posts = [];

  const channels = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP_STATUS'];

  channels.forEach(ch => {
    // 1. Awareness Post (Problem / Solution / Educational)
    posts.push({
      templateId: `ALS-${pCode}-${ch.substring(0, 2)}-AWARENESS-${language.toUpperCase()}-V1`,
      businessId: BUSINESS_IDENTITY.businessId,
      product: productId,
      audience: product.targetAudience,
      channel: ch,
      contentType: 'TEXT',
      campaignType: 'AWARENESS',
      language,
      templateName: `ALS-${pCode}-${ch}-Awareness-${language}`,
      headline: `${pName} Guidance | AVANI LOAN SERVICES`,
      body: ch === 'LINKEDIN'
        ? `Navigating a ${pName} requires a comprehensive assessment of applicant profile, lender eligibility criteria, and transparent FOIR planning.\n\nAt AVANI LOAN SERVICES, led by Sachin Shinde, we help ${product.targetAudience.join(', ')} evaluate competitive lending avenues across scheduled banks and premier institutions.\n\nKey Focus Areas:\n• Systematic documentation review\n• FOIR and debt consolidation analysis\n• Responsible loan tenure alignment\n\n📌 Note: Eligibility and final approvals are subject to lender credit policies.\n\nConnect with our advisory desk at ${BUSINESS_IDENTITY.whatsappBusiness} or visit ${BUSINESS_IDENTITY.websiteShort}.`
        : ch === 'INSTAGRAM'
        ? `Looking for transparent ${pName} consultancy in Maharashtra? 💼\n\nAt AVANI LOAN SERVICES, we guide ${product.targetAudience[0]} with verified documentation and multi-lender comparisons.\n\n✅ Transparent process\n✅ Tailored eligibility checks\n✅ Dedicated local advisory in Latur\n\n📲 WhatsApp us at ${BUSINESS_IDENTITY.whatsappBusiness}\n🌐 Learn more: ${BUSINESS_IDENTITY.websiteShort}\n\n#AvaniLoanServices #Latur #${pCode.replace(/[^A-Z]/g, '')}Loan #FinancialAdvisory #LoanConsultant #SachinShinde`
        : ch === 'WHATSAPP_STATUS'
        ? `Thinking about a ${pName}? 💡\nCompare terms across top banks with expert guidance from Sachin Shinde at AVANI LOAN SERVICES, Latur.\n\nTap reply to check your basic eligibility today! 📲 +91 91756 35165`
        : `Planning for a ${pName}? Avani Loan Services offers structured advisory to help you understand eligibility and documents required before you apply. Contact Sachin Shinde at +91 91756 35165 or visit avanifinserv.com.`,
      cta: [product.ctas[0] || 'Check Eligibility'],
      status: 'VALIDATED',
      version: 1
    });

    // 2. Lead Generation Post
    posts.push({
      templateId: `ALS-${pCode}-${ch.substring(0, 2)}-LEADGEN-${language.toUpperCase()}-V1`,
      businessId: BUSINESS_IDENTITY.businessId,
      product: productId,
      audience: product.targetAudience,
      channel: ch,
      contentType: 'TEXT',
      campaignType: 'LEAD_GEN',
      language,
      templateName: `ALS-${pCode}-${ch}-LeadGen-${language}`,
      headline: `Apply for ${pName} | Avani Loan Services`,
      body: `Ready to move forward with your ${pName}? Avani Loan Services streamlines your entire application journey from initial assessment to documentation verification.\n\n📍 Office: Old Barshi Road, 5 no chauk, Kulswamini Nagar, Latur.\n📞 WhatsApp: +91 91756 35165\n🌐 Website: avanifinserv.com`,
      cta: [product.ctas[1] || 'Talk to an Advisor'],
      status: 'VALIDATED',
      version: 1
    });

    // 3. Educational Post (FOIR / Documentation / Multi-Bank Comparison)
    posts.push({
      templateId: `ALS-${pCode}-${ch.substring(0, 2)}-EDU-${language.toUpperCase()}-V1`,
      businessId: BUSINESS_IDENTITY.businessId,
      product: productId,
      audience: product.targetAudience,
      channel: ch,
      contentType: 'TEXT',
      campaignType: 'AWARENESS',
      language,
      templateName: `ALS-${pCode}-${ch}-Educational-${language}`,
      headline: `Key Insights on ${pName} | Avani Loan Advisory`,
      body: `Before applying for a ${pName}, evaluate these 3 critical factors:\n1. Fixed Obligation to Income Ratio (FOIR)\n2. CIBIL score health (750+ opens preferred interest brackets)\n3. Complete verification documents (ITR/Salary slips/Bank statements)\n\nAvoid multiple direct rejections that hurt your credit rating. Let Sachin Shinde at Avani Loan Services pre-qualify your file first.\n\n🌐 Visit avanifinserv.com or WhatsApp +91 91756 35165.`,
      cta: ['Understand Your Profile'],
      status: 'VALIDATED',
      version: 1
    });
  });

  return posts;
}

/**
 * Generate Structured Image Generation Prompts (1080x1080, 1080x1350, 1080x1920, 1200x628)
 */
function generateImagePrompts(productId) {
  const product = PRODUCTS_CATALOG[productId];
  const pCode = product.code;
  const pName = product.name;

  const formats = [
    { name: 'SQUARE', res: '1080x1080' },
    { name: 'PORTRAIT', res: '1080x1350' },
    { name: 'STORY', res: '1080x1920' },
    { name: 'LANDSCAPE', res: '1200x628' }
  ];

  return formats.map(fmt => ({
    templateId: `ALS-${pCode}-IMG-${fmt.name}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'INSTAGRAM',
    contentType: 'IMAGE_PROMPT',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: `ALS-${pCode}-Image-${fmt.name}`,
    headline: `${pName} Visual Concept (${fmt.res})`,
    body: `Branded graphic concept for ${pName}. Featuring clean layout, navy blue (#0A192F), off-white (#F8FAFC), and light blue (#38BDF8) accents. Displays product title, key benefit, Avani Loan Services logo zone, and WhatsApp CTA: +91 91756 35165.`,
    imagePrompt: {
      product: pName,
      audience: product.targetAudience[0],
      scene: `Professional Indian financial advisory consultation in a modern bright office in Maharashtra. Subject reviewing ${pName} documents calmly with an experienced advisor.`,
      style: 'Premium financial-services corporate photography, clean and candid lighting, minimal modern office aesthetic.',
      brand: 'Navy blue (#0f172a), light blue (#0284c7), crisp off-white background.',
      composition: 'Subject positioned cleanly on one third of frame, leaving uncluttered negative space for clean typographic layout.',
      format: fmt.res,
      mood: 'Trustworthy, professional, calm, confident, authentic Indian banking atmosphere.',
      doNot: 'Do not create fake bank logos, fake currency piles, exaggerated approved stamps, or guarantee claims.'
    },
    cta: ['Check Eligibility'],
    status: 'VALIDATED',
    version: 1
  }));
}

/**
 * Generate Video / Reel Scripts (Short Reel, Educational, FAQ, Problem/Solution, Lead-Gen)
 */
function generateVideoScripts(productId, language = 'en') {
  const product = PRODUCTS_CATALOG[productId];
  const knowledge = PRODUCT_KNOWLEDGE[productId] || {};
  const pCode = product.code;
  const pName = product.name;
  const concept = (knowledge.videoConcepts && knowledge.videoConcepts[0]) || {};

  const hook = language === 'mr' ? concept.hookMr : concept.hookEn;
  const problem = language === 'mr' ? concept.problemMr : concept.problemEn;
  const explanation = language === 'mr' ? concept.explanationMr : concept.explanationEn;
  const cta = language === 'mr' ? concept.ctaMr : concept.ctaEn;

  const scripts = [];

  // 1. Short Reel (15-20 sec)
  scripts.push({
    templateId: `ALS-${pCode}-VIDEO-REEL-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'INSTAGRAM',
    contentType: 'VIDEO_SCRIPT',
    campaignType: 'AWARENESS',
    language,
    templateName: `ALS-${pCode}-Short-Reel-${language}-V1`,
    headline: `${pName} 20-Second Short Reel (${language.toUpperCase()})`,
    body: `[0-3s Hook]: ${hook || `Need a ${pName}?`}\n[3-10s Problem]: ${problem || 'Comparing banks takes weeks.'}\n[10-15s Solution]: Avani Loan Services gives you clarity across top lenders.\n[15-20s CTA]: ${cta || 'WhatsApp +91 91756 35165.'}`,
    videoScript: {
      duration: '20 seconds',
      format: '9:16 Vertical Reel',
      hook: hook || 'Need loan guidance?',
      problem: problem || 'Multiple bank visits waste time.',
      explanation: explanation || 'We calculate your FOIR and identify eligible banks.',
      keyPoints: [
        'Single-window pre-assessment',
        'Transparent interest rate comparison',
        'Zero upfront consultation charge'
      ],
      cta: cta || 'Message Avani Loan Services on WhatsApp at +91 91756 35165.',
      onScreenText: `${pName} Guidance | Avani Loan Services | Latur`,
      voiceOver: `${hook} ${problem} ${explanation} ${cta}`,
      bRoll: concept.bRoll || 'Advisor reviewing documents on desk, clean graphics with bank comparison chart.',
      cameraDirection: 'Quick cut zoom on advisor speaking to camera, cut to document review B-roll, closing with branded contact screen.'
    },
    status: 'VALIDATED',
    version: 1
  });

  // 2. Comprehensive Educational Video (40 sec)
  scripts.push({
    templateId: `ALS-${pCode}-VIDEO-EDU-${language.toUpperCase()}-V1`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: productId,
    audience: product.targetAudience,
    channel: 'INSTAGRAM',
    contentType: 'VIDEO_SCRIPT',
    campaignType: 'AWARENESS',
    language,
    templateName: `ALS-${pCode}-Educational-Video-${language}-V1`,
    headline: `${pName} 40-Second Educational Breakdown (${language.toUpperCase()})`,
    body: `[0-3s Hook]: ${hook || `Planning for ${pName}?`}\n[3-10s Problem]: ${problem || 'Avoid costly documentation mistakes.'}\n[10-25s Explanation]: ${explanation || 'Understanding your FOIR and CIBIL score is crucial.'}\n[25-35s Solution]: Sachin Shinde at Avani Loan Services prepares your file for bank approval.\n[35-45s CTA]: ${cta || 'Contact +91 91756 35165 on WhatsApp today.'}`,
    videoScript: {
      duration: '40 seconds',
      format: '9:16 Vertical Reel',
      hook: hook || 'Looking for financial clarity?',
      problem: problem || 'Unplanned loan applications lead to rejection.',
      explanation: explanation || 'We evaluate your profile against lender underwriting criteria.',
      keyPoints: [
        'FOIR assessment before submission',
        'Documentation checklist packaging',
        'Latur office personal guidance'
      ],
      cta: cta || 'Contact Sachin Shinde at Avani Loan Services today.',
      onScreenText: `${pName} Advisory | Sachin Shinde | +91 91756 35165`,
      voiceOver: `${hook} ${problem} ${explanation} ${cta}`,
      bRoll: 'Financial consultant walking client through options on tablet, smiling client leaving office.',
      cameraDirection: 'Medium shot of advisor speaking directly to camera, cut to over-the-shoulder review, ending on corporate card.'
    },
    status: 'VALIDATED',
    version: 1
  });

  return scripts;
}

/**
 * Generate and save templates for all 10 products into database / store
 */
async function generateAllProductTemplates() {
  console.log('[TemplateGenerator] Starting bulk template generation for all 10 products...');
  const results = {
    totalGenerated: 0,
    byProduct: {},
    errors: []
  };

  for (const productId of ALL_PRODUCT_KEYS) {
    try {
      const templates = generateProductTemplates(productId, { languages: ['en', 'mr', 'hi'] });
      results.byProduct[productId] = templates.length;

      for (const t of templates) {
        // Validate each template
        const valReport = validateTemplate(t);
        t.validationReport = valReport;
        t.status = valReport.isValid ? 'VALIDATED' : 'DRAFT';

        // Save idempotently
        await saveTemplate(t);
        results.totalGenerated++;
      }

      await recordTemplateAudit({
        who: 'SYSTEM_BULK_GENERATOR',
        what: `Generated ${templates.length} templates for product: ${productId}`,
        product: productId,
        templateId: `BULK-${productId}`,
        channel: 'MULTI_CHANNEL',
        action: 'GENERATE_PRODUCT_TEMPLATES',
        result: 'SUCCESS'
      });
    } catch (err) {
      console.error(`[TemplateGenerator] Error generating product ${productId}:`, err.message);
      results.errors.push({ product: productId, error: err.message });
    }
  }

  console.log(`[TemplateGenerator] Bulk generation complete. Total templates generated: ${results.totalGenerated}`);
  return results;
}

module.exports = {
  generateProductTemplates,
  generateWhatsAppTemplates,
  generateSocialPosts,
  generateImagePrompts,
  generateVideoScripts,
  generateAllProductTemplates
};
