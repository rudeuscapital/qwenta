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
      const pf = await queryOne("SELECT * FROM portfolios WHERE id=$1 AND user_id=$2", [id, user.id]);
      if (!pf) return json({ error: "Not found" }, 404);
      const positions = await query<{ id:number;symbol:string;shares:number;avg_cost:number;notes:string }>("SELECT * FROM positions WHERE portfolio_id=$1 ORDER BY symbol", [id]);
      const txns = await query("SELECT * FROM transactions WHERE portfolio_id=$1 ORDER BY executed_at DESC LIMIT 100", [id]);
      const symbols = [...new Set(positions.map(p=>p.symbol))];
      const quotes = symbols.length ? await fetchMultiQuote(symbols) : [];
      const posWithPnl = positions.map(pos => {
        const q = quotes.find(q=>q.symbol===pos.symbol);
        const cur = q?.price??0, mv = cur*+pos.shares, cb = +pos.avg_cost*+pos.shares;
        return { ...pos, currentPrice:cur, changePct:q?.changePct??0, marketValue:mv, costBasis:cb, unrealizedPnl:mv-cb, unrealizedPct:cb>0?(mv-cb)/cb*100:0 };
      });
      const tv = posWithPnl.reduce((s,p)=>s+p.marketValue,0), tc = posWithPnl.reduce((s,p)=>s+p.costBasis,0);
      return json({ portfolio:pf, positions:posWithPnl, transactions:txns, summary:{ totalValue:tv, totalCost:tc, totalPnl:tv-tc, totalPnlPct:tc>0?(tv-tc)/tc*100:0, positionCount:positions.length } });
    }
    return json(await query("SELECT * FROM portfolios WHERE user_id=$1 ORDER BY created_at", [user.id]));
  } catch (e) { return json({ error: String(e) }, 500); }
};

export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionFromRequest(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  try {
    const { action, ...b } = await request.json() as Record<string, unknown>;
    if (action === "create") { const [p] = await query("INSERT INTO portfolios(user_id,name,currency) VALUES($1,$2,$3) RETURNING *", [user.id, b.name||"Portfolio", b.currency||"USD"]); return json(p); }
    if (action === "buy" || action === "sell") {
      const { portfolio_id:pid, symbol:sym, shares, price, fee=0, notes="" } = b as Record<string,unknown>;
      const s = (sym as string).toUpperCase();
      await query("INSERT INTO transactions(portfolio_id,symbol,type,shares,price,fee,notes) VALUES($1,$2,$3,$4,$5,$6,$7)", [pid, s, action.toUpperCase(), shares, price, fee, notes]);
      if (action === "buy") {
        const ex = await queryOne<{shares:number;avg_cost:number}>("SELECT shares,avg_cost FROM positions WHERE portfolio_id=$1 AND symbol=$2", [pid, s]);
        if (ex) { const ns=+ex.shares+(shares as number), nc=(+ex.shares*+ex.avg_cost+(shares as number)*(price as number))/ns; await query("UPDATE positions SET shares=$1,avg_cost=$2 WHERE portfolio_id=$3 AND symbol=$4",[ns,nc,pid,s]); }
        else await query("INSERT INTO positions(portfolio_id,symbol,shares,avg_cost,notes) VALUES($1,$2,$3,$4,$5)",[pid,s,shares,price,notes]);
      } else {
        const pos = await queryOne<{id:number;shares:number}>("SELECT id,shares FROM positions WHERE portfolio_id=$1 AND symbol=$2",[pid,s]);
        if (pos) { const rem=+pos.shares-(shares as number); rem<=0.000001 ? await query("DELETE FROM positions WHERE id=$1",[pos.id]) : await query("UPDATE positions SET shares=$1 WHERE id=$2",[rem,pos.id]); }
      }
      return json({ success:true });
    }
    if (action === "delete") { await query("DELETE FROM portfolios WHERE id=$1 AND user_id=$2",[b.id, user.id]); return json({ success:true }); }
    return json({ error: "Unknown action" }, 400);
  } catch (e) { return json({ error: String(e) }, 500); }
};
