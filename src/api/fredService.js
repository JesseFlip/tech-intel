/**
 * Federal Reserve Economic Data (FRED) Service
 *
 * Fetches real macro-economic data from the St. Louis Federal Reserve API
 * API is free and requires no authentication for basic usage
 * Rate limit: Unlimited for non-commercial use
 *
 * Documentation: https://fred.stlouisfed.org/docs/api/fred/
 */

const FRED_API_KEY = 'your_fred_api_key_here'; // Optional: Improves rate limits
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

/**
 * FRED Series IDs for key macro indicators
 */
const SERIES_IDS = {
  // Inflation Metrics
  CPI: 'CPIAUCSL',              // Consumer Price Index (Urban)
  CORE_PCE: 'PCEPILFE',         // Core PCE Price Index
  PCE: 'PCEPI',                 // PCE Price Index

  // Employment Metrics
  UNEMPLOYMENT_RATE: 'UNRATE',   // Unemployment Rate
  NONFARM_PAYROLLS: 'PAYEMS',    // Total Nonfarm Payrolls

  // Fed Policy
  FED_FUNDS_RATE: 'FEDFUNDS',    // Effective Federal Funds Rate
  FED_FUNDS_TARGET: 'DFEDTARU',  // Federal Funds Target Rate (Upper)

  // Yield Curve
  TREASURY_10Y: 'DGS10',         // 10-Year Treasury Rate
  TREASURY_2Y: 'DGS2',           // 2-Year Treasury Rate
  TREASURY_3M: 'DGS3MO',         // 3-Month Treasury Rate

  // Economic Activity
  GDP: 'GDP',                    // Gross Domestic Product
  RETAIL_SALES: 'RSXFS',         // Retail Sales
  INDUSTRIAL_PRODUCTION: 'INDPRO', // Industrial Production Index

  // Market Sentiment
  CONSUMER_SENTIMENT: 'UMCSENT', // University of Michigan Consumer Sentiment
  VIX: 'VIXCLS',                 // CBOE Volatility Index
};

/**
 * Fetch latest observation for a FRED series
 * @param {string} seriesId - FRED series ID
 * @returns {Promise<{value: number, date: string, series_id: string}>}
 */
