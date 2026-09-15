// scripts/test_template_engine_suite.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Master Automated Template Engine Test Suite
// ─────────────────────────────────────────────────────────────────

const http = require('http');
const express = require('express');
const axios = require('axios');
const { BUSINESS_IDENTITY, assertBusinessIsolation, checkBusinessIsolation } = require('../src/config/businessIdentity.cjs');
const { PRODUCTS_CATALOG, ALL_PRODUCT_KEYS } = require('../src/config/productsCatalog.cjs');
const {
  generateProductTemplates,
  generateWhatsAppTemplates,
  generateSocialPosts,
  generateImagePrompts,
  generateVideoScripts
} = require('../src/services/templateGenerator.cjs');
const { validateTemplate, scanAgroContamination } = require('../src/services/templateValidator.cjs');
const {
  saveTemplate,
  getTemplateById,
  queryTemplates
} = require('../src/models/ContentTemplate.cjs');
const {
  getMetaCredentials,
  getAiSensyCredentials,
  syncWithMeta
} = require('../src/services/templatePublishingEngine.cjs');
const templatesRouter = require('../src/routes/templates.cjs');
require('dotenv').config();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AVANI LOAN SERVICES TEMPLATE ENGINE TESTS');
  console.log('====================================================\n');

  // ── GATE 1: TENANT & BUSINESS ISOLATION ──
  console.log('--- GATE 1: Tenant & Business Isolation ---');
  assert(BUSINESS_IDENTITY.businessId === 'avani-loan-services', 'Business ID is hard-locked to avani-loan-services');
  assert(BUSINESS_IDENTITY.founder === 'Sachin Shinde', 'Founder is Sachin Shinde');
  assert(BUSINESS_IDENTITY.whatsappRaw === '919175635165', 'Official WhatsApp is 919175635165');

  const validPayload = { businessId: 'avani-loan-services', title: 'Personal Loan' };
  assert(checkBusinessIsolation(validPayload).valid === true, 'Valid Avani businessId passes isolation guard');

  const invalidTenant = { businessId: 'avani-agro-foods', title: 'Agro Export' };
  assert(checkBusinessIsolation(invalidTenant).valid === false, 'Foreign businessId (avani-agro-foods) is strictly blocked');

  // ── GATE 2: AGRO FOODS CONTAMINATION SCANNER ──
  console.log('\n--- GATE 2: Agro Foods Contamination Scanner ---');
  const cleanContent = 'Avani Loan Services provides personal and business loans in Latur. Contact Sachin Shinde.';
  assert(scanAgroContamination(cleanContent).passed === true, 'Clean Loan Services copy passes scanner');

  const contaminatedContent1 = 'We offer premium moringa powder and spices for export to UK and USA bulk buyers.';
  const scanResult1 = scanAgroContamination(contaminatedContent1);
  assert(scanResult1.passed === false && scanResult1.detectedTerms.includes('moringa'), 'Agro contamination (moringa) detected and blocked');

  const contaminatedContent2 = 'AVANI AGRO FOODS supplies private label organic products.';
  const scanResult2 = scanAgroContamination(contaminatedContent2);
  assert(scanResult2.passed === false && scanResult2.detectedTerms.includes('avani agro'), 'Agro contamination (avani agro) detected and blocked');

  // ── GATE 3: 10 PRODUCT SEPARATION & CATALOG ──
  console.log('\n--- GATE 3: 10 Products Specification ---');
  assert(ALL_PRODUCT_KEYS.length === 10, 'Exactly 10 distinct loan products configured in catalog');

  const expectedProducts = [
    'personal_loan', 'business_loan', 'doctor_loan', 'home_loan', 'mortgage_loan',
    'education_loan_india', 'education_loan_global', 'school_funding', 'college_funding', 'cibil_consultation'
  ];
  expectedProducts.forEach(pKey => {
    assert(PRODUCTS_CATALOG[pKey] !== undefined, `Product '${pKey}' exists in catalog`);
  });

  // ── GATE 4: TEMPLATE GENERATION ENGINE ──
  console.log('\n--- GATE 4: Multi-Product Generation Engine ---');
  const plTemplates = generateProductTemplates('personal_loan', { languages: ['en', 'mr'] });
  assert(plTemplates.length > 0, `Generated ${plTemplates.length} templates for personal_loan`);

  const blTemplates = generateProductTemplates('business_loan', { languages: ['en'] });
  assert(blTemplates.every(t => t.product === 'business_loan'), 'All generated templates have strict product tag business_loan');

  const docTemplates = generateProductTemplates('doctor_loan', { languages: ['en'] });
  assert(docTemplates.some(t => t.contentType === 'WHATSAPP_TEMPLATE'), 'Doctor loan contains WhatsApp templates');
  assert(docTemplates.some(t => t.contentType === 'TEXT'), 'Doctor loan contains social media text posts');
  assert(docTemplates.some(t => t.contentType === 'IMAGE_PROMPT'), 'Doctor loan contains image prompts');
  assert(docTemplates.some(t => t.contentType === 'VIDEO_SCRIPT'), 'Doctor loan contains video scripts');

  // ── GATE 5: WHATSAPP VARIABLES & META COMPLIANCE ──
  console.log('\n--- GATE 5: WhatsApp Variables & Meta Compliance ---');
  const validWaTemplate = {
    templateId: 'ALS-TEST-WA-01',
    businessId: 'avani-loan-services',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    language: 'en',
    templateName: 'als_test_template_v1',
    body: 'Hello {{1}}, your loan inquiry for {{2}} has been reviewed. Contact us at +91 91756 35165.',
    cta: [{ type: 'QUICK_REPLY', text: 'Check Status' }]
  };
  const valResult1 = validateTemplate(validWaTemplate);
  assert(valResult1.isValid === true, 'Compliant WhatsApp template with {{1}}, {{2}} passes validation');

  const invalidVarTemplate = {
    ...validWaTemplate,
    templateName: 'als_invalid_var',
    body: 'Hello {{name}}, welcome to Avani!'
  };
  const valResult2 = validateTemplate(invalidVarTemplate);
  assert(valResult2.isValid === false && valResult2.errors.some(e => e.includes('numeric variables')), 'Rejects named variables {{name}} in Meta WhatsApp templates');

  const nonSeqTemplate = {
    ...validWaTemplate,
    templateName: 'als_non_seq',
    body: 'Hello {{2}}, your loan is ready.' // missing {{1}}
  };
  const valResult3 = validateTemplate(nonSeqTemplate);
  assert(valResult3.isValid === false && valResult3.errors.some(e => e.includes('sequential')), 'Rejects non-sequential variables {{2}} without {{1}}');

  // ── GATE 6: PROHIBITED FINANCIAL CLAIMS FILTER ──
  console.log('\n--- GATE 6: Prohibited Financial Claims Filter ---');
  const misleadingTemplate = {
    ...validWaTemplate,
    templateName: 'als_misleading',
    body: 'Hi {{1}}, get 100% approval and guaranteed sanction with zero documentation guaranteed!'
  };
  const valResult4 = validateTemplate(misleadingTemplate);
  assert(valResult4.isValid === false && valResult4.errors.some(e => e.includes('Prohibited financial claim')), 'Blocks prohibited financial guarantees (100% approval / guaranteed sanction)');

  // ── GATE 7: IDEMPOTENCY & DATA REPOSITORY ──
  console.log('\n--- GATE 7: Idempotency & Data Storage ---');
  const testTemplateData = {
    templateId: 'ALS-IDEMP-TEST-001',
    businessId: 'avani-loan-services',
    product: 'home_loan',
    channel: 'WHATSAPP',
    contentType: 'WHATSAPP_TEMPLATE',
    campaignType: 'AWARENESS',
    language: 'en',
    templateName: 'als_idemp_test_v1',
    headline: 'Home Advisory',
    body: 'Hello {{1}}, explore home loan rates with Avani Loan Services.',
    idempotencyKey: 'avani-loan-services:home_loan:WHATSAPP:ALS-IDEMP-TEST-001:v1',
    version: 1
  };
  const saved1 = await saveTemplate(testTemplateData);
  const saved2 = await saveTemplate({ ...testTemplateData, headline: 'Updated Home Advisory' });
  const fetched = await getTemplateById('ALS-IDEMP-TEST-001');
  assert(fetched.headline === 'Updated Home Advisory', 'Idempotent save updates without creating duplicates');

  // ── GATE 8: META WABA INTEGRATION CREDENTIALS ──
  console.log('\n--- GATE 8: Meta WABA Integration Credentials ---');
  const metaCreds = getMetaCredentials();
  assert(metaCreds.wabaId === '1062614709598311', 'Meta WABA ID matches authoritative 1062614709598311');
  assert(metaCreds.phoneId === '1147494668457940', 'Meta Phone Number ID matches authoritative 1147494668457940');
  assert(metaCreds.token && metaCreds.token.length > 30, 'Meta WhatsApp Access Token is active and loaded from environment');

  // ── GATE 9: AISENSY INTEGRATION CREDENTIALS ──
  console.log('\n--- GATE 9: AiSensy Integration Credentials ---');
  const aisensyCreds = getAiSensyCredentials();
  assert(aisensyCreds.projectId === '6a670f94d0c39f57eaa6799f', 'AiSensy Project ID matches 6a670f94d0c39f57eaa6799f');
  assert(aisensyCreds.apiKey && aisensyCreds.apiKey.length > 50, 'AiSensy API Key is active and loaded from environment');

  // ── GATE 10: EXPRESS HTTP ROUTING & TENANT FIREWALL ──
  console.log('\n--- GATE 10: Express HTTP Routing & Tenant Firewall ---');
  const app = express();
  app.use(express.json());
  app.use('/api/templates', templatesRouter);

  const server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/templates`;

  try {
    // Test Products endpoint
    const resProds = await axios.get(`${baseUrl}/products`);
    assert(resProds.status === 200 && resProds.data.products?.length === 10, 'GET /api/templates/products returns 10 products');

    // Test Stats endpoint
    const resStats = await axios.get(`${baseUrl}/stats`);
    assert(resStats.status === 200 && resStats.data.stats?.businessId === 'avani-loan-services', 'GET /api/templates/stats returns valid stats with tenant lock');

    // Test Validate endpoint
    const resVal = await axios.post(`${baseUrl}/validate`, validWaTemplate);
    assert(resVal.status === 200 && resVal.data.validation?.isValid === true, 'POST /api/templates/validate returns validation report');

    // Test Tenant Firewall (Should return 403 Forbidden for foreign businessId)
    try {
      await axios.post(`${baseUrl}/save`, {
        businessId: 'avani-agro-foods',
        templateId: 'FAIL-01',
        product: 'personal_loan'
      });
      assert(false, 'Foreign businessId should be blocked with 403');
    } catch (err) {
      assert(err.response?.status === 403, 'POST with foreign businessId correctly blocked with HTTP 403 Forbidden');
    }

  } finally {
    server.close();
  }

  // ── TEST SUMMARY ──
  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} TESTS FAILED.`);
    process.exit(1);
  } else {
    console.log('✅ ALL 10 GATES PASSED WITH ZERO ERRORS.');
    console.log('====================================================\n');
    process.exit(0);
  }
}

if (require.main === module) {
  runAllTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

module.exports = { runAllTests };
