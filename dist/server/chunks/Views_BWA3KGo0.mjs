import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { D as DashboardLayout } from './Layout_L-6bpj3S.mjs';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

const fB = (n) => n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(0)}M` : "—";
const fV = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`;
function WatchlistView({ wallet }) {
  const [lists, setLists] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSym, setNewSym] = useState(""), [newNotes, setNewNotes] = useState(""), [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false), [showNew, setShowNew] = useState(false);
  const loadLists = async () => {
    const r = await fetch("/api/watchlist");
    const d = await r.json();
    setLists(d);
    if (!activeId && d.length > 0) setActiveId(d[0].id);
  };
  const loadItems = async (id) => {
    setLoading(true);
    const r = await fetch(`/api/watchlist?id=${id}`);
    const d = await r.json();
    setItems(d.items ?? []);
    setLoading(false);
  };
  const post = (body) => fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  useEffect(() => {
    loadLists();
  }, []);
  useEffect(() => {
    if (activeId) loadItems(activeId);
  }, [activeId]);
  return /* @__PURE__ */ jsx(DashboardLayout, { active: "/dashboard/watchlist", wallet, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row h-full overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:w-48 border-b md:border-b-0 md:border-r border-void-700 bg-void-850 flex flex-col shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2 md:py-3 border-b border-void-700", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold", children: "WATCHLISTS" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowNew(true), className: "text-void-500 hover:text-cyan-400 text-base transition-colors", children: "+" })
      ] }),
      showNew && /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b border-void-700 bg-void-800", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            placeholder: "Name...",
            onKeyDown: async (e) => {
              if (e.key === "Enter" && newName.trim()) {
                await post({ action: "create_list", name: newName });
                setNewName("");
                setShowNew(false);
                loadLists();
              }
            },
            className: "w-full bg-void-700 border border-void-600 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-500 focus:outline-none focus:border-cyan-500/30 mb-1.5"
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: async () => {
          if (newName.trim()) {
            await post({ action: "create_list", name: newName });
            setNewName("");
            setShowNew(false);
            loadLists();
          }
        }, className: "w-full px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-[9px] font-mono", children: "CREATE" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex md:flex-col overflow-x-auto md:overflow-y-auto py-1 md:py-2 px-1 md:px-0 gap-1 md:gap-0 md:flex-1", children: lists.map((l) => /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => setActiveId(l.id),
          className: `flex items-center px-3 py-1.5 md:py-2 cursor-pointer transition-colors whitespace-nowrap rounded md:rounded-none shrink-0 ${activeId === l.id ? "bg-cyan-500/10 md:border-r-2 border-cyan-400" : "hover:bg-void-800"}`,
          children: /* @__PURE__ */ jsx("span", { className: `text-xs font-sans ${activeId === l.id ? "text-cyan-300" : "text-slate-400"}`, children: l.name })
        },
        l.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden min-h-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 border-b border-void-700 bg-void-850 shrink-0", children: [
        /* @__PURE__ */ jsx("input", { value: newSym, onChange: (e) => setNewSym(e.target.value.toUpperCase()), placeholder: "Symbol", className: "bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder-void-500 w-24 md:w-28 focus:outline-none focus:border-cyan-500/40 uppercase" }),
        /* @__PURE__ */ jsx("input", { value: newNotes, onChange: (e) => setNewNotes(e.target.value), placeholder: "Notes", className: "flex-1 min-w-[80px] bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 placeholder-void-500 focus:outline-none focus:border-cyan-500/40" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !newSym.trim() || adding,
            onClick: async () => {
              if (!activeId || !newSym.trim()) return;
              setAdding(true);
              await post({ action: "add", watchlist_id: activeId, symbol: newSym, notes: newNotes });
              setNewSym("");
              setNewNotes("");
              setAdding(false);
              loadItems(activeId);
            },
            className: "px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors",
            children: adding ? "..." : "ADD"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-500", children: "Loading..." }) }) : items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-void-600 font-display text-xl italic", children: "Empty watchlist" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-600", children: "Add symbols above" })
      ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono", children: [
        /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-void-850 border-b border-void-700", children: /* @__PURE__ */ jsx("tr", { children: ["SYMBOL", "PRICE", "CHANGE", "VOLUME", "MKT CAP", "NOTES", ""].map((h) => /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-[9px] text-void-500 tracking-widest font-medium", children: h }, h)) }) }),
        /* @__PURE__ */ jsx("tbody", { children: items.map((item, i) => {
          const q = item.quote, pos = (q?.changePct ?? 0) >= 0;
          return /* @__PURE__ */ jsxs("tr", { className: `border-b border-void-800 hover:bg-void-800/50 transition-colors ${i % 2 === 0 ? "" : "bg-void-900/20"}`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsx("a", { href: `/dashboard?sym=${item.symbol}`, className: "text-cyan-400 font-semibold hover:text-cyan-300", children: item.symbol }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-200", children: q?.price ? `$${q.price.toFixed(2)}` : "—" }),
            /* @__PURE__ */ jsx("td", { className: `px-4 py-2.5 ${pos ? "text-bull" : "text-bear"}`, children: q?.changePct != null ? `${pos ? "+" : ""}${q.changePct.toFixed(2)}%` : "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-400", children: q?.volume ? fV(q.volume) : "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-400", children: q?.marketCap ? fB(q.marketCap) : "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-void-500 text-[9px] max-w-[120px] truncate", children: item.notes }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsx("button", { onClick: async () => {
              await post({ action: "remove", item_id: item.id });
              if (activeId) loadItems(activeId);
            }, className: "text-void-600 hover:text-bear transition-colors", children: "✕" }) })
          ] }, item.id);
        }) })
      ] }) })
    ] })
  ] }) });
}
function PortfolioView({ wallet }) {
  const [portfolios, setPortfolios] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [view, setView] = useState("positions");
  const [showTrade, setShowTrade] = useState(false);
  const [tf, setTf] = useState({ symbol: "", shares: "", price: "", fee: "0", notes: "", type: "buy" });
  const [submitting, setSubmitting] = useState(false);
  const loadPortfolios = async () => {
    const r = await fetch("/api/portfolio");
    const d = await r.json();
    setPortfolios(d);
    if (d.length > 0 && !activeId) setActiveId(d[0].id);
  };
  const loadPortfolio = async (id) => {
    const r = await fetch(`/api/portfolio?id=${id}`);
    const d = await r.json();
    setPositions(d.positions ?? []);
    setTransactions(d.transactions ?? []);
    setSummary(d.summary ?? null);
  };
  const post = (body) => fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  useEffect(() => {
    loadPortfolios();
  }, []);
  useEffect(() => {
    if (activeId) loadPortfolio(activeId);
  }, [activeId]);
  const submitTrade = async () => {
    if (!tf.symbol || !tf.shares || !tf.price || !activeId) return;
    setSubmitting(true);
    await post({ action: tf.type, portfolio_id: activeId, symbol: tf.symbol.toUpperCase(), shares: +tf.shares, price: +tf.price, fee: +tf.fee, notes: tf.notes });
    setSubmitting(false);
    setShowTrade(false);
    setTf({ symbol: "", shares: "", price: "", fee: "0", notes: "", type: "buy" });
    loadPortfolio(activeId);
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { active: "/dashboard/portfolio", wallet, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex-wrap", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold", children: "PORTFOLIO" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 overflow-x-auto", children: [
        portfolios.map((p) => /* @__PURE__ */ jsx("button", { onClick: () => setActiveId(p.id), className: `px-2.5 py-1 text-[10px] font-mono rounded transition-colors border whitespace-nowrap ${activeId === p.id ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" : "text-void-500 border-void-700 hover:text-slate-400"}`, children: p.name }, p.id)),
        /* @__PURE__ */ jsx("button", { onClick: async () => {
          const n = prompt("Portfolio name:");
          if (!n) return;
          await post({ action: "create", name: n });
          loadPortfolios();
        }, className: "px-2 py-1 text-[10px] font-mono text-void-500 border border-void-700 rounded hover:text-cyan-400 transition-colors whitespace-nowrap", children: "+ NEW" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsx("button", { onClick: () => setShowTrade(true), className: "px-3 py-1.5 bg-bull/10 border border-bull/30 rounded-lg text-bull text-[10px] font-mono hover:bg-bull/20 transition-colors", children: "+ TRADE" }) })
    ] }),
    summary && /* @__PURE__ */ jsx("div", { className: "flex gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 border-b border-void-700 bg-void-900/50 shrink-0 overflow-x-auto", children: [
      ["Total Value", `$${summary.totalValue.toFixed(2)}`, "text-white"],
      ["Total Cost", `$${summary.totalCost.toFixed(2)}`, "text-slate-400"],
      ["Unrealized P&L", `${summary.totalPnl >= 0 ? "+" : ""}$${Math.abs(summary.totalPnl).toFixed(2)}`, summary.totalPnl >= 0 ? "text-bull" : "text-bear"],
      ["Return", `${summary.totalPnlPct >= 0 ? "+" : ""}${summary.totalPnlPct.toFixed(2)}%`, summary.totalPnlPct >= 0 ? "text-bull" : "text-bear"],
      ["Positions", String(summary.positionCount), "text-cyan-400"]
    ].map(([l, v, c]) => /* @__PURE__ */ jsxs("div", { className: "bg-void-800 border border-void-700 rounded-lg px-4 py-2 shrink-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest", children: l }),
      /* @__PURE__ */ jsx("p", { className: `text-sm font-mono font-semibold mt-0.5 ${c}`, children: v })
    ] }, l)) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 px-3 md:px-5 py-2 border-b border-void-700 bg-void-850 shrink-0", children: ["positions", "transactions"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setView(t), className: `px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded transition-colors ${view === t ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-void-500 hover:text-slate-400"}`, children: t }, t)) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: view === "positions" ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto min-w-0", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono min-w-[700px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-void-850 border-b border-void-700", children: /* @__PURE__ */ jsx("tr", { children: ["SYMBOL", "SHARES", "AVG COST", "CURRENT", "MKT VALUE", "COST BASIS", "P&L", "RETURN", "DAY %"].map((h) => /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-[9px] text-void-500 tracking-widest", children: h }, h)) }) }),
      /* @__PURE__ */ jsx("tbody", { children: positions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "px-4 py-8 text-center text-void-600 text-sm", children: "No positions. Record a trade to start." }) }) : positions.map((p, i) => /* @__PURE__ */ jsxs("tr", { className: `border-b border-void-800 hover:bg-void-800/40 transition-colors ${i % 2 === 0 ? "" : "bg-void-900/20"}`, children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-cyan-400 font-semibold", children: p.symbol }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-300", children: Number(p.shares).toFixed(4) }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-400", children: [
          "$",
          Number(p.avg_cost).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-200", children: [
          "$",
          p.currentPrice.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-200 font-medium", children: [
          "$",
          p.marketValue.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-400", children: [
          "$",
          p.costBasis.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: `px-4 py-2.5 font-medium ${p.unrealizedPnl >= 0 ? "text-bull" : "text-bear"}`, children: [
          p.unrealizedPnl >= 0 ? "+" : "",
          "$",
          Math.abs(p.unrealizedPnl).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: `px-4 py-2.5 ${p.unrealizedPct >= 0 ? "text-bull" : "text-bear"}`, children: [
          p.unrealizedPct >= 0 ? "+" : "",
          p.unrealizedPct.toFixed(2),
          "%"
        ] }),
        /* @__PURE__ */ jsxs("td", { className: `px-4 py-2.5 ${p.changePct >= 0 ? "text-bull" : "text-bear"}`, children: [
          p.changePct >= 0 ? "+" : "",
          p.changePct.toFixed(2),
          "%"
        ] })
      ] }, p.id)) })
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto min-w-0", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono min-w-[600px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-void-850 border-b border-void-700", children: /* @__PURE__ */ jsx("tr", { children: ["DATE", "SYMBOL", "TYPE", "SHARES", "PRICE", "FEE", "TOTAL", "NOTES"].map((h) => /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-[9px] text-void-500 tracking-widest", children: h }, h)) }) }),
      /* @__PURE__ */ jsx("tbody", { children: transactions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-4 py-8 text-center text-void-600 text-sm", children: "No transactions yet." }) }) : transactions.map((tx, i) => /* @__PURE__ */ jsxs("tr", { className: `border-b border-void-800 hover:bg-void-800/40 transition-colors ${i % 2 === 0 ? "" : "bg-void-900/20"}`, children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-400", children: new Date(tx.executed_at).toLocaleDateString() }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-cyan-400 font-semibold", children: tx.symbol }),
        /* @__PURE__ */ jsx("td", { className: `px-4 py-2.5 font-semibold ${tx.type === "BUY" ? "text-bull" : "text-bear"}`, children: tx.type }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-300", children: Number(tx.shares).toFixed(4) }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-300", children: [
          "$",
          Number(tx.price).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-500", children: [
          "$",
          Number(tx.fee).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2.5 text-slate-200 font-medium", children: [
          "$",
          (Number(tx.shares) * Number(tx.price)).toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-void-500 text-[9px]", children: tx.notes })
      ] }, tx.id)) })
    ] }) }) }),
    showTrade && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-void-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-void-850 border border-void-600 rounded-2xl p-5 md:p-6 w-full max-w-sm shadow-panel", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-white font-display italic text-xl", children: "Record Trade" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowTrade(false), className: "text-void-500 hover:text-slate-400", children: "✕" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-4", children: ["buy", "sell"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTf((p) => ({ ...p, type: t })), className: `flex-1 py-1.5 text-xs font-mono uppercase rounded border transition-colors ${tf.type === t ? t === "buy" ? "bg-bull/10 border-bull/40 text-bull" : "bg-bear/10 border-bear/40 text-bear" : "bg-void-800 border-void-700 text-void-500 hover:text-slate-400"}`, children: t }, t)) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [["symbol", "Symbol", "AAPL"], [" shares", "Shares", "100"], ["price", "Price ($)", "150.00"], ["fee", "Fee ($)", "0"], ["notes", "Notes", "Optional"]].map(([k, l, ph]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest block mb-1", children: l }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: tf[k],
            onChange: (e) => setTf((p) => ({ ...p, [k]: k === "symbol" ? e.target.value.toUpperCase() : e.target.value })),
            placeholder: ph,
            className: "w-full bg-void-800 border border-void-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-void-500 focus:outline-none focus:border-cyan-500/30 transition-colors"
          }
        )
      ] }, k)) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: submitTrade,
          disabled: submitting || !tf.symbol || !tf.shares || !tf.price,
          className: `w-full mt-5 py-2.5 rounded-xl font-mono text-sm font-semibold border transition-all disabled:opacity-40 ${tf.type === "buy" ? "bg-bull/10 border-bull/40 text-bull hover:bg-bull/20" : "bg-bear/10 border-bear/40 text-bear hover:bg-bear/20"}`,
          children: submitting ? "Recording..." : ` Record ${tf.type.toUpperCase()}`
        }
      )
    ] }) })
  ] });
}
const PRESETS = [
  { label: "Oversold RSI", filters: { rsiMin: 0, rsiMax: 30 } },
  { label: "Overbought RSI", filters: { rsiMin: 70, rsiMax: 100 } },
  { label: "MACD Bullish", filters: { macdBullish: true } },
  { label: "Golden Cross", filters: { smaCross: true, priceAboveSma50: true } },
  { label: "Strong Uptrend", filters: { macdBullish: true, priceAboveSma20: true, priceAboveSma50: true } }
];
function ScreenerView({ wallet }) {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false), [ran, setRan] = useState(false);
  const [sortBy, setSortBy] = useState("changePct"), [sortDir, setSortDir] = useState(-1);
  const run = async (f) => {
    setLoading(true);
    setRan(false);
    const r = await fetch("/api/screener", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters: f ?? filters }) });
    const d = await r.json();
    setResults(d.results ?? []);
    setLoading(false);
    setRan(true);
  };
  const setF = (k, v) => setFilters((p) => {
    const n = { ...p };
    v === void 0 ? delete n[k] : n[k] = v;
    return n;
  });
  const sort = (k) => {
    if (sortBy === k) setSortDir((d) => d === 1 ? -1 : 1);
    else {
      setSortBy(k);
      setSortDir(-1);
    }
  };
  const sorted = [...results].sort((a, b) => (a[sortBy] - b[sortBy]) * sortDir);
  const Th = ({ k, l }) => /* @__PURE__ */ jsxs("th", { onClick: () => sort(k), className: `text-left px-3 py-2 text-[9px] tracking-widest cursor-pointer hover:text-cyan-400 transition-colors ${sortBy === k ? "text-cyan-400" : "text-void-500"}`, children: [
    l,
    sortBy === k ? sortDir === -1 ? " ↓" : " ↑" : ""
  ] });
  return /* @__PURE__ */ jsx(DashboardLayout, { active: "/dashboard/screener", wallet, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row h-full overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:w-60 border-b md:border-b-0 md:border-r border-void-700 bg-void-850 flex flex-col shrink-0 max-h-48 md:max-h-none overflow-y-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "px-4 py-2 md:py-3 border-b border-void-700", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold", children: "FILTERS" }) }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2", children: "Quick Presets" }),
          PRESETS.map((p) => /* @__PURE__ */ jsx("button", { onClick: () => {
            setFilters(p.filters);
            run(p.filters);
          }, className: "w-full text-left px-2.5 py-1.5 text-[10px] font-sans text-slate-400 hover:text-cyan-300 hover:bg-void-800 rounded transition-colors", children: p.label }, p.label))
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-px bg-void-700" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2", children: "RSI (14)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Min", value: filters.rsiMin ?? "", onChange: (e) => setF("rsiMin", e.target.value ? +e.target.value : void 0), className: "w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30" }),
            /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Max", value: filters.rsiMax ?? "", onChange: (e) => setF("rsiMax", e.target.value ? +e.target.value : void 0), className: "w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2", children: "Daily Change %" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Min", value: filters.changePctMin ?? "", onChange: (e) => setF("changePctMin", e.target.value ? +e.target.value : void 0), className: "w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30" }),
            /* @__PURE__ */ jsx("input", { type: "number", placeholder: "Max", value: filters.changePctMax ?? "", onChange: (e) => setF("changePctMax", e.target.value ? +e.target.value : void 0), className: "w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest", children: "Conditions" }),
          [{ k: "macdBullish", l: "MACD Bullish" }, { k: "smaCross", l: "Golden Cross (SMA20>50)" }, { k: "priceAboveSma20", l: "Price > SMA20" }, { k: "priceAboveSma50", l: "Price > SMA50" }].map(({ k, l }) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: !!filters[k], onChange: (e) => setF(k, e.target.checked ? true : void 0), className: "accent-cyan-500 w-3 h-3" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-sans text-slate-400", children: l })
          ] }, k))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto px-4 pb-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => run(), disabled: loading, className: "w-full py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors", children: loading ? "SCANNING..." : "RUN SCREENER" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setFilters({}), className: "w-full mt-1.5 py-1.5 text-[9px] font-mono text-void-500 hover:text-slate-400 transition-colors", children: "RESET" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold", children: "SCREENER RESULTS" }),
        ran && /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-void-500", children: [
          results.length,
          " matches"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-500", children: "Scanning universe..." })
      ] }) : !ran ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-void-600 font-display text-xl italic", children: "Run the screener" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-600", children: "Set filters, then click RUN SCREENER" })
      ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono", children: [
        /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-void-850 border-b border-void-700", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Th, { k: "symbol", l: "SYMBOL" }),
          /* @__PURE__ */ jsx(Th, { k: "price", l: "PRICE" }),
          /* @__PURE__ */ jsx(Th, { k: "changePct", l: "CHANGE %" }),
          /* @__PURE__ */ jsx(Th, { k: "rsi", l: "RSI" }),
          /* @__PURE__ */ jsx(Th, { k: "macd", l: "MACD" }),
          /* @__PURE__ */ jsx(Th, { k: "volume", l: "VOL" }),
          /* @__PURE__ */ jsx(Th, { k: "marketCap", l: "MKT CAP" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 text-[9px] text-void-500", children: "SIGNALS" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: sorted.map((r, i) => /* @__PURE__ */ jsxs("tr", { className: `border-b border-void-800 hover:bg-void-800/40 transition-colors ${i % 2 === 0 ? "" : "bg-void-900/20"}`, children: [
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsx("a", { href: `/dashboard?sym=${r.symbol}`, className: "text-cyan-400 font-semibold hover:text-cyan-300", children: r.symbol }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2.5 text-slate-200", children: [
            "$",
            r.price?.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxs("td", { className: `px-3 py-2.5 ${r.changePct >= 0 ? "text-bull" : "text-bear"}`, children: [
            r.changePct >= 0 ? "+" : "",
            r.changePct?.toFixed(2),
            "%"
          ] }),
          /* @__PURE__ */ jsx("td", { className: `px-3 py-2.5 ${r.rsi > 70 ? "text-bear" : r.rsi < 30 ? "text-bull" : "text-cyan-400"}`, children: r.rsi?.toFixed(1) }),
          /* @__PURE__ */ jsx("td", { className: `px-3 py-2.5 ${r.macdBullish ? "text-bull" : "text-bear"}`, children: r.macd?.toFixed(4) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-slate-400", children: fV(r.volume) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5 text-slate-400", children: fB(r.marketCap) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
            r.macdBullish && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 bg-bull/10 text-bull text-[8px] rounded", children: "MACD↑" }),
            r.smaCross && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] rounded", children: "GC" }),
            r.rsi < 30 && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 bg-bull/10 text-bull text-[8px] rounded", children: "OS" }),
            r.rsi > 70 && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 bg-bear/10 text-bear text-[8px] rounded", children: "OB" })
          ] }) })
        ] }, r.symbol)) })
      ] }) })
    ] })
  ] }) });
}
function NewsView({ wallet }) {
  const [symbol, setSymbol] = useState("AAPL");
  const [input, setInput] = useState("AAPL");
  const [news, setNews] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadNews = async (sym) => {
    setLoading(true);
    setError(null);
    setSentiment(null);
    try {
      const r = await fetch(`/api/news?symbol=${sym}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed to fetch news");
      setNews(d.news ?? []);
      setSentiment(d.sentiment);
    } catch (e) {
      setError(e.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadNews(symbol);
  }, [symbol]);
  const POPULAR = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "BTC-USD", "META"];
  const scoreColor = (s) => s > 20 ? "text-bull" : s < -20 ? "text-bear" : "text-cyan-400";
  const sentimentBg = (s) => s === "bullish" ? "bg-bull/10 border-bull/30" : s === "bearish" ? "bg-bear/10 border-bear/30" : "bg-cyan-500/10 border-cyan-500/30";
  const sentimentText = (s) => s === "bullish" ? "text-bull" : s === "bearish" ? "text-bear" : "text-cyan-400";
  const timeAgo = (dateStr) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch {
      return "";
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { active: "/dashboard/news", wallet, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-3 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 overflow-x-auto", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold shrink-0", children: "NEWS & SENTIMENT" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        const s = input.trim().toUpperCase();
        if (s) {
          setSymbol(s);
        }
      }, className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: input,
            onChange: (e) => setInput(e.target.value.toUpperCase()),
            placeholder: "Symbol",
            className: "bg-void-800 border border-void-600 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder-void-500 w-24 focus:outline-none focus:border-cyan-500/40 uppercase"
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 transition-colors", children: "GO" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto", children: POPULAR.map((s) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setSymbol(s);
            setInput(s);
          },
          className: `px-2 py-1 text-[10px] font-mono rounded whitespace-nowrap transition-colors ${symbol === s ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25" : "text-void-500 hover:text-slate-400"}`,
          children: s
        },
        s
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col md:flex-row overflow-hidden min-h-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:w-72 border-b md:border-b-0 md:border-r border-void-700 bg-void-850 flex flex-col shrink-0 max-h-52 md:max-h-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b border-void-700", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold", children: "AI SENTIMENT" }),
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 mt-0.5", children: "Powered by QwenAI" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 p-4 overflow-y-auto", children: [
          loading && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-500", children: "Analyzing sentiment..." })
          ] }),
          !loading && sentiment && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: `rounded-xl border p-4 mb-4 ${sentimentBg(sentiment.sentiment)}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: `text-xs font-mono font-bold uppercase tracking-widest ${sentimentText(sentiment.sentiment)}`, children: sentiment.sentiment }),
                /* @__PURE__ */ jsxs("span", { className: `text-2xl font-mono font-bold ${scoreColor(sentiment.score)}`, children: [
                  sentiment.score > 0 ? "+" : "",
                  sentiment.score
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative h-2 bg-void-900/50 rounded-full overflow-hidden", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-1/2 w-px bg-void-600" }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `absolute inset-y-0 rounded-full transition-all ${sentiment.score >= 0 ? "bg-bull" : "bg-bear"}`,
                    style: sentiment.score >= 0 ? { left: "50%", width: `${sentiment.score / 2}%` } : { right: "50%", width: `${Math.abs(sentiment.score) / 2}%` }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono text-bear", children: "-100" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono text-void-500", children: "0" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono text-bull", children: "+100" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-void-800 border border-void-700 rounded-xl p-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2", children: "AI Analysis" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-mono text-slate-300 leading-relaxed", children: sentiment.summary })
            ] })
          ] }),
          !loading && !sentiment && !error && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-void-600 font-mono text-xs", children: "No sentiment data" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-600", children: "Requires Ollama running" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono text-void-500 tracking-widest", children: [
            /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: symbol }),
            " — ",
            news.length,
            " articles"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => loadNews(symbol), className: "ml-auto text-[9px] font-mono text-void-500 hover:text-cyan-400 transition-colors", children: "REFRESH" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
          loading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }) }),
          error && !loading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("div", { className: "bg-bear-dim border border-bear/20 rounded-xl px-6 py-4 text-bear font-mono text-sm", children: error }) }),
          !loading && !error && news.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-void-600 font-display text-xl italic", children: "No news found" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-600", children: "Try a different symbol" })
          ] }),
          !loading && !error && news.length > 0 && /* @__PURE__ */ jsx("div", { className: "divide-y divide-void-800", children: news.map((item, i) => /* @__PURE__ */ jsxs(
            "a",
            {
              href: item.link,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "block px-5 py-3.5 hover:bg-void-800/50 transition-colors group",
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-200 font-sans leading-snug group-hover:text-cyan-300 transition-colors mb-1.5", children: item.title }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  item.source && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-cyan-400/70", children: item.source }),
                  item.pubDate && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-void-500", children: timeAgo(item.pubDate) })
                ] })
              ]
            },
            i
          )) })
        ] })
      ] })
    ] })
  ] });
}
const COLORS = ["#06b6d4", "#22c55e", "#3b82f6", "#f43f5e", "#a3e635", "#f59e0b"];
function CompareView({ wallet }) {
  const [symbols, setSymbols] = useState(["AAPL", "NVDA", "MSFT"]);
  const [input, setInput] = useState(""), [period, setPeriod] = useState("6mo");
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const compare = async () => {
    if (symbols.length < 2) return;
    setLoading(true);
    const r = await fetch(`/api/compare?symbols=${symbols.join(",")}&period=${period}`);
    const d = await r.json();
    setData(d.data ?? []);
    setLoading(false);
    const dm = /* @__PURE__ */ new Map();
    for (const item of d.data ?? []) {
      if (item.error) continue;
      for (const pt of item.normalized) {
        if (!dm.has(pt.date)) dm.set(pt.date, { date: pt.date });
        dm.get(pt.date)[item.symbol] = pt.value;
      }
    }
    setChartData(Array.from(dm.values()).sort((a, b) => a.date.localeCompare(b.date)));
  };
  function CTip2({ active, payload, label }) {
    if (!active || !Array.isArray(payload) || !payload.length) return null;
    return /* @__PURE__ */ jsxs("div", { className: "bg-void-900 border border-void-600 rounded p-2 text-[10px] font-mono shadow-panel", children: [
      /* @__PURE__ */ jsx("p", { className: "text-cyan-400 mb-1", children: String(label) }),
      payload.map((p) => /* @__PURE__ */ jsxs("p", { style: { color: p.color }, children: [
        p.name,
        ": ",
        p.value >= 0 ? "+" : "",
        p.value.toFixed(2),
        "%"
      ] }, p.name))
    ] });
  }
  const ok = data.filter((d) => !d.error);
  return /* @__PURE__ */ jsxs(DashboardLayout, { active: "/dashboard/compare", wallet, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex-wrap", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-cyan-400 tracking-widest font-semibold", children: "COMPARE" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 flex-wrap", children: symbols.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono", style: { borderColor: COLORS[i] + "60", backgroundColor: COLORS[i] + "12", color: COLORS[i] }, children: [
        s,
        /* @__PURE__ */ jsx("button", { onClick: () => setSymbols(symbols.filter((x) => x !== s)), className: "opacity-50 hover:opacity-100", children: "✕" })
      ] }, s)) }),
      symbols.length < 6 && /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsx("input", { value: input, onChange: (e) => setInput(e.target.value.toUpperCase()), placeholder: "Add...", onKeyDown: (e) => {
          if (e.key === "Enter" && input.trim() && !symbols.includes(input.trim())) {
            setSymbols([...symbols, input.trim()]);
            setInput("");
          }
        }, className: "bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 text-[10px] font-mono text-cyan-300 placeholder-void-500 w-24 focus:outline-none focus:border-cyan-500/40 uppercase" }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          if (input.trim() && !symbols.includes(input)) {
            setSymbols([...symbols, input]);
            setInput("");
          }
        }, className: "px-2 py-1.5 bg-void-800 border border-void-700 rounded-lg text-[9px] font-mono text-void-500 hover:text-slate-400 transition-colors", children: "ADD" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: ["1mo", "3mo", "6mo", "1y", "2y"].map((p) => /* @__PURE__ */ jsx("button", { onClick: () => setPeriod(p), className: `px-2 py-1 text-[9px] font-mono rounded transition-colors ${period === p ? "bg-void-700 text-cyan-400" : "text-void-500 hover:text-slate-400"}`, children: p.toUpperCase() }, p)) }),
      /* @__PURE__ */ jsx("button", { onClick: compare, disabled: symbols.length < 2 || loading, className: "px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors", children: loading ? "LOADING..." : "COMPARE" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col p-2 md:p-4 gap-3 md:gap-4 overflow-hidden min-h-0", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }) }),
      !loading && chartData.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2", children: "Normalized Return (% from period start)" }),
          /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: chartData, margin: { top: 4, right: 8, bottom: 0, left: 0 }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#0d1120", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: { fontSize: 9, fontFamily: "JetBrains Mono", fill: "#1a2238" }, tickLine: false, axisLine: false, tickFormatter: (v) => v.slice(5), interval: Math.floor(chartData.length / 7) }),
            /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 9, fontFamily: "JetBrains Mono", fill: "#1a2238" }, tickLine: false, axisLine: false, width: 44, tickFormatter: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}%` }),
            /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CTip2, {}) }),
            /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 10, fontFamily: "JetBrains Mono" } }),
            ok.map((d, i) => /* @__PURE__ */ jsx(Line, { dataKey: d.symbol, stroke: COLORS[i], strokeWidth: 1.5, dot: false, connectNulls: true }, d.symbol))
          ] }) })
        ] }),
        ok.length > 0 && /* @__PURE__ */ jsx("div", { className: "shrink-0 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono min-w-[500px]", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-void-700", children: ["SYMBOL", "NAME", "CURRENT", "PERIOD RETURN", "DAY %"].map((h) => /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2 text-[9px] text-void-500 tracking-widest", children: h }, h)) }) }),
          /* @__PURE__ */ jsx("tbody", { children: ok.map((d, i) => {
            const ret = d.normalized.at(-1)?.value ?? 0, day = (d.quote?.regularMarketChangePercent ?? 0) * 100;
            return /* @__PURE__ */ jsxs("tr", { className: "border-b border-void-800 hover:bg-void-800/30 transition-colors", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-2", style: { color: COLORS[i] }, children: /* @__PURE__ */ jsx("span", { className: "font-semibold", children: d.symbol }) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-2 text-slate-400 text-[10px] max-w-[160px] truncate", children: d.quote?.shortName }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 text-slate-200", children: [
                "$",
                d.quote?.regularMarketPrice?.toFixed(2)
              ] }),
              /* @__PURE__ */ jsxs("td", { className: `px-4 py-2 font-semibold ${ret >= 0 ? "text-bull" : "text-bear"}`, children: [
                ret >= 0 ? "+" : "",
                ret.toFixed(2),
                "%"
              ] }),
              /* @__PURE__ */ jsxs("td", { className: `px-4 py-2 ${day >= 0 ? "text-bull" : "text-bear"}`, children: [
                day >= 0 ? "+" : "",
                day.toFixed(2),
                "%"
              ] })
            ] }, d.symbol);
          }) })
        ] }) })
      ] }),
      !loading && chartData.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-void-600 font-display text-2xl italic", children: "Multi-Symbol Comparison" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-600", children: "Add symbols above and click COMPARE" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-2 justify-center", children: [["AAPL", "NVDA", "MSFT"], ["BTC-USD", "ETH-USD", "SOL-USD"], ["SPY", "QQQ", "IWM"]].map((g) => /* @__PURE__ */ jsx("button", { onClick: () => setSymbols(g), className: "px-3 py-1.5 bg-void-800 border border-void-700 rounded text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors", children: g.join(" vs ") }, g.join())) })
      ] })
    ] })
  ] });
}

export { CompareView as C, NewsView as N, PortfolioView as P, ScreenerView as S, WatchlistView as W };
