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

  const knowledge = PRODUCT_KNOWLEDGE[productId] || {};
  const languages = options.languages || ['en', 'mr', 'hi'];
  const generated = [];

  languages.forEach(lang => {
    // 1. WHATSAPP TEMPLATES (Marketing & Utility)
    const waTemplates = generateWhatsAppTemplates(productId, lang);
    generated.push(...waTemplates);

    // 2. SOCIAL POSTS (Facebook, Instagram, LinkedIn, WhatsApp Status)
    const socialPosts = generateSocialPosts(productId, lang);
    generated.push(...socialPosts);

    // 3. VIDEO & REEL SCRIPTS
    const videoScripts = generateVideoScripts(productId, lang);
    generated.push(...videoScripts);
  });

  // 4. IMAGE GENERATION PROMPTS (Language independent visual concepts)
  const imagePrompts = generateImagePrompts(productId);
  generated.push(...imagePrompts);

  return generated;
}

/**
 * Generate WhatsApp Templates for a product and language
 */
function generateWhatsAppTemplates(productId, language = 'en') {
  const product = PRODUCTS_CATALOG[productId];
  const knowledge = PRODUCT_KNOWLEDGE[productId] || {};
  const pName = product.name;
  const pCode = product.code;
  const templates = [];

  const defaultFooter = language === 'mr'
    ? 'अवनी लोन सर्व्हिसेस | लातूर • अनसबस्क्राईबसाठी STOP पाठवा'
    : 'AVANI LOAN SERVICES | Latur • Reply STOP to unsubscribe';

  // 1. Day 0 Welcome (Lead Gen / Utility)
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
    headline: language === 'mr' ? 'अवनी लोन सर्व्हिसेस' : 'AVANI LOAN SERVICES',
    body: language === 'mr'
      ? `नमस्कार {{1}}, अवनी लोन सर्व्हिसेसमध्ये तुमचे स्वागत आहे. तुमच्या ${pName} चौकशी संदर्भात संपर्क करत आहोत. तुमची पात्रता तपासून योग्य सल्ला देण्यासाठी आमचे तज्ज्ञ सचिन शिंदे लवकरच संपर्क करतील.`
      : `Hello {{1}}, thank you for choosing AVANI LOAN SERVICES. We have received your inquiry for a ${pName}. Our advisor, Sachin Shinde, will connect with you shortly to evaluate your best lender options.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Rajesh Kumar' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'पात्रता तपासा' : 'Check Eligibility' },
      { type: 'URL', text: language === 'mr' ? 'वेबसाईट पहा' : 'Visit Website', url: BUSINESS_IDENTITY.website }
    ],
    metaCategory: 'UTILITY',
    status: 'VALIDATED',
    version: 1
  });

  // 2. Day 1 Eligibility Check
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
    headline: language === 'mr' ? 'पात्रता पडताळणी' : 'Eligibility Assessment',
    body: language === 'mr'
      ? `नमस्कार {{1}}, तुमच्या ${pName} अर्जाची जलद छाननी करण्यासाठी कृपया तुमचे मासिक उत्पन्न, नोकरी/व्यवसाय आणि अपेक्षित लोन रक्कम {{2}} कळवा. आम्ही सर्वोत्कृष्ट बँकेची ऑफर शोधू.`
      : `Hello {{1}}, to fast-track your ${pName} assessment, please share your monthly income, employment/business vintage, and required amount {{2}}. We will identify the most competitive bank offer for you.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Amit Patil' },
      { index: 2, name: 'loan_amount', sample: '₹10 Lakhs' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'माहिती पाठवा' : 'Send Details' },
      { type: 'PHONE_NUMBER', text: language === 'mr' ? 'कॉल करा' : 'Call Advisor', phone: BUSINESS_IDENTITY.whatsappRaw }
    ],
    metaCategory: 'UTILITY',
    status: 'VALIDATED',
    version: 1
  });

  // 3. Day 3 Benefits & FAQs (Marketing)
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
    headline: language === 'mr' ? 'अवनी लोनचे फायदे' : 'Why Avani Loan Services?',
    body: language === 'mr'
      ? `नमस्कार {{1}}, ${pName} साठी अवनी लोन सर्व्हिसेस का निवडावी? 1) पारदर्शक प्रक्रिया, 2) अनेक बँकांमधील तुलना, 3) लातूरमधील विश्वसनीय वैयक्तिक मार्गदर्शन. आजच सल्लामसलत बुक करा.`
      : `Hello {{1}}, why trust AVANI LOAN SERVICES for your ${pName}? We offer transparent multi-lender comparison, zero hidden fees, and dedicated guidance right here in Latur. Schedule your free consultation today.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Suresh Deshmukh' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'सल्लामसलत बुक करा' : 'Book Consultation' },
      { type: 'URL', text: language === 'mr' ? 'वेबसाईट पहा' : 'View Options', url: BUSINESS_IDENTITY.website }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 4. Day 7 Follow-Up Call Offer
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
    headline: language === 'mr' ? 'मार्गदर्शन कॉल' : 'Advisory Call',
    body: language === 'mr'
      ? `नमस्कार {{1}}, आमच्या टीमकडून तुमच्या ${pName} अर्जाचा आढावा घेण्यासाठी सचिन शिंदे स्वतः 5 मिनिटांच्या कॉलवर चर्चा करू इच्छितात. तुम्ही कोणत्या वेळेत उपलब्ध आहात?`
      : `Hello {{1}}, regarding your ${pName} application, our lead advisor Sachin Shinde would like to connect for a quick 5-minute file review. What time suits you best today?`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Ganesh More' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'आता कॉल करा' : 'Call Now' },
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'नंतर मेसेज करा' : 'Connect Later' }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 5. Day 10 Document Submission Reminder (Utility)
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
    headline: language === 'mr' ? 'कागदपत्रे बाकी आहेत' : 'Documents Pending',
    body: language === 'mr'
      ? `नमस्कार {{1}}, तुमच्या ${pName} फाईलची जलद प्रक्रिया सुरू ठेवण्यासाठी कृपया तुमचे प्रलंबित कागदपत्रे {{2}} लिंकवर अपलोड करा किंवा या चॅटवर पाठवा.`
      : `Hello {{1}}, to keep your ${pName} file moving towards sanction, please upload your pending verification documents securely at: {{2}}`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Priya Shinde' },
      { index: 2, name: 'document_portal_url', sample: BUSINESS_IDENTITY.documentsUrl }
    ],
    cta: [
      { type: 'URL', text: language === 'mr' ? 'कागदपत्रे अपलोड करा' : 'Upload Documents', url: BUSINESS_IDENTITY.documentsUrl },
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'मदत हवी आहे' : 'Need Help' }
    ],
    metaCategory: 'UTILITY',
    status: 'VALIDATED',
    version: 1
  });

  // 6. Day 15 Status / Loan Options Update
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
    headline: language === 'mr' ? 'नवीन लोन पर्याय' : 'Updated Loan Options',
    body: language === 'mr'
      ? `नमस्कार {{1}}, ${pName} संदर्भात नवीन बँकिंग स्कीम्स उपलब्ध झाल्या आहेत. तुमचे उद्दिष्ट पूर्ण करण्यासाठी योग्य व्याजदर आणि लवचिक मुदत उपलब्ध आहे. अधिक माहितीसाठी संपर्क साधा.`
      : `Hi {{1}}, updated ${pName} programs are now active with competitive repayment tenures. Let us assist you in comparing eligible lender limits before current quarterly brackets close.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Vikas Kulkarni' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'माहिती जाणून घ्या' : 'Get Details' },
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'तज्ज्ञांशी बोला' : 'Talk to Expert' }
    ],
    metaCategory: 'MARKETING',
    status: 'VALIDATED',
    version: 1
  });

  // 7. Day 30 Re-engagement & Referral
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
    headline: language === 'mr' ? 'आम्ही सदैव सोबत आहोत' : 'Always Here To Guide',
    body: language === 'mr'
      ? `नमस्कार {{1}}, भविष्यात जेव्हाही तुम्हाला किंवा तुमच्या परिचितांना ${pName} किंवा इतर आर्थिक सल्ल्याची गरज भासेल, तेव्हा अवनी लोन सर्व्हिसेस नेहमी तत्पर असेल. आमचा नंबर सेव्ह ठेवा.`
      : `Hello {{1}}, whether you require ${pName} guidance now or in the future, AVANI LOAN SERVICES is always here to assist. Save our number or refer family and business colleagues who need transparent funding advice.`,
    footer: defaultFooter,
    variables: [
      { index: 1, name: 'customer_name', sample: 'Nitin Jadhav' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: language === 'mr' ? 'रेफरल पाठवा' : 'Refer a Friend' },
      { type: 'PHONE_NUMBER', text: language === 'mr' ? 'संपर्क साधा' : 'Call Office', phone: BUSINESS_IDENTITY.whatsappRaw }
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
  const knowledge = PRODUCT_KNOWLEDGE[productId] || {};
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
    headline: `${pName} Visual Campaign Concept (${fmt.res})`,
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
 * Generate Video / Reel Scripts (0-3s Hook, 3-10s Problem, 10-25s Explanation, 25-35s Solution, 35-45s CTA)
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

  return [
    {
      templateId: `ALS-${pCode}-VIDEO-REEL-${language.toUpperCase()}-V1`,
      businessId: BUSINESS_IDENTITY.businessId,
      product: productId,
      audience: product.targetAudience,
      channel: 'INSTAGRAM',
      contentType: 'VIDEO_SCRIPT',
      campaignType: 'AWARENESS',
      language,
      templateName: `ALS-${pCode}-Reel-Script-${language}-V1`,
      headline: `${pName} 40-Second Video Script (${language.toUpperCase()})`,
      body: `[0-3s Hook]: ${hook || `Looking for a ${pName}?`}\n[3-10s Problem]: ${problem || 'Managing documentation and bank comparison takes time.'}\n[10-25s Explanation]: ${explanation || 'Avani Loan Services reviews your eligibility across top lenders.'}\n[25-35s Solution]: Dedicated financial advisory by Sachin Shinde in Latur.\n[35-45s CTA]: ${cta || 'Contact +91 91756 35165 on WhatsApp today.'}`,
      videoScript: {
        duration: '40 seconds',
        format: '9:16 Vertical Reel',
        hook: hook || 'Looking for loan guidance?',
        problem: problem || 'Bank comparison is complex.',
        explanation: explanation || 'We help you assess eligibility accurately.',
        keyPoints: [
          'Transparent multi-lender comparison',
          'Document packaging assistance',
          'Local Latur office & direct expert guidance'
        ],
        cta: cta || 'Message Avani Loan Services on WhatsApp at +91 91756 35165.',
        onScreenText: `${pName} Guidance | Avani Loan Services | +91 91756 35165`,
        voiceOver: `${hook} ${problem} ${explanation} ${cta}`,
        bRoll: concept.bRoll || 'Professional advisor reviewing documents on desk, clean graphics showcasing loan steps.',
        cameraDirection: 'Medium shot of advisor speaking directly to camera, cut to over-the-shoulder document review B-roll, closing with branded contact screen.'
      },
      status: 'VALIDATED',
      version: 1
    }
  ];
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
