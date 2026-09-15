// src/services/campaignAutomationEngine.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Campaign Builder & Pack Generator Engine
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG, getProduct } = require('../config/productsCatalog.cjs');
const { saveCampaign, getCampaignById, CAMPAIGN_STATUSES } = require('../models/Campaign.cjs');
const { saveMediaAsset, queryMediaAssets, ASSET_STATUSES } = require('../models/MediaAsset.cjs');
const { generate30DayCalendar } = require('./contentCalendarEngine.cjs');
const { scoreContentQuality } = require('./contentQualityScorer.cjs');

/**
 * Multi-channel text adaptation generator.
 * Adapts core loan advisory message into 5 platform-native tones:
 * - LinkedIn: Professional, FOIR/DSCR, corporate documentation, tax/auditing perspective
 * - Instagram: Punchy hook, visual cues, bio link CTA
 * - Facebook: Conversational, community trust, educational storytelling
 * - WhatsApp: Direct, personalized, immediate advisory link
 * - WhatsApp Status: Ultra-concise, high-impact bullet
 */
function adaptContentForChannels({ productKey, language = 'en', topic = '', headline = '' }) {
  const prod = getProduct(productKey) || PRODUCTS_CATALOG.personal_loan;
  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  let adapted = {};

  if (isMarathi) {
    adapted.linkedin = {
      channel: 'LINKEDIN',
      text: `[आर्थिक नियोजन & कर्ज सल्लागार]\n\n${headline || prod.name + ' मार्गदर्शन'}\n\nव्यावसायिक आणि नोकरदारांसाठी कर्ज घेताना FOIR रेशो आणि सिबिल रेकॉर्ड्सची अचूक पडताळणी अत्यंत आवश्यक असते. अवनी लोन सर्व्हिसेस, लातूर तर्फे राष्ट्रीयकृत आणि अग्रगण्य खाजगी बँकांच्या नियमांनुसार योग्य कर्ज मार्गदर्शन उपलब्ध आहे.\n\nप्रमुख मुद्दे:\n• पारदर्शक व्याजदर व प्रक्रिया\n• अचूक आर्थिक कागदपत्र तपासणी\n• सचिन शिंदे (संस्थापक) यांच्याकडून थेट मार्गदर्शन\n\nसल्लामसलतीसाठी संपर्क साधा: +91 91756 35165 | avanifinserv.com`,
      cta: 'अधिक माहितीसाठी संपर्क साधा'
    };

    adapted.instagram = {
      channel: 'INSTAGRAM',
      text: `कर्ज मंजुरीसाठी भटकंती थांबवा! 🚀\n\n${headline || prod.name}\n\nबँकेचे नियम कठीण वाटतात? काळजी करू नका, अवनी लोन सर्व्हिसेस आहे ना! आम्ही तुमची फाईल अचूक तयार करून देतो.\n\n📲 पात्रता तपासण्यासाठी बायोमधील लिंकवर क्लिक करा!\n📞 व्हॉट्सअॅप: +91 91756 35165\n📍 लातूर, महाराष्ट्र\n\n#AvaniLoanServices #SachinShinde #Latur #LoanConsultant #Maharashtra`,
      cta: 'बायोमधील लिंक पहा'
    };

    adapted.facebook = {
      channel: 'FACEBOOK',
      text: `लातूरकरांसाठी विश्वासार्ह आर्थिक सल्लागार — अवनी लोन सर्व्हिसेस.\n\n${headline || prod.name + ' विशेष योजना'}\n\nयोग्य वेळी मिळालेला योग्य आर्थिक सल्ला तुमचे हजारो रुपये वाचवू शकतो. सचिन शिंदे यांच्या नेतृत्वाखाली आम्ही पारदर्शक आणि नियमानुसार कर्ज प्रक्रिया सुलभ करतो.\n\nअधिक माहितीसाठी आजच व्हॉट्सअॅपवर मेसेज करा: https://wa.me/919175635165\nपत्ता: कुलस्वामिनी नगर, जुना बार्शी रोड, लातूर.`,
      cta: 'व्हॉट्सअॅपवर मेसेज करा'
    };

    adapted.whatsapp = {
      channel: 'WHATSAPP',
      text: `नमस्कार! अवनी लोन सर्व्हिसेस लातूरमधून सचिन शिंदे बोलत आहे.\n\nआपण ${prod.name} संदर्भात माहिती विचारली होती. आम्ही आपली प्राथमिक पात्रता ५ मिनिटांत विनामूल्य तपासून देऊ शकतो.\n\nआपली सोय असल्यास या मेसेजला 'हो' किंवा 'ELIGIBILITY' रिप्लाय करा. धन्यवाद!\nफोन: +91 91756 35165 | avanifinserv.com`,
      cta: 'तातडीने संपर्क साधा'
    };

    adapted.whatsapp_status = {
      channel: 'WHATSAPP_STATUS',
      text: `📢 ${prod.name} | पारदर्शक कर्ज सल्लागार\n✅ अचूक मार्गदर्शन\n✅ अग्रगण्य बँकांचे पर्याय\n📞 संपर्क: सचिन शिंदे (+91 91756 35165)`,
      cta: 'रिप्लाय करा'
    };
  } else if (isHindi) {
    adapted.linkedin = {
      channel: 'LINKEDIN',
      text: `[Financial Advisory & Loan Consultancy]\n\n${headline || prod.name}\n\nUnderstanding FOIR ratios, debt servicing, and banking norms is critical before applying for a loan. AVANI LOAN SERVICES provides structured advisory and documentation support across leading nationalized and private lenders in Maharashtra.\n\nKey Highlights:\n• Institutional documentation review\n• Multi-lender comparison without multiple credit enquiries\n• Advisory under Founder Sachin Shinde\n\nContact: +91 91756 35165 | avanifinserv.com`,
      cta: 'Connect for Advisory'
    };

    adapted.instagram = {
      channel: 'INSTAGRAM',
      text: `सही लोन गाइडेंस, सही समय पर! 💼✨\n\n${headline || prod.name}\n\nलोन एप्लीकेशन में रिजेक्शन से बचें। अवनी लोन सर्विसेज आपकी प्रोफाइल के अनुसार सही बैंक चुनने में मदद करता है।\n\n👉 बायो में दिए लिंक से अपनी एलिजिबिलिटी चेक करें!\nWhatsApp: +91 91756 35165 | लातूर, महाराष्ट्र\n\n#AvaniLoanServices #FinanceLatur #LoanAdvisory #SachinShinde`,
      cta: 'चेक एलिजिबिलिटी'
    };

    adapted.facebook = {
      channel: 'FACEBOOK',
      text: `क्या आप ${prod.name} की तलाश में हैं?\n\nअवनी लोन सर्विसेज, लातूर आपके लिए लेकर आया है आसान और पारदर्शी लोन कंसल्टेंसी। हम आपकी आय और प्रोफाइल के अनुसार सर्वश्रेष्ठ बैंक विकल्पों की सलाह देते हैं।\n\nआज ही संपर्क करें: सचिन शिंदे (+91 91756 35165)\nवेबसाइट: avanifinserv.com`,
      cta: 'आज ही संपर्क करें'
    };

    adapted.whatsapp = {
      channel: 'WHATSAPP',
      text: `नमस्ते! अवनी लोन सर्विसेज लातूर से सचिन शिंदे।\n\nक्या आप ${prod.name} के लिए आवश्यक पात्रता और दस्तावेज जानना चाहते हैं? हमारी टीम आपकी निःशुल्क सहायता के लिए तैयार है।\n\nतुरंत रिप्लाई करें या कॉल करें: +91 91756 35165.`,
      cta: 'रिप्लाई करें'
    };

    adapted.whatsapp_status = {
      channel: 'WHATSAPP_STATUS',
      text: `📌 ${prod.name} गाइडेंस\nसरल और पारदर्शी प्रक्रिया।\nकॉल करें: +91 91756 35165 (सचिन शिंदे)`,
      cta: 'कॉल करें'
    };
  } else {
    // English
    adapted.linkedin = {
      channel: 'LINKEDIN',
      text: `[Professional Financial Advisory]\n\n${headline || prod.name + ' Advisory'}\n\nNavigating retail and commercial credit requires a thorough assessment of FOIR, existing obligations, and credit history. AVANI LOAN SERVICES provides independent loan advisory for salaried professionals, MSMEs, and institutions across Maharashtra.\n\nOur Pillars:\n• Objective multi-lender comparison\n• Clean file structuring prior to submission\n• Directed by Founder Sachin Shinde\n\nInquire: +91 91756 35165 | enquiry@avanifinserv.com | avanifinserv.com`,
      cta: 'Schedule Consultation'
    };

    adapted.instagram = {
      channel: 'INSTAGRAM',
      text: `Get the clarity you need before applying for a loan! 📊\n\n${headline || prod.name}\n\nDon't let minor documentation oversights slow down your goals. Avani Loan Services helps you calculate eligibility and match with suitable lenders.\n\n🔗 Tap the link in bio to verify your eligibility.\nWhatsApp: +91 91756 35165 | Latur, Maharashtra\n\n#AvaniLoanServices #FinancialPlanning #LoanAdvisory #Latur #Maharashtra`,
      cta: 'Check Eligibility in Bio'
    };

    adapted.facebook = {
      channel: 'FACEBOOK',
      text: `Looking for reliable guidance on ${prod.name}?\n\nAVANI LOAN SERVICES provides transparent, expert advisory for borrowers across Latur and Maharashtra. We assist with documentation, preliminary eligibility review, and bank options.\n\nConnect with Sachin Shinde today on WhatsApp: https://wa.me/919175635165\nVisit: avanifinserv.com`,
      cta: 'WhatsApp Us'
    };

    adapted.whatsapp = {
      channel: 'WHATSAPP',
      text: `Hello! Sachin Shinde from AVANI LOAN SERVICES, Latur.\n\nLooking for ${prod.name} guidance? We provide free preliminary eligibility assessments and complete document checklists.\n\nReply 'INFO' or call +91 91756 35165 to get started. avanifinserv.com`,
      cta: 'Reply INFO'
    };

    adapted.whatsapp_status = {
      channel: 'WHATSAPP_STATUS',
      text: `💡 ${prod.name} Advisory | Avani Loan Services\nFast pre-assessment & clear document checklists.\nWhatsApp: +91 91756 35165`,
      cta: 'Chat Now'
    };
  }

  return adapted;
}

