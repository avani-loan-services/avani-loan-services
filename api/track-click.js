// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — FIRST-PARTY CLICK TRACKER & REDIRECT GATEWAY
// Endpoint: GET /api/track-click?c=<campaignId>&dest=<targetUrl>
// Also aliased to /r on edge routes
// Conforms to Cross-Workspace Integration Contracts (Section 10)
// Prevents open redirect attacks, captures first-party click attribution,
// debounces rapid duplicate clicks, and preserves campaign UTM parameters.
// ─────────────────────────────────────────────────────────────────

const clickDebounceCache = new Map();

function isSafeDestination(destUrl) {
  if (!destUrl) return false;
  // Allow relative URLs starting with /
  if (destUrl.startsWith('/') && !destUrl.startsWith('//')) return true;
  try {
    const parsed = new URL(destUrl);
    const host = parsed.hostname.toLowerCase();
    return host === 'www.avanifinserv.com' || host === 'avanifinserv.com' || host.endsWith('.avanifinserv.com') || host === 'wa.me' || host === 'api.whatsapp.com';
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const {
    c: campaignId,
    dest: rawDest,
    utm_source = 'whatsapp',
    utm_medium = 'broadcast',
    utm_campaign,
    utm_content,
    utm_term
  } = req.query || {};

  // Destination validation (Security against open redirect)
  const defaultDest = 'https://www.avanifinserv.com/contact';
  const targetUrl = isSafeDestination(rawDest) ? rawDest : defaultDest;

  // Client IP & fingerprint for debouncing
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const debounceKey = `${clientIp}-${campaignId || 'general'}-${targetUrl}`;
  const now = Date.now();

  const isDuplicate = clickDebounceCache.has(debounceKey) &&
    (now - clickDebounceCache.get(debounceKey) < 10000); // 10s debounce

  if (!isDuplicate) {
    clickDebounceCache.set(debounceKey, now);

    // Record click event for campaign attribution
    const clickEvent = {
      eventId: `CLK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      campaignId: campaignId || 'DIRECT',
      targetUrl,
      utm_source,
      utm_medium,
      utm_campaign: utm_campaign || campaignId || 'unspecified',
      utm_content: utm_content || '',
      utm_term: utm_term || '',
      timestamp: new Date().toISOString()
    };

    console.log('[ClickTracker] First-Party Click Recorded:', JSON.stringify(clickEvent));
  }

  // Construct destination URL with preserved UTM parameters
  try {
    const finalUrl = new URL(targetUrl.startsWith('/') ? `https://www.avanifinserv.com${targetUrl}` : targetUrl);
    if (!finalUrl.searchParams.has('utm_source')) finalUrl.searchParams.set('utm_source', utm_source);
    if (!finalUrl.searchParams.has('utm_medium')) finalUrl.searchParams.set('utm_medium', utm_medium);
    if (utm_campaign && !finalUrl.searchParams.has('utm_campaign')) finalUrl.searchParams.set('utm_campaign', utm_campaign);
    if (campaignId && !finalUrl.searchParams.has('c')) finalUrl.searchParams.set('c', campaignId);

    res.writeHead(302, {
      Location: finalUrl.toString(),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store'
    });
    res.end();
  } catch (err) {
    res.writeHead(302, {
      Location: defaultDest,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store'
    });
    res.end();
  }
}
