import { c as calcRSI, a as calcMACD, d as calcSMA, e as calcEMA, f as calcBollingerBands } from './indicators_DtQSgmMG.mjs';

const YF_BASE = "https://query2.finance.yahoo.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
let _crumb = null;
let _cookie = null;
let _crumbTs = 0;
const CRUMB_TTL = 30 * 60 * 1e3;
async function getCrumb() {
  if (_crumb && _cookie && Date.now() - _crumbTs < CRUMB_TTL) return { crumb: _crumb, cookie: _cookie };
  const s = await fetch("https://fc.yahoo.com", { redirect: "manual", headers: { "User-Agent": UA } });
  const cookies = s.headers.getSetCookie?.() ?? [];
  const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
  const cr = await fetch(`${YF_BASE}/v1/test/getcrumb`, { headers: { "User-Agent": UA, Cookie: cookie } });
  if (!cr.ok) throw new Error("Failed to get Yahoo Finance crumb");
  const crumb = await cr.text();
  _crumb = crumb;
  _cookie = cookie;
  _crumbTs = Date.now();
  return { crumb, cookie };
}
function periodSeconds(p) {
  const day = 86400;
  const map = {
    "1d": day,
    "5d": 5 * day,
    "1mo": 30 * day,
    "3mo": 90 * day,
    "6mo": 180 * day,
    "1y": 365 * day,
    "2y": 730 * day
  };
  return map[p] ?? 180 * day;
}
async function yfFetch(url) {
  const { crumb, cookie } = await getCrumb();
  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}crumb=${encodeURIComponent(crumb)}`, {
    headers: { "User-Agent": UA, Cookie: cookie }
  });
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  return res.json();
}
async function fetchStockData(symbol, period = "6mo", interval = "1d") {
  const yiv = interval === "1h" || interval === "4h" ? "60m" : interval === "1wk" ? "1wk" : "1d";
  const now = Math.floor(Date.now() / 1e3);
  const period1 = now - periodSeconds(period);
  const actualPeriod1 = yiv === "60m" ? Math.max(period1, now - 59 * 86400) : period1;
  const chartUrl = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${actualPeriod1}&period2=${now}&interval=${yiv}&includePrePost=false`;
  const quoteUrl = `${YF_BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,summaryDetail,defaultKeyStatistics,assetProfile`;
  const [chartJson, summaryJson] = await Promise.all([
    yfFetch(chartUrl),
    yfFetch(quoteUrl).catch(() => null)
  ]);
  const result = summaryJson?.quoteSummary?.result?.[0] ?? {};
  const price = result.price ?? {};
  const detail = result.summaryDetail ?? {};
  const stats = result.defaultKeyStatistics ?? {};
  const prof = result.assetProfile ?? {};
  const quote = {
    symbol,
    shortName: price.shortName ?? symbol,
    longName: price.longName ?? symbol,
    currency: price.currency ?? "USD",
    regularMarketPrice: price.regularMarketPrice?.raw ?? 0,
    regularMarketChange: price.regularMarketChange?.raw ?? 0,
    regularMarketChangePercent: price.regularMarketChangePercent?.raw ?? 0,
    regularMarketVolume: price.regularMarketVolume?.raw ?? 0,
    marketCap: price.marketCap?.raw ?? 0,
    fiftyTwoWeekHigh: detail.fiftyTwoWeekHigh?.raw ?? 0,
    fiftyTwoWeekLow: detail.fiftyTwoWeekLow?.raw ?? 0,
    trailingPE: detail.trailingPE?.raw,
    forwardPE: detail.forwardPE?.raw,
    dividendYield: detail.dividendYield?.raw,
    averageVolume: detail.averageVolume?.raw,
    beta: detail.beta?.raw,
    epsTrailingTwelveMonths: stats.trailingEps?.raw,
    sector: prof.sector,
    industry: prof.industry,
    longBusinessSummary: prof.longBusinessSummary
  };
  const chartResult = chartJson?.chart?.result?.[0];
  const timestamps = chartResult?.timestamp ?? [];
  const ohlcv = chartResult?.indicators?.quote?.[0] ?? {};
  const raw = timestamps.map((ts, i) => {
    const o = ohlcv.open?.[i], h = ohlcv.high?.[i], l = ohlcv.low?.[i], c = ohlcv.close?.[i], v = ohlcv.volume?.[i];
    if (o == null || c == null) return null;
    return {
      date: new Date(ts * 1e3).toISOString().split("T")[0],
      open: +o.toFixed(4),
      high: +h.toFixed(4),
      low: +l.toFixed(4),
      close: +c.toFixed(4),
      volume: v ?? 0
    };
  }).filter(Boolean);
  const closes = raw.map((r) => r.close);
  const rsi = calcRSI(closes), macd = calcMACD(closes);
  const sma20 = calcSMA(closes, 20), sma50 = calcSMA(closes, 50), ema20 = calcEMA(closes, 20);
  const bb = calcBollingerBands(closes);
  const chartData = raw.map((bar, i) => ({
    ...bar,
    sma20: sma20[i],
    sma50: sma50[i],
    ema20: ema20[i],
    bbUpper: bb.upper[i],
    bbMid: bb.mid[i],
    bbLower: bb.lower[i],
    rsi: rsi[i],
    macd: macd.macd[i],
    macdSignal: macd.signal[i],
    macdHist: macd.histogram[i]
  }));
  return { quote, chartData };
}
async function fetchQuickQuote(symbol) {
  try {
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const json = await yfFetch(url);
    const meta = json?.chart?.result?.[0]?.meta ?? {};
    return {
      symbol,
      price: meta.regularMarketPrice ?? 0,
      change: (meta.regularMarketPrice ?? 0) - (meta.chartPreviousClose ?? meta.previousClose ?? 0),
      changePct: meta.chartPreviousClose ? (meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100 : 0,
      volume: meta.regularMarketVolume ?? 0,
      marketCap: 0
    };
  } catch {
    return { symbol, price: 0, change: 0, changePct: 0, volume: 0, marketCap: 0 };
  }
}
async function fetchMultiQuote(symbols) {
  const r = await Promise.allSettled(symbols.map(fetchQuickQuote));
  return r.map((res, i) => res.status === "fulfilled" ? res.value : { symbol: symbols[i], price: 0, change: 0, changePct: 0, volume: 0, marketCap: 0 });
}

export { fetchStockData as a, fetchMultiQuote as f };
