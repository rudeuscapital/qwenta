/* empty css                                      */
import { f as createComponent, j as renderComponent, r as renderTemplate } from '../../chunks/astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import { $ as $$DocsLayout } from '../../chunks/DocsLayout_DglTnE4M.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../../renderers.mjs';

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/stock",
    tag: "Market Data",
    summary: "Get stock data with indicators",
    description: "Fetches OHLCV data from Yahoo Finance and computes RSI, MACD, SMA, EMA, Bollinger Bands for a given symbol.",
    params: [
      { name: "symbol", in: "query", type: "string", required: true, description: "Ticker symbol", example: "AAPL" },
      { name: "period", in: "query", type: "string", required: false, description: "Time period: 1d|5d|1mo|3mo|6mo|1y|2y", example: "6mo" },
      { name: "interval", in: "query", type: "string", required: false, description: "Bar interval: 1h|4h|1d|1wk", example: "1d" }
    ],
    response: `{ "quote": { "symbol":"AAPL", "shortName":"Apple Inc.", "regularMarketPrice":185.42, "regularMarketChangePercent":0.0124, ... }, "chartData": [{ "date":"2024-01-02","open":185.0,"high":186.1,"low":184.5,"close":185.4,"volume":45000000,"sma20":182.1,"sma50":178.4,"rsi":58.2,"macd":1.23,"macdSignal":1.10,"bbUpper":190.1,"bbLower":175.3 }] }`
  },
  {
    method: "POST",
    path: "/api/chat",
    tag: "AI",
    summary: "Stream AI analysis",
    description: "Sends chat messages to Ollama Qwen. Optionally include symbol, chartData, and quote for contextual market analysis. Response is NDJSON stream.",
    params: [
      { name: "messages", in: "body", type: "array", required: true, description: 'Array of {role:"user"|"assistant", content:string}', example: '[{"role":"user","content":"Analyze AAPL trend"}]' },
      { name: "symbol", in: "body", type: "string", required: false, description: "Symbol for market context", example: "AAPL" },
      { name: "chartData", in: "body", type: "array", required: false, description: "Chart data array (last 90 bars recommended)" },
      { name: "quote", in: "body", type: "object", required: false, description: "Quote summary object" }
    ],
    response: `{"model":"qwen2.5","message":{"role":"assistant","content":"Based on current RSI of 58.2..."},"done":false}
{"done":true}`
  },
  {
    method: "GET",
    path: "/api/watchlist",
    tag: "Watchlist",
    summary: "List watchlists or get items",
    description: "Without id: returns all watchlists. With id: returns watchlist with items and live prices.",
    params: [{ name: "id", in: "query", type: "integer", required: false, description: "Watchlist ID to fetch items for", example: "1" }],
    response: `[{"id":1,"name":"Tech Stocks","created_at":"..."}]`
  },
  {
    method: "POST",
    path: "/api/watchlist",
    tag: "Watchlist",
    summary: "Watchlist CRUD operations",
    description: "Actions: create_list, add (symbol), remove (item), delete_list",
    params: [{ name: "action", in: "body", type: "string", required: true, description: "create_list|add|remove|delete_list", example: "add" }, { name: "watchlist_id", in: "body", type: "integer", required: false, description: "Required for add action" }, { name: "symbol", in: "body", type: "string", required: false, description: "Required for add action", example: "NVDA" }, { name: "item_id", in: "body", type: "integer", required: false, description: "Required for remove action" }],
    response: `{"id":5,"watchlist_id":1,"symbol":"NVDA","notes":"","added_at":"..."}`
  },
  {
    method: "GET",
    path: "/api/portfolio",
    tag: "Portfolio",
    summary: "List portfolios or get with P&L",
    description: "Without id: returns portfolio list. With id: returns positions with real-time P&L, transactions, and summary.",
    params: [{ name: "id", in: "query", type: "integer", required: false, description: "Portfolio ID" }],
    response: `{"portfolio":{...},"positions":[{"symbol":"AAPL","shares":10,"avg_cost":150,"currentPrice":185.4,"unrealizedPnl":354,"unrealizedPct":23.6}],"summary":{"totalValue":1854,"totalPnl":354,"totalPnlPct":23.6}}`
  },
  {
    method: "POST",
    path: "/api/portfolio",
    tag: "Portfolio",
    summary: "Portfolio CRUD + record trades",
    description: "Actions: create, buy, sell, delete. Buy/sell automatically updates positions with weighted avg cost.",
    params: [{ name: "action", in: "body", type: "string", required: true, description: "create|buy|sell|delete" }, { name: "portfolio_id", in: "body", type: "integer", required: false }, { name: "symbol", in: "body", type: "string", required: false, example: "AAPL" }, { name: "shares", in: "body", type: "number", required: false, example: "100" }, { name: "price", in: "body", type: "number", required: false, example: "185.40" }],
    response: `{"success":true}`
  },
  {
    method: "POST",
    path: "/api/screener",
    tag: "Screener",
    summary: "Screen stocks by indicators",
    description: "Runs technical screening on universe of 23 default symbols. Apply filter combinations to find setups.",
    params: [{ name: "filters", in: "body", type: "object", required: true, description: "Filter object", example: '{"rsiMin":0,"rsiMax":30,"macdBullish":true}' }],
    response: `{"results":[{"symbol":"NVDA","price":450.2,"rsi":28.4,"macdBullish":true,"smaCross":true,...}],"total":3}`
  },
  {
    method: "GET",
    path: "/api/compare",
    tag: "Compare",
    summary: "Compare multiple symbols",
    description: "Fetches data for 2-6 symbols and normalizes prices to % return from period start for comparison.",
    params: [{ name: "symbols", in: "query", type: "string", required: true, description: "Comma-separated symbols", example: "AAPL,NVDA,MSFT" }, { name: "period", in: "query", type: "string", required: false, example: "6mo" }],
    response: `{"symbols":["AAPL","NVDA"],"data":[{"symbol":"AAPL","normalized":[{"date":"2024-01-02","value":0},{"date":"2024-01-03","value":1.2}],...}]}`
  },
  {
    method: "GET",
    path: "/api/export",
    tag: "Export",
    summary: "Export OHLCV + indicators as CSV/XLSX",
    description: "Downloads full price history with all computed indicators as CSV or multi-sheet Excel file.",
    params: [{ name: "symbol", in: "query", type: "string", required: true, example: "AAPL" }, { name: "period", in: "query", type: "string", required: false, example: "6mo" }, { name: "format", in: "query", type: "string", required: false, description: "csv|xlsx", example: "xlsx" }],
    response: `Binary file download (CSV or XLSX)`
  },
  {
    method: "GET",
    path: "/api/auth",
    tag: "Auth",
    summary: "Generate SIWE nonce",
    params: [{ name: "action", in: "query", type: "string", required: true, description: "Must be: nonce" }],
    description: "Returns a cryptographic nonce for constructing the Sign-In with Ethereum message.",
    response: `{"nonce":"abc123xyz"}`
  },
  {
    method: "POST",
    path: "/api/auth",
    tag: "Auth",
    summary: "Verify wallet signature & create session",
    description: "Verifies SIWE signature. On success, sets HttpOnly session cookie. Creates user record if first login.",
    params: [{ name: "address", in: "body", type: "string", required: true, description: "Wallet address (checksummed)" }, { name: "message", in: "body", type: "string", required: true, description: "SIWE message string" }, { name: "signature", in: "body", type: "string", required: true, description: "EIP-191 signature" }],
    response: `{"success":true,"user":{"wallet":"0x...","tier":"enterprise"}}`
  },
  {
    method: "DELETE",
    path: "/api/auth",
    tag: "Auth",
    summary: "Logout — clear session cookie",
    description: "Clears the session cookie. No body required.",
    params: [],
    response: `{"success":true}`
  }
];
const METHOD_COLORS = {
  GET: "bg-bull/10 text-bull border-bull/30",
  POST: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  DELETE: "bg-bear/10 text-bear border-bear/30"
};
const TAGS = [...new Set(ENDPOINTS.map((e) => e.tag))];
function APIExplorer() {
  const [open, setOpen] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [tryOut, setTryOut] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const filtered = activeTag ? ENDPOINTS.filter((e) => e.tag === activeTag) : ENDPOINTS;
  const tryRequest = async (ep) => {
    setLoading(true);
    setResponse(null);
    try {
      const queryParams = ep.params?.filter((p) => p.in === "query").map((p) => `${p.name}=${encodeURIComponent(tryOut[p.name] || p.example || "")}`).join("&");
      const url = ep.path + (queryParams ? `?${queryParams}` : "");
      const bodyParams = ep.params?.filter((p) => p.in === "body");
      const body = bodyParams?.length ? JSON.stringify(Object.fromEntries(bodyParams.map((p) => [p.name, tryOut[p.name] || p.example]))) : void 0;
      const res = await fetch(url, { method: ep.method, headers: body ? { "Content-Type": "application/json" } : {}, body });
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text.slice(0, 500));
      }
    } catch (e) {
      setResponse(`Error: ${e.message}`);
    }
    setLoading(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "prose", children: [
    /* @__PURE__ */ jsx("h1", { children: "API Reference" }),
    /* @__PURE__ */ jsx("p", { children: "Qwenta exposes a RESTful API. All endpoints are server-rendered via Astro SSR. Authentication endpoints set HttpOnly cookies." }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap my-6 not-prose", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setActiveTag(null), className: `px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${!activeTag ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "text-slate-500 border-void-600 hover:text-slate-300"}`, children: "All" }),
      TAGS.map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setActiveTag(t === activeTag ? null : t), className: `px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${activeTag === t ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "text-slate-500 border-void-600 hover:text-slate-300"}`, children: t }, t))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "not-prose space-y-3", children: filtered.map((ep) => {
      const key = `${ep.method}${ep.path}`;
      const isOpen = open === key;
      return /* @__PURE__ */ jsxs("div", { className: `border rounded-xl overflow-hidden transition-all ${isOpen ? "border-cyan-500/30" : "border-void-600"}`, children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setOpen(isOpen ? null : key), className: "w-full flex items-center gap-3 px-5 py-3.5 bg-void-800/50 hover:bg-void-800 transition-colors text-left", children: [
          /* @__PURE__ */ jsx("span", { className: `px-2.5 py-0.5 rounded border text-[10px] font-mono font-semibold shrink-0 ${METHOD_COLORS[ep.method]}`, children: ep.method }),
          /* @__PURE__ */ jsx("code", { className: "text-slate-200 text-sm font-mono", children: ep.path }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-500 text-sm ml-2", children: ep.summary }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs px-2 py-0.5 bg-void-700 text-void-400 rounded font-mono", children: ep.tag }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-600 text-xs", children: isOpen ? "▲" : "▼" })
        ] }),
        isOpen && /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-t border-void-700 bg-void-900/50 space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: ep.description }),
          ep.params && ep.params.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-500 uppercase tracking-widest mb-3", children: "Parameters" }),
            /* @__PURE__ */ jsxs("table", { className: "w-full text-xs font-mono", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-void-700", children: ["Name", "In", "Type", "Req", "Description"].map((h) => /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-1.5 text-[9px] text-void-500 tracking-widest", children: h }, h)) }) }),
              /* @__PURE__ */ jsx("tbody", { children: ep.params.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-void-800", children: [
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-cyan-400 font-semibold", children: p.name }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-slate-500", children: p.in }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-slate-400", children: p.type }),
                /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: p.required ? /* @__PURE__ */ jsx("span", { className: "text-bear text-[9px]", children: "required" }) : /* @__PURE__ */ jsx("span", { className: "text-void-500 text-[9px]", children: "optional" }) }),
                /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-slate-500", children: [
                  p.description,
                  p.example && /* @__PURE__ */ jsxs("span", { className: "text-void-500 ml-1", children: [
                    "e.g. ",
                    /* @__PURE__ */ jsx("code", { className: "text-cyan-600", children: p.example })
                  ] })
                ] })
              ] }, p.name)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-500 uppercase tracking-widest mb-3", children: "Try It" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              ep.params?.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-mono text-slate-500 w-28 shrink-0", children: p.name }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: tryOut[p.name] || "",
                    onChange: (e) => setTryOut((o) => ({ ...o, [p.name]: e.target.value })),
                    placeholder: p.example || p.description,
                    className: "flex-1 bg-void-800 border border-void-700 rounded px-3 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30"
                  }
                )
              ] }, p.name)),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => tryRequest(ep),
                  disabled: loading,
                  className: "px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors",
                  children: loading ? "Sending..." : "▶ Execute"
                }
              )
            ] }),
            response && /* @__PURE__ */ jsx("pre", { className: "mt-3 p-3 bg-void-900 border border-void-700 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto max-h-48", children: response })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-void-500 uppercase tracking-widest mb-2", children: "Example Response" }),
            /* @__PURE__ */ jsx("pre", { className: "p-3 bg-void-900 border border-void-700 rounded-lg text-[10px] font-mono text-slate-500 overflow-x-auto", children: ep.response })
          ] })
        ] })
      ] }, key);
    }) })
  ] });
}

const $$Api = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "DocsLayout", $$DocsLayout, { "title": "API Reference" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "APIExplorer", APIExplorer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/project/qwenta/src/components/Docs/APIExplorer", "client:component-export": "default" })} ` })}`;
}, "D:/project/qwenta/src/pages/docs/api.astro", void 0);

const $$file = "D:/project/qwenta/src/pages/docs/api.astro";
const $$url = "/docs/api";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Api,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
