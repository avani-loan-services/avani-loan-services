// scripts/audit-live-site.cjs
// Automated remote audit of live production website https://www.avanifinserv.com/

const https = require('https');

const routes = [
  '/',
  '/services',
  '/contact',
  '/cibil-check',
  '/financial-tools',
  '/calculators',
  '/robots.txt',
  '/sitemap.xml'
];

async function checkUrl(route) {
  return new Promise((resolve) => {
    const url = `https://www.avanifinserv.com${route}`;
    const req = https.get(url, { headers: { 'User-Agent': 'AntigravityAudit/3.0' } }, (res) => {
      resolve({
        route,
        status: res.statusCode,
        contentType: res.headers['content-type'] || 'unknown',
        ssl: true
      });
    });
    req.on('error', (err) => {
      resolve({
        route,
        status: 'ERROR',
        error: err.message,
        ssl: false
      });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ route, status: 'TIMEOUT', ssl: false });
    });
  });
}

async function runAudit() {
  console.log('🌐 AUDITING PRODUCTION WEBSITE: https://www.avanifinserv.com/\n');
  const results = [];
  for (const r of routes) {
    const res = await checkUrl(r);
    results.push(res);
    console.log(`  ${res.route.padEnd(20)} -> Status: ${res.status} | Content-Type: ${res.contentType}`);
  }
  return results;
}

runAudit().then(() => {
  console.log('\n✔ Live website audit completed.');
});
