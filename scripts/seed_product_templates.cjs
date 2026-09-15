// scripts/seed_product_templates.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Master Template Seeder & Curated Library Sync
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY } = require('../src/config/businessIdentity.cjs');
const { ALL_PRODUCT_KEYS } = require('../src/config/productsCatalog.cjs');
const { generateAllProductTemplates } = require('../src/services/templateGenerator.cjs');
const { saveTemplate, MongoContentTemplate } = require('../src/models/ContentTemplate.cjs');
const { connectDB } = require('../src/models/database.cjs');
const { validateTemplate } = require('../src/services/templateValidator.cjs');
require('dotenv').config();

const CURATED_PROMPT_TEMPLATES = [
  {
    templateId: 'ALS-PERSONAL-WA-SALARY-UPDATE-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language: 'en',
    templateName: 'personal_loan_salary_update',
    headline: 'Personal Loan Query Update',
    body: 'Hi {{1}},\nThank you for inquiring about a Personal Loan with Avani Loan Services.\nWe offer instant approval options for salaried professionals. To calculate your maximum eligible limit and check customized rate charts, please reply with your monthly salary.',
    footer: 'Avani Finserv - Latur',
    variables: [{ index: 1, name: 'customer_name', sample: 'Rajesh Kumar' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Check Interest Rates' },
      { type: 'QUICK_REPLY', text: 'Talk to an Advisor' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1072574895255644',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-BUSINESS-WA-FOLLOWUP-EN-V1',
    product: 'business_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'FOLLOW_UP',
    language: 'en',
    templateName: 'business_loan_followup',
    headline: 'Business Expansion Loan',
    body: 'Hello {{1}},\nThis is Sachin Shinde from Avani Loan Services. We would love to assist you in expanding your business operations with our customized MSME/Business Loan solutions.\nPlease reply to this message to coordinate a free consultation call regarding collateral-free options.',
    footer: 'Reply STOP to unsubscribe',
    variables: [{ index: 1, name: 'customer_name', sample: 'Vikas Sharma' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Request Callback' },
      { type: 'QUICK_REPLY', text: 'Send Requirements' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1772376197133404',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-EDU-GLOBAL-WA-WELCOME-EN-V1',
    product: 'education_loan_global',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'education_loan_welcome',
    headline: 'Education Funding Advisory',
    body: "Hello {{1}},\nPlanning higher studies for your child at a leading college in India or abroad?\nAvani Loan Services provides custom Education Loan packages covering up to 100% of university fees, accommodation, and global travel expenses. Let's discuss your funding options.",
    footer: 'Avani Finserv - Fast Approvals',
    variables: [{ index: 1, name: 'customer_name', sample: 'Sneha Kulkarni' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Study in India Info' },
      { type: 'QUICK_REPLY', text: 'Global Education Info' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '3618662384968361',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-DOCTOR-WA-PROFESSIONAL-OFFER-EN-V1',
    product: 'doctor_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'professional_loan_offer',
    headline: 'Exclusive Professional Loan Offer',
    body: 'Respected {{1}},\nAvani Loan Services offers highly customized financial options designed specifically for Doctors and Chartered Accountants.\nAvail special interest rates with minimal documentation for clinic expansion, equipment purchase, or personal needs.',
    footer: 'Avani Finserv',
    variables: [{ index: 1, name: 'doctor_name', sample: 'Dr. Deshmukh' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Check Eligibility' },
      { type: 'QUICK_REPLY', text: 'ROI Calculator' }
    ],
    metaCategory: 'MARKETING',
    metaTemplateId: '2900614780294114',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-HOME-WA-MORTGAGE-INTRO-EN-V1',
    product: 'home_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'home_loan_mortgage_intro',
    headline: 'Home & Mortgage Advisory',
    body: 'Hello {{1}},\nAre you looking to purchase a new property or raise capital against your existing assets with a Loan Against Property (LAP)?\nAt Avani Loan Services, we compare ROI across top banks to find you the lowest rates. Reply to check your pre-approved limit.',
    footer: 'Reply STOP to opt out',
    variables: [{ index: 1, name: 'customer_name', sample: 'Anand Patil' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Check Home Loan Rates' },
      { type: 'QUICK_REPLY', text: 'Mortgage LAP Options' }
    ],
    metaCategory: 'MARKETING',
    metaTemplateId: '1878028073559798',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-SCHOOL-WA-INST-ALERT-EN-V1',
    product: 'school_funding',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'institutional_funding_alert',
    headline: 'Institutional Project Funding',
    body: 'Dear Administrator {{1}},\nAvani Loan Services provides specialized project funding for school and college building expansion, infrastructure upgrades, and smart classroom setups.\nReply to request a callback from our senior institutional funding advisors.',
    footer: 'Institutional Division',
    variables: [{ index: 1, name: 'trustee_name', sample: 'Principal Kulkarni' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Talk to Expert' },
      { type: 'QUICK_REPLY', text: 'Request Brochure' }
    ],
    metaCategory: 'MARKETING',
    status: 'DRAFT'
  },
  {
    templateId: 'ALS-PERSONAL-WA-NEW-LEAD-WELCOME-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'FOLLOW_UP',
    language: 'en',
    templateName: 'pl_new_lead_welcome',
    headline: 'Welcome to Avani Loan Services',
    body: 'Hello {{1}},\nThank you for choosing AVANI LOAN SERVICES. We received your Personal Loan inquiry. To help us check your eligibility quickly and provide the best options, please reply with YES to answer 4 quick questions.',
    footer: 'Avani Finserv - Latur',
    variables: [{ index: 1, name: 'customer_name', sample: 'Rahul Mane' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'YES, Continue' },
      { type: 'QUICK_REPLY', text: 'Talk to Advisor' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1422220193205800',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-PERSONAL-WA-ELIGIBILITY-CHECK-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'LEAD_GEN',
    language: 'en',
    templateName: 'pl_eligibility_check',
    headline: 'Eligibility Assessment',
    body: 'Hello {{1}},\nTo process your Personal Loan application accurately, we need a few basic details to check your eligibility. Please share:\n1. Monthly in-hand salary\n2. Current employment company\n3. Desired loan amount\nReply directly to this message, and our team will evaluate the best loan offers for you.',
    footer: 'AVANI LOAN SERVICES',
    variables: [{ index: 1, name: 'customer_name', sample: 'Sunil Pawar' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Send Details' },
      { type: 'QUICK_REPLY', text: 'Schedule Consultation' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1561924169069634',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-PERSONAL-WA-DOC-REQUEST-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language: 'en',
    templateName: 'pl_document_request',
    headline: 'Personal Loan Document List',
    body: 'Hello {{1}},\nGreat news! Based on our initial assessment, you are eligible to proceed with your Personal Loan application. To move forward, please share clear copies of the following documents:\n• PAN Card\n• Aadhaar Card\n• Last 3 months Salary Slips\n• Last 6 months Bank Statement\nYou can upload them securely via our portal {{2}} or send them directly here.',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [
      { index: 1, name: 'customer_name', sample: 'Sunil Pawar' },
      { index: 2, name: 'portal_url', sample: 'https://www.avanifinserv.com/documents' }
    ],
    cta: [
      { type: 'URL', text: 'Upload Documents', url: 'https://www.avanifinserv.com/documents' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '2884490138745426',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-BUSINESS-WA-NEW-INQUIRY-EN-V1',
    product: 'business_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'FOLLOW_UP',
    language: 'en',
    templateName: 'bl_new_inquiry',
    headline: 'Business Loan Inquiry',
    body: 'Hello {{1}},\nThank you for choosing AVANI LOAN SERVICES for your business expansion needs. We have received your Business Loan inquiry. Our specialist will contact you to discuss your business profile and funding requirements.',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [{ index: 1, name: 'customer_name', sample: 'Ajay Kadam' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Talk to Expert' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '4416609051936070',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-BUSINESS-WA-FINANCIAL-DOCS-EN-V1',
    product: 'business_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language: 'en',
    templateName: 'bl_financial_docs',
    headline: 'Business Documents Required',
    body: 'Hello {{1}},\nTo secure the best Business Loan terms for your company, please provide the following documents:\n• Last 2 years ITR\n• GST Registration Certificate\n• Current Account Statement (6 months)\nOur team is ready to process your file immediately upon receipt. Upload securely at: {{2}}',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [
      { index: 1, name: 'customer_name', sample: 'Ajay Kadam' },
      { index: 2, name: 'portal_url', sample: 'https://www.avanifinserv.com/documents' }
    ],
    cta: [
      { type: 'URL', text: 'Upload Portal', url: 'https://www.avanifinserv.com/documents' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1070481849018478',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-DOCTOR-WA-SPECIAL-SCHEME-EN-V1',
    product: 'doctor_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'doc_loan_special',
    headline: 'Healthcare Professional Advisory',
    body: 'Dear Dr. {{1}},\nAVANI LOAN SERVICES offers specialized funding solutions exclusively for medical professionals. Whether you are looking for clinic expansion, equipment financing, or a personal loan, we provide seamless processing with competitive terms. Would you like to schedule a brief consultation to explore your options?',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [{ index: 1, name: 'doctor_last_name', sample: 'Sharma' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'Schedule Call' },
      { type: 'QUICK_REPLY', text: 'Not Now' }
    ],
    metaCategory: 'MARKETING',
    metaTemplateId: '1749780546331227',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-HOME-WA-RATE-UPDATE-EN-V1',
    product: 'home_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CONVERSION',
    language: 'en',
    templateName: 'hl_rate_update',
    headline: 'Home Loan Rate Advisory',
    body: 'Hello {{1}},\nPlanning to buy your dream home? AVANI LOAN SERVICES is currently facilitating Home Loans starting at competitive interest rates with leading banks. Let us help you find the most suitable financing for your property.',
    footer: 'Reply STOP to opt out',
    variables: [{ index: 1, name: 'customer_name', sample: 'Ramesh Biradar' }],
    cta: [
      { type: 'URL', text: 'Visit Website', url: 'https://www.avanifinserv.com/' },
      { type: 'QUICK_REPLY', text: 'Contact Advisor' }
    ],
    metaCategory: 'MARKETING',
    metaTemplateId: '28274246935567932',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-CIBIL-WA-CONSULTATION-OFFER-EN-V1',
    product: 'cibil_consultation',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'cibil_consultation_offer',
    headline: 'Credit Health Advisory',
    body: 'Hello {{1}},\nA healthy credit score is the key to securing the best loan terms. If you are facing challenges with loan approvals, AVANI LOAN SERVICES offers professional CIBIL Improvement Consultations. Reply YES to schedule a detailed credit score analysis with our financial advisors.',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [{ index: 1, name: 'customer_name', sample: 'Gopal Joshi' }],
    cta: [
      { type: 'QUICK_REPLY', text: 'YES' }
    ],
    metaCategory: 'MARKETING',
    metaTemplateId: '1101510665731655',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-CRM-WA-DOC-REMINDER-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language: 'en',
    templateName: 'crm_doc_pending_reminder',
    headline: 'Application Documents Pending',
    body: 'Hello {{1}},\nThis is a gentle reminder from AVANI LOAN SERVICES. Your loan application for {{2}} is currently on hold as we are awaiting your documents. Please submit the requested files at your earliest convenience to ensure timely processing.',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [
      { index: 1, name: 'customer_name', sample: 'Pooja Shinde' },
      { index: 2, name: 'loan_product', sample: 'Personal Loan' }
    ],
    cta: [
      { type: 'URL', text: 'Submit Documents', url: 'https://www.avanifinserv.com/documents' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '2005236546820435',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-CRM-WA-APP-APPROVED-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language: 'en',
    templateName: 'crm_application_approved',
    headline: 'Congratulations on Sanction!',
    body: 'Congratulations {{1}}!\nWe are pleased to inform you that your {{2}} application has been successfully sanctioned by the lending institution. Our advisor, Sachin Shinde, will contact you shortly with the final sanction letter and disbursement steps.',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [
      { index: 1, name: 'customer_name', sample: 'Pooja Shinde' },
      { index: 2, name: 'loan_product', sample: 'Personal Loan' }
    ],
    cta: [
      { type: 'QUICK_REPLY', text: 'Thank You' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1419959253415440',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-CRM-WA-FEEDBACK-REQ-EN-V1',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'CRM_UTILITY',
    language: 'en',
    templateName: 'crm_feedback_request',
    headline: 'Your Feedback Matters',
    body: 'Hello {{1}},\nThank you for trusting AVANI LOAN SERVICES. We hope you had a seamless experience securing your loan! Could you take 1 minute to share your experience on Google? Your feedback helps us serve you better.',
    footer: 'AVANI LOAN SERVICES | Latur',
    variables: [{ index: 1, name: 'customer_name', sample: 'Mahesh Kale' }],
    cta: [
      { type: 'URL', text: 'Review Us on Google', url: 'https://www.avanifinserv.com/' }
    ],
    metaCategory: 'UTILITY',
    metaTemplateId: '1061192250051942',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  },
  {
    templateId: 'ALS-BUSINESS-WA-INTRO-EN-V1',
    product: 'business_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'avani_business_intro',
    headline: 'Welcome to Avani Loan Services',
    body: 'Hello {{1}}! 👋\nWelcome to AVANI LOAN SERVICES, your trusted financial advisory firm based right here in Latur.\nFounded by Sachin Shinde, our mission is to make borrowing simple, transparent, and completely stress-free. Whether you are a salaried professional, business owner, doctor, or student, we have a customized loan solution for you.\nWe specialize in: ✅ Personal & Business Loans ✅ Home & Mortgage Loans ✅ Professional Loans (Doctors, CAs) ✅ Education Loans (India & Global) ✅ School & College Funding\nLet us help you achieve your financial goals with expert guidance and fast processing!',
    footer: 'Old Barshi Road, Latur',
    variables: [{ index: 1, name: 'customer_name', sample: 'Rajesh' }],
    cta: [
      { type: 'URL', text: 'Visit Website', url: 'https://www.avanifinserv.com/' },
      { type: 'PHONE_NUMBER', text: 'Call Sachin Shinde', phone: '+919175635165' }
    ],
    metaCategory: 'MARKETING',
    metaTemplateId: '1081823490909859',
    metaStatus: 'PENDING',
    status: 'SUBMITTED'
  }
];

async function seedAll() {
  console.log('--- STARTING COMPREHENSIVE TEMPLATE SEEDING ---');
  await connectDB().catch(e => console.warn('DB warning:', e.message));

  // 1. Generate all algorithmic templates for 10 products
  const autoResults = await generateAllProductTemplates();
  console.log(`Algorithmic generation: ${autoResults.totalGenerated} templates.`);

  // 2. Insert curated prompt templates with real Meta IDs
  let curatedCount = 0;
  for (const ct of CURATED_PROMPT_TEMPLATES) {
    ct.businessId = BUSINESS_IDENTITY.businessId;
    ct.idempotencyKey = `${BUSINESS_IDENTITY.businessId}:${ct.product}:${ct.channel}:${ct.templateId}:v1`;
    const val = validateTemplate(ct);
    ct.validationReport = val;
    await saveTemplate(ct);
    curatedCount++;
  }
  console.log(`Curated Meta templates registered: ${curatedCount}`);

  console.log('--- SEEDING COMPLETE ---');
}

if (require.main === module) {
  seedAll().then(() => process.exit(0)).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedAll, CURATED_PROMPT_TEMPLATES };
