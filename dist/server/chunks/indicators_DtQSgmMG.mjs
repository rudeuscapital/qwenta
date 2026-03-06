function calcSMA(closes, period) {
  return closes.map((_, i) => i < period - 1 ? null : closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
}
function calcEMA(closes, period) {
  const k = 2 / (period + 1);
  const r = new Array(closes.length).fill(null);
  let ema = null;
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) continue;
    ema = ema === null ? closes.slice(0, period).reduce((a, b) => a + b, 0) / period : closes[i] * k + ema * (1 - k);
    r[i] = +ema.toFixed(4);
  }
  return r;
}
function calcRSI(closes, period = 14) {
  const r = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return r;
  let ag = 0, al = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) ag += d;
    else al -= d;
  }
  ag /= period;
  al /= period;
  r[period] = al === 0 ? 100 : +(100 - 100 / (1 + ag / al)).toFixed(2);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    ag = (ag * (period - 1) + Math.max(d, 0)) / period;
    al = (al * (period - 1) + Math.max(-d, 0)) / period;
    r[i] = al === 0 ? 100 : +(100 - 100 / (1 + ag / al)).toFixed(2);
  }
  return r;
}
function calcMACD(closes, fast = 12, slow = 26, signal = 9) {
  const ef = calcEMA(closes, fast), es = calcEMA(closes, slow);
  const ml = closes.map((_, i) => ef[i] != null && es[i] != null ? +(ef[i] - es[i]).toFixed(4) : null);
  const mv = ml.filter((v) => v !== null);
  const sr = calcEMA(mv, signal);
  const offset = ml.findIndex((v) => v !== null);
  const sl = new Array(closes.length).fill(null);
  sr.forEach((v, i) => {
    sl[offset + i] = v;
  });
  return { macd: ml, signal: sl, histogram: ml.map((m, i) => m != null && sl[i] != null ? +(m - sl[i]).toFixed(4) : null) };
}
function calcBollingerBands(closes, period = 20, std = 2) {
  const mid = calcSMA(closes, period);
  const upper = new Array(closes.length).fill(null);
  const lower = new Array(closes.length).fill(null);
  closes.forEach((_, i) => {
    if (mid[i] == null) return;
    const sl = closes.slice(i - period + 1, i + 1), mean = mid[i];
    const sd = Math.sqrt(sl.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
    upper[i] = +(mean + std * sd).toFixed(4);
    lower[i] = +(mean - std * sd).toFixed(4);
  });
  return { upper, mid, lower };
}
function buildMarketContext(symbol, quote, chartData) {
  const l = chartData.at(-1), p = chartData.at(-2);
  if (!l || !p) return "";
  const chg = (l.close - p.close) / p.close * 100;
  const closes = chartData.map((d) => d.close);
  return `=== ${symbol} ===
Price: $${l.close?.toFixed(2)} (${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%)
OHLC: O${l.open} H${l.high} L${l.low} C${l.close}
RSI: ${l.rsi?.toFixed(2) ?? "N/A"} | MACD: ${l.macd?.toFixed(4) ?? "N/A"}
SMA20: $${l.sma20?.toFixed(2) ?? "N/A"} | SMA50: $${l.sma50?.toFixed(2) ?? "N/A"}
BB: U$${l.bbUpper?.toFixed(2) ?? "N/A"} L$${l.bbLower?.toFixed(2) ?? "N/A"}
52W H: $${Math.max(...closes).toFixed(2)} | L: $${Math.min(...closes).toFixed(2)}
MktCap: ${quote.marketCap ? "$" + (quote.marketCap / 1e9).toFixed(2) + "B" : "N/A"} | P/E: ${quote.trailingPE ?? "N/A"} | Beta: ${quote.beta ?? "N/A"}`.trim();
}

export { calcMACD as a, buildMarketContext as b, calcRSI as c, calcSMA as d, calcEMA as e, calcBollingerBands as f };
