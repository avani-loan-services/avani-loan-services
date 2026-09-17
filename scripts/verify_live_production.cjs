// scripts/verify_live_production.cjs
const https = require('https');

const BASE_URL = 'https://www.avanifinserv.com';

const routesToTest = [
  '/',
  '/about',
  '/loans',
  '/catalog',
  '/personal-loan',
  '/business-loan',
  '/doctor-loan',
  '/home-loan',
  '/mortgage-loan',
  '/education-loan',
  '/school-funding',
  '/ca-loan',
  '/cibil-check',
  '/eligibility-checker',
  '/documents',
  '/financial-tools',
  '/blog',
  '/contact',
  '/apply',
  '/sitemap.xml',
  '/robots.txt',
  '/api/health'
];

function fetchRoute(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          length: data.length,
          bodySnippet: data.substring(0, 300)
        });
      });
    }).on('error', (err) => {
      resolve({ path, status: 0, error: err.message });
    });
  });
}

async function runLiveAudit() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌐 LIVE PRODUCTION WEBSITE & ROUTE FORENSIC AUDIT');
  console.log(`🎯 TARGET: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  for (const path of routesToTest) {
    const res = await fetchRoute(path);
    const ok = (res.status === 200);
    if (ok) {
      passed++;
      console.log(`  ✅ PASS: ${path} [HTTP ${res.status}] (${res.length} bytes)`);
    } else {
      failed++;
      console.log(`  ❌ FAIL: ${path} [HTTP ${res.status}] error: ${res.error || 'Non-200 status'}`);
    }
  }

  // Check home page SEO elements
  console.log('\n--- VERIFYING LIVE SEO & CANONICAL TAGS ---');
  const home = await fetchRoute('/');
  const hasCanonical = home.bodySnippet.includes('rel="canonical"') || (await fetchRoute('/')).bodySnippet.includes('canonical');
  console.log(`  • Canonical Tag Present: ${home.bodySnippet.includes('canonical') ? '✅ YES' : '❌ NO'}`);
  console.log(`  • Title Tag Present: ${home.bodySnippet.includes('<title>') ? '✅ YES' : '❌ NO'}`);

  console.log('\n--- VERIFYING LIVE /api/health ---');
  const healthRes = await fetchRoute('/api/health');
  console.log(`  • /api/health HTTP: ${healthRes.status}`);
  console.log(`  • Response Payload: ${healthRes.bodySnippet}`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 LIVE ROUTE AUDIT: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveAudit();
