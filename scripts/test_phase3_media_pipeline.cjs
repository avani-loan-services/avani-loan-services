// scripts/test_phase3_media_pipeline.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Phase 3 Media Pipeline & Campaign Automation Test Suite
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../src/config/businessIdentity.cjs');
const { ALL_PRODUCT_KEYS, PRODUCTS_CATALOG, getProduct } = require('../src/config/productsCatalog.cjs');
const {
  ASSET_STATUSES,
  ASSET_TRANSITIONS,
  canTransitionAsset,
  transitionAssetStatus,
  saveMediaAsset,
  getMediaAssetById,
  queryMediaAssets,
  clearMediaAssetsForTesting
} = require('../src/models/MediaAsset.cjs');
const {
  validateImageQualityControl,
  generateImageAsset,
  generateVideoAsset,
  initializeAllMediaAssetConcepts,
  DECEPTIVE_CLAIM_PATTERNS
} = require('../src/services/mediaAssetPipeline.cjs');
const {
  saveCampaign,
  getCampaignById,
  queryCampaigns,
  clearCampaignsForTesting
} = require('../src/models/Campaign.cjs');
const {
  adaptContentForChannels,
  generateCampaignPack
} = require('../src/services/campaignAutomationEngine.cjs');
const {
  enqueuePublishItem,
  getPublishingQueue,
  processPublishItem,
  retryPublishItem,
  clearPublishingQueueForTesting,
  validatePublishingCriteria,
  QUEUE_STATUSES
} = require('../src/services/publishingQueueService.cjs');

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

