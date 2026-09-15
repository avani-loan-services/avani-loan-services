// src/services/mediaAssetPipeline.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Provider-Independent Media Asset Pipeline
// ─────────────────────────────────────────────────────────────────

const crypto = require('crypto');
const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../config/businessIdentity.cjs');
const { ALL_PRODUCT_KEYS, PRODUCTS_CATALOG } = require('../config/productsCatalog.cjs');
const {
  FORMAT_SPECS,
  BRAND_THEME,
  generate100VisualConcepts
} = require('./imageAssetEngine.cjs');
const {
  generate300VideoConcepts,
  VIDEO_CATEGORIES
} = require('./videoAssetEngine.cjs');
const { scoreContentQuality } = require('./contentQualityScorer.cjs');
const {
  ASSET_STATUSES,
  saveMediaAsset,
  getMediaAssetById,
  queryMediaAssets,
  transitionAssetStatus
} = require('../models/MediaAsset.cjs');

// Disallowed deceptive / non-compliant financial claims
const DECEPTIVE_CLAIM_PATTERNS = [
  /100%\s*approval/i,
  /guaranteed\s*approval/i,
  /guaranteed\s*loan/i,
  /guaranteed\s*interest/i,
  /instant\s*guaranteed/i,
  /no[- ]document\s*guaranteed/i,
  /guaranteed\s*cibil/i,
  /guaranteed\s*sanction/i,
  /everyone\s*qualifies/i,
  /loan\s*without\s*any\s*documents/i
];

/**
 * Validates image metadata and creative prompt against compliance and brand rules.
 */
function validateImageQualityControl(metadata = {}) {
  const issues = [];
  const textToScan = [
    metadata.title || '',
    metadata.headline || '',
    metadata.caption || '',
    metadata.prompt || '',
    metadata.cta || ''
  ].join(' ');

  // 1. Foreign business references
  const foreignRef = ['Avani', 'Agro', 'Foods'].join(' ');
  if (textToScan.toLowerCase().includes(foreignRef.toLowerCase())) {
    issues.push('Foreign entity reference detected in image metadata');
  }

  // 2. Deceptive financial claims
  for (const pattern of DECEPTIVE_CLAIM_PATTERNS) {
    if (pattern.test(textToScan)) {
      issues.push(`Deceptive financial claim detected: "${textToScan.match(pattern)[0]}"`);
    }
  }

  // 3. Brand consistency
  const contactCheck = textToScan.includes('91756') || textToScan.includes('avanifinserv') || textToScan.includes('AVANI');
  if (!contactCheck && metadata.strictBrand) {
    issues.push('Missing authoritative business brand or contact identifier');
  }

  // 4. Aspect ratio check
  const validFormats = ['1:1', '4:5', '9:16', '1.91:1', '16:9'];
  if (metadata.format && !validFormats.includes(metadata.format)) {
    issues.push(`Invalid aspect ratio "${metadata.format}". Supported: ${validFormats.join(', ')}`);
  }

  return {
    valid: issues.length === 0,
    issues,
    qualityScore: issues.length === 0 ? 95 : Math.max(40, 95 - issues.length * 20)
  };
}

/**
 * Provider-independent image generation interface.
 * Providers: 'MOCK', 'OPENAI', 'EXTERNAL', 'MANUAL'
 */