async function fetchSeriesLatest(seriesId) {
  try {
    const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&sort_order=desc&limit=1&file_type=json${FRED_API_KEY !== 'your_fred_api_key_here' ? `&api_key=${FRED_API_KEY}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.observations || data.observations.length === 0) {
      throw new Error(`No data available for series ${seriesId}`);
    }

    const latest = data.observations[0];

    return {
      value: parseFloat(latest.value),
      date: latest.date,
      series_id: seriesId
    };
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

/**
 * Calculate year-over-year percentage change
 * @param {string} seriesId - FRED series ID
 * @returns {Promise<{current: number, yoy_change: number, date: string}>}
 */
async function fetchYoYChange(seriesId) {
  try {
    const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&sort_order=desc&limit=13&file_type=json${FRED_API_KEY !== 'your_fred_api_key_here' ? `&api_key=${FRED_API_KEY}` : ''}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.observations || data.observations.length < 13) {
      const latest = await fetchSeriesLatest(seriesId);
      return {
        current: latest?.value || 0,
        yoy_change: null,
        date: latest?.date || ''
      };
    }

    const current = parseFloat(data.observations[0].value);
    const yearAgo = parseFloat(data.observations[12].value);
    const yoyChange = ((current - yearAgo) / yearAgo) * 100;

    return {
      current,
      yoy_change: yoyChange,
      date: data.observations[0].date
    };
  } catch (error) {
    console.error(`Error calculating YoY for ${seriesId}:`, error);
    return { current: 0, yoy_change: null, date: '' };
  }
}

/**
 * Get comprehensive macro dashboard data
 * Fetches all key indicators in parallel
 */
export async function getMacroDashboard() {
  try {
    const [
      cpi,
      pceLfe,
      unemploymentRate,
      fedFundsRate,
      treasury10y,
      treasury2y,
      consumerSentiment
    ] = await Promise.all([
      fetchYoYChange(SERIES_IDS.CPI),
      fetchYoYChange(SERIES_IDS.CORE_PCE),
      fetchSeriesLatest(SERIES_IDS.UNEMPLOYMENT_RATE),
      fetchSeriesLatest(SERIES_IDS.FED_FUNDS_RATE),
      fetchSeriesLatest(SERIES_IDS.TREASURY_10Y),
      fetchSeriesLatest(SERIES_IDS.TREASURY_2Y),
      fetchSeriesLatest(SERIES_IDS.CONSUMER_SENTIMENT)
    ]);

    // Calculate yield curve spread (2Y - 10Y)
    const yieldCurveSpread = treasury2y && treasury10y
      ? (treasury2y.value - treasury10y.value)
      : null;

    return {
      inflation: {
        cpi: {
          value: cpi.current,
          yoy: cpi.yoy_change,
          date: cpi.date
        },
        core_pce: {
          value: pceLfe.current,
          yoy: pceLfe.yoy_change,
          date: pceLfe.date
        }
      },
      labor: {
        unemployment_rate: unemploymentRate?.value || null,
        date: unemploymentRate?.date || ''
      },
      fed_policy: {
        funds_rate: fedFundsRate?.value || null,
        date: fedFundsRate?.date || ''
      },
      yield_curve: {
        ten_year: treasury10y?.value || null,
        two_year: treasury2y?.value || null,
        spread: yieldCurveSpread,
        inverted: yieldCurveSpread < 0,
        date: treasury10y?.date || ''
      },
      sentiment: {
        consumer_sentiment: consumerSentiment?.value || null,
        date: consumerSentiment?.date || ''
      },
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching macro dashboard:', error);
    return null;
  }
}

/**
 * Get real-time Treasury yield (10-year)
 * Fallback to FRED if real-time source unavailable
 */
export async function getTreasury10Y() {
  return await fetchSeriesLatest(SERIES_IDS.TREASURY_10Y);
}

/**
 * Get current Federal Funds Rate
 */
export async function getFedFundsRate() {
  return await fetchSeriesLatest(SERIES_IDS.FED_FUNDS_RATE);
}

/**
 * Get inflation metrics (CPI & PCE)
 */
export async function getInflationMetrics() {
  const [cpi, pce, corePce] = await Promise.all([
    fetchYoYChange(SERIES_IDS.CPI),
    fetchYoYChange(SERIES_IDS.PCE),
    fetchYoYChange(SERIES_IDS.CORE_PCE)
  ]);

  return {
    cpi: {
      value: cpi.current,
      yoy: cpi.yoy_change,
      date: cpi.date
    },
    pce: {
      value: pce.current,
      yoy: pce.yoy_change,
      date: pce.date
    },
    core_pce: {
      value: corePce.current,
      yoy: corePce.yoy_change,
      date: corePce.date
    }
  };
}

/**
 * Get employment metrics
 */
export async function getEmploymentMetrics() {
  const [unemploymentRate, nonfarmPayrolls] = await Promise.all([
    fetchSeriesLatest(SERIES_IDS.UNEMPLOYMENT_RATE),
    fetchSeriesLatest(SERIES_IDS.NONFARM_PAYROLLS)
  ]);

  return {
    unemployment_rate: unemploymentRate,
    nonfarm_payrolls: nonfarmPayrolls
  };
}

/**
 * Check if yield curve is inverted (2Y > 10Y)
 */
export async function getYieldCurveStatus() {
  const [treasury2y, treasury10y] = await Promise.all([
    fetchSeriesLatest(SERIES_IDS.TREASURY_2Y),
    fetchSeriesLatest(SERIES_IDS.TREASURY_10Y)
  ]);

  if (!treasury2y || !treasury10y) {
    return { inverted: null, spread: null };
  }

  const spread = treasury2y.value - treasury10y.value;

  return {
    inverted: spread > 0,
    spread: spread,
    two_year: treasury2y.value,
    ten_year: treasury10y.value,
    date: treasury10y.date
  };
}

export default {
  getMacroDashboard,
  getTreasury10Y,
  getFedFundsRate,
  getInflationMetrics,
  getEmploymentMetrics,
  getYieldCurveStatus,
  SERIES_IDS
};
