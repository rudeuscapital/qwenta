/* empty css                                   */
import { f as createComponent, j as renderComponent, r as renderTemplate, i as createAstro } from '../chunks/astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_NJ7nk25z.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Line, LineChart, ReferenceLine, Bar, BarChart } from 'recharts';
import { D as DashboardLayout } from '../chunks/Layout_BYqzR0aw.mjs';
import { a as getSessionFromRequest } from '../chunks/auth_qwzUI1TQ.mjs';
export { renderers } from '../renderers.mjs';

const PERIODS = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y"];
const INTERVALS = [{ val: "1h", label: "1H" }, { val: "4h", label: "4H" }, { val: "1d", label: "D" }, { val: "1wk", label: "W" }];
const POPULAR = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN", "BTC-USD", "ETH-USD", "SPY"];
const TICK = { fontSize: 9, fontFamily: "JetBrains Mono", fill: "#1a2238" };
const GRID = { strokeDasharray: "3 3", stroke: "#0d1120", vertical: false };
const f2 = (n, d = 2) => n != null ? n.toFixed(d) : "—";
const fB = (n) => !n ? "—" : n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${(n / 1e6).toFixed(0)}M`;
const fV = (n) => !n ? "—" : n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`;
function CTip({ active, payload, label }) {
  if (!active || !Array.isArray(payload) || !payload.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "bg-void-900 border border-void-600 rounded-lg p-2 shadow-panel text-[10px] font-mono", children: [
    /* @__PURE__ */ jsx("p", { className: "text-cyan-400 mb-1", children: String(label) }),
    payload.map((p) => /* @__PURE__ */ jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      typeof p.value === "number" ? p.value.toFixed(3) : p.value
    ] }, p.name))
  ] });
}
function TradingView({ wallet }) {
  const [sym, setSym] = useState("AAPL");
  const [inputSym, setInputSym] = useState("AAPL");
  const [period, setPeriod] = useState("6mo");
  const [interval, setInterval] = useState("1d");
  const [chartTab, setChartTab] = useState("price");
  const [showBB, setShowBB] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);
  const chatBottom = useRef(null);
  const [sideTab, setSideTab] = useState("chat");
  const [news, setNews] = useState([]);
  const [newsSentiment, setNewsSentiment] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const load = useCallback(async (s, p, iv) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/stock?symbol=${s}&period=${p}&interval=${iv}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setChartData(d.chartData);
      setQuote(d.quote);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load(sym, period, interval);
  }, [sym, period, interval, load]);
  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streaming]);
  useEffect(() => {
    setNewsLoading(true);
    fetch(`/api/news?symbol=${sym}`).then((r) => r.json()).then((d) => {
      setNews(d.news ?? []);
      setNewsSentiment(d.sentiment ?? null);
    }).catch(() => {
      setNews([]);
      setNewsSentiment(null);
    }).finally(() => setNewsLoading(false));
  }, [sym]);
  const newsTimeAgo = (ds) => {
    try {
      const m = Math.floor((Date.now() - new Date(ds).getTime()) / 6e4);
      return m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m / 60)}h` : `${Math.floor(m / 1440)}d`;
    } catch {
      return "";
    }
  };
  const sendChat = useCallback(async (text) => {
    if (!text.trim() || streaming) return;
    const um = { id: crypto.randomUUID(), role: "user", content: text };
    setMsgs((p) => [...p, um]);
    setChatInput("");
    setStreaming(true);
    const aid = crypto.randomUUID();
    setMsgs((p) => [...p, { id: aid, role: "assistant", content: "" }]);
    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...msgs, um].map(({ role, content }) => ({ role, content })), symbol: sym, chartData: chartData.slice(-90), quote }),
        signal: abortRef.current.signal
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader(), dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value, { stream: true }).split("\n").filter(Boolean)) {
          try {
            const j = JSON.parse(line);
            if (j.message?.content) {
              acc += j.message.content;
              setMsgs((p) => p.map((m) => m.id === aid ? { ...m, content: acc } : m));
            }
          } catch {
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") setMsgs((p) => p.map((m) => m.id === aid ? { ...m, content: "⚠️ Ollama not running. Start with: `ollama run qwen2.5`" } : m));
    } finally {
      setStreaming(false);
    }
  }, [msgs, streaming, sym, chartData, quote]);
  const q = quote, latest = chartData.at(-1);
  const isPos = (q?.regularMarketChangePercent ?? 0) >= 0;
  const priceRange = chartData.length > 0 ? { min: Math.min(...chartData.map((d) => d.low)) * 0.995, max: Math.max(...chartData.map((d) => d.high)) * 1.005 } : null;
  return /* @__PURE__ */ jsxs(DashboardLayout, { active: "/dashboard", wallet, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-3 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 overflow-x-auto", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        const s = inputSym.trim().toUpperCase();
        if (s) setSym(s);
      }, className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: inputSym,
            onChange: (e) => setInputSym(e.target.value.toUpperCase()),
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
            setSym(s);
            setInputSym(s);
          },
          className: `px-2 py-1 text-[10px] font-mono rounded whitespace-nowrap transition-colors ${sym === s ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25" : "text-void-500 hover:text-slate-400"}`,
          children: s
        },
        s
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2 shrink-0", children: [
        sym && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("a", { href: `/api/export?symbol=${sym}&period=${period}&format=csv`, className: "px-2 py-1 text-[9px] font-mono text-void-500 hover:text-cyan-400 border border-void-700 rounded transition-colors", children: "CSV" }),
          /* @__PURE__ */ jsx("a", { href: `/api/export?symbol=${sym}&period=${period}&format=xlsx`, className: "px-2 py-1 text-[9px] font-mono text-void-500 hover:text-cyan-400 border border-void-700 rounded transition-colors", children: "XLSX" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: INTERVALS.map((iv) => /* @__PURE__ */ jsx("button", { onClick: () => setInterval(iv.val), className: `px-2 py-1 text-[9px] font-mono rounded ${interval === iv.val ? "bg-void-700 text-cyan-400" : "text-void-500 hover:text-slate-400"}`, children: iv.label }, iv.val)) }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: PERIODS.map((p) => /* @__PURE__ */ jsx("button", { onClick: () => setPeriod(p), className: `px-2 py-1 text-[9px] font-mono rounded ${period === p ? "bg-void-700 text-cyan-400" : "text-void-500 hover:text-slate-400"}`, children: p.toUpperCase() }, p)) })
      ] })
    ] }),
    q && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-5 py-2 border-b border-void-700 bg-void-900/50 shrink-0 overflow-x-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
        /* @__PURE__ */ jsx("span", { className: "text-white font-display text-xl italic", children: sym }),
        /* @__PURE__ */ jsx("span", { className: "text-void-500 font-mono text-[10px] ml-2", children: q.shortName })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "shrink-0", children: [
        /* @__PURE__ */ jsxs("span", { className: `text-2xl font-mono font-semibold ${isPos ? "text-bull" : "text-bear"}`, children: [
          "$",
          f2(q.regularMarketPrice)
        ] }),
        /* @__PURE__ */ jsxs("span", { className: `ml-2 text-xs font-mono ${isPos ? "text-bull" : "text-bear"}`, children: [
          isPos ? "+" : "",
          f2(q.regularMarketChange),
          " (",
          isPos ? "+" : "",
          (q.regularMarketChangePercent * 100).toFixed(2),
          "%)"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-5 w-px bg-void-700 shrink-0" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto", children: [
        ["Mkt Cap", fB(q.marketCap), ""],
        ["P/E", f2(q.trailingPE), ""],
        ["Beta", f2(q.beta), ""],
        ["Vol", fV(q.regularMarketVolume), ""],
        ["52W H", `$${f2(q.fiftyTwoWeekHigh)}`, "text-bull"],
        ["52W L", `$${f2(q.fiftyTwoWeekLow)}`, "text-bear"],
        ["RSI", f2(latest?.rsi), latest?.rsi > 70 ? "text-bear" : latest?.rsi < 30 ? "text-bull" : "text-cyan-400"]
      ].map(([l, v, c]) => /* @__PURE__ */ jsxs("div", { className: "bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 shrink-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-void-500 uppercase tracking-widest", children: l }),
        /* @__PURE__ */ jsx("p", { className: `text-xs font-mono font-medium ${c || "text-slate-200"}`, children: v })
      ] }, l)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden min-h-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col p-3 gap-2 min-w-0 overflow-hidden", children: [
        loading && /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }) }),
        error && !loading && /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "bg-bear-dim border border-bear/20 rounded-xl px-6 py-4 text-bear font-mono text-sm", children: [
          "⚠ ",
          error
        ] }) }),
        !loading && !error && chartData.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
            ["price", "rsi", "macd", "volume"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setChartTab(t), className: `text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded transition-colors ${chartTab === t ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-void-500 hover:text-slate-400"}`, children: t }, t)),
            chartTab === "price" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "h-3 w-px bg-void-700" }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer text-[9px] font-mono text-void-500 hover:text-slate-400", children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: showSMA, onChange: (e) => setShowSMA(e.target.checked), className: "accent-cyan-500 w-3 h-3" }),
                "SMA"
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer text-[9px] font-mono text-void-500 hover:text-slate-400", children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", checked: showBB, onChange: (e) => setShowBB(e.target.checked), className: "accent-cyan-500 w-3 h-3" }),
                "BB"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "ml-auto text-[9px] font-mono text-void-600", children: [
              chartData.length,
              " bars · ",
              chartData.at(0)?.date,
              " → ",
              chartData.at(-1)?.date
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0", children: [
            chartTab === "price" && priceRange && /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 0, left: 0 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { ...GRID }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: TICK, tickLine: false, axisLine: false, tickFormatter: (v) => v.slice(5), interval: Math.floor(chartData.length / 7) }),
              /* @__PURE__ */ jsx(YAxis, { domain: [priceRange.min, priceRange.max], tick: TICK, tickLine: false, axisLine: false, width: 58, tickFormatter: (v) => `$${v.toFixed(0)}` }),
              /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CTip, {}) }),
              showBB && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Area, { dataKey: "bbUpper", stroke: "#06b6d415", strokeWidth: 1, fill: "#06b6d406", dot: false, connectNulls: true, name: "BB↑" }),
                /* @__PURE__ */ jsx(Line, { dataKey: "bbLower", stroke: "#06b6d415", strokeWidth: 1, dot: false, connectNulls: true, name: "BB↓" }),
                /* @__PURE__ */ jsx(Line, { dataKey: "bbMid", stroke: "#06b6d425", strokeWidth: 0.5, strokeDasharray: "4 3", dot: false, connectNulls: true, name: "BB Mid" })
              ] }),
              showSMA && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Line, { dataKey: "sma20", stroke: "#06b6d4", strokeWidth: 1, dot: false, connectNulls: true, name: "SMA20" }),
                /* @__PURE__ */ jsx(Line, { dataKey: "sma50", stroke: "#a3e635", strokeWidth: 1, dot: false, connectNulls: true, name: "SMA50" })
              ] }),
              /* @__PURE__ */ jsx(Line, { dataKey: "close", stroke: isPos ? "#22c55e" : "#f43f5e", strokeWidth: 1.5, dot: false, name: "Close" })
            ] }) }),
            chartTab === "rsi" && /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: chartData, margin: { top: 4, right: 8, bottom: 0, left: 0 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { ...GRID }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: TICK, tickLine: false, axisLine: false, tickFormatter: (v) => v.slice(5), interval: Math.floor(chartData.length / 7) }),
              /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], tick: TICK, tickLine: false, axisLine: false, width: 28 }),
              /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CTip, {}) }),
              /* @__PURE__ */ jsx(ReferenceLine, { y: 70, stroke: "#f43f5e", strokeDasharray: "3 2", strokeWidth: 0.8 }),
              /* @__PURE__ */ jsx(ReferenceLine, { y: 30, stroke: "#22c55e", strokeDasharray: "3 2", strokeWidth: 0.8 }),
              /* @__PURE__ */ jsx(Line, { dataKey: "rsi", stroke: "#06b6d4", strokeWidth: 1.5, dot: false, connectNulls: true, name: "RSI(14)" })
            ] }) }),
            chartTab === "macd" && /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 0, left: 0 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { ...GRID }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: TICK, tickLine: false, axisLine: false, tickFormatter: (v) => v.slice(5), interval: Math.floor(chartData.length / 7) }),
              /* @__PURE__ */ jsx(YAxis, { tick: TICK, tickLine: false, axisLine: false, width: 44 }),
              /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CTip, {}) }),
              /* @__PURE__ */ jsx(ReferenceLine, { y: 0, stroke: "#232f4b", strokeWidth: 1 }),
              /* @__PURE__ */ jsx(Bar, { dataKey: "macdHist", name: "Histogram", fill: "#06b6d440", stroke: "#06b6d460" }),
              /* @__PURE__ */ jsx(Line, { dataKey: "macd", stroke: "#22c55e", strokeWidth: 1.5, dot: false, connectNulls: true, name: "MACD" }),
              /* @__PURE__ */ jsx(Line, { dataKey: "macdSignal", stroke: "#f43f5e", strokeWidth: 1.5, dot: false, connectNulls: true, name: "Signal" })
            ] }) }),
            chartTab === "volume" && /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: chartData, margin: { top: 4, right: 8, bottom: 0, left: 0 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { ...GRID }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: TICK, tickLine: false, axisLine: false, tickFormatter: (v) => v.slice(5), interval: Math.floor(chartData.length / 7) }),
              /* @__PURE__ */ jsx(YAxis, { tick: TICK, tickLine: false, axisLine: false, width: 50, tickFormatter: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K` }),
              /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CTip, {}) }),
              /* @__PURE__ */ jsx(Bar, { dataKey: "volume", name: "Volume", fill: "#06b6d420", stroke: "#06b6d440" })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-72 xl:w-80 border-l border-void-700 flex flex-col shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex border-b border-void-700 shrink-0", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setSideTab("chat"), className: `flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-semibold tracking-widest transition-colors ${sideTab === "chat" ? "text-cyan-400 bg-void-800/50 border-b-2 border-cyan-400" : "text-void-500 hover:text-slate-400"}`, children: [
            /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${sideTab === "chat" ? "bg-cyan-400 animate-pulse" : "bg-void-600"}` }),
            "QWENAI"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setSideTab("news"), className: `flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-semibold tracking-widest transition-colors ${sideTab === "news" ? "text-cyan-400 bg-void-800/50 border-b-2 border-cyan-400" : "text-void-500 hover:text-slate-400"}`, children: [
            "NEWS",
            news.length > 0 && /* @__PURE__ */ jsx("span", { className: "text-[8px] bg-void-700 px-1 rounded text-void-400", children: news.length })
          ] })
        ] }),
        sideTab === "chat" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-1.5 border-b border-void-700 shrink-0", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-void-500", children: [
              "Context: ",
              /* @__PURE__ */ jsx("span", { className: "text-cyan-400", children: sym })
            ] }),
            msgs.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => setMsgs([]), className: "text-[9px] font-mono text-void-500 hover:text-bear transition-colors", children: "CLEAR" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-3 space-y-3 min-h-0", children: [
            msgs.length === 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono text-void-500", children: [
                "Ask QwenAI about ",
                /* @__PURE__ */ jsx("span", { className: "text-cyan-400", children: sym }),
                " — with live market context."
              ] }),
              ["Analyze current trend", "RSI & MACD signals?", "Support & resistance?", "Best entry strategy?"].map((q2) => /* @__PURE__ */ jsxs("button", { onClick: () => sendChat(q2), className: "w-full text-left text-[10px] font-mono px-3 py-1.5 bg-void-800 border border-void-700 rounded hover:border-cyan-500/30 text-slate-500 hover:text-cyan-300 transition-all", children: [
                "› ",
                q2
              ] }, q2))
            ] }),
            msgs.map((m) => /* @__PURE__ */ jsxs("div", { className: `flex gap-2 animate-fade-in ${m.role === "user" ? "flex-row-reverse" : ""}`, children: [
              /* @__PURE__ */ jsx("div", { className: `shrink-0 w-5 h-5 rounded flex items-center justify-center text-[8px] font-mono font-bold ${m.role === "user" ? "bg-cyan-500 text-void-900" : "bg-void-700 text-cyan-400 border border-void-600"}`, children: m.role === "user" ? "U" : "AI" }),
              /* @__PURE__ */ jsx("div", { className: `max-w-[88%] rounded-lg px-2.5 py-2 text-[11px] font-mono leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100" : "bg-void-800 border border-void-700 text-slate-300"}`, children: m.content || streaming && m.role === "assistant" && /* @__PURE__ */ jsx("span", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }) })
            ] }, m.id)),
            /* @__PURE__ */ jsx("div", { ref: chatBottom })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-2.5 border-t border-void-700 shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: chatInput,
                onChange: (e) => setChatInput(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChat(chatInput);
                  }
                },
                placeholder: "Ask QwenAI...",
                rows: 2,
                disabled: streaming,
                className: "flex-1 bg-void-800 border border-void-700 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-200 placeholder-void-500 resize-none focus:outline-none focus:border-cyan-500/30 transition-colors disabled:opacity-50"
              }
            ),
            streaming ? /* @__PURE__ */ jsx("button", { onClick: () => {
              abortRef.current?.abort();
              setStreaming(false);
            }, className: "px-2 self-end py-2 bg-bear-dim border border-bear/30 rounded-lg text-bear text-[10px] hover:bg-bear/20 transition-colors", children: "■" }) : /* @__PURE__ */ jsx("button", { onClick: () => sendChat(chatInput), disabled: !chatInput.trim(), className: "px-2 self-end py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] hover:bg-cyan-500/20 transition-colors disabled:opacity-30", children: "▶" })
          ] }) })
        ] }),
        sideTab === "news" && /* @__PURE__ */ jsxs(Fragment, { children: [
          newsSentiment && /* @__PURE__ */ jsxs("div", { className: `mx-3 mt-3 rounded-lg border p-2.5 ${newsSentiment.sentiment === "bullish" ? "bg-bull/10 border-bull/30" : newsSentiment.sentiment === "bearish" ? "bg-bear/10 border-bear/30" : "bg-cyan-500/10 border-cyan-500/30"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: `text-[10px] font-mono font-bold uppercase tracking-widest ${newsSentiment.sentiment === "bullish" ? "text-bull" : newsSentiment.sentiment === "bearish" ? "text-bear" : "text-cyan-400"}`, children: newsSentiment.sentiment }),
              /* @__PURE__ */ jsxs("span", { className: `text-sm font-mono font-bold ${newsSentiment.score > 20 ? "text-bull" : newsSentiment.score < -20 ? "text-bear" : "text-cyan-400"}`, children: [
                newsSentiment.score > 0 ? "+" : "",
                newsSentiment.score
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-slate-400 mt-1 leading-relaxed", children: newsSentiment.summary })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto min-h-0", children: [
            newsLoading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-dot", style: { animationDelay: `${i * 0.16}s` } }, i)) }) }),
            !newsLoading && news.length === 0 && /* @__PURE__ */ jsxs("p", { className: "text-center text-[10px] font-mono text-void-500 py-8", children: [
              "No news for ",
              sym
            ] }),
            !newsLoading && news.map((item, i) => /* @__PURE__ */ jsxs(
              "a",
              {
                href: item.link,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "block px-3 py-2.5 border-b border-void-800 hover:bg-void-800/50 transition-colors group",
                children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-300 leading-snug group-hover:text-cyan-300 transition-colors", children: item.title }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                    item.source && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-cyan-400/60", children: item.source }),
                    item.pubDate && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-void-500", children: newsTimeAgo(item.pubDate) })
                  ] })
                ]
              },
              i
            ))
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-2.5 border-t border-void-700 shrink-0", children: /* @__PURE__ */ jsx("a", { href: "/dashboard/news", className: "block w-full text-center py-1.5 text-[9px] font-mono text-void-500 hover:text-cyan-400 border border-void-700 rounded-lg hover:border-cyan-500/30 transition-all", children: "VIEW FULL NEWS PAGE" }) })
        ] })
      ] })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = await getSessionFromRequest(Astro2.request);
  if (!user) return Astro2.redirect("/login");
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Dashboard", "fullscreen": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "TradingView", TradingView, { "wallet": user.wallet, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/project/qwenta/src/components/Dashboard/TradingView", "client:component-export": "default" })} ` })}`;
}, "D:/project/qwenta/src/pages/dashboard/index.astro", void 0);

const $$file = "D:/project/qwenta/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
