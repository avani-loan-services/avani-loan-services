// src/services/whatsappQualificationEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Complete AiSensy / Meta WhatsApp API Qualification & Document Engine
// Integrates: Meta WhatsApp API, AiSensy, HubSpot CRM, Zapier, 
//             Google Sheets, OmniDM / Vapi AI Calling Agent Callbacks
// ─────────────────────────────────────────────────────────────────

const axios = require('axios');
const { appendRowToGoogleSheet } = require('../utils/googleSheets.cjs');
const { syncToHubSpot } = require('../utils/hubSpot.cjs');

// In-memory conversation state store (keyed by phone number)
const conversationSessions = new Map();

// In-memory timeout store for drip campaigns (keyed by phone number)
const dripCampaignTimeouts = new Map();

const DRIP_MESSAGE = `अवनी लोन सर्व्हिसेस (AVANI LOAN SERVICES)
व्यवसायाचे नाव: अवनी लोन सर्व्हिसेस | मालक आणि संस्थापक: सचिन शिंदे | क्षेत्र: वित्तीय सेवा | कर्ज सल्लामसलत | कर्जविषयक सेवा: • वैयक्तिक कर्ज (Personal Loan) • व्यावसायिक कर्ज (Business Loan) • डॉक्टरांसाठी कर्ज (Doctor Loan) • गृहकर्ज (Home Loan) • तारण कर्ज (Mortgage Loan) • शैक्षणिक कर्ज (भारत) • शैक्षणिक कर्ज (परदेशातील शिक्षणासाठी) • शाळा आणि महाविद्यालयांसाठी अर्थसहाय्य | संपर्क तपशील: ईमेल: enquiry@avanifinserv.com | वेबसाइट: https://www.avanifinserv.com/ | व्हॉट्सॲप बिझनेस: +91 91756 35165 | कार्यालयाचा पत्ता: राजीव गांधी चौक, बँक ऑफ बडोदा समोर, मोंगीनीस केक शॉपच्या वर, औसा रोड, लातूर – ४१३५१२, महाराष्ट्र, भारत | लक्ष्यित ग्राहक: • पगारदार व्यावसायिक • व्यावसायिक/उद्योजक • डॉक्टर • चार्टर्ड अकाउंटंट्स • वास्तुविशारद (Architects) • अभियंते • कार्यरत व्यावसायिक • स्वयंरोजगार करणारे व्यक्ती • उच्च शिक्षण घेऊ इच्छिणारे विद्यार्थी • शिक्षणासाठी अर्थसहाय्य शोधणारे पालक • मालमत्ता खरेदीदार • MSME आणि SME.
व्हॉट्सॲप लिंक:
https://wa.me/919175635165
तुमची स्वप्ने पूर्ण करण्यासाठी आर्थिक मदतीची गरज आहे का? 🌟
'अवनी लोन सर्व्हिसेस'मध्ये आपले स्वागत आहे — लातूर आणि संपूर्ण महाराष्ट्रात 'अनसिक्युअर्ड' (विनातारण) आणि 'सिक्युअर्ड' (तारण) कर्जांसाठी तुमचा विश्वासू जोडीदार! तुम्हाला घर घ्यायचे असो, व्यवसाय वाढवायचा असो किंवा शिक्षणासाठी निधी हवा असेल, आम्ही तुम्हाला ४८ तासांच्या आत कर्ज मंजूर करून देण्यासाठी तत्पर आहोत! ⏱️💸
आमच्या कर्ज सेवांमध्ये यांचा समावेश आहे:
✅  वैयक्तिक / पगार-आधारित कर्ज (Personal / Salary Loans)
✅  व्यावसायिक कर्ज (Business Loans)
✅  गृह कर्ज / तारण कर्ज (Home / Mortgage Loans)
✅  शैक्षणिक कर्ज (भारत आणि परदेशासाठी)
✅  वैद्यकीय व्यावसायिक आणि सीए (CAs) यांच्यासाठी विशेष कर्ज
✅  सिबिल (CIBIL) सुधारणा सेवा
📞 कॉल/व्हॉट्सॲप: https://wa.me/919175635165
🌐 ऑनलाइन अर्ज करा: https://www.avanifinserv.com/contact
आम्हाला येथे फॉलो करा:
 https://www.facebook.com/share/19Pvp8PqP2/
 https://www.instagram.com/avanifinservlatur?utm_source=qr&igsh=aGE5aHdzazN0OTk2
#AvaniLoanServices #LoansInMaharashtra #Latur #QuickLoans #FinancialFreedom #PersonalLoan #BusinessLoan #HomeLoan #EducationLoanIndia #EducationLoanGlobal`;

