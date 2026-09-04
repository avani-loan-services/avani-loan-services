#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import generateLongContent from '../src/utils/generateContent.js';
import generateMarathiContent from '../src/utils/generateMarathi.js';

const root = process.cwd();
const dataPath = path.join(root, 'src', 'data', 'services.json');
const outRoot = path.join(root, 'public', 'services');
const publicRoot = path.join(root, 'public');

function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  const raw = await fs.readFile(dataPath, 'utf8');
  const services = JSON.parse(raw);
  await fs.mkdir(outRoot, { recursive: true });
  await fs.mkdir(publicRoot, { recursive: true });
  const base = (process.env.SITE_URL || 'https://www.avanifinserv.com').replace(/\/$/, '');

  for (const s of services) {
    const dir = path.join(outRoot, s.slug);
    await fs.mkdir(dir, { recursive: true });
    const canonical = `${base}/services/${s.slug}`;
    const pageContent = (s.content && s.content.length > 200) ? s.content : generateLongContent(s);
    // configurable Open Graph image: allow per-service `ogImage` or fallback to site logo
    const ogImageUrl = s.ogImage ? `${base}/${s.ogImage.replace(/^\/+/, '')}` : `${base}/og-default.svg`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.h1,
      description: s.metaDescription || '',
      provider: {
        "@type": "LocalBusiness",
        name: 'Avani Loan Services',
        url: base,
        telephone: '+91-9175635165',
        address: {
          "@type": "PostalAddress",
          streetAddress: 'RAJIV GANDHI CHAUK, OPP BANK OF BARODA, ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD',
          addressLocality: 'Latur',
          addressRegion: 'Maharashtra',
          postalCode: '413512',
          addressCountry: 'IN'
        }
      }
    };

    // hreflang alternate links for English and Marathi (if present)
    const mrPath = `${base}/mr/services/${s.slug}`;
    const alternates = `  <link rel="alternate" hreflang="en" href="${canonical}" />\n  <link rel="alternate" hreflang="mr" href="${mrPath}" />\n  <link rel="alternate" hreflang="x-default" href="${canonical}" />`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(s.title)}</title>
  <meta name="description" content="${escapeHtml(s.metaDescription || '')}" />
  ${alternates}
  <meta property="og:title" content="${escapeHtml(s.title)}" />
  <meta property="og:description" content="${escapeHtml(s.metaDescription || '')}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(s.title)}" />
  <meta name="twitter:description" content="${escapeHtml(s.metaDescription || '')}" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index,follow" />
  <script type="application/ld+json">${escapeHtml(JSON.stringify(jsonLd))}</script>
</head>
<body>
  <header>
    <a href="/">Avani Loan Services</a>
  </header>
  <main>
    <h1>${escapeHtml(s.h1)}</h1>
    ${pageContent}
    <p><a href="/services">All services</a> | <a href="/">Home</a></p>
  </main>
  <footer>
    <small>&copy; ${new Date().getFullYear()} Avani Loan Services</small>
  </footer>
</body>
</html>`;

    await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
    // Write Marathi localized page under /mr/services/<slug>/ if translations exist or fallback
    const mrData = (s.translations && s.translations.mr) || {};
    const mrDir = path.join(publicRoot, 'mr', 'services', s.slug);
    await fs.mkdir(mrDir, { recursive: true });
    const mrCanonical = `${base}/mr/services/${s.slug}`;
    const mrOgImageUrl = s.ogImage ? `${base}/${s.ogImage.replace(/^\/+/, '')}` : `${base}/og-default.svg`;
    const mrTitle = mrData.title || `मराठी - ${s.title}`;
    const mrMeta = mrData.metaDescription || `मराठी - ${s.metaDescription || ''}`;
    const mrH1 = mrData.h1 || `मराठी - ${s.h1}`;
    const mrContent = mrData.content || generateMarathiContent(s);

    const mrJsonLd = Object.assign({}, jsonLd, {
      name: mrH1,
      description: mrMeta
    });

    const mrHtml = `<!doctype html>
<html lang="mr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(mrTitle)}</title>
  <meta name="description" content="${escapeHtml(mrMeta)}" />
  <link rel="canonical" href="${mrCanonical}" />
  <meta name="robots" content="index,follow" />
  ${alternates}
  <meta property="og:image" content="${mrOgImageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <script type="application/ld+json">${escapeHtml(JSON.stringify(mrJsonLd))}</script>
</head>
<body>
  <header>
    <a href="/">Avani Loan Services</a>
  </header>
  <main>
    <h1>${escapeHtml(mrH1)}</h1>
    ${mrContent}
    <p><a href="/mr/services">सर्व सेवा</a> | <a href="/">मुख्य पृष्ठ</a></p>
  </main>
  <footer>
    <small>&copy; ${new Date().getFullYear()} Avani Loan Services</small>
  </footer>
</body>
</html>`;

    await fs.writeFile(path.join(mrDir, 'index.html'), mrHtml, 'utf8');
  }

  // Generate sitemap.xml including the services index and individual pages
  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapItems = [];
  sitemapItems.push({ loc: `${base}/`, lastmod, changefreq: 'weekly', priority: '1.0' });
  sitemapItems.push({ loc: `${base}/services`, lastmod, changefreq: 'weekly', priority: '0.9' });
  for (const s of services) {
    sitemapItems.push({ loc: `${base}/services/${s.slug}`, lastmod, changefreq: 'weekly', priority: '0.8' });
    sitemapItems.push({ loc: `${base}/mr/services/${s.slug}`, lastmod, changefreq: 'weekly', priority: '0.8' });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapItems
    .map(
      (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>`;

  await fs.writeFile(path.join(publicRoot, 'sitemap.xml'), sitemapXml, 'utf8');

  // Generate robots.txt pointing to sitemap
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  await fs.writeFile(path.join(publicRoot, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`Generated ${services.length} service pages into public/services`);
  console.log(`Wrote sitemap.xml and robots.txt to public/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
