// src/services/contentQualityScorer.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Content Quality & Compliance Scoring Engine
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY } = require('../config/businessIdentity.cjs');
const { PRODUCTS_CATALOG } = require('../config/productsCatalog.cjs');
const { scanAgroContamination, validateTemplate } = require('./templateValidator.cjs');

/**
 * Score a template from 0 to 100 based on 8 rigorous dimensions:
 * 1. Regulatory Compliance (0-20 pts)
 * 2. Brand Consistency (0-20 pts)
 * 3. CTA Quality (0-15 pts)
 * 4. Readability & Formatting (0-15 pts)
 * 5. Product Relevance (0-10 pts)
 * 6. Audience Relevance (0-10 pts)
 * 7. Language & Natural Fluency (0-5 pts)
 * 8. Uniqueness / Non-Duplication (0-5 pts)
 *
 * Grades:
 * 90 - 100: READY FOR PUBLISHING
 * 75 - 89:  NEEDS HUMAN REVIEW
 * < 75:     REWRITE REQUIRED (BLOCKED)
 */
function scoreTemplateQuality(template, existingTemplates = []) {
  if (!template) {
    return { score: 0, grade: 'REWRITE', breakdown: {}, issues: ['Template is null or empty'] };
  }

  let score = 0;
  const breakdown = {};
  const issues = [];
  const body = (template.body || '').toLowerCase();
  const headline = (template.headline || '').toLowerCase();

  // ── 1. REGULATORY COMPLIANCE (0–20 pts) ──
  let compScore = 20;
  const prohibitedTerms = [
    'guaranteed loan approval', '100% approval', 'guaranteed sanction',
    'instant guaranteed loan', 'zero documentation guaranteed', 'guaranteed cibil improvement',
    'guaranteed interest rate'
  ];

  for (const term of prohibitedTerms) {
    if (body.includes(term) || headline.includes(term)) {
      compScore = 0;
      issues.push(`Prohibited financial claim detected: "${term}" (-20 pts)`);
      break;
    }
  }

  // Check Agro Foods contamination
  const agroScan = scanAgroContamination(template);
  if (!agroScan.passed) {
    compScore = 0;
    issues.push(`Cross-entity contamination detected: ${agroScan.detectedTerms.join(', ')} (-20 pts)`);
  }

  breakdown.compliance = compScore;
  score += compScore;

  // ── 2. BRAND CONSISTENCY (0–20 pts) ──
  let brandScore = 0;
  if (template.businessId === BUSINESS_IDENTITY.businessId) brandScore += 5;
  if (body.includes('avani') || headline.includes('avani') || (template.footer || '').includes('avani')) brandScore += 5;
  if (body.includes('sachin shinde') || body.includes('सचिन शिंदे') || (template.footer || '').includes('shinde')) brandScore += 5;
  if (body.includes('latur') || body.includes('लातूर') || body.includes('91756') || (template.footer || '').includes('latur')) brandScore += 5;

  breakdown.brandConsistency = brandScore;
  score += brandScore;

  // ── 3. CTA QUALITY (0–15 pts) ──
  let ctaScore = 0;
  const ctaList = Array.isArray(template.cta) ? template.cta : [template.cta];
  if (ctaList.length > 0 && ctaList[0]) {
    ctaScore += 10;
    const ctaText = typeof ctaList[0] === 'string' ? ctaList[0] : ctaList[0].text || '';
    if (ctaText.length >= 4 && ctaText.length <= 30) ctaScore += 5;
  } else {
    issues.push('Missing Call to Action (CTA) (-15 pts)');
  }
  breakdown.ctaQuality = ctaScore;
  score += ctaScore;

  // ── 4. READABILITY & FORMATTING (0–15 pts) ──
  let readScore = 15;
  const rawBody = template.body || '';
  if (rawBody.length < 20) {
    readScore -= 10;
    issues.push('Body copy is too brief (-10 pts)');
  }
  if (template.channel === 'WHATSAPP' && rawBody.length > 1024) {
    readScore -= 15;
    issues.push('WhatsApp body copy exceeds Meta 1024-character limit (-15 pts)');
  }
  if (readScore < 0) readScore = 0;
  breakdown.readability = readScore;
  score += readScore;

  // ── 5. PRODUCT RELEVANCE (0–10 pts) ──
  let prodScore = 0;
  const productConfig = PRODUCTS_CATALOG[template.product];
  if (productConfig) {
    prodScore += 5;
    const pName = productConfig.name.toLowerCase();
    if (body.includes(pName) || headline.includes(pName) || body.includes('loan') || body.includes('कर्ज')) {
      prodScore += 5;
    }
  } else {
    issues.push('Unrecognized product identifier (-10 pts)');
  }
  breakdown.productRelevance = prodScore;
  score += prodScore;

  // ── 6. AUDIENCE RELEVANCE (0–10 pts) ──
  let audScore = 5; // Baseline
  if (Array.isArray(template.audience) && template.audience.length > 0) {
    audScore += 5;
  }
  breakdown.audienceRelevance = audScore;
  score += audScore;

  // ── 7. LANGUAGE & NATURAL FLUENCY (0–5 pts) ──
  let langScore = 0;
  if (['en', 'mr', 'hi'].includes(template.language)) {
    langScore = 5;
  }
  breakdown.languageFluency = langScore;
  score += langScore;

  // ── 8. DUPLICATE DETECTION (0–5 pts) ──
  let dupScore = 5;
  if (Array.isArray(existingTemplates) && existingTemplates.length > 0) {
    const isDup = existingTemplates.some(t =>
      t.templateId !== template.templateId &&
      t.product === template.product &&
      t.channel === template.channel &&
      t.body === template.body
    );
    if (isDup) {
      dupScore = 0;
      issues.push('Duplicate template detected with identical copy (-5 pts)');
    }
  }
  breakdown.uniqueness = dupScore;
  score += dupScore;

  // Determine Grade
  let grade = 'READY';
  if (score < 75) grade = 'REWRITE';
  else if (score < 90) grade = 'REVIEW';

  return {
    score,
    totalScore: score,
    grade,
    status: grade,
    isPublishable: score >= 90,
    breakdown,
    subScores: breakdown,
    issues
  };
}