/**
 * Schedule drip campaign messages if no response is received
 */
function scheduleDripCampaign(fromPhone) {
  // Clear any existing timeouts for this phone
  const existingTimeouts = dripCampaignTimeouts.get(fromPhone);
  if (existingTimeouts) {
    existingTimeouts.forEach(clearTimeout);
  }

  // Set new timeouts (30s, 3d, 5d, 8d)
  const intervals = [
    30 * 1000,                       // 30 seconds
    3 * 24 * 60 * 60 * 1000,         // 3 days
    5 * 24 * 60 * 60 * 1000,         // 5 days
    8 * 24 * 60 * 60 * 1000          // 8 days
  ];

  const timeouts = intervals.map(interval => {
    return setTimeout(async () => {
      console.log(`[Drip Campaign] Firing drip message to ${fromPhone} after ${interval}ms`);
      await sendMetaWhatsAppMessage(fromPhone, DRIP_MESSAGE);
    }, interval);
  });

  dripCampaignTimeouts.set(fromPhone, timeouts);
}

/**
 * Generate exact tailored document checklist based on profile & loan requirement.
 */
function getChecklistText(loanType = '', employmentType = '', profession = '', name = 'Customer') {
  const normLoan = (loanType || '').toLowerCase();
  const normEmp = (employmentType || '').toLowerCase();
  const normProf = (profession || '').toLowerCase();

  const cleanName = (name || 'Customer').replace(/^(Dr\.|CA)\s+/i, '');

  // 1. EDUCATION LOAN
  if (normLoan.includes('education')) {
    return `📋 *AVANI LOAN SERVICES — EDUCATION LOAN COMPLETE CHECKLIST*

Hello ${name}, kindly share the documents step-by-step as per the checklist below:

🎓 *STUDENT DOCUMENTS*
1. Admission Letter
2. Passport (Both sides)
3. Score Card (GRE / TOEFL / Duolingo / PTE / IELTS)
4. Academic Certificates:
   • 10th (SSC) Memo
   • Inter / Diploma Memos
   • Degree Memos / B.Tech Transcripts
   • CMM & Provisional Certificate (PC)
5. Work Experience Letters (Appointment / Offer / Relieving Letter & Resume)
6. Aadhaar Card & PAN Card
7. Email ID & Mobile Number

👥 *CO-APPLICANT DOCUMENTS (Father / Mother / Siblings / Blood Relation)*
• If Salaried: Aadhaar Card, PAN Card, Latest 3 Months Payslips, 6 Months Bank Statement, 2 Years Form-16.
• If Self-Employed: Aadhaar Card, PAN Card, 2 Years ITR with P&L & Balance Sheet, Business License (GST/Labour), 6 Months Bank Statement.
• If Farmer: Aadhaar Card, PAN Card, Patta Pass Book, Agriculture Income Certificate, 6 Months Bank Statement.
• If Pensioner: Aadhaar Card, PAN Card, Pension Receipts, 6 Months Bank Statement.
• If Rental Income: Aadhaar Card, PAN Card, Rental Agreement, 6 Months Bank Statement.
• Mother KYC: Aadhaar, PAN, Own House Proof (Property Tax / Power Bill), 2 References (Name, Number, Email).

📊 *FINANCIAL & COLLATERAL DOCUMENTS*
• ✅ Co-applicant KYC (PAN & Aadhaar)
• ✅ Co-applicant Income Proof & 2 Years ITR
• ✅ Bank Statements (1 Year)
• ✅ Property Documents (if Collateral Education Loan)

🔗 Please upload your documents securely at: https://www.avanifinserv.com/documents or reply to this chat.`;
  }

  // 2. HOME LOAN
  if (normLoan.includes('home') || normLoan.includes('housing')) {
    return `📋 *AVANI LOAN SERVICES — HOME LOAN COMPLETE DOCUMENT CHECKLIST*

Hello ${name}, here is your required document checklist for Home Loan:

🪪 *IDENTITY & ADDRESS PROOF*
• ✅ Aadhaar Card & PAN Card
• ✅ Passport / Voter ID / Driving License
• ✅ Utility Bill (last 3 months)

💼 *INCOME DOCUMENTS (As Per Profile)*
• If Salaried: 3 months Payslips, 6 months Bank Statements, 2 years Form 16, Employee ID / Offer Letter.
• If Business: Business Registration (Udyam/GST/Shop Act), 2 years ITR with CA stamp, 12 months Bank Statements, 2 years Audited Balance Sheet.
• If Doctor: Degree Certificate, Registration Certificate (Old & New), Clinic/Hospital Registration, 2 years ITR, 12 months Bank Statements.
• If CA: Certificate of Practice (COP), ICAI Membership, 2 years ITR, 12 months Bank Statements.

🏠 *PROPERTY DOCUMENTS*
• ✅ Sale agreement / Allotment letter
• ✅ Property title deed & Original Title Deed
• ✅ NOC from builder / society
• ✅ Approved building plan
• ✅ Property tax receipts & Encumbrance certificate
• ✅ NOC from co-owners (if applicable)
• ✅ Property Valuation report

🔗 Please upload your documents securely at: https://www.avanifinserv.com/documents or reply to this chat.`;
  }

  // 3. DOCTOR PROFESSIONAL LOAN
  if (normProf.includes('doctor') || normLoan.includes('doctor')) {
    return `📋 *AVANI LOAN SERVICES — DOCTOR PROFESSIONAL LOAN DOCUMENT CHECKLIST*

Hello Dr. ${cleanName}, here is your required document checklist for Doctor Professional Loan:

🩺 *DOCTOR PROFESSIONAL DOCUMENTS*
• ✅ Degree Certificate
• ✅ Registration Certificate (Old & New)
• ✅ Clinic / Hospital Registration Certificate

🪪 *IDENTITY & ADDRESS PROOF*
• ✅ PAN Card
• ✅ Aadhaar Card
• ✅ Passport size photo

📊 *FINANCIAL DOCUMENTS*
• ✅ Last 2 years ITR
• ✅ Last 6-12 months bank statements (Current & Savings)
• ✅ Existing loan details (if any)

🔗 Please upload your documents securely at: https://www.avanifinserv.com/documents or reply to this chat.`;
  }

  // 4. CHARTERED ACCOUNTANT PROFESSIONAL LOAN
  if (normProf.includes('ca') || normProf.includes('chartered') || normLoan.includes('chartered')) {
    return `📋 *AVANI LOAN SERVICES — CHARTERED ACCOUNTANT PROFESSIONAL LOAN CHECKLIST*

Hello CA ${cleanName}, here is your required document checklist for Chartered Accountant Loan:

💼 *CHARTERED ACCOUNTANT PROFESSIONAL DOCUMENTS*
• ✅ Certificate of Practice (COP)
• ✅ ICAI Membership Certificate

🪪 *IDENTITY & ADDRESS PROOF*
• ✅ PAN Card
• ✅ Aadhaar Card
• ✅ Passport size photo

📊 *FINANCIAL DOCUMENTS*
• ✅ Last 2 years ITR
• ✅ Last 6-12 months bank statements
• ✅ Existing loan details (if any)

🔗 Please upload your documents securely at: https://www.avanifinserv.com/documents or reply to this chat.`;
  }

  // 5. BUSINESS OWNER / SELF-EMPLOYED LOAN
  if (normEmp.includes('business') || normEmp.includes('self')) {
    return `📋 *AVANI LOAN SERVICES — BUSINESS OWNER & SELF-EMPLOYED DOCUMENT CHECKLIST*

Hello ${name}, here is your required document checklist for Business / Self-Employed Loan:

🪪 *IDENTITY & ADDRESS PROOF*
• ✅ PAN Card (Individual + Business)
• ✅ Aadhaar Card
• ✅ GST Registration Certificate

🏢 *BUSINESS DOCUMENTS*
• ✅ Business Registration / Udyam Certificate
• ✅ Shop & Establishment Certificate
• ✅ Partnership Deed / MOA (if applicable)

📊 *FINANCIAL DOCUMENTS*
• ✅ Last 2 years ITR with CA stamp
• ✅ Last 12 months bank statements
• ✅ Last 2 years audited balance sheet

🔗 Please upload your documents securely at: https://www.avanifinserv.com/documents or reply to this chat.`;
  }

  // 6. DEFAULT / SALARIED PERSONAL LOAN
  return `📋 *AVANI LOAN SERVICES — SALARIED PERSONAL LOAN DOCUMENT CHECKLIST*

Hello ${name}, here is your required document checklist for Personal Loan:

🪪 *IDENTITY PROOF*
• ✅ Aadhaar Card
• ✅ PAN Card
• ✅ Passport
• ✅ Voter's ID

📍 *ADDRESS PROOF*
• ✅ Aadhaar Card
• ✅ Utility Bill (last 3 months)
• ✅ Driving License

💰 *INCOME DOCUMENTS*
• ✅ Last 3 months salary slips
• ✅ Last 6 months bank statements
• ✅ Form 16 (last 2 years)

💼 *EMPLOYMENT PROOF*
• ✅ Employee ID Card
• ✅ Appointment Letter
• ✅ Offer Letter (for new joinees)

🔗 Please upload your documents securely at: https://www.avanifinserv.com/documents or reply to this chat.`;
}

