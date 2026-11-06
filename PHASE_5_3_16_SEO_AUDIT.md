# AVANI LOAN SERVICES — PHASE 5.3.16 SEO & METADATA AUDIT
## SEARCH ENGINE OPTIMIZATION, SITEMAP, SCHEMA.ORG & CANONICAL AUDIT

**Document Reference:** `ALS-SEO-AUDIT-P5316-20261106`  
**Target Canonical URL:** `https://www.avanifinserv.com`  
**Sitemap Path:** `https://www.avanifinserv.com/sitemap.xml`  
**Robots Path:** `https://www.avanifinserv.com/robots.txt`

---

### 1. SITEMAP.XML AUDIT

The sitemap generator script (`scripts/generate-service-pages.js`) has been upgraded to automatically produce a comprehensive, standards-compliant XML sitemap during every build cycle.

#### Sitemap Inventory:
- **Core Pages:**
  - `https://www.avanifinserv.com/` (`priority: 1.0`, `changefreq: weekly`)
  - `https://www.avanifinserv.com/services` (`priority: 0.9`, `changefreq: weekly`)
  - `https://www.avanifinserv.com/builder-partnership` (`priority: 0.85`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/institutional-funding` (`priority: 0.85`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/about` (`priority: 0.7`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/contact` (`priority: 0.7`, `changefreq: monthly`)
- **Calculators & Digital Tools:**
  - `https://www.avanifinserv.com/calculators` (`priority: 0.75`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/eligibility` (`priority: 0.75`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/cibil-check` (`priority: 0.75`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/documents` (`priority: 0.7`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/download-application` (`priority: 0.7`, `changefreq: monthly`)
- **Legal Compliance Pages:**
  - `https://www.avanifinserv.com/terms` (`priority: 0.5`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/disclaimer` (`priority: 0.5`, `changefreq: monthly`)
  - `https://www.avanifinserv.com/privacy-policy` (`priority: 0.5`, `changefreq: monthly`)
- **Retail Service Pages (English & Marathi):**
  - All 7 core loan service slugs in both `/services/<slug>` and `/mr/services/<slug>` (`priority: 0.8`).

---

### 2. ROBOTS.TXT DIRECTIVES

The production `robots.txt` safely guides search engine web crawlers while strictly cloaking administrative and API backend endpoints:

```txt
User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /
Sitemap: https://www.avanifinserv.com/sitemap.xml
```

- **Protection:** Prevents indexing of private CRM tables, user login screens, and internal JSON APIs.
- **Indexation:** Explicitly allows indexing of all public loan products, corporate partnership pages, and financial calculators.

---

### 3. STRUCTURED DATA (SCHEMA.ORG JSON-LD)

Public loan product landing pages and corporate hub include Google-compliant Schema.org JSON-LD structured data:
- `@context`: `https://schema.org`
- `@type`: `FinancialService` / `LocalBusiness`
- `name`: `Avani Loan Services`
- `url`: `https://www.avanifinserv.com`
- `telephone`: `+91-9175635165`
- `priceRange`: `₹₹`
- `address`:
  - `streetAddress`: `Rajiv Gandhi Chowk, Opp Bank of Baroda, Above Monginis Cake Shop, Ausa Road`
  - `addressLocality`: `Latur`
  - `addressRegion`: `Maharashtra`
  - `postalCode`: `413512`
  - `addressCountry`: `IN`
- `areaServed`: `Maharashtra, India`

---

### 4. OPEN GRAPH & SOCIAL METADATA

- `og:site_name`: `Avani Loan Services`
- `og:type`: `website`
- `og:locale`: `en_IN` (and alternate `mr_IN` for localized pages)
- `og:image`: High-resolution optimized brand graphics (1200x630px)
- `twitter:card`: `summary_large_image`
- Canonical tags: Explicit self-referencing `<link rel="canonical">` across all HTML pages, preventing duplicate content dilution between apex and `www` domains.
