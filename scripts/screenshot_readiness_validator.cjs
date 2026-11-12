// scripts/screenshot_readiness_validator.cjs
// Reusable DOM readiness and screenshot-integrity validator for UnifiedAdminPortal views.
// Ensures no screenshot is accepted while a view is loading, unrouted, or blank.
'use strict';

/**
 * Generates an async browser function string suitable for Chrome DevTools evaluate_script
 * or Playwright page.evaluate(), validating URL, module heading, table rows, absence of
 * active spinners, and non-empty main content height.
 */
function buildBrowserReadinessEvaluator(options = {}) {
  const {
    expectedPathSubstring = '/admin',
    expectedTabQuery = '',
    expectedHeading = '',
    minTableRows = 1,
    timeoutMs = 10000
  } = options;

  return async function verifyPortalViewReady() {
    const start = Date.now();
    const check = () => {
      const urlOk = window.location.pathname.includes(expectedPathSubstring) &&
        (!expectedTabQuery || window.location.search.includes(expectedTabQuery));
      const mainPane = document.querySelector('.portal-main') || document.querySelector('main');
      const mainText = (mainPane && mainPane.innerText ? mainPane.innerText.trim() : '');
      const mainHeight = mainPane ? mainPane.getBoundingClientRect().height : 0;
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim());
      const headingFound = !expectedHeading || headings.some(h => h.includes(expectedHeading));
      const spinners = Array.from(document.querySelectorAll('.portal-loading-screen, .animate-spin, [aria-busy="true"]'))
        .filter(el => el.offsetParent !== null);
      const rows = Array.from(document.querySelectorAll('.portal-table tbody tr'));
      const nonEmptyRows = rows.filter(tr => !/No .* matched|Loading/i.test(tr.textContent || ''));
      const ready = Boolean(
        urlOk &&
        mainText.length > 40 &&
        mainHeight > 120 &&
        headingFound &&
        spinners.length === 0 &&
        nonEmptyRows.length >= minTableRows
      );
      return {
        ready,
        url: window.location.href,
        urlOk,
        headingFound,
        headings: headings.slice(0, 5),
        mainTextLength: mainText.length,
        mainHeight: Math.round(mainHeight),
        activeSpinners: spinners.length,
        tableRowCount: rows.length,
        nonEmptyRowCount: nonEmptyRows.length
      };
    };

    while (Date.now() - start < timeoutMs) {
      const state = check();
      if (state.ready) return { ...state, waitedMs: Date.now() - start };
      await new Promise(r => setTimeout(r, 250));
    }
    return { ...check(), waitedMs: Date.now() - start, timedOut: true };
  }.toString();
}

/**
 * Pure validator check for automated Node unit testing and post-evaluation assertions.
 */
function assertReadinessResult(result, label = 'PortalView') {
  if (!result || result.timedOut || !result.ready) {
    const reason = result
      ? `ready=${result.ready}, headingFound=${result.headingFound}, rows=${result.nonEmptyRowCount}, mainHeight=${result.mainHeight}`
      : 'null evaluation result';
    throw new Error(`[ScreenshotReadinessError:${label}] Refuse screenshot capture: ${reason}`);
  }
  return true;
}

if (require.main === module) {
  const assert = require('assert');
  // Unit verification of readiness acceptance and blank-pane rejection logic
  const blankSnapshot = { ready: false, headingFound: false, nonEmptyRowCount: 0, mainHeight: 0, timedOut: true };
  assert.throws(() => assertReadinessResult(blankSnapshot, 'BuildersBlankTest'), /Refuse screenshot capture/);

  const validSnapshot = { ready: true, headingFound: true, nonEmptyRowCount: 80, mainHeight: 2400, timedOut: false };
  assert.strictEqual(assertReadinessResult(validSnapshot, 'BuildersPopulatedTest'), true);

  const fnCode = buildBrowserReadinessEvaluator({ expectedHeading: 'Database 1: Maharashtra Builder Database', minTableRows: 80 });
  assert.ok(fnCode.includes('verifyPortalViewReady') && fnCode.includes('.portal-table tbody tr'));
  console.log('[PASS] screenshot_readiness_validator unit assertions (blank rejected, populated accepted)');
}

module.exports = {
  buildBrowserReadinessEvaluator,
  assertReadinessResult
};
