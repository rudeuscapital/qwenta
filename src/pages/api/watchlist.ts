import type { APIRoute } from "astro";
import { query, queryOne } from "../../lib/db.js";
import { getSessionFromRequest } from "../../lib/auth.js";
import { fetchMultiQuote } from "../../lib/yahoo.js";
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });

export const GET: APIRoute = async ({ url, request }) => {
  const user = await getSessionFromRequest(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const id = url.searchParams.get("id");
  try {
    if (id) {
      const wl = await queryOne("SELECT * FROM watchlists WHERE id=$1 AND user_id=$2", [id, user.id]);
      if (!wl) return json({ error: "Not found" }, 404);
      const items = await query<{ id:number; symbol:string; notes:string }>("SELECT * FROM watchlist_items WHERE watchlist_id=$1 ORDER BY added_at DESC", [id]);
      const quotes = items.length ? await fetchMultiQuote(items.map(i=>i.symbol)) : [];
      return json({ watchlist: wl, items: items.map(item => ({ ...item, quote: quotes.find(q=>q.symbol===item.symbol) })) });
    }
    return json(await query("SELECT * FROM watchlists WHERE user_id=$1 ORDER BY created_at", [user.id]));
  } catch (e) { return json({ error: String(e) }, 500); }
};

export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionFromRequest(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  try {
    const { action, ...b } = await request.json() as Record<string, unknown>;
    if (action === "create_list") { const [l] = await query("INSERT INTO watchlists(user_id,name) VALUES($1,$2) RETURNING *", [user.id, b.name||"New Watchlist"]); return json(l); }
    if (action === "add") { const [i] = await query("INSERT INTO watchlist_items(watchlist_id,symbol,notes) VALUES($1,$2,$3) ON CONFLICT(watchlist_id,symbol) DO UPDATE SET notes=EXCLUDED.notes RETURNING *", [b.watchlist_id, (b.symbol as string)?.toUpperCase(), b.notes||""]); return json(i); }
    if (action === "remove") { await query("DELETE FROM watchlist_items WHERE id=$1", [b.item_id]); return json({ success:true }); }
    if (action === "delete_list") { await query("DELETE FROM watchlists WHERE id=$1 AND user_id=$2", [b.id, user.id]); return json({ success:true }); }
    return json({ error: "Unknown action" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
};