/**
 * Dispatch message via Meta WhatsApp Cloud API or AiSensy
 */
async function sendMetaWhatsAppMessage(toPhone, messageText, templateName = null) {
  const cleanPhone = (toPhone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  console.log(`[WhatsApp Engine] Outbound dispatch to ${formattedPhone}...`);

  // 1. Try Meta WhatsApp Cloud API if token & phone_id are set
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID || '2049842548930849';

  if (token && token.length > 20) {
    try {
      const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      const payload = templateName ? {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' }
        }
      } : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { preview_url: true, body: messageText }
      };

      const res = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[WhatsApp Engine] Meta Cloud API Success:', res.status, res.data);
      return { success: true, provider: 'Meta_Cloud_API', data: res.data };
    } catch (metaErr) {
      console.error('[WhatsApp Engine] Meta Cloud API Error:', metaErr.response?.data || metaErr.message);
    }
  }

  // 2. Try AiSensy API if configured
  const aisensyKey = process.env.AISENSY_API_KEY;
  if (aisensyKey) {
    try {
      const res = await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', {
        apiKey: aisensyKey,
        campaignName: 'Avani_Qualification_Flow',
        destination: formattedPhone,
        userName: 'Valued Customer',
        templateParams: [messageText]
      });
      console.log('[WhatsApp Engine] AiSensy API Success:', res.data);
      return { success: true, provider: 'AiSensy', data: res.data };
    } catch (aisensyErr) {
      console.error('[WhatsApp Engine] AiSensy Error:', aisensyErr.message);
    }
  }

  // 3. Fallback logging
  console.log(`[WhatsApp Engine] Mock Message Dispatched to ${formattedPhone}:\n${messageText}`);
  return { success: true, provider: 'Internal_Logger', text: messageText };
}

