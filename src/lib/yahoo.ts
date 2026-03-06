import yahooFinance from "yahoo-finance2";
import { calcRSI, calcMACD, calcSMA, calcEMA, calcBollingerBands } from "./indicators.js";
export type Period = "1d"|"5d"|"1mo"|"3mo"|"6mo"|"1y"|"2y";
export type Interval = "1h"|"4h"|"1d"|"1wk";

function startDate(p: Period, iv: Interval): Date {
  const d = new Date();
  if (iv === "1h" || iv === "4h") { d.setDate(d.getDate() - 59); return d; }
  const map: Record<string, () => void> = {
    "1d": () => d.setDate(d.getDate()-1), "5d": () => d.setDate(d.getDate()-5),
    "1mo": () => d.setMonth(d.getMonth()-1), "3mo": () => d.setMonth(d.getMonth()-3),
    "6mo": () => d.setMonth(d.getMonth()-6), "1y": () => d.setFullYear(d.getFullYear()-1),
    "2y": () => d.setFullYear(d.getFullYear()-2),
  };
  map[p]?.(); return d;
}

export async function fetchStockData(symbol: string, period: Period = "6mo", interval: Interval = "1d") {
  const yiv = interval === "1h" || interval === "4h" ? "60m" : interval === "1wk" ? "1wk" : "1d";
  const [qs, hist] = await Promise.all([
    yahooFinance.quoteSummary(symbol, { modules: ["price","summaryDetail","defaultKeyStatistics","assetProfile"] }),
    yahooFinance.historical(symbol, { period1: startDate(period, interval), period2: new Date(), interval: yiv }),
  ]);
  const price = qs.price ?? {}, detail = qs.summaryDetail ?? {}, stats = qs.defaultKeyStatistics ?? {}, prof = (qs.assetProfile ?? {}) as Record<string,unknown>;
  const quote = {
    symbol, shortName: price.shortName ?? symbol, longName: price.longName ?? symbol, currency: price.currency ?? "USD",
    regularMarketPrice: price.regularMarketPrice ?? 0, regularMarketChange: price.regularMarketChange ?? 0,
    regularMarketChangePercent: price.regularMarketChangePercent ?? 0, regularMarketVolume: price.regularMarketVolume ?? 0,
    marketCap: price.marketCap ?? 0, fiftyTwoWeekHigh: price.fiftyTwoWeekHigh ?? 0, fiftyTwoWeekLow: price.fiftyTwoWeekLow ?? 0,
    trailingPE: detail.trailingPE, forwardPE: detail.forwardPE, dividendYield: detail.dividendYield,
    averageVolume: detail.averageVolume, beta: detail.beta, epsTrailingTwelveMonths: stats.trailingEps,
    sector: prof.sector as string, industry: prof.industry as string, longBusinessSummary: prof.longBusinessSummary as string,
  };
  const raw = hist.filter(d => d.open && d.close).map(d => ({
    date: d.date.toISOString().split("T")[0],
    open: +d.open!.toFixed(4), high: +d.high!.toFixed(4), low: +d.low!.toFixed(4), close: +d.close!.toFixed(4), volume: d.volume ?? 0,
  }));
  const closes = raw.map(r => r.close);
  const rsi = calcRSI(closes), macd = calcMACD(closes);
  const sma20 = calcSMA(closes,20), sma50 = calcSMA(closes,50), ema20 = calcEMA(closes,20);
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
    const q = await yahooFinance.quote(symbol);
    return { symbol, price: q.regularMarketPrice??0, change: q.regularMarketChange??0, changePct: q.regularMarketChangePercent??0, volume: q.regularMarketVolume??0, marketCap: q.marketCap??0 };
  } catch { return { symbol, price:0, change:0, changePct:0, volume:0, marketCap:0 }; }
}

export async function fetchMultiQuote(symbols: string[]) {
  const r = await Promise.allSettled(symbols.map(fetchQuickQuote));
  return r.map((res, i) => res.status === "fulfilled" ? res.value : { symbol: symbols[i], price:0, change:0, changePct:0, volume:0, marketCap:0 });
}
