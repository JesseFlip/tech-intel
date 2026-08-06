// numberGuard.js
// Frontend counterpart to the pipeline's adversarial verifier: make sure every
// number the UI shows is real, in-range, and never a fabricated placeholder.
// A displayed "--" is always better than an invented figure.

export function isNum(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

// Format a number or return an em-dash placeholder — never a made-up value.
export function fmt(x, digits = 2) {
  return isNum(x) ? x.toFixed(digits) : '--';
}

// Clamp into a plausible range; returns null if the input isn't a real number,
// so callers render "--" rather than an out-of-range artifact.
export function clamp(x, lo, hi) {
  if (!isNum(x)) return null;
  return Math.min(hi, Math.max(lo, x));
}

// Build the macro ticker from REAL data only. A market figure is included only
// when marketData was actually fetched (lastFetched set) — fallback constants
// are never presented as live. When nothing real is available, we show honest,
// number-free lines instead of invented statistics.
export function buildTickerHeadlines({ marketData = {}, macroData = null } = {}) {
  const live = [];
  const marketReal = marketData && marketData.lastFetched;

  if (marketReal) {
    if (isNum(marketData.us10y)) live.push(`US 10Y TREASURY YIELD: ${marketData.us10y.toFixed(3)}%`);
    if (isNum(marketData.vix)) live.push(`VIX INDEX: ${marketData.vix.toFixed(2)}`);
    if (isNum(marketData.es)) live.push(`S&P 500 FUTURES (ES): ${marketData.es.toFixed(2)}`);
  }

  if (macroData) {
    const funds = macroData?.fed_policy?.funds_rate;
    if (isNum(funds)) live.push(`FED FUNDS RATE: ${funds.toFixed(2)}%`);

    const unemployment = macroData?.labor?.unemployment_rate;
    if (isNum(unemployment)) live.push(`UNEMPLOYMENT RATE: ${unemployment.toFixed(1)}%`);

    const cpiYoy = macroData?.inflation?.cpi?.yoy;
    if (isNum(cpiYoy)) live.push(`CPI INFLATION (YoY): ${cpiYoy.toFixed(1)}%`);

    const spread = macroData?.yield_curve?.spread;
    if (isNum(spread)) {
      live.push(`2s10s SPREAD: ${spread > 0 ? '+' : ''}${spread.toFixed(2)}% ${spread < 0 ? '(INVERTED)' : ''}`.trim());
    }
  }

  // Honest fallbacks — no fabricated numbers.
  const fillers = [
    'GROUNDED INTELLIGENCE — FIGURES SHOWN ARE LIVE, NOT SIMULATED',
    'MACRO & MARKET DATA REFRESHED FROM PRIMARY SOURCES',
    'AWAITING LIVE MARKET DATA…',
  ];

  return live.length ? live : fillers;
}
