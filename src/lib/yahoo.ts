import { calcRSI, calcMACD, calcSMA, calcEMA, calcBollingerBands } from "./indicators.js";
export type Period = "1d"|"5d"|"1mo"|"3mo"|"6mo"|"1y"|"2y";
export type Interval = "1h"|"4h"|"1d"|"1wk";

const YF_BASE = "https://query1.finance.yahoo.com";

function periodSeconds(p: Period): number {
  const day = 86400;
  const map: Record<string, number> = {
    "1d": day, "5d": 5*day, "1mo": 30*day, "3mo": 90*day,
    "6mo": 180*day, "1y": 365*day, "2y": 730*day,
  };
  return map[p] ?? 180*day;
}

async function yfFetch(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  return res.json();
}

export async function fetchStockData(symbol: string, period: Period = "6mo", interval: Interval = "1d") {
  const yiv = interval === "1h" || interval === "4h" ? "60m" : interval === "1wk" ? "1wk" : "1d";
  const now = Math.floor(Date.now() / 1000);
  const period1 = now - periodSeconds(period);
  // For intraday, Yahoo limits to ~60 days
  const actualPeriod1 = (yiv === "60m") ? Math.max(period1, now - 59 * 86400) : period1;

  const chartUrl = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${actualPeriod1}&period2=${now}&interval=${yiv}&includePrePost=false`;
  const quoteUrl = `${YF_BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,summaryDetail,defaultKeyStatistics,assetProfile`;

  const [chartJson, summaryJson] = await Promise.all([
    yfFetch(chartUrl),
    yfFetch(quoteUrl).catch(() => null),
  ]);

  // Parse quote summary
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
    sector: prof.sector as string,
    industry: prof.industry as string,
    longBusinessSummary: prof.longBusinessSummary as string,
  };

  // Parse chart data
  const chartResult = chartJson?.chart?.result?.[0];
  const timestamps = chartResult?.timestamp ?? [];
  const ohlcv = chartResult?.indicators?.quote?.[0] ?? {};

  const raw = timestamps
    .map((ts: number, i: number) => {
      const o = ohlcv.open?.[i], h = ohlcv.high?.[i], l = ohlcv.low?.[i], c = ohlcv.close?.[i], v = ohlcv.volume?.[i];
      if (o == null || c == null) return null;
      return {
        date: new Date(ts * 1000).toISOString().split("T")[0],
        open: +o.toFixed(4), high: +h.toFixed(4), low: +l.toFixed(4), close: +c.toFixed(4), volume: v ?? 0,
      };
    })
    .filter(Boolean) as { date: string; open: number; high: number; low: number; close: number; volume: number }[];

  const closes = raw.map(r => r.close);
  const rsi = calcRSI(closes), macd = calcMACD(closes);
  const sma20 = calcSMA(closes, 20), sma50 = calcSMA(closes, 50), ema20 = calcEMA(closes, 20);
  const bb = calcBollingerBands(closes);
  const chartData = raw.map((bar, i) => ({
    ...bar, sma20: sma20[i], sma50: sma50[i], ema20: ema20[i],
    bbUpper: bb.upper[i], bbMid: bb.mid[i], bbLower: bb.lower[i],
    rsi: rsi[i], macd: macd.macd[i], macdSignal: macd.signal[i], macdHist: macd.histogram[i],
  }));

  return { quote, chartData };
}

export async function fetchQuickQuote(symbol: string) {
  try {
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const json = await yfFetch(url);
    const meta = json?.chart?.result?.[0]?.meta ?? {};
    return {
      symbol,
      price: meta.regularMarketPrice ?? 0,
      change: (meta.regularMarketPrice ?? 0) - (meta.chartPreviousClose ?? meta.previousClose ?? 0),
      changePct: meta.chartPreviousClose ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100) : 0,
      volume: meta.regularMarketVolume ?? 0,
      marketCap: 0,
    };
  } catch { return { symbol, price: 0, change: 0, changePct: 0, volume: 0, marketCap: 0 }; }
}

export async function fetchMultiQuote(symbols: string[]) {
  const r = await Promise.allSettled(symbols.map(fetchQuickQuote));
  return r.map((res, i) => res.status === "fulfilled" ? res.value : { symbol: symbols[i], price: 0, change: 0, changePct: 0, volume: 0, marketCap: 0 });
}