/**
 * Handle Call Agent Outcome & Automatically Trigger Qualification Flow
 */
async function handleCallOutcomeAndTriggerWhatsApp(leadInfo) {
  const { name, phone, email, city, status, loanType, source = 'AI_Calling_Agent' } = leadInfo;

  const initialMsg = `👋 Hi ${name || 'Customer'}, thank you for speaking with Avani Loan Services! 

To complete your loan eligibility assessment instantly, please answer a few quick questions:

1️⃣ What is your Employment Type?
   • Salaried
   • Self Employed
   • Business Owner
   • Professional (Doctor / CA)

2️⃣ What is your Monthly Income?
   • ₹25K–₹50K
   • ₹50K–₹1L
   • ₹1L–₹2L
   • Above ₹2L

3️⃣ What is your Required Loan Amount & Type? (Personal / Business / Doctor / CA / Education / Home Loan)

Reply to this message to receive your exact Document Checklist!`;

  await sendMetaWhatsAppMessage(phone, initialMsg);
  
  // Schedule the drip campaign for non-responsive leads
  scheduleDripCampaign(phone);

  // Sync lead across all channels
  await syncAllIntegrations({
    timestamp: new Date().toISOString(),
    name: name || 'Valued Customer',
    phone: phone || '',
    email: email || '',
    city: city || 'Latur',
    source: source,
    status: status || 'Call_Completed_WhatsApp_Triggered',
    loanType: loanType || 'Personal',
    amount: '0'
  });
}

/**
 * Synchronize lead across HubSpot, Google Sheets, Zapier, and Pabbly
 */
async function syncAllIntegrations(payload) {
  console.log('[Integrations Engine] Syncing lead across ecosystem...', payload.name);

  // 1. Google Sheets
  try {
    await appendRowToGoogleSheet(payload);
  } catch (e) {
    console.error('[Integrations] Google Sheets error:', e.message);
  }

  // 2. HubSpot CRM
  try {
    await syncToHubSpot(payload);
  } catch (e) {
    console.error('[Integrations] HubSpot error:', e.message);
  }

  // 3. Zapier Webhook
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL || process.env.PABBLY_CONNECT_URL;
  if (zapierUrl) {
    try {
      await axios.post(zapierUrl, payload, { timeout: 8000 });
      console.log('[Integrations] Zapier/Pabbly webhook sent.');
    } catch (e) {
      console.error('[Integrations] Zapier webhook error:', e.message);
    }
  }
}