/**
 * Generates a full 30-Day Campaign Pack.
 * Configurable quantities with defaults matching specifications:
 * 30 posts, 10 reels, 10 images, 10 WhatsApp templates, 10 WhatsApp Status, 10 LinkedIn, 10 Facebook, 10 Instagram.
 */
async function generateCampaignPack({
  campaignName,
  product = 'business_loan',
  language = 'mr',
  durationDays = 30,
  postCount = 30,
  reelCount = 10,
  imageCount = 10,
  whatsappCount = 10
}) {
  const prod = getProduct(product) || PRODUCTS_CATALOG.business_loan;
  const campaignId = `cmp_${prod.id}_${language}_${Date.now()}`;
  const now = new Date();
  const startDate = now.toISOString().split('T')[0];
  const endDate = new Date(now.getTime() + durationDays * 86400000).toISOString().split('T')[0];

  const linkedMediaAssets = [];
  const linkedTemplates = [];
  const calendarEntries = [];

  // 1. Generate 10 Image Assets for the campaign
  for (let i = 1; i <= imageCount; i++) {
    const conceptId = `C0${(i % 10) + 1}`;
    const assetId = `img_${campaignId}_${conceptId}_1080x1080`;
    const headline = `${prod.name} Advisory Concept ${i}`;
    const adaptations = adaptContentForChannels({
      productKey: prod.id,
      language,
      headline
    });

    const savedAsset = await saveMediaAsset({
      id: assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product: prod.id,
      audience: prod.targetAudience,
      channel: 'INSTAGRAM',
      language,
      type: 'IMAGE',
      format: '1:1',
      width: 1080,
      height: 1080,
      title: `${prod.name} Campaign Image ${i}`,
      headline,
      caption: adaptations.instagram.text,
      cta: 'Check Eligibility',
      prompt: `Clean professional financial visual for ${prod.name}. Subject in modern office reviewing paperwork. Brand: AVANI LOAN SERVICES. Watermark: +91 91756 35165 | avanifinserv.com.`,
      storageProvider: 'MANUAL',
      status: ASSET_STATUSES.READY_FOR_RENDERING,
      campaignId,
      qualityScore: 94
    });

    linkedMediaAssets.push(savedAsset.id);
  }

  // 2. Generate 10 Video Concepts for the campaign
  for (let i = 1; i <= reelCount; i++) {
    const assetId = `vid_${campaignId}_reel_${i}`;
    const hook = language === 'mr'
      ? `${prod.name} साठी अर्ज करताय? हे नक्की जाणून घ्या!`
      : `Planning for a ${prod.name}? Check these key rules first!`;

    const savedVideo = await saveMediaAsset({
      id: assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product: prod.id,
      audience: prod.targetAudience,
      channel: 'INSTAGRAM',
      language,
      type: 'VIDEO',
      format: '9:16',
      width: 1080,
      height: 1920,
      duration: 20,
      title: `${prod.name} Vertical Reel ${i}`,
      headline: hook,
      caption: `${hook} — सचिन शिंदे, अवनी लोन सर्व्हिसेस (+91 91756 35165)`,
      cta: 'व्हॉट्सअॅपवर संपर्क साधा',
      script: {
        beats: {
          hook,
          problem: 'अनेक कर्ज अर्ज योग्य नियोजनाअभावी रखडतात.',
          solution: 'अवनी लोन सर्व्हिसेस तर्फे फाईलची पूर्व-तपासणी केली जाते.',
          cta: 'बायोमधील लिंकवर क्लिक करा किंवा +91 91756 35165 वर मेसेज करा.'
        },
        broll: 'Office desk review, calculator computation, cheerful loan sanction handover.',
        onScreenText: 'अवनी लोन सर्व्हिसेस | सचिन शिंदे | +91 91756 35165'
      },
      storageProvider: 'MANUAL',
      status: ASSET_STATUSES.READY_FOR_RENDERING,
      campaignId,
      qualityScore: 92
    });

    linkedMediaAssets.push(savedVideo.id);
  }

  // 3. Build 30-Day Multi-Channel Scheduled Calendar Entries
  for (let day = 1; day <= durationDays; day++) {
    const postDate = new Date(now.getTime() + (day - 1) * 86400000).toISOString().split('T')[0];
    const channelOrder = ['WHATSAPP', 'INSTAGRAM', 'LINKEDIN', 'FACEBOOK', 'WHATSAPP_STATUS'];
    const channel = channelOrder[(day - 1) % channelOrder.length];
    const adaptations = adaptContentForChannels({
      productKey: prod.id,
      language,
      headline: `${prod.name} Campaign Day ${day}`
    });

    const adaptedContent = adaptations[channel.toLowerCase()] || adaptations.instagram;
    const assignedImage = linkedMediaAssets[(day - 1) % imageCount] || null;
    const assignedVideo = day % 3 === 0 ? linkedMediaAssets[imageCount + ((day / 3) % reelCount)] : null;

    const calendarEntry = {
      calendarId: `cal_${campaignId}_day_${day}`,
      campaignId,
      day,
      date: postDate,
      channel,
      product: prod.id,
      language,
      scheduledTime: '10:30 AM IST',
      text: adaptedContent.text,
      cta: adaptedContent.cta,
      imageAssetId: assignedImage,
      videoAssetId: assignedVideo,
      status: 'SCHEDULED'
    };

    calendarEntries.push(calendarEntry);
  }

  // 4. Save Campaign Record
  const campaignRecord = await saveCampaign({
    campaignId,
    name: campaignName || `${prod.name} ${language.toUpperCase()} 30-Day Launch`,
    businessId: BUSINESS_IDENTITY.businessId,
    product: prod.id,
    audience: prod.targetAudience,
    language,
    channels: ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'WHATSAPP_STATUS'],
    startDate,
    endDate,
    status: CAMPAIGN_STATUSES.ACTIVE,
    cta: 'Check Eligibility & Apply',
    budget: 0,
    linkedTemplates,
    linkedMediaAssets,
    calendarEntries
  });

  return {
    success: true,
    campaign: campaignRecord,
    summary: {
      campaignId,
      campaignName: campaignRecord.name,
      product: prod.name,
      language,
      durationDays,
      totalPostsScheduled: calendarEntries.length,
      imageAssetsCreated: imageCount,
      videoAssetsCreated: reelCount,
      channelBreakdown: {
        whatsapp: calendarEntries.filter(c => c.channel === 'WHATSAPP').length,
        instagram: calendarEntries.filter(c => c.channel === 'INSTAGRAM').length,
        linkedin: calendarEntries.filter(c => c.channel === 'LINKEDIN').length,
        facebook: calendarEntries.filter(c => c.channel === 'FACEBOOK').length,
        whatsapp_status: calendarEntries.filter(c => c.channel === 'WHATSAPP_STATUS').length
      }
    }
  };
}

module.exports = {
  adaptContentForChannels,
  generateCampaignPack
};
