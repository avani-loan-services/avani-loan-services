#!/usr/bin/env node
import https from 'https';

const base = (process.env.SITE_URL || 'https://www.avanifinserv.com').replace(/\/$/, '');
const sitemapUrl = `${base}/sitemap.xml`;

const endpoints = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  `https://www.bing.com/webmaster/ping.aspx?siteMap=${encodeURIComponent(sitemapUrl)}`,
];

function ping(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        resolve({ url, status: res.statusCode });
      })
      .on('error', (err) => {
        resolve({ url, error: err.message });
      });
  });
}

async function main() {
  console.log(`Pinging search engines with sitemap: ${sitemapUrl}`);
  for (const ep of endpoints) {
    const r = await ping(ep);
    if (r.error) console.log(`Error pinging ${r.url}: ${r.error}`);
    else console.log(`Pinged ${r.url}: HTTP ${r.status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