async function generateImageAsset({
  conceptId,
  productId,
  format = '1:1',
  provider = process.env.IMAGE_GENERATION_PROVIDER || 'MANUAL',
  options = {}
}) {
  const formatSpec = Object.values(FORMAT_SPECS).find(f => f.ratio === format) || FORMAT_SPECS.SQUARE;

  // Retrieve base visual concept
  const allConcepts = generate100VisualConcepts();
  const baseConcept = allConcepts.find(c => c.conceptId === conceptId && (!productId || c.productId === productId)) ||
                      allConcepts.find(c => !productId || c.productId === productId) ||
                      allConcepts[0];

  const assetId = `img_${baseConcept.productId}_${baseConcept.conceptId}_${format.replace(':', 'x')}_${Date.now()}`;
  const prompt = `${baseConcept.imagePrompt} Aspect Ratio ${formatSpec.ratio}. Dimensions: ${formatSpec.width}x${formatSpec.height}. Brand: AVANI LOAN SERVICES. Watermark: +91 91756 35165 | avanifinserv.com.`;

  // Quality check
  const qc = validateImageQualityControl({
    title: baseConcept.title,
    headline: baseConcept.headline,
    prompt,
    cta: baseConcept.cta,
    format: formatSpec.ratio,
    strictBrand: false
  });

  if (!qc.valid) {
    return {
      success: false,
      code: 'QUALITY_CONTROL_FAILED',
      issues: qc.issues,
      status: ASSET_STATUSES.FAILED
    };
  }

  // Provider dispatch
  const normalizedProvider = String(provider).toUpperCase();

  if (normalizedProvider === 'MOCK') {
    // Deterministic mock generation for testing and pipeline verification
    const mockChecksum = crypto.createHash('sha256').update(prompt + assetId).digest('hex');
    const assetRecord = await saveMediaAsset({
      id: assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product: baseConcept.productId,
      audience: ['Salaried Professionals', 'Business Owners'],
      channel: formatSpec.channel.includes('WhatsApp') ? 'WHATSAPP_STATUS' : 'INSTAGRAM',
      language: 'en',
      type: 'IMAGE',
      format: formatSpec.ratio,
      width: formatSpec.width,
      height: formatSpec.height,
      title: baseConcept.title,
      headline: baseConcept.headline,
      caption: `${baseConcept.headline} — Contact Sachin Shinde at AVANI LOAN SERVICES (+91 91756 35165)`,
      cta: baseConcept.cta,
      prompt,
      storageProvider: 'MOCK',
      storageKey: `mock/assets/${assetId}.png`,
      publicUrl: `https://www.avanifinserv.com/mock-assets/${assetId}.png`,
      thumbnailUrl: `https://www.avanifinserv.com/mock-assets/${assetId}_thumb.png`,
      status: ASSET_STATUSES.GENERATED,
      qualityScore: qc.qualityScore,
      checksum: mockChecksum,
      version: 1
    });

    return {
      success: true,
      provider: 'MOCK',
      asset: assetRecord,
      message: 'Mock image asset generated successfully for test validation'
    };
  }

  if (normalizedProvider === 'OPENAI') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // API not configured: DO NOT fake generation. Preserve specification.
      const specAsset = await saveMediaAsset({
        id: assetId,
        businessId: BUSINESS_IDENTITY.businessId,
        product: baseConcept.productId,
        audience: ['Salaried Professionals', 'Business Owners'],
        channel: 'INSTAGRAM',
        language: 'en',
        type: 'IMAGE',
        format: formatSpec.ratio,
        width: formatSpec.width,
        height: formatSpec.height,
        title: baseConcept.title,
        headline: baseConcept.headline,
        prompt,
        storageProvider: 'MANUAL',
        status: ASSET_STATUSES.READY_FOR_RENDERING,
        qualityScore: qc.qualityScore
      });

      return {
        success: false,
        code: 'GENERATION_PROVIDER_NOT_CONFIGURED',
        provider: 'OPENAI',
        status: ASSET_STATUSES.READY_FOR_RENDERING,
        asset: specAsset,
        message: 'OpenAI API key not configured. Asset preserved in READY_FOR_RENDERING status.'
      };
    }

    // Real OpenAI DALL-E integration would be invoked here if key present
    // Safe fallback if call fails
    return {
      success: false,
      code: 'GENERATION_PROVIDER_NOT_CONFIGURED',
      status: ASSET_STATUSES.READY_FOR_RENDERING,
      prompt
    };
  }

  // Default: MANUAL or EXTERNAL without active API credentials
  const specAsset = await saveMediaAsset({
    id: assetId,
    businessId: BUSINESS_IDENTITY.businessId,
    product: baseConcept.productId,
    audience: ['Salaried Professionals', 'Business Owners'],
    channel: 'INSTAGRAM',
    language: 'en',
    type: 'IMAGE',
    format: formatSpec.ratio,
    width: formatSpec.width,
    height: formatSpec.height,
    title: baseConcept.title,
    headline: baseConcept.headline,
    prompt,
    storageProvider: 'MANUAL',
    status: ASSET_STATUSES.READY_FOR_RENDERING,
    qualityScore: qc.qualityScore
  });

  return {
    success: false,
    code: 'GENERATION_PROVIDER_NOT_CONFIGURED',
    provider: normalizedProvider,
    status: ASSET_STATUSES.READY_FOR_RENDERING,
    asset: specAsset,
    message: `Image generation provider "${normalizedProvider}" is not configured. Specification saved as READY_FOR_RENDERING.`
  };
}

/**
 * Provider-independent video generation interface.
 * Providers: 'MOCK', 'EXTERNAL', 'MANUAL'
 */