/**
 * State machine to process incoming WhatsApp customer messages
 */
async function processIncomingWhatsAppMessage(fromPhone, textMessage) {
  const normText = (textMessage || '').trim().toLowerCase();
  let session = conversationSessions.get(fromPhone) || { step: 'INIT' };

  console.log(`[WhatsApp Bot] Incoming from ${fromPhone} (Step: ${session.step}): "${textMessage}"`);

  let replyText = '';

  if (session.step === 'INIT' || normText.includes('hi') || normText.includes('hello') || normText.includes('apply') || normText.includes('eligibility')) {
    session.step = 'AWAITING_NAME';
    conversationSessions.set(fromPhone, session);
    replyText = `Welcome to *AVANI LOAN SERVICES*! 🏦
We provide fast loans up to ₹50 Lakhs with 48-hour approvals across Maharashtra.

Step 1 of 4: Please enter your *Full Name*:`;
  } 
  else if (session.step === 'AWAITING_NAME') {
    session.name = textMessage;
    session.step = 'AWAITING_CITY';
    conversationSessions.set(fromPhone, session);
    replyText = `Thank you ${session.name}! 👍

Step 2 of 4: Please tell us your *City*:`;
  }
  else if (session.step === 'AWAITING_CITY') {
    session.city = textMessage;
    session.step = 'AWAITING_EMP';
    conversationSessions.set(fromPhone, session);
    replyText = `Got it (${session.city})!

Step 3 of 4: Please select your *Employment Type*:
1. Salaried
2. Self Employed / Business Owner
3. Doctor
4. Chartered Accountant (CA)`;
  }
  else if (session.step === 'AWAITING_EMP') {
    if (normText.includes('1') || normText.includes('salari')) session.emp = 'Salaried';
    else if (normText.includes('3') || normText.includes('doc')) session.emp = 'Doctor';
    else if (normText.includes('4') || normText.includes('ca') || normText.includes('chart')) session.emp = 'Chartered Accountant';
    else session.emp = 'Business Owner / Self Employed';

    session.step = 'AWAITING_LOAN_TYPE';
    conversationSessions.set(fromPhone, session);
    replyText = `Great! Profile recorded as *${session.emp}*.

Step 4 of 4: What type of loan do you require?
1. Personal Loan
2. Business Loan
3. Education Loan
4. Home Loan
5. Professional Loan (Doctor / CA)`;
  }
  else if (session.step === 'AWAITING_LOAN_TYPE') {
    if (normText.includes('3') || normText.includes('edu')) session.loanType = 'Education Loan';
    else if (normText.includes('4') || normText.includes('home') || normText.includes('hous')) session.loanType = 'Home Loan';
    else if (normText.includes('5') || normText.includes('prof')) session.loanType = session.emp.includes('Doctor') ? 'Doctor Professional Loan' : 'CA Professional Loan';
    else if (normText.includes('2') || normText.includes('busin')) session.loanType = 'Business Loan';
    else session.loanType = 'Personal Loan';

    // Generate tailored document checklist!
    replyText = getChecklistText(session.loanType, session.emp, session.emp, session.name || 'Valued Customer');

    // Reset session
    session.step = 'COMPLETED';
    conversationSessions.set(fromPhone, session);

    // Sync to all CRM channels
    syncAllIntegrations({
      timestamp: new Date().toISOString(),
      name: session.name || 'WhatsApp User',
      phone: fromPhone,
      email: session.email || '',
      city: session.city || 'Latur',
      source: 'Meta_WhatsApp_Chatbot',
      status: 'Qualified_Checklist_Sent',
      loanType: session.loanType,
      amount: '500000'
    });
  }
  else {
    // Default reply with checklist or link
    replyText = getChecklistText('Personal', 'Salaried', '', 'Valued Customer');
  }

  await sendMetaWhatsAppMessage(fromPhone, replyText);
  
  // Schedule drip campaign waiting for their next response (or after completion)
  scheduleDripCampaign(fromPhone);
  
  return replyText;
}

module.exports = {
  getChecklistText,
  sendMetaWhatsAppMessage,
  handleCallOutcomeAndTriggerWhatsApp,
  processIncomingWhatsAppMessage,
  syncAllIntegrations
};
