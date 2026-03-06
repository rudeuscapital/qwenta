import type { APIRoute } from "astro";
import { fetchStockData } from "../../lib/yahoo.js";
import type { Period, Interval } from "../../lib/yahoo.js";
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
export const GET: APIRoute = async ({ url }) => {
  const symbol = url.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return json({ error: "Symbol required" }, 400);
  try {
    const data = await fetchStockData(symbol, (url.searchParams.get("period")||"6mo") as Period, (url.searchParams.get("interval")||"1d") as Interval);
    return json(data);
  } catch (e) { return json({ error: (e as Error).message }, 500); }
};