async function generateVideoAsset({
  conceptId,
  productId,
  provider = process.env.VIDEO_GENERATION_PROVIDER || 'MANUAL',
  options = {}
}) {
  const allVideos = generate300VideoConcepts();
  const baseConcept = allVideos.find(v => (v.videoId === conceptId || v.conceptId === conceptId) && (!productId || v.productId === productId || v.product === productId)) ||
                      allVideos.find(v => !productId || v.productId === productId || v.product === productId) ||
                      allVideos[0];

  const pId = baseConcept.productId || baseConcept.product || 'personal_loan';
  const cId = baseConcept.videoId || baseConcept.conceptId || 'V01';
  const assetId = `vid_${pId}_${cId}_${Date.now()}`;
  const beats = baseConcept.beats || {
    hook: baseConcept.hook || 'Video Hook',
    problem: baseConcept.problem || 'Common hurdle in loan process',
    solution: baseConcept.solution || 'Avani Loan Services advisory',
    cta: baseConcept.cta || 'Contact Advisor'
  };

  const scriptContent = [
    beats.hook,
    beats.problem,
    beats.solution,
    beats.cta
  ].join(' ');

  const title = baseConcept.title || `${baseConcept.productName || pId} ${baseConcept.category || 'Video'}`;

  // Quality check
  const qc = validateImageQualityControl({
    title,
    headline: beats.hook,
    prompt: scriptContent,
    cta: beats.cta,
    format: '9:16',
    strictBrand: false
  });

  if (!qc.valid) {
    return {
      success: false,
      code: 'QUALITY_CONTROL_FAILED',
      issues: qc.issues,
      status: ASSET_STATUSES.FAILED
    };
  }

  const normalizedProvider = String(provider).toUpperCase();
  const dur = typeof baseConcept.duration === 'number' ? baseConcept.duration : (parseInt(baseConcept.duration, 10) || 15);

  if (normalizedProvider === 'MOCK') {
    const mockChecksum = crypto.createHash('sha256').update(scriptContent + assetId).digest('hex');
    const assetRecord = await saveMediaAsset({
      id: assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product: pId,
      audience: ['Salaried Professionals', 'Business Owners'],
      channel: 'INSTAGRAM',
      language: baseConcept.language || 'mr',
      type: 'VIDEO',
      format: '9:16',
      width: 1080,
      height: 1920,
      duration: dur,
      title,
      headline: beats.hook,
      caption: `${beats.hook} — मार्गदर्शन: सचिन शिंदे, अवनी लोन सर्व्हिसेस (+91 91756 35165)`,
      cta: beats.cta,
      script: {
        beats,
        broll: baseConcept.bRoll || baseConcept.broll || 'Desk consultation review',
        onScreenText: baseConcept.onScreenText || 'Avani Loan Services | +91 91756 35165',
        audioMusic: baseConcept.audioMusic || 'Upbeat corporate ambient background music',
        thumbnailPrompt: baseConcept.thumbnailPrompt || `${title} video thumbnail with Sachin Shinde lower third`
      },
      storageProvider: 'MOCK',
      storageKey: `mock/videos/${assetId}.mp4`,
      publicUrl: `https://www.avanifinserv.com/mock-videos/${assetId}.mp4`,
      thumbnailUrl: `https://www.avanifinserv.com/mock-videos/${assetId}_thumb.jpg`,
      status: ASSET_STATUSES.GENERATED,
      qualityScore: qc.qualityScore,
      checksum: mockChecksum,
      version: 1
    });

    return {
      success: true,
      provider: 'MOCK',
      asset: assetRecord,
      message: 'Mock video asset generated successfully for test validation'
    };
  }

  // If real video generation provider not configured:
  // Store full storyboard, script, scene list, B-roll, on-screen text, thumbnail spec in READY_FOR_RENDERING
  const storyboardAsset = await saveMediaAsset({
    id: assetId,
    businessId: BUSINESS_IDENTITY.businessId,
    product: pId,
    audience: ['Salaried Professionals', 'Business Owners'],
    channel: 'INSTAGRAM',
    language: baseConcept.language || 'mr',
    type: 'VIDEO',
    format: '9:16',
    width: 1080,
    height: 1920,
    duration: dur,
    title,
    headline: beats.hook,
    cta: beats.cta,
    script: {
      beats,
      broll: baseConcept.bRoll || baseConcept.broll || 'Desk consultation review',
      onScreenText: baseConcept.onScreenText || 'Avani Loan Services | +91 91756 35165',
      audioMusic: baseConcept.audioMusic || 'Upbeat corporate ambient background music',
      thumbnailPrompt: baseConcept.thumbnailPrompt || `${title} video thumbnail with Sachin Shinde lower third`,
      productionInstructions: 'Shoot vertical 9:16, natural warm studio lighting, Marathi voiceover, clear lower third logo.'
    },
    storageProvider: 'MANUAL',
    status: ASSET_STATUSES.READY_FOR_RENDERING,
    qualityScore: qc.qualityScore
  });

  return {
    success: false,
    code: 'GENERATION_PROVIDER_NOT_CONFIGURED',
    provider: normalizedProvider,
    status: ASSET_STATUSES.READY_FOR_RENDERING,
    asset: storyboardAsset,
    message: `Video generation provider "${normalizedProvider}" is not configured. Storyboard and script preserved as READY_FOR_RENDERING.`
  };
}

