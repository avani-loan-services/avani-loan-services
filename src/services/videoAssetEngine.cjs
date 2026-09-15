// src/services/videoAssetEngine.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — 300 Video Concepts & Storyboard Asset Engine
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG, ALL_PRODUCT_KEYS } = require('../config/productsCatalog.cjs');

const VIDEO_CATEGORIES = Object.freeze({
  SHORT_REEL: { code: 'REEL', count: 10, defaultDuration: 15, format: '9:16 Vertical Reel' },
  EDUCATIONAL: { code: 'EDU', count: 5, defaultDuration: 30, format: '9:16 Vertical Reel' },
  FAQ: { code: 'FAQ', count: 5, defaultDuration: 30, format: '9:16 Vertical Reel' },
  PROBLEM_SOLUTION: { code: 'PROBSOL', count: 5, defaultDuration: 40, format: '9:16 Vertical Reel' },
  LEAD_GEN: { code: 'LEAD', count: 5, defaultDuration: 20, format: '9:16 Vertical Reel' }
});

const VIDEO_THEMES_BY_PRODUCT = {
  personal_loan: {
    reels: [
      { hook: 'पगार चांगला आहे पण पर्सनल लोन मिळत नाहीये?', prob: 'FOIR रेशो आणि सिबिलमधील छोट्या चुका अडथळा ठरतात.', sol: 'अवनी लोन सर्व्हिसेस बँक-स्पेसिफिक प्री-असेसमेंट करून देते.', cta: 'पात्रता तपासण्यासाठी बायोमधील लिंकवर क्लिक करा!' },
      { hook: '36% क्रेडिट कार्ड चक्रव्यूहात अडकला आहात का?', prob: 'दरमहा मिनिमम ड्यु भरल्याने कर्ज संपत नाही.', sol: 'पर्सनल लोनद्वारे कार्डचे कर्ज एकाच कमी ईएमआयमध्ये बदला.', cta: 'आजच सचिन शिंदे यांच्याशी संपर्क साधा.' },
      { hook: 'इमर्जन्सीसाठी तातडीने पर्सनल लोन हवंय?', prob: 'बँकेत वारंवार फेऱ्या मारून वेळ वाया जातो.', sol: 'फक्त ४ कागदपत्रांवर जलद पडताळणी अवनी लोन सर्व्हिसेसमध्ये होते.', cta: 'व्हॉट्सअॅपवर संपर्क करा: +91 91756 35165.' },
      { hook: 'लोन अप्लाय करण्यापूर्वी हे नक्की तपासा!', prob: 'एकाच वेळी ५ बँकांमध्ये अर्ज केल्याने सिबिल घसरतो.', sol: 'अवनी लोन सर्व्हिसेस एकाच ठिकाणी सर्व बँकांची पडताळणी करते.', cta: 'मोफत सल्लामसलत बुक करा.' },
      { hook: 'लग्नासाठी किंवा घर नूतनीकरणासाठी बजेट कमी पडतंय?', prob: 'ऐन वेळी पैशांची तडजोड करावी लागते.', sol: '१ ते ५ वर्षांच्या मुदतीचे सोपे पर्सनल लोन पर्याय उपलब्ध.', cta: 'आजच तुमचा ईएमआय तपासा.' },
      { hook: 'सिबिल स्कोअर ७५०+ आहे का?', prob: 'चांगला स्कोअर असूनही जुन्या व्याजदरावर कर्ज भरत आहात का?', sol: 'उत्कृष्ट सिबिलसाठी कमी व्याजदराच्या विशेष ऑफर्स मिळवा.', cta: 'आता कॉल करा: +91 91756 35165.' },
      { hook: 'सॅलरी अकाउंट कोणत्या बँकेत आहे?', prob: 'प्रत्येक बँकेचे FOIR नियम वेगवेगळे असतात.', sol: 'तुमच्या पगारासाठी कोणती बँक सर्वोत्कृष्ट आहे ते आम्ही शोधतो.', cta: 'वेबसाईट पहा: avanifinserv.com.' },
      { hook: 'लोन रिजेक्शन टाळायचे ३ सोपे नियम!', prob: 'अपूर्ण डॉक्युमेंट्स आणि चुकीचा इन्कम रेशो यामुळे फाईल नाकारली जाते.', sol: 'आमची तज्ज्ञ टीम फाईल अचूक तयार करून बँकेत सादर करते.', cta: 'अवनी लोन सर्व्हिसेस लातूरला भेट द्या.' },
      { hook: 'पर्सनल लोनसाठी कोणते ४ कागदपत्रे लागतात?', prob: 'नेमके काय सादर करायचे यात गोंधळ होतो.', sol: 'पॅन, आधार, ३ महिन्यांची सॅलरी स्लिप आणि ६ महिन्यांचे बँक स्टेटमेंट.', cta: 'डॉक्युमेंट लिस्टसाठी हाय पाठवा.' },
      { hook: 'लातूरकरांसाठी पारदर्शक आर्थिक सल्लागार!', prob: 'कर्ज प्रक्रियेतील लपवलेले खर्च आणि अटी समजणे कठीण.', sol: 'सचिन शिंदे यांच्याकडून १००% पारदर्शक मार्गदर्शन.', cta: 'आजच संपर्क साधा.' }
    ],
    educational: [
      { topic: 'FOIR म्हणजे काय आणि तो कसा ठरवला जातो?', dur: 30 },
      { topic: 'पर्सनल लोन घेताना व्याजदर आणि APR कसा तपासावा?', dur: 30 },
      { topic: 'क्रेडिट कार्ड रोलओव्हर विरूद्ध पर्सनल लोन तुलना', dur: 30 },
      { topic: 'सिबिलमधील DPD आणि लेट पेमेंटचे दुष्परिणाम', dur: 30 },
      { topic: 'सॅलरी खात्यावर पर्सनल लोन घेताना घ्यावयाची काळजी', dur: 30 }
    ],
    faqs: [
      { q: 'पर्सनल लोनसाठी किमान किती पगार आवश्यक असतो?', a: 'साधारणपणे दरमहा ₹15,000 ते ₹25,000 नेट इन-हँड पगार आवश्यक असतो.' },
      { q: 'सिबिल स्कोअर कमी असल्यास पर्सनल लोन मिळते का?', a: '६५० च्या खाली असल्यास अटी कडक असतात, परंतु आम्ही प्रोफाइल सुधारण्याचे मार्गदर्शन करतो.' },
      { q: 'पर्सनल लोन मंजुरीसाठी किती वेळ लागतो?', a: 'कागदपत्रे पूर्ण असल्यास २४ ते ४८ तासांत तत्त्वतः मंजुरी शक्य असते.' },
      { q: 'कर्ज मुदतपूर्व बंद (Foreclosure) करता येते का?', a: 'होय, रिझर्व्ह बँक नियमांनुसार फ्लोटिंग दरांवर फोरक्लोजर चार्जेस नसतात.' },
      { q: 'अवनी लोन सर्व्हिसेसमध्ये मार्गदर्शन शुल्क किती आहे?', a: 'प्राथमिक सल्लामसलत आणि पात्रता तपासणी विनामूल्य आहे.' }
    ],
    problemSolution: [
      { prob: 'अचानक आलेला वैद्यकीय खर्च आणि तुटपुंजी बचत', sol: '४८ तासांत आपत्कालीन पर्सनल लोन वाटप आणि हॉस्पिटल पेमेंट सोय.' },
      { prob: 'अनेक छोट्या कर्जांचे दरमहा वाढणारे ईएमआय ओझे', sol: 'एकाच दीर्घमुदतीच्या पर्सनल लोनमध्ये सर्व कर्जांचे एकत्रीकरण.' },
      { prob: 'नवीन शहरात शिफ्ट होताना डिपॉझिट आणि फर्निचरचा खर्च', sol: 'लवचिक मुदतीचे लाइफस्टाइल व शिफ्टिंग लोन.' },
      { prob: 'मल्टिपल रिजेक्शनमुळे सिबिल खराब होण्याची भीती', sol: 'सिंगल विंडो प्री-असेसमेंटने सिबिल सुरक्षित ठेवून बँक निवड.' },
      { prob: 'कागदपत्रांची खात्री नसणे', sol: 'लातूर ऑफिसमध्ये सचिन शिंदे यांच्याकडून प्रत्यक्ष कागदपत्र तपासणी.' }
    ],
    leadGen: [
      { hook: '५ मिनिटांत तुमची पर्सनल लोन पात्रता तपासा!', cta: 'व्हॉट्सअॅपवर "ELIGIBILITY" पाठवा.' },
      { hook: 'कमी व्याजदराचा पर्सनल लोन पर्याय शोधत आहात?', cta: 'आमच्या सल्लागारांचा कॉल मिळवा.' },
      { hook: 'लातूरमधील नोकरदारांसाठी विशेष पर्सनल लोन योजना!', cta: 'आजच भेट द्या: कुलस्वामिनी नगर, लातूर.' },
      { hook: 'तुमच्या जुन्या कर्जाचा ईएमआय कमी करायचा आहे का?', cta: 'आता मोफत सल्ला घ्या.' },
      { hook: 'Sachin Shinde - Avani Loan Services Latur', cta: 'कॉल करा: +91 91756 35165.' }
    ]
  },

  business_loan: {
    reels: [
      { hook: 'ऑर्डर्स भरपूर आहेत पण कच्चा माल घ्यायला निधी नाही?', prob: 'वर्किंग कॅपिटल तुटवड्यामुळे व्यवसायाची प्रगती थांबते.', sol: 'जीएसटी आणि बँकिंग टर्नओव्हरवर अनसिक्युअर्ड बिझनेस लोन मिळवा.', cta: 'बिझनेस लिमिट तपासण्यासाठी संपर्क करा.' },
      { hook: 'दुकानासाठी किंवा फॅक्टरीसाठी नवीन मशिनरी खरेदी करायची आहे?', prob: 'मोठे कॅपिटल एकाच वेळी गुंतवणे परवडत नाही.', sol: 'मशिनरी लोनद्वारे हप्त्यांमध्ये पेमेंट करा.', cta: 'अवनी लोन सर्व्हिसेस लातूरला भेटा.' },
      { hook: 'बिझनेस लोनसाठी प्रॉपर्टी मॉर्गिज ठेवणं सक्तीचं आहे का?', prob: 'प्रॉपर्टी नसल्याने अनेक व्यापारी अर्ज करत नाहीत.', sol: '२ कोटींपर्यंतचे कोलेटरल-फ्री बिझनेस लोन उपलब्ध.', cta: 'आजच संपर्क साधा: +91 91756 35165.' },
      { hook: 'जीएसटी भरताय? मग तुमची लोन पात्रता तपासा!', prob: 'टर्नओव्हर चांगला असूनही बँकेकडून पुरेसे लिमिट मिळत नाही.', sol: 'अवनी लोन सर्व्हिसेस तुमची बँकिंग पॉवर वाढवून देते.', cta: 'कॉल करा: +91 91756 35165.' },
      { hook: 'सणासुदीच्या हंगामासाठी जादा स्टॉक भरायचा आहे?', prob: 'पेमेंट सायकल अडकल्याने ऐन वेळी भांडवल कमी पडते.', sol: 'शॉर्ट-टर्म इन्व्हेंटरी वर्किंग कॅपिटल सोय उपलब्ध.', cta: 'आताच सल्लामसलत बुक करा.' },
      { hook: 'व्यवसाय २ वर्षांपेक्षा जुना आहे का?', prob: 'बिझनेस व्हिंटेजचा योग्य फायदा बँकांकडून मिळत नाही का?', sol: 'जुना व्यवसाय असणाऱ्यांसाठी कमी व्याजदर ब्रॅकेट्स मिळवा.', cta: 'अधिक माहितीसाठी व्हॉट्सअॅप करा.' },
      { hook: 'बँकेतील चेक बाउन्समुळे बिझनेस लोन अडकते का?', prob: 'मागील ६ महिन्यांतील १-२ बाउन्समुळे फाईल नाकारली जाते.', sol: 'आम्ही तुमची बँकिंग हिस्ट्री सुधारण्याचे मार्ग सुचवतो.', cta: 'आजच फाईल रिव्ह्यू करून घ्या.' },
      { hook: 'नवीन ब्रँच किंवा शोरूम सुरू करायचे आहे?', prob: 'इंटेरिअर आणि सिक्युरिटी डिपॉझिटसाठी मोठा निधी लागतो.', sol: 'बिझनेस एक्सपँशन टर्म लोनद्वारे स्वप्न साकार करा.', cta: 'सचिन शिंदे यांच्याशी चर्चा करा.' },
      { hook: 'बॅलन्स शीट आणि आयटीआर तज्ज्ञांकडून तयार करून घ्या!', prob: 'अयोग्य रेशोंमुळे बँक फायनान्स नाकारते.', sol: 'अवनी लोन सर्व्हिसेस बँक-अँप्रूव्ह्ड फॉरमॅटमध्ये फाईल तयार करते.', cta: 'लातूर ऑफिसला भेट द्या.' },
      { hook: 'लातूर आणि मराठवाड्यातील उद्योजकांचा विश्वासू भागीदार!', prob: 'स्थानिक स्तरावर योग्य सल्लागार मिळत नाही.', sol: 'अवनी लोन सर्व्हिसेस - सचिन शिंदे.', cta: 'भेट द्या: कुलस्वामिनी नगर, लातूर.' }
    ],
    educational: [
      { topic: 'वर्किंग कॅपिटल विरूद्ध टर्म लोन - व्यवसायासाठी काय योग्य?', dur: 35 },
      { topic: 'अ‍ॅव्हरेज बँकिंग बॅलन्स (ABB) बिझनेस लोनमध्ये का महत्त्वाचा असतो?', dur: 30 },
      { topic: 'एमएसएमई (MSME) उद्योग आधार नोंदणीचे लोन फायदे', dur: 30 },
      { topic: 'जीएसटी रिटर्न्सच्या आधारे बिझनेस लोन कसे मोजले जाते?', dur: 35 },
      { topic: 'अनसिक्युअर्ड बिझनेस लोनसाठी आवश्यक कागदपत्रे', dur: 30 }
    ],
    faqs: [
      { q: 'बिझनेस लोनसाठी किती वर्षांचा व्यवसाय असावा लागतो?', a: 'किमान २ ते ३ वर्षांचा नोंदणीकृत व्यवसाय आणि जीएसटी असणे उत्तम.' },
      { q: 'प्रॉपर्टी गहाण न ठेवता बिझनेस लोन मिळते का?', a: 'होय, पात्रता असल्यास ₹५ लाखांपासून ₹२ कोटींपर्यंत अनसिक्युअर्ड लोन मिळते.' },
      { q: 'करंट अकाउंट टर्नओव्हर किती असावा?', a: 'वार्षिक ₹२५ लाखांपेक्षा जास्त टर्नओव्हर असल्यास चांगल्या ऑफर्स मिळतात.' },
      { q: 'नवीन भागीदारी संस्थेला (Partnership) कर्ज मिळते का?', a: 'होय, पार्टनरशिप डीड आणि भागीदारांच्या केवायसी आधारे कर्ज शक्य आहे.' },
      { q: 'लोन मंजूर होण्यासाठी किती दिवस लागतात?', a: 'सर्व कागदपत्रे योग्य असल्यास ३ ते ५ कामकाजाच्या दिवसांत मंजुरी मिळते.' }
    ],
    problemSolution: [
      { prob: 'पेमेंट सायकल लांबल्याने कामगारांचे पगार आणि खर्च अडकणे', sol: 'रिव्हॉल्व्हिंग वर्किंग कॅपिटल ओव्हरड्राफ्ट सुविधा.' },
      { prob: 'मोठ्या कॉर्पोरेट टेंडरसाठी सुरक्षा ठेव व ईएमडी भरणे', sol: 'शॉर्ट-टर्म बिझनेस क्रेडिट लाईन.' },
      { prob: 'जुन्या यंत्रसामग्रीमुळे उत्पादन क्षमता घटणे', sol: 'हायटेक मशिनरी लोन आणि इक्विपमेंट फायनान्स.' },
      { prob: 'अनेक वेगवेगळ्या ठिकाणांहून घेतलेल्या महागड्या कर्जांचा त्रास', sol: 'बिझनेस डेब्ट कन्सॉलिडेशन लोन.' },
      { prob: 'प्रॉपर्टी कागदपत्रांची अडचण', sol: 'शुद्ध टर्नओव्हर व बँकिंग आधारित कोलेटरल-फ्री लोन पर्याय.' }
    ],
    leadGen: [
      { hook: 'तुमच्या व्यवसायासाठी ₹१० लाखांपासून ₹२ कोटींपर्यंत बिझनेस लोन!', cta: 'व्हॉट्सअॅपवर संपर्क करा.' },
      { hook: 'जीएसटी आणि बँकिंगवर आधारित बिझनेस लोन मिळवा.', cta: 'पात्रता तपासा.' },
      { hook: 'मशिनरी खरेदीसाठी विशेष कर्ज योजना.', cta: 'आजच कोटेशन मिळवा.' },
      { hook: 'Sachin Shinde - Business Loan Consultant Latur', cta: 'कॉल करा: +91 91756 35165.' },
      { hook: 'अवनी लोन सर्व्हिसेस - उद्योजक प्रगतीचे पाऊल!', cta: 'भेट द्या avanifinserv.com.' }
    ]
  }
};