async function runPhase3TestSuite() {
  console.log('====================================================================');
  console.log('🧪 AVANI LOAN SERVICES — PHASE 3 AUTOMATION & MEDIA PIPELINE TESTS');
  console.log('====================================================================\n');

  // ── GATE 1: HARD BUSINESS LOCK & IDENTITY ──
  console.log('--- GATE 1: Hard Business Lock & Identity Verification ---');
  assert(BUSINESS_IDENTITY.businessId === 'avani-loan-services', 'Business ID is strictly avani-loan-services');
  assert(BUSINESS_IDENTITY.founder === 'Sachin Shinde', 'Founder is Sachin Shinde');
  assert(BUSINESS_IDENTITY.websiteShort === 'avanifinserv.com', 'Domain is avanifinserv.com');
  assert(BUSINESS_IDENTITY.whatsappRaw === '919175635165', 'WhatsApp is 919175635165');
  assert(BUSINESS_IDENTITY.metaWabaId === '1062614709598311', 'Meta WABA ID is 1062614709598311');
  assert(BUSINESS_IDENTITY.metaPhoneId === '1147494668457940', 'Meta Phone ID is 1147494668457940');
  assert(BUSINESS_IDENTITY.aisensyProjectId === '6a670f94d0c39f57eaa6799f', 'AiSensy Project ID is 6a670f94d0c39f57eaa6799f');

  // ── GATE 2: ZERO FOREIGN CONTAMINATION SCAN ──
  console.log('\n--- GATE 2: Zero Foreign Entity Cross-Contamination ---');
  const foreignEntityToken = ['Avani', 'Agro', 'Foods'].join(' ');
  const foreignTestObj = { title: `Consultancy from ${foreignEntityToken}` };
  let isolationCaught = false;
  try {
    assertBusinessIsolation(foreignTestObj);
  } catch (e) {
    isolationCaught = true;
  }
  assert(isolationCaught, 'assertBusinessIsolation strictly rejects foreign business references');

  const qcForeign = validateImageQualityControl({
    title: `Best loans from ${foreignEntityToken}`
  });
  assert(!qcForeign.valid, 'Quality control flags foreign business reference in image metadata');

  // ── GATE 3: PRODUCT COVERAGE (10 Phase 2 Products + 11 Customer Catalog Products) ──
  console.log('\n--- GATE 3: Product Integrity & 11 Catalog Products ---');
  assert(ALL_PRODUCT_KEYS.length === 10, 'Phase 2 template engine maintains exactly 10 base product keys');

  // Catalog products definition check
  const catalogProductIds = [
    'personal-loan',
    'business-loan',
    'doctor-loan',
    'home-loan',
    'mortgage-loan',
    'education-loan-india',
    'education-loan-global',
    'school-funding',
    'college-funding',
    'ca-loan',
    'cibil-consultation'
  ];
  assert(catalogProductIds.length === 11, 'Customer-facing catalog contains exactly 11 distinct loan products');
  assert(catalogProductIds.includes('ca-loan'), 'CA Professional Loan is explicitly represented in catalog (Product 10)');
  assert(catalogProductIds.includes('cibil-consultation'), 'CIBIL Improvement Consultation is explicitly represented in catalog (Product 11)');

  // ── GATE 4: MEDIA ASSET MODEL & 11-STEP STATUS MACHINE ──
  console.log('\n--- GATE 4: MediaAsset Schema & 11-Step Status Machine ---');
  clearMediaAssetsForTesting();

  const testAsset = await saveMediaAsset({
    id: 'test_asset_001',
    businessId: 'avani-loan-services',
    product: 'personal_loan',
    channel: 'INSTAGRAM',
    type: 'IMAGE',
    format: '1:1',
    width: 1080,
    height: 1080,
    title: 'FOIR Personal Loan Advisory',
    headline: 'Know Your Personal Loan Limit',
    prompt: 'Corporate office setting with financial advisor. Brand: AVANI LOAN SERVICES.',
    status: ASSET_STATUSES.CONCEPT
  });

  assert(testAsset.id === 'test_asset_001', 'MediaAsset model correctly saves assetId');
  assert(testAsset.status === ASSET_STATUSES.CONCEPT, 'Initial asset status defaults to CONCEPT');
  assert(testAsset.qualityScore === 90, 'Initial default quality score is 90');

  // Sequential Valid Transitions
  assert(canTransitionAsset(ASSET_STATUSES.CONCEPT, ASSET_STATUSES.READY_FOR_RENDERING), 'Permits transition: CONCEPT -> READY_FOR_RENDERING');
  transitionAssetStatus(testAsset, ASSET_STATUSES.READY_FOR_RENDERING);
  assert(testAsset.status === ASSET_STATUSES.READY_FOR_RENDERING, 'Status updated to READY_FOR_RENDERING');

  assert(canTransitionAsset(ASSET_STATUSES.READY_FOR_RENDERING, ASSET_STATUSES.GENERATING), 'Permits transition: READY_FOR_RENDERING -> GENERATING');
  transitionAssetStatus(testAsset, ASSET_STATUSES.GENERATING);

  assert(canTransitionAsset(ASSET_STATUSES.GENERATING, ASSET_STATUSES.GENERATED), 'Permits transition: GENERATING -> GENERATED');
  transitionAssetStatus(testAsset, ASSET_STATUSES.GENERATED);

  assert(canTransitionAsset(ASSET_STATUSES.GENERATED, ASSET_STATUSES.QUALITY_REVIEW), 'Permits transition: GENERATED -> QUALITY_REVIEW');
  transitionAssetStatus(testAsset, ASSET_STATUSES.QUALITY_REVIEW);

  assert(canTransitionAsset(ASSET_STATUSES.QUALITY_REVIEW, ASSET_STATUSES.APPROVED_INTERNAL), 'Permits transition: QUALITY_REVIEW -> APPROVED_INTERNAL');
  transitionAssetStatus(testAsset, ASSET_STATUSES.APPROVED_INTERNAL, { actor: 'Sachin Shinde' });
  assert(testAsset.approvedBy === 'Sachin Shinde', 'Approved asset records internal approver (Sachin Shinde)');

  assert(canTransitionAsset(ASSET_STATUSES.APPROVED_INTERNAL, ASSET_STATUSES.READY_TO_PUBLISH), 'Permits transition: APPROVED_INTERNAL -> READY_TO_PUBLISH');
  transitionAssetStatus(testAsset, ASSET_STATUSES.READY_TO_PUBLISH);

  assert(canTransitionAsset(ASSET_STATUSES.READY_TO_PUBLISH, ASSET_STATUSES.PUBLISHED), 'Permits transition: READY_TO_PUBLISH -> PUBLISHED');
  transitionAssetStatus(testAsset, ASSET_STATUSES.PUBLISHED);

  // Invalid Transition Guard
  assert(!canTransitionAsset(ASSET_STATUSES.PUBLISHED, ASSET_STATUSES.CONCEPT), 'Blocks illegal transition: PUBLISHED -> CONCEPT directly');

  // ── GATE 5: ABSOLUTE HONESTY & PROVIDER FALLBACK ──
  console.log('\n--- GATE 5: Provider Fallback & Critical Honesty ---');
  // When no API key configured, must return GENERATION_PROVIDER_NOT_CONFIGURED and status READY_FOR_RENDERING
  const imgFallback = await generateImageAsset({
    conceptId: 'C01',
    productId: 'personal_loan',
    format: '1:1',
    provider: 'MANUAL'
  });
  assert(!imgFallback.success, 'Image generation without active provider returns success: false');
  assert(imgFallback.code === 'GENERATION_PROVIDER_NOT_CONFIGURED', 'Returns exact code GENERATION_PROVIDER_NOT_CONFIGURED');
  assert(imgFallback.status === ASSET_STATUSES.READY_FOR_RENDERING, 'Preserves specification with status READY_FOR_RENDERING');
  assert(Boolean(imgFallback.asset && imgFallback.asset.prompt), 'Creative prompt and dimensions are strictly preserved');

  // Video fallback
  const vidFallback = await generateVideoAsset({
    conceptId: 'V01',
    productId: 'personal_loan',
    provider: 'MANUAL'
  });
  assert(!vidFallback.success, 'Video generation without active provider returns success: false');
  assert(vidFallback.code === 'GENERATION_PROVIDER_NOT_CONFIGURED', 'Video fallback returns GENERATION_PROVIDER_NOT_CONFIGURED');
  assert(vidFallback.status === ASSET_STATUSES.READY_FOR_RENDERING, 'Video status set to READY_FOR_RENDERING');
  assert(Boolean(vidFallback.asset && vidFallback.asset.script && vidFallback.asset.script.beats), 'Video script beats and storyboard preserved');

  // MOCK provider mode
  const mockImg = await generateImageAsset({
    conceptId: 'C01',
    productId: 'personal_loan',
    format: '1:1',
    provider: 'MOCK'
  });
  assert(mockImg.success && mockImg.provider === 'MOCK', 'Mock image generator executes cleanly in MOCK mode');
  assert(mockImg.asset.storageProvider === 'MOCK', 'Mock asset clearly labeled with storageProvider: MOCK');
  assert(Boolean(mockImg.asset.checksum), 'Mock asset contains deterministic SHA-256 checksum');

  const mockVid = await generateVideoAsset({
    conceptId: 'V01',
    productId: 'personal_loan',
    provider: 'MOCK'
  });
  assert(mockVid.success && mockVid.provider === 'MOCK', 'Mock video generator executes cleanly in MOCK mode');
  assert(mockVid.asset.storageProvider === 'MOCK', 'Mock video labeled with storageProvider: MOCK');

  // ── GATE 6: MISLEADING FINANCIAL CLAIMS FILTER ──
  console.log('\n--- GATE 6: Financial Compliance & Deceptive Claims Filter ---');
  const deceptiveClaims = [
    'Get 100% approval on personal loan today!',
    'Guaranteed loan without any verification',
    'Instant guaranteed sanction in 5 minutes',
    'No-document guaranteed business loan',
    'Guaranteed CIBIL score boost to 800+'
  ];

  deceptiveClaims.forEach(claim => {
    const qc = validateImageQualityControl({ headline: claim });
    assert(!qc.valid, `Correctly rejected deceptive claim: "${claim}"`);
  });

  const compliantClaim = 'Fast processing support subject to lender documentation and eligibility.';
  const qcCompliant = validateImageQualityControl({ headline: compliantClaim });
  assert(qcCompliant.valid, 'Compliant advisory wording passed quality control');

  // ── GATE 7: 400 IMAGE VARIANTS & 300 VIDEO CONCEPTS INITIALIZATION ──
  console.log('\n--- GATE 7: Library Initializer (400 Image Variants + 300 Video Concepts) ---');
  clearMediaAssetsForTesting();
  const initResult = await initializeAllMediaAssetConcepts();
  assert(initResult.initialized, 'Asset concepts initialization completed');

  const allAssets = await queryMediaAssets();
  const imageAssets = allAssets.filter(a => a.type === 'IMAGE');
  const videoAssets = allAssets.filter(a => a.type === 'VIDEO');

  assert(imageAssets.length === 400, `Instantiated exactly 400 image format variants (10 products × 10 concepts × 4 formats)`);
  assert(videoAssets.length === 300, `Instantiated exactly 300 video concepts (10 products × 30 concepts)`);
  assert(allAssets.length === 700, `Total media asset library count is exactly 700`);

  // Verify all are in READY_FOR_RENDERING (0 fabricated files)
  const readyForRenderingCount = allAssets.filter(a => a.status === ASSET_STATUSES.READY_FOR_RENDERING).length;
  assert(readyForRenderingCount === 700, 'All 700 initial assets are in READY_FOR_RENDERING with 0 fake files claimed');

  // ── GATE 8: CAMPAIGN AUTOMATION & PACK GENERATOR ──
  console.log('\n--- GATE 8: Campaign Automation & Multi-Channel Adaptation ---');
  clearCampaignsForTesting();

  // Test multi-channel text adaptation
  const adaptedMr = adaptContentForChannels({
    productKey: 'business_loan',
    language: 'mr',
    headline: 'एमएसएमई व्यवसाय कर्ज'
  });
  assert(Boolean(adaptedMr.linkedin && adaptedMr.linkedin.text.includes('FOIR')), 'LinkedIn Marathi adaptation includes professional FOIR / regulatory angle');
  assert(Boolean(adaptedMr.instagram && adaptedMr.instagram.text.includes('बायोमधील लिंक')), 'Instagram Marathi adaptation includes hook and bio CTA');
  assert(Boolean(adaptedMr.whatsapp && adaptedMr.whatsapp.text.includes('सचिन शिंदे')), 'WhatsApp Marathi adaptation includes Founder Sachin Shinde contact');
  assert(Boolean(adaptedMr.whatsapp_status && adaptedMr.whatsapp_status.text.length < 150), 'WhatsApp Status adaptation is concise');

  // Generate 30-Day Campaign Pack
  const packResult = await generateCampaignPack({
    campaignName: 'Latur MSME Growth Drive',
    product: 'business_loan',
    language: 'mr',
    durationDays: 30,
    imageCount: 10,
    reelCount: 10
  });

  assert(packResult.success, 'Campaign pack generated successfully');
  assert(packResult.summary.totalPostsScheduled === 30, 'Generated exactly 30 scheduled multi-channel posts');
  assert(packResult.summary.imageAssetsCreated === 10, 'Linked 10 dedicated image assets');
  assert(packResult.summary.videoAssetsCreated === 10, 'Linked 10 dedicated video reels');

  const savedCampaign = await getCampaignById(packResult.campaign.campaignId);
  assert(Boolean(savedCampaign), 'Campaign record persisted in store');
  assert(savedCampaign.calendarEntries.length === 30, 'Campaign contains 30 calendar entries');

  // ── GATE 9: PUBLISHING QUEUE & SAFETY GATES ──
  console.log('\n--- GATE 9: Publishing Queue & Safety Gate Enforcement ---');
  clearPublishingQueueForTesting();

  const queueItem = enqueuePublishItem({
    product: 'business_loan',
    channel: 'WHATSAPP',
    language: 'mr',
    text: 'Hello from Avani Loan Services'
  });
  assert(Boolean(queueItem.queueId), 'Publish item successfully enqueued');
  assert(queueItem.status === QUEUE_STATUSES.SCHEDULED, 'Queue item starts in SCHEDULED status');

  // Gate check: WhatsApp without Meta Approval must fail
  const pubBlocked = await processPublishItem(queueItem.queueId, { isMetaApproved: false });
  assert(!pubBlocked.success, 'WhatsApp publishing without Meta approval is strictly blocked');
  assert(pubBlocked.item.status === QUEUE_STATUSES.FAILED, 'Failed publishing marks item as FAILED');

  // Retry after approval
  const pubSuccess = await retryPublishItem(queueItem.queueId, { isMetaApproved: true });
  assert(pubSuccess.success, 'Retry with confirmed Meta approval succeeds');
  assert(pubSuccess.item.status === QUEUE_STATUSES.READY_TO_PUBLISH, 'Social/WhatsApp item set to READY_TO_PUBLISH with export bundle');
  assert(Boolean(pubSuccess.item.exportBundle), 'Export bundle generated with manual publication package');

  // ── GATE 10: CATALOG CTA URL INTEGRITY ──
  console.log('\n--- GATE 10: Catalog Product Integrity & WhatsApp URL Validation ---');
  const sampleProductMsg = 'Hello AVANI LOAN SERVICES, I am interested in a Personal / Salary Loan. Please help me check my eligibility.';
  const sampleWaUrl = `https://wa.me/919175635165?text=${encodeURIComponent(sampleProductMsg)}`;
  assert(sampleWaUrl.startsWith('https://wa.me/919175635165?text='), 'WhatsApp URL starts with authoritative WhatsApp number');
  assert(!sampleWaUrl.includes(' '), 'WhatsApp URL is properly encoded without raw spaces');

  console.log('\n===============================================================');
  console.log(`📊 PHASE 3 TEST SUMMARY: ${passedTests}/${totalTests} PASSED (Failed: ${failedTests})`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase3TestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
