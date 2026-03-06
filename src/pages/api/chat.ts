import type { APIRoute } from "astro";
import { buildMarketContext } from "../../lib/indicators.js";
const OLLAMA = import.meta.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const MODEL  = import.meta.env.OLLAMA_MODEL ?? "qwen2.5";
const SYSTEM = `You are Qwenta AI — an elite trading analyst for institutional clients. Expert in technical analysis (RSI, MACD, Bollinger Bands, SMA/EMA), fundamental analysis, risk management, and market microstructure. Respond in the same language as the user (Indonesian or English). Be precise, data-driven, and always cite specific numbers from the provided market data. Always include risk disclaimer.`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, symbol, chartData, quote } = await request.json() as Record<string, unknown>;
    let sys = SYSTEM;
    if (symbol && chartData && quote) sys += "\n\n" + buildMarketContext(symbol as string, quote as Record<string,unknown>, chartData as Array<Record<string,unknown>>);
    const res = await fetch(`${OLLAMA}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role:"system", content:sys }, ...(messages as unknown[])], stream: true, options: { temperature:0.4, num_ctx:8192 } }),
    });
    if (!res.ok) return new Response(JSON.stringify({ error: await res.text() }), { status: 500, headers: {"Content-Type":"application/json"} });
    return new Response(res.body, { headers: { "Content-Type":"text/event-stream","Cache-Control":"no-cache","X-Accel-Buffering":"no" } });
  } catch (e) { return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: {"Content-Type":"application/json"} }); }
};
