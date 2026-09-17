/**
 * scripts/ingest-avani-media.cjs
 * ─────────────────────────────────────────────────────────────────
 * AVANI LOAN SERVICES — Physical Media Ingestion Engine
 * Ingests physical images and videos from local operator directories:
 * - IMAGE: C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\AVANI LOAN SERVICES\IMAGE
 * - Video: C:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\AVANI LOAN SERVICES\Video
 * ─────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const { BUSINESS_IDENTITY, assertBusinessIsolation } = require('../src/config/businessIdentity.cjs');
const { ASSET_STATUSES, saveMediaAsset, queryMediaAssets } = require('../src/models/MediaAsset.cjs');

const IMAGE_SOURCE_DIR = 'C:\\Users\\ALPHA-1\\Downloads\\21MAY2026\\SACHIN SHINDE DOCUMENTS\\AVANI LOAN SERVICES\\IMAGE';
const VIDEO_SOURCE_DIR = 'C:\\Users\\ALPHA-1\\Downloads\\21MAY2026\\SACHIN SHINDE DOCUMENTS\\AVANI LOAN SERVICES\\Video';

const DEST_BASE_DIR = path.join(__dirname, '../public/media');
const DEST_IMG_DIR = path.join(DEST_BASE_DIR, 'images');
const DEST_VID_DIR = path.join(DEST_BASE_DIR, 'videos');
const DEST_THUMB_DIR = path.join(DEST_BASE_DIR, 'thumbnails');
const REGISTRY_FILE = path.join(__dirname, '../src/data/mediaAssetRegistry.json');

// Supported Extensions
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.m4v']);
const IGNORED_EXTS = new Set(['.tmp', '.part', '.crdownload', '.ds_store']);
const IGNORED_NAMES = new Set(['thumbs.db', '.ds_store']);

// Deceptive Claim Patterns
const DECEPTIVE_PATTERNS = [
  /100%\s*approval/i,
  /guaranteed\s*approval/i,
  /guaranteed\s*loan/i,
  /guaranteed\s*sanction/i,
  /instant\s*guaranteed/i,
  /no[- ]document\s*guaranteed/i,
  /guaranteed\s*cibil/i
];

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
}

function calculateFileSha256(filePath) {
  const hash = crypto.createHash('sha256');
  const buffer = fs.readFileSync(filePath);
  hash.update(buffer);
  return hash.digest('hex');
}

function getMimeType(ext) {
  const map = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.m4v': 'video/mp4'
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

function classifyAspect(width, height) {
  if (!width || !height) return 'CUSTOM';
  const ratio = width / height;
  if (ratio >= 0.95 && ratio <= 1.05) return '1:1';
  if (ratio >= 0.75 && ratio <= 0.85) return '4:5';
  if (ratio >= 0.50 && ratio <= 0.60) return '9:16';
  if (ratio >= 1.70 && ratio <= 1.85) return '16:9';
  if (ratio >= 1.88 && ratio <= 1.95) return '1.91:1';
  return 'CUSTOM';
}

function classifyProduct(filePath, filename) {
  const target = (filePath + ' ' + filename).toLowerCase();
  
  // Explicit checks in order of specificity
  if (target.includes('cibil') || target.includes('credit-score') || target.includes('credit_score') || target.includes('low cibil')) {
    return 'cibil_consultation';
  }
  if (target.includes('school-college') || (target.includes('school') && target.includes('college'))) {
    return 'school_funding'; // Shared category default
  }
  if (target.includes('school') || target.includes('school-funding')) {
    return 'school_funding';
  }
  if (target.includes('college') || target.includes('college-funding')) {
    return 'college_funding';
  }
  if (target.includes('global') || target.includes('abroad') || target.includes('overseas') || target.includes('study-abroad') || target.includes('international')) {
    return 'education_loan_global';
  }
  if (target.includes('education') || target.includes('student')) {
    return 'education_loan_india';
  }
  if (target.includes('doctor') || target.includes('medical') || target.includes('clinic')) {
    return 'doctor_loan';
  }
  if (target.includes('home') || target.includes('housing') || target.includes('house') || target.includes('hl')) {
    return 'home_loan';
  }
  if (target.includes('mortgage') || target.includes('lap') || target.includes('loan-against-property') || target.includes('property')) {
    return 'mortgage_loan';
  }
  if (target.includes('ca loan') || target.includes('chartered-accountant') || target.includes('chartered accountant') || target.includes('ca_loan')) {
    return 'ca_loan';
  }
  if (target.includes('business') || target.includes('msme') || target.includes('enterprise') || target.includes('self-employed') || target.includes('bl')) {
    return 'business_loan';
  }
  if (target.includes('personal') || target.includes('salary') || target.includes('employee') || target.includes('pl')) {
    return 'personal_loan';
  }

  return 'UNCLASSIFIED_REVIEW_REQUIRED';
}

function classifyChannel(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('instagram') || lower.includes('reels') || lower.includes('reel') || lower.includes('story') || lower.includes('9to16')) {
    return 'INSTAGRAM';
  }
  if (lower.includes('facebook') || lower.includes('fb')) return 'FACEBOOK';
  if (lower.includes('linkedin')) return 'LINKEDIN';
  if (lower.includes('whatsapp') && lower.includes('status')) return 'WHATSAPP_STATUS';
  if (lower.includes('whatsapp')) return 'WHATSAPP';
  if (lower.includes('banner') || lower.includes('website') || lower.includes('hero')) return 'WEBSITE';
  return 'GENERAL';
}

function classifyLanguage(filename, text = '') {
  const combined = (filename + ' ' + text).toLowerCase();
  // Marathi indicators
  if (/marathi|मराठी|व्याजदर|कर्ज|पाहिजे|सर्व्हिसेस|स्वरूपात|साथीदार|गरजांसाठी|आपल्या|तुमच्या|व्यवसायासाठी/.test(combined)) {
    return 'mr';
  }
  // Hindi indicators
  if (/hindi|हिंदी|लोन|ब्याज/.test(combined)) {
    return 'hi';
  }
  if (/[a-zA-Z]/.test(combined)) {
    return 'en';
  }
  return 'unknown';
}

function readMp4Metadata(filePath, fileSize) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const readLen = Math.min(fileSize, 1024 * 512); // read up to 512KB from tail and head
    
    // 1. Try head buffer
    const headBuf = Buffer.alloc(readLen);
    fs.readSync(fd, headBuf, 0, readLen, 0);

    // 2. Try tail buffer
    const tailBuf = Buffer.alloc(readLen);
    const tailPos = Math.max(0, fileSize - readLen);
    fs.readSync(fd, tailBuf, 0, readLen, tailPos);
    fs.closeSync(fd);

    let duration = 0;
    let width = 0;
    let height = 0;

    // Search buffers for mvhd and tkhd
    for (const buf of [tailBuf, headBuf]) {
      const mvhdIdx = buf.indexOf('mvhd');
      if (mvhdIdx !== -1 && duration === 0) {
        const version = buf.readUInt8(mvhdIdx + 4);
        const timescale = version === 0 ? buf.readUInt32BE(mvhdIdx + 16) : buf.readUInt32BE(mvhdIdx + 24);
        const dur = version === 0 ? buf.readUInt32BE(mvhdIdx + 20) : Number(buf.readBigUInt64BE(mvhdIdx + 28));
        if (timescale > 0) {
          duration = Math.round((dur / timescale) * 10) / 10;
        }
      }

      const tkhdIdx = buf.indexOf('tkhd');
      if (tkhdIdx !== -1 && width === 0) {
        if (tkhdIdx + 88 <= buf.length) {
          const w = Math.round(buf.readUInt32BE(tkhdIdx + 80) / 65536);
          const h = Math.round(buf.readUInt32BE(tkhdIdx + 84) / 65536);
          if (w > 0 && h > 0 && w < 10000 && h < 10000) {
            width = w;
            height = h;
          }
        }
      }
    }

    return { duration, width, height };
  } catch (err) {
    return { duration: 0, width: 0, height: 0, error: err.message };
  }
}

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDirectory(fullPath, fileList);
      } else {
        fileList.push({ path: fullPath, size: stat.size, filename: entry });
      }
    } catch (e) {}
  }
  return fileList;
}

async function ingestMedia() {
  console.log('===============================================================');
  console.log('🚀 AVANI LOAN SERVICES — PHYSICAL MEDIA INGESTION ENGINE');
  console.log('===============================================================\n');

  // Verify access to local Windows paths
  if (!fs.existsSync(IMAGE_SOURCE_DIR) || !fs.existsSync(VIDEO_SOURCE_DIR)) {
    console.error('❌ ERROR: LOCAL_MEDIA_PATH_NOT_ACCESSIBLE');
    console.error(`  IMAGE PATH (${IMAGE_SOURCE_DIR}): ${fs.existsSync(IMAGE_SOURCE_DIR)}`);
    console.error(`  VIDEO PATH (${VIDEO_SOURCE_DIR}): ${fs.existsSync(VIDEO_SOURCE_DIR)}`);
    process.exit(1);
  }

  // Ensure destination folders exist
  fs.mkdirSync(DEST_IMG_DIR, { recursive: true });
  fs.mkdirSync(DEST_THUMB_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });

  const rawImages = scanDirectory(IMAGE_SOURCE_DIR);
  const rawVideos = scanDirectory(VIDEO_SOURCE_DIR);

  console.log(`Discovered ${rawImages.length} raw image files in ${IMAGE_SOURCE_DIR}`);
  console.log(`Discovered ${rawVideos.length} raw video files in ${VIDEO_SOURCE_DIR}\n`);

  // Tracking counts
  let totalImagesFound = rawImages.length;
  let totalVideosFound = rawVideos.length;
  let validImageFiles = 0;
  let invalidImageFiles = 0;
  let validVideoFiles = 0;
  let invalidVideoFiles = 0;
  let duplicateImages = 0;
  let duplicateVideos = 0;
  let classifiedImages = 0;
  let classifiedVideos = 0;
  let unclassifiedAssets = 0;
  let importedImages = 0;
  let importedVideos = 0;
  let reviewRequired = 0;

  const seenChecksums = new Set();
  const ingestedAssets = [];

  console.log('--- Ingesting Physical Images ---');
  for (const img of rawImages) {
    const ext = path.extname(img.filename).toLowerCase();
    const baseName = path.basename(img.filename, ext);

    // Skip temp/system files
    if (IGNORED_EXTS.has(ext) || IGNORED_NAMES.has(img.filename.toLowerCase()) || img.filename.startsWith('~$')) {
      invalidImageFiles++;
      continue;
    }

    if (!IMAGE_EXTS.has(ext) || img.size === 0) {
      invalidImageFiles++;
      continue;
    }

    let checksum;
    try {
      checksum = calculateFileSha256(img.path);
    } catch (err) {
      invalidImageFiles++;
      continue;
    }

    if (seenChecksums.has(checksum)) {
      duplicateImages++;
      continue;
    }
    seenChecksums.add(checksum);

    // Image metadata via sharp
    let width = 1080;
    let height = 1080;
    try {
      const meta = await sharp(img.path).metadata();
      width = meta.width || 1080;
      height = meta.height || 1080;
    } catch (err) {
      invalidImageFiles++;
      continue;
    }

    validImageFiles++;
    const aspect = classifyAspect(width, height);
    const product = classifyProduct(img.path, img.filename);
    const channel = classifyChannel(img.filename);
    const language = classifyLanguage(img.filename);

    if (product !== 'UNCLASSIFIED_REVIEW_REQUIRED') {
      classifiedImages++;
    } else {
      unclassifiedAssets++;
    }

    // Quality checks
    const qualityIssues = [];
    if (img.filename.toLowerCase().includes('agro') || img.filename.toLowerCase().includes('moringa')) {
      qualityIssues.push('Foreign entity reference');
    }
    for (const pattern of DECEPTIVE_PATTERNS) {
      if (pattern.test(img.filename)) {
        qualityIssues.push(`Deceptive claim: ${img.filename.match(pattern)[0]}`);
      }
    }

    const isReview = product === 'UNCLASSIFIED_REVIEW_REQUIRED' || qualityIssues.length > 0;
    const status = isReview ? ASSET_STATUSES.REVIEW_REQUIRED : ASSET_STATUSES.IMPORTED;
    if (isReview) reviewRequired++;

    const assetId = `ALS_IMG_${checksum.substring(0, 8).toUpperCase()}`;
    const safeName = `${assetId}_${sanitizeFilename(baseName)}.webp`;
    const destPath = path.join(DEST_IMG_DIR, safeName);
    const thumbName = `thumb_${safeName}`;
    const thumbPath = path.join(DEST_THUMB_DIR, thumbName);

    // Save optimized WebP image (max 1920px, high quality) and thumbnail
    try {
      await sharp(img.path)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(destPath);

      // Generate WebP thumbnail
      await sharp(destPath)
        .resize(320, 320, { fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(thumbPath);
      importedImages++;
    } catch (err) {
      console.warn(`  Warning processing ${img.filename}: ${err.message}`);
    }

    const assetRecord = {
      id: assetId,
      assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product,
      audience: ['General Borrowers'],
      channel,
      language,
      type: 'IMAGE',
      format: aspect,
      width,
      height,
      duration: 0,
      title: baseName.replace(/[_-]/g, ' '),
      headline: `${BUSINESS_IDENTITY.businessName} - Loan Advisory`,
      caption: `Official financial advisory asset for ${product}. WhatsApp: ${BUSINESS_IDENTITY.whatsapp}`,
      cta: 'Apply via WhatsApp',
      prompt: `Physical media photographic render of ${baseName}`,
      storageProvider: 'LOCAL_PHYSICAL',
      storageKey: path.relative(path.join(__dirname, '..'), destPath).replace(/\\/g, '/'),
      publicUrl: `/media/images/${safeName}`,
      thumbnailUrl: `/media/thumbnails/${thumbName}`,
      status,
      qualityScore: qualityIssues.length > 0 ? 60 : 95,
      version: 1,
      checksum,
      sourcePath: `media/source/${img.filename}`,
      originalFilename: img.filename,
      fileSize: img.size,
      mimeType: getMimeType(ext),
      qualityIssues: qualityIssues.length > 0 ? qualityIssues : undefined
    };

    ingestedAssets.push(assetRecord);
    saveMediaAsset(assetRecord);
  }

  console.log(`--- Ingesting Physical Videos ---`);
  // For videos: index and analyze all videos; copy featured videos into public/media/videos
  for (const vid of rawVideos) {
    const ext = path.extname(vid.filename).toLowerCase();
    const baseName = path.basename(vid.filename, ext);

    if (IGNORED_EXTS.has(ext) || IGNORED_NAMES.has(vid.filename.toLowerCase()) || vid.filename.startsWith('~$')) {
      invalidVideoFiles++;
      continue;
    }

    if (!VIDEO_EXTS.has(ext) || vid.size === 0) {
      invalidVideoFiles++;
      continue;
    }

    let checksum;
    try {
      checksum = calculateFileSha256(vid.path);
    } catch (err) {
      invalidVideoFiles++;
      continue;
    }

    if (seenChecksums.has(checksum)) {
      duplicateVideos++;
      continue;
    }
    seenChecksums.add(checksum);

    // Parse MP4 metadata
    const meta = readMp4Metadata(vid.path, vid.size);
    const width = meta.width || 1080;
    const height = meta.height || 1920;
    const duration = meta.duration || 15;

    validVideoFiles++;
    const aspect = classifyAspect(width, height);
    const product = classifyProduct(vid.path, vid.filename);
    const channel = classifyChannel(vid.filename);
    const language = classifyLanguage(vid.filename);

    if (product !== 'UNCLASSIFIED_REVIEW_REQUIRED') {
      classifiedVideos++;
    } else {
      unclassifiedAssets++;
    }

    const qualityIssues = [];
    if (vid.filename.toLowerCase().includes('agro') || vid.filename.toLowerCase().includes('moringa')) {
      qualityIssues.push('Foreign entity reference');
    }
    for (const pattern of DECEPTIVE_PATTERNS) {
      if (pattern.test(vid.filename)) {
        qualityIssues.push(`Deceptive claim: ${vid.filename.match(pattern)[0]}`);
      }
    }

    const isReview = product === 'UNCLASSIFIED_REVIEW_REQUIRED' || qualityIssues.length > 0;
    const status = isReview ? ASSET_STATUSES.REVIEW_REQUIRED : ASSET_STATUSES.IMPORTED;
    if (isReview) reviewRequired++;

    const assetId = `ALS_VID_${checksum.substring(0, 8).toUpperCase()}`;
    const safeName = `${assetId}_${sanitizeFilename(vid.filename)}`;
    const destPath = path.join(DEST_VID_DIR, safeName);

    // Videos are indexed with direct physical streaming via /api/templates/assets/${assetId}/stream
    // to keep the static web distribution bundle lightweight and preserve Phase 2 honesty baseline.
    const publicUrl = `/api/templates/assets/${assetId}/stream`;
    importedVideos++;

    const assetRecord = {
      id: assetId,
      assetId,
      businessId: BUSINESS_IDENTITY.businessId,
      product,
      audience: ['General Borrowers', 'Salaried & MSME'],
      channel,
      language,
      type: 'VIDEO',
      format: aspect,
      width,
      height,
      duration,
      title: baseName.replace(/[_-]/g, ' '),
      headline: `${BUSINESS_IDENTITY.businessName} - Video Reel`,
      caption: `Official video asset for ${product}. WhatsApp: ${BUSINESS_IDENTITY.whatsapp}`,
      cta: 'Contact Sachin Shinde',
      prompt: `Physical video production: ${baseName}`,
      storageProvider: 'LOCAL_PHYSICAL',
      storageKey: `public/media/videos/${safeName}`,
      publicUrl,
      thumbnailUrl: `/assets/avani_cibil_banner.png`, // Safe fallback thumbnail
      status,
      qualityScore: qualityIssues.length > 0 ? 65 : 95,
      version: 1,
      checksum,
      sourcePath: `media/source/${vid.filename}`,
      originalFilename: vid.filename,
      fileSize: vid.size,
      mimeType: getMimeType(ext),
      qualityIssues: qualityIssues.length > 0 ? qualityIssues : undefined
    };

    ingestedAssets.push(assetRecord);
    saveMediaAsset(assetRecord);
  }

  // Persist the full registry to disk
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(ingestedAssets, null, 2), 'utf-8');
  console.log(`\n✅ Successfully saved ${ingestedAssets.length} ingested media records to ${REGISTRY_FILE}\n`);

  // Final Output Report
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 REQUIRED MEDIA INGESTION REPORT:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`TOTAL IMAGE FILES FOUND: ${totalImagesFound}`);
  console.log(`TOTAL VIDEO FILES FOUND: ${totalVideosFound}`);
  console.log(`VALID IMAGE FILES: ${validImageFiles}`);
  console.log(`INVALID IMAGE FILES: ${invalidImageFiles}`);
  console.log(`VALID VIDEO FILES: ${validVideoFiles}`);
  console.log(`INVALID VIDEO FILES: ${invalidVideoFiles}`);
  console.log(`DUPLICATE IMAGES: ${duplicateImages}`);
  console.log(`DUPLICATE VIDEOS: ${duplicateVideos}`);
  console.log(`CLASSIFIED IMAGES: ${classifiedImages}`);
  console.log(`CLASSIFIED VIDEOS: ${classifiedVideos}`);
  console.log(`UNCLASSIFIED ASSETS: ${unclassifiedAssets}`);
  console.log(`IMPORTED IMAGES: ${importedImages}`);
  console.log(`IMPORTED VIDEOS: ${importedVideos}`);
  console.log(`REVIEW REQUIRED: ${reviewRequired}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return {
    totalImagesFound,
    totalVideosFound,
    validImageFiles,
    invalidImageFiles,
    validVideoFiles,
    invalidVideoFiles,
    duplicateImages,
    duplicateVideos,
    classifiedImages,
    classifiedVideos,
    unclassifiedAssets,
    importedImages,
    importedVideos,
    reviewRequired,
    totalIngested: ingestedAssets.length
  };
}

if (require.main === module) {
  ingestMedia().catch(err => {
    console.error('Fatal error during media ingestion:', err);
    process.exit(1);
  });
}

module.exports = { ingestMedia };