/**
 * Generate 30 Video Concepts for any given product
 * (10 Short Reels, 5 Educational, 5 FAQ, 5 Problem/Solution, 5 Lead Gen)
 */
function generateProductVideoConcepts(productId, language = 'en') {
  const product = PRODUCTS_CATALOG[productId];
  if (!product) throw new Error(`Product not found: ${productId}`);

  const pCode = product.code;
  const pName = product.name;
  const themes = VIDEO_THEMES_BY_PRODUCT[productId] || VIDEO_THEMES_BY_PRODUCT.personal_loan;

  const videoList = [];
  let counter = 1;

  // 1. 10 Short Reels (15-20s)
  for (let i = 0; i < 10; i++) {
    const reelData = (themes.reels && themes.reels[i]) || {
      hook: `Looking for a trusted ${pName}?`,
      prob: 'Comparing multiple lenders takes weeks of running around.',
      sol: 'Avani Loan Services provides clear multi-bank pre-assessment in Latur.',
      cta: 'WhatsApp +91 91756 35165 today!'
    };

    videoList.push({
      videoId: `ALS-${pCode}-VID-REEL-${String(counter).padStart(2, '0')}-${language.toUpperCase()}`,
      product: productId,
      category: 'SHORT_REEL',
      audience: product.targetAudience,
      language,
      duration: '15-20 sec',
      aspectRatio: '9:16',
      hook: reelData.hook,
      problem: reelData.prob,
      solution: reelData.sol,
      cta: reelData.cta,
      voiceOver: `${reelData.hook} ${reelData.prob} ${reelData.sol} ${reelData.cta}`,
      onScreenText: `${pName} | Avani Loan Services | +91 91756 35165`,
      bRoll: 'Advisor reviewing loan documents on clean desk, cutting to satisfied client handshake.',
      cameraDirection: 'Quick punchy zoom into camera for hook, cut to desk B-roll, closing with branded contact screen.',
      caption: `Planning your ${pName}? Contact Sachin Shinde at Avani Loan Services Latur for transparent advisory.`,
      hashtags: `#AvaniLoanServices #${pCode}Loan #Latur #FinanceAdvisory #SachinShinde`,
      videoPrompt: `Cinematic 9:16 vertical video of Indian financial advisor in modern office addressing client with warm authoritative presence. Professional lighting.`
    });
    counter++;
  }

  // 2. 5 Educational Videos (30s)
  for (let i = 0; i < 5; i++) {
    const edu = (themes.educational && themes.educational[i]) || {
      topic: `Key Factors in ${pName} Approval`,
      dur: 30
    };

    videoList.push({
      videoId: `ALS-${pCode}-VID-EDU-${String(counter).padStart(2, '0')}-${language.toUpperCase()}`,
      product: productId,
      category: 'EDUCATIONAL',
      audience: product.targetAudience,
      language,
      duration: `${edu.dur} sec`,
      aspectRatio: '9:16',
      hook: `Here are the top things to understand before applying for a ${pName}.`,
      problem: 'Most rejections happen due to simple documentation mismatches.',
      solution: `Topic: ${edu.topic}. Avani Loan Services guides you through every step before bank submission.`,
      cta: 'Book your free advisory session today at avanifinserv.com.',
      voiceOver: `Thinking about a ${pName}? Here are critical facts regarding ${edu.topic} you must evaluate before applying.`,
      onScreenText: `Educational Guide: ${edu.topic} | Avani Loan Services`,
      bRoll: 'Whiteboard or digital tablet demonstrating loan calculation breakdown and eligibility formula.',
      cameraDirection: 'Medium portrait framing of advisor explaining concept clearly with subtle graphic callouts appearing on screen.',
      caption: `Educational series on ${pName} by Avani Loan Services, Latur. Topic: ${edu.topic}.`,
      hashtags: `#FinancialEducation #${pCode}Loan #AvaniLoanServices #LaturAdvisory`,
      videoPrompt: `Modern vertical corporate training aesthetic, presenter explaining financial infographic on screen.`
    });
    counter++;
  }

  // 3. 5 FAQ Videos (30s)
  for (let i = 0; i < 5; i++) {
    const faq = (themes.faqs && themes.faqs[i]) || {
      q: `What is the eligibility criteria for ${pName}?`,
      a: 'Eligibility is calculated based on income, credit profile, and existing obligations.'
    };

    videoList.push({
      videoId: `ALS-${pCode}-VID-FAQ-${String(counter).padStart(2, '0')}-${language.toUpperCase()}`,
      product: productId,
      category: 'FAQ',
      audience: product.targetAudience,
      language,
      duration: '30 sec',
      aspectRatio: '9:16',
      hook: `FAQ: ${faq.q}`,
      problem: 'Clients often ask this question during their first consultation.',
      solution: faq.a,
      cta: 'Got more questions? Message us on WhatsApp: +91 91756 35165.',
      voiceOver: `Frequently asked question: ${faq.q} Here is the clear answer from Avani Loan Services: ${faq.a}`,
      onScreenText: `Q: ${faq.q}\nA: ${faq.a}`,
      bRoll: 'Customer asking question in consultation room, advisor answering calmly with smile.',
      cameraDirection: 'Over-the-shoulder conversation shot transitioning to direct-to-camera solution.',
      caption: `Frequently Asked Questions about ${pName} with Sachin Shinde, Avani Loan Services.`,
      hashtags: `#FAQ #${pCode}Loan #AvaniFinserv #LaturLoanAdvisory`,
      videoPrompt: `Professional office FAQ explainer video, natural conversation aesthetic.`
    });
    counter++;
  }

  // 4. 5 Problem/Solution Videos (40s)
  for (let i = 0; i < 5; i++) {
    const ps = (themes.problemSolution && themes.problemSolution[i]) || {
      prob: `Managing unexpected funding gaps for ${pName}`,
      sol: `Customized multi-lender credit structuring by Avani Loan Services.`
    };

    videoList.push({
      videoId: `ALS-${pCode}-VID-PROBSOL-${String(counter).padStart(2, '0')}-${language.toUpperCase()}`,
      product: productId,
      category: 'PROBLEM_SOLUTION',
      audience: product.targetAudience,
      language,
      duration: '40 sec',
      aspectRatio: '9:16',
      hook: `Facing this issue? ${ps.prob}`,
      problem: 'Financial stress builds when funding is delayed or improperly structured.',
      solution: `Here is our proven approach: ${ps.sol}`,
      cta: 'Let us solve your loan challenge. Connect on WhatsApp today.',
      voiceOver: `Are you dealing with ${ps.prob}? Don't worry. Avani Loan Services provides ${ps.sol}.`,
      onScreenText: `Problem: ${ps.prob}\nSolution: ${ps.sol}`,
      bRoll: 'Before: Stressed applicant looking at paperwork. After: Relaxed applicant shaking hands in Avani office.',
      cameraDirection: 'Story-driven visual contrast moving from problem setup to reassuring resolution.',
      caption: `Solving common ${pName} hurdles in Maharashtra. Avani Loan Services, Latur.`,
      hashtags: `#LoanHelp #${pCode}Loan #AvaniLoanServices #ProblemSolved`,
      videoPrompt: `Narrative financial transformation video, cinematic emotional arc from concern to confidence.`
    });
    counter++;
  }

  // 5. 5 Lead-Generation Videos (20s)
  for (let i = 0; i < 5; i++) {
    const lg = (themes.leadGen && themes.leadGen[i]) || {
      hook: `Check your ${pName} eligibility in 5 minutes!`,
      cta: 'WhatsApp us at +91 91756 35165 now.'
    };

    videoList.push({
      videoId: `ALS-${pCode}-VID-LEAD-${String(counter).padStart(2, '0')}-${language.toUpperCase()}`,
      product: productId,
      category: 'LEAD_GEN',
      audience: product.targetAudience,
      language,
      duration: '20 sec',
      aspectRatio: '9:16',
      hook: lg.hook,
      problem: 'Avoid wasting time with banks that do not fit your profile.',
      solution: 'Avani Loan Services matches you directly with the best lender.',
      cta: lg.cta,
      voiceOver: `${lg.hook} Get dedicated advisory in Latur. ${lg.cta}`,
      onScreenText: `Fast Eligibility Check | Avani Loan Services | Latur`,
      bRoll: 'Fast-paced graphic showing loan eligibility gauge moving into pre-approved green zone.',
      cameraDirection: 'Dynamic energetic presenter with clear on-screen CTA arrow pointing to WhatsApp button.',
      caption: `Ready for your ${pName}? Message Avani Loan Services on WhatsApp for instant guidance.`,
      hashtags: `#ApplyNow #${pCode}Loan #AvaniLoanServices #Latur`,
      videoPrompt: `High-energy professional vertical call-to-action video, bright corporate blue graphics.`
    });
    counter++;
  }

  return videoList.map(v => ({
    ...v,
    productId: v.product,
    productName: pName,
    languages: ['en', 'mr', 'hi']
  }));
}


/**
 * Generate 300 Video Concepts (10 products × 30 concepts) across English, Marathi, Hindi
 */
function generateAllVideoConcepts(language = 'mr') {
  const allVideos = [];
  ALL_PRODUCT_KEYS.forEach(pKey => {
    const list = generateProductVideoConcepts(pKey, language);
    allVideos.push(...list);
  });
  return allVideos;
}

module.exports = {
  VIDEO_CATEGORIES,
  generateProductVideoConcepts,
  generateAllVideoConcepts,
  generateAllProductVideoConcepts: generateAllVideoConcepts,
  generate300VideoConcepts: generateAllVideoConcepts
};

