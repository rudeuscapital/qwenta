import type { APIRoute } from "astro";
import { fetchStockData, fetchMultiQuote } from "../../lib/yahoo.js";
import type { Period, Interval } from "../../lib/yahoo.js";
import * as XLSX from "xlsx";

const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });

const UNIVERSE = ["AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","NFLX","AMD","INTC","JPM","BAC","GS","JNJ","PFE","XOM","CVX","SPY","QQQ","BTC-USD","ETH-USD","BNB-USD","SOL-USD"];

// POST /api/screener
export const screenerHandler: APIRoute = async ({ request }) => {
  const { filters = {} } = await request.json() as { filters: Record<string, unknown> };
  const universe = (filters.symbols as string[])?.length ? filters.symbols as string[] : UNIVERSE;
  const BATCH = 5;
  const results: unknown[] = [];
  for (let i = 0; i < universe.length; i += BATCH) {
    const fetched = await Promise.allSettled(universe.slice(i, i+BATCH).map(async sym => {
      const { quote, chartData } = await fetchStockData(sym, "3mo", "1d");
      const l = chartData.at(-1), p = chartData.at(-2);
      if (!l || !p) return null;
      const changePct = ((l.close - p.close)/p.close)*100;
      return { symbol:sym, shortName:quote.shortName, sector:quote.sector, price:l.close, changePct:+changePct.toFixed(2), volume:l.volume, marketCap:quote.marketCap, rsi:l.rsi, macd:l.macd, macdBullish:(l.macd??0)>(l.macdSignal??0), sma20:l.sma20, sma50:l.sma50, smaCross:(l.sma20??0)>(l.sma50??0), priceAboveSma20:l.close>(l.sma20??0), priceAboveSma50:l.close>(l.sma50??0), trailingPE:quote.trailingPE, beta:quote.beta };
    }));
    results.push(...fetched.map(r => r.status==="fulfilled"?r.value:null).filter(Boolean));
  }
  let s = results as Array<Record<string, unknown>>;
  if (filters.rsiMin != null) s = s.filter(x => (x.rsi as number) >= (filters.rsiMin as number));
  if (filters.rsiMax != null) s = s.filter(x => (x.rsi as number) <= (filters.rsiMax as number));
  if (filters.macdBullish) s = s.filter(x => x.macdBullish);
  if (filters.smaCross) s = s.filter(x => x.smaCross);
  if (filters.priceAboveSma20) s = s.filter(x => x.priceAboveSma20);
  if (filters.priceAboveSma50) s = s.filter(x => x.priceAboveSma50);
  if (filters.changePctMin != null) s = s.filter(x => (x.changePct as number) >= (filters.changePctMin as number));
  if (filters.changePctMax != null) s = s.filter(x => (x.changePct as number) <= (filters.changePctMax as number));
  return json({ results: s, total: s.length });
};

// GET /api/compare?symbols=A,B&period=6mo
export const compareHandler: APIRoute = async ({ url }) => {
  const symbols = (url.searchParams.get("symbols")??"").split(",").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,6);
  if (symbols.length < 2) return json({ error: "2+ symbols required" }, 400);
  const period = (url.searchParams.get("period")??"6mo") as Period;
  const results = await Promise.allSettled(symbols.map(async sym => {
    const { quote, chartData } = await fetchStockData(sym, period, "1d");
    const first = chartData[0]?.close??1;
    return { symbol:sym, quote, chartData, normalized: chartData.map(b => ({ date:b.date, value:+((b.close-first)/first*100).toFixed(3), close:b.close })) };
  }));
  return json({ symbols, data: results.map((r,i) => r.status==="fulfilled"?r.value:{ symbol:symbols[i], error:(r.reason as Error)?.message }) });
};

// GET /api/export?symbol=AAPL&period=6mo&format=csv|xlsx
export const exportHandler: APIRoute = async ({ url }) => {
  const symbol = url.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return new Response(JSON.stringify({ error: "Symbol required" }), { status:400, headers:{"Content-Type":"application/json"} });
  const { quote, chartData } = await fetchStockData(symbol, (url.searchParams.get("period")??"6mo") as Period, "1d");
  const rows = chartData.map(b => ({ Date:b.date, Open:b.open, High:b.high, Low:b.low, Close:b.close, Volume:b.volume, SMA20:b.sma20??"", SMA50:b.sma50??"", RSI:b.rsi??"", MACD:b.macd??"", Signal:b.macdSignal??"", BB_Upper:b.bbUpper??"", BB_Lower:b.bbLower??"" }));
  const format = url.searchParams.get("format")??"csv";
  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Price Data");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Object.entries(quote).map(([k,v])=>({Field:k,Value:String(v??"")}))), "Quote");
    const buf = XLSX.write(wb, { type:"buffer", bookType:"xlsx" });
    return new Response(buf, { headers: { "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition":`attachment; filename="${symbol}.xlsx"` } });
  }
  const csv = [Object.keys(rows[0]??{}).join(","), ...rows.map(r=>Object.values(r).join(","))].join("\n");
  return new Response(csv, { headers: { "Content-Type":"text/csv", "Content-Disposition":`attachment; filename="${symbol}.csv"` } });
};