/**
 * Scan a collection of templates and identify duplicates and near duplicates
 */
function findDuplicates(templates = []) {
  const duplicates = [];
  const seenBodies = new Map();
  const seenHeadlines = new Map();

  templates.forEach(t => {
    const bodyKey = (t.body || '').trim().toLowerCase();
    const hlKey = (t.headline || '').trim().toLowerCase();

    if (bodyKey && seenBodies.has(bodyKey)) {
      duplicates.push({
        type: 'EXACT_BODY_DUPLICATE',
        originalTemplateId: seenBodies.get(bodyKey),
        duplicateTemplateId: t.templateId,
        product: t.product,
        channel: t.channel
      });
    } else if (bodyKey) {
      seenBodies.set(bodyKey, t.templateId);
    }

    if (hlKey && hlKey.length > 10 && seenHeadlines.has(hlKey)) {
      duplicates.push({
        type: 'SAME_HEADLINE',
        originalTemplateId: seenHeadlines.get(hlKey),
        duplicateTemplateId: t.templateId,
        product: t.product
      });
    } else if (hlKey && hlKey.length > 10) {
      seenHeadlines.set(hlKey, t.templateId);
    }
  });

  return duplicates;
}

module.exports = {
  scoreTemplateQuality,
  scoreContentQuality: scoreTemplateQuality,
  findDuplicates,
  detectDuplicates: (templates) => {
    const list = findDuplicates(templates);
    return {
      duplicatesCount: list.length,
      details: list.map(d => ({ ...d, type: d.type === 'EXACT_BODY_DUPLICATE' ? 'EXACT_DUPLICATE' : d.type }))
    };
  }
};

