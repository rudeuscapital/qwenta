import { useState } from "react";

interface Endpoint {
  method: "GET"|"POST"|"DELETE";
  path: string;
  summary: string;
  description: string;
  params?: { name:string; in:"query"|"body"|"path"; type:string; required:boolean; description:string; example?:string }[];
  response: string;
  tag: string;
}

const ENDPOINTS: Endpoint[] = [
  { method:"GET", path:"/api/stock", tag:"Market Data", summary:"Get stock data with indicators",
    description:"Fetches OHLCV data from Yahoo Finance and computes RSI, MACD, SMA, EMA, Bollinger Bands for a given symbol.",
    params:[
      {name:"symbol",in:"query",type:"string",required:true,description:"Ticker symbol",example:"AAPL"},
      {name:"period",in:"query",type:"string",required:false,description:"Time period: 1d|5d|1mo|3mo|6mo|1y|2y",example:"6mo"},
      {name:"interval",in:"query",type:"string",required:false,description:"Bar interval: 1h|4h|1d|1wk",example:"1d"},
    ],
    response:`{ "quote": { "symbol":"AAPL", "shortName":"Apple Inc.", "regularMarketPrice":185.42, "regularMarketChangePercent":0.0124, ... }, "chartData": [{ "date":"2024-01-02","open":185.0,"high":186.1,"low":184.5,"close":185.4,"volume":45000000,"sma20":182.1,"sma50":178.4,"rsi":58.2,"macd":1.23,"macdSignal":1.10,"bbUpper":190.1,"bbLower":175.3 }] }` },

  { method:"POST", path:"/api/chat", tag:"AI", summary:"Stream AI analysis",
    description:"Sends chat messages to Ollama Qwen. Optionally include symbol, chartData, and quote for contextual market analysis. Response is NDJSON stream.",
    params:[
      {name:"messages",in:"body",type:"array",required:true,description:'Array of {role:"user"|"assistant", content:string}',example:'[{"role":"user","content":"Analyze AAPL trend"}]'},
      {name:"symbol",in:"body",type:"string",required:false,description:"Symbol for market context",example:"AAPL"},
      {name:"chartData",in:"body",type:"array",required:false,description:"Chart data array (last 90 bars recommended)"},
      {name:"quote",in:"body",type:"object",required:false,description:"Quote summary object"},
    ],
    response:`{"model":"qwen2.5","message":{"role":"assistant","content":"Based on current RSI of 58.2..."},"done":false}\n{"done":true}` },

  { method:"GET", path:"/api/watchlist", tag:"Watchlist", summary:"List watchlists or get items",
    description:"Without id: returns all watchlists. With id: returns watchlist with items and live prices.",
    params:[{name:"id",in:"query",type:"integer",required:false,description:"Watchlist ID to fetch items for",example:"1"}],
    response:`[{"id":1,"name":"Tech Stocks","created_at":"..."}]` },

  { method:"POST", path:"/api/watchlist", tag:"Watchlist", summary:"Watchlist CRUD operations",
    description:"Actions: create_list, add (symbol), remove (item), delete_list",
    params:[{name:"action",in:"body",type:"string",required:true,description:"create_list|add|remove|delete_list",example:"add"},{name:"watchlist_id",in:"body",type:"integer",required:false,description:"Required for add action"},{name:"symbol",in:"body",type:"string",required:false,description:"Required for add action",example:"NVDA"},{name:"item_id",in:"body",type:"integer",required:false,description:"Required for remove action"}],
    response:`{"id":5,"watchlist_id":1,"symbol":"NVDA","notes":"","added_at":"..."}` },

  { method:"GET", path:"/api/portfolio", tag:"Portfolio", summary:"List portfolios or get with P&L",
    description:"Without id: returns portfolio list. With id: returns positions with real-time P&L, transactions, and summary.",
    params:[{name:"id",in:"query",type:"integer",required:false,description:"Portfolio ID"}],
    response:`{"portfolio":{...},"positions":[{"symbol":"AAPL","shares":10,"avg_cost":150,"currentPrice":185.4,"unrealizedPnl":354,"unrealizedPct":23.6}],"summary":{"totalValue":1854,"totalPnl":354,"totalPnlPct":23.6}}` },

  { method:"POST", path:"/api/portfolio", tag:"Portfolio", summary:"Portfolio CRUD + record trades",
    description:"Actions: create, buy, sell, delete. Buy/sell automatically updates positions with weighted avg cost.",
    params:[{name:"action",in:"body",type:"string",required:true,description:"create|buy|sell|delete"},{name:"portfolio_id",in:"body",type:"integer",required:false},{name:"symbol",in:"body",type:"string",required:false,example:"AAPL"},{name:"shares",in:"body",type:"number",required:false,example:"100"},{name:"price",in:"body",type:"number",required:false,example:"185.40"}],
    response:`{"success":true}` },

  { method:"POST", path:"/api/screener", tag:"Screener", summary:"Screen stocks by indicators",
    description:"Runs technical screening on universe of 23 default symbols. Apply filter combinations to find setups.",
    params:[{name:"filters",in:"body",type:"object",required:true,description:"Filter object",example:'{"rsiMin":0,"rsiMax":30,"macdBullish":true}'}],
    response:`{"results":[{"symbol":"NVDA","price":450.2,"rsi":28.4,"macdBullish":true,"smaCross":true,...}],"total":3}` },

  { method:"GET", path:"/api/compare", tag:"Compare", summary:"Compare multiple symbols",
    description:"Fetches data for 2-6 symbols and normalizes prices to % return from period start for comparison.",
    params:[{name:"symbols",in:"query",type:"string",required:true,description:"Comma-separated symbols",example:"AAPL,NVDA,MSFT"},{name:"period",in:"query",type:"string",required:false,example:"6mo"}],
    response:`{"symbols":["AAPL","NVDA"],"data":[{"symbol":"AAPL","normalized":[{"date":"2024-01-02","value":0},{"date":"2024-01-03","value":1.2}],...}]}` },

  { method:"GET", path:"/api/export", tag:"Export", summary:"Export OHLCV + indicators as CSV/XLSX",
    description:"Downloads full price history with all computed indicators as CSV or multi-sheet Excel file.",
    params:[{name:"symbol",in:"query",type:"string",required:true,example:"AAPL"},{name:"period",in:"query",type:"string",required:false,example:"6mo"},{name:"format",in:"query",type:"string",required:false,description:"csv|xlsx",example:"xlsx"}],
    response:`Binary file download (CSV or XLSX)` },

  { method:"GET", path:"/api/auth", tag:"Auth", summary:"Generate SIWE nonce",
    params:[{name:"action",in:"query",type:"string",required:true,description:"Must be: nonce"}],
    description:"Returns a cryptographic nonce for constructing the Sign-In with Ethereum message.",
    response:`{"nonce":"abc123xyz"}` },

  { method:"POST", path:"/api/auth", tag:"Auth", summary:"Verify wallet signature & create session",
    description:"Verifies SIWE signature. On success, sets HttpOnly session cookie. Creates user record if first login.",
    params:[{name:"address",in:"body",type:"string",required:true,description:"Wallet address (checksummed)"},{name:"message",in:"body",type:"string",required:true,description:"SIWE message string"},{name:"signature",in:"body",type:"string",required:true,description:"EIP-191 signature"}],
    response:`{"success":true,"user":{"wallet":"0x...","tier":"enterprise"}}` },

  { method:"DELETE", path:"/api/auth", tag:"Auth", summary:"Logout — clear session cookie",
    description:"Clears the session cookie. No body required.",
    params:[], response:`{"success":true}` },
];