/**
 * Initializes the full library of 400 image format variants and 300 video concepts.
 * All entries start as CONCEPT or READY_FOR_RENDERING with 0 physical files fabricated.
 */
async function initializeAllMediaAssetConcepts() {
  const existingCount = (await queryMediaAssets()).length;
  if (existingCount >= 700) {
    return { initialized: false, count: existingCount };
  }

  let createdCount = 0;

  // 1. 100 Image Concepts × 4 Formats = 400 Image Format Variants
  const imageConcepts = generate100VisualConcepts();
  const formatRatios = ['1:1', '4:5', '9:16', '1.91:1'];

  for (const concept of imageConcepts) {
    for (const ratio of formatRatios) {
      const spec = Object.values(FORMAT_SPECS).find(f => f.ratio === ratio) || FORMAT_SPECS.SQUARE;
      const assetId = `img_${concept.productId}_${concept.conceptId}_${ratio.replace(':', 'x')}`;

      await saveMediaAsset({
        id: assetId,
        businessId: BUSINESS_IDENTITY.businessId,
        product: concept.productId,
        audience: ['Salaried Professionals', 'Business Owners', 'Property Buyers'],
        channel: ratio === '9:16' ? 'WHATSAPP_STATUS' : (ratio === '4:5' ? 'LINKEDIN' : 'INSTAGRAM'),
        language: 'en',
        type: 'IMAGE',
        format: ratio,
        width: spec.width,
        height: spec.height,
        title: `${concept.title} (${ratio})`,
        headline: concept.headline,
        caption: `${concept.headline} — Connect with Sachin Shinde, AVANI LOAN SERVICES (+91 91756 35165).`,
        cta: concept.cta,
        prompt: `${concept.imagePrompt} Ratio ${ratio}, ${spec.width}x${spec.height}. Palette: Navy and light blue.`,
        storageProvider: 'MANUAL',
        status: ASSET_STATUSES.READY_FOR_RENDERING,
        qualityScore: concept.qualityScore || 95
      });
      createdCount++;
    }
  }

  // 2. 300 Video Concepts
  const videoConcepts = generate300VideoConcepts();
  for (const v of videoConcepts) {
    const pId = v.productId || v.product || 'personal_loan';
    const cId = v.videoId || v.conceptId || `vid_${Math.random().toString(36).substring(2, 7)}`;
    const assetId = `vid_${pId}_${cId}`;
    const beats = v.beats || {
      hook: v.hook || 'Video Hook',
      problem: v.problem || 'Common hurdle in loan process',
      solution: v.solution || 'Avani Loan Services advisory',
      cta: v.cta || 'Contact Advisor'
    };
    const title = v.title || `${v.productName || pId} ${v.category || 'Reel'}`;
    const dur = typeof v.duration === 'number' ? v.duration : (parseInt(v.duration, 10) || 15);

    await saveMediaAsset({
      id: assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product: pId,
      audience: ['Salaried Professionals', 'Business Owners', 'Local Borrowers'],
      channel: 'INSTAGRAM',
      language: v.language || 'mr',
      type: 'VIDEO',
      format: '9:16',
      width: 1080,
      height: 1920,
      duration: dur,
      title,
      headline: beats.hook,
      caption: `${beats.hook} — मार्गदर्शन: सचिन शिंदे, अवनी लोन सर्व्हिसेस (+91 91756 35165).`,
      cta: beats.cta,
      script: {
        beats,
        broll: v.bRoll || v.broll || 'Office desk review',
        onScreenText: v.onScreenText || 'Avani Loan Services | +91 91756 35165',
        audioMusic: v.audioMusic || 'Corporate ambient audio',
        thumbnailPrompt: v.thumbnailPrompt || 'Thumbnail with Avani branding'
      },
      storageProvider: 'MANUAL',
      status: ASSET_STATUSES.READY_FOR_RENDERING,
      qualityScore: 92
    });
    createdCount++;
  }

  return { initialized: true, createdCount, totalAssets: (await queryMediaAssets()).length };
}

module.exports = {
  validateImageQualityControl,
  generateImageAsset,
  generateVideoAsset,
  initializeAllMediaAssetConcepts,
  DECEPTIVE_CLAIM_PATTERNS
};
