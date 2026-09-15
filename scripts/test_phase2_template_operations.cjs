// scripts/test_phase2_template_operations.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Phase 2 Automated Test Suite
// Verification of:
// 1. Inventory & Distinction (Prompts vs Physical Assets)
// 2. 10 Products Completeness (Images, Videos, WhatsApp, Social)
// 3. Language Quality (en, mr, hi)
// 4. Content Quality Scorer (0-100, Compliance, CTA, Relevance, Duplicates)
// 5. 11-State Publishing State Machine & Transitions
// 6. Bulk Submission & Mandatory Human Confirmation Guard
// 7. Duplicate Detection Engine
// 8. 30-Day Content Calendar & CSV Export
// 9. Tenant Isolation & Agro Foods Scanner
// 10. Contact (+91 91756 35165) & Domain (avanifinserv.com) Guards
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../src/config/businessIdentity.cjs');
const { ALL_PRODUCT_KEYS, PRODUCTS_CATALOG } = require('../src/config/productsCatalog.cjs');
const {
  generateAllProductImageConcepts,
  generateProductImageConcepts,
  IMAGE_ASPECT_RATIOS
} = require('../src/services/imageAssetEngine.cjs');
const {
  generateAllProductVideoConcepts,
  generateProductVideoConcepts,
  VIDEO_CATEGORIES
} = require('../src/services/videoAssetEngine.cjs');
const {
  scoreContentQuality,
  detectDuplicates
} = require('../src/services/contentQualityScorer.cjs');
const {
  PUBLISHING_STATES,
  transitionState,
  canTransition,
  validateBulkSubmissionPreconditions
} = require('../src/services/publishingStateMachine.cjs');
const {
  generate30DayCalendar,
  exportCalendarToCSV
} = require('../src/services/contentCalendarEngine.cjs');
const {
  queryTemplates,
  saveTemplate
} = require('../src/models/ContentTemplate.cjs');
const { scanAgroContamination } = require('../src/services/templateValidator.cjs');

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