const METHOD_COLORS: Record<string,string> = {
  GET:"bg-bull/10 text-bull border-bull/30",
  POST:"bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  DELETE:"bg-bear/10 text-bear border-bear/30",
};
const TAGS = [...new Set(ENDPOINTS.map(e => e.tag))];

export default function APIExplorer() {
  const [open, setOpen] = useState<string|null>(null);
  const [activeTag, setActiveTag] = useState<string|null>(null);
  const [tryOut, setTryOut] = useState<Record<string,string>>({});
  const [response, setResponse] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = activeTag ? ENDPOINTS.filter(e => e.tag === activeTag) : ENDPOINTS;

  const tryRequest = async (ep: Endpoint) => {
    setLoading(true); setResponse(null);
    try {
      const queryParams = ep.params?.filter(p => p.in === "query").map(p => `${p.name}=${encodeURIComponent(tryOut[p.name]||p.example||"")}`).join("&");
      const url = ep.path + (queryParams ? `?${queryParams}` : "");
      const bodyParams = ep.params?.filter(p => p.in === "body");
      const body = bodyParams?.length ? JSON.stringify(Object.fromEntries(bodyParams.map(p => [p.name, tryOut[p.name]||p.example]))) : undefined;
      const res = await fetch(url, { method: ep.method, headers: body ? {"Content-Type":"application/json"} : {}, body });
      const text = await res.text();
      try { setResponse(JSON.stringify(JSON.parse(text), null, 2)); } catch { setResponse(text.slice(0, 500)); }
    } catch(e) { setResponse(`Error: ${(e as Error).message}`); }
    setLoading(false);
  };

  return (
    <div className="prose">
      <h1>API Reference</h1>
      <p>Qwenta exposes a RESTful API. All endpoints are server-rendered via Astro SSR. Authentication endpoints set HttpOnly cookies.</p>

      {/* Tag filter */}
      <div className="flex gap-2 flex-wrap my-6 not-prose">
        <button onClick={()=>setActiveTag(null)} className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${!activeTag?"bg-cyan-500/10 text-cyan-400 border-cyan-500/30":"text-slate-500 border-void-600 hover:text-slate-300"}`}>All</button>
        {TAGS.map(t=><button key={t} onClick={()=>setActiveTag(t===activeTag?null:t)} className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${activeTag===t?"bg-cyan-500/10 text-cyan-400 border-cyan-500/30":"text-slate-500 border-void-600 hover:text-slate-300"}`}>{t}</button>)}
      </div>

      <div className="not-prose space-y-3">
        {filtered.map(ep => {
          const key = `${ep.method}${ep.path}`;
          const isOpen = open === key;
          return (
            <div key={key} className={`border rounded-xl overflow-hidden transition-all ${isOpen?"border-cyan-500/30":"border-void-600"}`}>
              <button onClick={()=>setOpen(isOpen?null:key)} className="w-full flex items-center gap-3 px-5 py-3.5 bg-void-800/50 hover:bg-void-800 transition-colors text-left">
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-mono font-semibold shrink-0 ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                <code className="text-slate-200 text-sm font-mono">{ep.path}</code>
                <span className="text-slate-500 text-sm ml-2">{ep.summary}</span>
                <span className="ml-auto text-xs px-2 py-0.5 bg-void-700 text-void-400 rounded font-mono">{ep.tag}</span>
                <span className="text-slate-600 text-xs">{isOpen?"▲":"▼"}</span>
              </button>
              {isOpen && (
                <div className="px-5 py-4 border-t border-void-700 bg-void-900/50 space-y-4">
                  <p className="text-slate-400 text-sm">{ep.description}</p>
                  {ep.params && ep.params.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono text-void-500 uppercase tracking-widest mb-3">Parameters</p>
                      <table className="w-full text-xs font-mono">
                        <thead><tr className="border-b border-void-700">{["Name","In","Type","Req","Description"].map(h=><th key={h} className="text-left px-3 py-1.5 text-[9px] text-void-500 tracking-widest">{h}</th>)}</tr></thead>
                        <tbody>
                          {ep.params.map(p=>(
                            <tr key={p.name} className="border-b border-void-800">
                              <td className="px-3 py-2 text-cyan-400 font-semibold">{p.name}</td>
                              <td className="px-3 py-2 text-slate-500">{p.in}</td>
                              <td className="px-3 py-2 text-slate-400">{p.type}</td>
                              <td className="px-3 py-2">{p.required?<span className="text-bear text-[9px]">required</span>:<span className="text-void-500 text-[9px]">optional</span>}</td>
                              <td className="px-3 py-2 text-slate-500">{p.description}{p.example&&<span className="text-void-500 ml-1">e.g. <code className="text-cyan-600">{p.example}</code></span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Try it */}
                  <div>
                    <p className="text-[10px] font-mono text-void-500 uppercase tracking-widest mb-3">Try It</p>
                    <div className="space-y-2">
                      {ep.params?.map(p=>(
                        <div key={p.name} className="flex items-center gap-3">
                          <label className="text-[10px] font-mono text-slate-500 w-28 shrink-0">{p.name}</label>
                          <input value={tryOut[p.name]||""} onChange={e=>setTryOut(o=>({...o,[p.name]:e.target.value}))}
                            placeholder={p.example||p.description}
                            className="flex-1 bg-void-800 border border-void-700 rounded px-3 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30"/>
                        </div>
                      ))}
                      <button onClick={()=>tryRequest(ep)} disabled={loading}
                        className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors">
                        {loading?"Sending...":"▶ Execute"}
                      </button>
                    </div>
                    {response && (
                      <pre className="mt-3 p-3 bg-void-900 border border-void-700 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto max-h-48">{response}</pre>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-mono text-void-500 uppercase tracking-widest mb-2">Example Response</p>
                    <pre className="p-3 bg-void-900 border border-void-700 rounded-lg text-[10px] font-mono text-slate-500 overflow-x-auto">{ep.response}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
