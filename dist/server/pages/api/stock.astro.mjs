import { a as fetchStockData } from '../../chunks/yahoo_r_Nj-wD_.mjs';
export { renderers } from '../../renderers.mjs';

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
const GET = async ({ url }) => {
  const symbol = url.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return json({ error: "Symbol required" }, 400);
  try {
    const data = await fetchStockData(symbol, url.searchParams.get("period") || "6mo", url.searchParams.get("interval") || "1d");
    return json(data);
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
