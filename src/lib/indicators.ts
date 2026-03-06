export function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => i < period - 1 ? null : closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
}
export function calcEMA(closes: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const r: (number | null)[] = new Array(closes.length).fill(null);
  let ema: number | null = null;
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) continue;
    ema = ema === null ? closes.slice(0, period).reduce((a, b) => a + b, 0) / period : closes[i] * k + ema * (1 - k);
    r[i] = +ema.toFixed(4);
  }
  return r;
}
export function calcRSI(closes: number[], period = 14): (number | null)[] {
  const r: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return r;
  let ag = 0, al = 0;
  for (let i = 1; i <= period; i++) { const d = closes[i] - closes[i - 1]; if (d >= 0) ag += d; else al -= d; }
  ag /= period; al /= period;
  r[period] = al === 0 ? 100 : +(100 - 100 / (1 + ag / al)).toFixed(2);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + Math.max(d, 0)) / period;
    al = (al * (period - 1) + Math.max(-d, 0)) / period;
    r[i] = al === 0 ? 100 : +(100 - 100 / (1 + ag / al)).toFixed(2);
  }
  return r;
}
export function calcMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  const ef = calcEMA(closes, fast), es = calcEMA(closes, slow);
  const ml = closes.map((_, i) => ef[i] != null && es[i] != null ? +((ef[i]! - es[i]!).toFixed(4)) : null);
  const mv = ml.filter(v => v !== null) as number[];
  const sr = calcEMA(mv, signal);
  const offset = ml.findIndex(v => v !== null);
  const sl: (number | null)[] = new Array(closes.length).fill(null);
  sr.forEach((v, i) => { sl[offset + i] = v; });
  return { macd: ml, signal: sl, histogram: ml.map((m, i) => m != null && sl[i] != null ? +((m - sl[i]!).toFixed(4)) : null) };
}
export function calcBollingerBands(closes: number[], period = 20, std = 2) {
  const mid = calcSMA(closes, period);
  const upper: (number | null)[] = new Array(closes.length).fill(null);
  const lower: (number | null)[] = new Array(closes.length).fill(null);
  closes.forEach((_, i) => {
    if (mid[i] == null) return;
    const sl = closes.slice(i - period + 1, i + 1), mean = mid[i]!;
    const sd = Math.sqrt(sl.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
    upper[i] = +(mean + std * sd).toFixed(4);
    lower[i] = +(mean - std * sd).toFixed(4);
  });
  return { upper, mid, lower };
}
export function buildMarketContext(symbol: string, quote: Record<string, unknown>, chartData: Array<Record<string, unknown>>): string {
  const l = chartData.at(-1) as Record<string, number> | undefined, p = chartData.at(-2) as Record<string, number> | undefined;
  if (!l || !p) return "";
  const chg = ((l.close - p.close) / p.close) * 100;
  const closes = chartData.map(d => (d as Record<string, number>).close);
  return `=== ${symbol} ===\nPrice: $${l.close?.toFixed(2)} (${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%)\nOHLC: O${l.open} H${l.high} L${l.low} C${l.close}\nRSI: ${(l.rsi as number)?.toFixed(2) ?? "N/A"} | MACD: ${(l.macd as number)?.toFixed(4) ?? "N/A"}\nSMA20: $${(l.sma20 as number)?.toFixed(2) ?? "N/A"} | SMA50: $${(l.sma50 as number)?.toFixed(2) ?? "N/A"}\nBB: U$${(l.bbUpper as number)?.toFixed(2) ?? "N/A"} L$${(l.bbLower as number)?.toFixed(2) ?? "N/A"}\n52W H: $${Math.max(...closes).toFixed(2)} | L: $${Math.min(...closes).toFixed(2)}\nMktCap: ${quote.marketCap ? "$" + ((quote.marketCap as number) / 1e9).toFixed(2) + "B" : "N/A"} | P/E: ${quote.trailingPE ?? "N/A"} | Beta: ${quote.beta ?? "N/A"}`.trim();
}