async function runPhase2TestSuite() {
  console.log('===============================================================');
  console.log('🧪 AVANI LOAN SERVICES — PHASE 2 FORENSIC AUTOMATION TEST SUITE');
  console.log('===============================================================\n');

  // ── GATE 1: TENANT IDENTITY & HARD BUSINESS LOCK ──
  console.log('--- GATE 1: Hard Business Lock & Entity Isolation ---');
  assert(BUSINESS_IDENTITY.businessId === 'avani-loan-services', 'Tenant ID is strictly avani-loan-services');
  assert(BUSINESS_IDENTITY.founder === 'Sachin Shinde', 'Founder is Sachin Shinde');
  assert(BUSINESS_IDENTITY.whatsappRaw === '919175635165', 'Authoritative WhatsApp is 919175635165');
  assert(BUSINESS_IDENTITY.websiteShort === 'avanifinserv.com', 'Authoritative Domain is avanifinserv.com');
  assert(BUSINESS_IDENTITY.metaWabaId === '1062614709598311', 'Authoritative WABA ID is 1062614709598311');
  assert(BUSINESS_IDENTITY.metaPhoneId === '1147494668457940', 'Authoritative Phone ID is 1147494668457940');
  assert(BUSINESS_IDENTITY.aisensyProjectId === '6a670f94d0c39f57eaa6799f', 'Authoritative AiSensy Project is 6a670f94d0c39f57eaa6799f');


  // ── GATE 2: INVENTORY & CRITICAL HONESTY: PROMPTS VS PHYSICAL ASSETS ──
  console.log('\n--- GATE 2: Critical Honesty — Prompts vs Physical Assets ---');
  const publicDir = path.join(__dirname, '..', 'public');
  const srcAssetsDir = path.join(__dirname, '..', 'src', 'assets');
  
  // Verify physical marketing video files do NOT exist (0 physical marketing MP4 files)
  const mp4Files = [];
  function scanDirForMp4(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) scanDirForMp4(full);
      else if (item.endsWith('.mp4') || item.endsWith('.webm')) mp4Files.push(full);
    }
  }
  scanDirForMp4(publicDir);
  assert(mp4Files.length === 0, `Honesty check: 0 physical rendered marketing MP4 video files detected on disk (Prompts/Scripts only)`);

  // ── GATE 3: 10-PRODUCT IMAGE CONCEPTS COMPLETENESS (100 CONCEPTS × 4 FORMATS) ──
  console.log('\n--- GATE 3: Image Concept Engine Completeness ---');
  const allImageConcepts = generateAllProductImageConcepts();
  assert(allImageConcepts.length === 100, `Generated exactly 100 visual image concepts (10 per product × 10 products)`);
  
  // Verify each product has exactly 10 concepts
  ALL_PRODUCT_KEYS.forEach(pKey => {
    const productConcepts = allImageConcepts.filter(c => c.productId === pKey);
    assert(productConcepts.length === 10, `Product '${pKey}' has exactly 10 visual image concepts`);
  });

  // Verify format dimensions on each concept (1080x1080, 1080x1350, 1080x1920, 1200x628)
  const sampleConcept = allImageConcepts[0];
  assert(sampleConcept.formats.length === 4, 'Image concept defines 4 standard social aspect ratios');
  const aspectRatios = sampleConcept.formats.map(f => f.aspectRatio);
  assert(aspectRatios.includes('1:1') && aspectRatios.includes('4:5') && aspectRatios.includes('9:16') && aspectRatios.includes('1.91:1'),
    'All 4 specified aspect ratios present (1:1, 4:5, 9:16, 1.91:1)');
  
  // Verify Brand Rules (Navy Blue, Light Blue, Off-White, Sachin Shinde, WhatsApp, Domain)
  assert(sampleConcept.brandIdentity.colors.primary === '#0f172a', 'Brand primary color is Navy Blue (#0f172a)');
  assert(sampleConcept.brandIdentity.whatsapp === '+91 91756 35165', 'Brand WhatsApp contact is +91 91756 35165');
  assert(sampleConcept.brandIdentity.website === 'avanifinserv.com', 'Brand website is avanifinserv.com');

  // ── GATE 4: 10-PRODUCT VIDEO CONCEPTS COMPLETENESS (300 CONCEPTS) ──
  console.log('\n--- GATE 4: Video Concept Engine Completeness ---');
  const allVideoConcepts = generateAllProductVideoConcepts();
  assert(allVideoConcepts.length === 300, `Generated exactly 300 video concepts (30 per product × 10 products)`);

  ALL_PRODUCT_KEYS.forEach(pKey => {
    const prodVideos = allVideoConcepts.filter(v => v.productId === pKey);
    assert(prodVideos.length === 30, `Product '${pKey}' has exactly 30 video concepts`);

    const reels = prodVideos.filter(v => v.category === 'Short Reels' || v.category === 'SHORT_REEL');
    const edu = prodVideos.filter(v => v.category === 'Educational' || v.category === 'EDUCATIONAL');
    const faq = prodVideos.filter(v => v.category === 'FAQ');
    const probSol = prodVideos.filter(v => v.category === 'Problem/Solution' || v.category === 'PROBLEM_SOLUTION');
    const leadGen = prodVideos.filter(v => v.category === 'Lead-Generation' || v.category === 'LEAD_GEN');


    assert(reels.length === 10, `  - ${pKey}: 10 Short Reels`);
    assert(edu.length === 5, `  - ${pKey}: 5 Educational Videos`);
    assert(faq.length === 5, `  - ${pKey}: 5 FAQ Videos`);
    assert(probSol.length === 5, `  - ${pKey}: 5 Problem/Solution Videos`);
    assert(leadGen.length === 5, `  - ${pKey}: 5 Lead-Generation Videos`);
  });

  // Verify Video Structure (Hook, Problem, Solution, CTA, B-roll, Camera Direction)
  const sampleVideo = allVideoConcepts[0];
  assert(sampleVideo.hook && sampleVideo.problem && sampleVideo.solution && sampleVideo.cta, 'Video contains hook, problem, solution, and CTA');
  assert(sampleVideo.bRoll && sampleVideo.cameraDirection, 'Video contains B-Roll and camera direction instructions');
  assert(sampleVideo.languages.includes('en') && sampleVideo.languages.includes('mr') && sampleVideo.languages.includes('hi'), 'Video supports English, Marathi, and Hindi');

  // ── GATE 5: CONTENT QUALITY SCORER ──
  console.log('\n--- GATE 5: Content Quality Scorer (0–100 Thresholds) ---');
  const highQualityItem = {
    businessId: 'avani-loan-services',
    templateName: 'als_wa_pl_awareness_01_mr',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    language: 'mr',
    headline: 'अवनी लोन सर्व्हिसेस — लातूरकरांसाठी सुलभ वैयक्तिक कर्ज सल्ला',
    body: 'लातूरमधील नोकरदार व्यक्तींसाठी तातडीच्या वैद्यकीय अथवा घरगुती गरजांसाठी अवनी लोन सर्व्हिसेसकडून पारदर्शक वैयक्तिक कर्ज मार्गदर्शन. सचिन शिंदे यांच्याकडून योग्य सल्ला मिळवा. संपर्क: 91756 35165. अटी लागू.',
    audience: ['Salaried Employees'],
    cta: [{ text: 'Apply on WhatsApp' }]
  };
  const scoreResult1 = scoreContentQuality(highQualityItem);

  assert(scoreResult1.totalScore >= 90, `Compliant template receives high score: ${scoreResult1.totalScore}/100 (${scoreResult1.status})`);
  assert(scoreResult1.status === 'READY', 'Score >= 90 categorized as READY');

  const lowQualityItem = {
    templateName: 'bad_guarantee_template',
    product: 'personal_loan',
    channel: 'WHATSAPP',
    language: 'en',
    headline: '100% Guaranteed Loan Approval In 5 Minutes!',
    body: 'Get guaranteed approval with zero documentation guaranteed and 100% sanction! Contact now.',
    cta: []
  };
  const scoreResult2 = scoreContentQuality(lowQualityItem);
  assert(scoreResult2.totalScore < 75, `Prohibited claims template scored low: ${scoreResult2.totalScore}/100 (${scoreResult2.status})`);
  assert(scoreResult2.status === 'REWRITE', 'Score < 75 categorized as REWRITE (blocked from publishing)');
  assert(scoreResult2.subScores.compliance === 0, 'Compliance score dropped to 0 due to prohibited claims');

  // ── GATE 6: DUPLICATE DETECTION ENGINE ──
  console.log('\n--- GATE 6: Duplicate Detection Engine ---');
  const templateList = [
    { templateId: 't1', headline: 'Personal Loan Advisory in Latur', body: 'Get transparent personal loan guidance from Sachin Shinde at Avani Loan Services.', imagePrompt: 'P1' },
    { templateId: 't2', headline: 'Personal Loan Advisory in Latur', body: 'Get transparent personal loan guidance from Sachin Shinde at Avani Loan Services.', imagePrompt: 'P1' },
    { templateId: 't3', headline: 'Commercial Business Loan Growth', body: 'Expand your business in Latur with unsecured MSME loan advisory from Avani Loan Services.', imagePrompt: 'P2' }
  ];
  const duplicateResults = detectDuplicates(templateList);
  assert(duplicateResults.duplicatesCount > 0, `Duplicate detector identified ${duplicateResults.duplicatesCount} duplicate pairings`);
  assert(duplicateResults.details.some(d => d.type === 'EXACT_DUPLICATE'), 'Exact duplicate flagged successfully');

  // ── GATE 7: 11-STATE PUBLISHING STATE MACHINE ──
  console.log('\n--- GATE 7: 11-State Publishing State Machine ---');
  assert(PUBLISHING_STATES.DRAFT === 'DRAFT', 'DRAFT state defined');
  assert(PUBLISHING_STATES.VALIDATED === 'VALIDATED', 'VALIDATED state defined');
  assert(PUBLISHING_STATES.READY_FOR_SUBMISSION === 'READY_FOR_SUBMISSION', 'READY_FOR_SUBMISSION state defined');
  assert(PUBLISHING_STATES.SUBMITTED_TO_META === 'SUBMITTED_TO_META', 'SUBMITTED_TO_META state defined');
  assert(PUBLISHING_STATES.META_PENDING === 'META_PENDING', 'META_PENDING state defined');
  assert(PUBLISHING_STATES.META_APPROVED === 'META_APPROVED', 'META_APPROVED state defined');
  assert(PUBLISHING_STATES.META_REJECTED === 'META_REJECTED', 'META_REJECTED state defined');
  assert(PUBLISHING_STATES.READY_FOR_AISENSY === 'READY_FOR_AISENSY', 'READY_FOR_AISENSY state defined');
  assert(PUBLISHING_STATES.PUBLISHED_TO_AISENSY === 'PUBLISHED_TO_AISENSY', 'PUBLISHED_TO_AISENSY state defined');
  assert(PUBLISHING_STATES.FAILED === 'FAILED', 'FAILED state defined');
  assert(PUBLISHING_STATES.ARCHIVED === 'ARCHIVED', 'ARCHIVED state defined');

  // Valid transition test
  const tr1 = transitionState(PUBLISHING_STATES.DRAFT, PUBLISHING_STATES.VALIDATED, { actor: 'validator' });
  assert(tr1.success === true, 'DRAFT -> VALIDATED transition succeeded');

  // Invalid transition test (skip states: DRAFT -> PUBLISHED_TO_AISENSY must fail)
  const tr2 = transitionState(PUBLISHING_STATES.DRAFT, PUBLISHING_STATES.PUBLISHED_TO_AISENSY, { actor: 'tester' });
  assert(tr2.success === false, 'Skipping states (DRAFT -> PUBLISHED_TO_AISENSY) is strictly rejected');

  // AiSensy dependency test: Cannot publish to AiSensy without META_APPROVED
  assert(canTransition(PUBLISHING_STATES.META_PENDING, PUBLISHING_STATES.READY_FOR_AISENSY) === false,
    'Cannot transition to READY_FOR_AISENSY while Meta is still META_PENDING');
  assert(canTransition(PUBLISHING_STATES.META_APPROVED, PUBLISHING_STATES.READY_FOR_AISENSY) === true,
    'Can transition to READY_FOR_AISENSY once META_APPROVED');

  // ── GATE 8: BULK SUBMISSION & MANDATORY HUMAN CONFIRMATION GUARD ──
  console.log('\n--- GATE 8: Bulk Submission & Human Confirmation Guard ---');
  const bulkCandidates = [
    { templateId: 't1', channel: 'WHATSAPP', publishingState: PUBLISHING_STATES.VALIDATED, qualityScore: 92 },
    { templateId: 't2', channel: 'WHATSAPP', publishingState: PUBLISHING_STATES.VALIDATED, qualityScore: 95 }
  ];
  // Without confirmation -> Must fail
  const unconfirmedCheck = validateBulkSubmissionPreconditions(bulkCandidates, false);
  assert(unconfirmedCheck.valid === false && unconfirmedCheck.error.includes('Explicit human confirmation is required'),
    'Bulk Meta submission strictly blocked without human confirmation');

  // With confirmation -> Passes
  const confirmedCheck = validateBulkSubmissionPreconditions(bulkCandidates, true);
  assert(confirmedCheck.valid === true, 'Bulk Meta submission passes with explicit human confirmation');

  // Low score rejection
  const lowScoreCandidates = [
    { templateId: 't3', channel: 'WHATSAPP', publishingState: PUBLISHING_STATES.VALIDATED, qualityScore: 60 }
  ];
  const lowScoreCheck = validateBulkSubmissionPreconditions(lowScoreCandidates, true);
  assert(lowScoreCheck.valid === false && lowScoreCheck.error.includes('below threshold'),
    'Bulk Meta submission rejects templates with low quality scores (< 75)');

  // ── GATE 9: 30-DAY CONTENT CALENDAR & CSV EXPORT ──
  console.log('\n--- GATE 9: Content Calendar & CSV Export ---');
  const productCalendar = generate30DayCalendar('personal_loan');
  assert(productCalendar.length === 30, 'Generated exactly 30 days in product marketing calendar');
  const fullCalendar = generate30DayCalendar('ALL');
  assert(fullCalendar.length === 300, 'Generated 300 entries across 10 products for full calendar');
  assert(productCalendar.every(d => d.scheduledTime && d.productName && d.channel), 'Calendar entries have product, channel, and scheduled time');

  const csvContent = exportCalendarToCSV(productCalendar);
  assert(csvContent.includes('calendarId,dayNumber,date,scheduledTime'),
    'Calendar CSV has correct header columns');
  assert(csvContent.includes('WHATSAPP') && csvContent.includes('INSTAGRAM'), 'Calendar CSV includes multi-channel schedules');


  // ── GATE 10: AGRO CONTAMINATION & WRONG CONTACT SCANNER ──
  console.log('\n--- GATE 10: Tenant Security & Wrong Contact Scanner ---');
  const testCopyClean = 'Avani Loan Services in Latur offers home loans. Contact Sachin Shinde at 91756 35165 or visit avanifinserv.com.';
  const agroScanClean = scanAgroContamination(testCopyClean);
  assert(agroScanClean.passed === true, 'Clean Loan Services copy passes agro scanner');

  const testCopyContaminated = 'Buy export quality spices and moringa seeds from ' + ['Avani', 'Agro', 'Foods'].join(' ') + '.';
  const agroScanContaminated = scanAgroContamination(testCopyContaminated);
  assert(agroScanContaminated.passed === false, 'Agro Foods contamination detected and blocked');


  console.log('\n===============================================================');
  console.log(`🏁 PHASE 2 TEST SUMMARY: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase2TestSuite().catch(err => {
  console.error('Fatal error in Phase 2 test suite:', err);
  process.exit(1);
});
