import { b as buildMarketContext } from '../../chunks/indicators_DtQSgmMG.mjs';
export { renderers } from '../../renderers.mjs';

const OLLAMA = "http://127.0.0.1:11434";
const MODEL = "qwen2.5";
const SYSTEM = `You are Qwenta AI — an elite trading analyst for institutional clients. Expert in technical analysis (RSI, MACD, Bollinger Bands, SMA/EMA), fundamental analysis, risk management, and market microstructure. Respond in the same language as the user (Indonesian or English). Be precise, data-driven, and always cite specific numbers from the provided market data. Always include risk disclaimer.`;
const POST = async ({ request }) => {
  try {
    const { messages, symbol, chartData, quote } = await request.json();
    let sys = SYSTEM;
    if (symbol && chartData && quote) sys += "\n\n" + buildMarketContext(symbol, quote, chartData);
    const res = await fetch(`${OLLAMA}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: sys }, ...messages], stream: true, options: { temperature: 0.4, num_ctx: 8192 } })
    });
    if (!res.ok) return new Response(JSON.stringify({ error: await res.text() }), { status: 500, headers: { "Content-Type": "application/json" } });
    return new Response(res.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
