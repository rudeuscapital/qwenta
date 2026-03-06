export { renderers } from '../../renderers.mjs';

const OLLAMA = "http://127.0.0.1:11434";
const MODEL = "qwen2.5";
function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const source = block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")?.trim() ?? "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    if (title && link) items.push({ title, link, source, pubDate });
  }
  return items;
}
async function fetchNews(symbol, limit = 15) {
  const query = encodeURIComponent(`${symbol} stock`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
  });
  if (!res.ok) throw new Error(`Google News RSS error: ${res.status}`);
  const xml = await res.text();
  return parseRSSItems(xml).slice(0, limit);
}
async function analyzeSentiment(symbol, headlines) {
  const prompt = `Analyze the sentiment of these recent news headlines for ${symbol} stock. Return ONLY valid JSON with this exact format: {"sentiment":"bullish"|"bearish"|"neutral","score":<number from -100 to 100>,"summary":"<2-3 sentence analysis>"}

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
  try {
    const res = await fetch(`${OLLAMA}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, stream: false, options: { temperature: 0.2, num_ctx: 4096 } })
    });
    if (!res.ok) return { sentiment: "neutral", score: 0, summary: "AI analysis unavailable." };
    const data = await res.json();
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { sentiment: "neutral", score: 0, summary: "Could not parse AI response." };
    const parsed = JSON.parse(jsonMatch[0]);
    const sentiment = ["bullish", "bearish", "neutral"].includes(parsed.sentiment) ? parsed.sentiment : "neutral";
    return { sentiment, score: Math.max(-100, Math.min(100, parsed.score ?? 0)), summary: parsed.summary ?? "" };
  } catch {
    return { sentiment: "neutral", score: 0, summary: "AI analysis unavailable." };
  }
}
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
const GET = async ({ url }) => {
  const symbol = url.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return json({ error: "Symbol required" }, 400);
  const withSentiment = url.searchParams.get("sentiment") !== "false";
  try {
    const news = await fetchNews(symbol);
    let sentiment = null;
    if (withSentiment && news.length > 0) {
      sentiment = await analyzeSentiment(symbol, news.map((n) => n.title));
    }
    return json({ symbol, news, sentiment });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
